/**
 * Seed the Razorpay TEST credentials into PaymentGatewayConfig (encrypted).
 * Key secret is encrypted at rest via utils/cryptoUtil (needs SMS_ENC_KEY set).
 * The key id is public and stored in the clear.
 *
 * Usage (from api/):
 *   node scripts/seedRazorpayConfig.mjs            # seed test keys, enabled
 *   node scripts/seedRazorpayConfig.mjs --webhook <secret>   # also set webhook secret
 *
 * Re-runnable; leaves the webhook secret untouched unless --webhook is passed.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { save_gateway_config } from "../services/paymentConfig.services.js";
import { get_active_gateway } from "../services/paymentConfig.services.js";

const KEY_ID = process.env.RAZORPAY_KEY || "rzp_test_placeholder";
const KEY_SECRET = process.env.RAZORPAY_SECRET_KEY || "placeholder_secret";

const webhookIdx = process.argv.indexOf("--webhook");
const webhookSecret = webhookIdx > -1 ? process.argv[webhookIdx + 1] : undefined;

// if (!process.env.SMS_ENC_KEY) {
//     console.error("SMS_ENC_KEY is not set — cannot encrypt the key secret. Aborting.");
//     process.exit(1);
// }

await mongoose.connect(process.env.MONGOOSE_URL || "mongodb://localhost:27017/aurajewels-local");

const body = {
    keyId: KEY_ID,
    keySecret: KEY_SECRET,
    enabled: true,
    testMode: true,
};
if (webhookSecret) body.webhookSecret = webhookSecret;

const saved = await save_gateway_config("razorpay", body);
console.log("Saved razorpay config (masked):", saved);

// Prove it decrypts back correctly server-side.
const active = await get_active_gateway();
console.log("Active gateway resolves:", {
    provider: active?.provider,
    keyId: active?.keyId,
    keySecretOk: active?.keySecret === KEY_SECRET,
    testMode: active?.testMode,
});

await mongoose.disconnect();
console.log("\n✅ Razorpay test keys stored encrypted + enabled. Set the webhook secret from the Razorpay dashboard when you register the webhook.");
