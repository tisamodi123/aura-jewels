import mongoose from "mongoose";

// One record per coupon redemption. Enables per-user usage limits and
// reversal on order cancel/return. `status` flips to "reversed" (rather than
// deleting) so we keep an audit trail.
const couponUsageSchema = new mongoose.Schema(
    {
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        code: { type: String, trim: true, uppercase: true },
        discountAmount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["applied", "reversed"],
            default: "applied",
            index: true
        }
    },
    { timestamps: true, versionKey: false }
);

couponUsageSchema.index({ couponId: 1, userId: 1, status: 1 });
couponUsageSchema.index({ orderId: 1 });

export default mongoose.model("CouponUsage", couponUsageSchema);
