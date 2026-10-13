import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const MetalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price_type: {
        type: String,
        required: true,
        enum: Constant.METAL_PRICE_TYPE.ALL_TYPES
    }, // gold, silver, platinum
    type: { type: String }, // Rose Gold, Yellow Gold, etc.
    stamp: { type: String }, // 18K, 14K, etc.
    purity: { type: Number, default: 1 }, // density
    color: { type: String },
    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE
    },
    price_per_gram: {
        type: Number,
        required: true
    },
    isDeleted: { type: Number, default: 0 },
    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true, versionKey: false });

export default mongoose.model("Metal", MetalSchema);