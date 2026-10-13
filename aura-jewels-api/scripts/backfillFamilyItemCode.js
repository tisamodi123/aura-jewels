// One-time backfill of the denormalised `familyItemCode` on every product
// (= parentItemCode when set, else itemCode). Safe to re-run; it just recomputes
// the same value. Run once per environment after deploying the model change.
//
//   node scripts/backfillFamilyItemCode.js
//
// New/edited/imported products keep it in sync automatically (schema hooks +
// cleanProductForDb), so this only needs running once for existing data.

import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductMaster from "../models/product.model.js";

dotenv.config({ path: "./.env" });

(async () => {
    const uri = process.env.MONGOOSE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/aura_jewels_db";
    console.log(`[backfillFamilyItemCode] Connecting: ${uri}`);
    await mongoose.connect(uri);

    // Pipeline update: computes per-doc in a single command (MongoDB 4.2+).
    const res = await mongoose.connection.db.collection("productmasters").updateMany({}, [
        {
            $set: {
                familyItemCode: {
                    $let: {
                        vars: {
                            p: { $ifNull: ["$parentItemCode", ""] },
                        },
                        in: {
                            $cond: [
                                { $ne: [{ $trim: { input: "$$p" } }, ""] },
                                "$parentItemCode",
                                { $ifNull: ["$itemCode", ""] },
                            ],
                        },
                    },
                },
            },
        },
    ]);

    console.log(`[backfillFamilyItemCode] matched ${res.matchedCount}, modified ${res.modifiedCount}`);
    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error("[backfillFamilyItemCode] failed:", err);
    process.exit(1);
});
