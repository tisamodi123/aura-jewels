import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
    jeweleryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductMaster"
    },
    // diamondId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "DiamondMaster"
    // },
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
        default: 1,
        min: 1
    },
    // without_discount_jeweleryprice: {
    //     type: String,
    //     trim: true
    // },
    // jeweleryprice: {
    //     type: String,
    //     trim: true
    // },
    // diamondprice: {
    //     type: String,
    //     trim: true
    // },
    // price: {
    //     type: Number,
    //     trim: true
    // },
    // totalPrice: {
    //     type: Number,
    //     trim: true
    // },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sizes"
    },
    // Selected center-stone quality/origin (H3) — so the cart reprices the exact
    // variant the customer saw on the PDP (natural vs lab, color/clarity), instead
    // of falling back to the product's default (lab) price.
    origin: { type: String, trim: true, default: null },
    color: { type: String, trim: true, default: null },
    clarity: { type: String, trim: true, default: null },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    checkoutCurrency: {
        type: String,
        default: "INR"
    },
    exchangeRateUsed: {
        type: Number,
        default: 1.0
    },
    lockedDisplayPrice: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Number,
        trim: true,
        default: 0,
    },
}, { versionKey: false, timestamps: true });

export default mongoose.model("Cart", cartSchema)

// without_discount_jeweleryprice = MRP (before discount)
// jeweleryprice = discounted price
// price = final payable price (per item)