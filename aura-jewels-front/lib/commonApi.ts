import { useGlobleStore } from "@/store/globleStore";
import { getToken, getRefreshToken, setToken, clearAuth, getWishlistCookie, getCartCookie, setCartCookie, setWishlistCookie, getCookie } from "@/services/clientCookies";
import { ENDPOINTS } from "@/lib/Api_Url";
import { lineKey } from "@/lib/lineIdentity";

// Guest preview and the logged-in cart come out of the SAME server pipeline,
// so a single mapper serves both.
const mapCartItems = (items: any[]) =>
    (items || []).map((item: any) => {
        const jewel = item.jeweleryId || item.jewelleryId || item;
        const isJewelObj = jewel && typeof jewel === 'object';

        const id = isJewelObj
            ? (jewel._id || jewel.id)
            : (item.jewelleryId || item.jeweleryId || item._id);

        const title = (isJewelObj ? (jewel.productTitle || jewel.title || jewel.name) : null) || item.productTitle || item.title || item.name || '';
        const image = (isJewelObj ? (jewel.images?.[0]?.MediaLocation || jewel.image || jewel.default_image) : null) || item.images?.[0]?.MediaLocation || item.image || item.default_image || '';
        const price = item.price || item.totalItemPrice || (isJewelObj ? (jewel.finalPrice || jewel.price || jewel.setting_price || jewel.settingprice) : null) || item.finalPrice || item.setting_price || 0;
        const slug = (isJewelObj ? jewel.slug : null) || item.slug || '';

        return {
            ...item,
            cartId: item._id, // PRESERVE CART DOCUMENT ID
            id: id,
            _id: id,
            jeweleryId: id,
            jewelleryId: id,
            // The SKU is what the guest cookie is keyed on.
            sku: item.itemCode || item.sku || '',
            title,
            name: title,
            image,
            default_image: image,
            price,
            setting_price: price,
            slug,
            // Quantity
            qty: item.qty || 1,
            quantity: item.quantity || item.qty || 1,
            // Ring size data
            hasSize: item.hasSize || false,
            RingSizes: item.RingSizes || [],
            sizeDetails: item.sizeDetails || null,
            sizeId: item.sizeId || null,
            size: item.size || item.sizeDetails?.name || null,
            engraving: item.engraving !== undefined ? item.engraving : (item.engravingText ? 1 : 0),
            engravingText: item.engravingText || item.engraving_text || '',
        };
    });

const getSavedCustomRings = (): any[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('Aura Jewels_custom_rings');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const getSavedDiamondCart = (): any[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('Aura Jewels_diamond_cart');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const getSavedDiamondWishlist = (): any[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('Aura Jewels_diamond_wishlist');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const getSavedCustomWishlist = (): any[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('Aura Jewels_custom_wishlist');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

// Get cart List
export const getCart = async (couponCodeToApply?: string) => {
    try {
        const { setCart } = useGlobleStore.getState();
        const token = getToken();
        const customRings = getSavedCustomRings();
        const diamondCart = getSavedDiamondCart();

        if (token) {
            const couponToUse = couponCodeToApply !== undefined ? couponCodeToApply : (getCookie('coupon_code') || '');
            const url = couponToUse ? `${ENDPOINTS.CART.GET_CART_LIST}?coupon=${couponToUse}` : ENDPOINTS.CART.GET_CART_LIST;
            const response = await callApi(url, "GET", null, token);
            if (response && (response.status === 200 || response.errorCode === 200)) {
                const items = response.data || response.result || response.cart || [];
                setCart([...mapCartItems(items), ...customRings, ...diamondCart]);
                return response;
            }
            if (customRings.length || diamondCart.length) setCart([...customRings, ...diamondCart]);
            return response;
        } else {
            // Guest: the cookie holds SKUs + selections only
            const guest = getCartCookie();
            if (!guest.length && !customRings.length && !diamondCart.length) {
                setCart([]);
                return null;
            }

            const couponToUse = couponCodeToApply !== undefined ? couponCodeToApply : (getCookie('coupon_code') || '');
            const response = await callApi(ENDPOINTS.CART.PREVIEW, "POST", { items: guest, coupon: couponToUse || '' });
            if (response && (response.status === 200 || response.errorCode === 200)) {
                setCart([...mapCartItems(response.data || []), ...customRings, ...diamondCart]);
                pruneGuestCookie(guest, response.removed, setCartCookie, response.adjusted);
                return response;
            } else if (customRings.length || diamondCart.length) {
                setCart([...customRings, ...diamondCart]);
            }

            return response;
        }
    } catch (error) {
        console.log("error -------->", error);
        return null;
    }
};

// Reconcile the guest cookie with what the server actually honoured.
//
//  - `removed`  : the SKU is gone (deleted/deactivated product). Drop the line.
//  - `adjusted` : the line survives, but its centre-stone selection could not be
//                 priced and the server fell back to the product default. Clear
//                 the stale selection so we stop re-sending it on every preview.
const pruneGuestCookie = (
    current: any[],
    removed: any[] | undefined,
    write: (items: any[]) => void,
    adjusted?: any[]
) => {
    const removedArr = Array.isArray(removed) ? removed : [];
    const deadSkus = new Set(removedArr.filter((r: any) => !r?.lineId).map((r: any) => r?.sku).filter(Boolean));
    const deadLines = new Set(removedArr.filter((r: any) => r?.lineId).map((r: any) => r?.lineId));

    const resetLines = new Set(
        (Array.isArray(adjusted) ? adjusted : []).map((r: any) => r?.lineId).filter(Boolean)
    );
    const resetSkus = new Set(
        (Array.isArray(adjusted) ? adjusted : []).filter((r: any) => !r?.lineId).map((r: any) => r?.sku).filter(Boolean)
    );

    if (!deadSkus.size && !deadLines.size && !resetLines.size && !resetSkus.size) return;

    const isDead = (i: any) => deadSkus.has(i.sku) || deadLines.has(lineKey(i));
    const shouldReset = (i: any) => resetLines.has(lineKey(i)) || resetSkus.has(i.sku);

    const next = current
        .filter((i: any) => !isDead(i))
        .map((i: any) => (shouldReset(i) ? { ...i, origin: null, color: null, clarity: null } : i));

    write(next);
};


// Get wishlist List
export const getWishlist = async () => {
    try {
        const { setWishlist } = useGlobleStore.getState();
        const token = getToken();
        const savedDiamonds = getSavedDiamondWishlist();
        const savedCustomRings = getSavedCustomWishlist();
        const extraSavedItems = [...savedCustomRings, ...savedDiamonds];

        if (token) {
            const response = await callApi(ENDPOINTS.WISHLIST.GET_WISHLIST, "GET", null, token);
            if (response && (response.status === 200 || response.errorCode === 200)) {
                const items = response.data || response.result || response.wishlist || [];
                const mappedItems = items.map((item: any) => {
                    const jewel = item.jeweleryId || item.jewelleryId || item;
                    const isJewelObj = jewel && typeof jewel === 'object';

                    const id = isJewelObj
                        ? (jewel._id || jewel.id)
                        : (item.jewelleryId || item.jeweleryId || item._id);

                    const title = (isJewelObj ? (jewel.productTitle || jewel.title || jewel.name) : null) || item.productTitle || item.title || item.name || '';
                    const image = (isJewelObj ? (jewel.images?.[0]?.MediaLocation || jewel.image || jewel.default_image) : null) || item.images?.[0]?.MediaLocation || item.image || item.default_image || '';
                    const price = (isJewelObj ? (jewel.finalPrice || jewel.price || jewel.setting_price || jewel.settingprice) : null) || item.price || item.finalPrice || item.setting_price || 0;
                    const slug = (isJewelObj ? jewel.slug : null) || item.slug || '';

                    return {
                        ...item,
                        wishlistId: item._id,
                        id: id,
                        _id: id,
                        jeweleryId: id,
                        jewelleryId: id,
                        sku: item.itemCode || item.sku || (isJewelObj ? (jewel.itemCode || jewel.sku) : '') || '',
                        title,
                        name: title,
                        image,
                        default_image: image,
                        price,
                        setting_price: price,
                        slug,
                        sizeId: item.sizeId || (typeof item.sizeDetails === 'object' ? item.sizeDetails?._id : item.sizeDetails) || null,
                        size: item.size || item.sizeDetails?.name || null,
                    };
                });
                setWishlist([...mappedItems, ...extraSavedItems]);
            } else {
                setWishlist(extraSavedItems);
            }
        } else {
            // Guest: SKUs only in the cookie — hydrate prices/titles server-side.
            const guest = getWishlistCookie();
            if (!guest.length && !extraSavedItems.length) {
                setWishlist([]);
                return;
            }

            if (!guest.length && extraSavedItems.length) {
                setWishlist(extraSavedItems);
                return;
            }

            const response = await callApi(ENDPOINTS.WISHLIST.PREVIEW, "POST", { items: guest });
            if (response && (response.status === 200 || response.errorCode === 200)) {
                const items = response.data || [];
                const mappedJewelry = items.map((item: any) => {
                    const id = item.jewelleryId || item.jeweleryId || item._id;
                    const price = item.finalPrice ?? item.price ?? 0;
                    return {
                        ...item,
                        id,
                        _id: id,
                        sku: item.itemCode || item.sku || '',
                        title: item.productTitle || item.title || '',
                        name: item.productTitle || item.title || '',
                        image: item.images?.[0]?.MediaLocation || item.image || '',
                        default_image: item.images?.[0]?.MediaLocation || item.image || '',
                        price,
                        setting_price: price,
                        sizeId: item.sizeId || (typeof item.sizeDetails === 'object' ? item.sizeDetails?._id : item.sizeDetails) || null,
                        size: item.size || item.sizeDetails?.name || null,
                    };
                });
                setWishlist([...mappedJewelry, ...extraSavedItems]);
                pruneGuestCookie(guest, response.removed, setWishlistCookie, response.adjusted);
            } else {
                setWishlist(extraSavedItems);
            }
        }
    } catch (error) {
        console.log("error -------->", error);
    }
};

// Silent access-token refresh (deduped so parallel 401s share one refresh call).
let _refreshPromise: Promise<string | null> | null = null;
const attemptRefresh = (): Promise<string | null> => {
    if (!_refreshPromise) {
        _refreshPromise = (async () => {
            try {
                const rt = getRefreshToken();
                if (!rt) return null;
                const res = await fetch(ENDPOINTS.AUTH.REFRESH, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ refreshToken: rt }),
                });
                const body = await res.json().catch(() => null);
                if (res.ok && body?.accessToken) {
                    setToken(body.accessToken);
                    return body.accessToken as string;
                }
                return null;
            } catch {
                return null;
            }
        })().finally(() => { _refreshPromise = null; });
    }
    return _refreshPromise;
};

export const callApi = async (
    url: string,
    method?: string,
    data?: any,
    token?: string,
    _isRetry: boolean = false,
    serverHeaders?: Record<string, string>
): Promise<any> => {
    try {
        const { currency, country } = useGlobleStore.getState();
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'x-currency': currency, // centralized so that all price will chnge proper
        };
        // Lets the server decide taxability (GST) for cart/preview, where no
        // shipping address exists yet. The ORDER re-decides it from the shipping
        // country, which is authoritative — this is only for the estimate shown.
        if (country) {
            headers['x-country'] = String(country);
        }

        if (serverHeaders) {
            Object.assign(headers, serverHeaders);
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options: RequestInit = {
            method: method || 'GET',
            headers
        };

        if (data) {
            const isFormData =
                (typeof FormData !== 'undefined' && data instanceof FormData) ||
                (data && data.constructor && data.constructor.name === 'FormData') ||
                (data && data[Symbol.toStringTag] === 'FormData') ||
                (data && typeof data.append === 'function' && typeof data.delete === 'function');

            if (isFormData) {
                options.body = data;
            } else {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(data);
            }
        }

        const response = await fetch(url, options);
        const result = await response.json();

        // Access token expired/invalid → silently refresh once and retry.
        const isAuthEndpoint =
            url === ENDPOINTS.AUTH.REFRESH || url === ENDPOINTS.AUTH.LOGIN ||
            url === ENDPOINTS.AUTH.VERIFY_OTP || url === ENDPOINTS.AUTH.LOGOUT;
        if ((response.status === 403 || result?.errorCode === 403) && token && !_isRetry && !isAuthEndpoint) {
            const newToken = await attemptRefresh();
            if (newToken) {
                return callApi(url, method, data, newToken, true);
            }
            // Refresh failed → session is gone. Clear + bounce to sign-in.
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-in')) {
                clearAuth();
                const next = window.location.pathname + window.location.search;
                window.location.href = `/sign-in?next=${encodeURIComponent(next)}`;
            }
        }

        return result;
    } catch (error: any) {
        console.log("API call error:", error);
        return { errorCode: 500, message: error.message };
    }
};

export const logout = async () => {
    try {
        const token = getToken();
        if (token) {
            await callApi(ENDPOINTS.AUTH.LOGOUT, "POST", null, token);
        }
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        clearAuth();
        if (typeof window !== "undefined") {
            window.location.href = "/sign-in";
        }
    }
};

export default callApi;