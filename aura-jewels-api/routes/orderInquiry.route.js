import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import { updateInquiryStatusSchema, listInquirySchema } from "../validators/inquiry.validator.js";
import {
    getInquiryList,
    getInquiryDetail,
    updateInquiryStatus,
    deleteInquiry
} from "../controllers/inquiry.controller.js";

const route = express.Router();

route.post(
    "/getOrderInquiryList",
    [verifyToken, authorize(Action.ORDER_INQUIRY_LIST), validate(listInquirySchema), activityLogger("inquiry", "VIEW")],
    getInquiryList
);

route.get(
    "/getOrderInquiryDetail/:id",
    [verifyToken, authorize(Action.ORDER_INQUIRY_LIST), validate(idParamSchema, "params"), activityLogger("inquiry", "VIEW")],
    getInquiryDetail
);

route.post(
    "/updateOrderInquiryStatus/:id",
    [verifyToken, authorize(Action.ORDER_INQUIRY_UPDATE), validate(idParamSchema, "params"), validate(updateInquiryStatusSchema)],
    updateInquiryStatus
);

route.get(
    "/deleteOrderInquiry/:id",
    [verifyToken, authorize(Action.ORDER_INQUIRY_UPDATE), validate(idParamSchema, "params"), activityLogger("inquiry", "DELETE")],
    deleteInquiry
);

export default route;
