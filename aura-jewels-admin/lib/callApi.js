import Cookies from "js-cookie";
import { toast } from "sonner";
import { PREFIX } from "@/lib/APIUrl";
import { M } from "@/lib/messages";

// The admin access token is short-lived (1h) and there is no refresh flow, so
// once it expires every request comes back 403 "Invalid or expired token".
// Without this, the UI showed generic failures (e.g. "Failed to create") and
// the user stayed on a dead session. Detect that specific case and bounce to
// login. NOTE: matched on the auth messages only — a permission-denied 403
// ("Forbidden") must NOT log the user out.
const EXPIRED_TOKEN_MESSAGES = ["Invalid or expired token", "Token not provided"];

const handleExpiredSession = (result) => {
    if (
        result?.errorCode === 403 &&
        EXPIRED_TOKEN_MESSAGES.includes(result?.message) &&
        typeof window !== "undefined" &&
        !window.location.pathname.endsWith("/login")
    ) {
        Cookies.remove("aura-admin-token", { path: "/" });
        toast.error(M?.auth?.sessionExpired || "Session expired. Please login again.");
        window.location.href = (PREFIX || "") + "/login";
    }
};

export const callApi = async (url, method, data, token, includeCredentials = false) => {
    try {
        const headers = {
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method: method || 'GET',
            headers,
            credentials: includeCredentials ? 'include' : 'same-origin'
        };

        if (data) {
            const isFormData =
                (typeof FormData !== 'undefined' && data instanceof FormData) ||
                (data && data.constructor && data.constructor.name === 'FormData') ||
                (data && data[Symbol.toStringTag] === 'FormData') ||
                (data && typeof data.append === 'function' && typeof data.delete === 'function');

            if (isFormData) {
                options.body = data;
            } else {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(data);
            }
        }

        const response = await fetch(url, options);
        const result = await response.json();
        handleExpiredSession(result);
        return result;
    } catch (error) {
        console.log("API call error:", error);
        return { errorCode: 500, message: error.message };
    }
};

export default callApi;
