import crypto from "crypto";

// Razorpay adapter — talks to the REST API directly (Basic auth with
// keyId:keySecret) so no SDK dependency is needed. All methods are stateless:
// the caller (payment.services dispatcher) passes the DECRYPTED credentials
// loaded from PaymentGatewayConfig. Amounts are rupees in / rupees out; Razorpay
// works in paise so we convert at the boundary.

const API = "https://api.razorpay.com/v1";

const toPaise = (rupees) => Math.round((Number(rupees) || 0) * 100);
const authHeader = (keyId, keySecret) =>
    "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

const call = async (path, { method = "POST", body, keyId, keySecret } = {}) => {
    const res = await fetch(`${API}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: authHeader(keyId, keySecret),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.error?.description || `Razorpay ${path} failed (${res.status})`;
        throw new Error(msg);
    }
    return data;
};

// Create a gateway order to charge `amount` (INR). Returns the razorpay order.
// `payment_capture: 1` forces AUTO-CAPTURE so a successful card/UPI payment is
// actually captured (money taken), not merely authorized-and-auto-released. This
// must not depend on a dashboard toggle — an authorized-but-uncaptured payment
// would let us mark an order PAID while no funds are ever settled.
export const createOrder = async ({ amount, currency = "INR", receipt, notes, keyId, keySecret }) => {
    const order = await call("/orders", {
        keyId, keySecret,
        body: { amount: toPaise(amount), currency, receipt: String(receipt || "").slice(0, 40), payment_capture: 1, notes: notes || {} },
    });
    return { id: order.id, amount: order.amount, currency: order.currency, status: order.status, raw: order };
};

// Verify the checkout callback signature: HMAC_SHA256(order_id|payment_id, key_secret).
export const verifyPaymentSignature = ({ orderId, paymentId, signature, keySecret }) => {
    if (!orderId || !paymentId || !signature) return false;
    const expected = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    // constant-time compare
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Refund a captured payment to its original source. `amount` optional = full.
export const refund = async ({ paymentId, amount, notes, keyId, keySecret }) => {
    const body = { notes: notes || {} };
    if (amount != null) body.amount = toPaise(amount);
    const r = await call(`/payments/${paymentId}/refund`, { keyId, keySecret, body });
    return { id: r.id, amount: r.amount, status: r.status, raw: r };
};

// Create a Razorpay Payment Link (used for custom orders + ad-hoc requests).
export const createPaymentLink = async ({ amount, currency = "INR", description, referenceId, customer, callbackUrl, notes, keyId, keySecret }) => {
    const body = {
        amount: toPaise(amount),
        currency,
        description: description || "Aura Jewels payment",
        reference_id: referenceId ? String(referenceId) : undefined,
        customer: customer || undefined, // { name, email, contact }
        notify: { sms: !!customer?.contact, email: !!customer?.email },
        reminder_enable: true,
        callback_url: callbackUrl || undefined,
        callback_method: callbackUrl ? "get" : undefined,
        notes: notes || {},
    };
    const link = await call("/payment_links", { keyId, keySecret, body });
    return { id: link.id, url: link.short_url, status: link.status, raw: link };
};

// Verify a webhook payload: HMAC_SHA256(rawBody, webhook_secret) == x-razorpay-signature.
export const verifyWebhookSignature = ({ rawBody, signature, webhookSecret }) => {
    if (!signature || !webhookSecret) return false;
    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Reconciliation reads (used by the admin "Re-check payment" action to recover a
// stuck order by asking Razorpay for the truth). All return `amount` in RUPEES.
const fromPaise = (paise) => (Number(paise) || 0) / 100;

// Fetch a single payment's details.
export const fetchPayment = async ({ paymentId, keyId, keySecret }) => {
    if (!paymentId) return null;
    const p = await call(`/payments/${paymentId}`, { method: "GET", keyId, keySecret });
    return {
        id: p.id,
        status: p.status,               // created | authorized | captured | refunded | failed
        method: p.method || "",
        amount: fromPaise(p.amount),
        raw: p,
    };
};

// Every payment attempt against a gateway order. A "captured" item = money taken.
export const fetchOrderPayments = async ({ orderId, keyId, keySecret }) => {
    if (!orderId) return [];
    const data = await call(`/orders/${orderId}/payments`, { method: "GET", keyId, keySecret });
    return (data?.items || []).map((p) => ({
        id: p.id,
        status: p.status,               // created | authorized | captured | refunded | failed
        method: p.method || "",
        amount: fromPaise(p.amount),
        raw: p,
    }));
};

// A payment link's status ("paid" once settled) + the payment that paid it.
export const fetchPaymentLink = async ({ id, keyId, keySecret }) => {
    if (!id) return null;
    const link = await call(`/payment_links/${id}`, { method: "GET", keyId, keySecret });
    const paid = (link?.payments || []).find((p) => p.status === "captured") || null;
    return {
        id: link.id,
        status: link.status,            // created | partially_paid | paid | cancelled | expired
        amountPaid: fromPaise(link.amount_paid),
        paymentId: paid?.payment_id || "",
        method: paid?.method || "",
        raw: link,
    };
};

export default { createOrder, verifyPaymentSignature, refund, createPaymentLink, verifyWebhookSignature, fetchOrderPayments, fetchPaymentLink, fetchPayment };
