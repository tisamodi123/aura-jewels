import Joi from 'joi';
import Constant from '../constants/user.constant.js';

const chargesCore = {
    code: Joi.string().trim().min(1),
    name: Joi.string().trim().min(1),
    type: Joi.string().valid(...Constant.CHARGE_TYPE.ALL_TYPE).messages({
        'any.only': 'Invalid type'
    }),
    amount_per_gm: Joi.number().min(0).messages({
        'number.min': 'Invalid amount_per_gm'
    }),
    min_amount: Joi.number().min(0).messages({
        'number.min': 'Invalid min_amount'
    }),
    charge_mode: Joi.string().valid(...Constant.CHARGE_MODE.ALL_TYPE).default(Constant.CHARGE_MODE.DYNAMIC).messages({
        'any.only': 'Invalid charge_mode'
    }),
    status: Joi.string().valid(Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED).messages({
        'any.only': 'Invalid status'
    })
};

export const createChargesSchema = Joi.object({
    code: chargesCore.code.required().messages({
        'any.required': 'Code required',
        'string.empty': 'Code required'
    }),
    name: chargesCore.name.required().messages({
        'any.required': 'Name required',
        'string.empty': 'Name required'
    }),
    type: chargesCore.type.optional(),
    amount_per_gm: chargesCore.amount_per_gm.optional(),
    min_amount: chargesCore.min_amount.optional(),
    charge_mode: chargesCore.charge_mode.optional()
}).unknown(true);

export const updateChargesSchema = Joi.object({
    code: chargesCore.code.required().messages({
        'any.required': 'Invalid code',
        'string.empty': 'Invalid code'
    }),
    name: chargesCore.name.required().messages({
        'any.required': 'Invalid name',
        'string.empty': 'Invalid name'
    }),
    type: chargesCore.type.optional(),
    amount_per_gm: chargesCore.amount_per_gm.optional(),
    min_amount: chargesCore.min_amount.optional(),
    charge_mode: chargesCore.charge_mode.optional(),
    status: chargesCore.status.optional()
}).unknown(true);

export const listChargesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    type: Joi.string().valid(...Constant.CHARGE_TYPE.ALL_TYPE, '').optional()
}).unknown(true);
