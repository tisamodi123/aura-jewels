// Rebuilds the CATEGORY tree (+ ensures tags/collection masters) from the
// consolidated product Excel, so the admin product import can resolve
// ProdCategory / ProdSubCategory / Collection / Tags by name.
//
//   node scripts/importMastersFromExcel.js "<path-to.xlsx>"            # DRY RUN (prints plan)
//   node scripts/importMastersFromExcel.js "<path-to.xlsx>" --commit   # APPLY
//
// What it does on --commit:
//   • CATEGORIES: hard-deletes ALL existing categories, then recreates the
//     6 mains + their subcategories from the sheet (numeric junk skipped).
//     Subcategory slugs are de-duplicated (a name reused across mains keeps a
//     clean slug on first use, later ones get a `-<main>` suffix) so the
//     storefront /<cat>/<sub> route resolves unambiguously.
//   • TAGS: additive — ensures the sheet's tags exist (kept existing untouched).
//   • COLLECTIONS: additive — ensures the sheet's collection(s) exist
//     (existing collections are kept, per instruction).
//
// After running + importing products from admin, re-run scripts/seedMenu.js to
// rebuild the mega menu from the new masters.
//
// The import matches masters by NAME (case/space-insensitive), so names here
// are written exactly as they appear in the sheet.

import mongoose from "mongoose";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import Tag from "../models/tag.model.js";
import Constant from "../constants/user.constant.js";
import { createSlug } from "../utils/createSlug.js";

dotenv.config({ path: "./.env" });

const A = Constant.STATUS.ACTIVE;
const EXCEL = process.argv[2];
const COMMIT = process.argv.includes("--commit");
const isNumeric = (s) => /^\d+(\.\d+)?$/.test(s);
const norm = (s) => String(s || "").trim();

if (!EXCEL) {
    console.error('Usage: node scripts/importMastersFromExcel.js "<path.xlsx>" [--commit]');
    process.exit(1);
}

// --- 1. read the sheet -------------------------------------------------------
async function extractFromExcel() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(EXCEL);
    const ws = wb.worksheets[0];

    // Resolve column indices from the header row by name (robust to reordering).
    const header = ws.getRow(1);
    const col = {};
    header.eachCell((cell, c) => { col[norm(cell.text).toLowerCase()] = c; });
    const CAT = col["prodcategory"], SUB = col["prodsubcategory"], COL = col["collection"], TAG = col["tags"];
    if (!CAT || !SUB) throw new Error("Could not find ProdCategory / ProdSubCategory columns");

    const mains = [];              // ordered unique main category names
    const mainSet = new Set();
    const subsByMain = new Map();  // main -> ordered unique sub names
    const collections = new Map(); // name -> count
    const tags = new Map();        // name -> count

    ws.eachRow((row, rn) => {
        if (rn === 1) return;
        const cat = norm(row.getCell(CAT).text);
        if (!cat) return;
        if (!mainSet.has(cat)) { mainSet.add(cat); mains.push(cat); subsByMain.set(cat, new Set()); }

        const sub = norm(row.getCell(SUB).text);
        if (sub) {
            for (const part of sub.split(",")) {
                const s = norm(part);
                if (s && !isNumeric(s) && norm(s).toLowerCase() !== "all") subsByMain.get(cat).add(s);
            }
        }
        if (COL) {
            const cv = norm(row.getCell(COL).text);
            if (cv) collections.set(cv, (collections.get(cv) || 0) + 1);
        }
        if (TAG) {
            const tv = norm(row.getCell(TAG).text);
            if (tv) for (const part of tv.split(",")) { const t = norm(part); if (t && !isNumeric(t)) tags.set(t, (tags.get(t) || 0) + 1); }
        }
    });

    return { mains, subsByMain, collections, tags };
}

(async () => {
    const { mains, subsByMain, collections, tags } = await extractFromExcel();

    const uri = process.env.MONGOOSE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/aura_jewels_db";
    console.log(`[importMasters] Connecting: ${uri}`);
    await mongoose.connect(uri);

    const [existingCats, existingCols, existingTags] = await Promise.all([
        Category.countDocuments({}),
        Collection.countDocuments({}),
        Tag.countDocuments({}),
    ]);

    // Plan preview
    console.log("\n========== MASTERS IMPORT PLAN ==========");
    console.log(`Mode: ${COMMIT ? "COMMIT (will write)" : "DRY RUN (no writes)"}`);
    console.log(`\nCATEGORIES — will DELETE all ${existingCats} existing, recreate:`);
    let totalSubs = 0;
    for (const main of mains) {
        const subs = [...subsByMain.get(main)];
        totalSubs += subs.length;
        console.log(`  • ${main}  [${subs.join(", ")}]`);
    }
    console.log(`  => ${mains.length} mains + ${totalSubs} subcategories = ${mains.length + totalSubs} category docs`);
    console.log(`\nTAGS — additive (keep existing ${existingTags}); ensure: ${[...tags.keys()].join(", ") || "(none)"}`);
    console.log(`COLLECTIONS — additive (keep existing ${existingCols}); ensure: ${[...collections.keys()].join(", ") || "(none)"}`);

    if (!COMMIT) {
        console.log("\nDRY RUN complete. Re-run with --commit to apply.\n");
        await mongoose.disconnect();
        process.exit(0);
    }

    // --- 2. categories: drop all + recreate ---------------------------------
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
    for (const main of mains) {
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
        for (const sub of subsByMain.get(main)) {
            const subSlug = uniqueSlug(createSlug(sub), mainSlug);
            await Category.create({
                categoryName: sub,
                slug: subSlug,
                parentCategoryId: mainDoc._id,
                status: A,
                isDeleted: 0,
                isMenu: false,
                sort: sortSub++,
            });
            createdSubs++;
        }
    }

    // --- 3. tags: additive upsert -------------------------------------------
    let tagsCreated = 0;
    for (const name of tags.keys()) {
        const res = await Tag.updateOne(
            { name },
            { $setOnInsert: { name, status: A, isMenu: false, sort: 0 } },
            { upsert: true }
        );
        if (res.upsertedCount) tagsCreated++;
    }

    // --- 4. collections: additive upsert ------------------------------------
    let colsCreated = 0;
    for (const name of collections.keys()) {
        // NB: the Collection model has no `isDeleted` field.
        const res = await Collection.updateOne(
            { collectionName: name },
            { $setOnInsert: { collectionName: name, slug: createSlug(name), status: A, isMenu: false } },
            { upsert: true }
        );
        if (res.upsertedCount) colsCreated++;
    }

    console.log("\n========== DONE ==========");
    console.log(`Categories: created ${createdMains} mains + ${createdSubs} subcategories.`);
    console.log(`Tags: ${tagsCreated} new (existing kept).`);
    console.log(`Collections: ${colsCreated} new (existing kept).`);
    console.log("Next: import products from admin, then run scripts/seedMenu.js to rebuild the menu.\n");

    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error("[importMasters] failed:", err);
    process.exit(1);
});
