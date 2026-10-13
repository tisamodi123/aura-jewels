import express from 'express';
import { getSeoSetting, updateSeoSetting, getPublicSeoSetting } from '../controllers/seoSetting.controller.js';
import { verifyToken } from '../utils/verifyToken.js';
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";

const router = express.Router();

// Public route
router.get('/seo-visibility', getPublicSeoSetting);

// Admin-only routes
router.get('/admin/settings/seo', verifyToken, authorize(Action.SETTINGS_VIEW), getSeoSetting);
router.put('/admin/settings/seo', verifyToken, authorize(Action.SETTINGS_UPDATE), updateSeoSetting);
router.post('/admin/settings/seo', verifyToken, authorize(Action.SETTINGS_UPDATE), updateSeoSetting);

// Alternate paths for direct /setting subroutes
router.get('/seo', verifyToken, authorize(Action.SETTINGS_VIEW), getSeoSetting);
router.put('/seo', verifyToken, authorize(Action.SETTINGS_UPDATE), updateSeoSetting);
router.post('/seo', verifyToken, authorize(Action.SETTINGS_UPDATE), updateSeoSetting);

export default router;
