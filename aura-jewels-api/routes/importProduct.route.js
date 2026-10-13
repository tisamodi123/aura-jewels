import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { importHistorySchema } from "../validators/importProduct.validator.js";
import { import_product } from "../utils/mainProcess.js";
import { get_import_history } from "../controllers/importProduct.controller.js";

const route = express.Router();

route.post("/importProduct", [verifyToken, authorize(Action.PRODUCT_IMPORT)], import_product);

route.post("/getImportHistory", [verifyToken, authorize(Action.PRODUCT_LIST), validate(importHistorySchema)], get_import_history);

export default route;
