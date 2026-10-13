import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    placeOrderSchema,
    orderIdParamSchema,
    myOrdersQuerySchema,
    myOrdersBodySchema,
    verifyPaymentSchema,
    requestReturnItemSchema,
    customerCancelSchema
} from "../../validators/order.validator.js";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    verifyPaymentStatus,
    retryOrderPayment,
    cancelOrderCustomer,
    requestReturnCustomer,
    cancelOrderItemCustomer,
    requestReturnItemCustomer,
    deleteOrderCustomer
} from "../../controllers/app/order.controller.js";
import { verifyToken, optionalAuth } from "../../utils/verifyToken.js";
import { restrictNonIndianCustomer } from "../../middlewares/checkIndianCustomer.middleware.js";

const route = express.Router();
const checkIndia = restrictNonIndianCustomer("Ordering services are currently limited to Indian customers.");

route.post("/placeOrder", [optionalAuth, checkIndia, validate(placeOrderSchema)], placeOrder);

route.post("/verify-payment", [optionalAuth, checkIndia, validate(verifyPaymentSchema)], verifyPaymentStatus);

route.post("/my-orders", [verifyToken, checkIndia, validate(myOrdersBodySchema, "body")], getMyOrders);

route.put("/cancel/:id", [verifyToken, checkIndia, validate(orderIdParamSchema, "params"), validate(customerCancelSchema)], cancelOrderCustomer);

route.put("/return/:id", [verifyToken, checkIndia, validate(orderIdParamSchema, "params"), validate(requestReturnItemSchema)], requestReturnCustomer);

route.put("/cancel-item/:id", [verifyToken, checkIndia, validate(orderIdParamSchema, "params"), validate(customerCancelSchema)], cancelOrderItemCustomer);

route.put("/return-item/:id", [verifyToken, checkIndia, validate(orderIdParamSchema, "params"), validate(requestReturnItemSchema)], requestReturnItemCustomer);

route.post("/:id/retry-payment", [verifyToken, checkIndia, validate(orderIdParamSchema, "params")], retryOrderPayment);

route.get("/deleteOrder/:id", [verifyToken, checkIndia, validate(orderIdParamSchema, "params")], deleteOrderCustomer);

route.get("/:id", [optionalAuth, checkIndia, validate(orderIdParamSchema, "params")], getOrderById);

export default route;
