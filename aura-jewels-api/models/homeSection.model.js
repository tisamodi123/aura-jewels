import mongoose from "mongoose";
import { HOME_SECTION_KEY_LIST } from "../constants/homeSection.constant.js";

const HomeSectionSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            enum: HOME_SECTION_KEY_LIST
        },
        title: { type: String, default: "" },
        enabled: { type: Boolean, default: true },
        content: { type: mongoose.Schema.Types.Mixed, default: {} },
        sort: { type: Number, default: 0 },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },
    { timestamps: true, versionKey: false }
);

// HomeSectionSchema.index({ key: 1 });

export default mongoose.model("HomeSection", HomeSectionSchema);
