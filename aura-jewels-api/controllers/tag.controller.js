import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import {
    add_tag_db,
    get_tag_db,
    update_tag_db,
    delete_tag_db,
    check_unique_tag,
    update_tag_status_db
} from "../services/tag.services.js";

export const add_tag = async (req, res) => {
    try {
        const exist = await check_unique_tag({ name: req.body.name });
        if (exist) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.TAG.EXISTS
            });
        }

        req.body.createdBy = req.user.userId;
        const created = await add_tag_db(req.body);
        if (!created) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: MESSAGES.COMMON.INTERNAL_ERROR,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.TAG.ADDED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_tag = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.body.search || "";

        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const { data, total } = await get_tag_db(filter, skip, limit);

        const finalData = data.map(t => ({
            _id: t._id,
            name: t.name,
            description: t.description,
            acceptableValues: t.acceptableValues,
            sort: t.sort,
            isMenu: t.isMenu || false,
            status: t.status
        }));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.TAG.LIST_FETCHED,
            data: finalData,
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

export const update_tag = async (req, res) => {
    try {
        const exist = await check_unique_tag({
            name: req.body.name,
            _id: { $ne: req.params.id }
        });

        if (exist) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.TAG.EXISTS
            });
        }

        req.body.updatedBy = req.user.userId;
        const updated = await update_tag_db(req.params.id, req.body);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.TAG.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.TAG.UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const delete_tag = async (req, res) => {
    try {
        const deleted = await delete_tag_db(req.params.id);

        if (deleted) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.TAG.DELETED
            });
        }

        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: MESSAGES.TAG.NOT_FOUND
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_tag_status = async (req, res) => {
    try {
        const exist = await check_unique_tag({ _id: req.params.id });

        if (!exist) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.TAG.NOT_FOUND
            });
        }

        const status = exist.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;

        const updated = await update_tag_status_db(req.params.id, status);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.TAG.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.TAG.STATUS_UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
