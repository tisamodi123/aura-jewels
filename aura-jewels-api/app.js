import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import appRoute from "./routes/app.route.js";
import { adminRegister } from "./controllers/auth.controller.js";
import { uploadMiddleware } from "./utils/multer.js";
import { STATUS_CODE } from "./constants/statusCode.constant.js";

dotenv.config({ path: "./.env" });

import authRoute from "./routes/auth.route.js";
import staffRoute from "./routes/staff.route.js";
import permissionRoute from "./routes/permission.route.js";
import customerRoute from "./routes/customer.route.js";
import activityLogRoute from "./routes/activityLog.route.js";
import categoryRoute from "./routes/category.route.js";
import collectionRoute from "./routes/collection.route.js";
import metalPriceRoute from "./routes/metalPrice.route.js";
import metalRoute from "./routes/metal.route.js";
import ChargesRoute from "./routes/charges.route.js";
import tagsRoute from "./routes/tag.route.js";
import stoneGroupRoute from "./routes/stoneGroup.route.js";
import stoneGroupDefaultRoute from "./routes/stoneGroupDefault.route.js";
import importProductRoute from "./routes/importProduct.route.js";
import importDiamondRoute from "./routes/importDiamond.route.js";
import productRoute from "./routes/product.route.js";
import parameterRoute from "./routes/parameter.route.js";
import sizesRoute from "./routes/sizes.route.js";
import countryRoute from "./routes/country.route.js";
import publicSearchRoute from "./routes/app/publicSearch.route.js";
import orderRoute from "./routes/order.route.js";
import { whatsappPurchase } from "./controllers/order.controller.js";
import seoRoute from "./routes/seo.route.js";
import { verifyToken } from "./utils/verifyToken.js";
import { authorize } from "./utils/checkPermission.js";
import Action from "./constants/permissionAction.constant.js";
import homeSectionRoute from "./routes/homeSection.route.js";
import categoryLandingRoute from "./routes/categoryLanding.route.js";
import settingRoute from "./routes/setting.route.js";
import labelRoute from "./routes/label.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import currencyRoute from "./routes/currency.route.js";
import CustomJewelleryRoute from "./routes/app/customJewellery.route.js";
import CustomJewelleryRouteAdmin from "./routes/customJewellery.route.js";
import offerRoute from "./routes/offer.route.js";
import couponRoute from "./routes/coupon.route.js";
import orderInquiryRoute from "./routes/orderInquiry.route.js";
import contactInquiryRoute from "./routes/contactInquiry.route.js";
import menuRoute from "./routes/menu.route.js";
import subscriptionRoute from "./routes/subscription.route.js";

const app = express();

// Behind a reverse proxy / CDN: trust the forwarding headers
// so req.ip and the geo-block resolve the REAL client IP, not the proxy's.
app.set("trust proxy", true);

// Restrict CORS to known origins in production via CORS_ORIGINS (comma-separated).
// Falls back to "*" when unset so nothing breaks — set it before go-live.
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001").split(",").map(s => s.trim()).filter(Boolean);
if (!corsOrigins.length) {
    console.warn("[cors] CORS_ORIGINS not set — allowing all origins (*). Set it for production.");
}

console.log("[cors] Allowed origins:", corsOrigins.length ? corsOrigins : "*");
app.use(cors({
    origin: corsOrigins.length ? corsOrigins : "*",
    credentials: corsOrigins.length > 0,
}));

// Capture the untouched request bytes on `req.rawBody` while still parsing JSON
// normally. The Razorpay webhook needs the exact raw body for HMAC verification;
// re-serialising the parsed object would not reproduce the wire bytes and the
// signature would never match. A route-level express.raw() cannot achieve this
// because this global parser runs first and sets req._body, making the later
// raw parser a no-op in Express 5.
app.use(express.json({
    verify: (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true }));

app.use(uploadMiddleware);

const url = process.env.APP_URL;

app.use(`${url}checkuser`, (req, res) => {
    return res
        .status(STATUS_CODE.OK)
        .json({ success: true, message: "Connected" });
});

app.use(`${url}auth`, authRoute);
app.use(`${url}staff`, staffRoute);
app.use(`${url}permission`, permissionRoute);
app.use(`${url}customer`, customerRoute);
app.use(`${url}activityLog`, activityLogRoute);
app.use(`${url}category`, categoryRoute);
app.use(`${url}collection`, collectionRoute);
app.use(`${url}metal`, metalRoute);
app.use(`${url}metalPrice`, metalPriceRoute);
app.use(`${url}charges`, ChargesRoute);
app.use(`${url}tags`, tagsRoute);
app.use(`${url}stoneGroup`, stoneGroupRoute);
app.use(`${url}stoneGroupDefault`, stoneGroupDefaultRoute);
app.use(`${url}productImport`, importProductRoute);
app.use(`${url}diamondImport`, importDiamondRoute);
app.use(`${url}products`, productRoute);
app.use(`${url}parameter`, parameterRoute);
app.use(`${url}sizes`, sizesRoute);
app.use(`${url}country`, countryRoute);
app.use(`${url}state`, countryRoute);
app.use(`${url}city`, countryRoute);
app.use(`${url}public-search`, publicSearchRoute);
app.use(`${url}order`, orderRoute);
app.post(`${url}api/admin/whatsapp-purchase`, [verifyToken, authorize(Action.ORDER_UPDATE_STATUS)], whatsappPurchase);
app.use(`${url}homeSection`, homeSectionRoute);
app.use(`${url}categoryLanding`, categoryLandingRoute);
app.use(`${url}setting`, settingRoute);
app.use(`${url}setting`, seoRoute);
app.use(`${url}api/setting`, seoRoute);
app.use(`${url}api`, seoRoute);
app.use(`${url}label`, labelRoute);
app.use(`${url}dashboard`, dashboardRoute);
app.use(`${url}currency`, currencyRoute);
app.use(`${url}custom`, CustomJewelleryRoute);
app.use(`${url}custom/admin`, CustomJewelleryRouteAdmin);
app.use(`${url}offer`, offerRoute);
app.use(`${url}coupon`, couponRoute);
app.use(`${url}orderInquiry`, orderInquiryRoute);
app.use(`${url}contactInquiry`, contactInquiryRoute);
app.use(`${url}menu`, menuRoute);
app.use(`${url}subscription`, subscriptionRoute);

// India-only geo-block (IP based) — scoped to the STOREFRONT (/app) routes ONLY,
// so a customer outside India can't log in / browse / cart / order, while the
// admin panel (all non-/app routes) stays reachable for staff anywhere. No-op
// unless ENFORCE_INDIA_ONLY=true; fail-open; exempts the payment webhook.
app.use(`${url}app`, appRoute);
// enforceIndiaOnly
adminRegister();

export default app;
