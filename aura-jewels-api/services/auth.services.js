import User from "../models/user.model.js";
import Constant from "../constants/user.constant.js";
import {
  generateOtpCode,
  sendOtpToPhone,
  normalisePhone,
  normaliseCountryCode,
  OTP_VALIDITY_MS,
} from "./otp.services.js";
import { sendEmail } from "../utils/sendEmail.js";
import { MAIL } from "../config/mail.config.js";
import { otpEmailTemplate, resetPasswordTemplate } from "../mailtemplates/user.mail.js";
import { verifyEmailLink } from "../mailtemplates/auth.mail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const processIndianRegistration = async (payload) => {
  try {
    const phone = normalisePhone(payload.phone);
    const countryCode = normaliseCountryCode(payload.countryCode);

    let user = await User.findOne({
      phone,
      phoneCountryCode: countryCode,
      isDeleted: 0,
    });
    if (user && user.status === Constant.STATUS.ACTIVE) {
      throw new Error(
        "User with this phone number already exists and is active"
      );
    }

    if (!user) {
      user = new User({
        name: payload.name || "Customer",
        phone,
        phoneCountryCode: countryCode,
        whatsappNumber: payload.isWhatsAppSameAsMobile ? phone : null,
        whatsappCountryCode: payload.isWhatsAppSameAsMobile
          ? countryCode
          : null,
        role: Constant.ROLES.CUSTOMER,
        status: Constant.STATUS.PENDING,
        userCountryOrigin: payload.country,
      });
    } else {
      user.name = payload.name || user.name;
      user.userCountryOrigin = payload.country || user.userCountryOrigin;
      if (payload.isWhatsAppSameAsMobile) {
        user.whatsappNumber = phone;
        user.whatsappCountryCode = countryCode;
      }
    }

    const otp = generateOtpCode();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_VALIDITY_MS;
    await user.save();

    await sendOtpToPhone({ countryCode, phone, otp, purpose: "register" });
    return { message: "OTP sent to phone number successfully", otp: otp };
  } catch (error) {
    console.error("Indian Registration error:", error);
    throw error;
  }
};

export const processGlobalRegistration = async (payload) => {
  try {
    let user = await User.findOne({ email: payload.email, isDeleted: 0 });
    if (user) {
      throw new Error("User with this email already exists");
    }

    const phone = normalisePhone(payload.phone) || null;
    let countryCode = null;
    if (phone) {
      // If a phone is provided but no countryCode is passed, we can leave it null or try to map it based on payload.country
      countryCode = payload.countryCode
        ? normaliseCountryCode(payload.countryCode)
        : null;
    }

    const userObj = new User({
      name: payload.name,
      email: payload.email,
      phone,
      phoneCountryCode: countryCode,
      password: payload.password ? payload.password : null,
      role: Constant.ROLES.CUSTOMER,
      status: Constant.STATUS.PENDING,
      userCountryOrigin: payload.country,
    });

    const token = crypto.randomBytes(32).toString("hex");
    userObj.emailVerifyToken = token;
    userObj.emailVerifyTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await userObj.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = verifyEmailLink({ name: payload.name || "Customer", verifyLink });
    await sendEmail(userObj.email, "Verify Your Email", html, { from: MAIL.senders.account });

    return { message: "Verification link sent to email successfully" };
  } catch (error) {
    console.error("Global Registration error:", error);
    throw error;
  }
};

export const processIndianLogin = async (payload) => {
  try {
    const phone = normalisePhone(payload.phone);
    const countryCode = normaliseCountryCode(payload.countryCode);

    const user = await User.findOne({
      phone,
      phoneCountryCode: countryCode,
      isDeleted: 0,
      role: Constant.ROLES.CUSTOMER,
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.status === Constant.STATUS.SUSPENDED) {
      throw new Error("Account suspended");
    }

    const otp = generateOtpCode();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_VALIDITY_MS;
    await user.save();

    await sendOtpToPhone({ countryCode, phone, otp, purpose: "login" });
    return { message: "OTP sent to phone number successfully", otp };
  } catch (error) {
    console.error("Indian Login error:", error);
    throw error;
  }
};

export const processGlobalLogin = async (payload) => {
  try {
    const user = await User.findOne({
      email: payload.email,
      isDeleted: 0,
      role: Constant.ROLES.CUSTOMER,
    });
    if (!user) {
      throw new Error("Account not exist");
    }

    if (user.password === null) {
      throw new Error("Password not set. Please reset password");
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    if (user.status === Constant.STATUS.PENDING) {
      const token = crypto.randomBytes(32).toString("hex");
      user.emailVerifyToken = token;
      user.emailVerifyTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
      await user.save();

      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      const html = verifyEmailLink({ name: user.name || "Customer", verifyLink });
      await sendEmail(user.email, "Verify Your Email", html, { from: MAIL.senders.account });

      throw new Error(
        "Account not verified. A new verification link has been sent to your email."
      );
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      role: [user.role],
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    user.loginToken = accessToken;
    await user.save();

    return {
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Global Login error:", error);
    throw error;
  }
};

export const processVerifyOtp = async (payload) => {
  try {
    const isIndia = payload.country.toLowerCase() === "india";

    let user;
    if (isIndia) {
      const phone = normalisePhone(payload.phone);
      const countryCode = normaliseCountryCode(payload.countryCode);
      user = await User.findOne({
        phone,
        phoneCountryCode: countryCode,
        isDeleted: 0,
        role: Constant.ROLES.CUSTOMER,
      });
    } else {
      user = await User.findOne({
        email: payload.email,
        isDeleted: 0,
        role: Constant.ROLES.CUSTOMER,
      });
    }

    if (!user) {
      throw new Error("User not found");
    }
    if (user.status === Constant.STATUS.SUSPENDED) {
      throw new Error("Account suspended");
    }

    if (!user.otp || user.otp !== payload.otp) {
      throw new Error("Invalid OTP");
    }

    if (user.otpExpiry < Date.now()) {
      throw new Error("OTP expired");
    }

    // OTP matched
    user.otp = null;
    user.otpExpiry = null;
    user.status = Constant.STATUS.ACTIVE;

    if (isIndia) {
      user.phoneVerified = true;
    } else {
      user.emailVerified = true;
    }

    if (payload.firstName || payload.lastName) {
      user.name = ((payload.firstName || "") + " " + (payload.lastName || "")).trim() || user.name;
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      role: [user.role],
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    user.loginToken = accessToken;
    await user.save();

    return {
      message: "OTP verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Verify Otp error:", error);
    throw error;
  }
};

export const processVerifyEmailToken = async (payload) => {
  try {
    console.log("payload", payload);
    const user = await User.findOne({
      emailVerifyToken: payload.token,
      emailVerifyTokenExpiry: { $gt: Date.now() },
      isDeleted: 0,
      role: Constant.ROLES.CUSTOMER,
    });

    console.log("user", user);
    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    if (user.status === Constant.STATUS.SUSPENDED) {
      throw new Error("Account suspended");
    }

    user.emailVerifyToken = null;
    user.emailVerifyTokenExpiry = null;
    user.status = Constant.STATUS.ACTIVE;
    user.emailVerified = true;

    const accessToken = generateAccessToken({
      userId: user._id,
      role: [user.role],
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    user.loginToken = accessToken;
    await user.save();

    return {
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Verify Email Token error:", error);
    throw error;
  }
};

export const processCustomerResendOtp = async (payload) => {
  try {
    const isIndia = payload.country.toLowerCase() === "india";

    let user;
    if (isIndia) {
      const phone = normalisePhone(payload.phone);
      const countryCode = normaliseCountryCode(payload.countryCode);
      user = await User.findOne({
        phone,
        phoneCountryCode: countryCode,
        isDeleted: 0,
        role: Constant.ROLES.CUSTOMER,
      });
    } else {
      user = await User.findOne({
        email: payload.email,
        isDeleted: 0,
        role: Constant.ROLES.CUSTOMER,
      });
    }

    if (!user) {
      throw new Error("User not found");
    }
    if (user.status === Constant.STATUS.SUSPENDED) {
      throw new Error("Account suspended");
    }

    // Server-side resend throttle (30s) — the client timer is not enough to
    // stop scripted OTP flooding / SMS-cost abuse. Last-issued time is derived
    // from otpExpiry (issuedAt = otpExpiry - validity window).
    if (user.otpExpiry) {
      const lastIssuedAt = new Date(user.otpExpiry).getTime() - OTP_VALIDITY_MS;
      if (Date.now() - lastIssuedAt < 30 * 1000) {
        throw new Error("Please wait 30 seconds before requesting another OTP");
      }
    }

    const otp = generateOtpCode();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_VALIDITY_MS;
    await user.save();

    if (isIndia) {
      const phone = normalisePhone(payload.phone);
      const countryCode = normaliseCountryCode(payload.countryCode);
      await sendOtpToPhone({ countryCode, phone, otp, purpose: "resend" });
      return { message: "OTP resent to phone successfully", otp };
    } else {
      const html = otpEmailTemplate({ name: user.name, otp });
      await sendEmail(user.email, "Resend OTP", html, { from: MAIL.senders.account });
      return { message: "OTP resent to email successfully" };
    }
  } catch (error) {
    console.error("Customer Resend Otp error:", error);
    throw error;
  }
};

export const processCustomerForgotPassword = async (payload) => {
  try {
    const { email } = payload;
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: Constant.ROLES.CUSTOMER,
      isDeleted: 0,
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.status === Constant.STATUS.SUSPENDED) {
      throw new Error("Account suspended");
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    user.isForgotPassword = true;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = resetPasswordTemplate({ name: user.name, resetLink });
    await sendEmail(user.email, "Reset Password", html, { from: MAIL.senders.account });

    return { message: "Reset link sent to email" };
  } catch (error) {
    console.error("processCustomerForgotPassword error:", error);
    throw error;
  }
};

export const processCustomerVerifyResetPasswordToken = async (payload) => {
  try {
    const { token } = payload;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
      role: Constant.ROLES.CUSTOMER,
      isDeleted: 0,
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    return { message: "Token verified successfully" };
  } catch (error) {
    console.error("processCustomerVerifyResetPasswordToken error:", error);
    throw error;
  }
};

export const processCustomerResetPassword = async (payload) => {
  try {
    const { token, newPassword } = payload;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
      role: Constant.ROLES.CUSTOMER,
      isDeleted: 0,
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.isForgotPassword = false;
    await user.save();

    return { message: "Password reset successful" };
  } catch (error) {
    console.error("processCustomerResetPassword error:", error);
    throw error;
  }
};
