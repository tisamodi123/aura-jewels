/**
 * Migrate Label.color / Label.clarity from Parameter ObjectId refs to free text.
 *
 * The Label master used to reference the Parameter collection, so a grade could
 * only be labelled once someone had created a Parameter row for it. It now
 * stores the grade as plain text — the same way StoneGroup does — because
 * ProductStone.color / .clarity are plain strings and that is what the label is
 * keyed against.
 *
 * This rewrites each existing row's ObjectId to that Parameter's `code`
 * (falling back to `name`). Rows already holding text are left alone, so the
 * script is idempotent.
 *
 * Usage (from api/):
 *   node scripts/migrateLabelGradesToText.mjs --dry-run
 *   node scripts/migrateLabelGradesToText.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";
import Parameter from "../models/parameter.model.js";

const DRY_RUN = process.argv.includes("--dry-run");

const uri = process.env.MONGOOSE_URL;
if (!uri) {
    console.error("MONGOOSE_URL is not set. Run this from api/ with the same .env the API uses. Aborting.");
    process.exit(1);
}

await mongoose.connect(uri);
console.log(`Connected to "${mongoose.connection.name}" on ${mongoose.connection.host}`);
console.log(DRY_RUN ? "MODE: DRY RUN (no writes)\n" : "MODE: APPLY\n");

// Read through the raw collection: the Mongoose schema now declares these as
// String, so loading through the model would coerce the ObjectIds to hex text.
const raw = mongoose.connection.db.collection("labels");
const docs = await raw.find({}).toArray();
console.log(`Label rows: ${docs.length}`);

const isObjectId = (v) => v instanceof mongoose.Types.ObjectId;

const ids = new Set();
for (const d of docs) {
    if (isObjectId(d.color)) ids.add(d.color.toString());
    if (isObjectId(d.clarity)) ids.add(d.clarity.toString());
}

const params = ids.size
    ? await Parameter.find({ _id: { $in: [...ids] } }).select("_id code name").lean()
    : [];
const textById = new Map(params.map((p) => [p._id.toString(), String(p.code || p.name || "").trim().toUpperCase()]));

const ops = [];
const unresolved = [];

for (const d of docs) {
    const set = {};

    for (const field of ["color", "clarity"]) {
        const value = d[field];
        if (!isObjectId(value)) continue;                   // already text
        const text = textById.get(value.toString());
        if (!text) { unresolved.push({ _id: d._id, field, ref: value.toString() }); continue; }
        set[field] = text;
    }

    if (Object.keys(set).length) {
        ops.push({ updateOne: { filter: { _id: d._id }, update: { $set: set } } });
        console.log(`  ${d.stoneType} "${d.labelName}"  ${JSON.stringify(set)}${d.isDeleted ? "  (soft-deleted)" : ""}`);
    }
}

console.log(`\nrows already text : ${docs.length - ops.length - unresolved.length}`);
console.log(`rows to convert   : ${ops.length}`);
console.log(`unresolved refs   : ${unresolved.length}`);

if (unresolved.length) {
    console.log("\nThese point at a Parameter that no longer exists. Fix or delete them by hand:");
    for (const u of unresolved) console.log(`  label ${u._id} field ${u.field} -> ${u.ref}`);
}

if (DRY_RUN) {
    console.log(`\nDRY RUN — ${ops.length} row(s) would change. Re-run without --dry-run to apply.`);
    await mongoose.disconnect();
    process.exit(0);
}

if (ops.length) {
    const res = await raw.bulkWrite(ops, { ordered: false });
    console.log(`\nModified ${res.modifiedCount} of ${ops.length} row(s).`);
} else {
    console.log("\nNothing to write.");
}

const after = await raw.find({}).toArray();
const stillRefs = after.filter((d) => isObjectId(d.color) || isObjectId(d.clarity)).length;
console.log(`Rows still holding an ObjectId: ${stillRefs} (expected ${unresolved.length ? "the unresolved ones" : "0"}).`);

await mongoose.disconnect();
