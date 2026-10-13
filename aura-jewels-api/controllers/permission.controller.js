import { get_permission_config, save_role_permissions } from "../services/permission.services.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

// GET /permission/config — modules catalog + each managed role's grants.
export const getPermissionConfig = async (req, res) => {
    try {
        const data = await get_permission_config();
        return res.status(STATUS_CODE.OK).json({ errorCode: STATUS_CODE.OK, message: MESSAGES.COMMON.FETCHED, data });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR });
    }
};

// PUT /permission/role — save a role's granted actions.
export const saveRolePermission = async (req, res) => {
    try {
        const { role, permissions } = req.body || {};
        const data = await save_role_permissions(role, permissions, req.user?.userId);
        return res.status(STATUS_CODE.OK).json({ errorCode: STATUS_CODE.OK, message: "Permissions updated", data });
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({ errorCode: STATUS_CODE.BAD_REQUEST, message: error?.message || "Could not update permissions" });
    }
};
