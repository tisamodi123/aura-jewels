import express from "express";
import { verifyToken, optionalAuth } from "../../utils/verifyToken.js";
import { applyCoupon, getPublicCouponBanners, getApplicableCoupons } from "../../controllers/coupon.controller.js";

const router = express.Router();

// Apply coupon code (Authenticated / Optional Authentication for non-assigneeOnly codes)
router.post("/apply", [verifyToken], applyCoupon);

// Fetch public banner coupons list
router.get("/banners", getPublicCouponBanners);

// Fetch all applicable coupons grouped by type (public / assigneeOnly).
// Optional auth: guests get PUBLIC coupons; signed-in users also get their
// assigneeOnly coupons. The controller already handles a missing userId, so a
// strict verifyToken here (which 403'd guests) contradicted that intent.
router.get("/getApplicableCoupons", [optionalAuth], getApplicableCoupons);

export default router;
