import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";
import { getToken } from "@/services/clientCookies";

export const getProfile = async (token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.PROFILE.GET_PROFILE, 'GET', null, t);
};

export const updateProfile = async (params: any, token?: string): Promise<any> => {
    const t = token || getToken();
    return await callApi(ENDPOINTS.PROFILE.UPDATE_PROFILE, 'PATCH', params, t);
};

// Sends a verification OTP to the given email or phone. Requires auth.
export const requestEmailVerify = async (type: 'email' | 'phone', value: string, countryCode?: string, token?: string): Promise<any> => {
    const t = token || getToken();
    const payload: any = { type };
    if (type === 'email') {
        payload.email = value;
    } else {
        payload.phone = value;
        if (countryCode) {
            payload.countryCode = countryCode;
        }
    }
    return await callApi(ENDPOINTS.PROFILE.EMAIL_SEND_OTP, 'POST', payload, t);
};

// Confirms the verification OTP. Requires auth.
export const confirmEmailVerify = async (type: 'email' | 'phone', value: string, otp: string, countryCode?: string, token?: string): Promise<any> => {
    const t = token || getToken();
    const payload: any = { type, otp };
    if (type === 'email') {
        payload.email = value;
    } else {
        payload.phone = value;
        if (countryCode) {
            payload.countryCode = countryCode;
        }
    }
    return await callApi(ENDPOINTS.PROFILE.EMAIL_VERIFY, 'POST', payload, t);
};

