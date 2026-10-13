import express from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import { createCustomJewellerySchema } from "../../validators/customJewellery.validator.js";
import {
  cancelCustomOrderRequest,
  createCustomJewelleryController,
  getMyCustomOrders,
  getMyOrderQuotations,
  returnCustomOrderRequest,
  updateMyQuotationStatus,
} from "../../controllers/customJewellery.controller.js";
import { verifyToken } from "../../utils/verifyToken.js";

const route = express.Router();

route.post(
  "/createCustomJewellery",
  [validate(createCustomJewellerySchema)],
  createCustomJewelleryController
);

route.post("/myCustomOrders", [verifyToken], getMyCustomOrders);

route.get("/myQuotations/:id", [verifyToken], getMyOrderQuotations);

route.post("/updateQuationStatus", [verifyToken], updateMyQuotationStatus);

route.get("/cancelCustomOrderRequest/:id", [verifyToken], cancelCustomOrderRequest);

route.post("/returnCustomOrderRequest/:id", [verifyToken], returnCustomOrderRequest);

export default route;
