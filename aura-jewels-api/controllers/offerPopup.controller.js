import OfferPopup from "../models/offerPopup.model.js";
import BaseURL from "../constants/baseUrl.js";
import { resolveAssetUrl } from "../utils/uploadPaths.js";

// Single config document; created lazily on first access.
const getOrCreate = async () => {
    let cfg = await OfferPopup.findOne();
    if (!cfg) cfg = await OfferPopup.create({});
    return cfg;
};

// Turn a stored image reference (a CMS upload path/filename, or an already
// absolute URL) into an absolute URL the storefront can render.
const absolutize = (value, req) =>
    value ? (resolveAssetUrl(value, BaseURL(req), "uploads/cmsImages") || "") : "";

// GET /setting/offer-popup (admin) — raw stored values for the edit form.
export const getOfferPopup = async (req, res) => {
    try {
        const cfg = await getOrCreate();
        return res.status(200).json({
            errorCode: 200,
            data: {
                enabled: cfg.enabled,
                desktopImage: cfg.desktopImage,
                mobileImage: cfg.mobileImage,
                linkUrl: cfg.linkUrl,
            },
        });
    } catch (error) {
        return res.status(500).json({ errorCode: 500, message: error.message });
    }
};

// PUT /setting/offer-popup (admin) — upsert the single config.
export const updateOfferPopup = async (req, res) => {
    try {
        const cfg = await getOrCreate();
        const b = req.body || {};
        if (b.desktopImage !== undefined) cfg.desktopImage = String(b.desktopImage || "");
        if (b.mobileImage !== undefined) cfg.mobileImage = String(b.mobileImage || "");
        if (b.linkUrl !== undefined) cfg.linkUrl = String(b.linkUrl || "").trim();
        if (b.enabled !== undefined) cfg.enabled = b.enabled === true || b.enabled === "true";
        await cfg.save();
        return res.status(200).json({ errorCode: 200, message: "Offer popup updated" });
    } catch (error) {
        return res.status(500).json({ errorCode: 500, message: error.message });
    }
};

// GET /app/home/offer-popup (PUBLIC) — what the storefront needs to render the
// popup. Returns enabled:false (and no images) unless it is on AND has an image,
// so the client can decide with a single check. Image URLs are absolutised.
export const getPublicOfferPopup = async (req, res) => {
    try {
        const cfg = await OfferPopup.findOne().lean();
        const desktopImage = absolutize(cfg?.desktopImage, req);
        const mobileImage = absolutize(cfg?.mobileImage, req);
        const enabled = !!cfg?.enabled && !!(desktopImage || mobileImage);
        return res.status(200).json({
            errorCode: 200,
            data: {
                enabled,
                desktopImage,
                mobileImage,
                linkUrl: cfg?.linkUrl || "",
            },
        });
    } catch (error) {
        // Never break the homepage for a popup — fail closed (no popup).
        return res.status(200).json({ errorCode: 200, data: { enabled: false, desktopImage: "", mobileImage: "", linkUrl: "" } });
    }
};
