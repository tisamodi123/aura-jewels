import PaymentGatewayConfig from "../models/paymentGatewayConfig.model.js";
import { encryptSecret, decryptSecret } from "../utils/cryptoUtil.js";

// Load the single ENABLED gateway with its secrets DECRYPTED — for server-side
// payment operations only. Never send the result to a client.
export const get_active_gateway = async () => {
    const cfg = await PaymentGatewayConfig.findOne({ enabled: true });
    if (!cfg || !cfg.keyId) return null;
    return {
        provider: cfg.provider,
        keyId: cfg.keyId,
        keySecret: decryptSecret(cfg.keySecret),
        webhookSecret: decryptSecret(cfg.webhookSecret),
        testMode: cfg.testMode,
        extra: cfg.extra || {},
    };
};

// Admin read — secrets are MASKED (never returned in plaintext).
export const get_gateway_config_admin = async (provider) => {
    const cfg = await PaymentGatewayConfig.findOne({ provider });
    if (!cfg) return { provider, keyId: "", keySecretSet: false, webhookSecretSet: false, enabled: false, testMode: true };
    return {
        provider: cfg.provider,
        keyId: cfg.keyId || "",
        keySecretSet: !!cfg.keySecret,
        webhookSecretSet: !!cfg.webhookSecret,
        enabled: cfg.enabled,
        testMode: cfg.testMode,
        updatedAt: cfg.updatedAt,
    };
};

export const list_gateway_configs_admin = async () => {
    const all = await PaymentGatewayConfig.find({});
    return all.map((cfg) => ({
        provider: cfg.provider,
        keyId: cfg.keyId || "",
        keySecretSet: !!cfg.keySecret,
        webhookSecretSet: !!cfg.webhookSecret,
        enabled: cfg.enabled,
        testMode: cfg.testMode,
        updatedAt: cfg.updatedAt,
    }));
};

// Admin write. Secrets are encrypted before storing. A blank secret means
// "leave the existing one unchanged" (so the admin never has to re-type it).
// Enabling one provider disables the others (only one active at a time).
export const save_gateway_config = async (provider, body, userId) => {
    const existing = await PaymentGatewayConfig.findOne({ provider });
    const update = {
        provider,
        keyId: body.keyId !== undefined ? String(body.keyId).trim() : existing?.keyId || "",
        enabled: body.enabled !== undefined ? !!body.enabled : existing?.enabled || false,
        testMode: body.testMode !== undefined ? !!body.testMode : existing?.testMode ?? true,
        extra: body.extra !== undefined ? body.extra : existing?.extra || {},
    };
    if (body.keySecret) update.keySecret = encryptSecret(String(body.keySecret).trim());
    else if (existing) update.keySecret = existing.keySecret;
    if (body.webhookSecret) update.webhookSecret = encryptSecret(String(body.webhookSecret).trim());
    else if (existing) update.webhookSecret = existing.webhookSecret;

    const saved = await PaymentGatewayConfig.findOneAndUpdate({ provider }, { $set: update }, { new: true, upsert: true });

    if (update.enabled) {
        await PaymentGatewayConfig.updateMany({ provider: { $ne: provider } }, { $set: { enabled: false } });
    }
    return get_gateway_config_admin(saved.provider);
};
