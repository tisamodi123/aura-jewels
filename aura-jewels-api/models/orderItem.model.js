import mongoose from "mongoose";
import constants from "../constants/user.constant.js";

const OrderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductMaster',
        required: true
    },
    productDetails: { type: Object },
    diamondDetails: { type: Object },

    // The centre-stone selection the customer actually bought, snapshotted at
    // order time. `null` means they took the product's default grade.
    //
    // Without these the order record could not distinguish a Natural purchase
    // from a Lab Grown one — only the price differed, and nothing said why. That
    // becomes actively dangerous once the cart can hold both at once.
    origin: { type: String, trim: true, default: null },
    color: { type: String, trim: true, default: null },
    clarity: { type: String, trim: true, default: null },

    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sizes'
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: constants.ORDER_STATUS.ALL_TYPES,
        default: constants.ORDER_STATUS.PENDING
    },
    // Immutable proportional share of the order-level coupon discount allocated
    // to this line at placement (INR, for the whole line incl. qty). The refund
    // for a cancelled/returned line and the recomputed order total both subtract
    // this, so the customer is never refunded a discount they didn't pay.
    couponDiscountShare: { type: Number, default: 0 },
    refundDetails: {
        refundType: { type: String, enum: constants.REFUND_METHODS.ALL_TYPES, default: constants.REFUND_METHODS.NONE },
        amount: { type: Number, default: 0 },
        walletCredited: { type: Boolean, default: false },
        gatewayRefundId: { type: String, default: "" },
        accountHolderName: { type: String, default: "" },
        bankName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
        refundRemarks: { type: String, default: "" },
        refundedAt: { type: Date, default: null },

        // Cancellation and Return specific details
        requestedAt: { type: Date, default: null },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        approvedAt: { type: Date, default: null },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        cancellationReason: { type: String, default: "" },
        chargePercentage: { type: Number, default: 0 },
        chargeAmount: { type: Number, default: 0 },
        refundStatus: {
            type: String,
            enum: constants.REFUND_STATUS.ALL_TYPES,
            default: constants.REFUND_STATUS.PENDING
        }
    },
    approvedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    lastDayToCancel: { type: Date, default: null },
    lastDayToReturn: { type: Date, default: null },
}, {
    timestamps: true
});

OrderItemSchema.index({ productId: 1 });
OrderItemSchema.index({ sizeId: 1 });
OrderItemSchema.index({ productId: 1, sizeId: 1 });

export default mongoose.model('OrderItem', OrderItemSchema);
