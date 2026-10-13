import mongoose from "mongoose";
import constants from "../constants/user.constant.js";

const RefundTransactionSchema = new mongoose.Schema({
    refundNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Items included in this refund transaction
    items: [{
        orderItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        couponDiscountShare: { type: Number, default: 0 },
        refundAmount: { type: Number, required: true }
    }],
    
    // Financial Summary
    subTotal: { type: Number, required: true }, // Sum of items' prices being refunded
    chargePercentage: { type: Number, default: 0 },
    chargeAmount: { type: Number, default: 0 },
    totalRefundAmount: { type: Number, required: true }, // Net refund sent to customer
    
    refundType: {
        type: String,
        enum: constants.REFUND_METHODS.ALL_TYPES,
        required: true
    },
    
    refundStatus: {
        type: String,
        enum: constants.REFUND_STATUS.ALL_TYPES,
        default: constants.REFUND_STATUS.PENDING
    },
    
    // Gateway-specific info
    gatewayRefundId: { type: String, default: "" },
    walletCredited: { type: Boolean, default: false },
    
    // Bank-specific info (if refundType is bank)
    bankDetails: {
        accountHolderName: { type: String, default: "" },
        bankName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" }
    },
    
    // Cancellation/Return info
    reason: { type: String, default: "" }, // Customer reason
    remarks: { type: String, default: "" }, // Admin remarks
    
    // Audit logs
    requestedAt: { type: Date, default: Date.now },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    refundedAt: { type: Date, default: null }
}, {
    timestamps: true
});

export default mongoose.model("RefundTransaction", RefundTransactionSchema);
