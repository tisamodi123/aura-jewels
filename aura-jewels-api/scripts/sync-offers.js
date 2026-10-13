import mongoose from "mongoose";
import dotenv from "dotenv";
import { sync_offers_db } from "../services/offer.services.js";

dotenv.config({ path: "./.env" });

async function run() {
    try {
        console.log("[Cron Job] Connecting to database...");
        await mongoose.connect(process.env.MONGOOSE_URL);
        console.log("[Cron Job] Database connected successfully.");

        console.log("[Cron Job] Running offer status and price synchronization...");
        await sync_offers_db();
        console.log("[Cron Job] Offers sync completed successfully!");

    } catch (error) {
        console.error("[Cron Job] Error during offer sync:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("[Cron Job] Database disconnected. Exiting.");
        process.exit(0);
    }
}

run();
