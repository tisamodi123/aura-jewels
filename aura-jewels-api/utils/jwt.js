import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
    try {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            {
                // Short-lived access token; the client silently refreshes it via
                // the 7-day refresh token on a 401/expiry. Overridable via env.
                expiresIn: process.env.ACCESS_TOKEN_TTL || "1h"
            }
        );
    } catch (error) {
        throw new Error("Error generating access token");
    }
};

export const generateRefreshToken = (payload) => {
    try {
        return jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );
    } catch (error) {
        throw new Error("Error generating refresh token");
    }
};