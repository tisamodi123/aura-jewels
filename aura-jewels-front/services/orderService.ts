import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";
import { getToken } from "@/services/clientCookies";

export const placeOrder = async (params: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.ORDER.PLACE_ORDER, 'POST', params, t);
};

// Confirm a gateway payment (Razorpay signed callback, or dummy status).
export const verifyPayment = async (orderId: string, paymentDetails: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.ORDER.VERIFY_PAYMENT, 'POST', { orderId, paymentDetails }, t);
};

export const getMyOrders = async (status?: string, token?: string): Promise<any> => {
    let activeStatus = status;
    let activeToken = token;

    // If only one argument is provided and it looks like a token, treat it as token.
    if (status && !token && (status.startsWith('eyJ') || status.length > 50)) {
        activeToken = status;
        activeStatus = undefined;
    }

    const t = activeToken || getToken();
    const body: any = {};
    if (activeStatus && activeStatus !== 'All') {
        body.status = activeStatus;
    }
    return await callApi(ENDPOINTS.ORDER.MY_ORDERS, 'POST', body, t);
};

// Single order by id (detail view / after a retry).
export const getOrderById = async (orderId: string, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.ORDER.ORDER_BY_ID(orderId), 'GET', null, t);
};

// Re-initiate payment for an existing unpaid order. Returns the same shape as
// placeOrder ({ order, paymentDetails }) so the caller can reopen the gateway.
export const retryPayment = async (orderId: string, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.ORDER.RETRY_PAYMENT(orderId), 'POST', null, t);
};

export const cancelOrder = async (orderId: string, payload?: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.ORDER.CANCEL_ORDER(orderId), 'PUT', payload || null, t);
};

export const requestReturn = async (orderId: string, payload: any, token?: string): Promise<any> => {
    const t = token || getToken();
    const body = typeof payload === 'string' ? { reason: payload } : payload;
    return await callApi(ENDPOINTS.ORDER.RETURN_ORDER(orderId), 'PUT', body, t);
};

export const cancelOrderItem = async (itemId: string, payload?: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.ORDER.CANCEL_ORDER_ITEM(itemId), 'PUT', payload || null, t);
};

export const requestReturnItem = async (itemId: string, payload: any, token?: string): Promise<any> => {
    const t = token || getToken();
    const body = typeof payload === 'string' ? { reason: payload } : payload;
    return await callApi(ENDPOINTS.ORDER.RETURN_ORDER_ITEM(itemId), 'PUT', body, t);
};

export const deleteOrder = async (orderId: string, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.ORDER.ORDER_DELETE(orderId), 'GET', null, t);
};


