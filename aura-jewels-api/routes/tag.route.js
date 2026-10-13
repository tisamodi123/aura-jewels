import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createTagSchema,
    updateTagSchema,
    listTagSchema
} from "../validators/tag.validator.js";
import {
    add_tag,
    get_tag,
    update_tag,
    delete_tag,
    update_tag_status
} from "../controllers/tag.controller.js";

const route = express.Router();

route.post(
    "/addTag",
    [verifyToken, authorize(Action.TAG_CREATE), validate(createTagSchema), activityLogger("tag", "CREATE")],
    add_tag
);

route.post("/getTag", [verifyToken, authorize(Action.TAG_LIST), validate(listTagSchema)], get_tag);

route.put(
    "/updateTag/:id",
    [verifyToken, authorize(Action.TAG_UPDATE), validate(idParamSchema, "params"), validate(updateTagSchema), activityLogger("tag", "UPDATE")],
    update_tag
);

route.delete(
    "/deleteTag/:id",
    [verifyToken, authorize(Action.TAG_DELETE), validate(idParamSchema, "params"), activityLogger("tag", "DELETE")],
    delete_tag
);

route.patch(
    "/updateTagStatus/:id",
    [verifyToken, authorize(Action.TAG_UPDATE_STATUS), validate(idParamSchema, "params"), activityLogger("tag", "UPDATE_STATUS")],
    update_tag_status
);

export default route;
