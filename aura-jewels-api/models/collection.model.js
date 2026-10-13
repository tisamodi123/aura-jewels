import mongoose from "mongoose";
import Constant from '../constants/user.constant.js'

const CollectionSchema = new mongoose.Schema({
    collectionName: String,
    image: String,
    // Top-of-list-page banner. Same shape as Category.pageBanner so the
    // storefront can render either with one component.
    pageBanner: {
        image: { type: String, default: "" },
        imageMobile: { type: String, default: "" },
        heading: { type: String, default: "" },
        subText: { type: String, default: "" }
    },
    // Mirrors Category.interProductBanners (see there for shape notes).
    // Collections have no menuSideCards because they're not top-level
    // menu items — the Collections panel itself IS the curated cards.
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
    // Uniqueness enforced in the controller (`check_unique_collection_name`)
    // so a soft-deleted collection's slug can be reused once code-level
    // logic decides whether to revive or reject. Keeping `unique: true` here
    // would block all collisions including with deleted rows.
    slug: { type: String },
    description: String,
    // Surfaces this collection in the storefront mega menu's collections
    // column / right-side curated cards.
    isMenu: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE
    }
}, { timestamps: true, versionKey: false });


CollectionSchema.index({ collectionName: 1 });
CollectionSchema.index({ slug: 1 });
CollectionSchema.index({ status: 1 });

export default mongoose.model('Collection', CollectionSchema)