import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createStoneGroupSchema,
    updateStoneGroupSchema,
    listStoneGroupSchema,
    exportStoneGroupSchema,
    stoneGroupHistorySchema
} from "../validators/stoneGroup.validator.js";
import {
    get_stone_group,
    import_stone_group,
    add_stone_group,
    update_stone_group,
    update_stone_group_status,
    export_stone_group,
    get_stone_group_history,
    delete_stone_group,
    get_distinct_stone_attributes,
    get_stone_group_combinations
} from "../controllers/stoneGroup.controller.js";

const route = express.Router();

route.post("/importStoneGroup", [verifyToken, authorize(Action.STONE_GROUP_IMPORT)], import_stone_group);

// Add ONE stone group in place. importStoneGroup replaces the entire collection,
// which orphans every ProductStone.stoneGroup — never use it to add a single row.
route.post(
    "/addStoneGroup",
    [verifyToken, authorize(Action.STONE_GROUP_CREATE), validate(createStoneGroupSchema)],
    add_stone_group
);

route.get("/getDistinctStoneAttributes", [verifyToken, authorize(Action.STONE_GROUP_LIST)], get_distinct_stone_attributes);

route.get("/getStoneGroupCombinations", [verifyToken, authorize(Action.STONE_GROUP_LIST)], get_stone_group_combinations);

route.post("/getStoneGroup", [verifyToken, authorize(Action.STONE_GROUP_LIST), validate(listStoneGroupSchema)], get_stone_group);

route.put(
    "/updateStoneGroup/:id",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE), validate(idParamSchema, "params"), validate(updateStoneGroupSchema)],
    update_stone_group
);

route.patch(
    "/updateStoneGroupStatus/:id",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE_STATUS), validate(idParamSchema, "params")],
    update_stone_group_status
);

route.delete(
    "/deleteStoneGroup/:id",
    [verifyToken, authorize(Action.STONE_GROUP_UPDATE), validate(idParamSchema, "params")],
    delete_stone_group
);

route.post("/exportStoneGroup", [verifyToken, authorize(Action.STONE_GROUP_LIST), validate(exportStoneGroupSchema)], export_stone_group);

route.post("/getStoneGroupHistory", [verifyToken, authorize(Action.STONE_GROUP_LIST), validate(stoneGroupHistorySchema)], get_stone_group_history);

export default route;
