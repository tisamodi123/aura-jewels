import Joi from "joi";
import Constant from "../constants/user.constant.js";

// NOTE: validate.middleware.js runs Joi with `stripUnknown: true` and reassigns
// req.body, so every field the client may send must be declared here or it is
// silently dropped before the controller runs.

/** Public payload from the storefront "Get in Touch" form. */
export const createContactInquirySchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(100).required()
        .messages({ "string.empty": "First name is required" }),

    lastName: Joi.string().trim().min(1).max(100).required()
        .messages({ "string.empty": "Last name is required" }),

    email: Joi.string().trim().email().max(200).required()
        .messages({ "string.email": "Please enter a valid email address" }),

    subject: Joi.string()
        .trim()
        .valid(...Constant.CONTACT_SUBJECT.ALL_TYPES)
        .default(Constant.CONTACT_SUBJECT.GENERAL_QUESTION),

    message: Joi.string().trim().min(1).max(2000).required()
        .messages({ "string.empty": "Message is required" }),
});

/** Admin: change status / attach internal notes. */
export const updateContactInquiryStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...Constant.INQUIRY_STATUS.ALL_TYPES)
        .required(),

    adminNotes: Joi.string().trim().max(1000).allow("").optional(),
});

/** Admin: list with pagination / search / filters. */
export const listContactInquirySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid(...Constant.INQUIRY_STATUS.ALL_TYPES, "").optional(),
    subject: Joi.string().valid(...Constant.CONTACT_SUBJECT.ALL_TYPES, "").optional(),
    search: Joi.string().trim().max(100).allow("").optional(),
});
