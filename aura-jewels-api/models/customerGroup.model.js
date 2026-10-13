import mongoose from "mongoose";

const customerGroupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    discountPercent: { type: Number, default: 0 },
    description: { type: String },

    isDeleted: { type: Number, default: 0 },

    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId

}, { timestamps: true, versionKey: false });

export default mongoose.model("CustomerGroup", customerGroupSchema);