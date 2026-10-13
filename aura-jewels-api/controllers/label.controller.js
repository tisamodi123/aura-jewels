import {
    check_unique_label_db,
    create_label_db,
    update_label_db,
    delete_label_db,
    get_label_list_db,
    find_label_using_id_db,
    update_label_status_db
} from "../services/label.services.js";

import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const create_label = async function (req, res) {
    try {
        const { stoneType, color, clarity } = req.body;

        const exists = await check_unique_label_db({ stoneType, color, clarity });
        if (exists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.LABEL.UNIQUE
            });
        }

        const response = await create_label_db(req);
        if (!response) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.LABEL.CREATE_FAILED
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.LABEL.CREATED,
            data: response
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_label = async function (req, res) {
    try {
        const { stoneType, color, clarity } = req.body;
        const id = req.params.id;

        const exists = await check_unique_label_db({
            _id: { $ne: id },
            stoneType,
            color,
            clarity
        });

        if (exists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.LABEL.UNIQUE
            });
        }

        const response = await update_label_db(req);
        if (!response) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.LABEL.NOT_FOUND
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.LABEL.UPDATED,
            data: response
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_label_list = async function (req, res) {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.body.search || "";

        const filter = { isDeleted: 0 };
        if (req.body.stoneType) filter.stoneType = req.body.stoneType;

        if (search) {
            // Escape first: an unescaped "(" throws, and "(a+)+$" is a ReDoS.
            const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const rx = { $regex: safe, $options: "i" };
            // colour/clarity are free text now, so they are searchable too.
            filter.$or = [{ labelName: rx }, { color: rx }, { clarity: rx }];
        }

        const { data, total } = await get_label_list_db(filter, skip, limit);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.LABEL.LIST_FETCHED,
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

export const get_label_detail = async function (req, res) {
    try {
        const id = req.params.id;
        const data = await find_label_using_id_db(id);
        if (!data) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.LABEL.NOT_FOUND
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

export const delete_label = async function (req, res) {
    try {
        const id = req.params.id;
        const exists = await find_label_using_id_db(id);
        if (!exists) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.LABEL.NOT_FOUND
            });
        }

        const deleted = await delete_label_db(id);
        if (!deleted) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.LABEL.DELETE_FAILED
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.LABEL.DELETED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_label_status = async function (req, res) {
    try {
        const id = req.params.id;
        const data = await find_label_using_id_db(id);
        if (!data) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.LABEL.NOT_FOUND
            });
        }

        const newStatus = data.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;

        const updated = await update_label_status_db(id, newStatus);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.LABEL.NOT_FOUND
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.LABEL.STATUS_UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
