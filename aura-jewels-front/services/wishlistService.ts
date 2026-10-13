import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";

export const getWishlist = async (token?: string) => {
    return callApi(ENDPOINTS.WISHLIST.GET_WISHLIST, "GET", null, token);
};

export const addToWishlist = async (payload: { jeweleryId: string; origin?: any; color?: any; clarity?: any; sizeId?: string }, token?: string) => {
    return callApi(ENDPOINTS.WISHLIST.ADD_TO_WISHLIST, "POST", payload, token);
};

// `wishlistId` names one line exactly. `jeweleryId` + selection is the fallback
// for callers that never had a row id (e.g. a listing-page heart).
export const removeFromWishlist = async (
    payload: { wishlistId?: string; jeweleryId?: string; origin?: any; color?: any; clarity?: any; sizeId?: string },
    token?: string
) => {
    return callApi(ENDPOINTS.WISHLIST.REMOVE_FROM_WISHLIST, "POST", payload, token);
};

export const moveToCart = async (payload: { wishlistId: string }, token?: string) => {
    return callApi(ENDPOINTS.WISHLIST.MOVE_TO_CART, "POST", payload, token);
};
