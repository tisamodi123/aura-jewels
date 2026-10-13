import Joi from 'joi';
import Constant from '../constants/user.constant.js';
import { objectId } from './common.validator.js';

export const createStoneGroupDefaultSchema = Joi.object({
    stoneType: Joi.string()
        .valid(...Constant.DIAMOND_TYPES.ALL_TYPES)
        .required()
        .messages({
            'any.only': 'Invalid stoneType value'
        }),
    type: Joi.alternatives().conditional('stoneType', {
        is: 'color stone',
        then: Joi.string().valid(...Constant.GEM_TYPES.ALL_TYPES).required().messages({
            'any.required': 'type is required for color stones'
        }),
        otherwise: Joi.string().valid(...Constant.DIA_TYPES.ALL_TYPES).optional().allow(null, "")
    }),
    color: Joi.alternatives().conditional('stoneType', {
        is: 'diamond',
        then: Joi.string().trim().required().messages({
            'any.required': 'color is required for diamonds'
        }),
        otherwise: Joi.string().trim().allow(null, "").optional()
    }),
    clarity: Joi.string().trim().allow(null, "").optional(),
    displayName: Joi.string().trim().allow(null, "").optional(),
    origin: Joi.string().valid("Lab Grown", "Natural", "Both").optional(),
    sort: Joi.number().integer().optional(),
    status: Joi.string().valid("ACTIVE", "SUSPENDED").optional(),
    isDefault: Joi.boolean().optional(),
    isDeleted: Joi.boolean().optional()
}).unknown(true);

export const listStoneGroupDefaultSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    stoneType: Joi.string().valid(...Constant.DIAMOND_TYPES.ALL_TYPES, '').optional(),
    search: Joi.string().allow("").optional()
}).unknown(true);
