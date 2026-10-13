import Joi from "joi";
import Constant from "../constants/user.constant.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createInquirySchema = Joi.object({
    sku: Joi.string()
        .trim()
        .max(100)
        .required(),
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),
    email: Joi.string()
        .trim()
        .email()
        .required(),
    mobileNumber: Joi.string()
        .trim()
        .pattern(/^[0-9+\-\s()]{6,20}$/)
        .optional()
        .messages({ "string.pattern.base": "phone must be 6–20 digits" }),
    countryCode: Joi.string()
        .trim()
        .optional(),
    notes: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .optional()
});

/**
 * Validates body payload when an admin updates an inquiry's status.
 */
export const updateInquiryStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...Constant.INQUIRY_STATUS.ALL_TYPES)
        .required(),

    adminNotes: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .optional()
});

/**
 * Validates body payload when querying list of inquiries.
 */
export const listInquirySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string()
        .valid(...Constant.INQUIRY_STATUS.ALL_TYPES, "")
        .optional(),
    search: Joi.string()
        .trim()
        .max(100)
        .allow("")
        .optional()
});

