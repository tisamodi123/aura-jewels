import mongoose from "mongoose";
import {
    add_charges_db,
    get_single_charge_db,
    update_charges_db,
    get_charges_list_db,
    delete_charges_db
} from "../services/charges.services.js";

import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const add_charges = async (req, res) => {
    try {
        const { code, type } = req.body;
        const exist = await get_single_charge_db({ code, type });

        if (exist) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CHARGES.EXISTS_CODE_TYPE
            });
        }

        req.body.createBy = req.user.userId;
        const created = await add_charges_db(req.body);
        if (!created) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: MESSAGES.COMMON.INTERNAL_ERROR,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CHARGES.ADDED
        });
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_charges = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.COMMON.INVALID_ID
            });
        }

        const existing = await get_single_charge_db({ _id: id });
        if (!existing) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.CHARGES.NOT_FOUND
            });
        }

        if (req.body.code || req.body.type) {
            const duplicate = await get_single_charge_db({
                code: req.body.code || existing.code,
                type: req.body.type || existing.type,
                _id: { $ne: id }
            });

            if (duplicate) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: MESSAGES.CHARGES.DUPLICATE_CODE_TYPE
                });
            }
        }

        req.body.updateBy = req.user.userId;

        const updated = await update_charges_db(id, req.body);
        if (!updated) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CHARGES.UPDATE_FAILED
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CHARGES.UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_charges = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.body.page) || 1, 1);
        const limit = Math.min(parseInt(req.body.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const search = req.body.search?.trim();

        const filter = {};

        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } }
            ];
        }
        if (req.body.status) filter.status = req.body.status;
        if (req.body.type) filter.type = req.body.type;

        const { data, total } = await get_charges_list_db(filter, skip, limit);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CHARGES.LIST_FETCHED,
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

export const delete_charges = async (req, res) => {
    try {
        const deleted = await delete_charges_db(req.params.id, req.user.userId);
        if (!deleted) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.CHARGES.NOT_FOUND
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CHARGES.DELETED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_charges_status = async (req, res) => {
    try {
        const charge = await get_single_charge_db({ _id: req.params.id });
        if (!charge) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.CHARGES.NOT_FOUND
            });
        }

        const newStatus = charge.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;

        const result = await update_charges_db(req.params.id, {
            status: newStatus,
            updateBy: req.user.userId
        });

        if (!result) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CHARGES.STATUS_UPDATE_FAILED
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CHARGES.STATUS_UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
