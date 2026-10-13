import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    listOrdersSchema,
    updateOrderStatusSchema,
    updateOrderTrackingSchema,
    changeOrderItemStatusSchema,
    ChangeOrderPaymentStatusSchema
} from "../validators/order.validator.js";
import {
    getOrdersList,
    getOrderDetail,
    updateOrderStatus,
    updateOrderItemStatus,
    updateOrderTracking,
    changeOrderItemStatus,
    ChangeOrderPaymentStatus,
    requestOrderPaymentLink,
    reconcileOrderPayment,
    getRecentOrders,
    uploadOrderInvoice
} from "../controllers/order.controller.js";

const route = express.Router();

route.post("/recent-orders", [verifyToken, authorize(Action.ORDER_LIST)], getRecentOrders);
route.post("/orderList", [verifyToken, authorize(Action.ORDER_LIST), validate(listOrdersSchema)], getOrdersList);
route.post("/:id/payment-link", [verifyToken, authorize(Action.ORDER_UPDATE_STATUS), validate(idParamSchema, "params")], requestOrderPaymentLink);
route.post("/:id/reconcile-payment", [verifyToken, authorize(Action.ORDER_UPDATE_STATUS), validate(idParamSchema, "params")], reconcileOrderPayment);
route.get("/orderDetail/:id", [verifyToken, authorize(Action.ORDER_DETAIL), validate(idParamSchema, "params")], getOrderDetail);
route.put(
    "/updateStatus/:id",
    [verifyToken, authorize(Action.ORDER_UPDATE_STATUS), validate(idParamSchema, "params"), validate(updateOrderStatusSchema)],
    updateOrderStatus
);
route.put(
    "/updateItemStatus/:id",
    [verifyToken, authorize(Action.ORDER_UPDATE_STATUS), validate(idParamSchema, "params"), validate(updateOrderStatusSchema)],
    updateOrderItemStatus
);
route.put(
    "/update-tracking/:id",
    [verifyToken, authorize(Action.ORDER_UPDATE_TRACKING), validate(idParamSchema, "params"), validate(updateOrderTrackingSchema)],
    updateOrderTracking
);

route.post(
    "/changeOrderItemStatus",
    [verifyToken, authorize(Action.ORDER_UPDATE_STATUS), validate(changeOrderItemStatusSchema)],
    changeOrderItemStatus
);

route.post(
    "/ChangeOrderPaymentStatus",
    [verifyToken, authorize(Action.ORDER_PAYMENT_STATUS), validate(ChangeOrderPaymentStatusSchema)],
    ChangeOrderPaymentStatus
);
route.post(
    "/:id/invoice",
    [verifyToken, authorize(Action.ORDER_UPDATE_STATUS), validate(idParamSchema, "params")],
    uploadOrderInvoice
);

export default route;
