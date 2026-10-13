import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
    add_metal_db,
    get_metal_list_db,
    update_metal_db,
    delete_metal_db,
    check_unique_metal,
    update_metal_status_db,
    sync_metal_price_db
} from "../services/metal.services.js";

export const add_metal = async (req, res) => {
    try {
        const exist = await check_unique_metal({ name: req.body.name });
        if (exist) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.METAL.EXISTS
            });
        }
        const created = await add_metal_db(req);
        if (!created) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: MESSAGES.COMMON.INTERNAL_ERROR,
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL.ADDED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_metal_list = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.body.search || "";

        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const { data, total } = await get_metal_list_db(filter, skip, limit);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL.LIST_FETCHED,
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

export const update_metal = async (req, res) => {
    try {
        const exist = await check_unique_metal({
            name: req.body.name,
            _id: { $ne: req.params.id }
        });
        if (exist) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.METAL.EXISTS
            });
        }
        const updated = await update_metal_db(req);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.METAL.NOT_FOUND,
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL.UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const delete_metal = async (req, res) => {
    try {
        const deleted = await delete_metal_db(req.params.id);
        if (deleted) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.METAL.DELETED
            });
        }
        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: MESSAGES.METAL.NOT_FOUND
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_metal_status = async (req, res) => {
    try {
        const exist = await check_unique_metal({ _id: req.params.id });
        if (!exist) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.METAL.NOT_FOUND
            });
        }
        const status = exist.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;

        const updated = await update_metal_status_db(req.params.id, status);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.METAL.NOT_FOUND,
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.METAL.STATUS_UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const sync_metal_price = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.AUTH.PASSWORD_REQUIRED
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.AUTH.USER_NOT_FOUND
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(STATUS_CODE.UNAUTHORIZED).json({
                errorCode: STATUS_CODE.UNAUTHORIZED,
                message: MESSAGES.AUTH.INVALID_PASSWORD
            });
        }

        const result = await sync_metal_price_db();
        if (result.error) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: result.error
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: `${MESSAGES.METAL.PRICE_SYNCED} for ${result.count} metals!`
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
