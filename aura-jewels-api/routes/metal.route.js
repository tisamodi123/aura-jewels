import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createMetalSchema,
    updateMetalSchema,
    listMetalSchema
} from "../validators/metal.validator.js";
import {
    add_metal,
    get_metal_list,
    update_metal,
    delete_metal,
    update_metal_status,
    sync_metal_price
} from "../controllers/metal.controller.js";

const router = express.Router();

router.post("/addMetal", [verifyToken, authorize(Action.METAL_TYPE_CREATE), validate(createMetalSchema)], add_metal);
router.post("/listMetal", [verifyToken, authorize(Action.METAL_TYPE_LIST), validate(listMetalSchema)], get_metal_list);
router.put("/updateMetal/:id", [verifyToken, authorize(Action.METAL_TYPE_UPDATE), validate(idParamSchema, "params"), validate(updateMetalSchema)], update_metal);
router.delete("/deleteMetal/:id", [verifyToken, authorize(Action.METAL_TYPE_DELETE), validate(idParamSchema, "params")], delete_metal);
router.patch("/updateMetalStatus/:id", [verifyToken, authorize(Action.METAL_TYPE_UPDATE_STATUS), validate(idParamSchema, "params")], update_metal_status);
router.post("/syncMetalPrice", [verifyToken, authorize(Action.METAL_TYPE_UPDATE)], sync_metal_price);

export default router;
