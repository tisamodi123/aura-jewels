import Joi from "joi";
import Constant from "../constants/user.constant.js";

const objectIdLike = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Invalid ObjectId format",
  });

const quotationItemValidationSchema = Joi.object({
  title: Joi.string().trim().allow("").required(),
  quotationId: Joi.string().trim().allow("").optional(),
  status: Joi.string()
    .valid(...Constant.CUSTOM_ORDER_STATUS.ALL_TYPES)
    .optional(),
  metalType: objectIdLike.required(),
  metalWeight: Joi.number().min(0).required(),
  metalPrice: Joi.number().min(0).allow(null).optional(),
  diamondLabel: Joi.string().trim().allow("").optional(),
  carate: Joi.number().min(0).allow(null).optional(),
  price: Joi.number().min(0).allow(null).optional(),
  totalPrice: Joi.number().min(0).required(),
  remarks: Joi.string().trim().allow("").optional(),
});

export const createQuotationSchema = Joi.object({
  customOrderId: objectIdLike.required(),
  quotations: Joi.array()
    .items(quotationItemValidationSchema)
    .min(1)
    .required(),
}).unknown(true);
