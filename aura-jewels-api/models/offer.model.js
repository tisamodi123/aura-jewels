import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const offerSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            maxlength: 50,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        // URL slug for the storefront offer landing page (/offer/<slug>).
        // Optional/back-compat: the menu redirect resolver falls back to
        // `code` then `_id` when this is empty, and the public offer endpoint
        // matches slug OR code OR id.
        slug: { type: String, trim: true, default: "" },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        image: { type: String, default: "" },
        imageMobile: { type: String, default: "" },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        priceRange: {
            from: {
                type: Number,
                required: true,
                min: 0,
                default: 0,
            },

            to: {
                type: Number,
                required: true,
                min: 0,
            },
        },

        discountType: {
            type: String,
            required: true,
            enum: Constant.OFFER_DISCOUNT_TYPE.ALL_TYPES,
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        maxDiscountAmount: {
            type: Number,
            min: 0,
            default: null,
        },

        appliedOn: {
            type: String,
            required: true,
            enum: Constant.OFFER_APPLIED_ON.ALL_TYPES,
        },

        // Only used when appliedOn === "combined": a separate percentage on the
        // making charge and on the diamond value. discountType/discountValue are
        // ignored for combined offers.
        makingChargePercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        diamondPercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        applicableProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductMaster"
        }],

        applicableType: {
            type: String,
            enum: Constant.OFFER_APPLICABLE_TYPE.ALL_TYPES,
            default: Constant.OFFER_APPLICABLE_TYPE.CUSTOM
        },

        customMode: {
            type: String,
            enum: Constant.OFFER_CUSTOM_MODE.ALL_TYPES,
            default: Constant.OFFER_CUSTOM_MODE.DESIGN
        },

        applicableTo: {
            category: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            }],
            subCategory: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            }],
            collections: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Collection"
            }],
            tags: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag"
            }]
        },

        status: {
            type: String,
            enum: Constant.OFFER_STATUS.ALL_TYPES,
            default: Constant.OFFER_STATUS.INACTIVE
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isDeleted: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true,
    }
);
/**
 * INDEXES
 */
// Admin lookup by code (only unique for non-deleted offers)
offerSchema.index({ code: 1 }, { unique: true, partialFilterExpression: { isDeleted: 0 } });

// Active offers
offerSchema.index({ isActive: 1 });

// Offer validity checks
offerSchema.index({
    isActive: 1,
    startDate: 1,
    endDate: 1,
    isDeleted: 1,
});

// Product price matching
offerSchema.index({
    'priceRange.from': 1,
    'priceRange.to': 1,
});

// Admin sorting
offerSchema.index({
    createdAt: -1,
});

/**
 * VALIDATIONS
 */
offerSchema.pre('validate', function () {
    if (this.priceRange.from > this.priceRange.to) {
        throw new Error(
            'priceRange.from cannot be greater than priceRange.to'
        );
    }

    if (this.startDate >= this.endDate) {
        throw new Error(
            'endDate must be greater than startDate'
        );
    }

    if (this.appliedOn === Constant.OFFER_APPLIED_ON.COMBINED) {
        // Combined offers use the per-component percentages, not discountValue.
        if (!(this.makingChargePercent > 0) && !(this.diamondPercent > 0)) {
            throw new Error('A combined offer needs a making-charge % or a diamond % greater than 0');
        }
        if (this.makingChargePercent > 100 || this.diamondPercent > 100) {
            throw new Error('Component percentages cannot exceed 100');
        }
    } else if (
        this.discountType?.toUpperCase() === 'PERCENTAGE' &&
        this.discountValue > 100
    ) {
        throw new Error(
            'Percentage discount cannot exceed 100'
        );
    }

});

export default mongoose.model('Offer', offerSchema);