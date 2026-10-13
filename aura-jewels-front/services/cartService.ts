import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";
import { getToken } from "@/services/clientCookies";

export const getCartList = async (token?: string) => {
    const t = token || getToken();
    return callApi(ENDPOINTS.CART.GET_CART_LIST, "GET", null, t);
};

export const addToCart = async (payload: any, token?: string) => {
    const t = token || getToken();
    return callApi(ENDPOINTS.CART.ADD_TO_CART, "POST", payload, t);
};

export const removeCartItem = async (payload: any, token?: string) => {
    const t = token || getToken();
    return callApi(ENDPOINTS.CART.REMOVE_CART_ITEM, "POST", payload, t);
};

export const moveToWishlist = async (payload: any, token?: string) => {
    const t = token || getToken();
    return callApi(ENDPOINTS.CART.MOVE_TO_WISHLIST, "POST", payload, t);
};

export const getCheckout = async (payload?: any, token?: string) => {
    const t = token || getToken();
    return callApi(ENDPOINTS.CART.GET_CHECKOUT, "GET", payload, t);
};

// Update ring size, quantity or engraving for a cart item already in the cart
export const updateCartItem = async (payload: { cartId?: string; id?: string; sizeId?: string; qty?: number; engraving?: number; engravingText?: string }, token?: string) => {
    const t = token || getToken();
    let response = await callApi(ENDPOINTS.CART.UPDATE_CART_ITEM, "POST", payload, t);
    if (!response || (response.errorCode !== 200 && response.status !== 200 && response.statusCode !== 200)) {
        response = await callApi(ENDPOINTS.CART.UPDATE_CART, "PUT", payload, t);
    }
    return response;
};

// Fetch applicable coupons for the user's cart
export const getApplicableCoupons = async (token?: string) => {
    const t = token || getToken();
    return callApi(ENDPOINTS.COUPON.GET_APPLICABLE_COUPONS, "GET", null, t);
};
