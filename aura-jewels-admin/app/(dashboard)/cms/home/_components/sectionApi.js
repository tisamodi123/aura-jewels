import { API_URL } from "@/lib/APIUrl";
import { STATUS_CODE } from "@/lib/Constant";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";

export const fetchSection = async (key) => {
    const token = getToken();
    const result = await callApi(`${API_URL.GET_HOME_SECTION}${key}`, "GET", null, token);
    if (result?.errorCode === STATUS_CODE.OK) return result.data;
    throw new Error(result?.message || "Failed to fetch section");
};

export const fetchSectionList = async () => {
    const token = getToken();
    const result = await callApi(API_URL.HOME_SECTION_LIST, "GET", null, token);
    console.log("CMS RESPONSE===========>", result)
    if (result?.errorCode === STATUS_CODE.OK) {
        return Array.isArray(result.data) ? result.data : [];
    }
    throw new Error(result?.message || "Failed to fetch sections");
};

export const saveSection = async (key, body) => {
    const token = getToken();
    const result = await callApi(`${API_URL.UPDATE_HOME_SECTION}${key}`, "PUT", body, token);
    if (result?.errorCode === STATUS_CODE.OK) return result.data;
    throw new Error(result?.message || "Failed to save section");
};
