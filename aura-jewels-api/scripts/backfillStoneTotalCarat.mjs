/**
 * Backfill ProductStone.totalCarat.
 *
 * The importer used to store the PER-PIECE carat (the sheet's `Size` column) in
 * `totalCarat`. The row's real total is the sheet's `Wgt` column, which was
 * always stored correctly in `weight` — and which pricing already multiplies by.
 * So the repair is simply `totalCarat = weight` for every row where they differ.
 *
 * Example of the bug: a side-stone row of 16 x 0.005 ct displayed "Total Weight
 * 0.005 ct" instead of 0.080 ct.
 *
 * PRICING IS NOT AFFECTED by this script — `weight` is untouched, and nothing
 * prices off `totalCarat`. This only repairs what the storefront displays.
 *
 * Safe to re-run (idempotent).
 *
 * Usage (from api/):
 *   node scripts/backfillStoneTotalCarat.mjs --dry-run   # show the plan only
 *   node scripts/backfillStoneTotalCarat.mjs             # apply
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import ProductStone from "../models/productStone.model.js";

const DRY_RUN = process.argv.includes("--dry-run");

// No silent localhost fallback: connecting to the wrong (empty) database and
// reporting "nothing to do" is worse than failing.
const uri = process.env.MONGOOSE_URL;
if (!uri) {
    console.error("MONGOOSE_URL is not set. Run this from api/ with the same .env the API uses. Aborting.");
    process.exit(1);
}

await mongoose.connect(uri);
console.log(`Connected to database "${mongoose.connection.name}" on ${mongoose.connection.host}\n`);

const total = await ProductStone.countDocuments();

// Rows needing repair: totalCarat differs from weight (including null/missing).
// $expr with $ne compares the two fields on the same document.
const mismatchFilter = {
    $expr: {
        $ne: [
            { $ifNull: ["$totalCarat", null] },
            { $ifNull: ["$weight", null] },
        ],
    },
};

const mismatched = await ProductStone.countDocuments(mismatchFilter);

console.log(`ProductStone rows total     : ${total}`);
console.log(`Rows where totalCarat != wgt: ${mismatched}`);

if (!mismatched) {
    console.log("\nNothing to do — every row already has totalCarat === weight.");
    await mongoose.disconnect();
    process.exit(0);
}

const samples = await ProductStone.find(mismatchFilter)
    .select("itemCode type pieces weight totalCarat")
    .limit(10)
    .lean();

console.log("\nSample of affected rows (first 10):");
console.log("  itemCode           type    pieces  weight(total)  totalCarat(now)  -> becomes");
for (const s of samples) {
    console.log(
        `  ${String(s.itemCode || "-").padEnd(18)} ${String(s.type || "-").padEnd(7)} ` +
        `${String(s.pieces ?? "-").padStart(6)}  ${String(s.weight ?? "-").padStart(13)}  ` +
        `${String(s.totalCarat ?? "-").padStart(15)}  -> ${s.weight ?? 0}`
    );
}

if (DRY_RUN) {
    console.log(`\nDRY RUN — ${mismatched} row(s) would be updated. Re-run without --dry-run to apply.`);
    await mongoose.disconnect();
    process.exit(0);
}

// Aggregation-pipeline update so the value is copied field-to-field server-side.
// Mongoose 9 refuses an array update unless `updatePipeline` is set explicitly.
const res = await ProductStone.updateMany(
    mismatchFilter,
    [{ $set: { totalCarat: { $ifNull: ["$weight", 0] } } }],
    { updatePipeline: true }
);

const remaining = await ProductStone.countDocuments(mismatchFilter);

console.log(`\nMatched ${res.matchedCount}, modified ${res.modifiedCount}.`);
console.log(`Rows still mismatched after apply: ${remaining} (expected 0).`);

await mongoose.disconnect();

if (remaining !== 0) {
    console.error("\nSome rows did not update. Investigate before trusting the storefront weights.");
    process.exit(1);
}

console.log("\nDone. Storefront 'Total Weight' now reflects the full row carat.");
