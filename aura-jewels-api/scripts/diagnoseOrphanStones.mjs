/**
 * READ-ONLY diagnostic for ProductStone rows whose `stoneGroup` no longer
 * resolves to a StoneGroup document (i.e. the stone group was deleted).
 *
 * Why this matters: calcProductPrice.services.js prices a stone at 0 when its
 * stone group can't be resolved:
 *
 *     const matchedAmount = sg ? getStonePrice(sg) : 0;
 *
 * So every dangling stone silently becomes free on the NEXT price sync. Both
 * `/products/syncPrice` and the product import trigger that sync — do not run
 * either until this reports 0 dangling stones.
 *
 * This script writes NOTHING. It also reports how many dangling stones could be
 * automatically relinked by matching (shape, color, clarity, size->carat)
 * against the stone groups that exist now.
 *
 * Usage (from api/):
 *   node scripts/diagnoseOrphanStones.mjs
 *   node scripts/diagnoseOrphanStones.mjs --csv orphans.csv   # dump affected item codes
 */
import mongoose from "mongoose";
import fsp from "fs/promises";
import dotenv from "dotenv";
dotenv.config();
import ProductStone from "../models/productStone.model.js";
import StoneGroup from "../models/stoneGroup.model.js";

const csvIdx = process.argv.indexOf("--csv");
const csvPath = csvIdx > -1 ? process.argv[csvIdx + 1] : null;

const uri = process.env.MONGOOSE_URL;
if (!uri) {
    console.error("MONGOOSE_URL is not set. Run from api/ with the API's .env. Aborting.");
    process.exit(1);
}

await mongoose.connect(uri);
console.log(`Connected to "${mongoose.connection.name}" on ${mongoose.connection.host}\n`);

const totalStones = await ProductStone.countDocuments({});
const withGroup = await ProductStone.countDocuments({ stoneGroup: { $ne: null } });

// Distinct stoneGroup ids referenced by product stones.
const referenced = await ProductStone.distinct("stoneGroup", { stoneGroup: { $ne: null } });
const refIds = referenced.filter(Boolean).map(String);

// Which of those still exist?
const existing = await StoneGroup.find(
    { _id: { $in: referenced.filter(Boolean) } },
    { _id: 1 }
).lean();
const existingSet = new Set(existing.map((d) => String(d._id)));

const missingIds = refIds.filter((id) => !existingSet.has(id));

console.log("ProductStone rows total:            ", totalStones);
console.log("  ...with a stoneGroup reference:   ", withGroup);
console.log("distinct stoneGroups referenced:    ", refIds.length);
console.log("  ...still existing:                ", existingSet.size);
console.log("  ...MISSING (deleted):             ", missingIds.length);

if (!missingIds.length) {
    console.log("\n✅ No dangling stone groups. Price sync is safe to run.");
    await mongoose.disconnect();
    process.exit(0);
}

const missingObjIds = missingIds.map((id) => new mongoose.Types.ObjectId(id));

const danglingStones = await ProductStone.countDocuments({ stoneGroup: { $in: missingObjIds } });
const affectedProducts = (await ProductStone.distinct("productId", { stoneGroup: { $in: missingObjIds } })).length;

console.log("\n--- IMPACT ---");
console.log("dangling ProductStone rows:         ", danglingStones);
console.log("distinct products affected:         ", affectedProducts);
console.log("=> these stones will price at 0 on the next price sync.");

// ---- Can we relink automatically? -------------------------------------
// ProductStone keeps shape/color/clarity/size, so we can look for the stone
// group that now describes the same combination. It does NOT store stoneType,
// so a combination matching both a diamond and a colour-stone group is
// ambiguous and must not be guessed.
const dangling = await ProductStone.find(
    { stoneGroup: { $in: missingObjIds } },
    { itemCode: 1, shape: 1, color: 1, clarity: 1, size: 1 }
).lean();

const groups = await StoneGroup.find(
    {},
    { stoneType: 1, shape: 1, color: 1, clarity: 1, carat: 1 }
).lean();

const part = (v) => (v === null || v === undefined ? "" : String(v));
const attrKey = (shape, color, clarity, carat) =>
    JSON.stringify([shape ? String(shape) : "", part(color), part(clarity), part(carat)]);

const byAttr = new Map();
for (const g of groups) {
    const k = attrKey(g.shape, g.color, g.clarity, g.carat);
    if (!byAttr.has(k)) byAttr.set(k, []);
    byAttr.get(k).push(g);
}

let unique = 0, ambiguous = 0, unmatched = 0;
const itemCodes = new Set();
const rows = [];

for (const s of dangling) {
    if (s.itemCode) itemCodes.add(s.itemCode);
    const hits = byAttr.get(attrKey(s.shape, s.color, s.clarity, s.size)) || [];
    const verdict = hits.length === 1 ? "UNIQUE" : hits.length > 1 ? "AMBIGUOUS" : "NO_MATCH";
    if (verdict === "UNIQUE") unique++;
    else if (verdict === "AMBIGUOUS") ambiguous++;
    else unmatched++;
    if (csvPath) {
        rows.push([s.itemCode || "", part(s.color), part(s.clarity), part(s.size), verdict].join(","));
    }
}

console.log("\n--- RELINK FEASIBILITY (match on shape+color+clarity+size) ---");
console.log("uniquely relinkable:                ", unique);
console.log("ambiguous (>1 candidate group):     ", ambiguous);
console.log("no matching stone group at all:     ", unmatched);
console.log("distinct affected itemCodes:        ", itemCodes.size);
console.log("\nsample itemCodes:", [...itemCodes].slice(0, 15).join(", ") || "(none)");

if (csvPath) {
    await fsp.writeFile(csvPath, "itemCode,color,clarity,size,verdict\n" + rows.join("\n"), "utf8");
    console.log(`\nWrote ${rows.length} rows to ${csvPath}`);
}

console.log("\nOptions:");
console.log("  1. Restore the `stonegroups` collection from a backup (preserves _ids -> instant fix).");
console.log("  2. Re-import the product sheet: the importer re-resolves stoneGroup by attributes and rewrites ProductStone.");
console.log("  3. Ask for scripts/relinkOrphanStones.mjs to relink the uniquely-matchable ones.");
console.log("\nUntil then, do NOT run /products/syncPrice or a product import — both trigger a price sync.");

await mongoose.disconnect();
