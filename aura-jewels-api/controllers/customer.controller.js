import {
    fetchCustomers,
    fetchCustomerById,
    editCustomer,
    removeCustomer,
    changeCustomerStatus,
    createCustomerService,
    fetchAssignees,
    verifyCustomerAccount,
} from "../services/customer.services.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

const classifyValidationError = (error) => {
    const msg = (error?.message || "").toLowerCase();
    return msg.includes("exists") || msg.includes("not found") || msg.includes("required") || msg.includes("invalid") || msg.includes("already in use");
};

export const getCustomers = async (req, res) => {
    try {
        const { page, limit, search = "", status } = req.body;
        const data = await fetchCustomers({
            page: Number(page),
            limit: Number(limit),
            search,
            status
        });
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER.LIST_FETCHED,
            data: data.customers,
            pagination: data.pagination
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const data = await fetchCustomerById(req.params.id);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER.DETAIL_FETCHED,
            data: data.customer
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const customer = await editCustomer(req.params.id, req.body, req.user.userId);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER.UPDATED,
            data: customer
        });
    } catch (error) {
        const isValErr = classifyValidationError(error);
        const statusCode = isValErr ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.INTERNAL_ERROR;
        return res.status(statusCode).json({
            errorCode: statusCode,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
            errors: isValErr ? [error.message] : undefined
        });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        await removeCustomer(req.params.id);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER.DELETED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateCustomerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const customer = await changeCustomerStatus(req.params.id, status);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER.STATUS_UPDATED,
            status: customer.status
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const addCustomer = async (req, res) => {
    try {
        const customer = await createCustomerService(req.body, req.user.userId);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER.CREATED,
            data: customer
        });
    } catch (error) {
        const isValErr = classifyValidationError(error);
        const statusCode = isValErr ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.INTERNAL_ERROR;
        return res.status(statusCode).json({
            errorCode: statusCode,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
            errors: isValErr ? [error.message] : undefined
        });
    }
};

export const getAssigneeList = async (req, res) => {
    try {
        const assignees = await fetchAssignees();
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CUSTOMER.ASSIGNEES_FETCHED,
            count: assignees.length,
            data: assignees
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Verify a customer account (email + phone), promoting PENDING -> ACTIVE.
 * The admin customer list calls this from the "Verify" action. It previously
 * hit customer/verifyCustomer, a route that never existed in this API (404).
 */
export const verifyCustomer = async (req, res) => {
    try {
        const { customer, alreadyVerified } = await verifyCustomerAccount(req.params.id);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: alreadyVerified ? "Customer already verified" : "Customer verified successfully",
            data: {
                _id: customer._id,
                emailVerified: customer.emailVerified,
                phoneVerified: customer.phoneVerified,
                status: customer.status,
            },
        });
    } catch (error) {
        const notFound = /not found|not a customer/i.test(error?.message || "");
        return res.status(notFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: notFound ? STATUS_CODE.NOT_FOUND : STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
