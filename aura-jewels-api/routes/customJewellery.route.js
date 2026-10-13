import express from "express";

import { validate } from "../middlewares/validate.middleware.js";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import {
  assignCustomerToOrder,
  createQuotations,
  getAllCustomOrder,
  getQuotation,
  updateCustomOrderStatus,
  updateQuotationStatus,
  requestCustomPaymentLink,
} from "../controllers/customJewellery.controller.js";
import { createQuotationSchema } from "../validators/quotation.validator.js";
import { assignCustomOrderValidator } from "../validators/assignCustomOrder.validator.js";

const route = express.Router();

// Admin — generate a payment link for a bespoke order (quote + advance payment).
route.post(
  "/:id/payment-link",
  [verifyToken, authorize(Action.CUSTOM_ORDER_PAYMENT), activityLogger("customOrder", "PAYMENT_LINK")],
  requestCustomPaymentLink
);

route.post(
  "/getAllCustomOrders",
  [verifyToken, authorize(Action.CUSTOM_ORDER_LIST), activityLogger("customOrder", "VIEW")],
  getAllCustomOrder
);

route.post(
  "/addQuotations",
  [
    verifyToken, authorize(Action.CUSTOM_ORDER_UPDATE),
    validate(createQuotationSchema),
    activityLogger("quotation", "CREATE"),
  ],
  createQuotations
);

route.post(
  "/assignCustomer",
  [
    verifyToken, authorize(Action.CUSTOM_ORDER_LIST),
    validate(assignCustomOrderValidator),
    activityLogger("assignCustomer", "UPDATE"),
  ],
  assignCustomerToOrder
);

route.get(
  "/getQuotation/:id",
  [verifyToken, authorize(Action.CUSTOM_ORDER_LIST), activityLogger("getQuotation", "VIEW")],
  getQuotation
);

route.post(
  "/updateQuotationStatus",
  [verifyToken, authorize(Action.CUSTOM_ORDER_UPDATE), activityLogger("approveRejectStatus", "UPDATE_STATUS")],
  updateQuotationStatus
);

route.post(
  "/updateCustomOrderStatus",
  [verifyToken, authorize(Action.CUSTOM_ORDER_UPDATE), activityLogger("customOrderStatus", "UPDATE_STATUS")],
  updateCustomOrderStatus
);

export default route;
