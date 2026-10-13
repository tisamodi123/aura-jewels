import Joi from "joi";
import Constant from "../constants/user.constant.js";
import { MENU_LOCATION } from "../constants/menu.constant.js";

export const locationParamSchema = Joi.object({
    location: Joi.string().valid(...MENU_LOCATION.ALL_TYPES).required(),
});

// The whole menu tree is posted as `items` — either a JSON string (FormData)
// or an array (JSON body). Deep validation is intentionally loose; the model
// schema enforces the leaf shapes and the service strips asset hosts.
export const saveMenuSchema = Joi.object({
    title: Joi.string().allow("").optional(),
    status: Joi.string().valid(Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED).optional(),
    items: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
}).unknown(true);
