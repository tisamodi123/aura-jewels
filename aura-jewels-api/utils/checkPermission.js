import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { role_has_permission } from "../services/permission.services.js";

// RBAC middleware. `action` is a permission string (see permissionAction
// constants). Access is granted if ANY of the user's roles holds it. Super
// Admin bypasses every check (handled inside role_has_permission). Permissions
// are DB-backed and editable from the admin "Roles & Permissions" screen.
export const authorize = (action) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(STATUS_CODE.UNAUTHORIZED).json({
                    errorCode: STATUS_CODE.UNAUTHORIZED,
                    message: MESSAGES.COMMON.UNAUTHORIZED,
                });
            }
`   `
            // Tokens may carry a single role string or an array — normalise.
            const rawRole = req.user.role;
            const userRoles = (Array.isArray(rawRole) ? rawRole : [rawRole]).filter(Boolean);

            for (const role of userRoles) {
                // eslint-disable-next-line no-await-in-loop
                if (await role_has_permission(role, action)) return next();
            }

            return res.status(STATUS_CODE.FORBIDDEN).json({
                errorCode: STATUS_CODE.FORBIDDEN,
                message: MESSAGES.COMMON.FORBIDDEN,
            });
        } catch (err) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
            });
        }
    };
};
