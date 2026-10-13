import Joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*&]).{8,}$/;

// Phone auth — used by the storefront. `phone` is the local number only;
// `countryCode` is a separate field (defaults to "+91" on the client).
// Accept either string or number for phone since some legacy callers
// post the BSON numeric form.
const phoneField = Joi.alternatives().try(
    Joi.string().trim().pattern(/^\d{6,15}$/),
    Joi.number().integer().min(0),
).messages({
    "string.pattern.base": "Phone must contain only digits (6–15 chars)",
});

const countryCodeField = Joi.string()
    .trim()
    .pattern(/^\+?\d{1,4}$/)
    .messages({
        "string.pattern.base": "Country code must look like +91 / 91",
    });

const otpField = Joi.string().trim().length(6).pattern(/^\d+$/).messages({
    "string.length": "OTP must be 6 digits",
    "string.pattern.base": "OTP must be 6 digits",
});

export const sendOtpSchema = Joi.object({
    phone: phoneField.required(),
    countryCode: countryCodeField.optional(),
});

export const verifyPhoneOtpSchema = Joi.object({
    phone: phoneField.required(),
    countryCode: countryCodeField.optional(),
    otp: otpField.required(),
    wishlist: Joi.array().optional(),
    cart: Joi.array().optional(),
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    name: Joi.string().trim().optional(),
});

// Email + OTP auth — peer to the phone flow (added so customers can sign
// up / log in when SMS is unavailable).
const emailField = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(150).messages({
    "string.email": "Please enter a valid email address",
});

export const sendEmailOtpSchema = Joi.object({
    email: emailField.required(),
}).unknown(true);

export const verifyEmailOtpSchema = Joi.object({
    email: emailField.required(),
    otp: otpField.required(),
    wishlist: Joi.array().optional(),
    cart: Joi.array().optional(),
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    name: Joi.string().trim().optional(),
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    email: Joi.string().trim().email().allow("", null).optional(),
    whatsappNumber: Joi.alternatives().try(phoneField, Joi.string().valid('', null)).optional(),
    whatsappCountryCode: countryCodeField.allow('', null).optional(),
    // Optional profile extras.
    gender: Joi.string().trim().allow('', null).optional(),
    dob: Joi.date().allow(null, '').optional(),
    anniversary: Joi.date().allow(null, '').optional(),
    instagram: Joi.string().trim().allow('', null).optional(),
    facebook: Joi.string().trim().allow('', null).optional(),
    occasions: Joi.array().items(Joi.object({
        recipient: Joi.string().trim().allow('', null),
        type: Joi.string().trim().allow('', null),
        date: Joi.date().allow(null, ''),
    })).optional(),
}).min(1);

// Shared between email and phone post-login verification.
// `type` drives which channel is used; omitting it defaults to "email"
// for backward-compat with existing client code that never sent the field.
export const requestEmailVerifySchema = Joi.object({
    type: Joi.string().valid("email", "phone").default("email").optional(),
    // email path
    email: Joi.when("type", {
        is: "email",
        then: Joi.string().trim().email().optional(),
        otherwise: Joi.forbidden(),
    }),
    // phone path
    phone: Joi.when("type", {
        is: "phone",
        then: phoneField.optional(),   // optional — falls back to stored phone
        otherwise: Joi.forbidden(),
    }),
    countryCode: Joi.when("type", {
        is: "phone",
        then: countryCodeField.optional(),
        otherwise: Joi.forbidden(),
    }),
});

export const confirmEmailVerifySchema = Joi.object({
    type: Joi.string().valid("email", "phone").default("email").optional(),
    otp: otpField.required(),
});

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.alternatives().try(
        Joi.string().trim().pattern(/^[0-9+\-()\s]{6,20}$/),
        Joi.number().integer()
    ).required(),
    password: Joi.string().pattern(passwordPattern).required().messages({
        'string.pattern.base':
            'Password must be at least 8 characters and include uppercase, lowercase, number and a symbol (@, #, $, %, *, &).'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match'
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required()
});

export const verifyOtpSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    otp: Joi.string().trim().length(6).pattern(/^\d+$/).required()
});

export const resendOtpSchema = Joi.object({
    email: Joi.string().trim().email().required()
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().email().required()
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().trim().required(),
    newPassword: Joi.string().pattern(passwordPattern).required().messages({
        'string.pattern.base':
            'Password must be at least 8 characters and include uppercase, lowercase, number and a symbol (@, #, $, %, *, &).'
    }),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match'
    })
});

export const customerRegisterSchema = Joi.object({
    country: Joi.string().trim().required(),
    phone: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: phoneField.required(),
        otherwise: Joi.alternatives().try(phoneField, Joi.string().valid('', null)).optional()
    }),
    countryCode: countryCodeField.optional(),

    email: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: Joi.string().trim().email().optional(),
        otherwise: Joi.string().trim().email().required()
    }),

    password: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: Joi.string().optional(),
        otherwise: Joi.string().pattern(passwordPattern).required().messages({
            'string.pattern.base': 'Password must be at least 8 characters and include uppercase, lowercase, number and a symbol (@, #, $, %, *, &).'
        })
    }),

    name: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: Joi.string().trim().min(1).required(),
        otherwise: Joi.string().trim().min(1).required()
    }),
    isWhatsAppSameAsMobile: Joi.boolean().optional(),
});

export const customerLoginSchema = Joi.object({
    country: Joi.string().trim().required(),
    phone: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: phoneField.required(),
        otherwise: Joi.alternatives().try(phoneField, Joi.string().valid('', null)).optional()
    }),
    countryCode: countryCodeField.optional(),

    email: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: Joi.string().trim().email().optional(),
        otherwise: Joi.string().trim().email().required()
    }),

    password: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: Joi.string().optional(),
        otherwise: Joi.string().required()
    }),
    wishlist: Joi.array().optional(),
    cart: Joi.array().optional(), // guest cart merged on login (H11)
});

export const verifyCustomerOtpSchema = Joi.object({
    country: Joi.string().trim().required(),
    otp: otpField.required(),

    phone: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: phoneField.required(),
        otherwise: Joi.alternatives().try(phoneField, Joi.string().valid('', null)).optional()
    }),
    countryCode: countryCodeField.optional(),

    email: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: Joi.string().trim().email().optional(),
        otherwise: Joi.string().trim().email().required()
    }),
    wishlist: Joi.array().optional(),
    cart: Joi.array().optional(), // guest cart merged on login (H11)
});

export const customerResendOtpSchema = Joi.object({
    country: Joi.string().trim().required(),

    phone: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: phoneField.required(),
        otherwise: Joi.alternatives().try(phoneField, Joi.string().valid('', null)).optional()
    }),
    countryCode: countryCodeField.optional(),

    email: Joi.alternatives().conditional('country', {
        is: Joi.string().valid('India', 'india', 'INDIA'),
        then: Joi.string().trim().email().optional(),
        otherwise: Joi.string().trim().email().required()
    }),
});

export const verifyEmailTokenSchema = Joi.object({
    token: Joi.string().trim().required(),
    wishlist: Joi.array().optional(),
    cart: Joi.array().optional(),
});

export const verifyResetPasswordTokenSchema = Joi.object({
    token: Joi.string().trim().required()
});

