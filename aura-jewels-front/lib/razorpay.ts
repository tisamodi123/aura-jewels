// Loads Razorpay Checkout.js once and resolves when ready. The SDK attaches
// `window.Razorpay`. No key is embedded here — the key id + gateway order id
// come from the server's placeOrder response.

declare global {
    interface Window {
        Razorpay?: any;
    }
}

const SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve(false);
        if (window.Razorpay) return resolve(true);
        const existing = document.querySelector(`script[src="${SRC}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => resolve(false));
            return;
        }
        const s = document.createElement('script');
        s.src = SRC;
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

// Poll the customer's orders until THIS order flips to paid (server webhook
// confirmed the capture) or the attempts are exhausted. Returns true if paid.
export const pollOrderPaid = async (orderId: string, token?: string, tries = 6, delayMs = 2500): Promise<boolean> => {
    // Lazy import to avoid a hard dependency cycle at module load.
    const { getMyOrders } = await import('@/services/orderService');
    for (let i = 0; i < tries; i++) {
        await new Promise((r) => setTimeout(r, delayMs));
        try {
            const res: any = await getMyOrders(token);
            const list: any[] = res?.data || res?.orders || [];
            const ord = Array.isArray(list) ? list.find((o: any) => String(o._id) === String(orderId)) : null;
            if (ord?.paymentStatus === 'paid') return true;
            if (ord?.paymentStatus === 'failed') return false;
        } catch { /* transient — keep polling */ }
    }
    return false;
};

export type RazorpayOutcome = 'paid' | 'unconfirmed' | 'dismissed' | 'failed';

// Opens the Razorpay modal for a placed order's paymentDetails and resolves the
// outcome. The webhook is authoritative: an inconclusive client verify falls back
// to polling before reporting 'unconfirmed' (never a false failure).
export const openRazorpayForOrder = async ({ order, paymentDetails, prefill, token }: {
    order: any;
    paymentDetails: any;
    prefill?: { name?: string; email?: string; contact?: string };
    token?: string;
}): Promise<RazorpayOutcome> => {
    const loaded = await loadRazorpayScript();
    if (!loaded || typeof window === 'undefined' || !window.Razorpay) return 'failed';
    const { verifyPayment } = await import('@/services/orderService');

    return new Promise<RazorpayOutcome>((resolve) => {
        const rzp = new window.Razorpay({
            key: paymentDetails.keyId,
            order_id: paymentDetails.gatewayOrderId,
            amount: paymentDetails.amountPaise,
            currency: paymentDetails.currency || 'INR',
            name: 'Aura Jewels',
            description: `Order ${order?.orderId || ''}`.trim(),
            prefill: prefill || {},
            theme: { color: '#A96D56' },
            handler: async (resp: any) => {
                try {
                    const vr: any = await verifyPayment(order._id, {
                        razorpay_order_id: resp.razorpay_order_id,
                        razorpay_payment_id: resp.razorpay_payment_id,
                        razorpay_signature: resp.razorpay_signature,
                    }, token);
                    const vok = vr?.errorCode === 200 || vr?.status === 200 || vr?.success;
                    if (vok && vr?.data?.paymentStatus === 'paid') { resolve('paid'); return; }
                } catch { /* fall through to poll */ }
                const paid = await pollOrderPaid(order._id, token);
                resolve(paid ? 'paid' : 'unconfirmed');
            },
            modal: { ondismiss: () => resolve('dismissed') },
        });
        rzp.open();
    });
};

export {};
