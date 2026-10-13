import express from 'express';
import { getCurrencyInfo } from '../controllers/setting.controller.js';
import { getSmsConfig, updateSmsConfig } from '../controllers/smsConfig.controller.js';
import { getPaymentGateways, savePaymentGateway } from '../controllers/paymentGateway.controller.js';
import { getOfferPopup, updateOfferPopup } from '../controllers/offerPopup.controller.js';
import { verifyToken } from '../utils/verifyToken.js';
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";

const router = express.Router();

// Public route to get currency info based on IP
router.get('/currency-info', getCurrencyInfo);

// Admin-only SMS gateway configuration (credentials stored encrypted).
router.get('/sms-config', verifyToken, authorize(Action.SETTINGS_VIEW), getSmsConfig);
router.put('/sms-config', verifyToken, authorize(Action.SETTINGS_UPDATE), updateSmsConfig);

// Admin-only payment gateway configuration (key secret + webhook secret stored
// encrypted; only key id is returned in the clear).
router.get('/payment-gateways', verifyToken, authorize(Action.SETTINGS_VIEW), getPaymentGateways);
router.put('/payment-gateway', verifyToken, authorize(Action.SETTINGS_UPDATE), savePaymentGateway);

// Admin-only "Today's Offer" first-visit popup config (image URLs + link).
router.get('/offer-popup', verifyToken, authorize(Action.SETTINGS_VIEW), getOfferPopup);
router.put('/offer-popup', verifyToken, authorize(Action.SETTINGS_UPDATE), updateOfferPopup);

export default router;
