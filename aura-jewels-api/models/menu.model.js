import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";
import { MENU_LOCATION, MENU_COLUMN_LAYOUT } from "../constants/menu.constant.js";

// Admin-authored, Shopify-style mega menu. One document per LOCATION
// ("header" today). The whole navigation tree is stored explicitly so the
// admin controls structure, order, columns, grouping and every link target —
// nothing is derived from category/collection flags any more.
//
// Every `redirect` is the same shape used by CMS home sections / category
// side-cards (Direct / List / Product / Page / None). It's stored as a free
// Object and resolved to an absolute `href` server-side by decorateRedirects
// before the storefront ever sees it, so the front-end renders links blindly.

// A single leaf link inside a column (e.g. "Engagement" under Shop By Style).
const MenuLinkSchema = new mongoose.Schema({
    label: { type: String, default: "" },
    // Optional thumbnail (Shop By Style links can show a small image).
    image: { type: String, default: "" },
    redirect: { type: Object, default: () => ({ type: "none" }) },
    sort: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { _id: true });

// A grouped entry for the "grouped" column layout (Shop By Metal). The group
// header itself can link somewhere (e.g. all Yellow Gold) and carries a swatch
// colour; `options` are the karat sub-links (9K / 14K / 18K).
const MenuGroupSchema = new mongoose.Schema({
    label: { type: String, default: "" },
    hex: { type: String, default: "" },           // swatch colour
    image: { type: String, default: "" },
    redirect: { type: Object, default: () => ({ type: "none" }) },
    options: {
        type: [{
            label: { type: String, default: "" },
            redirect: { type: Object, default: () => ({ type: "none" }) },
            sort: { type: Number, default: 0 },
        }],
        default: [],
    },
    sort: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { _id: true });

// One column/panel inside a top-level item's mega menu (Shop By Style,
// Shop By Metal, Shop By Budget, Shop By Occasion, Shop By Collection, …).
const MenuColumnSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    layout: {
        type: String,
        enum: MENU_COLUMN_LAYOUT.ALL_TYPES,
        default: MENU_COLUMN_LAYOUT.LINKS,
    },
    links: { type: [MenuLinkSchema], default: [] },     // layout === "links"
    groups: { type: [MenuGroupSchema], default: [] },   // layout === "grouped"
    sort: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { _id: true });

// Curated card on the right side of a mega menu (same shape as
// Category.menuSideCards so the storefront reuses one component).
const MenuCardSchema = new mongoose.Schema({
    image: { type: String, default: "" },
    imageMobile: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    redirect: { type: Object, default: () => ({ type: "none" }) },
    sort: { type: Number, default: 0 },
}, { _id: true });

// A top-level nav item (Rings, Earrings, … Collections, Bespoke). When
// `hasMegaMenu` is false it's a plain link (Bespoke); otherwise hovering opens
// the columns + cards panel.
const MenuItemSchema = new mongoose.Schema({
    label: { type: String, default: "" },
    redirect: { type: Object, default: () => ({ type: "none" }) },
    hasMegaMenu: { type: Boolean, default: true },
    columns: { type: [MenuColumnSchema], default: [] },
    featuredCards: { type: [MenuCardSchema], default: [] },
    sort: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { _id: true });

const MenuSchema = new mongoose.Schema({
    // Logical location of this menu. Unique per non-deleted document so a
    // location can be re-created after a soft delete.
    location: {
        type: String,
        enum: MENU_LOCATION.ALL_TYPES,
        default: MENU_LOCATION.HEADER,
    },
    title: { type: String, default: "" },
    items: { type: [MenuItemSchema], default: [] },
    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE,
    },
    isDeleted: { type: Number, default: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true, versionKey: false });

MenuSchema.index({ location: 1 }, { partialFilterExpression: { isDeleted: 0 } });
MenuSchema.index({ status: 1, isDeleted: 1 });

export default mongoose.model("Menu", MenuSchema);
