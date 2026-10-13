import Joi from "joi";
import Constant from "../constants/user.constant.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const parseMultipartJson = (req, res, next) => {
    try {
        const jsonFields = ["priceRange", "assignees"];
        jsonFields.forEach(field => {
            if (typeof req.body[field] === "string" && req.body[field].trim() !== "") {
                req.body[field] = JSON.parse(req.body[field]);
            }
        });
        next();
    } catch (err) {
        return res.status(400).json({
            errorCode: 400,
            message: "Invalid JSON data"
        });
    }
};

export const createCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().max(50).required(),
    name: Joi.string().trim().max(200).required(),
    description: Joi.string().trim().allow("", null).max(1000).optional(),
    image: Joi.string().trim().allow("", null).optional(),
    imageMobile: Joi.string().trim().allow("", null).optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref("startDate")).required()
        .messages({ "date.min": "endDate must be greater than or equal to startDate" }),
    priceRange: Joi.object({
        from: Joi.number().min(0).default(0).required(),
        // Optional upper cap — null/omitted = no maximum (min-only coupon).
        to: Joi.number().min(Joi.ref("from")).allow(null, "").optional()
            .messages({ "number.min": "priceRange.to must be greater than or equal to priceRange.from" })
    }).required(),
    discountType: Joi.string().valid(...Constant.COUPON_DISCOUNT_TYPE.ALL_TYPES).required(),
    discountValue: Joi.number().min(0).required().when("discountType", {
        is: "percentage",
        then: Joi.number().max(100).messages({ "number.max": "Percentage discount cannot exceed 100" })
    }),
    // What the discount applies to (mirrors offers): total | diamond | making charge | combined.
    appliedOn: Joi.string().valid(...Constant.COUPON_APPLIED_ON.ALL_TYPES).optional(),
    // Combined-coupon component %s (used when appliedOn/discountType === "combined").
    makingChargePercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    diamondPercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    maxDiscountAmount: Joi.number().min(0).allow(null, "").optional(),
    usageLimit: Joi.number().integer().min(0).allow(null, "").optional(),
    perUserLimit: Joi.number().integer().min(0).allow(null, "").optional(),
    firstOrderOnly: Joi.boolean().optional(),
    couponType: Joi.string().valid(...Constant.COUPON_TYPE.ALL_TYPES).required(),
    assignees: Joi.array().items(Joi.string().pattern(objectIdPattern)).when("couponType", {
        is: "assigneeOnly",
        then: Joi.array().min(1).required().messages({ "any.required": "assignees list is required when couponType is assigneeOnly" }),
        otherwise: Joi.array().optional()
    }),
    status: Joi.string().valid(...Constant.COUPON_STATUS.ALL_TYPES).optional(),
    isActive: Joi.boolean().optional()
}).unknown(true);

export const updateCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().max(50).optional(),
    name: Joi.string().trim().max(200).optional(),
    description: Joi.string().trim().allow("", null).max(1000).optional(),
    image: Joi.string().trim().allow("", null).optional(),
    imageMobile: Joi.string().trim().allow("", null).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    priceRange: Joi.object({
        from: Joi.number().min(0).optional(),
        // null / "" = no upper cap (min-spend-only coupon), matching create.
        to: Joi.number().min(0).allow(null, "").optional()
    }).optional(),
    discountType: Joi.string().valid(...Constant.COUPON_DISCOUNT_TYPE.ALL_TYPES).optional(),
    appliedOn: Joi.string().valid(...Constant.COUPON_APPLIED_ON.ALL_TYPES).optional(),
    discountValue: Joi.number().min(0).optional().when("discountType", {
        is: "percentage",
        then: Joi.number().max(100).messages({ "number.max": "Percentage discount cannot exceed 100" })
    }),
    makingChargePercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    diamondPercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    maxDiscountAmount: Joi.number().min(0).allow(null, "").optional(),
    usageLimit: Joi.number().integer().min(0).allow(null, "").optional(),
    perUserLimit: Joi.number().integer().min(0).allow(null, "").optional(),
    firstOrderOnly: Joi.boolean().optional(),
    couponType: Joi.string().valid(...Constant.COUPON_TYPE.ALL_TYPES).optional(),
    assignees: Joi.array().items(Joi.string().pattern(objectIdPattern)).optional(),
    status: Joi.string().valid(...Constant.COUPON_STATUS.ALL_TYPES).optional(),
    isActive: Joi.boolean().optional()
}).unknown(true);
