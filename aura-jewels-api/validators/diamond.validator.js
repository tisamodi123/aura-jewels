import Joi from 'joi';

export const addDiamondSchema = Joi.object({
    stockId: Joi.string().trim().required().messages({
        'any.required': 'stockId is required',
    }),
    status: Joi.string().trim().default('ACTIVE'),
    shape: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    color: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    clarity: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    sizeMM: Joi.string().trim().allow(null, '').optional(),
    cut: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    polish: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    symmetry: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    fluorescence: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    creation: Joi.string().trim().allow(null, '').optional(),
    gemstoneType: Joi.string().trim().allow(null, '').optional(),
    gemstoneOrigin: Joi.string().trim().allow(null, '').optional(),
    carat: Joi.number().min(0).allow(null, 0).optional(),
    caratNo: Joi.string().trim().allow(null, '').optional(),
    certNo: Joi.string().trim().allow(null, '').optional(),
    certLab: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    certLink: Joi.string().trim().allow(null, '').optional(),
    country: Joi.string().trim().allow(null, '').optional(),
    rap: Joi.number().min(0).allow(null, 0).optional(),
    disc: Joi.number().allow(null, 0).optional(),
});

export const updateDiamondSchema = Joi.object({
    stockId: Joi.string().trim().optional(),
    status: Joi.string().trim().optional(),
    shape: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    color: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    clarity: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    sizeMM: Joi.string().trim().allow(null, '').optional(),
    cut: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    polish: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    symmetry: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    fluorescence: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    creation: Joi.string().trim().allow(null, '').optional(),
    gemstoneType: Joi.string().trim().allow(null, '').optional(),
    gemstoneOrigin: Joi.string().trim().allow(null, '').optional(),
    carat: Joi.number().min(0).allow(null, 0).optional(),
    caratNo: Joi.string().trim().allow(null, '').optional(),
    certNo: Joi.string().trim().allow(null, '').optional(),
    certLab: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
    certLink: Joi.string().trim().allow(null, '').optional(),
    country: Joi.string().trim().allow(null, '').optional(),
    rap: Joi.number().min(0).allow(null, 0).optional(),
    disc: Joi.number().allow(null, 0).optional(),
});

export const updateDiamondStatusSchema = Joi.object({
    status: Joi.string().valid('ACTIVE', 'SUSPENDED').required().messages({
        'any.required': 'status is required',
        'any.only': 'Invalid status. Must be ACTIVE or SUSPENDED',
    }),
});

export const diamondListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),

    shape: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    color: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    clarity: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    cut: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    polish: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    symmetry: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    fluorescence: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    certLab: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),

    caratMin: Joi.number().min(0).optional(),
    caratMax: Joi.number().min(0).optional(),
    
    priceMin: Joi.number().min(0).optional(),
    priceMax: Joi.number().min(0).optional(),

    search: Joi.string().trim().allow('').optional(),
    sortBy: Joi.string().trim().optional(),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC', '1', '-1').optional(),
    diamondType: Joi.string().trim().allow('').optional(),
    type: Joi.string().trim().allow('').optional(),
});
