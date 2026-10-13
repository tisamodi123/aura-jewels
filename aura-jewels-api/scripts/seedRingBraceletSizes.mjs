/**
 * Re-seed size masters for RINGS, BRACELETS & BANGLES and NECKLACE (Indian standards).
 *
 * Why this exists: the 30 existing ring sizes were bound to a category id that
 * was deleted in a re-seed, so they attached to zero products and ring-size
 * pricing never engaged. This script rebinds sizes to the LIVE parent
 * categories, seeds the Indian masters (from web/data reference), enables
 * `hasSize` on those categories, and clears the orphaned rows.
 *
 * Idempotent: re-running produces the same end state (it removes the target +
 * orphaned sizes first, then inserts fresh).
 *
 * Usage (from api/):
 *   node scripts/seedRingBraceletSizes.mjs --dry   # preview, no writes
 *   node scripts/seedRingBraceletSizes.mjs         # apply
 *
 * Values are manufacturing estimates (see the reference doc); tune per product
 * family later in the admin panel — nothing here is hard-coded downstream.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DRY = process.argv.includes("--dry");
const uri = process.env.MONGOOSE_URL || "mongodb://localhost:27017/aurajewels-local";

// --- Indian Ring Size Master (inside diameter mm + weight multiplier) --------
// Default = Indian size 18 (most common ladies), multiplier 1.00.
const RING_SIZES = [
    { name: "6", mm: 14.6, mul: 0.88 }, { name: "7", mm: 14.9, mul: 0.89 },
    { name: "8", mm: 15.2, mul: 0.90 }, { name: "9", mm: 15.5, mul: 0.91 },
    { name: "10", mm: 15.8, mul: 0.92 }, { name: "11", mm: 16.1, mul: 0.93 },
    { name: "12", mm: 16.4, mul: 0.94 }, { name: "13", mm: 16.7, mul: 0.95 },
    { name: "14", mm: 17.0, mul: 0.96 }, { name: "15", mm: 17.3, mul: 0.97 },
    { name: "16", mm: 17.6, mul: 0.98 }, { name: "17", mm: 17.9, mul: 0.99 },
    { name: "18", mm: 18.2, mul: 1.00, isDefault: true },
    { name: "19", mm: 18.5, mul: 1.02 }, { name: "20", mm: 18.8, mul: 1.04 },
    { name: "21", mm: 19.1, mul: 1.06 }, { name: "22", mm: 19.4, mul: 1.08 },
    { name: "23", mm: 19.7, mul: 1.10 }, { name: "24", mm: 20.0, mul: 1.12 },
    { name: "25", mm: 20.3, mul: 1.14 }, { name: "26", mm: 20.6, mul: 1.16 },
    { name: "27", mm: 20.9, mul: 1.18 }, { name: "28", mm: 21.2, mul: 1.20 },
    { name: "29", mm: 21.5, mul: 1.22 }, { name: "30", mm: 21.8, mul: 1.24 },
];

// --- Indian Bracelet Sizes (inches / cm + weight multiplier) -----------------
// Default = L / 7 inch (default ladies), multiplier 1.00.
const BRACELET_SIZES = [
    { name: "XS", code: "XS", inch: 5.5, cm: 14.0, mul: 0.86 },
    { name: "S", code: "S", inch: 6.0, cm: 15.2, mul: 0.91 },
    { name: "M", code: "M", inch: 6.5, cm: 16.5, mul: 0.96 },
    { name: "L", code: "L", inch: 7.0, cm: 17.8, mul: 1.00, isDefault: true },
    { name: "XL", code: "XL", inch: 7.5, cm: 19.0, mul: 1.06 },
    { name: "XXL", code: "XXL", inch: 8.0, cm: 20.3, mul: 1.12 },
    { name: "XXXL", code: "XXXL", inch: 8.5, cm: 21.6, mul: 1.18 },
    { name: "Men's Standard", code: "MEN", inch: 9.0, cm: 22.9, mul: 1.24 },
];

// --- Necklace Lengths (India) — sized by length, not fit ---------------------
// Default = 18 in (Princess), multiplier 1.00. Multiplier ≈ length / 18.
const NECKLACE_SIZES = [
    { style: "Choker", inch: 14, cm: 35.5, mul: 0.78 },
    { style: "Princess", inch: 16, cm: 40.6, mul: 0.90 },
    { style: "Princess+", inch: 18, cm: 45.7, mul: 1.00, isDefault: true },
    { style: "Matinee", inch: 20, cm: 50.8, mul: 1.10 },
    { style: "Opera", inch: 24, cm: 61.0, mul: 1.32 },
    { style: "Long", inch: 28, cm: 71.0, mul: 1.55 },
    { style: "Long Temple", inch: 30, cm: 76.0, mul: 1.66 },
    { style: "Long Temple", inch: 32, cm: 81.0, mul: 1.78 },
    { style: "Long Temple", inch: 36, cm: 91.0, mul: 2.00 },
];

const buildRingDocs = (categoryId, now) =>
    RING_SIZES.map((s, i) => ({
        name: s.name,
        code: s.name,
        category: categoryId,
        isDefault: !!s.isDefault,
        weight_multipler: s.mul,
        description: `Inside Ø ${s.mm} mm`,
        sort: i,
        status: "ACTIVE",
        isDeleted: 0,
        createdAt: now,
        updatedAt: now,
    }));

const buildBraceletDocs = (categoryId, now) =>
    BRACELET_SIZES.map((s, i) => ({
        name: s.name,
        code: s.code,
        category: categoryId,
        isDefault: !!s.isDefault,
        weight_multipler: s.mul,
        description: `${s.inch} in / ${s.cm} cm`,
        sort: i,
        status: "ACTIVE",
        isDeleted: 0,
        createdAt: now,
        updatedAt: now,
    }));

const buildNecklaceDocs = (categoryId, now) =>
    NECKLACE_SIZES.map((s, i) => ({
        name: `${s.inch}"`,
        code: String(s.inch),
        category: categoryId,
        isDefault: !!s.isDefault,
        weight_multipler: s.mul,
        description: `${s.style} · ${s.inch} in / ${s.cm} cm`,
        sort: i,
        status: "ACTIVE",
        isDeleted: 0,
        createdAt: now,
        updatedAt: now,
    }));

const findParent = async (categories, name) =>
    categories.findOne({
        categoryName: { $regex: `^${name}$`, $options: "i" },
        parentCategoryId: null,
        isDeleted: { $ne: 1 },
    });

async function run() {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const categories = db.collection("categories");
    const sizes = db.collection("sizes");
    const now = new Date();

    console.log(`\n${DRY ? "[DRY RUN — no writes]" : "[APPLYING]"}  DB: ${uri.replace(/\/\/[^@]*@/, "//***@")}\n`);

    const ring = await findParent(categories, "RINGS");
    const bracelet = await findParent(categories, "BRACELETS & BANGLES");
    const necklace = await findParent(categories, "NECKLACE");
    if (!ring || !bracelet || !necklace) {
        throw new Error(`Missing parent category — RINGS:${!!ring} BRACELETS & BANGLES:${!!bracelet} NECKLACE:${!!necklace}`);
    }
    console.log(`RINGS               _id=${ring._id}`);
    console.log(`BRACELETS & BANGLES _id=${bracelet._id}`);
    console.log(`NECKLACE            _id=${necklace._id}`);

    // 1) Enable sizing on the target categories.
    if (!DRY) {
        await categories.updateOne({ _id: ring._id }, { $set: { hasSize: true, updatedAt: now } });
        await categories.updateOne({ _id: bracelet._id }, { $set: { hasSize: true, updatedAt: now } });
        await categories.updateOne({ _id: necklace._id }, { $set: { hasSize: true, updatedAt: now } });
    }
    console.log(`\n[hasSize=true] ${DRY ? "would be set" : "set"} on RINGS, BRACELETS & BANGLES and NECKLACE`);

    // 2) Identify orphaned sizes (category doc no longer exists) so we clean the
    //    30 mis-bound ring sizes as well as any target-category rows.
    const distinctCatIds = (await sizes.distinct("category")).filter(Boolean);
    const orphanIds = [];
    for (const cid of distinctCatIds) {
        const exists = await categories.findOne({ _id: cid }, { projection: { _id: 1 } });
        if (!exists) orphanIds.push(cid);
    }
    const removeFilter = { category: { $in: [ring._id, bracelet._id, necklace._id, ...orphanIds] } };
    const toRemove = await sizes.countDocuments(removeFilter);
    console.log(`\nOrphaned category ids (sizes pointing at deleted categories): ${orphanIds.length}`);
    console.log(`Existing size rows to remove (target + orphaned): ${toRemove}`);

    // 3) Build fresh docs.
    const ringDocs = buildRingDocs(ring._id, now);
    const braceletDocs = buildBraceletDocs(bracelet._id, now);
    const necklaceDocs = buildNecklaceDocs(necklace._id, now);
    console.log(`\nSeeding ${ringDocs.length} ring sizes (6–30, default 18) + ${braceletDocs.length} bracelet sizes (XS–Men's, default L) + ${necklaceDocs.length} necklace lengths (14–36", default 18")`);

    if (DRY) {
        console.log("\n[DRY RUN] No changes written. Re-run without --dry to apply.");
        await mongoose.disconnect();
        return;
    }

    // 4) Hard-remove old/orphaned rows, then insert fresh (idempotent).
    const del = await sizes.deleteMany(removeFilter);
    const ins = await sizes.insertMany([...ringDocs, ...braceletDocs, ...necklaceDocs]);
    console.log(`\nRemoved: ${del.deletedCount}   Inserted: ${ins.insertedCount}`);

    // 5) Verify attachment via the exact runtime lookup (category==parentId, ACTIVE, isDeleted:0).
    const ringAttached = await sizes.countDocuments({ category: ring._id, status: "ACTIVE", isDeleted: 0 });
    const braceletAttached = await sizes.countDocuments({ category: bracelet._id, status: "ACTIVE", isDeleted: 0 });
    const necklaceAttached = await sizes.countDocuments({ category: necklace._id, status: "ACTIVE", isDeleted: 0 });
    console.log(`\nVerify — sizes that attach to a RING product:     ${ringAttached}`);
    console.log(`Verify — sizes that attach to a BRACELET product: ${braceletAttached}`);
    console.log(`Verify — sizes that attach to a NECKLACE product: ${necklaceAttached}`);
    console.log(ringAttached > 0 && braceletAttached > 0 && necklaceAttached > 0
        ? "\n✅ Done. Ring, bracelet & necklace size pickers + size-based pricing will now engage."
        : "\n⚠️  An attachment count is 0 — investigate before relying on this.");

    await mongoose.disconnect();
}

run().catch((e) => {
    console.error("\nSeed failed:", e?.message || e);
    process.exit(1);
});
