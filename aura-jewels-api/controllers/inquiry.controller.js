import * as inquiryService from "../services/inquiry.services.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import ProductMaster from "../models/product.model.js";
import { normalisePhone, normaliseCountryCode } from "../services/otp.services.js";

export const createInternationalInquiry = async (req, res) => {
    try {
        const payload = req.body;
        const { sku, mobileNumber, countryCode, email, name, notes } = payload;

        // product sku check
        const product = await ProductMaster.findOne({ itemCode: sku, isDeleted: 0 }).lean();
        if (!product) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid product SKU"
            });
        }

        const countryCodeVal = countryCode || "";
        const isIndia = countryCodeVal === "+91" || countryCodeVal === "91";
        if (isIndia) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "International inquiry is only available for non-Indian users"
            });
        }

        const normalizedPhone = mobileNumber ? normalisePhone(mobileNumber) : "";
        const normalizedCountryCode = countryCodeVal ? normaliseCountryCode(countryCodeVal) : "";

        const inquiry = await inquiryService.createInquiry({
            sku: product.itemCode,
            productId: product._id,
            name: name,
            email: email,
            phone: normalizedPhone,
            countryCode: normalizedCountryCode,
            notes: notes,
            createdBy: req.user?.userId || null
        });

        return res.status(STATUS_CODE.CREATED).json({
            errorCode: STATUS_CODE.CREATED,
            message: "Inquiry submitted successfully.",
            data: inquiry
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getInquiryList = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.body;

        const filter = { isDeleted: 0 };
        if (status) filter.status = status;

        const { total, inquiries } = await inquiryService.getInquiryList(
            filter,
            Number(page),
            Number(limit),
            search
        );

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            total,
            data: inquiries
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};


export const getInquiryDetail = async (req, res) => {
    try {
        const inquiry = await inquiryService.getInquiryById(req.params.id);

        if (!inquiry) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data: inquiry
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateInquiryStatus = async (req, res) => {
    try {
        const inquiryId = req.params.id;
        const { status, adminNotes } = req.body;

        const updated = await inquiryService.updateInquiryStatus(inquiryId, status, adminNotes);

        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.STATUS_UPDATED,
            data: updated
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const deleteInquiry = async (req, res) => {
    try {
        const deleted = await inquiryService.deleteInquiry(req.params.id);

        if (!deleted) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.DELETED
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getOrderInquiryList = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.body;

        const filter = { isDeleted: 0, createdBy: req.user?.userId };
        if (status) filter.status = status;

        const { total, inquiries } = await inquiryService.getInquiryList(
            filter,
            Number(page),
            Number(limit),
            search
        );

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            total,
            data: inquiries
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
