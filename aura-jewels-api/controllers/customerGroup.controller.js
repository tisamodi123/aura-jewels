import {
    createGroupService,
    getGroupsService,
    getGroupByIdService,
    updateGroupService,
    deleteGroupService,
    getGroupsServiceDropdown
} from "../services/customerGroup.services.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const createCustomerGroup = async (req, res) => {
    try {
        const group = await createGroupService(req.body, req.user.userId);
        return res.status(STATUS_CODE.CREATED).json({
            errorCode: STATUS_CODE.CREATED,
            message: MESSAGES.CUSTOMER_GROUP.CREATED,
            data: group
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCustomerGroup = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status } = req.body;
        const { data, pagination } = await getGroupsService({ page, limit, search, status });
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER_GROUP.LIST_FETCHED,
            pagination,
            data
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCustomerGroupById = async (req, res) => {
    try {
        const group = await getGroupByIdService(req.params.id);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER_GROUP.DETAIL_FETCHED,
            data: group
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateCustomerGroup = async (req, res) => {
    try {
        const group = await updateGroupService(req.params.id, req.body, req.user.userId);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER_GROUP.UPDATED,
            data: group
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const deleteCustomerGroup = async (req, res) => {
    try {
        await deleteGroupService(req.params.id);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER_GROUP.DELETED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCustomerGroupDropdown = async (req, res) => {
    try {
        const groups = await getGroupsServiceDropdown();
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER_GROUP.DROPDOWN_FETCHED,
            count: groups.length,
            data: groups
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
