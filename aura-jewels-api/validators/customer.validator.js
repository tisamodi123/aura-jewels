import Joi from 'joi';

const objectIdLike = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Must be a valid ObjectId'
});

const customerCore = {
    firstName: Joi.string().trim().min(1).messages({
        'string.empty': 'First name is required',
        'any.required': 'First name is required'
    }),
    lastName: Joi.string().trim().min(1).messages({
        'string.empty': 'Last name is required',
        'any.required': 'Last name is required'
    }),
    email: Joi.string().trim().email().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),
    number: Joi.alternatives().try(
        Joi.string().trim().pattern(/^[0-9+\-()\s]{6,20}$/),
        Joi.number().integer()
    ).messages({
        'any.required': 'Phone number is required',
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please enter a valid phone number',
        'number.base': 'Please enter a valid phone number'
    }),
    // Dial code can arrive as "91", "+91", or "0091" — controller-side
    // normalisation collapses them. Pattern is intentionally loose.
    countryCode: Joi.string().trim().pattern(/^\+?\d{1,4}$/).messages({
        'string.pattern.base': 'Please enter a valid country code'
    }),
    address: Joi.alternatives().try(
        Joi.string().trim().allow(null, ''),
        Joi.object().unknown(true).allow(null),
        Joi.array().items(Joi.object().unknown(true)).allow(null)
    ).messages({
        'any.required': 'Address is required',
        'string.empty': 'Address is required'
    }),
    // customerGroupId: objectIdLike.allow(null, ''),
    assigneeId: objectIdLike.allow(null, '').messages({
        'any.required': 'Assignee is required',
        'string.empty': 'Assignee is required'
    })
};

export const addCustomerSchema = Joi.object({
    firstName: customerCore.firstName.required(),
    lastName: customerCore.lastName.required(),
    email: customerCore.email.required(),
    number: customerCore.number.required(),
    countryCode: customerCore.countryCode.optional(),
    address: customerCore.address.optional(),
    assigneeId: customerCore.assigneeId.required(),
    // customerGroupId: customerCore.customerGroupId.optional(),
    // Defaults to true — staff-created accounts skip OTP verification.
    autoVerify: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false', '0', '1')).optional()
}).unknown(true);

export const updateCustomerSchema = Joi.object({
    firstName: customerCore.firstName.required(),
    lastName: customerCore.lastName.required(),
    email: customerCore.email.required(),
    number: customerCore.number.required(),
    countryCode: customerCore.countryCode.optional(),
    address: customerCore.address.optional(),
    // customerGroupId: customerCore.customerGroupId.required(),
    assigneeId: customerCore.assigneeId.required()
}).unknown(true);

// export const listCustomerSchema = Joi.object({
//     page: Joi.number().integer().min(1).default(1),
//     limit: Joi.number().integer().min(1).max(500).default(10),
//     search: Joi.string().allow('').trim().optional(),
//     status: Joi.string().allow('').optional(),
//     customerGroupId: objectIdLike.allow('', null).optional(),
//     assigneeId: objectIdLike.allow('', null).optional()
// }).unknown(true);

export const listCustomerSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(500).optional(),
    search: Joi.string().allow('').trim().optional(),
    status: Joi.string().allow('').optional(),
    //   customerGroupId: objectIdLike.allow('', null).optional(),
    assigneeId: objectIdLike.allow('', null).optional()
}).unknown(true);

export const customerGroupSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    description: Joi.string().allow('').optional(),
    discountPercentage: Joi.number().min(0).max(100).optional()
}).unknown(true);

export const listCustomerGroupSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional()
}).unknown(true);
