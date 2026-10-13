import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";
import { getToken } from "@/services/clientCookies";

export const createInquiry = async (data: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.INQUIRY.CREATE_INQUIRY, 'POST', data, t);
};

export const getMyInquiries = async (params?: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.INQUIRY.MY_INQUIRIES, 'POST', params, t);
};
