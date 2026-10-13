import Constant from "../constants/user.constant.js";
import { get_active_gateway } from "./paymentConfig.services.js";
import razorpay from "./paymentProviders/razorpay.provider.js";

// Provider registry — add ccavenue here later with the same interface.
const PROVIDERS = { razorpay };

const getProvider = (name) => PROVIDERS[name] || null;

/**
 * Initiate a payment session for `amount` (INR) tied to an order.
 * Falls back to a dummy session when no live gateway is configured/enabled, so
 * staging keeps working exactly as before.
 * @returns { provider, keyId, gatewayOrderId, amount, currency, ... }
 */
export const initiatePayment = async (order, amountOverride = null) => {
    const amount = amountOverride != null ? amountOverride : (order.amountDue ?? order.paidAmount ?? order.total);
    const gw = await get_active_gateway();
    const provider = gw && getProvider(gw.provider);

    const currency = order.displayCurrency || "INR";
    const rate = order.exchangeRate && order.exchangeRate > 0 ? order.exchangeRate : 1.0;
    const finalAmount = currency !== "INR" ? parseFloat((amount / rate).toFixed(2)) : amount;

    if (!gw || !provider || !(amount > 0)) {
        // Dummy fallback (no gateway configured, or nothing to charge).
        return {
            paymentGateway: "dummy",
            transactionId: `TXN-DUMMY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            paymentUrl: `${Constant.URL?.FRONTEND || "http://localhost:3000"}/checkout/dummy-payment?orderId=${order._id}&amount=${finalAmount}&currency=${currency}`,
            message: "Dummy payment session initiated",
            isDummy: true,
        };
    }

    try {
        const gwOrder = await provider.createOrder({
            amount: finalAmount,
            currency: currency,
            receipt: order.orderId || String(order._id),
            notes: { orderId: String(order._id), orderNo: order.orderId || "" },
            keyId: gw.keyId,
            keySecret: gw.keySecret,
        });

        return {
            paymentGateway: gw.provider,
            keyId: gw.keyId,           // public — safe for the storefront
            gatewayOrderId: gwOrder.id,
            amount: finalAmount,
            amountPaise: gwOrder.amount,
            currency: gwOrder.currency,
            testMode: gw.testMode,
            isDummy: false,
        };
    } catch (error) {
        console.error(`Payment gateway ${gw.provider} failed:`, error.message);
        // Fallback to dummy if Razorpay authentication fails so checkout isn't blocked
        return {
            paymentGateway: "dummy",
            transactionId: `TXN-DUMMY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            paymentUrl: `${Constant.URL?.FRONTEND || "http://localhost:3000"}/checkout/dummy-payment?orderId=${order._id}&amount=${amount}`,
            message: `Dummy fallback (Gateway error: ${error.message})`,
            isDummy: true,
        };
    }
};

/**
 * Verify a checkout callback for a specific order.
 *
 * The dummy path is chosen ONLY from server state — it is reachable solely when
 * no live gateway is configured/enabled. It is NOT selectable by any client
 * field: trusting a client-supplied `isDummy`/`gateway` would let a caller skip
 * signature verification and mark a real order paid for free.
 *
 * When a gateway IS active, the callback must (a) carry a valid HMAC signature
 * and (b) name the SAME gateway order that was created for THIS order at
 * placement — otherwise a genuine signature from a different (e.g. cheaper)
 * order could be replayed to finalize this one.
 *
 * @param {object} order  the loaded Order document (needs payment.gatewayOrderId)
 */
export const verifyPayment = async (order, paymentDetails = {}) => {
    const gw = await get_active_gateway();
    const provider = gw && getProvider(gw.provider);

    if (!gw || !provider) {
        // No gateway configured — staging fallback. There is no signature to
        // check because no real gateway order exists.
        const isSuccess = paymentDetails?.status === "success";
        return {
            success: isSuccess,
            transactionId: paymentDetails?.transactionId || `TXN-DUMMY-${Date.now()}`,
            message: isSuccess ? "Payment verified (dummy)" : "Payment verification failed (dummy)",
        };
    }

    const callbackOrderId = paymentDetails.razorpay_order_id || paymentDetails.gatewayOrderId || "";
    const expectedOrderId = order?.payment?.gatewayOrderId || "";

    // Bind the callback to this order's own gateway order. Reject if the order
    // has no recorded gateway order, or the callback references a different one.
    if (!expectedOrderId || callbackOrderId !== expectedOrderId) {
        return {
            success: false,
            provider: gw.provider,
            message: "Payment callback does not match this order's gateway order.",
        };
    }

    const ok = provider.verifyPaymentSignature({
        orderId: callbackOrderId,
        paymentId: paymentDetails.razorpay_payment_id || paymentDetails.gatewayPaymentId,
        signature: paymentDetails.razorpay_signature || paymentDetails.signature,
        keySecret: gw.keySecret,
    });
    let fetchedMethod = "";
    let fetchedRaw = null;
    if (ok && provider.fetchPayment) {
        try {
            const pInfo = await provider.fetchPayment({
                paymentId: paymentDetails.razorpay_payment_id || paymentDetails.gatewayPaymentId,
                keyId: gw.keyId,
                keySecret: gw.keySecret,
            });
            fetchedMethod = pInfo?.method || "";
            fetchedRaw = pInfo?.raw || null;
        } catch (e) {
            console.error("verifyPayment: failed to fetch payment info:", e?.message);
        }
    }

    return {
        success: ok,
        provider: gw.provider,
        transactionId: paymentDetails.razorpay_payment_id || paymentDetails.gatewayPaymentId || "",
        gatewayOrderId: callbackOrderId,
        method: fetchedMethod || paymentDetails.method || "",
        rawResponse: fetchedRaw || paymentDetails,
        message: ok ? "Payment signature verified" : "Payment signature verification failed",
    };
};

// Refund a captured gateway payment to its original source.
export const refundPayment = async ({ paymentId, amount, notes }) => {
    const gw = await get_active_gateway();
    const provider = gw && getProvider(gw.provider);
    if (!gw || !provider) throw new Error("No active payment gateway configured for refunds.");
    return provider.refund({ paymentId, amount, notes, keyId: gw.keyId, keySecret: gw.keySecret });
};

// Create a payment link (custom orders + ad-hoc admin requests).
export const createPaymentLink = async ({ amount, description, referenceId, customer, callbackUrl, notes }) => {
    const gw = await get_active_gateway();
    const provider = gw && getProvider(gw.provider);
    if (!gw || !provider) throw new Error("No active payment gateway configured for payment links.");
    return provider.createPaymentLink({ amount, description, referenceId, customer, callbackUrl, notes, keyId: gw.keyId, keySecret: gw.keySecret });
};

// Reconciliation: ask the gateway for the truth about an order/payment link.
// Used by the admin "Re-check payment" action to recover a stuck order.
export const fetchGatewayOrderPayments = async (gatewayOrderId) => {
    const gw = await get_active_gateway();
    const provider = gw && getProvider(gw.provider);
    if (!gw || !provider || !gatewayOrderId) return [];
    return provider.fetchOrderPayments({ orderId: gatewayOrderId, keyId: gw.keyId, keySecret: gw.keySecret });
};

export const fetchGatewayPaymentLink = async (paymentLinkId) => {
    const gw = await get_active_gateway();
    const provider = gw && getProvider(gw.provider);
    if (!gw || !provider || !paymentLinkId) return null;
    return provider.fetchPaymentLink({ id: paymentLinkId, keyId: gw.keyId, keySecret: gw.keySecret });
};

// Verify a raw webhook body against the stored webhook secret.
export const verifyWebhook = async (rawBody, signature) => {
    const gw = await get_active_gateway();
    const provider = gw && getProvider(gw.provider);
    if (!gw || !provider || !gw.webhookSecret) return { ok: false, provider: gw?.provider || null };
    const ok = provider.verifyWebhookSignature({ rawBody, signature, webhookSecret: gw.webhookSecret });
    return { ok, provider: gw.provider };
};
