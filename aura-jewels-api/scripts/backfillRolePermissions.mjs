/**
 * Seed + backfill the RBAC role permissions.
 *
 * Two situations this handles:
 *
 * 1) The `rolepermissions` collection is EMPTY. This is normal if only
 *    super_admin has ever used the panel: `role_has_permission()` short-circuits
 *    to `true` for super_admin BEFORE calling loadCache(), and loadCache() is
 *    the only thing that triggers seeding. Nothing is broken — but we seed now
 *    so the state is explicit and visible rather than waiting for the first
 *    non-super-admin request.
 *
 * 2) The collection ALREADY has documents (seeded from an older catalog).
 *    `ensure_role_permissions_seeded()` only INSERTS when a role doc is absent;
 *    it never widens an existing one. So actions added to the catalog later
 *    would stay ungranted forever. We grant each new action only to roles that
 *    already hold its sibling capability — nothing a role wasn't already
 *    trusted with, and permissions deliberately revoked are not restored.
 *
 * Safe to re-run. Never touches super_admin (it bypasses RBAC entirely).
 *
 * Usage (from api/):
 *   node scripts/backfillRolePermissions.mjs --dry-run   # show the plan only
 *   node scripts/backfillRolePermissions.mjs             # seed + apply
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import RolePermission from "../models/rolePermission.model.js";
import Action from "../constants/permissionAction.constant.js";
import { ALL_ACTIONS } from "../constants/permissionCatalog.constant.js";
import { ensure_role_permissions_seeded } from "../services/permission.services.js";
import Constant from "../constants/user.constant.js";

const DRY_RUN = process.argv.includes("--dry-run");

// newAction -> the action a role must ALREADY have to earn it.
const GRANT_IF_HAS = [
    [Action.METAL_TYPE_UPDATE_STATUS, Action.METAL_TYPE_UPDATE],
    [Action.LABOUR_CHARGE_UPDATE_STATUS, Action.LABOUR_CHARGE_UPDATE],
    [Action.STONE_GROUP_UPDATE_STATUS, Action.STONE_GROUP_UPDATE],
    // Importing stone groups is a write operation on the stone-group master.
    [Action.STONE_GROUP_IMPORT, Action.STONE_GROUP_UPDATE],
    // Adding a single stone group is a lesser write than replacing the master.
    [Action.STONE_GROUP_CREATE, Action.STONE_GROUP_UPDATE],
    // Customer groups mirror the customer capability the role already holds.
    [Action.CUSTOMER_GROUP_LIST, Action.CUSTOMER_LIST],
    [Action.CUSTOMER_GROUP_DETAIL, Action.CUSTOMER_DETAIL],
    [Action.CUSTOMER_GROUP_CREATE, Action.CUSTOMER_CREATE],
    [Action.CUSTOMER_GROUP_UPDATE, Action.CUSTOMER_UPDATE],
    [Action.CUSTOMER_GROUP_DELETE, Action.CUSTOMER_DELETE],
    // Contact-us messages are handled by whoever already handles order inquiries.
    [Action.CONTACT_INQUIRY_LIST, Action.ORDER_INQUIRY_LIST],
    [Action.CONTACT_INQUIRY_UPDATE, Action.ORDER_INQUIRY_UPDATE],
];

// The actions this fix introduced — used for the final verification report.
const NEW_ACTIONS = GRANT_IF_HAS.map(([a]) => a);

// Fail loudly rather than writing junk into the DB.
const allow = new Set(ALL_ACTIONS);
const broken = GRANT_IF_HAS.filter(([a, b]) => !a || !b || !allow.has(a));
if (broken.length) {
    console.error("Aborting — these actions are undefined or absent from the catalog:", broken);
    process.exit(1);
}

// No silent localhost fallback: connecting to the wrong (empty) database and
// reporting "nothing to do" is worse than failing.
const uri = process.env.MONGOOSE_URL;
if (!uri) {
    console.error("MONGOOSE_URL is not set. Run this from api/ with the same .env the API uses. Aborting.");
    process.exit(1);
}

await mongoose.connect(uri);
const dbName = mongoose.connection.name;
const host = mongoose.connection.host;
console.log(`Connected to database "${dbName}" on ${host}\n`);

let count = await RolePermission.countDocuments();
console.log(`rolepermissions documents found: ${count}`);

// ---- 1. Seed when empty -------------------------------------------------
if (count === 0) {
    console.log("Empty collection — seeding roles from the current catalog defaults.");
    console.log("(Expected when only super_admin has used the panel: super_admin bypasses");
    console.log(" role_has_permission() before loadCache(), so seeding never fired.)\n");
    if (DRY_RUN) {
        console.log(`DRY RUN — would seed: ${Constant.ROLES.STAFF_ROLES.join(", ")}`);
    } else {
        await ensure_role_permissions_seeded();
        count = await RolePermission.countDocuments();
        console.log(`Seeded ${count} role document(s).`);
    }
}

// ---- 2. Backfill existing docs -----------------------------------------
let changed = 0;
const roles = await RolePermission.find({}).lean();
if (roles.length) {
    console.log("\nBackfill check:");
    for (const doc of roles) {
        const have = new Set(doc.permissions || []);
        const toAdd = GRANT_IF_HAS
            .filter(([newAction, requiredAction]) => !have.has(newAction) && have.has(requiredAction))
            .map(([newAction]) => newAction);

        if (!toAdd.length) {
            console.log(`  ${doc.role}: already up to date (${have.size} actions)`);
            continue;
        }
        console.log(`  ${doc.role}: +${toAdd.length} -> ${toAdd.join(", ")}`);
        changed++;
        if (!DRY_RUN) {
            await RolePermission.updateOne({ _id: doc._id }, { $addToSet: { permissions: { $each: toAdd } } });
        }
    }
}

// ---- 3. Verify ----------------------------------------------------------
if (!DRY_RUN) {
    console.log("\nVerification — the actions this fix introduced:");
    for (const doc of await RolePermission.find({}).lean()) {
        const have = new Set(doc.permissions || []);
        const has = NEW_ACTIONS.filter((a) => have.has(a));
        console.log(`  ${doc.role.padEnd(10)} ${String(have.size).padStart(3)} actions | new: ${has.length}/${NEW_ACTIONS.length}${has.length ? ` (${has.join(", ")})` : ""}`);
    }
    console.log(`\n  super_admin  bypasses RBAC entirely (never stored).`);
}

await mongoose.disconnect();

if (DRY_RUN) {
    console.log(`\nDRY RUN — ${changed} existing role(s) would change. Re-run without --dry-run to apply.`);
} else {
    console.log(`\n✅ Done. ${changed} role(s) backfilled.`);
    console.log("The API's in-process permission cache expires within 60s, so no restart is required.");
}
