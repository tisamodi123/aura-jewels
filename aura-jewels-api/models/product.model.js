import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const productSchema = new mongoose.Schema({
    designNumber: {
        type: String,
        trim: true
    },

    itemCode: {
        type: String,
        trim: true
    },

    parentItemCode: {
        type: String,
        trim: true
    },

    // Denormalised "variant family" key = parentItemCode (when set) else
    // itemCode. Lets the storefront product-list resolve a product's variants
    // with a single INDEXED lookup instead of a per-row correlated scan.
    // Kept in sync by the hooks below + cleanProductForDb (bulkWrite path).
    familyItemCode: {
        type: String,
        trim: true,
        default: ""
    },

    productTitle: {
        type: String,
        trim: true
    },

    productDesc: {
        type: String,
        trim: true
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },

    subCategoryId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],

    collectionId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection"
    }],

    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
    }],

    // NOTE: the product import writes the sheet's raw value via bulkWrite,
    // which bypasses this enum — the collection therefore also contains
    // "UNISEX". Storefront filtering matches case-insensitively.
    gender: {
        type: String,
        enum: [Constant.GENDER.FEMALE, Constant.GENDER.MALE, Constant.GENDER.MEN, Constant.GENDER.WOMEN, Constant.GENDER.OTHER, Constant.GENDER.UNISEX, Constant.GENDER.COUPLE]
    },

    // metalType: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "MetalType"
    // },

    // metalStamp: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "MetalStamp"
    // },

    metalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metal"
    },

    defaultSize: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sizes"
    },

    appxMetalWgt: {
        type: Number,
        trim: true
    },

    qty: {
        type: Number,
        trim: true
    },

    height: {
        type: String,
        trim: true
    },

    width: {
        type: String,
        trim: true
    },

    length: {
        type: String,
        trim: true
    },

    labourCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Charges"
    },

    otherChargeCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Charges"
    },

    isEngraving: {
        type: Boolean,
        default: false
    },

    stonePrice: Number,

    images: [{
        MediaLocation: {
            type: String,
            trim: true
        },
        IsMainMedia: {
            type: Boolean,
            default: false
        },
        MediaSeqNo: Number,
    }],

    videos: [{
        MediaLocation: {
            type: String,
            trim: true
        },
        IsMainMedia: {
            type: Boolean,
            default: false
        },
        MediaSeqNo: Number,
    }],

    // Uniqueness enforced in the controller against non-deleted rows only.
    // A model-level `unique: true` would also reject soft-deleted slugs and
    // make legitimate re-creates impossible.
    slug: {
        type: String,
        trim: true
    },

    haveChain: {
        type: String,
        trim: true
    },

    cMetalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metal"
    },
    // cMetalType: mongoose.Schema.Types.ObjectId,
    // cMetalStamp: mongoose.Schema.Types.ObjectId,

    cWgt: {
        type: Number,
        trim: true
    },

    cLength: {
        type: String,
        trim: true
    },

    // Shipping lead time from the import sheet. String, because the sheet can
    // carry a RANGE ("15 to 17", "15-17", "15 - 17") as well as a plain number.
    // Display formatting/normalisation lives in utils/shipmentDays.js — store
    // the value as imported.
    shipmentDays: {
        type: String,
        trim: true
    },

    SEODetails: {
        metaTitle: String,
        metaKeyword: String,
        slug: String,
        metaDescription: String
    },

    metalPrice: Number,
    labourPrice: Number,
    otherChargePrice: Number,
    SideDiamondPrice: Number,
    CenterDiamondPrice: Number,
    TotalDiamondPrice: Number,
    finalPrice: Number,
    offerDetails: { type: Object, default: null },
    discountedPrice: { type: Number, default: null },

    // Cross-sell / upsell SKUs. Stored as plain itemCode strings (not refs)
    // because import/export uses SKU text and resolving on read is cheap.
    similarProducts: { type: [String], default: [] },
    combineWith: { type: [String], default: [] },

    status: {
        type: String,
        enum: [Constant.PRODUCT_STATUS.AVALIABLE, Constant.PRODUCT_STATUS.HOLD],
        default: Constant.PRODUCT_STATUS.AVALIABLE
    },

    isDeleted: { type: Number, default: 0 },

    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId

}, { timestamps: true, versionKey: false });

// itemCode uniqueness enforced in the import/create path against
// non-deleted rows only — leaving the model-level `unique: true` here
// would block re-creating an SKU after a delete.
productSchema.index({ itemCode: 1 });
productSchema.index({ isDeleted: 1, createdAt: -1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ collectionId: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ metalId: 1 });
productSchema.index({ finalPrice: 1 });
productSchema.index({ status: 1 });
productSchema.index({ parentItemCode: 1 });

productSchema.index({ isDeleted: 1, status: 1 });
productSchema.index({ updatedAt: -1 });
productSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
productSchema.index({ isDeleted: 1, status: 1, finalPrice: 1 });
productSchema.index({ isDeleted: 1, status: 1, categoryId: 1 });
productSchema.index({ isDeleted: 1, status: 1, subCategoryId: 1 });
productSchema.index({ isDeleted: 1, status: 1, collectionId: 1 });
productSchema.index({ isDeleted: 1, status: 1, metalId: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ isDeleted: 1, status: 1, parentItemCode: 1 });
productSchema.index({ isDeleted: 1, status: 1, itemCode: 1 });
// Powers the indexed variant-family lookup in the product list.
productSchema.index({ familyItemCode: 1, isDeleted: 1, status: 1 });

// The single source of truth for the family key. Exported so non-hook write
// paths (bulkWrite / import) can compute the same value.
export const computeFamilyItemCode = (parentItemCode, itemCode) => {
    const p = (parentItemCode ?? "").toString().trim();
    return p !== "" ? p : (itemCode ?? "").toString().trim();
};

// --- keep familyItemCode in sync across every write path --------------------
//
// Mongoose 9 no longer passes a `next` callback to middleware — a hook simply
// returns (or returns a promise). The old `function (next) { ...; next(); }`
// form threw "next is not a function" on every ODM write. Behaviour below is
// unchanged; only the callback plumbing was removed.

// Document saves (Product.create, new Product().save()).
productSchema.pre("save", function () {
    this.familyItemCode = computeFamilyItemCode(this.parentItemCode, this.itemCode);
});

// insertMany (bypasses save hooks). In Mongoose 9 the docs array is the FIRST
// argument — it used to sit behind `next`.
productSchema.pre("insertMany", function (docs) {
    if (Array.isArray(docs)) {
        for (const d of docs) {
            d.familyItemCode = computeFamilyItemCode(d.parentItemCode, d.itemCode);
        }
    }
});

// Query updates (findByIdAndUpdate -> findOneAndUpdate, updateOne). Only does
// work when the SKU/parent actually changes; fetches the current doc to merge
// only if the update didn't include both values.
async function syncFamilyOnUpdate() {
    const update = this.getUpdate() || {};
    const $set = update.$set || update;
    if (!$set || typeof $set !== "object") return;
    if (!("itemCode" in $set) && !("parentItemCode" in $set)) return;

    let itemCode = $set.itemCode;
    let parentItemCode = $set.parentItemCode;
    if (itemCode === undefined || parentItemCode === undefined) {
        const cur = await this.model.findOne(this.getFilter())
            .select("itemCode parentItemCode").lean();
        if (itemCode === undefined) itemCode = cur?.itemCode;
        if (parentItemCode === undefined) parentItemCode = cur?.parentItemCode;
    }
    const family = computeFamilyItemCode(parentItemCode, itemCode);
    if (update.$set) update.$set.familyItemCode = family;
    else update.familyItemCode = family;
    this.setUpdate(update);
}
productSchema.pre("findOneAndUpdate", syncFamilyOnUpdate);
productSchema.pre("updateOne", syncFamilyOnUpdate);

export default mongoose.model("ProductMaster", productSchema);