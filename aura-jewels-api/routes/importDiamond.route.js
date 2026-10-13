import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { importHistorySchema } from "../validators/importProduct.validator.js";
import { idParamSchema } from "../validators/common.validator.js";
import { addDiamondSchema, updateDiamondSchema, updateDiamondStatusSchema } from "../validators/diamond.validator.js";
import {
  import_diamonds_service,
  get_diamond_import_history,
  get_diamonds_list_admin,
  add_diamond,
  get_diamond_details,
  update_diamond,
  delete_diamond,
  update_diamond_status,
} from "../controllers/importDiamond.controller.js";

const route = express.Router();

route.post("/importDiamond", [verifyToken, authorize(Action.DIAMOND_IMPORT)],
  import_diamonds_service);

route.post("/getDiamondImportHistory", [verifyToken, authorize(Action.DIAMOND_IMPORT),
  validate(importHistorySchema)], get_diamond_import_history);

route.post("/get_diamonds_list_admin", [verifyToken, authorize(Action.PRODUCT_LIST)],
  get_diamonds_list_admin);

route.post("/addDiamond", [verifyToken, authorize(Action.PRODUCT_CREATE), validate(addDiamondSchema)],
  add_diamond);

route.get("/getDiamondDetails/:id", [verifyToken, authorize(Action.PRODUCT_DETAIL), validate(idParamSchema, "params")],
  get_diamond_details);

route.put("/updateDiamond/:id", [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(idParamSchema, "params"), validate(updateDiamondSchema)],
  update_diamond);

route.delete("/deleteDiamond/:id", [verifyToken, authorize(Action.PRODUCT_DELETE), validate(idParamSchema, "params")],
  delete_diamond);

route.patch("/updateDiamondStatus/:id", [verifyToken, authorize(Action.PRODUCT_UPDATE_STATUS), validate(idParamSchema, "params"), validate(updateDiamondStatusSchema)],
  update_diamond_status);

export default route;
