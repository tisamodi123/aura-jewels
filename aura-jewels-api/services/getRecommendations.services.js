import ProductMaster from "../models/product.model.js";
import Constant from "../constants/user.constant.js";
import mongoose from "mongoose";
import { appendMediaUrls } from "../utils/imageUrl.js";

const PRODUCT_CARD_PROJECTION = {
    _id: 1,
    slug: 1,
    itemCode: 1,
    productTitle: 1,
    finalPrice: 1,
    images: {
        $slice: ["$images", 1]
    }
};

// -------------------------------------
// SERVICE
// -------------------------------------

export const getRecommendationsService = async (productId) => {
    const product = await ProductMaster.findOne({
        _id: productId,
        isDeleted: 0,
        status: Constant.PRODUCT_STATUS.AVALIABLE
    }).lean();

    if (!product) {
        throw new Error("Product not found");
    }

    // -------------------------------------
    // SIMILAR PRODUCTS
    // -------------------------------------

    let similarProducts = [];
    if (
        Array.isArray(
            product.similarProducts
        ) &&
        product.similarProducts.length > 0
    ) {
        similarProducts = await ProductMaster.aggregate([
            {
                $match: {
                    itemCode: {
                        $in: product.similarProducts
                    },
                    isDeleted: 0,
                    status: Constant.PRODUCT_STATUS.AVALIABLE
                }
            },
            appendMediaUrls(),
            {
                $project: PRODUCT_CARD_PROJECTION
            }
        ]);
    } else {
        similarProducts =
            await ProductMaster.aggregate([
                {
                    $match: {
                        _id: {
                            $ne:
                                new mongoose.Types.ObjectId(
                                    productId
                                )
                        },
                        categoryId: product.categoryId,
                        isDeleted: 0,
                        status: Constant.PRODUCT_STATUS.AVALIABLE
                    }
                },
                {
                    $sample: {
                        size: 10
                    }
                },
                appendMediaUrls(),
                {
                    $project: PRODUCT_CARD_PROJECTION
                }
            ]);
    }


    // -------------------------------------
    // COMBINE WITH PRODUCTS
    // -------------------------------------

    let combineWithProducts = [];
    if (
        Array.isArray(
            product.combineWith
        ) &&
        product.combineWith.length > 0
    ) {

        combineWithProducts =
            await ProductMaster.aggregate([
                {
                    $match: {
                        itemCode: {
                            $in: product.combineWith
                        },
                        isDeleted: 0,
                        status: Constant.PRODUCT_STATUS.AVALIABLE
                    }
                },
                appendMediaUrls(),
                {
                    $project: PRODUCT_CARD_PROJECTION
                }
            ]);
    }
    // let matchingProducts = [];

    // matchingProducts =
    //     await ProductMaster.aggregate([
    //         {
    //             $match: {

    //                 _id: {
    //                     $ne:
    //                         new mongoose.Types.ObjectId(
    //                             productId
    //                         )
    //                 },

    //                 collectionId: {
    //                     $in:
    //                         product.collectionId || []
    //                 },

    //                 isDeleted: 0,

    //                 status:
    //                     Constant.PRODUCT_STATUS.AVALIABLE
    //             }
    //         },

    //         {
    //             $sample: {
    //                 size: 8
    //             }
    //         },

    //         {
    //             $project:
    //                 PRODUCT_CARD_PROJECTION
    //         }
    //     ]);

    let youMayAlsoLike = [];

    youMayAlsoLike =
        await ProductMaster.aggregate([
            {
                $match: {

                    _id: {
                        $ne:
                            new mongoose.Types.ObjectId(
                                productId
                            )
                    },

                    categoryId:
                        product.categoryId,

                    isDeleted: 0,

                    status:
                        Constant.PRODUCT_STATUS.AVALIABLE
                }
            },

            {
                $sample: {
                    size: 12
                }
            },
            appendMediaUrls(),
            {
                $project:
                    PRODUCT_CARD_PROJECTION
            }
        ]);
    // -------------------------------------
    // RETURN
    // -------------------------------------

    return {
        similarProducts,
        combineWithProducts,
        // matchingProducts,
        youMayAlsoLike
    };
};