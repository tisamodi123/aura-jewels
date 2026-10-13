import Joi from 'joi';
import Constant from '../constants/user.constant.js';

const objectIdLike = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'shape must be a valid id'
});

// A carat bucket, exactly as the rate sheet writes it: "0.16-0.17", "1.00-1.49",
// a bare "0.35", or a millimetre label for colour stones ("4.40 x 2.70 MM").
const caratBucket = Joi.string().trim().max(50);

// At least one of the two prices must be a real number, otherwise the row exists
// but prices every stone that matches it at 0.
const atLeastOnePrice = (schema) =>
    schema.or('lgdPrice', 'naturalPrice', 'lgd_price', 'natural_price');

export const createStoneGroupSchema = atLeastOnePrice(Joi.object({
    stoneType: Joi.string().valid(...Constant.DIAMOND_TYPES.ALL_TYPES).required(),
    type: Joi.string().trim().valid(...Constant.GEM_TYPES.ALL_TYPES).allow(null, '').optional(),
    shape: objectIdLike.required(),
    color: Joi.string().trim().max(20).required(),
    clarity: Joi.string().trim().max(20).allow(null, '').optional(),
    carat: caratBucket.required(),
    lgdPrice: Joi.number().min(0).allow(null, '').optional(),
    naturalPrice: Joi.number().min(0).allow(null, '').optional(),
    lgd_price: Joi.number().min(0).allow(null, '').optional(),
    natural_price: Joi.number().min(0).allow(null, '').optional(),
    status: Joi.string().valid(Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED).optional(),
}).unknown(true));

export const updateStoneGroupSchema = Joi.object({
    // Prices (both naming conventions are accepted by the controller).
    lgdPrice: Joi.number().min(0).allow(null, '').optional(),
    naturalPrice: Joi.number().min(0).allow(null, '').optional(),
    lgd_price: Joi.number().min(0).allow(null, '').optional(),
    natural_price: Joi.number().min(0).allow(null, '').optional(),
    // Identity fields — editable, duplicate-checked in the controller.
    stoneType: Joi.string().valid(...Constant.DIAMOND_TYPES.ALL_TYPES).optional(),
    type: Joi.string().trim().valid(...Constant.GEM_TYPES.ALL_TYPES).allow(null, '').optional(),
    shape: objectIdLike.optional(),
    color: Joi.string().trim().max(20).optional(),
    clarity: Joi.string().trim().max(20).allow(null, '').optional(),
    carat: caratBucket.optional(),
    status: Joi.string().valid(Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED).optional(),
}).unknown(true);

export const listStoneGroupSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    // Filters. Declared (rather than relying on .unknown(true)) so they are
    // validated and coerced — the admin sends them as multipart strings.
    stoneType: Joi.string().allow('').trim().optional(),
    type: Joi.string().allow('').trim().optional(),
    shape: Joi.string().allow('').trim().optional(),
    color: Joi.string().allow('').trim().optional(),
    clarity: Joi.string().allow('').trim().optional(),
    status: Joi.string().valid('ACTIVE', 'SUSPENDED', '').optional(),
    caratMin: Joi.number().min(0).allow('', null).optional(),
    caratMax: Joi.number().min(0).allow('', null).optional()
}).unknown(true);

export const exportStoneGroupSchema = Joi.object({
    search: Joi.string().allow('').trim().optional(),
    stoneType: Joi.string().allow('').trim().optional(),
    ids: Joi.array().items(Joi.string()).optional()
}).unknown(true);

export const stoneGroupHistorySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional()
}).unknown(true);
