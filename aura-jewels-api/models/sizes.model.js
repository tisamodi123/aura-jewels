import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const sizeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    code: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    weight_multipler: { type: Number, default: 1 },
    description: { type: String, default: "" },
    sort: { type: Number, default: 0 },
    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE
    },
    isDeleted: {
        type: Number,
        default: 0
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId }

}, { timestamps: true, versionKey: false });

export default mongoose.model("Sizes", sizeSchema);
