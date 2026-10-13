import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import { listSubscriptionSchema } from "../validators/subscription.validator.js";
import {
    getSubscriptionList,
    deleteSubscription,
} from "../controllers/subscription.controller.js";

const route = express.Router();

route.post(
    "/getSubscriptionList",
    [verifyToken, authorize(Action.SUBSCRIPTION_LIST), validate(listSubscriptionSchema), activityLogger("subscription", "VIEW")],
    getSubscriptionList
);

route.get(
    "/deleteSubscription/:id",
    [verifyToken, authorize(Action.SUBSCRIPTION_DELETE), validate(idParamSchema, "params"), activityLogger("subscription", "DELETE")],
    deleteSubscription
);

export default route;
