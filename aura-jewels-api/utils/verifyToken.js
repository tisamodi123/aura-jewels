import jwt from "jsonwebtoken";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(STATUS_CODE.FORBIDDEN).json({
                errorCode: STATUS_CODE.FORBIDDEN,
                message: MESSAGES.AUTH.TOKEN_REQUIRED
            });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(STATUS_CODE.FORBIDDEN).json({
                    errorCode: STATUS_CODE.FORBIDDEN,
                    message: MESSAGES.AUTH.TOKEN_INVALID
                });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({
            errorCode: STATUS_CODE.UNAUTHORIZED,
            message: MESSAGES.AUTH.TOKEN_INVALID
        });
    }
};

// Attaches req.user when a valid Bearer token is present, but NEVER blocks the
// request: a guest (no token) — or a stale/invalid token — simply proceeds with
// req.user undefined. Use on storefront endpoints that serve public data to
// everyone and extra data to signed-in users (e.g. public vs assignee-only
// coupons). Do NOT use where authentication is mandatory — use verifyToken.
export const optionalAuth = async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch {
            // Invalid/expired token on a public endpoint → treat as a guest.
        }
    }
    next();
};
