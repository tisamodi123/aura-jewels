import Joi from 'joi';

export const listActivityLogSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    module: Joi.string().allow('').trim().optional(),
    action: Joi.string().allow('').trim().optional(),
    userId: Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).allow('', null).optional(),
    fromDate: Joi.alternatives().try(Joi.string(), Joi.date()).optional(),
    toDate: Joi.alternatives().try(Joi.string(), Joi.date()).optional()
}).unknown(true);
