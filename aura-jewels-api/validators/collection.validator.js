import Joi from 'joi';

export const createCollectionSchema = Joi.object({
    collectionName: Joi.string().trim().min(1).required(),
    description: Joi.string().allow('').optional(),
    slug: Joi.string().trim().optional()
}).unknown(true);

export const updateCollectionSchema = Joi.object({
    collectionName: Joi.string().trim().min(1).optional(),
    description: Joi.string().allow('').optional(),
    slug: Joi.string().trim().optional()
}).unknown(true);

export const listCollectionSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional()
}).unknown(true);
