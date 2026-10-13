import Joi from 'joi';

export const createMetalPriceSchema = Joi.object({
    gold: Joi.number().required().messages({
        'any.required': 'Gold price required..!',
        'number.base': 'Gold price required..!'
    }),
    silver: Joi.number().required().messages({
        'any.required': 'Silver price required..!',
        'number.base': 'Silver price required..!'
    }),
    platinum: Joi.number().required().messages({
        'any.required': 'Platinum price required..!',
        'number.base': 'Platinum price required..!'
    })
}).unknown(true);

export const updateMetalPriceSchema = Joi.object({
    gold: Joi.number().optional().messages({
        'number.base': 'Invalid gold price..!'
    }),
    silver: Joi.number().optional(),
    platinum: Joi.number().optional()
}).unknown(true);

export const listMetalPriceSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional()
}).unknown(true);
