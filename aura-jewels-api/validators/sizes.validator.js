import Joi from 'joi';
import { objectId } from './common.validator.js';

export const createSizeSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    // category: Joi.string().trim().min(1).required(),
    category:objectId.required(),
    code: Joi.string().trim().min(1).required(),
    weight_multipler: Joi.number().optional(),
    isDefault: Joi.boolean().optional(),
    description: Joi.string().allow('').optional(),
    sort: Joi.number().optional().default(0).integer().min(0)
}).unknown(true);

export const updateSizeSchema = Joi.object({
    name: Joi.string().trim().min(1).optional(),
    category: objectId.optional(),
    code: Joi.string().trim().min(1).optional(),
    weight_multipler: Joi.number().optional(),
    isDefault: Joi.boolean().optional(),
    description: Joi.string().allow('').optional(),
    sort: Joi.number().optional().default(0).integer().min(0)
}).unknown(true);

export const listSizesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    category: Joi.string().allow('').trim().optional()
}).unknown(true);
