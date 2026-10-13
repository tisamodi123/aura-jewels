import mongoose from "mongoose";

// Single-document configuration for the OTP SMS gateway (Nimbus by default).
// Editable from the admin panel. The `password` is stored ENCRYPTED at rest
// (see utils/cryptoUtil.js); every other field is a non-secret identifier.
//
// `enabled`  — master switch; when false the OTP send falls back to the stub.
// `testMode` — when true, the SMS is NOT dispatched (logged only) — use during
//              staging so real messages aren't sent.

const smsConfigSchema = new mongoose.Schema(
    {
        provider: { type: String, default: "nimbus" },
        apiUrl: { type: String, default: "http://nimbusit.biz/api/SmsApi/SendSingleApi" },
        userId: { type: String, default: "" },
        password: { type: String, default: "" }, // encrypted
        senderId: { type: String, default: "" },
        entityId: { type: String, default: "" },
        templateId: { type: String, default: "" },
        // Placeholders {otp} {validTill} {generated} are filled at send time.
        // MUST match the DLT-registered template for the configured TemplateID.
        messageTemplate: {
            type: String,
            default: "{otp} This OTP is for Login to Aura Jewels valid till {validTill}, and generated on {generated} WTMapp",
        },
        enabled: { type: Boolean, default: false },
        testMode: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("SmsConfig", smsConfigSchema);
