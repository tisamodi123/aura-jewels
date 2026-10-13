import Joi from "joi";
import {
    HOME_SECTION_KEY_LIST,
    REDIRECT_TYPE,
    REDIRECT_LIST_OF
} from "../constants/homeSection.constant.js";

const objectIdLike = Joi.string()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({ "string.pattern.base": "Must be a valid ObjectId" });

const redirectSchema = Joi.object({
    type: Joi.string().valid(...REDIRECT_TYPE.ALL_TYPES).required(),
    url: Joi.string().allow("").optional(),
    listOf: Joi.string().valid(...REDIRECT_LIST_OF.ALL_TYPES).optional(),
    refId: objectIdLike.allow(null, "").optional(),
    productId: objectIdLike.allow(null, "").optional(),
    href: Joi.string().allow("").optional()
}).unknown(true);

export const sectionKeyParamSchema = Joi.object({
    key: Joi.string().valid(...HOME_SECTION_KEY_LIST).required()
});

// `content` is intentionally a permissive object — each section has its own
// shape and Joi-validating every variant would freeze the schema against
// future content tweaks. We only check that it's an object.
export const updateHomeSectionSchema = Joi.object({
    enabled: Joi.boolean().optional(),
    title: Joi.string().trim().allow("").optional(),
    sort: Joi.number().integer().min(0).optional(),
    content: Joi.object().unknown(true).optional()
}).min(1);

export { redirectSchema };
