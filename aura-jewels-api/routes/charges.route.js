import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createChargesSchema,
    updateChargesSchema,
    listChargesSchema
} from "../validators/charges.validator.js";
import {
    add_charges,
    update_charges,
    get_charges,
    delete_charges,
    update_charges_status
} from "../controllers/charges.controller.js";

const route = express.Router();

route.post("/addCharges", [verifyToken, authorize(Action.LABOUR_CHARGE_CREATE), validate(createChargesSchema)], add_charges);

route.put(
    "/updateCharges/:id",
    [verifyToken, authorize(Action.LABOUR_CHARGE_UPDATE), validate(idParamSchema, "params"), validate(updateChargesSchema)],
    update_charges
);

route.post("/getCharges", [verifyToken, authorize(Action.LABOUR_CHARGE_LIST), validate(listChargesSchema)], get_charges);

route.delete(
    "/deleteCharges/:id",
    [verifyToken, authorize(Action.LABOUR_CHARGE_DELETE), validate(idParamSchema, "params")],
    delete_charges
);

route.patch(
    "/updateChargesStatus/:id",
    [verifyToken, authorize(Action.LABOUR_CHARGE_UPDATE_STATUS), validate(idParamSchema, "params")],
    update_charges_status
);

export default route;
