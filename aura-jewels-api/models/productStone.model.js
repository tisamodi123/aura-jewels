import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const productStoneSchema = new mongoose.Schema({
    itemCode: {
        type: String,
        trim: true
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductMaster"
    },

    type: {
        type: String, // CENTER / SIDE / GEM
        trim: true
    },

    stoneGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StoneGroup"
    },

    // Direct values from sheet
    pieces: Number,
    weight: Number, // Wgt
    totalCarat: Number,

    // Optional overrides (VERY IMPORTANT)
    shape: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },
    clarity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },
    size: String,
    origin: {
        type: String,
        trim: true
    },

    price: Number, // optional override

    lgdPrice: Number,
    naturalPrice: Number,

    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE
    },

    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId

}, { timestamps: true, versionKey: false });
// product StoneModel
productStoneSchema.index({ productId: 1 });
productStoneSchema.index({ itemCode: 1 });
productStoneSchema.index({ stoneGroup: 1 });
productStoneSchema.index({ productId: 1, type: 1 });

export default mongoose.model("ProductStone", productStoneSchema);