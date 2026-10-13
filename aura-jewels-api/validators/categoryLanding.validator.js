import Joi from 'joi';
import Constant from '../constants/user.constant.js';

const objectIdLike = Joi.string()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({ 'string.pattern.base': 'Must be a valid ObjectId' });

export const createCategoryLandingSchema = Joi.object({
    sectionName: Joi.string()
        .valid(...Constant.CATEGORY_LANDING_SECTIONS)
        .required(),
    CategoryId: Joi.alternatives().try(objectIdLike, Joi.string().valid("common")).optional().allow(null, ""),
    title: Joi.string().allow('').optional(),
    subTitle: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    buttontext1: Joi.string().allow('').optional(),
    buttontext2: Joi.string().allow('').optional(),
    buttonlink1: Joi.string().allow('').optional(),
    buttonlink2: Joi.string().allow('').optional(),
    // Structured redirects arrive as JSON strings in the multipart form.
    redirect1: Joi.string().allow('').optional(),
    redirect2: Joi.string().allow('').optional(),
    textposition: Joi.string().allow('').optional(),
    itemcode: Joi.string().allow('').optional(),
    status: Joi.string()
        .valid(Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED)
        .optional(),
});

export const updateCategoryLandingSchema = Joi.object({
    title: Joi.string().allow('').optional(),
    subTitle: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    buttontext1: Joi.string().allow('').optional(),
    buttontext2: Joi.string().allow('').optional(),
    buttonlink1: Joi.string().allow('').optional(),
    buttonlink2: Joi.string().allow('').optional(),
    // Structured redirects arrive as JSON strings in the multipart form.
    redirect1: Joi.string().allow('').optional(),
    redirect2: Joi.string().allow('').optional(),
    textposition: Joi.string().allow('').optional(),
    itemcode: Joi.string().allow('').optional(),
    sectionName: Joi.string()
        .valid(...Constant.CATEGORY_LANDING_SECTIONS)
        .optional(),
    CategoryId: Joi.alternatives().try(objectIdLike, Joi.string().valid("common")).optional().allow(null, ""),
    status: Joi.string()
        .valid(Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED)
        .optional(),
});

export const getCategoryLandingListSchema = Joi.object({
    sectionName: Joi.string()
        .valid(...Constant.CATEGORY_LANDING_SECTIONS)
        .required(),
    CategoryId: Joi.alternatives().try(objectIdLike, Joi.string().valid("common")).optional().allow(null, ""),
});
