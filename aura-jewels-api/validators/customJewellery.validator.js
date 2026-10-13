import Joi from "joi";
import Constant from "../constants/user.constant.js";

const objectIdLike = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/);

export const createCustomJewellerySchema = Joi.object({
  categoryId: objectIdLike.empty("").optional(),

  otherProduct: Joi.string()
    .trim()
    .max(200)
    .empty("")
    .when("categoryId", {
      is: Joi.string().trim().min(1),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),

  attachments: Joi.array().items(Joi.string().trim()).max(5).optional(),

  urls: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().uri()).max(5),
      Joi.string().trim().uri()
    )
    .optional(),

  referenceUrls: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim()).max(5),
      Joi.string().trim()
    )
    .optional(),

  metalId: objectIdLike.required(),

  approxMetalWeight: Joi.number().min(0).required(),

  ringSizeId: objectIdLike.empty("").optional(),

  stoneType: Joi.string()
    .valid(...Constant.STONE_TYPES.ALL_TYPES)
    .empty("")
    .optional(),

  approxStoneWeight: Joi.number().min(0).required(),

  gemstonePreference: Joi.string().trim().max(300).empty("").optional(),

  budget: Joi.number().min(0).required(),

  engraving: Joi.string().trim().max(200).empty("").optional(),

  isEngraving: Joi.boolean().optional(),

  remarks: Joi.string().trim().max(1000).empty("").optional(),

  firstName: Joi.string().trim().max(100).required(),

  lastName: Joi.string().trim().max(100).required(),

  mobileNumber: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/)
    .empty("")
    .optional(),

  countryCode: Joi.when("mobileNumber", {
    is: Joi.exist(),
    then: Joi.string().trim().required(),
    otherwise: Joi.string().trim().empty("").optional(),
  }),

  email: Joi.string().trim().email().empty("").optional(),

  country: Joi.string().trim().required(),
})
  .or("categoryId", "otherProduct")
  .or("mobileNumber", "email")
  .unknown(true);
