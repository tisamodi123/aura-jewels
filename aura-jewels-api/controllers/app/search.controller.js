import categoryModel from "../../models/category.model.js";
import collectionModel from "../../models/collection.model.js";
import ProductMaster from "../../models/product.model.js";
import Tag from "../../models/tag.model.js";
import Constant from "../../constants/user.constant.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";
import { getExchangeRateFromRequest, adjustPricesForCurrency } from "../../utils/currencyConvertor.js";
import Offer from "../../models/offer.model.js";
import { resolveBestOfferForProduct } from "../../services/offerCalculation.services.js";

const rateLimitMap = new Map();

const isRateLimited = (ip, limit = 20, windowMs = 60000) => {
    const now = Date.now();
    const clientData = rateLimitMap.get(ip);

    if (!clientData) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return false;
    }

    if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
        return false;
    }

    clientData.count += 1;
    return clientData.count > limit;
};

const TOO_MANY_REQUESTS_MESSAGE = "Too many requests. Please try again after some time.";

export const searchCategoriesAndCollections = async (req, res) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        if (isRateLimited(ip, 30, 60000)) {
            return res.status(STATUS_CODE.TOO_MANY_REQUESTS).json({
                errorCode: STATUS_CODE.TOO_MANY_REQUESTS,
                message: TOO_MANY_REQUESTS_MESSAGE
            });
        }

        const rawQuery = String(req.query.query || "").trim();

        // Empty query → return all active categories/collections so the
        // search modal can pre-populate them when opened. Capped at 20 each
        // to keep the response small. `$ne: 1` matches legacy docs that
        // were imported before the soft-delete flag existed — using
        // `isDeleted: 0` would hide them.
        const baseCategoryFilter = { isDeleted: { $ne: 1 }, status: Constant.STATUS.ACTIVE };
        const baseCollectionFilter = { status: Constant.STATUS.ACTIVE };

        let categoryFilter = baseCategoryFilter;
        let collectionFilter = baseCollectionFilter;

        if (rawQuery) {
            const escapeRegex = (value) =>
                value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const safeQuery = escapeRegex(rawQuery);
            const searchRegex = new RegExp(safeQuery, "i");

            categoryFilter = {
                ...baseCategoryFilter,
                $or: [{ categoryName: searchRegex }, { slug: searchRegex }]
            };
            collectionFilter = {
                ...baseCollectionFilter,
                $or: [{ collectionName: searchRegex }, { slug: searchRegex }]
            };
        }

        const [categories, collections] = await Promise.all([
            categoryModel.find(categoryFilter)
                .select("_id categoryName slug parentCategoryId image")
                .sort({ sort: 1, categoryName: 1 })
                .limit(20)
                .lean(),

            collectionModel.find(collectionFilter)
                .select("_id collectionName slug image")
                .sort({ collectionName: 1 })
                .limit(20)
                .lean()
        ]);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.SUCCESS,
            data: { categories, collections }
        });

    } catch (error) {
        console.error("searchCategoriesAndCollections error:", error);

        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        if (isRateLimited(ip, 30, 60000)) {
            return res.status(STATUS_CODE.TOO_MANY_REQUESTS).json({
                errorCode: STATUS_CODE.TOO_MANY_REQUESTS,
                message: TOO_MANY_REQUESTS_MESSAGE
            });
        }

        const query = req.query.query || "";
        const limit = Number(req.query.limit) || 12;

        if (!query || query.trim() === "") {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.COMMON.SUCCESS,
                data: []
            });
        }

        const escapeRegex = (value) =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedQuery = escapeRegex(query.trim());
        const queryRegex = new RegExp(escapedQuery, "i");

        const filterUniqueFamilies = (products) => {
            const q = query.trim().toLowerCase();
            const isExactMatch = (p) => (p.itemCode || "").toLowerCase() === q || (p.designNumber || "").toLowerCase() === q;
            const isParent = (p) => !p.parentItemCode || p.parentItemCode === "";

            const groups = {};
            for (const p of products) {
                const family = p.familyItemCode || p.itemCode;
                if (!groups[family]) groups[family] = [];
                groups[family].push(p);
            }

            return Object.values(groups).map(group =>
                group.sort((a, b) =>
                    (isExactMatch(b) - isExactMatch(a)) ||
                    ((a.finalPrice || 0) - (b.finalPrice || 0)) ||
                    (isParent(b) - isParent(a))
                )[0]
            );
        };

        const now = new Date();
        const activeOffers = await Offer.find({
            status: "active",
            isActive: true,
            isDeleted: 0,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).lean();

        const priorityProducts = await ProductMaster.find({
            isDeleted: { $ne: 1 },
            status: Constant.PRODUCT_STATUS.AVALIABLE,
            $or: [
                { slug: { $regex: escapedQuery, $options: "i" } },
                { itemCode: { $regex: escapedQuery, $options: "i" } },
                { designNumber: { $regex: escapedQuery, $options: "i" } },
                { productTitle: { $regex: escapedQuery, $options: "i" } }
            ]
        })
            .select("_id designNumber itemCode parentItemCode familyItemCode productTitle slug finalPrice images categoryId subCategoryId collectionId tags labourPrice TotalDiamondPrice otherChargePrice")
            .limit(limit * 10)
            .lean();

        let finalProducts = filterUniqueFamilies(priorityProducts).slice(0, limit);

        if (finalProducts.length < limit) {
            const matchingTags = await Tag.find({
                status: Constant.STATUS.ACTIVE,
                $or: [
                    { name: queryRegex },
                    { acceptableValues: queryRegex }
                ]
            }).select("_id").lean();

            if (matchingTags.length > 0) {
                const tagProducts = await ProductMaster.find({
                    isDeleted: 0,
                    status: Constant.PRODUCT_STATUS.AVALIABLE,
                    tags: { $in: matchingTags.map(t => t._id) }
                })
                    .select("_id designNumber itemCode parentItemCode familyItemCode productTitle slug finalPrice images categoryId subCategoryId collectionId tags labourPrice TotalDiamondPrice otherChargePrice")
                    .limit(limit * 10)
                    .lean();

                const existingFamilies = new Set(finalProducts.map(p => p.familyItemCode || p.itemCode));
                const uniqueTagProducts = filterUniqueFamilies(tagProducts).filter(p =>
                    !existingFamilies.has(p.familyItemCode || p.itemCode)
                );

                finalProducts = [...finalProducts, ...uniqueTagProducts].slice(0, limit);
            }
        }

        const formattedProducts = finalProducts.map(p => {
            const images = (p.images || []).map(img => {
                let loc = img.MediaLocation || "";
                if (loc && !loc.startsWith("http")) {
                    loc = `${Constant.PRODUCT_AWS_ZOOM_IMAGE_URL}${loc}`;
                }
                return {
                    _id: img._id,
                    MediaLocation: loc,
                    IsMainMedia: img.IsMainMedia,
                    MediaSeqNo: img.MediaSeqNo
                };
            });

            // Calculate active offer details for this product
            let originalPrice = p.finalPrice || 0;
            let discountedPrice = originalPrice;
            let offerDetails = null;
            const bestDetails = resolveBestOfferForProduct(activeOffers, p);
            if (bestDetails) {
                offerDetails = bestDetails;
                discountedPrice = bestDetails.discountedPrice;
            }

            return {
                _id: p._id,
                designNumber: p.designNumber,
                itemCode: p.itemCode,
                productTitle: p.productTitle,
                slug: p.slug,
                finalPrice: p.finalPrice,
                discountedPrice,
                offerDetails,
                images
            };
        });

        const { rate, currency } = await getExchangeRateFromRequest(req);
        const adjustedProducts = adjustPricesForCurrency(formattedProducts, rate, currency);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PRODUCT.FETCHED,
            data: adjustedProducts
        });
    } catch (error) {
        console.error("searchProducts error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
