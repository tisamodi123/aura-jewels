import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { getDashboardData } from "../controllers/dashboard.controller.js";
import { cartList, purgeCartItems, triggerWishlistReminders } from "../controllers/cart.controller.js";
import { wishlist } from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/getDashboardData", verifyToken, authorize(Action.DASHBOARD_VIEW), getDashboardData);
router.post("/cartlist", verifyToken, authorize(Action.DASHBOARD_VIEW), cartList);
router.post("/wishlist", verifyToken, authorize(Action.DASHBOARD_VIEW), wishlist);

// Removes cart rows where the product was deleted or the reference is null.
// Use ?dryRun=true to preview without writing.
router.post("/purge-stale-carts", verifyToken, authorize(Action.DASHBOARD_VIEW), purgeCartItems);
router.post("/trigger-wishlist-reminders", verifyToken, authorize(Action.DASHBOARD_VIEW), triggerWishlistReminders);

export default router;
