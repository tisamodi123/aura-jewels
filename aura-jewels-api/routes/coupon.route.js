import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import { createCouponSchema, updateCouponSchema, parseMultipartJson } from "../validators/coupon.validator.js";
import {
    addCoupon,
    updateCoupon,
    getCoupons,
    getCouponDetail,
    deleteCoupon
} from "../controllers/coupon.controller.js";

const route = express.Router();

// Admin Panel Routes
route.post("/getCouponList", [verifyToken, authorize(Action.COUPON_LIST)], getCoupons);
route.post("/createCoupon", [verifyToken, authorize(Action.COUPON_CREATE), parseMultipartJson, validate(createCouponSchema)], addCoupon);
route.post("/updateCoupon/:id", [verifyToken, authorize(Action.COUPON_UPDATE), parseMultipartJson, validate(idParamSchema, "params"), validate(updateCouponSchema)], updateCoupon);
route.get("/getCouponDetail/:id", [verifyToken, authorize(Action.COUPON_LIST), validate(idParamSchema, "params")], getCouponDetail);
route.get("/deleteCoupon/:id", [verifyToken, authorize(Action.COUPON_DELETE), validate(idParamSchema, "params")], deleteCoupon);

export default route;
