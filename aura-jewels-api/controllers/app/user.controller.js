import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../../models/user.model.js";

import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import Constant from "../../constants/user.constant.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { resetPasswordTemplate } from "../../mailtemplates/user.mail.js";
import { otpEmail, verifyEmailOtp, welcomeEmail } from "../../mailtemplates/auth.mail.js";
import { MAIL } from "../../config/mail.config.js";
import {
  OTP_TEST_MODE,
  OTP_VALIDITY_MS,
  generateOtpCode,
  normalisePhone,
  normaliseCountryCode,
  sendOtpToPhone,
} from "../../services/otp.services.js";
import {
  processIndianRegistration,
  processGlobalRegistration,
  processIndianLogin,
  processGlobalLogin,
  processVerifyOtp,
  processCustomerResendOtp,
  processVerifyEmailToken,
  processCustomerForgotPassword,
  processCustomerVerifyResetPasswordToken,
  processCustomerResetPassword,
} from "../../services/auth.services.js";
import { syncWishlistData } from "../../services/wishlist.services.js";
import { syncCartData } from "../../services/cart.services.js";
import { verifyCaptcha } from "../../utils/verifyCaptcha.js";

// OTP_VALIDITY_MS is imported (single source = 3 min). Resend uses the same window.
const OTP_RESEND_VALIDITY_MS = OTP_VALIDITY_MS;
const RESET_TOKEN_VALIDITY_MS = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ----------------------------------------------------------------------------
// Phone + OTP auth — primary storefront identity.
//
//   1. POST /app/auth/sendOtp        { phone, countryCode? } → OTP issued.
//      Creates a placeholder User (status: PENDING, phoneVerified: false)
//      if none matches the phone yet, so the verify step always has a
//      row to flip.
//   2. POST /app/auth/verifyOtp      { phone, countryCode?, otp } → JWT
//      issued. Sets phoneVerified=true and status=ACTIVE on the User.
//
// `email` + `name` are NOT collected during auth — customers populate
// them later from "My Account → Profile". This keeps the signup flow
// to a single OTP screen and removes the password concept entirely on
// the storefront side. Admin / staff still log in by email + password
// through their own routes.
// ----------------------------------------------------------------------------

// Issues an OTP, persists it on the user, and dispatches via the stub.
// During OTP_TEST_MODE the response echoes the OTP back so QA can
// complete the flow without provider access — flip OTP_TEST_MODE=false
// in production env to suppress that.
const issuePhoneOtp = async (user, { purpose = "login" } = {}) => {
  try {
    const otp = generateOtpCode();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_VALIDITY_MS;
    await user.save();
    const cc = user.phoneCountryCode || "+91";
    await sendOtpToPhone({ countryCode: cc, phone: user.phone, otp, purpose });
    return otp;
  } catch (error) {
    console.error("issuePhoneOtp error:", error);
    return null;
  }
};

export const sendOtp = async (req, res) => {
  try {
    const rawPhone = req.body.phone;
    const phone = Number(normalisePhone(rawPhone));
    const countryCode = normaliseCountryCode(req.body.countryCode);

    if (!phone) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Phone number required",
      });
    }

    // Find any non-deleted user with this phone (regardless of role).
    // Admin-side accounts that also have a phone shouldn't be cloned —
    // they reuse the same record.
    let user = await User.findOne({ phone, isDeleted: 0 });

    if (user && user.status === Constant.STATUS.SUSPENDED) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        errorCode: STATUS_CODE.FORBIDDEN,
        message: MESSAGES.AUTH.ACCOUNT_SUSPENDED,
      });
    }

    // Throttle: if the previous OTP was issued in the last 30 seconds
    // refuse to issue another. Stops accidental double-submits from
    // burning OTPs.
    if (
      user?.otp &&
      user.otpExpiry &&
      user.otpExpiry - Date.now() > OTP_VALIDITY_MS - 30 * 1000
    ) {
      return res.status(STATUS_CODE.TOO_MANY_REQUESTS).json({
        errorCode: STATUS_CODE.TOO_MANY_REQUESTS,
        message: "Please wait before requesting another OTP",
      });
    }

    if (!user) {
      user = await User.create({
        phone,
        phoneCountryCode: countryCode,
        role: Constant.ROLES.CUSTOMER,
        status: Constant.STATUS.PENDING,
        phoneVerified: false,
        emailVerified: false,
        userCountryOrigin: countryCode.trim().replace("+", "") === "91" ? "India" : "International"
      });
    } else if (user.phoneCountryCode !== countryCode) {
      // Customer changed their country code on a re-login — accept.
      user.phoneCountryCode = countryCode;
    }

    const otp = await issuePhoneOtp(user, { purpose: "login" });

    const response = {
      errorCode: STATUS_CODE.OK,
      message: "OTP sent",
      isNewAccount:
        user.status === Constant.STATUS.PENDING && !user.phoneVerified,
    };
    if (OTP_TEST_MODE) response.testOtp = otp;
    return res.status(STATUS_CODE.OK).json(response);
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

// Verifies the OTP, marks the user ACTIVE + phoneVerified, and issues a
// JWT. The customer flow is "log in" and "sign up" in the same call —
// the only side effect on a new user is that name/email stay null until
// they fill them in from My Profile.
export const verifyPhoneOtp = async (req, res) => {
  try {
    const phone = Number(normalisePhone(req.body.phone));
    const otp = String(req.body.otp || "").trim();

    if (!phone || !otp) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Phone and OTP required",
      });
    }

    const user = await User.findOne({ phone, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_INVALID,
      });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_EXPIRED,
      });
    }

    // Flip identity flags + issue tokens.
    user.phoneVerified = true;
    if (req.body.name) {
      user.name = req.body.name;
    } else if (req.body?.firstName || req.body?.lastName) {
      user.name = ((req.body?.firstName || "") + " " + (req.body?.lastName || "")).trim();
    }
    user.status = Constant.STATUS.ACTIVE;
    user.otp = null;
    user.otpExpiry = null;

    const accessToken = generateAccessToken({
      userId: user._id,
      role: [user.role],
      email: user.email || "",
      phone: user.phone,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    user.loginToken = accessToken;
    user.lastLogin = new Date();
    await user.save();

    if (req.body.wishlist) {
      await syncWishlistData(user._id, req.body.wishlist);
    }
    if (req.body.cart) {
      await syncCartData(user._id, req.body.cart);
    }

    // Prefixed cookie name keeps the storefront refresh token from
    // colliding with anything the admin panel might set on the same
    // host. See admin/services/clientCookies.ts for the matching
    // rename on the client.
    res.cookie("customer_refresh", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken,
      user: {
        _id: user._id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode || "+91",
        emailVerified: !!user.emailVerified,
        phoneVerified: !!user.phoneVerified,
        role: user.role,
        // Lets the storefront prompt for name/email when these
        // are missing on a first-time signup.
        profileIncomplete: !user.name || !user.email,
      },
    });
  } catch (error) {
    console.error("verifyPhoneOtp error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const resendPhoneOtp = async (req, res) => {
  try {
    const phone = Number(normalisePhone(req.body.phone));
    if (!phone) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Phone number required",
      });
    }
    const user = await User.findOne({ phone, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }
    const otp = await issuePhoneOtp(user, { purpose: "resend" });
    const response = {
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.OTP_RESENT,
    };
    if (OTP_TEST_MODE) response.testOtp = otp;
    return res.status(STATUS_CODE.OK).json(response);
  } catch (error) {
    console.error("resendPhoneOtp error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

// ----------------------------------------------------------------------------
// Email + OTP auth — a full PEER to the phone flow above, added so customers
// can sign up / log in when SMS delivery is unavailable. Same one-shot model
// (login and signup are the same call); the only signup side effect is that
// `name` stays null until the customer fills it in.
//   1. POST /app/auth/sendEmailOtp    { email }        → OTP emailed
//   2. POST /app/auth/verifyEmailOtp  { email, otp }   → JWT (+ name prompt on signup)
//   3. POST /app/auth/resendEmailOtp  { email }        → re-issues the OTP
// A stub PENDING user is created on first send so verify always has a row.
// ----------------------------------------------------------------------------

const normaliseEmail = (raw) => String(raw || "").trim().toLowerCase();

// Mirrors issuePhoneOtp: persist the OTP then dispatch it — here over email.
// Returns the OTP on success, null on failure (email is the delivery channel,
// so the caller surfaces a failure to the customer instead of silently 200-ing).
const issueEmailOtp = async (user, { purpose = "log in to your account" } = {}) => {
  try {
    const otp = generateOtpCode();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_VALIDITY_MS;
    await user.save();
    await sendEmail(
      user.email,
      `Your ${MAIL.brandName || "Aura Jewels"} OTP`,
      otpEmail({ name: user.name, otp, purpose }),
      { from: MAIL.senders?.account }
    );
    return otp;
  } catch (error) {
    console.error("issueEmailOtp error:", error);
    return null;
  }
};

export const sendEmailOtp = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    if (!email) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Email required",
      });
    }

    // Reuse any existing (non-deleted) account with this email, regardless of
    // role — an admin/customer who also has this email keeps the same record.
    let user = await User.findOne({ email, isDeleted: 0 });

    if (user && user.status === Constant.STATUS.SUSPENDED) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        errorCode: STATUS_CODE.FORBIDDEN,
        message: MESSAGES.AUTH.ACCOUNT_SUSPENDED,
      });
    }

    // Throttle: refuse a new OTP if one was issued in the last 30 seconds.
    if (
      user?.otp &&
      user.otpExpiry &&
      user.otpExpiry - Date.now() > OTP_VALIDITY_MS - 30 * 1000
    ) {
      return res.status(STATUS_CODE.TOO_MANY_REQUESTS).json({
        errorCode: STATUS_CODE.TOO_MANY_REQUESTS,
        message: "Please wait before requesting another OTP",
      });
    }

    if (!user) {
      user = await User.create({
        email,
        role: Constant.ROLES.CUSTOMER,
        status: Constant.STATUS.PENDING,
        phoneVerified: false,
        emailVerified: false,
      });
      
      if (!req.body.captcha) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Captcha is required",
        });
      }
      console.log("Captach Found", req?.body?.captcha)
      await verifyCaptcha(req.body.captcha);
    }

    const otp = await issueEmailOtp(user, { purpose: "log in to your account" });
    if (!otp) {
      return res.status(STATUS_CODE.INTERNAL_ERROR).json({
        errorCode: STATUS_CODE.INTERNAL_ERROR,
        message: "Could not send the OTP email. Please try again.",
      });
    }

    const response = {
      errorCode: STATUS_CODE.OK,
      message: "OTP sent",
      isNewAccount:
        user.status === Constant.STATUS.PENDING && !user.emailVerified,
    };
    if (OTP_TEST_MODE) response.testOtp = otp;
    return res.status(STATUS_CODE.OK).json(response);
  } catch (error) {
    console.error("sendEmailOtp error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

// Verifies the emailed OTP, marks the user ACTIVE + emailVerified, issues a
// JWT. Login and signup are the same call — a first-time user just has a null
// name (the client prompts for it via `profileIncomplete`).
export const verifyEmailOtpLogin = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Email and OTP required",
      });
    }

    const user = await User.findOne({ email, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_INVALID,
      });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_EXPIRED,
      });
    }

    // Flip identity flags + issue tokens.
    user.emailVerified = true;
    if (req.body.name) {
      user.name = req.body.name;
    } else if (req.body?.firstName || req.body?.lastName) {
      user.name = ((req.body?.firstName || "") + " " + (req.body?.lastName || "")).trim();
    }
    user.status = Constant.STATUS.ACTIVE;
    user.otp = null;
    user.otpExpiry = null;

    const accessToken = generateAccessToken({
      userId: user._id,
      role: [user.role],
      email: user.email || "",
      phone: user.phone,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    user.loginToken = accessToken;
    user.lastLogin = new Date();
    await user.save();

    if (req.body.wishlist) {
      await syncWishlistData(user._id, req.body.wishlist);
    }
    if (req.body.cart) {
      await syncCartData(user._id, req.body.cart);
    }

    res.cookie("customer_refresh", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken,
      user: {
        _id: user._id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || null,
        phoneCountryCode: user.phoneCountryCode || "+91",
        emailVerified: !!user.emailVerified,
        phoneVerified: !!user.phoneVerified,
        role: user.role,
        // Email is already known on this path, so only `name` is outstanding
        // for a first-time signup.
        profileIncomplete: !user.name,
      },
    });
  } catch (error) {
    console.error("verifyEmailOtpLogin error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const resendEmailOtp = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    if (!email) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Email required",
      });
    }
    const user = await User.findOne({ email, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }
    const otp = await issueEmailOtp(user, { purpose: "log in to your account" });
    if (!otp) {
      return res.status(STATUS_CODE.INTERNAL_ERROR).json({
        errorCode: STATUS_CODE.INTERNAL_ERROR,
        message: "Could not send the OTP email. Please try again.",
      });
    }
    const response = {
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.OTP_RESENT,
    };
    if (OTP_TEST_MODE) response.testOtp = otp;
    return res.status(STATUS_CODE.OK).json(response);
  } catch (error) {
    console.error("resendEmailOtp error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

// ----------------------------------------------------------------------------
// Profile mgmt for the authenticated storefront customer.
// PATCH /app/auth/profile     — update name, email (resets emailVerified)
// POST  /app/auth/email/send-otp  — issues an OTP to the stored email
// POST  /app/auth/email/verify    — confirms the OTP, flips emailVerified
// ----------------------------------------------------------------------------

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        errorCode: STATUS_CODE.UNAUTHORIZED,
        message: MESSAGES.COMMON.UNAUTHORIZED,
      });
    }
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Profile retrieved successfully",
      user: {
        _id: user._id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode,
        whatsappNumber: user.whatsappNumber,
        whatsappCountryCode: user.whatsappCountryCode,
        gender: user.gender || "",
        dob: user.dob || null,
        anniversary: user.anniversary || null,
        instagram: user.instagram || "",
        facebook: user.facebook || "",
        occasions: user.occasions || [],
        emailVerified: !!user.emailVerified,
        phoneVerified: !!user.phoneVerified,
        role: user.role,
        addresses: user.addresses || [],
        profileIncomplete:
          !user.name || (!user.email && user.role !== Constant.ROLES.CUSTOMER),
      },
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        errorCode: STATUS_CODE.UNAUTHORIZED,
        message: MESSAGES.COMMON.UNAUTHORIZED,
      });
    }
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const {
      name, email, whatsappNumber, whatsappCountryCode,
      gender, dob, anniversary, instagram, facebook, occasions,
    } = req.body;
    if (typeof name === "string") {
      // Single trimmed assignment (the old code re-assigned the raw value).
      user.name = name.trim();
    }
    if (typeof email === "string") {
      const next = email.trim().toLowerCase();
      // Changing email resets verification — the customer has to
      // confirm the new address before we trust it for receipts.
      if (next !== (user.email || "").toLowerCase()) {
        user.email = next || null;
        user.emailVerified = false;
      }
    }
    if (whatsappNumber !== undefined)
      user.whatsappNumber = whatsappNumber || null;
    if (whatsappCountryCode !== undefined)
      user.whatsappCountryCode = whatsappCountryCode || null;

    // Optional profile extras — "" clears the field.
    if (gender !== undefined) user.gender = gender || null;
    if (dob !== undefined) user.dob = dob || null;
    if (anniversary !== undefined) user.anniversary = anniversary || null;
    if (instagram !== undefined) user.instagram = instagram || null;
    if (facebook !== undefined) user.facebook = facebook || null;
    if (Array.isArray(occasions)) {
      user.occasions = occasions
        .filter((o) => o && (o.recipient || o.type || o.date))
        .map((o) => ({ recipient: o.recipient || "", type: o.type || "", date: o.date || null }));
    }

    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.COMMON.UPDATED,
      user: {
        _id: user._id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode || "+91",
        whatsappNumber: user.whatsappNumber,
        whatsappCountryCode: user.whatsappCountryCode,
        gender: user.gender || "",
        dob: user.dob || null,
        anniversary: user.anniversary || null,
        instagram: user.instagram || "",
        facebook: user.facebook || "",
        occasions: user.occasions || [],
        emailVerified: !!user.emailVerified,
        phoneVerified: !!user.phoneVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

// Unified OTP-request handler for both email and phone verification.
// Body: { type: "email" | "phone", email?, phone?, countryCode? }
// Defaults to "email" when `type` is omitted (backward-compat).
export const requestEmailVerify = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const type = String(req.body?.type).toLowerCase();

    // ── PHONE VERIFICATION ────────────────────────────────────────────────────
    if (type === "phone") {
      // Allow overriding the stored phone (e.g. user is adding a new number).
      const rawPhone = req.body?.phone;
      const targetPhone = rawPhone
        ? Number(normalisePhone(rawPhone))
        : user.phone;
      const targetCountryCode = req.body?.countryCode
        ? normaliseCountryCode(req.body?.countryCode)
        : (user?.phoneCountryCode);

      if (!targetPhone) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Phone number required",
        });
      }

      // Persist new phone (resets verification) before issuing OTP.
      if (targetPhone !== user?.phone) {
        user.phone = targetPhone;
        user.phoneCountryCode = targetCountryCode;
        user.phoneVerified = false;
      }

      // Reuse issuePhoneOtp — persists otp/otpExpiry and dispatches SMS.
      const otp = await issuePhoneOtp(user, { purpose: "verify your phone" });

      const response = {
        errorCode: STATUS_CODE.OK,
        message: "Verification code sent to your phone",
      };
      if (OTP_TEST_MODE) response.testOtp = otp;
      return res.status(STATUS_CODE.OK).json(response);
    }

    // ── EMAIL VERIFICATION (default) ─────────────────────────────────────────
    const targetEmail = (req.body.email || user.email || "")
      .trim()
      .toLowerCase();
    if (!targetEmail) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Email required",
      });
    }
    // Persist the email (resets verification if different) before
    // issuing so the verify step can find the user via JWT only.
    if (targetEmail !== (user.email || "").toLowerCase()) {
      user.email = targetEmail;
      user.emailVerified = false;
    }
    const otp = generateOtpCode();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_VALIDITY_MS;
    await user.save();

    await sendEmail(
      targetEmail,
      "Verify Your Email",
      verifyEmailOtp({ name: user.name, otp })
    );

    const response = {
      errorCode: STATUS_CODE.OK,
      message: "Verification code sent",
    };
    if (OTP_TEST_MODE) response.testOtp = otp;
    return res.status(STATUS_CODE.OK).json(response);
  } catch (error) {
    console.error("requestEmailVerify error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

// Unified OTP-confirm handler for both email and phone verification.
// Body: { type: "email" | "phone", otp }
// Defaults to "email" when `type` is omitted (backward-compat).
export const confirmEmailVerify = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const otp = String(req.body.otp || "").trim();
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }
    const type = String(req.body?.type).toLowerCase();
    // Shared OTP validation — same for both channels.
    if (!user.otp || user.otp !== otp) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_INVALID,
      });
    }
    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_EXPIRED,
      });
    }

    // ── PHONE VERIFICATION ────────────────────────────────────────────────────
    if (type === "phone") {
      if (!user.phone) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Set a phone number before verifying",
        });
      }
      user.phoneVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Phone number verified successfully",
        phoneVerified: true,
      });
    }

    // ── EMAIL VERIFICATION (default) ─────────────────────────────────────────
    if (!user.email) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Set an email before verifying",
      });
    }
    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    // Welcome email once the address is confirmed (non-blocking).
    sendEmail(user.email, `Welcome to Aura Jewels`, welcomeEmail({ name: user.name }))
      .catch((e) => console.error("welcome email failed:", e?.message));
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.EMAIL_VERIFIED,
      emailVerified: true,
    });
  } catch (error) {
    console.error("confirmEmailVerify error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email, isDeleted: 0 });
    if (existing) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_ALREADY_EXISTS,
      });
    }

    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: Constant.ROLES.CUSTOMER,
      otp,
      otpExpiry: Date.now() + OTP_VALIDITY_MS,
      emailVerified: false,
    });

    await sendEmail(
      user.email,
      "Verify Your Email",
      `<h3>Your OTP is: ${otp}</h3>`
    );

    return res.status(STATUS_CODE.CREATED).json({
      errorCode: STATUS_CODE.CREATED,
      message: MESSAGES.AUTH.REGISTERED,
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    if (user.otp !== otp) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_INVALID,
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.OTP_EXPIRED,
      });
    }

    user.emailVerified = true;
    user.status = Constant.STATUS.ACTIVE;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.EMAIL_VERIFIED,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: 0 });

    if (!user || user.role !== Constant.ROLES.CUSTOMER) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    if (!user.emailVerified) {
      const now = Date.now();

      if (user.otpExpiry && user.otpExpiry > now) {
        return res.status(STATUS_CODE.FORBIDDEN).json({
          errorCode: STATUS_CODE.FORBIDDEN,
          emailVerified: false,
          message: MESSAGES.AUTH.OTP_ALREADY_SENT,
        });
      }

      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = Date.now() + OTP_VALIDITY_MS;
      await user.save();

      await sendEmail(
        user.email,
        "Verify Your Email",
        `<h3>Your OTP is: ${otp}</h3>`
      );

      return res.status(STATUS_CODE.FORBIDDEN).json({
        errorCode: STATUS_CODE.FORBIDDEN,
        emailVerified: false,
        message: MESSAGES.AUTH.OTP_NEW_SENT,
      });
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      role: [user.role],
      email: user.email,
    });

    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    user.loginToken = accessToken;
    user.lastLogin = new Date();
    await user.save();

    if (req.body.wishlist) {
      await syncWishlistData(user._id, req.body.wishlist);
    }
    if (req.body.cart) {
      await syncCartData(user._id, req.body.cart);
    }

    res.cookie("customer_refresh", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });

    const userObj = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken,
      user: userObj,
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    if (user.emailVerified) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.EMAIL_ALREADY_VERIFIED,
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_RESEND_VALIDITY_MS;
    await user.save();

    await sendEmail(user.email, "Resend OTP", `<h3>Your OTP is: ${otp}</h3>`);

    return res.status(STATUS_CODE.OK).json({
      otp: OTP_TEST_MODE ? user.otp : null,
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.OTP_RESENT,
    });
  } catch (error) {
    console.error("resendOtp error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.TOKEN_REQUIRED,
      });
    }

    const token = authHeader.split(" ")[1];

    const user = await User.findOne({ loginToken: token, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    user.loginToken = null;
    user.refreshToken = null; // invalidate the refresh token too
    user.lastLogout = new Date();
    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.LOGOUT_SUCCESS,
      token: "",
    });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Accept the refresh token from the request body (the storefront stores it
    // client-side and sends it here — works cross-origin without SameSite/Secure
    // cookie gymnastics) or from the cookie (legacy / same-site clients).
    const token = req.body?.refreshToken || req.cookies?.customer_refresh || req.cookies?.refreshToken;

    if (!token) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.REFRESH_TOKEN_REQUIRED,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.REFRESH_TOKEN_INVALID,
      });
    }

    // Must match the login payload shape — handlers read req.user.userId and a
    // role ARRAY. The old {id, role} minted tokens that failed every guard.
    const accessToken = generateAccessToken({
      userId: user._id,
      role: [user.role],
      email: user.email,
    });
    // Keep loginToken current so /logout (which matches on it) still works
    // after a refresh.
    user.loginToken = accessToken;
    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      accessToken,
    });
  } catch (error) {
    return res.status(STATUS_CODE.BAD_REQUEST).json({
      errorCode: STATUS_CODE.BAD_REQUEST,
      message: MESSAGES.AUTH.TOKEN_INVALID,
    });
  }
};

export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_VALIDITY_MS;
    user.isForgotPassword = true;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/password-reset?token=${token}`;
    const html = resetPasswordTemplate({ name: user.name, resetLink });
    await sendEmail(user.email, "Reset Password", html);

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.RESET_LINK_SENT,
    });
  } catch (error) {
    console.error("adminForgotPassword error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const adminResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.AUTH.TOKEN_INVALID,
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.isForgotPassword = false;
    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    console.error("adminResetPassword error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const customerForgotPassword = async (req, res) => {
  try {
    await processCustomerForgotPassword(req.body);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.RESET_LINK_SENT,
    });
  } catch (error) {
    console.error("customerForgotPassword error:", error);
    const statusCode =
      error.message.includes("not found") || error.message.includes("suspended")
        ? STATUS_CODE.BAD_REQUEST
        : STATUS_CODE.INTERNAL_ERROR;

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const customerVerifyResetPasswordToken = async (req, res) => {
  try {
    await processCustomerVerifyResetPasswordToken(req.body);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Token verified successfully",
    });
  } catch (error) {
    console.error("customerVerifyResetPasswordToken error:", error);
    const statusCode =
      error.message.includes("expired") || error.message.includes("invalid") || error.message.includes("token")
        ? STATUS_CODE.BAD_REQUEST
        : STATUS_CODE.INTERNAL_ERROR;

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const customerResetPassword = async (req, res) => {
  try {
    await processCustomerResetPassword(req.body);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    console.error("customerResetPassword error:", error);
    const statusCode =
      error.message.includes("expired") || error.message.includes("invalid") || error.message.includes("token")
        ? STATUS_CODE.BAD_REQUEST
        : STATUS_CODE.INTERNAL_ERROR;

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const customerRegister = async (req, res) => {
  try {
    const { country } = req.body;
    let result;
    console.log("body", req.body)
    if (!req.body.captcha) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Captcha is required",
      });
    }
    await verifyCaptcha(req?.body?.captcha);
    if (country.toLowerCase() === "india") {
      result = await processIndianRegistration(req.body);
    } else {
      result = await processGlobalRegistration(req.body);
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: result.message,
      ...(OTP_TEST_MODE && result.otp && { otp: result.otp }), // QA-only, gated by OTP_TEST_MODE
    });
  } catch (error) {
    console.error("customerRegister error:", error);

    const statusCode =
      error.message.includes("exists") || error.message.includes("suspended")
        ? STATUS_CODE.BAD_REQUEST
        : STATUS_CODE.INTERNAL_ERROR;

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const customerLogin = async (req, res) => {
  try {
    const { country } = req.body;
    let result;

    if (country.toLowerCase() === "india") {
      result = await processIndianLogin(req.body);
    } else {
      result = await processGlobalLogin(req.body);
    }

    if (result.user?._id && req.body.wishlist) {
      await syncWishlistData(result.user._id, req.body.wishlist);
    }
    if (result.user?._id && req.body.cart) {
      await syncCartData(result.user._id, req.body.cart);
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: result.message,
      ...(result.user && { user: result.user }),
      ...(result.accessToken && { accessToken: result.accessToken }),
      ...(result.refreshToken && { refreshToken: result.refreshToken }),
      ...(OTP_TEST_MODE && result.otp && { otp: result.otp }), // QA-only, gated by OTP_TEST_MODE
    });
  } catch (error) {
    console.error("customerLogin error:", error);
    const statusCode =
      error.message.includes("Invalid credentials") ||
        error.message.includes("Account suspended") ||
        error.message.includes("Account not verified")
        ? STATUS_CODE.BAD_REQUEST
        : STATUS_CODE.INTERNAL_ERROR;

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const verifyCustomerOtp = async (req, res) => {
  try {
    const result = await processVerifyOtp(req.body);

    if (result.user?._id && req.body.wishlist) {
      await syncWishlistData(result.user._id, req.body.wishlist);
    }
    if (result.user?._id && req.body.cart) {
      await syncCartData(result.user._id, req.body.cart);
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: result.message,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error("verifyCustomerOtp error:", error);
    const statusCode =
      error.message.includes("Invalid") ||
        error.message.includes("expired") ||
        error.message.includes("not found")
        ? STATUS_CODE.BAD_REQUEST
        : STATUS_CODE.INTERNAL_ERROR;

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const customerResendOtp = async (req, res) => {
  try {
    const result = await processCustomerResendOtp(req.body);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: result.message,
      ...(OTP_TEST_MODE && result.otp && { otp: result.otp }), // QA-only, gated by OTP_TEST_MODE
    });
  } catch (error) {
    console.error("customerResendOtp error:", error);

    let statusCode = STATUS_CODE.BAD_REQUEST;
    if (error.message.includes("suspended")) {
      statusCode = STATUS_CODE.FORBIDDEN;
    } else if (error.message.includes("not found")) {
      statusCode = STATUS_CODE.NOT_FOUND;
    }

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error.message,
    });
  }
};

export const verifyEmailToken = async (req, res) => {
  try {
    const result = await processVerifyEmailToken(req.body);

    if (result.user?._id && req.body.wishlist) {
      await syncWishlistData(result.user._id, req.body.wishlist);
    }
    if (result.user?._id && req.body.cart) {
      await syncCartData(result.user._id, req.body.cart);
    }

    res.cookie("customer_refresh", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error("verifyEmailToken error:", error);

    let statusCode = STATUS_CODE.BAD_REQUEST;
    if (error.message.includes("suspended")) {
      statusCode = STATUS_CODE.FORBIDDEN;
    } else if (error.message.includes("token")) {
      statusCode = STATUS_CODE.UNAUTHORIZED;
    }

    return res.status(statusCode).json({
      errorCode: statusCode,
      message: error.message,
    });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Addresses retrieved successfully",
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("getAddresses error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const addAddress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      state,
      city,
      pincode,
      address,
      isDefault,
    } = req.body;

    if (!country || !state || !city || !pincode || !address) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Country, state, city, pincode, and address are required.",
      });
    }

    const newAddr = {
      firstName,
      lastName,
      email,
      phone,
      country,
      state,
      city,
      pincode,
      address,
      isDefault: !!isDefault,
    };

    if (isDefault) {
      // Mark all other addresses as false
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    } else if (user.addresses.length === 0) {
      // First address should be default
      newAddr.isDefault = true;
    }

    user.addresses.push(newAddr);
    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("addAddress error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { addressId } = req.params;
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const addrIndex = user.addresses.findIndex(
      (addr) => addr._id?.toString() === addressId
    );
    if (addrIndex === -1) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Address not found",
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      state,
      city,
      pincode,
      address,
      isDefault,
    } = req.body;

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const target = user.addresses[addrIndex];
    if (firstName !== undefined) target.firstName = firstName;
    if (lastName !== undefined) target.lastName = lastName;
    if (email !== undefined) target.email = email;
    if (phone !== undefined) target.phone = phone;
    if (country !== undefined) target.country = country;
    if (state !== undefined) target.state = state;
    if (city !== undefined) target.city = city;
    if (pincode !== undefined) target.pincode = pincode;
    if (address !== undefined) target.address = address;
    if (isDefault !== undefined) target.isDefault = !!isDefault;

    // If the only address is updated to not default, force default
    if (user.addresses.length === 1) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("updateAddress error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { addressId } = req.params;
    const user = await User.findOne({ _id: userId, isDeleted: 0 });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const addrIndex = user.addresses.findIndex(
      (addr) => addr._id?.toString() === addressId
    );
    if (addrIndex === -1) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Address not found",
      });
    }

    const wasDefault = user.addresses[addrIndex].isDefault;
    user.addresses.splice(addrIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("deleteAddress error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};
