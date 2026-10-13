import callApi from "@/lib/commonApi";
import { getToken } from "./clientCookies";
import { ENDPOINTS } from "@/lib/Api_Url";

export const getStores = async (token?: string): Promise<any> => {
    const t = token || getToken();
    // return await callApi(ENDPOINTS.STORE.GET_STORES, 'GET', null, t);
};