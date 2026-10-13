import Constant from "../../constants/user.constant.js";
import ProductMaster from "../../models/product.model.js";
import Category from "../../models/category.model.js";
import CollectionModel from "../../models/collection.model.js";
import mongoose from "mongoose";
import { appendMediaUrls } from "../../utils/imageUrl.js";
import Parameter from "../../models/parameter.model.js";
import BaseURL from "../../constants/baseUrl.js";
import { calculateRingValue } from "../../utils/calculateRingValue.js";
import sizesModel from "../../models/sizes.model.js";

import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";
import { getRecommendationsService } from "../../services/getRecommendations.services.js";
import { getProductDetailsService, getProductDetailsServiceV2, getProductListService, getProductListServiceV2 } from "../../services/product.services.js";
import stoneGroupModel from "../../models/stoneGroup.model.js";
import Label from "../../models/label.model.js";
import Tag from "../../models/tag.model.js";
import { getExchangeRateFromRequest, adjustPricesForCurrency } from "../../utils/currencyConvertor.js";

export const productList = async function (req, res) {
    try {
        const { rate, currency } = await getExchangeRateFromRequest(req);
        const { total, products } = await getProductListService({ ...req.body, exchangeRate: rate });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PRODUCT.FETCHED,
            total,
            data: products
        });

    } catch (error) {
        console.error("productList error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const productListV2 = async function (req, res) {
    try {
        const { rate, currency } = await getExchangeRateFromRequest(req);
        const { total, products } = await getProductListServiceV2({ ...req.body, exchangeRate: rate });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PRODUCT.FETCHED,
            total,
            data: products
        });

    } catch (error) {
        console.error("productListV2 error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// export const productDetails = async function (req, res) {
//     try {
//         const productSlug = req.params.slug;        
//         // new logic : if ring size comes as then calclate price for all variant for that size before sending  

//         const pipeline = [
//             // GET MAIN PRODUCT
//             {
//                 $match: {
//                     slug: productSlug,
//                     isDeleted: 0,
//                     status: Constant.PRODUCT_STATUS.AVALIABLE
//                 }
//             },
//             // METAL
//             {
//                 $lookup: {
//                     from: "metals",
//                     localField: "metalId",
//                     foreignField: "_id",
//                     as: "metalDetails"
//                 }
//             },
//             { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },

//             // // METAL TYPE
//             // {
//             //     $lookup: {
//             //         from: "metaltypes",
//             //         localField: "metalType",
//             //         foreignField: "_id",
//             //         as: "metalTypeDetail"
//             //     }
//             // },
//             // { $unwind: { path: "$metalTypeDetail", preserveNullAndEmptyArrays: true } },

//             // // METAL STAMP
//             // {
//             //     $lookup: {
//             //         from: "metalstamps",
//             //         localField: "metalStamp",
//             //         foreignField: "_id",
//             //         as: "metalStampDetail"
//             //     }
//             // },
//             // { $unwind: { path: "$metalStampDetail", preserveNullAndEmptyArrays: true } },

//             // CATEGORY
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "categoryId",
//                     foreignField: "_id",
//                     as: "categoryDetails"
//                 }
//             },
//             { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

//             // Sizes lookup by category Name
//             {
//                 $lookup: {
//                     from: "sizes",
//                     let: { categoryId: "$categoryDetails._id" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$category", "$$categoryId"] },
//                                         { $eq: ["$isDeleted", 0] }
//                                     ]
//                                 },
//                                 isDeleted: 0,
//                                 status: "ACTIVE"
//                             }
//                         },
//                         {
//                             $sort: { sort: 1 }
//                         }
//                     ],
//                     as: "sizes"
//                 }
//             },

//             // SUBCATEGORY
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "subCategoryId",
//                     foreignField: "_id",
//                     as: "subCategoryDetails"
//                 }
//             },

//             // COLLECTION
//             {
//                 $lookup: {
//                     from: "collections",
//                     localField: "collectionId",
//                     foreignField: "_id",
//                     as: "collectionDetails"
//                 }
//             },

//             // STONES
//             {
//                 $lookup: {
//                     from: "productstones",
//                     localField: "_id",
//                     foreignField: "productId",
//                     pipeline: [
//                         {
//                             $lookup: {
//                                 from: "parameters",
//                                 localField: "shape",
//                                 foreignField: "_id",
//                                 as: "shapeParam"
//                             }
//                         },
//                         { $unwind: { path: "$shapeParam", preserveNullAndEmptyArrays: true } },
//                         {
//                             $lookup: {
//                                 from: "parameters",
//                                 localField: "color",
//                                 foreignField: "_id",
//                                 as: "colorParam"
//                             }
//                         },
//                         { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },
//                         {
//                             $lookup: {
//                                 from: "parameters",
//                                 localField: "clarity",
//                                 foreignField: "_id",
//                                 as: "clarityParam"
//                             }
//                         },
//                         { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },
//                         {
//                             $lookup: {
//                                 from: "stonegroups",
//                                 localField: "stoneGroup",
//                                 foreignField: "_id",
//                                 as: "stoneGroupDetail"
//                             }
//                         },
//                         { $unwind: { path: "$stoneGroupDetail", preserveNullAndEmptyArrays: true } },
//                         {
//                             $addFields: {
//                                 shape: { $ifNull: ["$shapeParam.code", "$shape"] },
//                                 shapeImage: { $ifNull: ["$shapeParam.image", ""] },
//                                 color: { $ifNull: ["$colorParam.code", "$color"] },
//                                 clarity: { $ifNull: ["$clarityParam.code", "$clarity"] },
//                                 stoneGroup: { $ifNull: ["$stoneGroupDetail", null] },
//                                 finalValue: {
//                                     $multiply: [
//                                         { $ifNull: ["$price", "$stoneGroupDetail.amount", 0] },
//                                         { $ifNull: ["$weight", 0] }
//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $project: {
//                                 shapeParam: 0,
//                                 colorParam: 0,
//                                 clarityParam: 0,
//                                 stoneGroupDetail: 0
//                             }
//                         }
//                     ],
//                     as: "stoneDetails"
//                 }
//             },

//             // VARIANTS LOGIC (IMPORTANT)
//             {
//                 $lookup: {
//                     from: "productmasters",
//                     let: {
//                         itemCode: "$itemCode",
//                         parentCode: "$parentItemCode"
//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $or: [
//                                         { $eq: ["$itemCode", "$$itemCode"] },
//                                         { $eq: ["$parentItemCode", "$$itemCode"] },
//                                         {
//                                             $and: [
//                                                 { $ne: ["$$parentCode", ""] },
//                                                 { $ne: ["$$parentCode", null] },
//                                                 { $eq: ["$parentItemCode", "$$parentCode"] }
//                                             ]
//                                         },
//                                         {
//                                             $and: [
//                                                 { $ne: ["$$parentCode", ""] },
//                                                 { $ne: ["$$parentCode", null] },
//                                                 { $eq: ["$itemCode", "$$parentCode"] }
//                                             ]
//                                         }
//                                     ]
//                                 }
//                             }
//                         },


//                         // FILTER ACTIVE
//                         {
//                             $match: {
//                                 isDeleted: 0,
//                                 status: Constant.PRODUCT_STATUS.AVALIABLE
//                             }
//                         },
//                         // METAL
//                         {
//                             $lookup: {
//                                 from: "metals",
//                                 localField: "metalId",
//                                 foreignField: "_id",
//                                 as: "metalDetails"
//                             }
//                         },
//                         { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },

//                         // METAL TYPE DETAILS
//                         // {
//                         //     $lookup: {
//                         //         from: "metaltypes",
//                         //         localField: "metalType",
//                         //         foreignField: "_id",
//                         //         as: "metalTypeDetail"
//                         //     }
//                         // },
//                         // { $unwind: { path: "$metalTypeDetail", preserveNullAndEmptyArrays: true } },

//                         // METAL STAMP DETAILS
//                         // {
//                         //     $lookup: {
//                         //         from: "metalstamps",
//                         //         localField: "metalStamp",
//                         //         foreignField: "_id",
//                         //         as: "metalStampDetail"
//                         //     }
//                         // },
//                         // { $unwind: { path: "$metalStampDetail", preserveNullAndEmptyArrays: true } },

//                         // STONE DETAILS (IMPORTANT)
//                         {
//                             $lookup: {
//                                 from: "productstones",
//                                 localField: "_id",
//                                 foreignField: "productId",
//                                 pipeline: [
//                                     {
//                                         $lookup: {
//                                             from: "parameters",
//                                             localField: "shape",
//                                             foreignField: "_id",
//                                             as: "shapeParam"
//                                         }
//                                     },
//                                     { $unwind: { path: "$shapeParam", preserveNullAndEmptyArrays: true } },
//                                     {
//                                         $lookup: {
//                                             from: "parameters",
//                                             localField: "color",
//                                             foreignField: "_id",
//                                             as: "colorParam"
//                                         }
//                                     },
//                                     { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },
//                                     {
//                                         $lookup: {
//                                             from: "parameters",
//                                             localField: "clarity",
//                                             foreignField: "_id",
//                                             as: "clarityParam"
//                                         }
//                                     },
//                                     { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },
//                                     {
//                                         $lookup: {
//                                             from: "stonegroups",
//                                             localField: "stoneGroup",
//                                             foreignField: "_id",
//                                             as: "stoneGroupDetail"
//                                         }
//                                     },
//                                     { $unwind: { path: "$stoneGroupDetail", preserveNullAndEmptyArrays: true } },
//                                     {
//                                         $project: {
//                                             shape: { $ifNull: ["$shapeParam.code", "$shape"] },
//                                             shapeImage: { $ifNull: ["$shapeParam.image", ""] },
//                                             totalCarat: 1,
//                                             color: { $ifNull: ["$colorParam.code", "$color"] },
//                                             clarity: { $ifNull: ["$clarityParam.code", "$clarity"] },
//                                             type: 1,
//                                             pieces: 1,
//                                             wgt: 1,
//                                             weight: 1,
//                                             price: 1,
//                                             size: 1,
//                                             stoneGroup: { $ifNull: ["$stoneGroupDetail", null] },
//                                             finalValue: {
//                                                 $multiply: [
//                                                     { $ifNull: ["$stoneGroupDetail.amount", 0] },
//                                                     { $ifNull: ["$weight", "$totalCarat", "$wgt", 0] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 ],
//                                 as: "stoneDetails"
//                             }
//                         },

//                         // FINAL SHAPE (flatten first stone or center)
//                         {
//                             $addFields: {
//                                 stone: { $arrayElemAt: ["$stoneDetails", 0] }
//                             }
//                         },

//                         appendMediaUrls(),

//                         // FINAL OUTPUT
//                         {
//                             $project: {
//                                 productDesc: 1,
//                                 videos: 1,
//                                 appxMetalWgt: 1,

//                                 finalPrice: 1,
//                                 metalPrice: 1,
//                                 labourPrice: 1,
//                                 otherChargePrice: 1,
//                                 CenterDiamondPrice: 1,
//                                 SideDiamondPrice: 1,
//                                 TotalDiamondPrice: 1,
//                                 stoneDetails: 1,
//                                 sizes: 1,
//                                 _id: 1,
//                                 itemCode: 1,
//                                 parentItemCode: 1,
//                                 productTitle: 1,
//                                 images: 1,

//                                 width: 1,
//                                 length: 1,
//                                 height: 1,

//                                 slug: 1,

//                                 // metal
//                                 metalTypeDetail: {
//                                     _id: "$metalDetails._id",
//                                     metalName: "$metalDetails.type",
//                                     colorCode: "$metalDetails.color"
//                                 },

//                                 metalStampDetail: {
//                                     _id: "$metalDetails._id",
//                                     karat: "$metalDetails.stamp"
//                                 },

//                                 // stone
//                                 shape: "$stone.shape",
//                                 shapeImage: "$stone.shapeImage",
//                                 totalCarat: "$stone.totalCarat",
//                                 color: "$stone.color",
//                                 clarity: "$stone.clarity"
//                             }
//                         }
//                     ],
//                     as: "variants"
//                 }
//             },

//             // SIMILAR PRODUCTS — resolved by itemCode lookup so the storefront
//             // gets ready-to-render cards (title, price, image, slug).
//             {
//                 $lookup: {
//                     from: "productmasters",
//                     let: { codes: { $ifNull: ["$similarProducts", []] } },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $in: ["$itemCode", "$$codes"] },
//                                 isDeleted: 0,
//                                 status: Constant.PRODUCT_STATUS.AVALIABLE
//                             }
//                         },
//                         {
//                             $project: {
//                                 _id: 1, itemCode: 1, slug: 1,
//                                 productTitle: 1, finalPrice: 1,
//                                 images: { $slice: ["$images", 1] }
//                             }
//                         }
//                     ],
//                     as: "similarProductDetails"
//                 }
//             },

//             // COMBINE WITH — same shape; "Complete the look" upsell row.
//             {
//                 $lookup: {
//                     from: "productmasters",
//                     let: { codes: { $ifNull: ["$combineWith", []] } },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $in: ["$itemCode", "$$codes"] },
//                                 isDeleted: 0,
//                                 status: Constant.PRODUCT_STATUS.AVALIABLE
//                             }
//                         },
//                         {
//                             $project: {
//                                 _id: 1, itemCode: 1, slug: 1,
//                                 productTitle: 1, finalPrice: 1,
//                                 images: { $slice: ["$images", 1] }
//                             }
//                         }
//                     ],
//                     as: "combineWithDetails"
//                 }
//             },

//             appendMediaUrls(),
//             {
//                 $project: {
//                     _id: 1,
//                     designNumber: 1,
//                     itemCode: 1,
//                     parentItemCode: 1,
//                     productTitle: 1,
//                     productDesc: 1,
//                     categoryId: 1,
//                     subCategoryId: 1,
//                     collectionId: 1,
//                     tags: 1,
//                     gender: 1,
//                     metalId: 1,
//                     appxMetalWgt: 1,
//                     qty: 1,
//                     height: 1,
//                     width: 1,
//                     length: 1,
//                     labourCode: 1,
//                     otherChargeCode: 1,
//                     isEngraving: 1,
//                     images: 1,
//                     videos: 1,
//                     slug: 1,
//                     haveChain: 1,
//                     cMetalId: 1,
//                     cWgt: 1,
//                     cLength: 1,
//                     shipmentDays: 1,
//                     SEODetails: 1,
//                     status: 1,
//                     isDeleted: 1,
//                     createdBy: 1,
//                     createdAt: 1,
//                     updatedAt: 1,

//                     CenterDiamondPrice: 1,
//                     SideDiamondPrice: 1,
//                     TotalDiamondPrice: 1,
//                     finalPrice: 1,
//                     labourPrice: 1,
//                     metalPrice: 1,
//                     otherChargePrice: 1,

//                     metalTypeDetail: {
//                         _id: "$metalDetails._id",
//                         metalName: "$metalDetails.type",
//                         colorCode: "$metalDetails.color"
//                     },
//                     metalStampDetail: {
//                         _id: "$metalDetails._id",
//                         karat: "$metalDetails.stamp"
//                     },
//                     metalDetails: 1,

//                     categoryDetails: 1,
//                     subCategoryDetails: 1,
//                     collectionDetails: 1,
//                     stoneDetails: 1,
//                     variants: 1,
//                     sizes: 1,
//                     similarProducts: 1,
//                     combineWith: 1,
//                     similarProductDetails: 1,
//                     combineWithDetails: 1
//                 }
//             }
//         ];

//         const result = await ProductMaster.aggregate(pipeline);

//         if (!result.length) {
//             return res.status(STATUS_CODE.NOT_FOUND).json({
//                 errorCode: STATUS_CODE.NOT_FOUND,
//                 message: MESSAGES.PRODUCT.NOT_FOUND,
//                 data: []
//             });
//         }

//         const Baseurl = BaseURL(req);
//         const productData = result[0];

//         // Format shapeImage inside stoneDetails
//         if (productData.stoneDetails && Array.isArray(productData.stoneDetails)) {
//             productData.stoneDetails = productData.stoneDetails.map(stone => {
//                 if (stone.shapeImage && !stone.shapeImage.startsWith("http")) {
//                     stone.shapeImage = `${Baseurl}/uploads/parameterImages/${stone.shapeImage}`;
//                 }
//                 return stone;
//             });
//         }

//         // Format shapeImage inside variants
//         if (productData.variants && Array.isArray(productData.variants)) {
//             productData.variants = productData.variants.map(variant => {
//                 if (variant.shapeImage && !variant.shapeImage.startsWith("http")) {
//                     variant.shapeImage = `${Baseurl}/uploads/parameterImages/${variant.shapeImage}`;
//                 }
//                 return variant;
//             });
//         }

//         // Prefix the CDN host onto similarProductDetails / combineWithDetails
//         // images. `appendMediaUrls()` only walks the root product, so nested
//         // sub-product images still carry bare MediaLocation filenames.
//         const formatCardImages = (arr) =>
//             (arr || []).map((p) => ({
//                 ...p,
//                 images: (p.images || []).map((img) => {
//                     const loc = img?.MediaLocation || "";
//                     return {
//                         ...img,
//                         MediaLocation: loc.startsWith("http")
//                             ? loc
//                             : `${Constant.PRODUCT_AWS_ZOOM_IMAGE_URL}${loc}`,
//                     };
//                 }),
//             }));

//         productData.similarProductDetails = formatCardImages(productData.similarProductDetails);
//         productData.combineWithDetails = formatCardImages(productData.combineWithDetails);

//         return res.status(STATUS_CODE.OK).json({
//             errorCode: STATUS_CODE.OK,
//             message: MESSAGES.PRODUCT.DETAIL_FETCHED,
//             data: productData
//         });

//     } catch (error) {
//         console.error("productDetails error:", error);
//         return res.status(STATUS_CODE.INTERNAL_ERROR).json({
//             errorCode: STATUS_CODE.INTERNAL_ERROR,
//             message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
//         });
//     }
// };

export const productDetails = async function (req, res) {
    try {
        const productSlug = req.params.slug;
        if (!productSlug) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Product identifier is required."
            });
        }

        const baseUrl = BaseURL(req);
        const { rate, currency } = await getExchangeRateFromRequest(req);

        // Fetch and process details using the modular service
        const productData = await getProductDetailsService({
            slug: productSlug,
            queryParams: req.query,
            baseUrl,
            exchangeRate: rate
        });

        if (!productData) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PRODUCT.NOT_FOUND,
                data: []
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PRODUCT.DETAIL_FETCHED,
            data: productData
        });

    } catch (error) {
        console.error("productDetails error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const productDetailsV2 = async function (req, res) {
    try {
        const productSlug = req.params.slug;
        if (!productSlug) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Product identifier is required."
            });
        }

        const baseUrl = BaseURL(req);
        const { rate, currency } = await getExchangeRateFromRequest(req);

        // Fetch and process details using the modular V2 service
        const productData = await getProductDetailsServiceV2({
            slug: productSlug,
            queryParams: req.query,
            baseUrl,
            exchangeRate: rate
        });

        if (!productData) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PRODUCT.NOT_FOUND,
                data: []
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PRODUCT.DETAIL_FETCHED,
            data: productData
        });

    } catch (error) {
        console.error("productDetailsV2 error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_product_price_for_size = async function (req, res) {
    try {
        const { productId, size } = req.body;

        const product = await ProductMaster.findById(productId);
        if (!product) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PRODUCT.NOT_FOUND
            });
        }

        const sizeDoc = await sizesModel.findById(size);
        if (!sizeDoc) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PRODUCT.SIZE_NOT_FOUND
            });
        }

        const newPriceData = await calculateRingValue({ product, size: sizeDoc });

        if (!newPriceData) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PRODUCT.PRICE_CALC_FAILED
            });
        }

        const { rate, currency } = await getExchangeRateFromRequest(req);
        const adjustedPriceData = adjustPricesForCurrency(newPriceData, rate, currency);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PRODUCT.PRICE_CALCULATED,
            data: adjustedPriceData
        });
    } catch (error) {
        console.error("get_product_price_for_size error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getRecommendations = async (req, res) => {
    try {

        const { id } = req.params;

        const data = await getRecommendationsService(id);

        const { rate, currency } = await getExchangeRateFromRequest(req);
        const adjustedData = adjustPricesForCurrency(data, rate, currency);

        return res.status(200).json({
            errorCode: 200,
            message: "Recommendations fetched successfully",
            data: adjustedData
        });

    } catch (error) {

        return res.status(500).json({
            errorCode: 500,
            message: error.message
        });
    }
};

export const getProductsByTags = async (req, res) => {
    try {
        const { tagIds } = req.body;
        if (!Array.isArray(tagIds) || tagIds.length === 0) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "tagIds array is required",
                data: []
            });
        }

        const tags = await Tag.find({
            _id: { $in: tagIds.map(id => new mongoose.Types.ObjectId(id)) },
            status: Constant.STATUS.ACTIVE
        }).sort({ sort: 1 }).lean();

        const result = await Promise.all(tags.map(async (tag) => {
            const products = await ProductMaster.aggregate([
                {
                    $match: {
                        tags: tag._id,
                        isDeleted: 0,
                        status: Constant.PRODUCT_STATUS.AVALIABLE,
                        parentItemCode: { $in: ["", null] }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $limit: 8 },
                appendMediaUrls(),
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        slug: 1,
                        images: 1,
                        finalPrice: 1,
                        tags: 1
                    }
                }
            ]);

            return {
                _id: tag._id,
                name: tag.name,
                products
            };
        }));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Products fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("getProductsByTags error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message,
            data: []
        });
    }
};