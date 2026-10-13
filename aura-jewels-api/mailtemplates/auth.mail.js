import { MAIL } from "../config/mail.config.js";
import { baseLayout, heading, paragraph, button, otpBlock, panel } from "./layout.mail.js";

const hi = (name) => (name ? `Dear ${name},` : "Hello,");

// Generic OTP (login/register/resend).
export const otpEmail = ({ name, otp, purpose = "verify your account" }) =>
    baseLayout({
        title: `${MAIL.brandName} — Your OTP`,
        preheader: `Your one-time password is ${otp}`,
        bodyHtml:
            heading("Your One-Time Password") +
            paragraph(hi(name)) +
            paragraph(`Use the code below to ${purpose}. It is valid for a few minutes — please do not share it with anyone.`) +
            otpBlock(otp) +
            paragraph(`If you didn't request this, you can safely ignore this email.`),
    });

// Email-address verification OTP.
export const verifyEmailOtp = ({ name, otp }) =>
    baseLayout({
        title: `${MAIL.brandName} — Verify your email`,
        preheader: `Your email verification code is ${otp}`,
        bodyHtml:
            heading("Verify Your Email") +
            paragraph(hi(name)) +
            paragraph("Enter the code below to confirm your email address:") +
            otpBlock(otp) +
            paragraph("This code expires shortly. If you didn't request it, please ignore this email."),
    });

// Email-address verification link.
export const verifyEmailLink = ({ name, verifyLink }) =>
    baseLayout({
        title: `${MAIL.brandName} — Verify your email`,
        preheader: "Verify your email address",
        bodyHtml:
            heading("Verify Your Email") +
            paragraph(hi(name)) +
            paragraph(`Thank you for registering with ${MAIL.brandName}. Please click the button below to verify your email address and activate your account. This link is valid for 15 minutes.`) +
            button("Verify Email", verifyLink) +
            paragraph(`If the button doesn't work, copy this link into your browser:<br/><a href="${verifyLink}" style="color:#8E6C3F;word-break:break-all;">${verifyLink}</a>`) +
            paragraph("If you did not request this, you can safely ignore this email."),
    });

// Welcome (after successful verification / account activation).
export const welcomeEmail = ({ name }) =>
    baseLayout({
        title: `Welcome to ${MAIL.brandName}`,
        preheader: `Welcome to ${MAIL.brandName} — ${MAIL.brandTagline}`,
        bodyHtml:
            heading(`Welcome to ${MAIL.brandName}`) +
            paragraph(hi(name)) +
            paragraph(`We're delighted to have you. Explore our curated collections of fine diamond jewellery, crafted with exquisite care.`) +
            button("Start Exploring", MAIL.storefrontUrl) +
            paragraph(`Any questions? Just reply to this email or write to us at <a href="mailto:${MAIL.supportEmail}" style="color:#8E6C3F;">${MAIL.supportEmail}</a>.`),
    });

// Password reset link (admin/staff).
export const passwordResetEmail = ({ name, resetUrl }) =>
    baseLayout({
        title: `${MAIL.brandName} — Reset your password`,
        preheader: "Reset your password",
        bodyHtml:
            heading("Reset Your Password") +
            paragraph(hi(name)) +
            paragraph("We received a request to reset your password. Click the button below to choose a new one. This link expires soon.") +
            button("Reset Password", resetUrl) +
            paragraph(`If the button doesn't work, copy this link into your browser:<br/><a href="${resetUrl}" style="color:#8E6C3F;word-break:break-all;">${resetUrl}</a>`) +
            paragraph("If you didn't request a reset, you can ignore this email — your password stays unchanged."),
    });

// Password changed confirmation.
export const passwordChangedEmail = ({ name }) =>
    baseLayout({
        title: `${MAIL.brandName} — Password changed`,
        preheader: "Your password was changed",
        bodyHtml:
            heading("Your Password Was Changed") +
            paragraph(hi(name)) +
            panel("This is a confirmation that your account password was just changed.") +
            paragraph(`If this wasn't you, please contact us immediately at <a href="mailto:${MAIL.supportEmail}" style="color:#8E6C3F;">${MAIL.supportEmail}</a>.`),
    });
