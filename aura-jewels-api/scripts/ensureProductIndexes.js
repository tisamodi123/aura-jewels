// Builds the compound indexes declared on the Product schema that are MISSING
// on the collection — one at a time, skipping any that already exist or that
// conflict with a differently-configured existing index (e.g. a unique
// itemCode). Non-destructive: never drops anything.
//
//   node scripts/ensureProductIndexes.js
//
// Run per environment (set MONGOOSE_URL). Prefer a low-traffic window on large
// prod collections; MongoDB 4.2+ builds indexes with minimal locking.
//
// Why: the schema declares compound indexes (isDeleted+status+finalPrice, …)
// but they were found MISSING on the collection, so listing/sort queries fall
// back to weaker single-field indexes.

import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductMaster from "../models/product.model.js";

dotenv.config({ path: "./.env" });

const keyStr = (k) => JSON.stringify(k);

(async () => {
    const uri = process.env.MONGOOSE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/aura_jewels_db";
    console.log(`[ensureProductIndexes] Connecting: ${uri}`);
    await mongoose.connect(uri);

    const coll = mongoose.connection.db.collection("productmasters");
    const existing = await coll.indexes();
    const existingKeys = new Set(existing.map((i) => keyStr(i.key)));
    console.log(`[ensureProductIndexes] existing (${existing.length}):`, [...existingKeys].join("  "));

    // Declared indexes from the schema: [ [keyObj, options], ... ]
    const declared = ProductMaster.schema.indexes();
    let created = 0, skipped = 0;

    for (const [key, opts = {}] of declared) {
        if (existingKeys.has(keyStr(key))) { skipped++; continue; }
        // Deterministic name so re-runs don't auto-generate conflicting names.
        const name = Object.entries(key).map(([f, d]) => `${f}_${d}`).join("__");
        try {
            await coll.createIndex(key, { ...opts, name });
            console.log(`  + created ${keyStr(key)}  (${name})`);
            created++;
        } catch (err) {
            console.warn(`  ! skipped ${keyStr(key)} — ${err.codeName || err.message}`);
            skipped++;
        }
    }

    const after = await coll.indexes();
    console.log(`[ensureProductIndexes] done. created ${created}, skipped ${skipped}. total now ${after.length}.`);
    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error("[ensureProductIndexes] failed:", err);
    process.exit(1);
});
