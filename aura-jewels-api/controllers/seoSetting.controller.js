import SeoSetting from "../models/seoSetting.model.js";

const getOrCreateSeoSetting = async () => {
    let cfg = await SeoSetting.findOne();
    if (!cfg) {
        cfg = await SeoSetting.create({
            search_engine_visibility: true,
            meta_title: "Aura Jewels | Handcrafted Luxury Jewellery",
            meta_description: ""
        });
    }
    return cfg;
};

// GET /api/admin/settings/seo
export const getSeoSetting = async (req, res) => {
    try {
        const cfg = await getOrCreateSeoSetting();
        return res.status(200).json({
            success: true,
            data: {
                search_engine_visibility: cfg.search_engine_visibility,
                meta_title: cfg.meta_title,
                meta_description: cfg.meta_description
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch SEO settings",
            error: error.message
        });
    }
};

// PUT / POST /api/admin/settings/seo
export const updateSeoSetting = async (req, res) => {
    try {
        const cfg = await getOrCreateSeoSetting();
        const b = req.body || {};

        if (b.search_engine_visibility !== undefined) {
            cfg.search_engine_visibility = b.search_engine_visibility === true || b.search_engine_visibility === "true";
        }
        if (b.meta_title !== undefined) {
            cfg.meta_title = String(b.meta_title || "");
        }
        if (b.meta_description !== undefined) {
            cfg.meta_description = String(b.meta_description || "");
        }

        await cfg.save();

        return res.status(200).json({
            success: true,
            message: "SEO settings updated successfully",
            data: {
                search_engine_visibility: cfg.search_engine_visibility,
                meta_title: cfg.meta_title,
                meta_description: cfg.meta_description
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update SEO settings",
            error: error.message
        });
    }
};

// GET /api/setting/seo-visibility (Public)
export const getPublicSeoSetting = async (req, res) => {
    try {
        const cfg = await SeoSetting.findOne().lean();
        const allow_indexing = cfg ? cfg.search_engine_visibility : true;
        return res.status(200).json({
            success: true,
            data: {
                allow_indexing
            }
        });
    } catch (error) {
        // Fallback to true if database fails
        return res.status(200).json({
            success: true,
            data: {
                allow_indexing: true
            }
        });
    }
};
