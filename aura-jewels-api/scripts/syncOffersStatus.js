import mongoose from "mongoose";
import Offer from "../models/offer.model.js";
import Constant from "../constants/user.constant.js";

/**
 * Self-invoking function (IIFE) that handles updating Offer statuses based on current date.
 * Transitioning:
 * - Draft/Active -> Expired (when current date > endDate)
 * - Draft -> Active (when current date >= startDate and current date <= endDate)
 * 
 * Can be executed via Task Scheduler.
 */
(async () => {
    // Determine if run directly or imported.
    // If run via CLI, establish DB connection.
    let needsDisconnect = false;
    if (mongoose.connection.readyState === 0) {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/aura_jewels_db";
        console.log(`[Offer Sync] Connecting to DB: ${mongoUri}`);
        await mongoose.connect(mongoUri);
        needsDisconnect = true;
    }

    try {
        const now = new Date();
        console.log(`[Offer Sync] Started sync job at: ${now.toISOString()}`);

        // NOTE: the offer status model is two-state — ACTIVE / INACTIVE only
        // (constants/user.constant.js). There is no DRAFT/EXPIRED. This script
        // previously referenced those non-existent constants, so it wrote
        // `undefined` and did nothing useful. It now uses the real states and
        // matches sync_offers_db's auto-expire/auto-activate logic. Prefer the
        // in-app scheduler / admin "Sync Offers" (which also re-materialises
        // product offerDetails); this CLI is a manual fallback.

        // 1. Expire active offers whose window has passed: ACTIVE -> INACTIVE
        const expiredResult = await Offer.updateMany(
            {
                status: Constant.OFFER_STATUS.ACTIVE,
                endDate: { $lt: now }
            },
            {
                $set: { status: Constant.OFFER_STATUS.INACTIVE }
            }
        );
        console.log(`[Offer Sync] Expired ${expiredResult.modifiedCount} offers.`);

        // 2. Activate offers now inside their window: INACTIVE -> ACTIVE
        const activeResult = await Offer.updateMany(
            {
                status: Constant.OFFER_STATUS.INACTIVE,
                startDate: { $lte: now },
                endDate: { $gte: now },
                isActive: true,
                isDeleted: 0
            },
            {
                $set: { status: Constant.OFFER_STATUS.ACTIVE }
            }
        );
        console.log(`[Offer Sync] Activated ${activeResult.modifiedCount} offers.`);

        console.log("[Offer Sync] Completed sync job successfully.");
    } catch (err) {
        console.error("[Offer Sync] Error during sync job:", err);
    } finally {
        if (needsDisconnect) {
            await mongoose.disconnect();
            console.log("[Offer Sync] Disconnected from DB.");
        }
    }
})();
