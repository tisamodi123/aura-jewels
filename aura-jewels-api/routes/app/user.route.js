import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    registerSchema,
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    sendOtpSchema,
    verifyPhoneOtpSchema,
    sendEmailOtpSchema,
    verifyEmailOtpSchema,
    updateProfileSchema,
    requestEmailVerifySchema,
    confirmEmailVerifySchema,
    customerRegisterSchema,
    customerLoginSchema,
    verifyCustomerOtpSchema,
    customerResendOtpSchema,
    verifyEmailTokenSchema,
    verifyResetPasswordTokenSchema
} from "../../validators/auth.validator.js";
import {
    register,
    login,
    logout,
    refreshToken,
    customerForgotPassword,
    customerVerifyResetPasswordToken,
    customerResetPassword,
    verifyOtp,
    resendOtp,
    sendOtp,
    verifyPhoneOtp,
    resendPhoneOtp,
    sendEmailOtp,
    verifyEmailOtpLogin,
    resendEmailOtp,
    getProfile,
    updateProfile,
    requestEmailVerify,
    confirmEmailVerify,
    customerRegister,
    customerLogin,
    verifyCustomerOtp,
    customerResendOtp,
    verifyEmailToken
} from "../../controllers/app/user.controller.js";
import { verifyToken } from "../../utils/verifyToken.js";

const route = express.Router();

// ---- Phone + OTP auth (storefront, primary) -------------------------------
// One-shot login / signup: send OTP → verify OTP → JWT. Creates a stub
// User on first send so the verify always has a row to flip.
route.post("/sendOtp", [validate(sendOtpSchema)], sendOtp);
route.post("/verifyPhoneOtp", [validate(verifyPhoneOtpSchema)], verifyPhoneOtp);
route.post("/resendPhoneOtp", [validate(sendOtpSchema)], resendPhoneOtp);

// ---- Email + OTP auth (storefront, peer to phone) -------------------------
// Same one-shot login / signup, delivered over email — for when SMS is down.
route.post("/sendEmailOtp", [validate(sendEmailOtpSchema)], sendEmailOtp);
route.post("/verifyEmailOtp", [validate(verifyEmailOtpSchema)], verifyEmailOtpLogin);
route.post("/resendEmailOtp", [validate(sendEmailOtpSchema)], resendEmailOtp);

// ---- Profile (authenticated) ----------------------------------------------
// Customers populate name + email after the first OTP login.
route.get("/profile", [verifyToken], getProfile);
route.patch("/profile", [verifyToken, validate(updateProfileSchema)], updateProfile);

// ---- Verification (authenticated) — email & phone — same two endpoints ------
// Both routes accept `type: "email" | "phone"` in the body to select the
// channel. Omitting `type` defaults to "email" (backward-compat).
//
// Request OTP   POST /email/send-otp  { type, email? | phone?, countryCode? }
// Confirm OTP   POST /email/verify    { type, otp }
route.post(
    "/email/send-otp",
    [verifyToken, validate(requestEmailVerifySchema)],
    requestEmailVerify,
);
route.post(
    "/email/verify",
    [verifyToken, validate(confirmEmailVerifySchema)],
    confirmEmailVerify,
);

// ---- Legacy email + password flow (kept for backwards compat) -------------
// The storefront no longer drives these — they remain mounted so any
// in-flight build or external integration that still posts here keeps
// working through the transition.

// route.post("/register", [validate(registerSchema)], register);
// route.post("/verifyOtp", [validate(verifyOtpSchema)], verifyOtp);
// route.post("/login", [validate(loginSchema)], login);
// route.post("/resendOtp", [validate(resendOtpSchema)], resendOtp);

route.post("/forgotPassword", [validate(forgotPasswordSchema)], customerForgotPassword);
route.post("/verifyResetPasswordToken", [validate(verifyResetPasswordTokenSchema)], customerVerifyResetPasswordToken);
route.post("/resetPassword", [validate(resetPasswordSchema)], customerResetPassword);

route.post("/refreshToken", refreshToken);
route.post("/logout", [verifyToken], logout);

route.post("/register", [validate(customerRegisterSchema)], customerRegister);
route.post("/login", [validate(customerLoginSchema)], customerLogin);
route.post("/verifyOtp", [validate(verifyCustomerOtpSchema)], verifyCustomerOtp);
route.post("/resendOtp", [validate(customerResendOtpSchema)], customerResendOtp);
route.post("/verifyEmailToken", [validate(verifyEmailTokenSchema)], verifyEmailToken);

export default route;
