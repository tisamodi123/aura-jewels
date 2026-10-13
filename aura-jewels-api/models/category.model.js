import mongoose from 'mongoose';
import Constant from '../constants/user.constant.js';

const CategorySchema = new mongoose.Schema({
    categoryName: { type: String, },
    // Uniqueness is enforced in the controller against non-deleted rows
    // only — see `check_unique_category_db` callers and the soft-deleted
    // revival path. A model-level `unique: true` would also collide with
    // soft-deleted rows, blocking legitimate re-creates.
    slug: { type: String },
    parentCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    description: {
        type: String
    },
    sort: Number,    // display order
    metaTitle: {
        type: String,
        trim: true
    },
    metaKeyword: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    image: String,
    // Top-of-list-page banner. Separate from `image` (used as a thumbnail
    // / menu icon) so admins can pair a hero image with optional mobile
    // variant + overlay text. Same shape mirrored on Collection.
    pageBanner: {
        image: { type: String, default: "" },
        imageMobile: { type: String, default: "" },
        heading: { type: String, default: "" },
        subText: { type: String, default: "" }
    },
    // Editorial cards injected between product rows on the list page.
    // `position` is 1-indexed across the product grid (1 = after the 1st
    // product, 2 = after the 2nd, …). `redirect` uses the same shape as
    // CMS home sections / menuSideCards — Direct/List/Product/None — so
    // the storefront resolves a single `href` server-side via
    // `decorateRedirects`.
    interProductBanners: {
        type: [
            {
                image: { type: String, default: "" },
                imageMobile: { type: String, default: "" },
                position: { type: Number, default: 0 },
                redirect: { type: Object, default: () => ({ type: "none" }) },
                alt: { type: String, default: "" }
            }
        ],
        default: []
    },
    // Featured tags shown in the mega menu's "Featured" column. Admin
    // multi-selects from the active Tag list; soft-deleted/suspended
    // tags are filtered out at read time so the menu stays clean even
    // when a tag is later removed without editing the category.
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    // Curated cards rendered on the right side of THIS category's mega
    // menu dropdown. Same {image, title, subtitle, redirect} shape used
    // by the home CMS sections, so the storefront can reuse its existing
    // resolveRedirectHref helper. `ctaText` lets admins customize the
    // call-to-action label (defaults to "Explore" on the storefront when
    // empty); when the redirect resolves to no href, the storefront hides
    // the CTA entirely.
    menuSideCards: {
        type: [
            {
                image: { type: String, default: "" },
                imageMobile: { type: String, default: "" },
                title: { type: String, default: "" },
                subtitle: { type: String, default: "" },
                ctaText: { type: String, default: "" },
                redirect: { type: Object, default: () => ({ type: "none" }) }
            }
        ],
        default: []
    },
    status: {
        type: String,
        enum: [
            Constant.STATUS.ACTIVE,
            Constant.STATUS.SUSPENDED
        ],
        default: Constant.STATUS.ACTIVE
    },
    isDeleted: {
        type: Number,
        trim: true,
        default: 0
    },
    // featuredCategory: {
    //     type: Boolean,
    //     default: false
    // },
    // When true, this entity appears in the storefront's dynamic mega menu.
    // For top-level categories it becomes a top-bar item; for subcategories
    // it surfaces inside its parent's "by style" column.
    isMenu: {
        type: Boolean,
        default: false
    },
    hasSize: {
        type: Boolean,
        default: false
    },
    sizeLabel: {
        type: String,
        default: "Size"
    },
    // size: {
    //     type: String,
    //     default: null
    // },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    createdBy: { type: mongoose.Schema.Types.ObjectId }
}, {
    timestamps: true,
    versionKey: false,
})

CategorySchema.index({ categoryName: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ status: 1, isDeleted: 1 });

export default mongoose.model('Category', CategorySchema);