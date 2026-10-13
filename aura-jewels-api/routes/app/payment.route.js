import express from "express";
import { paymentWebhook } from "../../controllers/app/payment.controller.js";

const route = express.Router();

// Public webhook — verified by Razorpay signature (HMAC), not by auth token.
// The untouched body is captured globally on req.rawBody (see app.js) so the
// HMAC matches byte-for-byte; a route-level express.raw() would be a no-op
// after the global express.json() parser has already run.
route.post("/webhook", paymentWebhook);

export default route;
