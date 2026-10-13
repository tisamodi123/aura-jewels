import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateUploadedMimeTypes } from "../middlewares/uploadValidation.middleware.js";
import {
    sectionKeyParamSchema,
    updateHomeSectionSchema
} from "../validators/homeSection.validator.js";
import {
    list_home_sections,
    get_home_section_by_key,
    update_home_section,
    upload_cms_image
} from "../controllers/homeSection.controller.js";

const route = express.Router();

route.post(
    "/uploadImage",
    [verifyToken, authorize(Action.CMS_VIEW), validateUploadedMimeTypes()],
    upload_cms_image
);

route.get("/list", [verifyToken, authorize(Action.CMS_VIEW)], list_home_sections);

route.get(
    "/:key",
    [verifyToken, authorize(Action.CMS_VIEW), validate(sectionKeyParamSchema, "params")],
    get_home_section_by_key
);

route.put(
    "/:key",
    [
        verifyToken, authorize(Action.CMS_UPDATE),
        validate(sectionKeyParamSchema, "params"),
        validate(updateHomeSectionSchema),
        activityLogger("homeSection", "UPDATE")
    ],
    update_home_section
);

export default route;
