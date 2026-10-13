import Joi from 'joi';

const objectIdLike = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/);

export const createCategorySchema = Joi.object({
    categoryName: Joi.string().trim().min(1).required(),
    parentCategoryId: objectIdLike.allow(null, '').optional(),
    sizeLabel: Joi.string().trim().allow(null, '').optional(),
    description: Joi.string().allow('').optional(),
    slug: Joi.string().trim().optional(),
    SEODetails: Joi.object().unknown(true).optional()
}).unknown(true);

export const updateCategorySchema = Joi.object({
    categoryName: Joi.string().trim().min(1).optional(),
    parentCategoryId: objectIdLike.allow(null, '').optional(),
    sizeLabel: Joi.string().trim().allow(null, '').optional(),
    description: Joi.string().allow('').optional(),
    slug: Joi.string().trim().optional(),
    SEODetails: Joi.object().unknown(true).optional()
}).unknown(true);

export const listCategorySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    parentCategoryId: objectIdLike.allow('', null).optional()
}).unknown(true);
