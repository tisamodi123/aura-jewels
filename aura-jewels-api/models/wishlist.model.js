import mongoose from "mongoose";
const wishlistSchema = new mongoose.Schema({
    jeweleryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductMaster"
    },
    engraving: {
        type: Number,
        trim: true
    },
    engravingText: {
        type: String,
        trim: true
    },
    qty: {
        type: Number,
        trim: true
    },
    price: {
        type: String,
        trim: true
    },
    // Selected center-stone quality/origin — so the wishlist shows/prices the
    // exact variant the customer picked (natural vs lab, color/clarity).
    origin: { type: String, trim: true, default: null },
    color: { type: String, trim: true, default: null },
    clarity: { type: String, trim: true, default: null },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sizes"
    },
    checkoutCurrency: {
        type: String,
        default: "INR"
    },
    isDeleted: {
        type: Number,
        trim: true,
        default: 0,
    },
    isReminderSent: {
        type: Boolean,
        default: false,
    },
}, { versionKey: false, timestamps: true });

export default mongoose.model("Wishlist", wishlistSchema)