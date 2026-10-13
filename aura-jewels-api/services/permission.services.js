import RolePermission from "../models/rolePermission.model.js";
import Constant from "../constants/user.constant.js";
import { DEFAULT_ROLE_PERMISSIONS, ALL_ACTIONS, PERMISSION_MODULES } from "../constants/permissionCatalog.constant.js";

const SUPER = Constant.ROLES.SUPER_ADMIN;
// Roles that are managed through the RBAC UI (super_admin is implicit/bypass).
const MANAGED_ROLES = Constant.ROLES.STAFF_ROLES; // [admin, sales, inventory]

// Small in-process cache so authorize() doesn't hit Mongo on every request.
const CACHE_TTL = 60 * 1000;
let _cache = null; // { role -> Set(actions) }
let _cacheAt = 0;

let _seeded = false;
export const ensure_role_permissions_seeded = async () => {
    if (_seeded) return;
    for (const role of MANAGED_ROLES) {
        const exists = await RolePermission.findOne({ role });
        if (!exists) {
            await RolePermission.create({
                role,
                label: role.charAt(0).toUpperCase() + role.slice(1),
                permissions: DEFAULT_ROLE_PERMISSIONS[role] || [],
            });
            // } else {
            //     // Update existing roles with any newly added default permissions
            //     const defaultPerms = DEFAULT_ROLE_PERMISSIONS[role] || [];
            //     const missingPerms = defaultPerms.filter(p => !exists.permissions.includes(p));
            //     if (missingPerms.length > 0) {
            //         exists.permissions = [...exists.permissions, ...missingPerms];
            //         await exists.save();
            //     }
        }
    }
    _seeded = true;
};

const loadCache = async () => {
    if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
    await ensure_role_permissions_seeded();
    const rows = await RolePermission.find({}).lean();
    const map = {};
    for (const r of rows) map[r.role] = new Set(r.permissions || []);
    _cache = map;
    _cacheAt = Date.now();
    return map;
};

export const invalidate_permission_cache = () => { _cache = null; _cacheAt = 0; };

// True if the given role (string) is allowed the action. Super Admin always.
export const role_has_permission = async (role, action) => {
    const r = String(role || "").toLowerCase();
    if (r === SUPER) return true;
    const map = await loadCache();
    return !!map[r]?.has(action);
};

// Resolve the full action list for a role (for /staff/me → frontend gating).
export const get_permissions_for_role = async (role) => {
    const r = String(role || "").toLowerCase();
    if (r === SUPER) return ALL_ACTIONS;
    const map = await loadCache();
    return Array.from(map[r] || []);
};

// Admin UI: the catalog + each managed role's current grants.
export const get_permission_config = async () => {
    await ensure_role_permissions_seeded();
    const rows = await RolePermission.find({}).lean();
    const byRole = new Map(rows.map((r) => [r.role, r]));
    return {
        modules: PERMISSION_MODULES,
        roles: MANAGED_ROLES.map((role) => ({
            role,
            label: byRole.get(role)?.label || role,
            permissions: byRole.get(role)?.permissions || [],
        })),
        superAdmin: { role: SUPER, note: "Super Admin has full access and cannot be edited." },
    };
};

// Admin UI: save a role's grants. Cannot edit super_admin. Only known actions.
export const save_role_permissions = async (role, permissions, userId) => {
    const r = String(role || "").toLowerCase();
    if (r === SUPER) throw new Error("Super Admin permissions cannot be edited.");
    if (!MANAGED_ROLES.includes(r)) throw new Error("Unknown role.");
    const allow = new Set(ALL_ACTIONS);
    const clean = [...new Set((permissions || []).map((p) => String(p)).filter((p) => allow.has(p)))];
    const saved = await RolePermission.findOneAndUpdate(
        { role: r },
        { $set: { permissions: clean, updatedBy: userId || null } },
        { new: true, upsert: true }
    );
    invalidate_permission_cache();
    return { role: saved.role, permissions: saved.permissions };
};
