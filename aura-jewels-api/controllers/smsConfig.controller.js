import SmsConfig from "../models/smsConfig.model.js";
import { encryptSecret } from "../utils/cryptoUtil.js";
import { clearSmsConfigCache } from "../utils/sendSms.js";

const PASSWORD_MASK = "********";

// Returns the single config doc, creating a default one on first access.
const getOrCreate = async () => {
    let cfg = await SmsConfig.findOne();
    if (!cfg) cfg = await SmsConfig.create({});
    return cfg;
};

// GET /setting/sms-config (admin) — never returns the plaintext password.
export const getSmsConfig = async (req, res) => {
    try {
        const cfg = await getOrCreate();
        return res.status(200).json({
            errorCode: 200,
            data: {
                _id: cfg._id,
                provider: cfg.provider,
                apiUrl: cfg.apiUrl,
                userId: cfg.userId,
                password: cfg.password ? PASSWORD_MASK : "", // masked
                passwordSet: !!cfg.password,
                senderId: cfg.senderId,
                entityId: cfg.entityId,
                templateId: cfg.templateId,
                messageTemplate: cfg.messageTemplate,
                enabled: cfg.enabled,
                testMode: cfg.testMode,
            },
        });
    } catch (error) {
        return res.status(500).json({ errorCode: 500, message: error.message });
    }
};

// PUT /setting/sms-config (admin) — upsert. Password is only re-encrypted when a
// new value is supplied (empty or the mask means "keep existing").
export const updateSmsConfig = async (req, res) => {
    try {
        const cfg = await getOrCreate();
        const b = req.body || {};

        const assign = (key) => {
            if (b[key] !== undefined) cfg[key] = b[key];
        };
        ["provider", "apiUrl", "userId", "senderId", "entityId", "templateId", "messageTemplate"].forEach(assign);
        if (b.enabled !== undefined) cfg.enabled = b.enabled === true || b.enabled === "true";
        if (b.testMode !== undefined) cfg.testMode = b.testMode === true || b.testMode === "true";

        // Only re-encrypt when the admin actually typed a new password.
        if (b.password !== undefined && b.password !== "" && b.password !== PASSWORD_MASK) {
            cfg.password = encryptSecret(b.password);
        }

        await cfg.save();
        clearSmsConfigCache();

        return res.status(200).json({ errorCode: 200, message: "SMS configuration updated" });
    } catch (error) {
        return res.status(500).json({ errorCode: 500, message: error.message });
    }
};
