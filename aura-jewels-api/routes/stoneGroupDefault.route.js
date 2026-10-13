import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createStoneGroupDefaultSchema,
    listStoneGroupDefaultSchema
} from "../validators/stoneGroupDefault.validator.js";
import {
    add_stone_group_default,
    update_stone_group_default,
    get_stone_group_defaults,
    get_active_stone_group_defaults,
    delete_stone_group_default,
    toggle_stone_group_default,
    update_stone_group_status
} from "../controllers/stoneGroupDefault.controller.js";

const route = express.Router();

route.post(
    "/add",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE), validate(createStoneGroupDefaultSchema)],
    add_stone_group_default
);

route.put(
    "/update/:id",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE), validate(idParamSchema, "params"), validate(createStoneGroupDefaultSchema)],
    update_stone_group_default
);

route.post(
    "/getStoneGroupDefaults",
    [verifyToken, authorize(Action.STONE_GROUP_LIST), validate(listStoneGroupDefaultSchema)],
    get_stone_group_defaults
);

route.get(
    "/getActive",
    [verifyToken, authorize(Action.STONE_GROUP_LIST)],
    get_active_stone_group_defaults
);

route.delete(
    "/delete/:id",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE), validate(idParamSchema, "params")],
    delete_stone_group_default
);

route.patch(
    "/toggleDefault/:id",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE), validate(idParamSchema, "params")],
    toggle_stone_group_default
);

route.patch(
    "/updateStatus/:id",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE_STATUS), validate(idParamSchema, "params")],
    update_stone_group_status
);

export default route;
