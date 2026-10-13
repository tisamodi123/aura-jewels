import Offer from '../models/offer.model.js';
import Product from "../models/product.model.js";
import { appendMediaUrls } from '../utils/imageUrl.js';
import { getUploadedOrCleanFilename } from '../utils/uploadPaths.js';
import Constant from '../constants/user.constant.js';
import mongoose from 'mongoose';
import { applyOfferToProduct } from './offerCalculation.services.js';

export const check_unique_offer_code = async function (code) {
    try {
        return await Offer.findOne({ code: code.toUpperCase().trim(), isDeleted: 0 });
    } catch (error) {
        console.error("check_unique_offer_code error:", error);
        throw error;
    }
};

export const check_product_offer_conflict = async function (
    productIds,
    startDate,
    endDate,
    customMode = "sku",
    excludeOfferId = null
) {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return null;
        }

        let targetProductIds = [...productIds];
        if (customMode && customMode.toLowerCase() === "design") {
            const parentProducts = await Product.find({
                _id: { $in: productIds },
                isDeleted: 0
            }).select("itemCode");
            const parentItemCodes = parentProducts.map(p => p.itemCode).filter(Boolean);
            if (parentItemCodes.length > 0) {
                const variants = await Product.find({
                    parentItemCode: { $in: parentItemCodes },
                    isDeleted: 0
                }).select("_id");
                const variantIds = variants.map(v => v._id.toString());
                targetProductIds = [...new Set([...targetProductIds, ...variantIds])];
            }
        }

        const query = {
            isDeleted: 0,
            applicableProducts: {
                $in: targetProductIds
            },
            startDate: {
                $lte: endDate
            },
            endDate: {
                $gte: startDate
            }
        };

        if (excludeOfferId) {
            query._id = {
                $ne: excludeOfferId
            };
        }

        return await Offer.findOne(query);

    } catch (error) {
        console.error("check_product_offer_conflict error:", error);
        throw error;
    }
};

// Helper to safely parse JSON strings if they are sent in form-data
const safeParse = (val) => {
    if (typeof val === "string" && val.trim() !== "") {
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    }
    return val;
};

export const resolve_product_offer_conflicts = async function (
    productIds,
    startDate,
    endDate,
    customMode = "sku",
    excludeOfferId = null
) {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return;
        }

        let targetProductIds = [...productIds];
        if (customMode && customMode.toLowerCase() === "design") {
            const parentProducts = await Product.find({
                _id: { $in: productIds },
                isDeleted: 0
            }).select("itemCode");
            const parentItemCodes = parentProducts.map(p => p.itemCode).filter(Boolean);
            if (parentItemCodes.length > 0) {
                const variants = await Product.find({
                    parentItemCode: { $in: parentItemCodes },
                    isDeleted: 0
                }).select("_id");
                const variantIds = variants.map(v => v._id.toString());
                targetProductIds = [...new Set([...targetProductIds, ...variantIds])];
            }
        }

        const query = {
            isDeleted: 0,
            applicableProducts: {
                $in: targetProductIds
            },
            startDate: {
                $lte: endDate
            },
            endDate: {
                $gte: startDate
            }
        };

        if (excludeOfferId) {
            query._id = {
                $ne: excludeOfferId
            };
        }

        const conflictingOffers = await Offer.find(query);
        if (conflictingOffers.length === 0) {
            return;
        }

        // Collect all distinct parent IDs from the conflicting offers
        const parentIds = [
            ...new Set(
                conflictingOffers.flatMap(offer =>
                    (offer.applicableProducts || []).map(id => id.toString())
                )
            )
        ];

        // Fetch all parent products at once
        const parents = await Product.find({
            _id: { $in: parentIds },
            isDeleted: 0
        }).select("_id itemCode").lean();

        // Create Parent Map
        const parentMap = new Map();
        parents.forEach(parent => {
            parentMap.set(parent._id.toString(), parent);
        });

        // Collect item codes
        const itemCodes = parents.map(p => p.itemCode).filter(Boolean);

        // Fetch all variants at once
        const variants = await Product.find({
            parentItemCode: { $in: itemCodes },
            isDeleted: 0
        }).select("_id parentItemCode").lean();

        // Create Variant Map
        const variantMap = new Map();
        for (const variant of variants) {
            if (!variantMap.has(variant.parentItemCode)) {
                variantMap.set(variant.parentItemCode, []);
            }
            variantMap.get(variant.parentItemCode).push(variant._id.toString());
        }

        const bulk = [];

        for (const offer of conflictingOffers) {
            let updatedProducts = [];
            const offerCustomMode = offer.customMode || "sku";

            if (offerCustomMode.toLowerCase() === "design") {
                // For design mode, we need to check which parent parent products have conflicting variants
                for (const parentId of offer.applicableProducts) {
                    const parentIdStr = parentId.toString();
                    if (targetProductIds.includes(parentIdStr)) {
                        continue;
                    }
                    const parentProduct = parentMap.get(parentIdStr);
                    if (parentProduct && parentProduct.itemCode) {
                        const variantIds = variantMap.get(parentProduct.itemCode) || [];
                        const hasOverlap = variantIds.some(vId => targetProductIds.includes(vId));
                        if (hasOverlap) {
                            continue;
                        }
                    }
                    updatedProducts.push(parentId);
                }
            } else {
                updatedProducts = offer.applicableProducts.filter(pId => !targetProductIds.includes(pId.toString()));
            }

            bulk.push({
                updateOne: {
                    filter: { _id: offer._id },
                    update: { $set: { applicableProducts: updatedProducts } }
                }
            });
        }

        if (bulk.length > 0) {
            await Offer.bulkWrite(bulk);
        }
    } catch (error) {
        console.error("resolve_product_offer_conflicts error:", error);
        throw error;
    }
};

export const add_offer_db = async function (req) {
    try {
        const data = req.body;
        console.log("add Offer data============================>", data)
        // Parse stringified JSON fields if they are sent in form-data
        const priceRange = safeParse(data.priceRange);
        let applicableProducts = safeParse(data.applicableProducts);
        let applicableTo = safeParse(data.applicableTo) || {};

        let isActive = data.isActive;
        if (typeof isActive === "string") {
            isActive = isActive === "true";
        } else if (isActive === undefined) {
            isActive = true;
        }

        let discountValue = data.discountValue;
        if (typeof discountValue === "string") {
            discountValue = Number(discountValue);
        }

        let maxDiscountAmount = data.maxDiscountAmount;
        if (typeof maxDiscountAmount === "string") {
            maxDiscountAmount = maxDiscountAmount === "null" || maxDiscountAmount === "" ? null : Number(maxDiscountAmount);
        }

        const status = data.status || Constant.OFFER_STATUS.ACTIVE;
        applicableProducts = Array.isArray(applicableProducts)
            ? [...new Set(applicableProducts)]
            : applicableProducts;

        let customMode = data.customMode ? data.customMode.toLowerCase() : null;

        if (data.applicableType === "all") {
            applicableProducts = [];
            customMode = null;
            // Reject if no category/subcategory/collection/tags filter is selected
            if (
                (!applicableTo.category || applicableTo.category.length === 0) &&
                (!applicableTo.subCategory || applicableTo.subCategory.length === 0) &&
                (!applicableTo.collections || applicableTo.collections.length === 0) &&
                (!applicableTo.tags || applicableTo.tags.length === 0)
            ) {
                throw new Error("Select at least one applicable filter (category, subcategory, collection, or tag).");
            }
        } else {
            applicableTo = { category: [], subCategory: [], collections: [], tags: [] };
            if (!customMode) {
                customMode = Constant.OFFER_CUSTOM_MODE.DESIGN;
            }

            // In Design mode, ensure all product IDs belong to parent products (parentItemCode should be null/empty)
            if (customMode.toLowerCase() === Constant.OFFER_CUSTOM_MODE.DESIGN && Array.isArray(applicableProducts) && applicableProducts.length > 0) {
                const parents = await Product.find({ _id: { $in: applicableProducts }, isDeleted: 0 }).select("parentItemCode");
                const hasVariant = parents.some(p => p.parentItemCode !== undefined && p.parentItemCode !== null && p.parentItemCode !== "");
                if (hasVariant) {
                    throw new Error("In Design mode, only parent products can be selected.");
                }
            }
        }

        const normalisedData = {
            ...data,
            code: data.code.toUpperCase().trim(),
            status: status,
            isActive: isActive,
            applicableProducts: applicableProducts,
            applicableTo: applicableTo,
            customMode: customMode,
            priceRange: priceRange,
            discountValue: discountValue,
            maxDiscountAmount: maxDiscountAmount,
            // Combined-offer component %s — coerce to a number (a blank string
            // from FormData would otherwise fail the Number cast).
            makingChargePercent: Number(data.makingChargePercent) || 0,
            diamondPercent: Number(data.diamondPercent) || 0,
            image: getUploadedOrCleanFilename(req, "image", data.image),
            imageMobile: getUploadedOrCleanFilename(req, "imageMobile", data.imageMobile)
        };

        if (data.applicableType === "custom" && Array.isArray(applicableProducts) && applicableProducts.length > 0) {
            await resolve_product_offer_conflicts(
                applicableProducts,
                data.startDate,
                data.endDate,
                customMode
            );
        }

        const newOffer = await Offer.create(normalisedData);
        return newOffer;
    } catch (error) {
        throw error;
    }
};


export const update_offer_db = async function (id, req) {
    try {
        const data = req.body;
        console.log("update Offer data============================>", data)

        const currentOffer = await Offer.findOne({ _id: id, isDeleted: 0 });
        if (!currentOffer) {
            throw new Error("Offer not found");
        }

        // Parse stringified JSON fields if they are sent in form-data
        const priceRange = safeParse(data.priceRange);
        let applicableProducts = safeParse(data.applicableProducts);
        let applicableTo = safeParse(data.applicableTo);

        let isActive = data.isActive;
        if (typeof isActive === "string") {
            isActive = isActive === "true";
        }

        let discountValue = data.discountValue;
        if (typeof discountValue === "string") {
            discountValue = Number(discountValue);
        }

        let maxDiscountAmount = data.maxDiscountAmount;
        if (typeof maxDiscountAmount === "string") {
            maxDiscountAmount = maxDiscountAmount === "null" || maxDiscountAmount === "" ? null : Number(maxDiscountAmount);
        }

        const updateData = {};
        const finalApplicableType = data.applicableType !== undefined ? data.applicableType : currentOffer.applicableType;

        if (finalApplicableType === "all") {
            updateData.applicableProducts = [];
            updateData.customMode = null;

            const category = applicableTo?.category ?? currentOffer.applicableTo?.category ?? [];
            const subCategory = applicableTo?.subCategory ?? currentOffer.applicableTo?.subCategory ?? [];
            const collections = applicableTo?.collections ?? currentOffer.applicableTo?.collections ?? [];
            const tags = applicableTo?.tags ?? currentOffer.applicableTo?.tags ?? [];

            if (
                (!category || category.length === 0) &&
                (!subCategory || subCategory.length === 0) &&
                (!collections || collections.length === 0) &&
                (!tags || tags.length === 0)
            ) {
                throw new Error("Select at least one applicable filter (category, subcategory, collection, or tag).");
            }

            if (applicableTo !== undefined && applicableTo !== null) {
                if (applicableTo.category !== undefined) updateData['applicableTo.category'] = applicableTo.category;
                if (applicableTo.subCategory !== undefined) updateData['applicableTo.subCategory'] = applicableTo.subCategory;
                if (applicableTo.collections !== undefined) updateData['applicableTo.collections'] = applicableTo.collections;
                if (applicableTo.tags !== undefined) updateData['applicableTo.tags'] = applicableTo.tags;
            }
        } else {
            updateData["applicableTo.category"] = [];
            updateData["applicableTo.subCategory"] = [];
            updateData["applicableTo.collections"] = [];
            updateData["applicableTo.tags"] = [];

            applicableProducts = Array.isArray(applicableProducts)
                ? [...new Set(applicableProducts)]
                : (currentOffer.applicableProducts || []);

            const finalCustomMode = data.customMode !== undefined
                ? data.customMode.toLowerCase()
                : (currentOffer.customMode ? currentOffer.customMode.toLowerCase() : Constant.OFFER_CUSTOM_MODE.DESIGN);

            // In Design mode, ensure all product IDs belong to parent products (parentItemCode should be null/empty)
            if (finalCustomMode.toLowerCase() === Constant.OFFER_CUSTOM_MODE.DESIGN && applicableProducts.length > 0) {
                const parents = await Product.find({ _id: { $in: applicableProducts }, isDeleted: 0 }).select("parentItemCode");
                const hasVariant = parents.some(p => p.parentItemCode !== undefined && p.parentItemCode !== null && p.parentItemCode !== "");
                if (hasVariant) {
                    throw new Error("In Design mode, only parent products can be selected.");
                }
            }

            updateData.applicableProducts = applicableProducts;
            updateData.customMode = finalCustomMode;

            if (applicableProducts.length > 0) {
                const finalStartDate = data.startDate ?? currentOffer.startDate;
                const finalEndDate = data.endDate ?? currentOffer.endDate;

                await resolve_product_offer_conflicts(
                    applicableProducts,
                    finalStartDate,
                    finalEndDate,
                    finalCustomMode,
                    id
                );
            }
        }


        // Direct fields
        if (data.code !== undefined) updateData.code = data.code.toUpperCase().trim();
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.startDate !== undefined) updateData.startDate = data.startDate;
        if (data.endDate !== undefined) updateData.endDate = data.endDate;
        if (data.discountType !== undefined) updateData.discountType = data.discountType;
        if (discountValue !== undefined) updateData.discountValue = discountValue;
        if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
        if (data.appliedOn !== undefined) updateData.appliedOn = data.appliedOn;
        // Combined-offer component %s (coerce blank/string → number).
        if (data.makingChargePercent !== undefined) updateData.makingChargePercent = Number(data.makingChargePercent) || 0;
        if (data.diamondPercent !== undefined) updateData.diamondPercent = Number(data.diamondPercent) || 0;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.applicableType !== undefined) updateData.applicableType = data.applicableType;

        const image = getUploadedOrCleanFilename(req, "image", data.image);
        if (image !== undefined) updateData.image = image;

        const imageMobile = getUploadedOrCleanFilename(req, "imageMobile", data.imageMobile);
        if (imageMobile !== undefined) updateData.imageMobile = imageMobile;

        // Nested priceRange
        if (priceRange !== undefined && priceRange !== null) {
            if (priceRange.from !== undefined) updateData['priceRange.from'] = priceRange.from;
            if (priceRange.to !== undefined) updateData['priceRange.to'] = priceRange.to;
        }


        const offer = await Offer.findByIdAndUpdate(
            id,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );

        if (!offer) {
            throw new Error("Offer not found");
        }

        return offer;
    } catch (error) {
        console.error("update_offer_db error:", error);
        throw error;
    }
};

export const get_offers_db = async function (filter = {}, skip = 0, limit = 10) {
    try {
        const query = { isDeleted: 0, ...filter };
        return await Offer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    } catch (error) {
        console.error("get_offers_db error:", error);
        throw error;
    }
};

export const delete_offer_db = async function (id) {
    try {
        return await Offer.findByIdAndUpdate(
            id,
            { $set: { isDeleted: 1 } },
            { new: true }
        );
    } catch (error) {
        console.error("delete_offer_db error:", error);
        throw error;
    }
};

export const get_offer_products = async (offerId, skip = 0, limit = 10, search = "") => {
    const offer = await Offer.findOne({
        _id: offerId,
        isDeleted: 0
    });

    if (!offer) {
        throw new Error("Offer not found");
    }

    let productQuery = {};

    if (offer.applicableType === "all") {
        const conditions = [];
        const appTo = offer.applicableTo || {};
        if (appTo.category && appTo.category.length > 0) {
            conditions.push({ categoryId: { $in: appTo.category } });
        }
        if (appTo.subCategory && appTo.subCategory.length > 0) {
            conditions.push({ subCategoryId: { $in: appTo.subCategory } });
        }
        if (appTo.collections && appTo.collections.length > 0) {
            conditions.push({ collectionId: { $in: appTo.collections } });
        }
        if (appTo.tags && appTo.tags.length > 0) {
            conditions.push({ tags: { $in: appTo.tags } });
        }
        productQuery = {
            isDeleted: 0,
            $or: conditions.length > 0 ? conditions : [{ _id: null }]
        };
    } else {
        const appProds = offer.applicableProducts || [];
        if (offer.customMode && offer.customMode.toLowerCase() === "sku") {
            productQuery = {
                _id: { $in: appProds },
                isDeleted: 0
            };
        } else {
            // Design mode: match parent IDs and variants sharing their parentItemCode
            const parentProducts = await Product.find({
                _id: { $in: appProds },
                isDeleted: 0
            }).select("itemCode");
            const parentItemCodes = parentProducts.map(p => p.itemCode).filter(Boolean);

            productQuery = {
                isDeleted: 0,
                $or: [
                    { _id: { $in: appProds } },
                    { parentItemCode: { $in: parentItemCodes } }
                ]
            };
        }
    }

    const pipeline = [
        { $match: productQuery }
    ];

    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { productTitle: { $regex: search, $options: "i" } },
                    { itemCode: { $regex: search, $options: "i" } }
                ]
            }
        });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Product.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    pipeline.push(
        { $skip: skip },
        { $limit: limit },
        appendMediaUrls()
    );

    const products = await Product.aggregate(pipeline);

    return {
        offer: {
            _id: offer._id,
            code: offer.code,
            name: offer.name
        },
        total,
        products
    };
};

export const get_products_List_for_offer = async (filters = {}, skip = 0, limit = 10, search = "") => {
    const {
        status,
        category,
        subCategory,
        collectionId,
        tags,
        minPrice,
        maxPrice,
        ids,
        hasActiveOffer,
        excludeOfferId,
        applicableType
    } = filters;

    const customMode = filters.customMode || filters.customeMode;

    // Helper to safely parse JSON strings if they are sent in form-data
    const safeParse = (val) => {
        if (typeof val === "string" && val.trim() !== "") {
            try {
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        }
        return val;
    };

    const parsedCategory = safeParse(category);
    const parsedSubCategory = safeParse(subCategory);
    const parsedCollections = safeParse(collectionId); // map collectionId correctly
    const parsedTags = safeParse(tags);
    const parsedIds = safeParse(ids);
    const parsedApplicableProducts = safeParse(filters.applicableProducts);
    const hasSelectionList = Array.isArray(parsedApplicableProducts) && parsedApplicableProducts.length > 0;

    const toObjectIdArray = (value) => {
        if (!value) return [];
        const arr = Array.isArray(value) ? value : [value];
        return arr
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id));
    };

    let matchStage = {
        isDeleted: { $ne: 1 },
    };

    // STATUS
    if (status) {
        const statusArr = Array.isArray(status) ? status : [status];
        matchStage.status = { $in: statusArr };
    }

    // EXPLICIT IDS
    if (parsedIds && Array.isArray(parsedIds) && parsedIds.length) {
        const objIds = toObjectIdArray(parsedIds);
        if (objIds.length) matchStage._id = { $in: objIds };
    }

    const subCategoryIds = toObjectIdArray(parsedSubCategory);
    if (subCategoryIds.length) {
        matchStage.subCategoryId = { $in: subCategoryIds };
    }

    let priceFilter = {};
    if (minPrice) {
        priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice) {
        priceFilter.$lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
        matchStage.finalPrice = priceFilter;
    }

    // CUSTOM MODE DESIGN SELECTION FILTER (always only show parent products)
    if (customMode && customMode.toLowerCase() === "design") {
        matchStage.$or = [
            { parentItemCode: { $exists: false } },
            { parentItemCode: null },
            { parentItemCode: "" }
        ];
    }

    // CATEGORY, COLLECTION, TAG MATCHER FOR AND CONDITIONS (applicableType is NOT 'all')
    if (applicableType !== "all") {
        const categoryIds = toObjectIdArray(parsedCategory);
        if (categoryIds.length) {
            matchStage.categoryId = { $in: categoryIds };
        }
        const collectionIds = toObjectIdArray(parsedCollections);
        if (collectionIds.length) {
            matchStage.collectionId = { $in: collectionIds };
        }
        const tagIds = toObjectIdArray(parsedTags);
        if (tagIds.length) {
            matchStage.tags = { $in: tagIds };
        }
    }

    let pipeline = [
        { $match: matchStage },
    ];

    // APPLICABLE TYPE CUSTOM: Restrict to selected products if list is sent
    if (applicableType === "custom" && hasSelectionList) {
        const applicableProductIds = toObjectIdArray(parsedApplicableProducts);
        pipeline.push({
            $match: { _id: { $in: applicableProductIds } }
        });
    }

    // CATEGORY, COLLECTION, TAG MATCHER FOR OR CONDITIONS (applicableType is 'all')
    if (applicableType === "all") {
        const orConditions = [];
        const categoryIds = toObjectIdArray(parsedCategory);
        if (categoryIds.length) {
            orConditions.push({ categoryId: { $in: categoryIds } });
        }
        const collectionIds = toObjectIdArray(parsedCollections);
        if (collectionIds.length) {
            orConditions.push({ collectionId: { $in: collectionIds } });
        }
        const tagIds = toObjectIdArray(parsedTags);
        if (tagIds.length) {
            orConditions.push({ tags: { $in: tagIds } });
        }
        if (orConditions.length > 0) {
            pipeline.push({ $match: { $or: orConditions } });
        }
    }

    // SEARCH MATCH
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { itemCode: { $regex: search, $options: "i" } },
                    { productTitle: { $regex: search, $options: "i" } },
                ]
            }
        });
    }

    // ACTIVE OFFER FILTERS
    if (hasActiveOffer !== undefined && hasActiveOffer !== "all") {
        if (hasActiveOffer === true || hasActiveOffer === "true") {
            if (excludeOfferId) {
                pipeline.push({
                    $match: {
                        offerDetails: { $ne: null },
                        "offerDetails.offer._id": { $ne: new mongoose.Types.ObjectId(excludeOfferId) }
                    }
                });
            } else {
                pipeline.push({
                    $match: { offerDetails: { $ne: null } }
                });
            }
        } else if (hasActiveOffer === false || hasActiveOffer === "false") {
            if (excludeOfferId) {
                pipeline.push({
                    $match: {
                        $or: [
                            { offerDetails: null },
                            { "offerDetails.offer._id": new mongoose.Types.ObjectId(excludeOfferId) }
                        ]
                    }
                });
            } else {
                pipeline.push({
                    $match: { offerDetails: null }
                });
            }
        }
    }

    // COUNT PIPELINE
    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Product.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add sorting, skip, limit
    pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    );

    // Lookups and projections
    pipeline.push(
        {
            $lookup: {
                from: "metals",
                localField: "metalId",
                foreignField: "_id",
                as: "metal",
            },
        },
        { $unwind: { path: "$metal", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "metals",
                localField: "cMetalId",
                foreignField: "_id",
                as: "cMetal",
            },
        },
        { $unwind: { path: "$cMetal", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "charges",
                localField: "labourCode",
                foreignField: "_id",
                as: "labour",
            },
        },
        { $unwind: { path: "$labour", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "charges",
                localField: "otherChargeCode",
                foreignField: "_id",
                as: "otherCharge",
            },
        },
        { $unwind: { path: "$otherCharge", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "sizes",
                localField: "defaultSize",
                foreignField: "_id",
                as: "size",
            },
        },
        { $unwind: { path: "$size", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
            },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "categories",
                localField: "subCategoryId",
                foreignField: "_id",
                as: "subCategories",
            },
        },

        {
            $lookup: {
                from: "productstones",
                localField: "_id",
                foreignField: "productId",
                as: "stones",
            },
        },

        {
            $project: {
                productTitle: 1,
                itemCode: 1,
                parentItemCode: 1,
                designNumber: 1,
                status: 1,
                finalPrice: 1,
                appxMetalWgt: 1,
                offerDetails: 1,
                discountedPrice: 1,

                metalType: {
                    _id: "$metal._id",
                    metalName: "$metal.name",
                    price: "$metal.price_per_gram",
                },
                metalStamp: {
                    _id: "$metal._id",
                    karat: "$metal.stamp",
                },

                metalTypeDetail: {
                    _id: "$metal._id",
                    metalName: "$metal.name",
                    price: "$metal.price_per_gram",
                },
                metalStampDetail: {
                    _id: "$metal._id",
                    karat: "$metal.stamp",
                },

                metalDetails: {
                    _id: "$metal._id",
                    name: "$metal.name",
                    type: "$metal.type",
                    stamp: "$metal.stamp",
                },
                cMetalDetails: {
                    _id: "$cMetal._id",
                    name: "$cMetal.name",
                    type: "$cMetal.type",
                    stamp: "$cMetal.stamp",
                },

                category: {
                    _id: "$category._id",
                    categoryName: "$category.categoryName",
                },

                subCategories: {
                    $map: {
                        input: "$subCategories",
                        as: "sub",
                        in: {
                            _id: "$$sub._id",
                            categoryName: "$$sub.categoryName",
                        },
                    },
                },
                size: {
                    _id: "$size._id",
                    name: "$size.name",
                    code: "$size.code",
                },

                labourDetails: {
                    _id: "$labour._id",
                    name: "$labour.name",
                    labourCode: "$labour.code",
                    amount: "$labour.amount_per_gm",
                },
                otherChargeDetails: {
                    _id: "$otherCharge._id",
                    name: "$otherCharge.name",
                    chargeCode: "$otherCharge.code",
                    amount: "$otherCharge.amount_per_gm",
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
        appendMediaUrls()
    );

    const products = await Product.aggregate(pipeline);

    return {
        total,
        products
    };
};

export const sync_offers_db = async function (offerId = null) {
    try {
        const { applyOfferToProduct, resolveBestOfferForProduct } = await import("./offerCalculation.services.js");
        const now = new Date();

        // Only auto-expire/auto-activate in full syncs to avoid race conditions/redundancy
        if (!offerId) {
            // 1. Auto-expire past active offers
            await Offer.updateMany(
                {
                    status: Constant.OFFER_STATUS.ACTIVE,
                    endDate: { $lt: now }
                },
                {
                    $set: { status: Constant.OFFER_STATUS.INACTIVE }
                }
            );

            // 2. Auto-activate upcoming offers
            await Offer.updateMany(
                {
                    status: Constant.OFFER_STATUS.INACTIVE,
                    isActive: true,
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                    isDeleted: 0
                },
                {
                    $set: { status: Constant.OFFER_STATUS.ACTIVE }
                }
            );
        }

        // 3. Fetch all current active offers
        const activeOffers = await Offer.find({
            status: Constant.OFFER_STATUS.ACTIVE,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            isDeleted: 0
        }).lean();

        // 4. Collect targeting parameters from active offers to build a narrow Product query
        // ALL
        const targetCategoryIds = new Set();
        const targetSubCategoryIds = new Set();
        const targetCollectionIds = new Set();
        const targetTags = new Set();
        // CUSTOM
        const targetProductIds = new Set();
        let matchesAll = false;

        const designParentIds = new Set(); // creating set just to avoid duplicates

        // Scope scoping configuration
        // if offer id is provided then use that else all active offers
        let offersToScope = [];
        if (offerId) {
            const singleOffer = await Offer.findById(offerId).lean();
            if (singleOffer) {
                offersToScope = [singleOffer];
            }
        } else {
            offersToScope = activeOffers;
        }

        for (const offer of offersToScope) {
            // applicable type all apply to category,subcategory,collection,tags 
            if (offer.applicableType === "all") {
                const appTo = offer.applicableTo || {};
                let hasFilter = false;
                // whichever category has applied will have length greater than 0 as it contains ids 
                if (appTo.category && appTo.category.length > 0) {
                    appTo.category.forEach(id => targetCategoryIds.add(id.toString()));
                    hasFilter = true;
                }
                if (appTo.subCategory && appTo.subCategory.length > 0) {
                    appTo.subCategory.forEach(id => targetSubCategoryIds.add(id.toString()));
                    hasFilter = true;
                }
                if (appTo.collections && appTo.collections.length > 0) {
                    appTo.collections.forEach(id => targetCollectionIds.add(id.toString()));
                    hasFilter = true;
                }
                if (appTo.tags && appTo.tags.length > 0) {
                    appTo.tags.forEach(tag => targetTags.add(tag.toString()));
                    hasFilter = true;
                }
                // if (offer.applicableType === "all" && !hasFilter) {
                //     throw new Error(
                //         "At least one Category, SubCategory, Collection, or Tag must be selected."
                //     );
                // }
                if (!hasFilter) {
                    matchesAll = true;
                }
            } else {
                // only applicable products
                const appProds = offer.applicableProducts || [];
                appProds.forEach(id => targetProductIds.add(id.toString()));
                if (offer.customMode && offer.customMode.toLowerCase() === "design") {
                    appProds.forEach(id => designParentIds.add(id.toString()));
                }
            }
        }

        // Safe ObjectId casting helper
        const toObjectId = (id) => {
            if (mongoose.Types.ObjectId.isValid(id)) {
                return new mongoose.Types.ObjectId(id);
            }
            return null;
        };

        const toObjectIds = (set) => [...set].map(toObjectId).filter(Boolean);

        // Fetch Design parent products in batch to build itemCode-to-id map
        const parentItemCodeMap = new Map();

        if (designParentIds.size) {
            const parents = await Product.find({
                _id: { $in: toObjectIds(designParentIds) },
                isDeleted: 0
            }).select("itemCode").lean();

            parents.forEach(({ _id, itemCode }) => {
                if (itemCode) {
                    parentItemCodeMap.set(itemCode, _id.toString());
                }
            });
        }

        // Build product query conditions
        const productQueryConditions = [];
        if (!matchesAll && offersToScope.length > 0) {
            if (targetCategoryIds.size > 0) {
                productQueryConditions.push({ categoryId: { $in: toObjectIds(targetCategoryIds) } });
            }
            if (targetSubCategoryIds.size > 0) {
                productQueryConditions.push({ subCategoryId: { $in: toObjectIds(targetSubCategoryIds) } });
            }
            if (targetCollectionIds.size > 0) {
                productQueryConditions.push({ collectionId: { $in: toObjectIds(targetCollectionIds) } });
            }
            if (targetTags.size > 0) {
                productQueryConditions.push({ tags: { $in: toObjectIds(targetTags) } });
            }
            if (targetProductIds.size > 0) {
                productQueryConditions.push({ _id: { $in: toObjectIds(targetProductIds) } });
            }
            if (parentItemCodeMap.size > 0) {
                productQueryConditions.push({ parentItemCode: { $in: [...parentItemCodeMap.keys()] } });
            }
        }

        // Include products that currently have an active offer applied so they can be cleaned up if they no longer qualify
        if (offerId) {
            productQueryConditions.push({ "offerDetails.offer._id": toObjectId(offerId) });
        } else {
            productQueryConditions.push({ offerDetails: { $ne: null } });
        }

        const productQuery = { isDeleted: 0 };
        // if (productQueryConditions.length > 0) {
        if (productQueryConditions.length > 0 && !matchesAll) {
            productQuery.$or = productQueryConditions;
        }

        // 5. Query candidate products
        let ProductList = await Product.find(productQuery)
            .select("_id finalPrice TotalDiamondPrice labourPrice itemCode parentItemCode categoryId subCategoryId collectionId tags offerDetails discountedPrice")
            .lean();

        // Ensure all child variants of the candidate parent products are included in the sync
        const parentItemCodes = ProductList
            .filter(p => !p.parentItemCode)
            .map(p => p.itemCode)
            .filter(Boolean);

        if (parentItemCodes.length > 0) {
            const variants = await Product.find({
                parentItemCode: { $in: parentItemCodes },
                isDeleted: 0
            })
                .select("_id finalPrice TotalDiamondPrice labourPrice itemCode parentItemCode categoryId subCategoryId collectionId tags offerDetails discountedPrice")
                .lean();

            const existingIds = new Set(ProductList.map(p => p._id.toString()));
            for (const v of variants) {
                if (!existingIds.has(v._id.toString())) {
                    ProductList.push(v);
                }
            }
        }

        // Build a parent mapping for O(1) parent lookup
        const parentMap = new Map();
        ProductList.forEach(p => {
            if (!p.parentItemCode && p.itemCode) {
                parentMap.set(p.itemCode, p);
            }
        });

        // If some design parents were loaded in parentItemCodeMap, merge them into parentMap
        if (designParentIds.size) {
            const parents = await Product.find({
                _id: { $in: toObjectIds(designParentIds) },
                isDeleted: 0
            }).select("_id finalPrice TotalDiamondPrice labourPrice itemCode parentItemCode categoryId subCategoryId collectionId tags").lean();

            parents.forEach(p => {
                if (p.itemCode && !parentMap.has(p.itemCode)) {
                    parentMap.set(p.itemCode, p);
                }
            });
        }

        let syncedCount = 0;
        let bulkOps = [];
        const BATCH_SIZE = 1000;

        const executeBulkWrite = async () => {
            if (bulkOps.length > 0) {
                await Product.bulkWrite(bulkOps);
                bulkOps = [];
            }
        };

        // 6. Resolve best offer per candidate in memory
        for (const product of ProductList) {
            if (product.parentItemCode && parentMap.has(product.parentItemCode)) {
                const parent = parentMap.get(product.parentItemCode);
                product.parentProductId = parent._id.toString();
                // Inject parent classification fields for matching
                product.categoryId = product.categoryId || parent.categoryId;
                product.subCategoryId = (product.subCategoryId && product.subCategoryId.length) ? product.subCategoryId : parent.subCategoryId;
                product.collectionId = (product.collectionId && product.collectionId.length) ? product.collectionId : parent.collectionId;
                product.tags = (product.tags && product.tags.length) ? product.tags : parent.tags;
            }

            const bestDetails = resolveBestOfferForProduct(activeOffers, product);

            const currentOfferId = product.offerDetails?.offer?._id?.toString() || null;
            const newOfferId = bestDetails?.offer?._id?.toString() || null;
            const currentDiscountedPrice = product.discountedPrice;
            const newDiscountedPrice = bestDetails?.discountedPrice ?? null;

            const hasChanged = currentOfferId !== newOfferId || currentDiscountedPrice !== newDiscountedPrice;

            if (hasChanged) {
                if (bestDetails) {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: product._id },
                            update: { $set: { offerDetails: bestDetails, discountedPrice: bestDetails.discountedPrice } }
                        }
                    });
                    syncedCount++;
                } else {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: product._id },
                            update: { $unset: { offerDetails: "", discountedPrice: "" } }
                        }
                    });
                }

                if (bulkOps.length >= BATCH_SIZE) {
                    await executeBulkWrite();
                }
            }
        }

        await executeBulkWrite();

        return syncedCount;
    } catch (error) {
        console.error("sync_offers_db error:", error);
        throw error;
    }
};