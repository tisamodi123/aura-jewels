import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { resetPasswordTemplate } from "../mailtemplates/user.mail.js";
import { passwordChangedEmail } from "../mailtemplates/auth.mail.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateAccessToken } from "../utils/jwt.js";

const RESET_TOKEN_VALIDITY_MS = 15 * 60 * 1000;

export const adminRegister = async function () {
    try {
        const user = await User.findOne({ role: Constant.ROLES.SUPER_ADMIN });
        if (!user) {
            await User.create({
                name: "Aura Jewels Admin",
                phone: process.env.ADMIN_DEFAULT_PHONE || 9966885577,
                email: process.env.ADMIN_DEFAULT_EMAIL || "Aura Jewels@gmail.com",
                password: process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123",
                status: Constant.STATUS.ACTIVE,
                role: Constant.ROLES.SUPER_ADMIN
            });
            console.log("Admin created successfully..!");
        }
    } catch (error) {
        console.error("adminRegister error:", error?.message);
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, isDeleted: 0 });
        if (!user) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.AUTH.INVALID_CREDENTIALS
            });
        }

        if (user.role === Constant.ROLES.CUSTOMER) {
            return res.status(STATUS_CODE.FORBIDDEN).json({
                errorCode: STATUS_CODE.FORBIDDEN,
                message: MESSAGES.AUTH.NOT_ADMIN_USER
            });
        }

        if (user.status !== Constant.STATUS.ACTIVE) {
            return res.status(STATUS_CODE.FORBIDDEN).json({
                errorCode: STATUS_CODE.FORBIDDEN,
                message: MESSAGES.AUTH.ACCOUNT_SUSPENDED
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.AUTH.INVALID_CREDENTIALS
            });
        }

        const accessToken = generateAccessToken({
            userId: user._id,
            role: [user.role],
            email: user.email
        });

        user.lastLogin = new Date();
        await user.save();

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.AUTH.LOGIN_SUCCESS,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessToken
        });
    } catch (error) {
        console.error("adminLogin error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
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
                message: MESSAGES.AUTH.USER_NOT_FOUND
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + RESET_TOKEN_VALIDITY_MS;
        user.isForgotPassword = true;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL_ADMIN}/password-reset?token=${token}`;
        const html = resetPasswordTemplate({ name: user.name, resetLink });
        await sendEmail(user.email, "Reset Password", html);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.AUTH.RESET_LINK_SENT
        });
    } catch (error) {
        console.error("adminForgotPassword error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const adminResetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.AUTH.TOKEN_INVALID
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.isForgotPassword = false;
        await user.save();

        // Confirmation email (non-blocking).
        if (user.email) {
            sendEmail(user.email, "Your password was changed", passwordChangedEmail({ name: user.name }))
                .catch((e) => console.error("password-changed email failed:", e?.message));
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS
        });
    } catch (error) {
        console.error("adminResetPassword error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
