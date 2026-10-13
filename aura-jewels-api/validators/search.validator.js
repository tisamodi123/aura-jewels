import Joi from 'joi';

export const publicSearchQuerySchema = Joi.object({
    query: Joi.string().allow('').trim().max(200).default(''),
    limit: Joi.number().integer().min(1).max(50).default(12)
});
