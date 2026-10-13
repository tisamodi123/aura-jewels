import ActivityLog from "../models/activityLog.model.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const getActivityLogs = async (req, res) => {
    try {
        const { userId, action, module, page = 1, limit = 10 } = req.body || {};

        const query = {};
        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (module) query.module = module;

        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.max(Number(limit) || 10, 1);
        const skip = (pageNumber - 1) * limitNumber;

        const logs = await ActivityLog.find(query)
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        const total = await ActivityLog.countDocuments(query);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            },
            data: logs
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getActivityLogById = async (req, res) => {
    try {
        const log = await ActivityLog.findById(req.params.id)
            .populate("userId", "name email");

        if (!log) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ACTIVITY_LOG.NOT_FOUND
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            data: log
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
