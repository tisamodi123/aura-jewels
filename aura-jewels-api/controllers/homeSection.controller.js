import {
    list_home_sections_db,
    get_home_section_by_key_db,
    update_home_section_db,
    get_home_payload_db,
    get_single_section_payload_db
} from "../services/homeSection.services.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import Category from "../models/category.model.js";
import CategoryLanding from "../models/categoryLanding.model.js";
import Product from "../models/product.model.js";
import HomeSection from "../models/homeSection.model.js";
import BaseURL from "../constants/baseUrl.js";
import Constant from "../constants/user.constant.js";
import { resolveAssetUrl } from "../utils/uploadPaths.js";
import { appendMediaUrls } from "../utils/imageUrl.js";
import { absolutizeImages, stripAssetImages, resolveRedirectHref } from "../utils/homeRedirect.js";
import { buildRedirectMaps } from "../utils/redirectMaps.js";


export const list_home_sections = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);
        const data = await list_home_sections_db();
        const resolvedData = data.map(sec => ({
            ...sec,
            content: absolutizeImages(sec.content, Baseurl)
        }));
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data: resolvedData
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_home_section_by_key = async (req, res) => {
    try {
        const section = await get_home_section_by_key_db(req.params.key);
        if (!section) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND
            });
        }
        const Baseurl = BaseURL(req);
        const resolvedSection = {
            ...section,
            content: absolutizeImages(section.content, Baseurl)
        };
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data: resolvedSection
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_home_section = async (req, res) => {
    try {
        if (req.body && req.body.content) {
            req.body.content = stripAssetImages(req.body.content);
        }
        const updated = await update_home_section_db(
            req.params.key,
            req.body,
            req.user?.userId
        );
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND
            });
        }
        // We resolve/absolutize the stripped filenames to absolute URLs before returning the response.
        // This is critical because the admin panel updates its React state with this returned object,
        // and needs absolute S3/local URLs to render the image previews correctly without breaking.
        const Baseurl = BaseURL(req);
        const resolvedUpdated = {
            ...updated,
            content: absolutizeImages(updated.content, Baseurl)
        };
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.UPDATED,
            data: resolvedUpdated
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Admin helper: upload a single CMS image and return its relative path.
// The admin UI calls this for each picked image, then submits the section
// content JSON with the returned paths as string fields.
export const upload_cms_image = async (req, res) => {
    try {
        const files = Array.isArray(req.files) ? req.files : [];
        if (files.length === 0) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.HOME_SECTION.IMAGE_REQUIRED
            });
        }
        const file = files[0];
        const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== 'true';

        const baseDir = file.destination?.split(/[\\/]/).slice(-2).join("/");
        const relativePath = `${baseDir || "uploads/cmsImages"}/${file.filename}`;
        const host = `${req.protocol}://${req.get("host")}`;
        const appUrl = process.env.APP_URL || "/";
        // const absoluteUrl = `${host}${appUrl}${relativePath}`.replace(/([^:])\/\/+/g, "$1/");
        const absoluteUrl = useAWS ? file.uploadedPath : `${host}${appUrl}${relativePath}`.replace(/([^:])\/\/+/g, "$1/");
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.HOME_SECTION.IMAGE_UPLOADED,
            data: { path: relativePath, url: absoluteUrl, filename: file.filename }
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Public — storefront consumes this to render the home page.
export const get_home_payload = async (req, res) => {
    try {
        const host = `${req.protocol}://${req.get("host")}`;
        const appUrl = process.env.APP_URL || "/";
        const assetBaseUrl = `${host}${appUrl}`.replace(/\/+$/, "");
        const data = await get_home_payload_db(assetBaseUrl);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Public — storefront gets the ordered list of enabled section keys.
// GET /home/order
export const get_home_sections_order = async (req, res) => {
    try {
        const sections = await HomeSection.find({ enabled: true })
            .sort({ sort: 1, key: 1 })
            .select("key")
            .lean();
        const order = sections.map(s => s.key);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data: order
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Public — storefront fetches one section at a time for progressive rendering.
// GET /home/section/:key
export const get_home_section_payload = async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Section key is required"
            });
        }
        const host = `${req.protocol}://${req.get("host")}`;
        const appUrl = process.env.APP_URL || "/";
        const assetBaseUrl = `${host}${appUrl}`.replace(/\/+$/, "");
        const data = await get_single_section_payload_db(key, assetBaseUrl);
        if (!data) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCategoryLandingPageData = async (req, res) => {
    try {
        const { categorySlug } = req.body;
        if (!categorySlug) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "categorySlug is required",
                data: null
            });
        }

        const category = await Category.findOne({ slug: categorySlug, isDeleted: 0 });
        if (!category) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Category not found",
                data: null
            });
        }

        const Baseurl = BaseURL(req);

        // Fetch all active landing page sections for this category + common ones
        const sections = await CategoryLanding.find({
            $or: [
                { CategoryId: category._id },
                { CategoryId: null },
                { CategoryId: { $exists: false } }
            ]
        }).sort({ CategoryId: -1, createdAt: -1 }).lean();

        const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== 'true';

        // Helper to format URLs to absolute paths
        const formatUrl = (path, isVideo = false) => {
            if (!path) return undefined;
            if (path.startsWith('http')) return path;
            if (useAWS) {
                const filename = path.split("/").pop();
                const uploadPath = process.env.AWS_UPLOAD_PATH;
                if (isVideo) {
                    return `${uploadPath}videos/${filename}`;
                }
                return `${uploadPath}website-assets/cms/${filename}`;
            }
            const defaultDir = isVideo ? "uploads/videos" : "uploads/cmsImages";
            return resolveAssetUrl(path, Baseurl, defaultDir);
        };

        // Group and map sections
        const formatted = sections.map((sec) => ({
            id: sec._id,
            position: sec.position,
            status: sec.status || Constant.STATUS.ACTIVE,
            title: sec.title || "",
            subTitle: sec.subTitle || "",
            description: sec.description || "",
            buttontext1: sec.buttontext1 || "",
            buttonlink1: sec.buttonlink1 || "",
            buttontext2: sec.buttontext2 || "",
            buttonlink2: sec.buttonlink2 || "",
            redirect1: sec.redirect1 || null,
            redirect2: sec.redirect2 || null,
            textposition: sec.textposition || "",
            image: formatUrl(sec.image, false),
            mobile_img: formatUrl(sec.mobile_img, false),
            video: formatUrl(sec.video, true),
            itemcode: sec.itemcode || []
        }));

        // Only serve ACTIVE sections to the storefront
        const activeSections = formatted.filter(s => s.status === Constant.STATUS.ACTIVE);

        // Resolve the structured CTA redirects (redirect1/redirect2) to absolute
        // hrefs in one batch, falling back to the legacy raw buttonlink string.
        const isReal = (r) => r && typeof r === "object" && r.type && r.type !== "none";
        const redirectMaps = await buildRedirectMaps(
            activeSections.flatMap((s) => [s.redirect1, s.redirect2]).filter(isReal)
        );
        const hrefOf = (redirect, fallback) => {
            if (isReal(redirect)) {
                const h = resolveRedirectHref(redirect, redirectMaps);
                if (h) return h;
            }
            return fallback || "";
        };

        // Storefront expects specific keys:
        const heroBanner = activeSections.find(s => s.position === "hero-banner");
        const exploreByStyleSection = activeSections.find(s => s.position === "explore-by-style");
        const promoGridTitle = activeSections.find(s => s.position === "double-promo-grid-title");
        const promoGrid = activeSections.filter(s => s.position === "double-promo-grid");
        const popularDesignsSection = activeSections.find(s => s.position === "popular-designs");
        const customCTA = activeSections.find(s => s.position === "custom-cta");
        const featuredCollection = activeSections.find(s => s.position === "featured-collection");
        const wordsOfTrust = activeSections.filter(s => s.position === "words-of-trust");
        // Fetch subcategories for the style grid
        const subcats = await Category.find({
            status: Constant.STATUS.ACTIVE,
            isDeleted: 0,
            parentCategoryId: category._id
        }).sort({ sort: 1, categoryName: 1 }).lean();

        const subCategoryStyles = subcats.map(sub => ({
            _id: sub._id,
            categoryName: sub.categoryName,
            slug: sub.slug,
            image: resolveAssetUrl(sub.image, Baseurl, "uploads/categoryImages")
        }));

        const exploreByStyleData = exploreByStyleSection ? {
            styles: subCategoryStyles,
            paraTypeName: exploreByStyleSection.title || category.categoryName,
            subtitle: exploreByStyleSection.subTitle || "",
            description: exploreByStyleSection.description || ""
        } : null;

        // Fetch popular design products if itemcode is defined
        let popularDesigns = [];
        if (popularDesignsSection) {
            popularDesigns = await Product.aggregate([
                {
                    $match: {
                        isDeleted: 0,
                        status: Constant.PRODUCT_STATUS.AVALIABLE,
                        categoryId: category._id,
                        parentItemCode: ""
                    }
                },
                { $sort: { createdAt: -1 } },
                { $limit: 4 },
                {
                    $lookup: {
                        from: "metals",
                        localField: "metalId",
                        foreignField: "_id",
                        as: "metalDetails"
                    }
                },
                { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "productmasters",
                        let: {
                            itemCode: "$itemCode",
                            parentCode: "$parentItemCode"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            { $eq: ["$itemCode", "$$itemCode"] },
                                            { $eq: ["$parentItemCode", "$$itemCode"] },
                                            {
                                                $and: [
                                                    { $ne: ["$$parentCode", ""] },
                                                    { $ne: ["$$parentCode", null] },
                                                    { $eq: ["$parentItemCode", "$$parentCode"] }
                                                ]
                                            },
                                            {
                                                $and: [
                                                    { $ne: ["$$parentCode", ""] },
                                                    { $ne: ["$$parentCode", null] },
                                                    { $eq: ["$itemCode", "$$parentCode"] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $match: {
                                    isDeleted: 0,
                                    status: Constant.PRODUCT_STATUS.AVALIABLE
                                }
                            },
                            {
                                $lookup: {
                                    from: "metals",
                                    localField: "metalId",
                                    foreignField: "_id",
                                    as: "metalDetails"
                                }
                            },
                            { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
                            appendMediaUrls(),
                            {
                                $project: {
                                    _id: 1,
                                    itemCode: 1,
                                    parentItemCode: 1,
                                    productTitle: 1,
                                    images: 1,
                                    slug: 1,
                                    finalPrice: 1,
                                    metalTypeDetail: {
                                        _id: "$metalDetails._id",
                                        metalName: "$metalDetails.type",
                                        colorCode: "$metalDetails.color"
                                    },
                                    metalStampDetail: {
                                        _id: "$metalDetails._id",
                                        karat: "$metalDetails.stamp"
                                    }
                                }
                            }
                        ],
                        as: "variants"
                    }
                },
                appendMediaUrls(),
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        slug: 1,
                        images: 1,
                        itemCode: 1,
                        finalPrice: 1,
                        appxMetalWgt: 1,
                        parentItemCode: 1,
                        metalTypeDetail: {
                            _id: "$metalDetails._id",
                            metalName: "$metalDetails.type",
                            colorCode: "$metalDetails.color"
                        },
                        metalStampDetail: {
                            _id: "$metalDetails._id",
                            karat: "$metalDetails.stamp"
                        },
                        variants: 1
                    }
                }
            ]);
        }

        const data = {
            heroBanner: heroBanner ? {
                title: heroBanner.title,
                subtitle: heroBanner.subTitle,
                description: heroBanner.description,
                btnText1: heroBanner.buttontext1,
                btnLink1: hrefOf(heroBanner.redirect1, heroBanner.buttonlink1),
                btnText2: heroBanner.buttontext2,
                btnLink2: hrefOf(heroBanner.redirect2, heroBanner.buttonlink2),
                textposition: heroBanner.textposition,
                image: heroBanner.image,
                mobile_img: heroBanner.mobile_img,
                video: heroBanner.video,
                status: heroBanner.status
            } : null,
            exploreByStyle: exploreByStyleData ? {
                ...exploreByStyleData,
                status: exploreByStyleSection?.status
            } : null,
            promoGridTitle: promoGridTitle ? {
                title: promoGridTitle.title,
                subtitle: promoGridTitle.subTitle,
                description: promoGridTitle.description,
                status: promoGridTitle.status
            } : null,
            promoGrid: promoGrid.map(item => ({
                id: item.id,
                title: item.title,
                subtitle: item.subTitle,
                description: item.description,
                image: item.image,
                btnText1: item.buttontext1,
                btnLink1: hrefOf(item.redirect1, item.buttonlink1),
                textposition: item.textposition,
                status: item.status
            })),
            popularDesigns: popularDesigns,
            // Editorial heading/subtext for the Popular Designs section (products
            // come from `popularDesigns`). Lets the CMS control the heading.
            popularDesignsInfo: popularDesignsSection ? {
                title: popularDesignsSection.title,
                subtitle: popularDesignsSection.subTitle,
                description: popularDesignsSection.description,
                status: popularDesignsSection.status
            } : null,
            customCTA: customCTA ? {
                title: customCTA.title,
                subtitle: customCTA.subTitle,
                description: customCTA.description,
                btnText1: customCTA.buttontext1,
                btnLink1: hrefOf(customCTA.redirect1, customCTA.buttonlink1),
                image: customCTA.image,
                status: customCTA.status
            } : null,
            // Featured Collection — previously saved in the CMS but never served.
            featured: featuredCollection ? {
                title: featuredCollection.title,
                subtitle: featuredCollection.subTitle,
                description: featuredCollection.description,
                btnText1: featuredCollection.buttontext1,
                btnLink1: hrefOf(featuredCollection.redirect1, featuredCollection.buttonlink1),
                btnText2: featuredCollection.buttontext2,
                btnLink2: hrefOf(featuredCollection.redirect2, featuredCollection.buttonlink2),
                image: featuredCollection.image,
                status: featuredCollection.status
            } : null,
            wordsOfTrust: wordsOfTrust.map(item => ({
                id: item.id,
                title: item.title,
                subtitle: item.subTitle,
                description: item.description,
                image: item.image,
                status: item.status
            }))
        };

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data
        });
    } catch (error) {
        console.error("getCategoryLandingPageData error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
