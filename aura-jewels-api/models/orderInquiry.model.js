import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const orderInquirySchema = new mongoose.Schema(
    {
        // ── Product reference ─────────────────────────────────────────────
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductMaster",
            index: true,
            required: true
        },

        sku: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            maxlength: 200
        },
        countryCode: {
            type: String,
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 20
        },

        notes: {
            type: String,
            trim: true,
            default: "",
            maxlength: 1000
        },

        status: {
            type: String,
            enum: Constant.INQUIRY_STATUS.ALL_TYPES,
            default: Constant.INQUIRY_STATUS.NEW
        },

        /**
         * Admin notes / internal follow-up remarks.
         * Visible only to the admin team, not exposed to the customer.
         */
        adminNotes: {
            type: String,
            trim: true,
            default: ""
        },

        /**
         * Timestamp when the admin first contacted the customer.
         * Set automatically when status is changed to CONTACTED.
         */
        contactedAt: {
            type: Date,
            default: null
        },

        /**
         * Timestamp when the inquiry was resolved / completed.
         * Set automatically when status is changed to COMPLETED.
         */
        resolvedAt: {
            type: Date,
            default: null
        },

        /**
         * Soft-delete flag (0 = active, 1 = deleted).
         * Kept as Number to match the rest of the project's convention.
         */
        isDeleted: {
            type: Number,
            default: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true,  // createdAt, updatedAt
        versionKey: false
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Primary admin list: non-deleted, most recent first
orderInquirySchema.index({ isDeleted: 1, createdAt: -1 });

// Filter by status inside admin list
orderInquirySchema.index({ isDeleted: 1, status: 1, createdAt: -1 });

// Product-specific inquiry lookup
orderInquirySchema.index({ productId: 1, isDeleted: 1 });
orderInquirySchema.index({ sku: 1, isDeleted: 1 });

// Customer lookup (by email, across multiple inquiries)
orderInquirySchema.index({ email: 1, isDeleted: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Automatically populate contactedAt / resolvedAt timestamps
 * whenever the status is changed via findOneAndUpdate or save.
 */
orderInquirySchema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate();
    const newStatus = update?.status ?? update?.$set?.status;

    if (newStatus === Constant.INQUIRY_STATUS.CONTACTED) {
        this.set({ contactedAt: new Date() });
    }

    if (newStatus === Constant.INQUIRY_STATUS.COMPLETED) {
        this.set({ resolvedAt: new Date() });
    }
});

orderInquirySchema.pre("save", function () {
    if (this.isModified("status")) {
        if (this.status === Constant.INQUIRY_STATUS.CONTACTED && !this.contactedAt) {
            this.contactedAt = new Date();
        }
        if (this.status === Constant.INQUIRY_STATUS.COMPLETED && !this.resolvedAt) {
            this.resolvedAt = new Date();
        }
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────────────────────

export default mongoose.model("OrderInquiry", orderInquirySchema);
