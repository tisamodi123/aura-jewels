import User from "../models/user.model.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

/**
 * Middleware factory to restrict access to Indian customers only.
 * Checks phoneCountryCode on the User model. If not '+91' or '91', returns 403 Forbidden.
 */
export const restrictNonIndianCustomer = (message) => async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            const shippingCountry = req.body?.shippingAddress?.country;
            if (shippingCountry) {
                const isIndian = ["india", "in"].includes(String(shippingCountry).trim().toLowerCase());
                if (!isIndian) {
                    return res.status(STATUS_CODE.FORBIDDEN).json({
                        errorCode: STATUS_CODE.FORBIDDEN,
                        message: message || "This service is currently restricted to Indian customers."
                    });
                }
            }
            return next();
        }

        const user = await User.findById(userId).select("userCountryOrigin phoneCountryCode countryCode country").lean();
        if (!user) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "User not found."
            });
        }

        const origin = (user.userCountryOrigin || "").trim().toLowerCase();
        let isIndian = false;

        if (origin) {
            isIndian = origin === "in" || origin === "india";
        } else {
            // Fallback to phone country code / country name check
            const rawCode = user.phoneCountryCode || user.countryCode || "+91";
            const countryCode = String(rawCode).trim().replace("+", "");
            isIndian = countryCode === "91" ||
                (user.country && ["india", "in"].includes(String(user.country).trim().toLowerCase()));
        }

        if (!isIndian) {
            return res.status(STATUS_CODE.FORBIDDEN).json({
                errorCode: STATUS_CODE.FORBIDDEN,
                message: message || "This service is currently restricted to Indian customers."
            });
        }

        next();
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || "Internal server error"
        });
    }
};

export default restrictNonIndianCustomer;
