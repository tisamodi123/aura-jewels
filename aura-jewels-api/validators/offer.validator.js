import Joi from 'joi';
import Constant from '../constants/user.constant.js';

export const parseMultipartJson = (req, res, next) => {
    try {
        const jsonFields = [
            "priceRange",
            "applicableProducts",
            "applicableTo"
        ];

        jsonFields.forEach(field => {
            if (
                typeof req.body[field] === "string" &&
                req.body[field].trim() !== ""
            ) {
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

export const createOfferSchema = Joi.object({
    code: Joi.string().trim().uppercase().max(50).required(),
    name: Joi.string().trim().max(200).required(),
    description: Joi.string().trim().allow('', null).max(1000).optional(),
    image: Joi.string().trim().allow(null, '').optional(),
    imageMobile: Joi.string().trim().allow(null, '').optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required()
        .messages({ 'date.min': 'endDate must be greater than or equal to startDate' }),
    priceRange: Joi.object({
        from: Joi.number().min(0).default(0).required(),
        to: Joi.number().min(Joi.ref('from')).required()
            .messages({ 'number.min': 'priceRange.to must be greater than or equal to priceRange.from' })
    }).required(),
    discountType: Joi.string().valid(...Constant.OFFER_DISCOUNT_TYPE.ALL_TYPES).required(),
    discountValue: Joi.number().min(0).required().when('discountType', {
        is: 'percentage',
        then: Joi.number().max(100).messages({ 'number.max': 'Percentage discount cannot exceed 100' })
    }),
    maxDiscountAmount: Joi.number().min(0).allow(null).optional(),
    appliedOn: Joi.string().valid(...Constant.OFFER_APPLIED_ON.ALL_TYPES).required(),
    // Combined-offer component percentages (used when appliedOn === "combined").
    makingChargePercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    diamondPercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    isActive: Joi.boolean().optional(),
    applicableProducts: Joi.array().items(Joi.string().hex().length(24)).optional(),
    applicableType: Joi.string().valid("all", "custom").optional(),
    customMode: Joi.string().valid("design", "sku").optional(),
    applicableTo: Joi.object({
        category: Joi.array().items(Joi.string().hex().length(24)).optional(),
        subCategory: Joi.array().items(Joi.string().hex().length(24)).optional(),
        collections: Joi.array().items(Joi.string().hex().length(24)).optional(),
        tags: Joi.array().items(Joi.string().hex().length(24)).optional()
    }).optional(),
    status: Joi.string().valid(...Constant.OFFER_STATUS.ALL_TYPES).optional()
}).unknown(true);

export const updateOfferSchema = Joi.object({
    code: Joi.string().trim().uppercase().max(50).optional(),
    name: Joi.string().trim().max(200).optional(),
    description: Joi.string().trim().allow('', null).max(1000).optional(),
    image: Joi.string().trim().allow(null, '').optional(),
    imageMobile: Joi.string().trim().allow(null, '').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    priceRange: Joi.object({
        from: Joi.number().min(0).optional(),
        to: Joi.number().min(0).optional()
    }).optional(),
    discountType: Joi.string().valid(...Constant.OFFER_DISCOUNT_TYPE.ALL_TYPES).optional(),
    discountValue: Joi.number().min(0).optional().when('discountType', {
        is: 'percentage',
        then: Joi.number().max(100).messages({ 'number.max': 'Percentage discount cannot exceed 100' })
    }),
    maxDiscountAmount: Joi.number().min(0).allow(null).optional(),
    appliedOn: Joi.string().valid(...Constant.OFFER_APPLIED_ON.ALL_TYPES).optional(),
    makingChargePercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    diamondPercent: Joi.number().min(0).max(100).allow(null, "").optional(),
    isActive: Joi.boolean().optional(),
    applicableProducts: Joi.array().items(Joi.string().hex().length(24)).optional(),
    applicableType: Joi.string().valid("all", "custom").optional(),
    customMode: Joi.string().valid("design", "sku").optional(),
    applicableTo: Joi.object({
        category: Joi.array().items(Joi.string().hex().length(24)).optional(),
        subCategory: Joi.array().items(Joi.string().hex().length(24)).optional(),
        collections: Joi.array().items(Joi.string().hex().length(24)).optional(),
        tags: Joi.array().items(Joi.string().hex().length(24)).optional()
    }).optional(),
    status: Joi.string().valid(...Constant.OFFER_STATUS.ALL_TYPES).optional()
}).unknown(true);
