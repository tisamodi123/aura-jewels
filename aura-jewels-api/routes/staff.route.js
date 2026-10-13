import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createStaffSchema,
    updateStaffSchema,
    listStaffSchema
} from "../validators/staff.validator.js";
import {
    createStaff,
    listStaff,
    updateStaff,
    deleteStaff,
    updateStaffStatus,
    getStaffDetail,
    getMyProfile
} from "../controllers/staff.controller.js";

const route = express.Router();

// Logged-in staff's own profile + permissions (no special role required).
route.get("/me", [verifyToken], getMyProfile);

route.post(
    "/createStaff",
    [verifyToken, authorize(Action.STAFF_CREATE), validate(createStaffSchema), activityLogger("staff", "CREATE")],
    createStaff
);

route.post(
    "/getStaff",
    [verifyToken, authorize(Action.STAFF_LIST), validate(listStaffSchema)],
    listStaff
);

route.get(
    "/getStaffById/:id",
    [verifyToken, authorize(Action.STAFF_LIST), validate(idParamSchema, "params")],
    getStaffDetail
);

route.put(
    "/updateStaff/:id",
    [verifyToken, authorize(Action.STAFF_UPDATE), validate(idParamSchema, "params"), validate(updateStaffSchema), activityLogger("staff", "UPDATE")],
    updateStaff
);

route.delete(
    "/deleteStaff/:id",
    [verifyToken, authorize(Action.STAFF_DELETE), validate(idParamSchema, "params"), activityLogger("staff", "DELETE")],
    deleteStaff
);

route.patch(
    "/updateStaffStatus/:id",
    [verifyToken, authorize(Action.STAFF_UPDATE_STATUS), validate(idParamSchema, "params"), activityLogger("staff", "UPDATE_STATUS")],
    updateStaffStatus
);

export default route;
