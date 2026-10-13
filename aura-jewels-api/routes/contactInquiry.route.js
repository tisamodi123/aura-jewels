import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    listContactInquirySchema,
    updateContactInquiryStatusSchema,
} from "../validators/contactInquiry.validator.js";
import {
    getContactInquiryList,
    getContactInquiryDetail,
    updateContactInquiryStatus,
    deleteContactInquiry,
} from "../controllers/contactInquiry.controller.js";

const route = express.Router();

route.post(
    "/getContactInquiryList",
    [verifyToken, authorize(Action.CONTACT_INQUIRY_LIST), validate(listContactInquirySchema), activityLogger("contactInquiry", "VIEW")],
    getContactInquiryList
);

route.get(
    "/getContactInquiryDetail/:id",
    [verifyToken, authorize(Action.CONTACT_INQUIRY_LIST), validate(idParamSchema, "params"), activityLogger("contactInquiry", "VIEW")],
    getContactInquiryDetail
);

route.post(
    "/updateContactInquiryStatus/:id",
    [verifyToken, authorize(Action.CONTACT_INQUIRY_UPDATE), validate(idParamSchema, "params"), validate(updateContactInquiryStatusSchema), activityLogger("contactInquiry", "UPDATE")],
    updateContactInquiryStatus
);

route.get(
    "/deleteContactInquiry/:id",
    [verifyToken, authorize(Action.CONTACT_INQUIRY_UPDATE), validate(idParamSchema, "params"), activityLogger("contactInquiry", "DELETE")],
    deleteContactInquiry
);

export default route;
