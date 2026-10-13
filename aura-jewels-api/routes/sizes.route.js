import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createSizeSchema,
    updateSizeSchema,
    listSizesSchema
} from "../validators/sizes.validator.js";
import {
    create_size,
    delete_size,
    get_size_by_id,
    get_sizes_list,
    update_size,
    update_size_status
} from "../controllers/sizes.controller.js";

const router = express.Router();

router.post("/list", [verifyToken, authorize(Action.SIZE_LIST), validate(listSizesSchema)], get_sizes_list);
router.get("/detail/:id", [verifyToken, authorize(Action.SIZE_LIST), validate(idParamSchema, "params")], get_size_by_id);
router.post("/create", [verifyToken, authorize(Action.SIZE_CREATE), validate(createSizeSchema)], create_size);
router.put("/update/:id", [verifyToken, authorize(Action.SIZE_UPDATE), validate(idParamSchema, "params"), validate(updateSizeSchema)], update_size);
router.delete("/delete/:id", [verifyToken, authorize(Action.SIZE_DELETE), validate(idParamSchema, "params")], delete_size);
router.patch("/status/:id", [verifyToken, authorize(Action.SIZE_UPDATE_STATUS), validate(idParamSchema, "params")], update_size_status);

export default router;
