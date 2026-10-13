import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";
import { getToken } from "@/services/clientCookies";

export const getMyCustomOrders = async (params?: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.CUSTOM_ORDER.MY_CUSTOM_ORDERS, 'POST', params, t);
};

export const getMyQuotations = async (customOrderId: string, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.CUSTOM_ORDER.MY_QUOTATIONS(customOrderId), 'GET', null, t);
};

export const updateQuotationStatus = async (formData: FormData, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.CUSTOM_ORDER.UPDATE_QUOTATION_STATUS, 'POST', formData, t);
};

export const cancelCustomOrder = async (id: string, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.CUSTOM_ORDER.CANCEL_CUSTOM_ORDER(id), 'GET', null, t);
};

export const returnCustomOrder = async (id: string, payload: any, token?: string): Promise<any> => {
    const t = token || getToken();
    const body = typeof payload === 'string' ? { reason: payload } : payload;
    return await callApi(ENDPOINTS.CUSTOM_ORDER.RETURN_CUSTOM_ORDER(id), 'POST', body, t);
};

