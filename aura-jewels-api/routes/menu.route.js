 import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { locationParamSchema, saveMenuSchema } from "../validators/menu.validator.js";
import { get_menu, save_menu, get_redirect_options } from "../controllers/menu.controller.js";

const route = express.Router();

// Options for the RedirectPicker (pages + entity dropdowns + filter facets).
// Defined before the param route so "options" isn't read as a location.
route.get("/options", [verifyToken, authorize(Action.CMS_VIEW)], get_redirect_options);

// Full menu tree for the builder.
route.get(
    "/detail/:location",
    [verifyToken, authorize(Action.CMS_VIEW), validate(locationParamSchema, "params")],
    get_menu
);

// Create / replace the menu tree for a location.
route.put(
    "/save/:location",
    [verifyToken, authorize(Action.CMS_UPDATE), validate(locationParamSchema, "params"), validate(saveMenuSchema), activityLogger("menu", "UPDATE")],
    save_menu
);

export default route;
