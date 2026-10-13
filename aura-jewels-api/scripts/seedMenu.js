// ---------------------------------------------------------------------------
// ONE script to seed the storefront header mega menu (Shopify-style).
//
//   node scripts/seedMenu.js
//
// It reads your REAL data (categories, subcategories, metals, tags,
// collections) and writes a single authored Menu document (location "header")
// that the storefront serves and the admin builder edits. Re-running replaces
// the header menu (idempotent). Every link is entity-backed so it resolves to
// a working URL; collection/category thumbnails are attached automatically at
// serve time.
//
// Structure per top-level category:
//   • Shop By Style     (Links)            -> its subcategories
//   • Shop By Metal     (Grouped / swatch) -> metal type groups + karat options
//   • Shop By Budget    (Links)            -> price-range filters
//   • Shop By Occasion  (Links)            -> the category's tags (if any)
// Plus a "Collections" item (card grid) and a "Bespoke" direct link.
// ---------------------------------------------------------------------------

import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "../models/menu.model.js";
import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import Tag from "../models/tag.model.js";
import Metal from "../models/metal.model.js";
import Constant from "../constants/user.constant.js";
import { MENU_LOCATION, MENU_COLUMN_LAYOUT } from "../constants/menu.constant.js";

dotenv.config({ path: "./.env" });

// Swatch colours per metal type (falls back to grey).
const METAL_HEX = {
    "yellow gold": "#E6C200",
    "rose gold": "#E8B4A0",
    "white gold": "#D9D9D9",
    platinum: "#C7CED4",
    silver: "#C0C0C0",
};

// Fixed price bands (₹). Adjust to taste.
const BUDGETS = [
    { label: "Less than ₹15K", maxPrice: 15000 },
    { label: "₹15K to ₹30K", minPrice: 15000, maxPrice: 30000 },
    { label: "₹30K to ₹50K", minPrice: 30000, maxPrice: 50000 },
    { label: "₹50K to ₹1 Lakh", minPrice: 50000, maxPrice: 100000 },
    { label: "Above ₹1 Lakh", minPrice: 100000 },
];

const A = Constant.STATUS.ACTIVE;

(async () => {
    const uri = process.env.MONGOOSE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/aurajewels";
    console.log(`[seedMenu] Connecting: ${uri}`);
    await mongoose.connect(uri);

    // --- load everything we need in parallel ---------------------------------
    const [allCats, metals, collections, tags] = await Promise.all([
        Category.find({ status: A, isDeleted: { $ne: 1 } })
            .select("_id categoryName slug parentCategoryId tags sort")
            .sort({ sort: 1, categoryName: 1 })
            .lean(),
        Metal.find({ status: A, isDeleted: { $ne: 1 } })
            .select("_id name type stamp")
            .sort({ type: 1, stamp: 1 })
            .lean(),
        Collection.find({ status: A, isDeleted: { $ne: 1 } })
            .select("_id collectionName slug sort")
            .sort({ sort: 1, collectionName: 1 })
            .lean(),
        Tag.find({ status: A }).select("_id name").lean(),
    ]);

    const tagById = new Map(tags.map((t) => [t._id.toString(), t]));
    const topLevel = allCats.filter((c) => !c.parentCategoryId);
    const subsByParent = new Map();
    for (const c of allCats) {
        if (!c.parentCategoryId) continue;
        const k = c.parentCategoryId.toString();
        if (!subsByParent.has(k)) subsByParent.set(k, []);
        subsByParent.get(k).push(c);
    }

    // --- shared metal groups (same metals for every category) ----------------
    // Group by type -> ordered stamps -> metal ids (for the ?metals= filter).
    const metalTypeMap = new Map(); // type -> { hex, stampOrder:[], byStamp:Map(stamp->ids[]), allIds:[] }
    for (const m of metals) {
        const type = (m.type || "Other").trim();
        if (!metalTypeMap.has(type)) {
            metalTypeMap.set(type, {
                hex: METAL_HEX[type.toLowerCase()] || "#C0C0C0",
                stampOrder: [],
                byStamp: new Map(),
                allIds: [],
            });
        }
        const g = metalTypeMap.get(type);
        const stamp = (m.stamp || "").trim() || "—";
        if (!g.byStamp.has(stamp)) {
            g.byStamp.set(stamp, []);
            g.stampOrder.push(stamp);
        }
        g.byStamp.get(stamp).push(m._id.toString());
        g.allIds.push(m._id.toString());
    }

    const catRedirect = (topId, extra = {}) => ({ type: "list", listOf: "category", refId: topId.toString(), ...extra });

    const buildMetalColumn = (topId) => ({
        title: "Shop By Metal",
        layout: MENU_COLUMN_LAYOUT.GROUPED,
        sort: 1,
        links: [],
        groups: Array.from(metalTypeMap.entries()).map(([type, g], gi) => ({
            label: type,
            hex: g.hex,
            sort: gi,
            redirect: catRedirect(topId, { filters: { metals: g.allIds } }),
            options: g.stampOrder.map((stamp, si) => ({
                label: stamp,
                sort: si,
                redirect: catRedirect(topId, { filters: { metals: g.byStamp.get(stamp) } }),
            })),
        })),
    });

    const buildBudgetColumn = (topId) => ({
        title: "Shop By Budget",
        layout: MENU_COLUMN_LAYOUT.LINKS,
        sort: 2,
        groups: [],
        links: BUDGETS.map((b, i) => {
            const filters = {};
            if (b.minPrice != null) filters.minPrice = b.minPrice;
            if (b.maxPrice != null) filters.maxPrice = b.maxPrice;
            return { label: b.label, sort: i, redirect: catRedirect(topId, { filters }) };
        }),
    });

    // --- build one top-level item per category -------------------------------
    const items = [];
    let sort = 0;

    for (const cat of topLevel) {
        const columns = [];
        const subs = subsByParent.get(cat._id.toString()) || [];

        // Shop By Style (subcategories)
        if (subs.length) {
            columns.push({
                title: "Shop By Style",
                layout: MENU_COLUMN_LAYOUT.LINKS,
                sort: 0,
                groups: [],
                links: subs.map((s, i) => ({
                    label: s.categoryName,
                    sort: i,
                    redirect: catRedirect(cat._id, { subCategoryId: s._id.toString() }),
                })),
            });
        }

        // Shop By Metal (grouped swatch) — only if metals exist
        if (metalTypeMap.size) columns.push(buildMetalColumn(cat._id));

        // Shop By Budget
        columns.push(buildBudgetColumn(cat._id));

        // Shop By Occasion (this category's tags)
        const catTags = (cat.tags || [])
            .map((t) => tagById.get(t.toString()))
            .filter(Boolean);
        if (catTags.length) {
            columns.push({
                title: "Shop By Occasion",
                layout: MENU_COLUMN_LAYOUT.LINKS,
                sort: 3,
                groups: [],
                links: catTags.map((t, i) => ({
                    label: t.name,
                    sort: i,
                    redirect: catRedirect(cat._id, { filters: { tags: [t._id.toString()] } }),
                })),
            });
        }

        items.push({
            label: cat.categoryName,
            sort: sort++,
            isActive: true,
            hasMegaMenu: true,
            // View All -> the category PRODUCT LIST (not the editorial landing).
            redirect: catRedirect(cat._id, { categoryView: "products" }),
            columns,
            featuredCards: [],
        });
    }

    // Collections — single card-grid column (thumbnails auto-attached at serve).
    if (collections.length) {
        items.push({
            label: "Collections",
            sort: sort++,
            isActive: true,
            hasMegaMenu: true,
            redirect: { type: "page", pageKey: "collections" },
            columns: [{
                title: "Collections",
                layout: MENU_COLUMN_LAYOUT.LINKS,
                sort: 0,
                groups: [],
                links: collections.map((c, i) => ({
                    label: c.collectionName,
                    sort: i,
                    redirect: { type: "list", listOf: "collection", refId: c._id.toString() },
                })),
            }],
            featuredCards: [],
        });
    }

    // Bespoke — plain direct link, no dropdown.
    items.push({
        label: "Bespoke Design",
        sort: sort++,
        isActive: true,
        hasMegaMenu: false,
        redirect: { type: "page", pageKey: "custom-jewellery" },
        columns: [],
        featuredCards: [],
    });

    await Menu.findOneAndUpdate(
        { location: MENU_LOCATION.HEADER, isDeleted: 0 },
        {
            $set: { location: MENU_LOCATION.HEADER, title: "Header Menu", status: A, items },
            $setOnInsert: { isDeleted: 0 },
        },
        { upsert: true, setDefaultsOnInsert: true, returnDocument: "after" },
    );

    console.log(`[seedMenu] Done.`);
    console.log(`  Top-level categories : ${topLevel.length}`);
    console.log(`  Metal groups         : ${metalTypeMap.size}`);
    console.log(`  Collections          : ${collections.length}`);
    console.log(`  Total menu items     : ${items.length}`);
    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => {
    console.error("[seedMenu] failed:", err);
    process.exit(1);
});
