/**
 * Re-link orphaned ProductStone.stoneGroup foreign keys.
 *
 * WHY THIS EXISTS
 * ---------------
 * The stone-group import replaces the whole collection: it deletes every
 * StoneGroup and inserts fresh documents, which get NEW _ids. Every
 * ProductStone.stoneGroup still points at a deleted _id, so the reference is
 * dangling ("orphaned").
 *
 * calcProductPrice.services.js then priced those stones at 0 and — until the
 * accompanying fix — persisted that 0 back onto the stone, so every diamond on
 * the storefront showed a rate of "-" and a value of Rs 0.
 *
 * WHAT THIS DOES
 * --------------
 * For each orphaned ProductStone, find the current StoneGroup with the same
 * natural key and repoint the FK:
 *
 *     diamond : stoneType + shape + colour + clarity   (+ carat/size bucket)
 *
 * Matching mirrors controllers/importProduct.controller.js — normalizeColor
 * (:1009), normalizeClarity (:1019) and matchStoneGroupSize (:1060) are
 * reproduced below. If those change, change them here too.
 *
 * SAFETY
 * ------
 * - Dry-run by default. Nothing is written without an explicit --apply.
 * - A stone is relinked ONLY when exactly one candidate group matches. Zero
 *   candidates or an ambiguous multi-match is reported, never guessed.
 * - GEM / colour-stone rows are reported, never guessed: ProductStone does not
 *   store the gem `type`, which the colour-stone key requires.
 * - Stones whose stoneGroup still resolves are left completely untouched.
 * - Idempotent: re-running finds nothing left to do.
 *
 * AFTER RUNNING
 * -------------
 * Re-run the price sync so stone prices and TotalDiamondPrice/finalPrice are
 * recomputed from the restored rates.
 *
 * Usage (from api/):
 *   node scripts/relinkProductStones.mjs              # dry run, prints the plan
 *   node scripts/relinkProductStones.mjs --apply      # write the repaired FKs
 *   node scripts/relinkProductStones.mjs --apply --verbose
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import ProductStone from "../models/productStone.model.js";
import StoneGroup from "../models/stoneGroup.model.js";
import ProductMaster from "../models/product.model.js";

const APPLY = process.argv.includes("--apply");
const VERBOSE = process.argv.includes("--verbose");
// --explain: for the most common unmatched (shape+colour+clarity) keys, print the
// carat buckets the candidate stone groups actually carry, next to the size the
// stone is asking for. This is what tells you whether the stone-group sheet is
// missing buckets or merely formats them differently.
const EXPLAIN = process.argv.includes("--explain");

// Matching rules live in one place (utils/stoneMatch.js) so this script, the
// price sync and the storefront can never disagree about what "the same stone
// group" means.
import {
    safeString,
    normalizeStoneType,
    normalizeColor,
    normalizeClarity,
    matchStoneGroupSize,
} from "../utils/stoneMatch.js";

// ---------------------------------------------------------------------------

const uri = process.env.MONGOOSE_URL;
if (!uri) {
    console.error("MONGOOSE_URL is not set. Run this from api/ with the same .env the API uses. Aborting.");
    process.exit(1);
}

await mongoose.connect(uri);
console.log(`Connected to database "${mongoose.connection.name}" on ${mongoose.connection.host}`);
console.log(APPLY ? "MODE: APPLY (will write)\n" : "MODE: DRY RUN (no writes)\n");

// 1. Every live StoneGroup, indexed by natural key.
const groups = await StoneGroup.find({}).select("_id stoneType type shape color clarity carat lgd_price natural_price").lean();
console.log(`StoneGroup documents  : ${groups.length}`);

const liveGroupIds = new Set(groups.map((g) => g._id.toString()));

const groupsByKey = new Map();
for (const g of groups) {
    if (normalizeStoneType(g.stoneType) !== "diamond") continue;
    if (!g.shape) continue;
    const key = ["diamond", g.shape.toString(), normalizeColor(g.color), normalizeClarity(g.clarity)].join("|");
    if (!groupsByKey.has(key)) groupsByKey.set(key, []);
    groupsByKey.get(key).push(g);
}

// 2. Every ProductStone. Orphan = stoneGroup missing, or not in liveGroupIds.
const stones = await ProductStone.find({})
    .select("_id itemCode productId type stoneGroup shape color clarity size weight pieces")
    .lean();
console.log(`ProductStone documents: ${stones.length}`);

const orphans = stones.filter((s) => !s.stoneGroup || !liveGroupIds.has(s.stoneGroup.toString()));
console.log(`Orphaned stones       : ${orphans.length}\n`);

if (!orphans.length) {
    console.log("Nothing to do — every ProductStone.stoneGroup resolves.");
    await mongoose.disconnect();
    process.exit(0);
}

// 3. Resolve each orphan.
const ops = [];
const unmatched = [];
const ambiguous = [];
const skippedGem = [];

for (const s of orphans) {
    // ProductStone has no gem `type` column, so the colour-stone natural key
    // cannot be rebuilt. Report rather than guess.
    if (safeString(s.type).toUpperCase() === "GEM") {
        skippedGem.push(s);
        continue;
    }

    if (!s.shape) {
        unmatched.push({ stone: s, reason: "no shape on ProductStone" });
        continue;
    }

    const key = ["diamond", s.shape.toString(), normalizeColor(s.color), normalizeClarity(s.clarity)].join("|");
    const candidates = groupsByKey.get(key) || [];

    if (!candidates.length) {
        unmatched.push({ stone: s, reason: `no StoneGroup for key ${key}`, key, candidates: [] });
        continue;
    }

    // Narrow by the carat/size bucket, exactly as the importer does.
    let sized = candidates.filter((g) => matchStoneGroupSize(g.carat, s.size));

    // Fall back to the stone's own weight-per-piece if `size` is absent.
    if (!sized.length && s.pieces > 0 && s.weight > 0) {
        const perPiece = (s.weight / s.pieces).toFixed(4);
        sized = candidates.filter((g) => matchStoneGroupSize(g.carat, perPiece));
    }

    if (!sized.length) {
        unmatched.push({
            stone: s,
            reason: `no size bucket matched size="${s.size}" among ${candidates.length} candidate group(s)`,
            key,
            candidates,
        });
        continue;
    }

    if (sized.length > 1) {
        ambiguous.push({ stone: s, candidates: sized });
        continue;
    }

    const target = sized[0];
    ops.push({
        stone: s,
        target,
        op: {
            updateOne: {
                filter: { _id: s._id },
                update: { $set: { stoneGroup: target._id } },
            },
        },
    });
}

// 4. Report.
console.log("─".repeat(72));
console.log(`Relinkable (unique match) : ${ops.length}`);
console.log(`Ambiguous (>1 match)      : ${ambiguous.length}`);
console.log(`Unmatched (0 match)       : ${unmatched.length}`);
console.log(`Skipped GEM / colour stone: ${skippedGem.length}`);
console.log("─".repeat(72));

// A stone group with no rate relinks fine but still prices at 0 — flag it now
// rather than letting the sync quietly produce another Rs 0 product.
const zeroRate = ops.filter(({ target }) => !(target.lgd_price > 0) && !(target.natural_price > 0));
if (zeroRate.length) {
    console.log(`\nWARNING: ${zeroRate.length} stone(s) will relink to a StoneGroup with NO price`);
    console.log("         (lgd_price and natural_price are both 0/absent). They will still");
    console.log("         price at 0 after the sync. Fix those stone groups' prices.");
    for (const { stone, target } of zeroRate.slice(0, 5)) {
        console.log(`   ${stone.itemCode || stone._id} -> group ${target._id} (${target.color}/${target.clarity} ${target.carat})`);
    }
}

const sample = (arr, n = 10) => arr.slice(0, n);

if (VERBOSE && ops.length) {
    console.log("\nRelink plan (first 10):");
    for (const { stone, target } of sample(ops)) {
        console.log(`  ${String(stone.itemCode || "-").padEnd(18)} ${String(stone.type).padEnd(7)} ` +
            `size=${String(stone.size).padEnd(8)} -> ${target._id} (carat ${target.carat})`);
    }
}

if (ambiguous.length) {
    console.log("\nAMBIGUOUS — more than one stone group matches. Not touched:");
    for (const { stone, candidates } of sample(ambiguous)) {
        console.log(`  ${stone.itemCode || stone._id}: ${candidates.length} candidates -> ${candidates.map((c) => `${c._id}(${c.carat})`).join(", ")}`);
    }
}

if (unmatched.length) {
    console.log("\nUNMATCHED — no stone group found. Not touched:");
    for (const { stone, reason } of sample(unmatched)) {
        console.log(`  ${stone.itemCode || stone._id} [${stone.type}] ${stone.color}/${stone.clarity} size=${stone.size}: ${reason}`);
    }
    if (unmatched.length > 10) console.log(`  ... and ${unmatched.length - 10} more`);

    // Distribution of the sizes we are failing to place. If a handful of sizes
    // account for most failures, the stone-group sheet is simply missing them.
    const bySize = new Map();
    for (const u of unmatched) {
        const k = safeString(u.stone.size) || "(blank)";
        bySize.set(k, (bySize.get(k) || 0) + 1);
    }
    const topSizes = [...bySize.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    console.log("\nUnmatched stones grouped by the size they asked for:");
    for (const [size, count] of topSizes) {
        console.log(`  size=${String(size).padEnd(12)} ${String(count).padStart(6)} stone(s)`);
    }
    if (bySize.size > 20) console.log(`  ... and ${bySize.size - 20} more distinct sizes`);

    // Blank sizes can never match: matchStoneGroupSize returns false for "".
    const blank = bySize.get("(blank)") || 0;
    if (blank) {
        console.log(`\n  NOTE: ${blank} stone(s) have NO size at all. Those can never be matched by size.`);
    }

    if (EXPLAIN) {
        console.log("\n" + "─".repeat(72));
        console.log("EXPLAIN — for the worst keys, what carat buckets DO the candidates carry?");
        console.log("─".repeat(72));

        const byKey = new Map();
        for (const u of unmatched) {
            if (!u.key || !u.candidates?.length) continue;
            if (!byKey.has(u.key)) byKey.set(u.key, { count: 0, sizes: new Set(), candidates: u.candidates, sample: u.stone });
            const e = byKey.get(u.key);
            e.count += 1;
            e.sizes.add(safeString(u.stone.size) || "(blank)");
        }

        const worst = [...byKey.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
        for (const [, e] of worst) {
            const s = e.sample;
            console.log(`\n  ${e.count} stone(s)  colour=${s.color} clarity=${s.clarity}  (e.g. ${s.itemCode})`);
            console.log(`    stones ask for sizes : ${[...e.sizes].sort().join(", ")}`);
            console.log(`    stone groups OFFER   : ${e.candidates.map((c) => `"${c.carat}"`).join(", ")}`);
        }
        console.log("\n  If the OFFER list is empty strings or a different notation (e.g. \"0.60 to 0.70\"),");
        console.log("  the matcher needs to understand that notation. If the sizes are simply absent");
        console.log("  from the OFFER list, the stone-group sheet is missing those buckets.");
    } else {
        console.log("\n  Re-run with --explain to see which carat buckets the candidate stone groups carry.");
    }
}

if (skippedGem.length) {
    console.log(`\nGEM rows skipped (ProductStone stores no gem type — relink these by hand):`);
    for (const s of sample(skippedGem, 5)) console.log(`  ${s.itemCode || s._id}`);
    if (skippedGem.length > 5) console.log(`  ... and ${skippedGem.length - 5} more`);
}

// Which products remain broken afterwards?
const stillBrokenProductIds = new Set(
    [...ambiguous.map((a) => a.stone), ...unmatched.map((u) => u.stone), ...skippedGem]
        .map((s) => s.productId?.toString())
        .filter(Boolean)
);
if (stillBrokenProductIds.size) {
    console.log(`\n${stillBrokenProductIds.size} product(s) will STILL have at least one orphaned stone`);
    console.log("and will keep being skipped by the price sync until resolved.");
    const brokenProducts = await ProductMaster.find({ _id: { $in: [...stillBrokenProductIds] } })
        .select("itemCode").limit(10).lean();
    for (const p of brokenProducts) console.log(`   ${p.itemCode}`);
}

if (!APPLY) {
    console.log(`\nDRY RUN — ${ops.length} stone(s) would be relinked. Re-run with --apply to write.`);
    await mongoose.disconnect();
    process.exit(0);
}

if (!ops.length) {
    console.log("\nNothing to write.");
    await mongoose.disconnect();
    process.exit(0);
}

const res = await ProductStone.bulkWrite(ops.map((o) => o.op), { ordered: false });
console.log(`\nModified ${res.modifiedCount} of ${ops.length} stone(s).`);

// Verify: recount orphans from scratch.
const after = await ProductStone.find({}).select("stoneGroup").lean();
const remaining = after.filter((s) => !s.stoneGroup || !liveGroupIds.has(s.stoneGroup.toString())).length;
console.log(`Orphaned stones remaining: ${remaining} (expected ${ambiguous.length + unmatched.length + skippedGem.length}).`);

await mongoose.disconnect();

console.log("\nNext: re-run the price sync so stone prices and finalPrice are recomputed.");
