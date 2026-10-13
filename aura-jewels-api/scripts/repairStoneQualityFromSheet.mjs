/**
 * Repair ProductStone.color / ProductStone.clarity from the product sheet.
 *
 * WHY THIS EXISTS
 * ---------------
 * The product importer's diamond branch ignored the sheet's GemColor/GemClarity
 * columns and stamped every diamond with the Diamond Quality Master default
 * (D / IF). Rates are only published for D/IF from 1.00 ct upwards, so ordinary
 * EF/VVS stones matched no stone group, were priced at 0, and dragged the whole
 * product's diamond value to zero. It also made the cart drop lines with
 * STONE_VARIANT_UNAVAILABLE.
 *
 * The importer is fixed (importProduct.controller.js, diamond branch). This
 * repairs the rows already in the database, using the sheet as the source of
 * truth — no value is invented.
 *
 * MATCHING
 * --------
 * Sheet rows are keyed by  itemCode | TYPE | SHAPE | size.
 * ItemCode is blank on continuation rows, so it is carried forward.
 * A stone is only updated when exactly one sheet row matches its key.
 * Anything ambiguous or unmatched is reported and left alone.
 *
 * AFTER RUNNING
 * -------------
 * Re-run the price sync. It resolves stone groups by natural key
 * (shape + colour + clarity + carat bucket), so corrected colours immediately
 * find their rates, and the stale stoneGroup references heal themselves.
 *
 * SAFETY: a correction is only written when the corrected grade can actually be
 * priced — i.e. a current StoneGroup exists for
 * shape + newColour + newClarity + this stone's carat bucket.
 *
 * This matters. The master grades stones in BANDS below 1.00 ct (EF/VVS, GH/VS)
 * and in SINGLE grades at 1.00 ct and above (E/VVS1, F/VVS2, D/IF...). The sheet
 * says "EF/VVS" for every stone, so a 1.5 ct stone has no EF/VVS row. Rewriting
 * it would take a product that currently prices (off its stored D/IF group) and
 * make it unpriceable. Those stones are reported and left alone until the
 * business decides how a band maps to a single grade at that size.
 * Pass --force-all to write them anyway.
 *
 * Usage (from api/):
 *   node scripts/repairStoneQualityFromSheet.mjs "<path to sheet.xlsx>"
 *   node scripts/repairStoneQualityFromSheet.mjs "<path>" --apply
 *   node scripts/repairStoneQualityFromSheet.mjs "<path>" --apply --force-all
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import ExcelJS from "exceljs";
import ProductStone from "../models/productStone.model.js";
import StoneGroup from "../models/stoneGroup.model.js";
import Parameter from "../models/parameter.model.js";
import {
    safeString, normalizeColor, normalizeClarity,
    buildStoneGroupIndex, resolveStoneGroup,
} from "../utils/stoneMatch.js";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const FORCE_ALL = args.includes("--force-all");
const sheetPath = args.find((a) => !a.startsWith("--"));

if (!sheetPath) {
    console.error('Usage: node scripts/repairStoneQualityFromSheet.mjs "<path to product sheet.xlsx>" [--apply]');
    process.exit(1);
}

// Sizes come off the sheet as floats (0.005999999999999999). Key on a fixed
// precision so "0.006" and 0.005999999999999999 land in the same bucket.
const sizeKey = (v) => {
    const s = safeString(v);
    if (!s) return "";
    const n = Number(s);
    return Number.isFinite(n) ? n.toFixed(4) : s.toUpperCase();
};

const stoneKey = (itemCode, type, shape, size) =>
    [safeString(itemCode).toUpperCase(), safeString(type).toUpperCase(), safeString(shape).toUpperCase(), sizeKey(size)].join("|");

// ---------------------------------------------------------------------------
// 1. Read the sheet
// ---------------------------------------------------------------------------
console.log(`Reading ${sheetPath} ...`);
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(sheetPath);
const ws = wb.worksheets[0];

const header = ws.getRow(1).values.map((h) => safeString(h));
const col = (name) => {
    const i = header.indexOf(name);
    if (i === -1) {
        console.error(`Sheet is missing the "${name}" column. Aborting rather than guessing.`);
        process.exit(1);
    }
    return i;
};
const C = {
    itemCode: col("ItemCode"), type: col("Type"), shape: col("Shape"),
    gemColor: col("GemColor"), gemClarity: col("GemClarity"), size: col("Size"),
};

const sheetMap = new Map();   // key -> { color, clarity } | "AMBIGUOUS"
let currentItem = "";
let stoneRows = 0;

ws.eachRow((row, n) => {
    if (n === 1) return;
    const v = row.values;
    const ic = safeString(v[C.itemCode]);
    if (ic) currentItem = ic;
    if (!currentItem) return;

    const type = safeString(v[C.type]);
    const shape = safeString(v[C.shape]);
    const size = v[C.size];
    const color = safeString(v[C.gemColor]);
    const clarity = safeString(v[C.gemClarity]);

    if (!type || !shape || !color) return;   // not a stone row
    stoneRows += 1;

    const key = stoneKey(currentItem, type, shape, size);
    const existing = sheetMap.get(key);
    if (existing === undefined) {
        sheetMap.set(key, { color, clarity });
    } else if (existing !== "AMBIGUOUS") {
        // Same key twice with different grades -> we cannot choose. Same grade is fine.
        if (existing.color !== color || existing.clarity !== clarity) sheetMap.set(key, "AMBIGUOUS");
    }
});

console.log(`  stone rows read : ${stoneRows}`);
console.log(`  distinct keys   : ${sheetMap.size}`);
const ambiguousKeys = [...sheetMap.values()].filter((x) => x === "AMBIGUOUS").length;
if (ambiguousKeys) console.log(`  ambiguous keys  : ${ambiguousKeys} (same item/type/shape/size, different grade — skipped)`);

// ---------------------------------------------------------------------------
// 2. Connect + load stones
// ---------------------------------------------------------------------------
const uri = process.env.MONGOOSE_URL;
if (!uri) {
    console.error("MONGOOSE_URL is not set. Run this from api/ with the same .env the API uses. Aborting.");
    process.exit(1);
}
await mongoose.connect(uri);
console.log(`\nConnected to "${mongoose.connection.name}" on ${mongoose.connection.host}`);
console.log(APPLY ? "MODE: APPLY (will write)\n" : "MODE: DRY RUN (no writes)\n");

const shapeDocs = await Parameter.find({ type: "shape" }).select("_id name code").lean();
const shapeById = new Map(shapeDocs.map((s) => [s._id.toString(), safeString(s.code || s.name).toUpperCase()]));

const groups = await StoneGroup.find({})
    .select("_id stoneType type shape color clarity carat lgd_price natural_price").lean();
const groupIndex = buildStoneGroupIndex(groups);
const groupById = new Map(groups.map((g) => [g._id.toString(), g]));
console.log(`StoneGroup rows : ${groups.length}`);

const stones = await ProductStone.find({}).select("_id itemCode type shape stoneGroup color clarity size").lean();
console.log(`ProductStone rows: ${stones.length}`);

// ---------------------------------------------------------------------------
// 3. Plan
// ---------------------------------------------------------------------------
const ops = [];
const unmatched = [];
const ambiguous = [];
const unpriceable = [];
let alreadyCorrect = 0;
const changeCounts = new Map();   // "D/IF -> EF/VVS" -> n

for (const s of stones) {
    const shapeName = shapeById.get(s.shape?.toString());
    if (!shapeName) {
        unmatched.push({ stone: s, reason: "shape does not resolve to a Parameter" });
        continue;
    }

    const key = stoneKey(s.itemCode, s.type, shapeName, s.size);
    const target = sheetMap.get(key);

    if (target === undefined) {
        unmatched.push({ stone: s, reason: `no sheet row for ${key}` });
        continue;
    }
    if (target === "AMBIGUOUS") {
        ambiguous.push({ stone: s, key });
        continue;
    }

    const sameColor = normalizeColor(s.color) === normalizeColor(target.color);
    const sameClarity = normalizeClarity(s.clarity) === normalizeClarity(target.clarity);
    if (sameColor && sameClarity) {
        alreadyCorrect += 1;
        continue;
    }

    // Refuse to write a grade the master cannot price at this stone's size.
    const corrected = { ...s, color: target.color, clarity: target.clarity };
    const resolved = resolveStoneGroup(corrected, groupIndex, groupById);
    if (!resolved.group && !FORCE_ALL) {
        unpriceable.push({ stone: s, target });
        continue;
    }

    const label = `${s.color}/${s.clarity} -> ${target.color}/${target.clarity}`;
    changeCounts.set(label, (changeCounts.get(label) || 0) + 1);

    ops.push({
        updateOne: {
            filter: { _id: s._id },
            update: { $set: { color: target.color, clarity: target.clarity } },
        },
    });
}

console.log("\n" + "─".repeat(72));
console.log(`Already correct           : ${alreadyCorrect}`);
console.log(`To be corrected           : ${ops.length}`);
console.log(`Held back (no rate)       : ${unpriceable.length}${FORCE_ALL ? " (--force-all: written anyway)" : ""}`);
console.log(`Ambiguous (skipped)       : ${ambiguous.length}`);
console.log(`No sheet row (skipped)    : ${unmatched.length}`);
console.log("─".repeat(72));

if (unpriceable.length) {
    const sizes = unpriceable.map((u) => Number(u.stone.size)).filter(Number.isFinite);
    const minSize = Math.min(...sizes), maxSize = Math.max(...sizes);
    console.log(`\nHELD BACK — the sheet's grade has no rate at these sizes (${minSize} .. ${maxSize} ct).`);
    console.log("These stones still price off their current grade; rewriting them would");
    console.log("make their products unpriceable. Decide the band -> single-grade mapping,");
    console.log("or add the missing rows to the rate sheet, then re-run.");
    for (const u of unpriceable.slice(0, 6)) {
        console.log(`   ${u.stone.itemCode} [${u.stone.type}] ${u.stone.size} ct : ${u.stone.color}/${u.stone.clarity} -> ${u.target.color}/${u.target.clarity} (no such bucket)`);
    }
    if (unpriceable.length > 6) console.log(`   ... and ${unpriceable.length - 6} more`);
}

if (changeCounts.size) {
    console.log("\nChanges by grade:");
    for (const [label, n] of [...changeCounts.entries()].sort((a, b) => b[1] - a[1])) {
        console.log(`  ${String(n).padStart(7)}  ${label}`);
    }
}

if (unmatched.length) {
    console.log("\nNo sheet row (first 10) — left untouched:");
    for (const u of unmatched.slice(0, 10)) {
        console.log(`  ${u.stone.itemCode} [${u.stone.type}] size=${u.stone.size}: ${u.reason}`);
    }
    if (unmatched.length > 10) console.log(`  ... and ${unmatched.length - 10} more`);
}

if (!APPLY) {
    console.log(`\nDRY RUN — ${ops.length} stone(s) would be corrected. Re-run with --apply to write.`);
    await mongoose.disconnect();
    process.exit(0);
}

if (!ops.length) {
    console.log("\nNothing to write.");
    await mongoose.disconnect();
    process.exit(0);
}

const res = await ProductStone.bulkWrite(ops, { ordered: false });
console.log(`\nModified ${res.modifiedCount} of ${ops.length} stone(s).`);

console.log("\nVerification — distinct grades now stored on ProductStone:");
console.log("  colors   :", (await ProductStone.distinct("color")).join(", "));
console.log("  clarities:", (await ProductStone.distinct("clarity")).join(", "));

await mongoose.disconnect();
console.log("\nNext: re-run the price sync. It resolves stone groups by natural key,");
console.log("so the corrected grades will pick up their rates and repair the stale references.");
