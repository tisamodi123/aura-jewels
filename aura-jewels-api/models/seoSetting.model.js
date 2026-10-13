import mongoose from "mongoose";

const seoSettingSchema = new mongoose.Schema(
    {
        search_engine_visibility: { type: Boolean, default: true },
        meta_title: { type: String, default: "Aura Jewels | Handcrafted Luxury Jewellery" },
        meta_description: { type: String, default: "" }
    },
    { timestamps: true }
);

export default mongoose.model("SeoSetting", seoSettingSchema);
