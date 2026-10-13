import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { createInquirySchema } from "../../validators/inquiry.validator.js";
import { createInternationalInquiry, getOrderInquiryList } from "../../controllers/inquiry.controller.js";
import { verifyToken } from "../../utils/verifyToken.js";

const route = express.Router();

// ─── Public Route ─────────────────────────────────────────────────────────
// POST /app/inquiry  — submit a product inquiry (no auth required)
route.post(
    "/placeIntenationalOrderInquiry",
    [verifyToken, validate(createInquirySchema)],
    createInternationalInquiry
);

route.post(
    "/orderInquiryList",
    [verifyToken],
    getOrderInquiryList
)

export default route;
