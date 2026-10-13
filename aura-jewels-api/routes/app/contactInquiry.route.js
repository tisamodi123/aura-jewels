import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { createContactInquirySchema } from "../../validators/contactInquiry.validator.js";
import { createContactInquiry } from "../../controllers/contactInquiry.controller.js";

const route = express.Router();

// Public — the storefront "Get in Touch" form must work for signed-out
// visitors, so no verifyToken here. The controller applies a per-IP throttle
// because this endpoint sends two emails per call.
route.post("/submit", [validate(createContactInquirySchema)], createContactInquiry);

export default route;
