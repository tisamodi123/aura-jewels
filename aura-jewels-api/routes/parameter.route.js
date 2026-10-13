import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createParameterSchema,
    updateParameterSchema,
    listParameterSchema
} from "../validators/parameter.validator.js";
import {
    create_parameter,
    get_parameter,
    update_parameter,
    delete_parameter,
    update_parameter_status
} from "../controllers/parameter.controller.js";

const route = express.Router();

route.post(
    "/createParameter",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(createParameterSchema), activityLogger("parameter", "CREATE")],
    create_parameter
);

route.post(
    "/getParameterList",
    [verifyToken, authorize(Action.PRODUCT_LIST), validate(listParameterSchema)],
    get_parameter
);

route.put(
    "/updateParameter/:id",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(idParamSchema, "params"), validate(updateParameterSchema), activityLogger("parameter", "UPDATE")],
    update_parameter
);

route.delete(
    "/deleteParameter/:id",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(idParamSchema, "params"), activityLogger("parameter", "DELETE")],
    delete_parameter
);

route.patch(
    "/updateParameterStatus/:id",
    [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(idParamSchema, "params"), activityLogger("parameter", "UPDATE_STATUS")],
    update_parameter_status
);

export default route;
