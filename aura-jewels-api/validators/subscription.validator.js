import Joi from "joi";

export const subscribeSchema = Joi.object({
    email: Joi.string().trim().email().max(200).required()
        .messages({ "string.email": "Please enter a valid email address" }),
});

export const listSubscriptionSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().max(100).allow("").optional(),
});
