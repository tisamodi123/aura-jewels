// Order Collection Schema
// _id 
// user 
// items : [orderItems]
// total
// timestamps
// created By, 
// updated By , 
// status
// creator Ip, 
// updator Ip, 
// isDelete


// Order Collection Schema (Mongoose)

import mongoose from "mongoose";
import constants from "../constants/user.constant.js";

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        orderId: {
            type: String,
            required: true,
            unique: true,
        },

        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "OrderItem",
            }
        ],

        shippingAddress: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            address: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true },
            zipCode: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },

        billingAddress: {
            firstName: { type: String },
            lastName: { type: String },
            address: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            zipCode: { type: String },
            email: { type: String },
            phone: { type: String },
        },

        hasBilling: {
            type: Boolean,
            default: false,
        },

        // Sum of line items before any coupon discount (base currency, INR).
        subTotal: {
            type: Number,
            default: 0,
        },

        gstNo: {
            type: String,
        },

        companyName: {
            type: String,
        },

        // Applied coupon (null when none). discountAmount is in base currency.
        coupon: {
            couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
            code: { type: String, default: null },
            discountAmount: { type: Number, default: 0 },
        },

        // Net payable after discount (base currency, INR).
        total: {
            type: Number,
            required: true,
            default: 0,
        },

        baseCurrency: {
            type: String,
            default: "INR",
            required: true,
        },

        displayCurrency: {
            type: String,
            default: "INR",
            required: true,
        },

        exchangeRate: {
            type: Number,
            default: 1.0,
            required: true,
        },

        baseAmount: {
            type: Number,
            default: 0,
            required: true,
        },

        paidAmount: {
            type: Number,
            default: 0,
            required: true,
        },

        // Sales tax (GST). Prices are tax-EXCLUSIVE, so this is ADDED on top of
        // the post-coupon net. Snapshotted per order so a later change to the
        // rate never rewrites history on an already-placed order.
        //   taxableAmount = subTotal - coupon discount
        //   taxAmount     = taxableAmount * taxRate
        //   total         = taxableAmount + taxAmount   (the gross)
        // Zero on export orders, which are shipped tax-exclusive.
        taxableAmount: {
            type: Number,
            default: 0,
        },
        taxRate: {
            type: Number,
            default: 0,   // e.g. 0.03
        },
        taxAmount: {
            type: Number,
            default: 0,
        },

        // Portion of the order total settled from the customer's store wallet
        // (INR). `amountDue` is the remaining payable once wallet is applied.
        walletUsed: {
            type: Number,
            default: 0,
        },
        amountDue: {
            type: Number,
            default: 0,
        },

        // Payment gateway details (Razorpay now, CCAvenue later). Populated when
        // the checkout session is created and again when payment is confirmed.
        payment: {
            provider: { type: String, default: "" },
            gatewayOrderId: { type: String, default: "" },   // e.g. razorpay order_id
            gatewayPaymentId: { type: String, default: "" },  // e.g. razorpay payment_id
            signature: { type: String, default: "" },
            method: { type: String, default: "" },            // card / upi / netbanking …
            paymentLinkId: { type: String, default: "" },
            capturedAt: { type: Date, default: null },
        },

        status: {
            type: String,
            enum: constants.ORDER_STATUS.ALL_TYPES,
            default: constants.ORDER_STATUS.PENDING,
        },

        // Set when payment succeeded but a deferred benefit could not be applied
        // at finalize (e.g. the store-wallet balance was already spent, or the
        // coupon's usage limit was reached between placement and payment). The
        // order is genuinely PAID; this flags it for the admin to reconcile so
        // an unbacked discount is never silently absorbed as a loss.
        settlementReview: {
            needed: { type: Boolean, default: false },
            walletSettled: { type: Boolean, default: true },
            couponHonored: { type: Boolean, default: true },
            reason: { type: String, default: "" },
        },

        paymentStatus: {
            type: String,
            enum: constants.PAYMENT_STATUS.ALL_TYPES,
            default: constants.PAYMENT_STATUS.PENDING,
            required: true,
        },

        trackingNumber: {
            type: String,
            default: "",
        },

        shippingCarrier: {
            type: String,
            default: "",
        },

        trackingUrl: {
            type: String,
            default: "",
        },

        invoiceUrl: {
            type: String,
            default: "",
        },

        receipts: [
            {
                type: {
                    type: String,
                    enum: constants.RECEIPT_TYPES.ALL_TYPES,
                    default: constants.RECEIPT_TYPES.RECEIPT,
                },
                fileName: { type: String, default: "" }
            }
        ],

        estimatedDeliveryDate: {
            type: Date,
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        creatorIp: {
            type: String,
            default: "",
        },

        updatorIp: {
            type: String,
            default: "",
        },

        notes: {
            type: String,
            default: "",
        },

        isDelete: {
            type: Boolean,
            default: false,
        },
        refundDetails: {
            refundType: { type: String, enum: constants.REFUND_METHODS.ALL_TYPES, default: constants.REFUND_METHODS.NONE },
            // Amount actually refunded (INR). For wallet refunds this is credited
            // to the customer's store wallet; `walletCredited` guards against
            // double-crediting on repeated saves. `gatewayRefundId` is set when
            // the refund is pushed back to the original payment source.
            amount: { type: Number, default: 0 },
            walletCredited: { type: Boolean, default: false },
            gatewayRefundId: { type: String, default: "" },
            accountHolderName: { type: String, default: "" },
            bankName: { type: String, default: "" },
            accountNumber: { type: String, default: "" },
            ifscCode: { type: String, default: "" },
            refundRemarks: { type: String, default: "" },
            refundedAt: { type: Date, default: null }
        },
        approvedAt: { type: Date, default: null },
        cancelledAt: { type: Date, default: null },
        returnedAt: { type: Date, default: null },
        shippedAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
        lastDayToCancel: { type: Date, default: null },
        lastDayToReturn: { type: Date, default: null },
        isGuest: {
            type: Boolean,
            default: false,
        },
        userAgent: {
            type: String,
            default: "",
        },
        fbc: {
            type: String,
            default: "",
        },
        fbp: {
            type: String,
            default: "",
        },
        externalId: {
            type: String,
            default: "",
        },
        metaEventSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ user: 1, status: 1, createdAt: -1 });

OrderSchema.index({ "shippingAddress.email": 1 });
OrderSchema.index({ "shippingAddress.phone": 1 });

export default mongoose.model("Order", OrderSchema);