import Joi from 'joi';
import Constant from '../constants/user.constant.js';

const staffFields = {
    name: Joi.string().trim().min(1),
    email: Joi.string().trim().email(),
    phone: Joi.alternatives().try(
        Joi.string().trim().pattern(/^[0-9+\-()\s]{6,20}$/),
        Joi.number().integer()
    ),
    // Dial code, with or without the plus prefix. Service-side normalisation
    // converts "91"/"+91"/"0091" to the canonical "+91".
    countryCode: Joi.string().trim().pattern(/^\+?\d{1,4}$/),
    role: Joi.string().valid(...Constant.ROLES.STAFF_ROLES),
    addresses: Joi.array().items(Joi.object().unknown(true)),
    // customerGroupId: Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).allow(null, ''),
    assigneeId: Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).allow(null, '')
};

export const createStaffSchema = Joi.object({
    name: staffFields.name.required(),
    email: staffFields.email.required(),
    phone: staffFields.phone.required(),
    countryCode: staffFields.countryCode.optional(),
    role: staffFields.role.optional(),
    addresses: staffFields.addresses.optional(),
    // customerGroupId: staffFields.customerGroupId.optional(),
    assigneeId: staffFields.assigneeId.optional()
}).unknown(true);

export const updateStaffSchema = Joi.object({
    name: staffFields.name.required(),
    email: staffFields.email.required(),
    phone: staffFields.phone.required(),
    countryCode: staffFields.countryCode.optional(),
    role: staffFields.role.optional(),
    addresses: staffFields.addresses.optional(),
    //  customerGroupId: staffFields.customerGroupId.optional(),
    assigneeId: staffFields.assigneeId.optional()
}).unknown(true);

export const listStaffSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(10),
    search: Joi.string().allow('').trim().optional(),
    status: Joi.string().allow('').optional(),
    role: Joi.string().allow('').optional(),
    sortBy: Joi.string().trim().optional(),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC', '1', '-1').optional()
}).unknown(true);
