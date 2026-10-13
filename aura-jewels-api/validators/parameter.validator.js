import Joi from 'joi';
import Constant from '../constants/user.constant.js';

const parameterCore = {
    type: Joi.string().trim().lowercase().valid(...Constant.PARA_TYPES.ALL_TYPES).messages({
        'any.only': 'Invalid parameter type'
    }),
    name: Joi.string().trim().min(1),
    code: Joi.string().trim().min(1),
    diamondType: Joi.string().valid(...Constant.DIAMOND_TYPES.ALL_TYPES).messages({
        'any.only': 'Invalid diamond type'
    }),
    // `sort` is required by the controller's unique-sort check — without
    // declaring it here, stripUnknown:true would drop it from req.body and
    // every create after the first would fail with "Sort must be unique".
    sort: Joi.number().integer().min(0),
    description: Joi.string().trim().allow('').max(500),
    // Synonyms can arrive as either a CSV string (from the admin form) or
    // an actual array (when called from server-side scripts).
    synonyms: Joi.alternatives().try(
        Joi.string().allow('').trim().max(2000),
        Joi.array().items(Joi.string().trim())
    ),
    // Image is a filename string after multer puts the file at req.files
    // and the controller normalises it onto req.body.image.
    image: Joi.string().allow('').optional()
};

export const createParameterSchema = Joi.object({
    type: parameterCore.type.required(),
    name: parameterCore.name.required(),
    code: parameterCore.code.required(),
    diamondType: parameterCore.diamondType.optional(),
    sort: parameterCore.sort.required(),
    description: parameterCore.description.optional(),
    synonyms: parameterCore.synonyms.optional(),
    image: parameterCore.image
}).unknown(true);

export const updateParameterSchema = Joi.object({
    type: parameterCore.type.required(),
    name: parameterCore.name.required(),
    code: parameterCore.code.required(),
    diamondType: parameterCore.diamondType.optional(),
    sort: parameterCore.sort.required(),
    description: parameterCore.description.optional(),
    synonyms: parameterCore.synonyms.optional(),
    image: parameterCore.image
}).unknown(true);

export const listParameterSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    type: Joi.string().trim().lowercase().valid(...Constant.PARA_TYPES.ALL_TYPES, '').optional()
}).unknown(true);
