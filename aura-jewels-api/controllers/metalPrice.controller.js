import {
    create_metal_price_db,
    get_metal_price_list_db,
    delete_metal_price_db,
    get_active_metal_price_db,
    update_metal_price_status_db,
    get_single_metal_price_db,
    suspend_active_metal_price_db
} from "../services/metalPrice.services.js";
import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import ProductMaster from "../models/product.model.js";
import { calculateProductsPriceService } from "../services/calcProductPrice.services.js";
import { sync_metal_price_db } from "../services/metal.services.js";

// H9: when the active metal rate changes, every product's stored metalPrice /
// finalPrice is stale until re-priced. Kick this off (non-blocking) so the admin
// response returns immediately while prices refresh in the background.
const repriceAllProductsOnMetalChange = async () => {
    try {
        const ids = await ProductMaster.find({ isDeleted: 0 }).select("_id").lean();
        if (ids.length) {
            await calculateProductsPriceService({ productIds: ids.map((p) => p._id) });
            console.log(`[metal-price] repriced ${ids.length} products after rate change`);
        }
    } catch (e) {
        console.error("[metal-price] reprice-on-change failed:", e?.message);
    }
};

export const create_metal_price = async (req, res) => {
    try {
        await suspend_active_metal_price_db();
        const data = await create_metal_price_db(
            {
                gold: req.body.gold,
                silver: req.body.silver,
                platinum: req.body.platinum
            },
            req.user.userId
        );
        await sync_metal_price_db();
        // Reprice all products against the new active rate (background).
        repriceAllProductsOnMetalChange();

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL_PRICE.CREATED,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_metal_price = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;

        // `$ne: 1` matches both isDeleted=0 and legacy rows missing the field.
        const filter = { isDeleted: { $ne: 1 } };
        const { data, total } = await get_metal_price_list_db(filter, skip, limit);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_active_metal_price = async (req, res) => {
    try {
        const data = await get_active_metal_price_db();
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_metal_price = async (req, res) => {
    try {
        await suspend_active_metal_price_db();
        const data = await create_metal_price_db(
            {
                gold: req.body.gold,
                silver: req.body.silver,
                platinum: req.body.platinum
            },
            req.user.userId
        );
        await sync_metal_price_db();
        // Reprice all products against the new active rate (background).
        repriceAllProductsOnMetalChange();

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL_PRICE.UPDATED,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const delete_metal_price = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await get_single_metal_price_db({ _id: id });

        if (!record) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.METAL_PRICE.NOT_FOUND
            });
        }

        if (record.status === Constant.STATUS.ACTIVE) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.METAL_PRICE.CANNOT_DELETE_ACTIVE
            });
        }

        await delete_metal_price_db(id);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL_PRICE.DELETED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_metal_price_status = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await get_single_metal_price_db({ _id: id });

        if (!record) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.METAL_PRICE.NOT_FOUND
            });
        }

        if (record.status !== Constant.STATUS.ACTIVE) {
            await suspend_active_metal_price_db();
            await update_metal_price_status_db(id, Constant.STATUS.ACTIVE);
            // Reprice all products against the newly-activated rate (background).
            repriceAllProductsOnMetalChange();
        } else {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.METAL_PRICE.ACTIVE_REQUIRED
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL_PRICE.STATUS_UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
