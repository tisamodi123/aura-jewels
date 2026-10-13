import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import { listActivityLogSchema } from "../validators/activityLog.validator.js";
import {
    getActivityLogs,
    getActivityLogById
} from "../controllers/activityLog.controller.js";

const route = express.Router();

route.post(
    "/getActivityLog",
    [verifyToken, authorize(Action.ACTIVITY_LOG_LIST), validate(listActivityLogSchema)],
    getActivityLogs
);

route.get(
    "/getActivityLogById/:id",
    [verifyToken, authorize(Action.ACTIVITY_LOG_DETAIL), validate(idParamSchema, "params")],
    getActivityLogById
);

export default route;
