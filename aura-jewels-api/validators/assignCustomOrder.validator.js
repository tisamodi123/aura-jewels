import Joi from "joi";

const objectIdLike = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.empty": "{#label} is required",
    "string.pattern.base": "{#label} must be a valid ObjectId",
  });

export const assignCustomOrderValidator = Joi.object({
  customOrderId: objectIdLike.required().label("customOrderId"),
  userId: objectIdLike.required().label("userId"),
});
