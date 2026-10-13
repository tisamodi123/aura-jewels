import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createMetalPriceSchema,
    updateMetalPriceSchema,
    listMetalPriceSchema
} from "../validators/metalPrice.validator.js";
import {
    create_metal_price,
    get_metal_price,
    update_metal_price,
    delete_metal_price,
    get_active_metal_price,
    update_metal_price_status
} from "../controllers/metalPrice.controller.js";

const route = express.Router();

route.post(
    "/addMetalPrice",
    [verifyToken, authorize(Action.METAL_TYPE_UPDATE), validate(createMetalPriceSchema), activityLogger("metalPrice", "CREATE")],
    create_metal_price
);

route.post(
    "/getMetalPriceList",
    [verifyToken, authorize(Action.METAL_TYPE_LIST), validate(listMetalPriceSchema)],
    get_metal_price
);

route.get("/getActive", get_active_metal_price);

route.put(
    "/updateMetalPrice/:id",
    [verifyToken, authorize(Action.METAL_TYPE_UPDATE), validate(idParamSchema, "params"), validate(updateMetalPriceSchema), activityLogger("metalPrice", "UPDATE")],
    update_metal_price
);

route.delete(
    "/deleteMetalPrice/:id",
    [verifyToken, authorize(Action.METAL_TYPE_UPDATE), validate(idParamSchema, "params"), activityLogger("metalPrice", "DELETE")],
    delete_metal_price
);

route.patch(
    "/updateMetalPriceStatus/:id",
    [verifyToken, authorize(Action.METAL_TYPE_UPDATE), validate(idParamSchema, "params"), activityLogger("metalPrice", "UPDATE_STATUS")],
    update_metal_price_status
);

export default route;
