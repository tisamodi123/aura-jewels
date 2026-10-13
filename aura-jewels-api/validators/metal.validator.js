import Joi from 'joi';
import Constant from '../constants/user.constant.js';

export const createMetalSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    price_type: Joi.string().trim().lowercase().valid(...Constant.METAL_PRICE_TYPE.ALL_TYPES).required().messages({
        'any.only': 'Invalid price type. Must be gold, silver or platinum'
    }),
    purity: Joi.number().required(),
    price_per_gram: Joi.number().required(),
    type: Joi.string().trim().allow('').optional(),
    stamp: Joi.string().trim().allow('').optional(),
    color: Joi.string().trim().allow('').optional()
}).unknown(true);

export const updateMetalSchema = Joi.object({
    name: Joi.string().trim().min(1).optional(),
    price_type: Joi.string().trim().lowercase().valid(...Constant.METAL_PRICE_TYPE.ALL_TYPES).optional().messages({
        'any.only': 'Invalid price type. Must be gold, silver or platinum'
    }),
    purity: Joi.number().optional(),
    price_per_gram: Joi.number().optional(),
    type: Joi.string().trim().allow('').optional(),
    stamp: Joi.string().trim().allow('').optional(),
    color: Joi.string().trim().allow('').optional()
}).unknown(true);

export const listMetalSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    price_type: Joi.string().trim().lowercase().valid(...Constant.METAL_PRICE_TYPE.ALL_TYPES, '').optional()
}).unknown(true);
