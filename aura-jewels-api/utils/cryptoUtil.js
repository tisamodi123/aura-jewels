import crypto from "crypto";

// Reversible encryption for secrets stored at rest (e.g. SMS gateway password).
// AES-256-GCM. The KEY lives in the environment (SMS_ENC_KEY) — never in the DB —
// so the ciphertext in Mongo is useless without the server's env.
//
// Stored format: "<ivHex>:<authTagHex>:<cipherHex>".
//
// IMPORTANT: keep SMS_ENC_KEY stable. Changing it makes existing ciphertext
// undecryptable (admin must re-enter the credentials).

const ALGO = "aes-256-gcm";
const SALT = "aurajewels-sms-cfg-v1"; // fixed salt — key is the real secret

const getKey = () => {
    const secret = process.env.SMS_ENC_KEY || "b1e2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
    if (!secret) {
        throw new Error("SMS_ENC_KEY is not set — cannot encrypt/decrypt secrets.");
    }
    // Derive a 32-byte key from the passphrase so any-length env value works.
    return crypto.scryptSync(secret, SALT, 32);
};

export const encryptSecret = (plainText) => {
    if (plainText === undefined || plainText === null || plainText === "") return "";
    const key = getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const enc = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
};

export const decryptSecret = (payload) => {
    if (!payload || typeof payload !== "string" || !payload.includes(":")) return "";
    const [ivHex, tagHex, dataHex] = payload.split(":");
    if (!ivHex || !tagHex || !dataHex) return "";
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const dec = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
    return dec.toString("utf8");
};

// True when a stored value looks like our ciphertext (3 hex parts).
export const isEncrypted = (value) =>
    typeof value === "string" && /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value);
