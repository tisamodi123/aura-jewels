import mongoose from "mongoose";

// One document per payment provider (razorpay now, ccavenue later). Editable
// from the admin panel. `keySecret` and `webhookSecret` are stored ENCRYPTED at
// rest (utils/cryptoUtil.js) — the ciphertext in Mongo is useless without the
// server's SMS_ENC_KEY. `keyId` is a public identifier (safe to expose to the
// storefront checkout), so it is NOT encrypted.
//
// `enabled`  — only one provider should be enabled at a time; the payment
//              dispatcher picks the enabled one.
// `testMode` — informational flag; test vs live keys are distinguished by the
//              key values themselves (rzp_test_ vs rzp_live_).

const paymentGatewayConfigSchema = new mongoose.Schema(
    {
        provider: { type: String, enum: ["razorpay", "ccavenue"], required: true, unique: true },
        keyId: { type: String, default: "" },          // public (e.g. rzp_test_xxx / CCAvenue merchant id)
        keySecret: { type: String, default: "" },       // encrypted
        webhookSecret: { type: String, default: "" },    // encrypted
        // CCAvenue-specific (unused for razorpay) — kept generic for later.
        extra: { type: mongoose.Schema.Types.Mixed, default: {} },
        enabled: { type: Boolean, default: false },
        testMode: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("PaymentGatewayConfig", paymentGatewayConfigSchema);
