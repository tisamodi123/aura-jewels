// Self-contained masters seeder — SAME output as importMastersFromExcel.js but
// with the values baked in, so it runs on any server WITHOUT the Excel file.
//
//   node scripts/seedMasters.js            # DRY RUN (prints the plan, no writes)
//   node scripts/seedMasters.js --commit   # APPLY
//
// FULL CLEAN SLATE. On --commit it hard-deletes and recreates everything below:
//   • PRODUCTS    : deletes ALL products + product-stones so the re-import starts
//                   empty (stone-group / diamond masters are NOT touched).
//   • CATEGORIES  : deletes ALL categories, recreates the 6 mains + their
//                   subcategories. Subcategory slugs are de-duplicated (a name
//                   reused across mains keeps a clean slug on first use; later
//                   ones get a `-<main>` suffix) so the storefront /<cat>/<sub>
//                   route resolves unambiguously.
//   • TAGS        : deletes ALL tags, recreates Anniversary & Engagement.
//   • COLLECTIONS : deletes ALL collections, recreates ALPHABET.
//
// After running, import products from admin, then run scripts/seedMenu.js to
// rebuild the mega menu from the new masters. Product import matches masters by
// NAME (case/space-insensitive), so names here match the sheet exactly.
//
// Data source: "Final ProductData Sheet Consolidated.xlsx"
// (categories/subcategories/tags/collection extracted). To refresh
// from a new sheet, re-run importMastersFromExcel.js and update the block below.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import Tag from "../models/tag.model.js";
import ProductMaster from "../models/product.model.js";
import ProductStone from "../models/productStone.model.js";
import Constant from "../constants/user.constant.js";
import { createSlug } from "../utils/createSlug.js";

dotenv.config({ path: "./.env" });

const A = Constant.STATUS.ACTIVE;
const COMMIT = process.argv.includes("--commit");

// --- baked-in masters (order preserved from the sheet) ----------------------
// Each entry: [ MainCategory, [subcategories...] ]
const CATEGORY_TREE = [
    ["RINGS", ["Solitaire", "Daily & Office Wear", "Contemporary", "Halo", "Toi et Moi", "Bands"]],
    ["EARRINGS", ["Danglers", "Daily & Office Wear", "Drops", "Halo", "Studs", "Hoops", "Toi et Moi", "Solitaire Studs", "Contemporary"]],
    ["NECKLACE", ["Mangalsutra", "Toi et Moi", "Tennis", "Contemporary", "Daily & Office Wear", "Bridal"]],
    ["PENDANTS", ["Halo", "Drops", "Heart", "Daily & Office Wear", "Contemporary", "Solitaire", "Infinity", "Butterfly", "Kids", "Toi et Moi", "Alphabet", "Evil Eye", "Religious"]],
    ["FOR HIM", ["Solitaire", "Contemporary", "Daily & Office Wear", "Halo", "Bands"]],
    ["BRACELETS & BANGLES", ["Tennis Bracelets", "Contemporary", "Chain Bracelets", "Bangles", "Kada"]],
];
const TAGS = ["Anniversary", "Engagement"];
const COLLECTIONS = ["ALPHABET"];

(async () => {
    const uri = process.env.MONGOOSE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/aura_jewels_db";
    console.log(`[seedMasters] Connecting: ${uri}`);
    await mongoose.connect(uri);

    const [existingCats, existingCols, existingTags, existingProducts, existingStones] = await Promise.all([
        Category.countDocuments({}),
        Collection.countDocuments({}),
        Tag.countDocuments({}),
        ProductMaster.countDocuments({}),
        ProductStone.countDocuments({}),
    ]);

    const totalSubs = CATEGORY_TREE.reduce((n, [, subs]) => n + subs.length, 0);

    console.log("\n========== MASTERS SEED PLAN (FULL CLEAN SLATE) ==========");
    console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY RUN (no writes)"}`);
    console.log(`\nPRODUCTS — will DELETE all ${existingProducts} products + ${existingStones} product-stones (recreate via admin import)`);
    console.log(`\nCATEGORIES — will DELETE all ${existingCats} existing, recreate:`);
    for (const [main, subs] of CATEGORY_TREE) console.log(`  • ${main}  [${subs.join(", ")}]`);
    console.log(`  => ${CATEGORY_TREE.length} mains + ${totalSubs} subcategories = ${CATEGORY_TREE.length + totalSubs} category docs`);
    console.log(`\nTAGS — will DELETE all ${existingTags} existing, recreate: ${TAGS.join(", ")}`);
    console.log(`COLLECTIONS — will DELETE all ${existingCols} existing, recreate: ${COLLECTIONS.join(", ")}`);

    if (!COMMIT) {
        console.log("\nDRY RUN complete. Re-run with --commit to apply.\n");
        await mongoose.disconnect();
        process.exit(0);
    }

    // --- products: full wipe (re-imported from admin afterwards) ------------
    const delProducts = await ProductMaster.deleteMany({});
    const delStones = await ProductStone.deleteMany({});
    console.log(`Deleted ${delProducts.deletedCount} products + ${delStones.deletedCount} product-stones.`);

    // --- categories: drop all + recreate ------------------------------------
    await Category.deleteMany({});
    const usedSlugs = new Set();
    const uniqueSlug = (base, suffix) => {
        let slug = base;
        if (usedSlugs.has(slug)) slug = `${base}-${suffix}`;
        let n = 2;
        while (usedSlugs.has(slug)) slug = `${base}-${suffix}-${n++}`;
        usedSlugs.add(slug);
        return slug;
    };

    let createdMains = 0, createdSubs = 0;
    for (const [main, subs] of CATEGORY_TREE) {
        const mainSlug = uniqueSlug(createSlug(main), createSlug(main));
        const mainDoc = await Category.create({
            categoryName: main,
            slug: mainSlug,
            parentCategoryId: null,
            status: A,
            isDeleted: 0,
            isMenu: true,
            sort: createdMains,
        });
        createdMains++;

        let sortSub = 0;
        for (const sub of subs) {
            await Category.create({
                categoryName: sub,
                slug: uniqueSlug(createSlug(sub), mainSlug),
                parentCategoryId: mainDoc._id,
                status: A,
                isDeleted: 0,
                isMenu: false,
                sort: sortSub++,
            });
            createdSubs++;
        }
    }

    // --- tags: drop all + recreate ------------------------------------------
    await Tag.deleteMany({});
    for (let i = 0; i < TAGS.length; i++) {
        await Tag.create({ name: TAGS[i], status: A, isMenu: false, sort: i });
    }

    // --- collections: drop all + recreate (Collection model has no isDeleted) -
    await Collection.deleteMany({});
    for (const name of COLLECTIONS) {
        await Collection.create({ collectionName: name, slug: createSlug(name), status: A, isMenu: false });
    }

    console.log("\n========== DONE ==========");
    console.log(`Products: deleted ${delProducts.deletedCount} (+${delStones.deletedCount} stones) — re-import from admin.`);
    console.log(`Categories: created ${createdMains} mains + ${createdSubs} subcategories.`);
    console.log(`Tags: recreated ${TAGS.length} (${TAGS.join(", ")}).`);
    console.log(`Collections: recreated ${COLLECTIONS.length} (${COLLECTIONS.join(", ")}).`);
    console.log("Next: import products from admin, then run scripts/seedMenu.js to rebuild the menu.\n");

    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error("[seedMasters] failed:", err);
    process.exit(1);
});
