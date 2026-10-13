import callApi from "@/lib/commonApi";
import { ENDPOINTS, API_BASE_URL } from "@/lib/Api_Url";
import { STATUS_CODE } from "@/lib/constants";
import { toast } from "sonner";
import M from "@/lib/messages";

export const getProductDetails = async (id: string, ringsize?: string, color?: string, clarity?: string, origin?: string) => {
    let url = ENDPOINTS.PRODUCT.GET_PRODUCT_DETAILS(id);
    const params = new URLSearchParams();
    if (ringsize) params.append("ringsize", ringsize);
    if (color) params.append("color", color);
    if (clarity) params.append("clarity", clarity);
    if (origin) params.append("origin", origin);
    const queryString = params.toString();
    if (queryString) {
        url += `?${queryString}`;
    }
    return callApi(url, "GET");
};

export const getAllProducts = async (payload: any, serverHeaders?: Record<string, string>) => {
    console.log("getAllProducts payload:", payload);
    const response = await callApi(ENDPOINTS.PRODUCT.GET_ALL_LIST, "POST", payload, undefined, false, serverHeaders);
    console.log("getAllProducts response:", response);
    return response;
};

export const getDiamonds = async (payload: any, serverHeaders?: Record<string, string>) => {
    console.log("getDiamonds payload:", payload);
    const response = await callApi(ENDPOINTS.PRODUCT.GET_DIAMONDS, "POST", payload, undefined, false, serverHeaders);
    console.log("getDiamonds response:", response);
    return response;
};

export const getDiamondDetails = async (id: string) => {
    try {
        const res = await callApi(ENDPOINTS.PRODUCT.GET_DIAMONDS, "POST", { search: id, limit: 10 });
        if (res?.errorCode === 200 || res?.status === 200 || res?.success || res?.data) {
            const list = res?.data || res?.diamonds || res?.result || [];
            if (Array.isArray(list) && list.length > 0) {
                const found = list.find((d: any) => 
                    String(d._id) === String(id) || 
                    String(d.stockId) === String(id) || 
                    String(d.certNo) === String(id)
                );
                if (found) return { success: true, data: found };
                return { success: true, data: list[0] };
            }
        }
    } catch (err) {
        console.error("Error in getDiamondDetails via getDiamonds API:", err);
    }
    return { success: false, data: null };
};

let cachedSettings: any = null;
let settingsPromise: Promise<any> | null = null;

export const getAllSettings = async (): Promise<any> => {
    if (cachedSettings) {
        return { data: cachedSettings, status: STATUS_CODE.OK };
    }
    if (settingsPromise) {
        return settingsPromise;
    }

    settingsPromise = (async () => {
        try {
            const endpoints = [
                { name: 'category', url: ENDPOINTS.PRODUCT.GET_CATEGORY },
                // { name: 'metalType', url: API_URL.products.getMetalTypes },
                // { name: 'metalStamp', url: API_URL.products.getMetalStamps },
                { name: 'metals', url: ENDPOINTS.PRODUCT.GET_METALS },
                { name: 'collection', url: ENDPOINTS.PRODUCT.GET_COLLECTIONS },
                { name: 'tags', url: ENDPOINTS.PRODUCT.GET_TAGS },
                { name: 'shapes', url: ENDPOINTS.PRODUCT.GET_SHAPES },
            ];

            const results = await Promise.all(
                endpoints.map(async (e) => {
                    const res = await callApi(e.url, 'GET');
                    if (res?.errorCode === STATUS_CODE.OK || res?.status === STATUS_CODE.OK || res?.success === true) {
                        return { name: e.name, data: res?.data || [] };
                    }
                    if (typeof window !== 'undefined') {
                        toast.error(M.common.somethingWentWrong);
                    }
                    return { name: e.name, data: [] };
                })
            );

            const settings: any = {};
            results.forEach(res => {
                settings[res.name] = res.data;
            });
            cachedSettings = settings;
            return { data: settings, status: STATUS_CODE.OK };
        } catch (error) {
            console.error("Error in getAllSettings:", error);
            return { data: { category: [], metals: [], collection: [], tags: [], shapes: [] }, status: STATUS_CODE.INTERNAL_ERROR };
        } finally {
            settingsPromise = null;
        }
    })();

    return settingsPromise;
};

export const customOrderService = async (): Promise<any> => {
    try {
        const endpoints = [
            { name: 'category', url: ENDPOINTS.PRODUCT.GET_CATEGORY },
            // { name: 'metalType', url: API_URL.products.getMetalTypes },
            // { name: 'metalStamp', url: API_URL.products.getMetalStamps },
            { name: 'metals', url: ENDPOINTS.PRODUCT.GET_METALS },
            { name: 'ringSizes', url: ENDPOINTS.PRODUCT.GET_RINGSIZE },
            // { name: 'collection', url: ENDPOINTS.PRODUCT.GET_COLLECTIONS },
            // { name: 'tags', url: ENDPOINTS.PRODUCT.GET_TAGS },
            // { name: 'shapes', url: ENDPOINTS.PRODUCT.GET_SHAPES },
        ];

        const results = await Promise.all(
            endpoints.map(async (e) => {
                const res = await callApi(e.url, 'GET');
                if (res?.errorCode === STATUS_CODE.OK || res?.status === STATUS_CODE.OK || res?.success === true) {
                    return { name: e.name, data: res?.data || [] };
                }
                if (typeof window !== 'undefined') {
                    toast.error(M.common.somethingWentWrong);
                }
                return { name: e.name, data: [] };
            })
        );

        const settings: any = {};
        results.forEach(res => {
            settings[res.name] = res.data;
        });

        return { data: settings, status: STATUS_CODE.OK };
    } catch (error) {
        console.log("Error in getAllSettings:", error);
        return { data: { category: [], metalType: [], metalStamp: [], collection: [], tags: [] }, status: STATUS_CODE.INTERNAL_ERROR };
    }
}

export const getCategories = async () => {
    return callApi(ENDPOINTS.PRODUCT.GET_CATEGORY, "GET");
};

export const getMetals = async () => {
    return callApi(ENDPOINTS.PRODUCT.GET_METALS, "GET");
};

export const getCollections = async () => {
    return callApi(ENDPOINTS.PRODUCT.GET_COLLECTIONS, "GET");
};

export const getTags = async () => {
    return callApi(ENDPOINTS.PRODUCT.GET_TAGS, "GET");
};

export const getShapes = async () => {
    return callApi(ENDPOINTS.PRODUCT.GET_SHAPES, "GET");
};

export const getRecommendations = async (id: string) => {
    return callApi(ENDPOINTS.PRODUCT.GET_RECOMMENDATIONS(id), "GET");
};

export const getProductsByTags = async (tagIds: string[]) => {
    return callApi(ENDPOINTS.PRODUCT.GET_PRODUCTS_BY_TAGS, "POST", { tagIds });
};

export const createCustomOrder = async (formData: FormData): Promise<any> => {
    return callApi(ENDPOINTS.CUSTOM_ORDER.CREATE_CUSTOM_ORDER, 'POST', formData);
};
