import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import {
    add_stone_group_default_db,
    update_stone_group_default_db,
    get_stone_group_defaults_db,
    delete_stone_group_default_db,
    toggle_default_db,
    update_status_db,
    find_stone_group_default_db
} from "../services/stoneGroupDefault.services.js";
import StoneGroupDefault from "../models/stoneGroupDefault.model.js";

/**
 * Add / rotate a stone group default setting or quality entry
 */
export const add_stone_group_default = async (req, res) => {
    try {
        req.body.createdBy = req.user.userId;

        if (req.body.stoneType === "diamond") {
            req.body.type = null;
            req.body.color = req.body.color?.trim().toUpperCase();
            req.body.clarity = req.body.clarity?.trim().toUpperCase();
            if (!req.body.displayName) {
                req.body.displayName = `${req.body.color}/${req.body.clarity}`;
            }
        } else if (req.body.stoneType === "color stone") {
            req.body.color = null;
            req.body.clarity = null;
            if (!req.body.displayName) {
                req.body.displayName = req.body.type ? (req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1)) : "Color Stone";
            }
        }

        // Check unique constraint for non-deleted quality combinations
        const uniqueQuery = {
            stoneType: req.body.stoneType,
            isDeleted: false
        };
        if (req.body.stoneType === "diamond") {
            uniqueQuery.color = req.body.color;
            uniqueQuery.clarity = req.body.clarity;
            uniqueQuery.origin = req.body.origin || "Both";
        } else {
            uniqueQuery.type = req.body.type;
        }

        const exists = await find_stone_group_default_db(uniqueQuery);
        if (exists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "This stone group quality configuration already exists."
            });
        }

        const created = await add_stone_group_default_db(req.body);

        if (!created) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: MESSAGES.COMMON.INTERNAL_ERROR
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group setting created successfully",
            data: created
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Update an existing default setting or quality entry
 */
export const update_stone_group_default = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (req.body.stoneType === "diamond") {
            req.body.type = null;
            req.body.color = req.body.color?.trim().toUpperCase();
            req.body.clarity = req.body.clarity?.trim().toUpperCase();
            if (!req.body.displayName) {
                req.body.displayName = `${req.body.color}/${req.body.clarity}`;
            }
        } else if (req.body.stoneType === "color stone") {
            req.body.color = null;
            req.body.clarity = null;
            if (!req.body.displayName) {
                req.body.displayName = req.body.type ? (req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1)) : "Color Stone";
            }
        }

        const uniqueQuery = {
            _id: { $ne: id },
            stoneType: req.body.stoneType,
            isDeleted: false
        };
        if (req.body.stoneType === "diamond") {
            uniqueQuery.color = req.body.color;
            uniqueQuery.clarity = req.body.clarity;
            uniqueQuery.origin = req.body.origin || "Both";
        } else {
            uniqueQuery.type = req.body.type;
        }

        const exists = await find_stone_group_default_db(uniqueQuery);
        if (exists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "This stone group quality configuration already exists."
            });
        }

        const updated = await update_stone_group_default_db(id, req.body, userId);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Entry not found"
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group setting updated successfully",
            data: updated
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Get paginated list of stone group settings (both active and historical)
 */
export const get_stone_group_defaults = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 50;
        const skip = (page - 1) * limit;
        const { stoneType, search } = req.body;

        const filter = { isDeleted: false };
        if (stoneType) {
            filter.stoneType = stoneType;
        }
        if (search) {
            filter.$or = [
                { displayName: { $regex: search, $options: "i" } },
                { color: { $regex: search, $options: "i" } },
                { clarity: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } }
            ];
        }

        const { data, total } = await get_stone_group_defaults_db(filter, skip, limit);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Defaults fetched successfully",
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

/**
 * Get currently active stone group defaults (one for Diamond, one for Gemstone)
 */
export const get_active_stone_group_defaults = async (req, res) => {
    try {
        const activeDefaults = await StoneGroupDefault.find({ isDeleted: false, isDefault: true })
            .lean();

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Active defaults fetched successfully",
            data: activeDefaults
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Delete (soft delete) a default setting
 */
export const delete_stone_group_default = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const updated = await delete_stone_group_default_db(id, userId);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group default deleted successfully",
            data: updated
        });
    } catch (error) {
        const isClientError = error.message.includes("Cannot delete") || error.message.includes("not found");
        return res.status(isClientError ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: isClientError ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Toggle default status of a setting
 */
export const toggle_stone_group_default = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const updated = await toggle_default_db(id, userId);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Default status toggled successfully",
            data: updated
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Toggle active/suspended status of a setting
 */
export const update_stone_group_status = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const entry = await StoneGroupDefault.findById(id);
        if (!entry || entry.isDeleted) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Entry not found"
            });
        }

        const newStatus = entry.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;

        const updated = await update_status_db(id, newStatus, userId);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Status updated successfully",
            data: updated
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
