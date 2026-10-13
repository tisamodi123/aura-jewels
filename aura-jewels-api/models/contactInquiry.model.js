import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

// Submissions from the storefront "Get in Touch" page. Distinct from
// OrderInquiry, which is always tied to a product SKU — a contact message has
// no product and carries a free-text subject instead.
const contactInquirySchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            maxlength: 200
        },

        subject: {
            type: String,
            required: true,
            enum: Constant.CONTACT_SUBJECT.ALL_TYPES,
            default: Constant.CONTACT_SUBJECT.GENERAL_QUESTION
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        status: {
            type: String,
            enum: Constant.INQUIRY_STATUS.ALL_TYPES,
            default: Constant.INQUIRY_STATUS.NEW
        },

        /** Internal follow-up remarks. Never exposed to the customer. */
        adminNotes: {
            type: String,
            trim: true,
            default: ""
        },

        /** Set automatically when status flips to CONTACTED. */
        contactedAt: {
            type: Date,
            default: null
        },

        /** Set automatically when status flips to COMPLETED. */
        resolvedAt: {
            type: Date,
            default: null
        },

        /** Soft-delete flag (0 = active, 1 = deleted) — Number, per project convention. */
        isDeleted: {
            type: Number,
            default: 0
        }
        // No `createdBy`: the form is public and there is no optional-auth
        // middleware, so it could only ever be null. Admins match a message to
        // an account by email.
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Primary admin list: non-deleted, most recent first
contactInquirySchema.index({ isDeleted: 1, createdAt: -1 });

// Filter by status / subject inside the admin list
contactInquirySchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
contactInquirySchema.index({ isDeleted: 1, subject: 1, createdAt: -1 });

// Look up every message from one person
contactInquirySchema.index({ email: 1, isDeleted: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Stamp contactedAt / resolvedAt when the status changes. Mongoose 9 removed
// `next` from pre-hooks, so these take no argument.
contactInquirySchema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate();
    const newStatus = update?.status ?? update?.$set?.status;

    if (newStatus === Constant.INQUIRY_STATUS.CONTACTED) {
        this.set({ contactedAt: new Date() });
    }

    if (newStatus === Constant.INQUIRY_STATUS.COMPLETED) {
        this.set({ resolvedAt: new Date() });
    }
});

contactInquirySchema.pre("save", function () {
    if (this.isModified("status")) {
        if (this.status === Constant.INQUIRY_STATUS.CONTACTED && !this.contactedAt) {
            this.contactedAt = new Date();
        }
        if (this.status === Constant.INQUIRY_STATUS.COMPLETED && !this.resolvedAt) {
            this.resolvedAt = new Date();
        }
    }
});

export default mongoose.model("ContactInquiry", contactInquirySchema);
