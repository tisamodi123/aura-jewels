import Joi from 'joi';

export const createTagSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    acceptableValues: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional(),
    description: Joi.string().allow('').optional()
}).unknown(true);

export const updateTagSchema = Joi.object({
    name: Joi.string().trim().min(1).optional(),
    acceptableValues: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional(),
    description: Joi.string().allow('').optional()
}).unknown(true);

export const listTagSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional()
}).unknown(true);
