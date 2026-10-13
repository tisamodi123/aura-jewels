import Joi from 'joi';
import Constant from '../constants/user.constant.js';

const objectIdLike = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Must be a valid ObjectId'
});

const objectIdLikeArray = Joi.array().items(objectIdLike);

const objectIdArrayOrCsv = Joi.any().custom((value, helpers) => {
    if (value === null || value === undefined || value === '') {
        return [];
    }
    let arr = [];
    if (typeof value === 'string') {
        arr = value.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(value)) {
        arr = value.map(s => typeof s === 'string' ? s.trim() : s).filter(Boolean);
    } else {
        return helpers.message('{#label} must be a valid array or comma-separated string of ObjectIds');
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    for (const item of arr) {
        if (typeof item !== 'string' || !objectIdRegex.test(item)) {
            return helpers.message('{#label} contains an invalid ObjectId: ' + item);
        }
    }
    return arr;
});

const mediaItem = Joi.object({
    MediaLocation: Joi.string().allow('').optional(),
    IsMainMedia: Joi.boolean().optional(),
    MediaSeqNo: Joi.number().optional(),
    _id: objectIdLike.allow('', null).optional()
}).unknown(true);

const mediaArrayOrJson = Joi.any().custom((value, helpers) => {
    if (value === null || value === undefined || value === '') {
        return [];
    }
    let arr = [];
    if (typeof value === 'string') {
        try {
            arr = JSON.parse(value);
        } catch (err) {
            return helpers.message('{#label} must be a valid JSON array string');
        }
    } else if (Array.isArray(value)) {
        arr = value;
    } else {
        return helpers.message('{#label} must be an array or a JSON string representation of an array');
    }

    if (!Array.isArray(arr)) {
        return helpers.message('{#label} must be an array');
    }

    for (const item of arr) {
        const { error } = mediaItem.validate(item);
        if (error) {
            return helpers.message(`{#label} has invalid item: ${error.message}`);
        }
    }

    return arr;
});

const productCore = {
    designNumber: Joi.string().trim().allow('').optional(),
    itemCode: Joi.string().trim().min(1),
    parentItemCode: Joi.string().trim().allow('', null).optional(),
    productTitle: Joi.string().trim().allow('').optional(),
    productDesc: Joi.string().allow('').optional(),
    categoryId: objectIdLike.allow('', null).optional(),
    // subCategoryId: Joi.alternatives().try(objectIdLikeArray, objectIdLike).optional(),
    // collectionId: Joi.alternatives().try(objectIdLikeArray, objectIdLike).optional(),
    // tags: Joi.alternatives().try(objectIdLikeArray, objectIdLike).optional(),
    subCategoryId: objectIdArrayOrCsv.optional(),
    collectionId: objectIdArrayOrCsv.optional(),
    tags: objectIdArrayOrCsv.optional(),
    gender: Joi.string().valid(...Object.values(Constant.GENDER)).optional(),
    metalId: objectIdLike.allow('', null).optional(),
    defaultSize: objectIdLike.allow('', null).optional(),
    appxMetalWgt: Joi.number().optional(),
    qty: Joi.number().optional(),
    height: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
    width: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
    length: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
    labourCode: objectIdLike.allow('', null).optional(),
    otherChargeCode: objectIdLike.allow('', null).optional(),
    isEngraving: Joi.boolean().optional(),
    stonePrice: Joi.number().optional(),
    images: mediaArrayOrJson.optional(),
    videos: mediaArrayOrJson.optional(),
    videoUrl: Joi.string().allow('').optional(),
    // images: Joi.array().items(mediaItem).optional(),
    // videos: Joi.array().items(mediaItem).optional(),
    slug: Joi.string().trim().allow('', null).optional(),
    haveChain: Joi.string().allow('').optional(),
    cMetalId: objectIdLike.allow('', null).optional(),
    cWgt: Joi.number().optional(),
    cLength: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
    // Number ("15") or a range string ("15 to 17" / "15-17") from the import sheet.
    shipmentDays: Joi.alternatives().try(Joi.number(), Joi.string().trim().max(20)).allow('', null).optional(),
    SEODetails: Joi.object().unknown(true).optional(),
    metalPrice: Joi.number().optional(),
    labourPrice: Joi.number().optional(),
    otherChargePrice: Joi.number().optional(),
    SideDiamondPrice: Joi.number().optional(),
    CenterDiamondPrice: Joi.number().optional(),
    TotalDiamondPrice: Joi.number().optional(),
    finalPrice: Joi.number().optional()
};

export const createProductSchema = Joi.object({
    ...productCore,
    itemCode: productCore.itemCode.required()
}).unknown(true);

export const updateProductSchema = Joi.object({
    ...productCore,
    itemCode: productCore.itemCode.optional()
}).unknown(true);

export const listProductsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    categoryId: Joi.alternatives().try(objectIdLikeArray, objectIdLike).optional(),
    collectionId: Joi.alternatives().try(objectIdLikeArray, objectIdLike).optional(),
    tags: Joi.alternatives().try(objectIdLikeArray, objectIdLike).optional(),
    metalId: Joi.alternatives().try(objectIdLikeArray, objectIdLike).optional(),
    ids: Joi.array().items(objectIdLike).optional(),
    status: Joi.string().allow('').optional()
}).unknown(true);

const optionalIdOrIds = Joi.alternatives().try(
    objectIdLike.allow(''),
    objectIdLikeArray,
    Joi.string().allow('')
).optional();

const optionalNumber = Joi.alternatives().try(
    Joi.number(),
    Joi.string().allow('')
).optional();

export const exportProductSchema = Joi.object({
    filters: Joi.object({
        search: Joi.string().allow('').trim().optional(),
        status: Joi.alternatives().try(
            Joi.string().allow(''),
            Joi.array().items(Joi.string())
        ).optional(),
        category: optionalIdOrIds,
        subCategory: optionalIdOrIds,
        collectionId: optionalIdOrIds,
        tags: optionalIdOrIds,
        metalId: optionalIdOrIds,
        itemcode: Joi.string().allow('').optional(),
        parentitemcode: Joi.string().allow('').optional(),
        archived: Joi.alternatives().try(Joi.boolean(), Joi.string().allow('')).optional(),
        minPrice: optionalNumber,
        maxPrice: optionalNumber,
        fromDate: Joi.string().allow('').optional(),
        toDate: Joi.string().allow('').optional()
    }).unknown(true).optional(),
    selectedIds: Joi.array().items(objectIdLike).optional(),
    search: Joi.string().allow('').trim().optional(),
    ids: Joi.array().items(objectIdLike).optional()
}).unknown(true);

export const syncPriceSchema = Joi.object({
    ids: Joi.array().items(objectIdLike).optional(),
    // Same allow-empty treatment as the cart / wishlist ObjectIds — the
    // admin form may submit `productId: ""` when no specific product is
    // targeted (sync-all flow), and Joi's default `string` rule would
    // otherwise reject the empty string.
    productId: objectIdLike.allow('', null).optional()
}).unknown(true);

export const productIdParamSchema = Joi.object({
    id: objectIdLike.required()
});

export const subCategoryIdParamSchema = Joi.object({
    id: objectIdLike.required()
});

export const productStatusUpdateSchema = Joi.object({
    status: Joi.string().valid(
        Constant.PRODUCT_STATUS.AVALIABLE,
        Constant.PRODUCT_STATUS.HOLD
    ).required().messages({
        'any.only': 'Invalid status'
    })
}).unknown(true);

// Admin collection product-picker: toggle one product in/out of a collection.
// Sent as FormData, so every value arrives as a string — `flag` accepts the
// 0/1 the checkbox emits (and the boolean forms, defensively).
// NOTE: `validate` runs with stripUnknown:true, so every field must be declared.
export const updateCollectionInJewellerySchema = Joi.object({
    jewelryId: objectIdLike.required(),
    collectionId: objectIdLike.required(),
    flag: Joi.alternatives()
        .try(
            Joi.number().integer().valid(0, 1),
            Joi.string().trim().valid("0", "1", "true", "false"),
            Joi.boolean()
        )
        .required(),
});
