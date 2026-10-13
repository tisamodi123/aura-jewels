import Joi from 'joi';
import MESSAGES from '../constants/messages.constant.js';

// Input validation schema using Joi and messages from constants

export const sendWhatsAppSchema = Joi.object({
    templateName: Joi.string().trim().required().messages({
        'string.empty': MESSAGES.VALIDATION.WHATSAPP_TEMPLATE_REQUIRED || 'WhatsApp template name is required',
        'any.required': MESSAGES.VALIDATION.WHATSAPP_TEMPLATE_REQUIRED || 'WhatsApp template name is required',
    }),
    phoneNumber: Joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
        'string.empty': MESSAGES.VALIDATION.WHATSAPP_PHONE_REQUIRED || 'WhatsApp phone number is required',
        'any.required': MESSAGES.VALIDATION.WHATSAPP_PHONE_REQUIRED || 'WhatsApp phone number is required',
        'string.pattern.base': MESSAGES.VALIDATION.WHATSAPP_INVALID_PHONE || 'Invalid WhatsApp phone number format',
    }),
    bodyParams: Joi.array().items(Joi.string().trim()).optional().default([]).messages({
        'array.base': MESSAGES.VALIDATION.WHATSAPP_INVALID_PARAMS || 'WhatsApp body parameters must be an array of strings',
    }),
    headerImageUrl: Joi.string().uri({ scheme: ['http', 'https'] }).allow(null, '').optional().messages({
        'string.uri': MESSAGES.VALIDATION.WHATSAPP_INVALID_URL || 'Invalid header image URL',
    }),
    userName: Joi.string().trim().optional().default('Customer'),
});
