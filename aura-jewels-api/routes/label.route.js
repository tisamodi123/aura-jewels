import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createLabelSchema,
    updateLabelSchema,
    listLabelSchema
} from "../validators/label.validator.js";
import {
    create_label,
    update_label,
    delete_label,
    get_label_list,
    get_label_detail,
    update_label_status
} from "../controllers/label.controller.js";

const route = express.Router();

route.post(
    "/createLabel",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(createLabelSchema), activityLogger("label", "CREATE")],
    create_label
);

route.post(
    "/getLabelList",
    [verifyToken, authorize(Action.PRODUCT_LIST), validate(listLabelSchema)],
    get_label_list
);

route.get(
    "/getLabelDetail/:id",
    [verifyToken, authorize(Action.PRODUCT_LIST), validate(idParamSchema, "params")],
    get_label_detail
);

route.put(
    "/updateLabel/:id",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(idParamSchema, "params"), validate(updateLabelSchema), activityLogger("label", "UPDATE")],
    update_label
);

route.delete(
    "/deleteLabel/:id",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(idParamSchema, "params"), activityLogger("label", "DELETE")],
    delete_label
);

route.patch(
    "/updateLabelStatus/:id",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(idParamSchema, "params"), activityLogger("label", "UPDATE_STATUS")],
    update_label_status
);

export default route;
