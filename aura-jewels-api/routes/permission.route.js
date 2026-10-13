import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { getPermissionConfig, saveRolePermission } from "../controllers/permission.controller.js";

const route = express.Router();

// Only roles granted PERMISSION_VIEW / PERMISSION_UPDATE (Super Admin by
// default) can see / edit the RBAC matrix.
route.get("/config", [verifyToken, authorize(Action.PERMISSION_VIEW)], getPermissionConfig);
route.put("/role", [verifyToken, authorize(Action.PERMISSION_UPDATE)], saveRolePermission);

export default route;
