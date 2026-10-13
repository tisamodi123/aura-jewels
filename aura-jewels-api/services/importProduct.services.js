import ProductStone from "../models/productStone.model.js";
import ProductMaster from "../models/product.model.js";
import StockFile from "../models/stockFile.model.js";

// NOTE: get_all_labour_db / get_other_charge_db / get_all_metal_type_db /
// get_all_metal_stamp_db were removed. Each imported a model
// (labourCharges / otherCharges / metalType / metalStamp) whose file is
// entirely commented out and therefore exports nothing. That made this whole
// module throw on import:
//   "'../models/labourCharges.model.js' does not provide an export named 'default'"
// Nothing imported it, so it was inert — but any future import would have
// crashed the API at boot. Charges now live in charges.model.js and metal
// type/stamp in metal.model.js.


export const upsert_product_db = async (product) => {
    try {
        const existing = await ProductMaster.findOne({
            itemCode: product.itemCode
        });

        if (existing) {
            await ProductMaster.updateOne(
                { _id: existing._id },
                { $set: product }
            );
            return { type: "update" };
        } else {
            await ProductMaster.create(product);
            return { type: "insert" };
        }
    } catch (error) {
        throw error;
    }
};

export const get_products_db = async (filter) => {
    try {
        return await ProductMaster.find(filter);
    } catch (error) {
        throw error;
    }
};

import Category from "../models/category.model.js";

export const get_all_category_db = async (filter) => {
    try {
        return await Category.find(filter);
    } catch (error) {
        throw error;
    }
};

import StoneGroup from "../models/stoneGroup.model.js";

export const get_all_stone_group_db = async (filter) => {
    try {
        return await StoneGroup.find(filter);
    } catch (error) {
        throw error;
    }
};

import StockFileHistory from "../models/stockFile.model.js";

export const insert_diamonds_stock_file_history_db = async (data) => {
    try {
        return await StockFileHistory.create(data);
    } catch (error) {
        throw error;
    }
};

export const insert_product_stone_db = async (stones) => {
    try {
        if (!Array.isArray(stones) || !stones.length) return [];

        // Clean + map fields properly
        const formatted = stones.map((s) => ({
            itemCode: s.itemCode,
            productId: s.productId,
            type: s.type,
            stoneGroup: s.stoneGroup,

            pieces: Number(s.pieces) || 0,
            weight: Number(s.weight || s.wgt) || 0,
            totalCarat: Number(s.totalCarat || s.weight || s.wgt) || 0,

            shape: s.shape || null,
            color: s.color || null,
            clarity: s.clarity || null,
            size: s.size || null,

            price: s.price || 0,
            createdBy: s.createdBy || null
        }));

        return await ProductStone.insertMany(formatted, { ordered: false });

    } catch (error) {
        console.error("insert_product_stone_db error:", error);
        throw error;
    }
};

export const delete_product_stone_db = async (filter) => {
    try {
        if (!filter || Object.keys(filter).length === 0) return;

        return await ProductStone.deleteMany(filter);
    } catch (error) {
        console.error("delete_product_stone_db error:", error);
        throw error;
    }
};

export const get_product_stone_by_productId_db = async (productId) => {
    try {
        return await ProductStone.find({ productId });
    } catch (error) {
        throw error;
    }
};

export const insert_stock_file_db = async (data) => {
    try {
        return await StockFile.create({
            userFileName: data.userFileName,
            fileName: data.fileName,
            uploadedBy: data.uploadedBy,
            uploadedFileUrl: data.uploadedFileUrl,
            rejectedUrl: data.rejectedUrl,
            batchLogs: data.batchLogs || {}
        });
    } catch (error) {
        console.error("insert_stock_file_db error:", error);
        throw error;
    }
};
