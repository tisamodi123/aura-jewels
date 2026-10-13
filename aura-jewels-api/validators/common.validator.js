import Joi from 'joi';
import Constant from '../constants/user.constant.js';

export const objectId = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Must be a valid ObjectId'
});

export const objectIdArray = Joi.array().items(objectId);

export const idParamSchema = Joi.object({
    id: objectId.required()
});

export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    sortBy: Joi.string().trim().optional(),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC', '1', '-1').optional(),
    status: Joi.alternatives().try(
        Joi.string().valid(Constant.STATUS.PENDING, Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED, ''),
        Joi.array().items(Joi.string())
    ).optional()
}).unknown(true);

export const statusUpdateSchema = Joi.object({
    status: Joi.string().valid(Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED, Constant.STATUS.PENDING).required()
});
