import * as staffService from "../services/staff.services.js";
import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { get_permissions_for_role } from "../services/permission.services.js";

// GET /staff/me — the logged-in staff member's profile + resolved permissions,
// so the admin UI can show the real name/role and gate menus/actions.
export const getMyProfile = async (req, res) => {
    try {
        const staff = await staffService.getStaffDetail(req.user.userId);
        const roleRaw = staff?.role || req.user.role;
        const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;
        const permissions = await get_permissions_for_role(role);
        const base = staff?.toObject ? staff.toObject() : (staff || {});
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data: {
                _id: base._id,
                // The user/staff model stores a single `name` field (no
                // firstName/lastName) — return it so the admin header/settings
                // show the real logged-in name instead of "N/A".
                name: base.name || "",
                email: base.email || "",
                phone: base.phone || "",
                role,
                isSuperAdmin: String(role).toLowerCase() === Constant.ROLES.SUPER_ADMIN,
                permissions,
            },
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const listStaff = async (req, res) => {
    try {
        const data = await staffService.getStaffList(req.body);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.STAFF.LIST_FETCHED,
            ...data
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getStaffDetail = async (req, res) => {
    try {
        const data = await staffService.getStaffDetail(req.params.id);

        if (!data) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.STAFF.NOT_FOUND
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.STAFF.DETAIL_FETCHED,
            data
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const createStaff = async (req, res) => {
    try {
        const data = await staffService.createStaff(req.body);
        return res.status(STATUS_CODE.CREATED).json({
            errorCode: STATUS_CODE.CREATED,
            message: MESSAGES.STAFF.CREATED,
            data
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateStaff = async (req, res) => {
    try {
        const data = await staffService.updateStaff(req.params.id, req.body);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.STAFF.UPDATED,
            data
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const message = await staffService.deleteStaff(req.params.id);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateStaffStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const data = await staffService.updateStaffStatus(req.params.id, status);
        const message = status === Constant.STATUS.ACTIVE
            ? MESSAGES.STAFF.ACTIVATED
            : MESSAGES.STAFF.SUSPENDED;
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message,
            data
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
