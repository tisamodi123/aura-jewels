import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            maxlength: 50
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        image: {
            type: String,
            default: ""
        },

        imageMobile: {
            type: String,
            default: ""
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        priceRange: {
            from: {
                type: Number,
                required: true,
                min: 0,
                default: 0
            },
            // Optional upper cap. null / 0 means "no maximum" (min-only coupon).
            to: {
                type: Number,
                min: 0,
                default: null
            }
        },

        discountType: {
            type: String,
            required: true,
            enum: Constant.COUPON_DISCOUNT_TYPE.ALL_TYPES // 'percentage', 'absolute', 'combined'
        },

        // What the discount applies to (mirrors offers). Default "total" keeps every
        // existing coupon behaving exactly as before (a % / flat on the subtotal).
        //   total | diamond | making charge | combined
        appliedOn: {
            type: String,
            enum: Constant.COUPON_APPLIED_ON.ALL_TYPES,
            default: Constant.COUPON_APPLIED_ON.TOTAL
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0
        },

        // Used when appliedOn === "combined" (or legacy discountType === "combined"):
        // a separate % on the cart's total making charge and total diamond value.
        // discountValue is ignored in that mode.
        makingChargePercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        diamondPercent: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        maxDiscountAmount: {
            type: Number,
            min: 0,
            default: null
        },

        // Usage limits. null / 0 = unlimited.
        usageLimit: {
            type: Number,
            default: null
        },
        perUserLimit: {
            type: Number,
            default: null
        },
        firstOrderOnly: {
            type: Boolean,
            default: false
        },
        // Total confirmed redemptions (incremented on order placement,
        // decremented on cancel/return). Source of truth = CouponUsage docs.
        usedCount: {
            type: Number,
            default: 0
        },

        couponType: {
            type: String,
            required: true,
            enum: Constant.COUPON_TYPE.ALL_TYPES,
            default: Constant.COUPON_TYPE.PUBLIC
        },

        // Target list of users when couponType is 'assigneeOnly'
        assignees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        status: {
            type: String,
            enum: Constant.COUPON_STATUS.ALL_TYPES,
            default: Constant.COUPON_STATUS.INACTIVE
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isDeleted: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/**
 * INDEXES
 */

couponSchema.index({ code: 1 }, { unique: true, partialFilterExpression: { isDeleted: 0 } });
couponSchema.index({ isActive: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1, isDeleted: 1 });
couponSchema.index({ couponType: 1, status: 1 });
couponSchema.index({ assignees: 1 });

/**
 * VALIDATIONS
 */
couponSchema.pre("validate", function () {
    // Only enforce from<=to when an upper cap is actually set.
    if (this.priceRange?.to && this.priceRange.from > this.priceRange.to) {
        throw new Error("priceRange.from cannot be greater than priceRange.to");
    }

    if (this.startDate > this.endDate) {
        throw new Error("endDate must be greater than or equal to startDate");
    }

    // "combined" may be expressed via the new appliedOn or the legacy discountType.
    const isCombined = this.appliedOn === Constant.COUPON_APPLIED_ON.COMBINED
        || this.discountType === Constant.COUPON_DISCOUNT_TYPE.COMBINED;

    if (!isCombined && this.discountType?.toLowerCase() === "percentage" && this.discountValue > 100) {
        throw new Error("Percentage discount cannot exceed 100");
    }

    if (isCombined) {
        if (!(this.makingChargePercent > 0) && !(this.diamondPercent > 0)) {
            throw new Error("A combined coupon needs a making-charge % or a diamond % greater than 0");
        }
        if (this.makingChargePercent > 100 || this.diamondPercent > 100) {
            throw new Error("Component percentages cannot exceed 100");
        }
    }

    if (this.couponType === Constant.COUPON_TYPE.ASSIGNEE_ONLY && (!this.assignees || this.assignees.length === 0)) {
        throw new Error("assignees list is required when couponType is assigneeOnly");
    }
});

export default mongoose.model("Coupon", couponSchema);
