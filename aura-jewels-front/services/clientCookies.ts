import { lineKey } from '@/lib/lineIdentity';

export const getCookie = (name: string) => {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
};

export const setCookie = (name: string, value: string, days?: number) => {
    if (typeof document === 'undefined') return;
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

export const deleteCookie = (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; Max-Age=-99999999; path=/;';
};

// Storefront cookies are prefixed `customer_` to avoid colliding with
// the admin panel's `token` cookie on the same host. Both apps run on
// the same domain in dev (e.g. localhost:5000 + :3000) and cookies
// are scoped by domain — without the prefix, a customer logging in on
// the storefront overwrote the admin session and vice versa, which is
// why the admin customer-list call started returning 403s after a
// customer OTP flow.
// We also one-shot migrate any legacy cookies (`token`/`user`/
// `refreshToken`) the first time these helpers run so existing sessions
// don't get bumped to the login screen.
const LEGACY_COOKIE_NAMES = ['token', 'user', 'refreshToken'] as const;
const COOKIE = {
    token: 'customer_token',
    user: 'customer_user',
    refresh: 'customer_refresh',
} as const;

let migrated = false;
const ensureMigrated = () => {
    if (migrated || typeof document === 'undefined') return;
    migrated = true;
    // Distinguishing a legacy storefront session from a co-resident
    // admin session is critical here. Both apps used to set `token` and
    // share the same host (e.g. localhost:5000 + :3000), but only
    // the storefront ever set the `user` cookie alongside it. So:
    //   - If both `token` AND `user` exist → a real legacy customer
    //     session; copy to customer_token / customer_user / customer_refresh.
    //   - If only `token` exists → it belongs to admin staff,
    //     leave it alone.
    // Either way, we never delete the legacy `token` cookie here —
    // doing so would silently log the admin out of the staff panel.
    const legacyToken = getCookie('token');
    const legacyUser = getCookie('user');
    const legacyRefresh = getCookie('refreshToken');
    const looksLikeStorefrontSession = !!legacyToken && !!legacyUser;
    if (!looksLikeStorefrontSession) return;
    if (!getCookie(COOKIE.token) && legacyToken) setCookie(COOKIE.token, legacyToken, 7);
    if (!getCookie(COOKIE.user) && legacyUser) setCookie(COOKIE.user, legacyUser, 7);
    if (!getCookie(COOKIE.refresh) && legacyRefresh) setCookie(COOKIE.refresh, legacyRefresh, 7);
    deleteCookie('token');
    deleteCookie('user');
    deleteCookie('refreshToken');
};

// Aliases for common use cases
export const setUser = (user: any) => {
    setCookie(COOKIE.user, JSON.stringify(user), 7);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cookie-user-change'));
    }
};

export const getUser = () => {
    ensureMigrated();
    const user = getCookie(COOKIE.user);
    return user ? JSON.parse(user) : null;
};

export const setToken = (token: string) => {
    setCookie(COOKIE.token, token, 7);
};

export const getToken = () => {
    ensureMigrated();
    return getCookie(COOKIE.token);
};

export const setRefreshToken = (token: string) => {
    setCookie(COOKIE.refresh, token, 7);
};

export const getRefreshToken = () => {
    ensureMigrated();
    return getCookie(COOKIE.refresh);
};

export const clearAuth = () => {
    deleteCookie(COOKIE.token);
    deleteCookie(COOKIE.user);
    deleteCookie(COOKIE.refresh);
    deleteCookie('coupon_code');
    // Also wipe any legacy cookies that may still linger so logout is
    // exhaustive — otherwise an admin signing out of the storefront
    // could leave their staff `token` behind.
    for (const legacy of LEGACY_COOKIE_NAMES) deleteCookie(legacy);
};

// Keep old names as aliases for compatibility during migration
export const setUserData = setUser;
export const getUserData = getUser;
export const setAuthToken = setToken;
export const getAuthToken = getToken;

// ---------------------------------------------------------------------------
// Guest cart / wishlist cookies.
//
// These store the SKU (itemCode) and the buyer's SELECTIONS only — never a
// price, title, image or slug. Prices, availability and titles are always
// hydrated from the server (`/cart/preview`, `/wishlist/preview`), so they can
// never go stale and a deactivated product disappears immediately.
//
// Selections (size / centre-stone origin+colour+clarity / qty) are choices,
// not prices — the server needs them to quote the right price and to merge the
// cart on login.
//
// Cookies written before this change carry ~22 fields (including `price`).
// `readCookieItems` normalises them so nobody's cart evaporates on deploy.
// ---------------------------------------------------------------------------

const parseCookieJson = (name: string): any[] => {
    const data = getCookie(name);
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

/** Legacy cookies keyed items by product `_id` and had no reliable `sku`. */
const legacySku = (item: any): string =>
    String(item?.sku || item?.itemCode || item?.itemcode || '').trim();

export const getWishlistCookie = (): any[] => {
    const raw = parseCookieJson('aura-wishlist')
        .map((item: any) => ({
            sku: legacySku(item),
            // Legacy fallback so an old cookie still merges on login.
            ...(legacySku(item) ? {} : { id: item?.id || item?._id || item?.jeweleryId, jeweleryId: item?.jeweleryId }),
            sizeId: item?.sizeId || (typeof item?.sizeDetails === 'object' ? item?.sizeDetails?._id : item?.sizeDetails) || item?.selectedSize || null,
            origin: item?.origin ?? null,
            color: item?.color ?? null,
            clarity: item?.clarity ?? null,
        }))
        .filter((i: any) => i.sku || i.id || i.jeweleryId);

    const seen = new Set<string>();
    return raw.filter((item: any) => {
        const key = lineKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export const setWishlistCookie = (wishlist: any[]) => {
    const light = wishlist.map((item: any) => {
        const sku = legacySku(item);
        const id = item?.jeweleryId || item?.id || item?._id || null;
        return {
            sku,
            // A cookie written before this change has no sku. Keep the product
            // id so the line still resolves (and still merges on login) instead
            // of being silently destroyed on the next write.
            ...(sku ? {} : { jeweleryId: id }),
            sizeId: item?.sizeId || (typeof item?.sizeDetails === 'object' ? item?.sizeDetails?._id : item?.sizeDetails) || item?.selectedSize || null,
            origin: item?.origin ?? null,
            color: item?.color ?? null,
            clarity: item?.clarity ?? null,
        };
    }).filter((i: any) => i.sku || i.jeweleryId);

    const seen = new Set<string>();
    const uniqueLight = light.filter((item: any) => {
        const key = lineKey(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    setCookie('aura-wishlist', JSON.stringify(uniqueLight), 7);
};

export const getCartCookie = (): any[] =>
    parseCookieJson('aura-cart')
        .map((item: any) => ({
            sku: legacySku(item),
            ...(legacySku(item) ? {} : { id: item?.id || item?._id, jeweleryId: item?.jeweleryId }),
            qty: Number(item?.qty || item?.quantity) || 1,
            sizeId: item?.sizeId || null,
            origin: item?.origin ?? null,
            color: item?.color ?? null,
            clarity: item?.clarity ?? null,
            engraving: Number(item?.engraving) || 0,
            engravingText: item?.engravingText || '',
        }))
        .filter((i: any) => i.sku || i.id || i.jeweleryId);

export const setCartCookie = (cart: any[]) => {
    const light = cart.map((item: any) => {
        const sku = legacySku(item);
        const id = item?.jeweleryId || item?.id || item?._id || null;
        return {
            sku,
            // A cookie written before this change has no sku. Keep the product
            // id so the line still prices (and still merges on login) instead
            // of being silently destroyed on the next write.
            ...(sku ? {} : { jeweleryId: id }),
            qty: Number(item?.qty || item?.quantity) || 1,
            sizeId: item?.sizeId || null,
            origin: item?.origin ?? null,
            color: item?.color ?? null,
            clarity: item?.clarity ?? null,
            engraving: Number(item?.engraving) || 0,
            engravingText: item?.engravingText || '',
        };
    }).filter((i: any) => i.sku || i.jeweleryId);

    setCookie('aura-cart', JSON.stringify(light), 7);
};

export const setLastRoute = (route: string) => {
    setCookie('last_route', route, 1);
};

export const getLastRoute = (): string | undefined => {
    const route = getCookie('last_route');
    return route ? decodeURIComponent(route) : undefined;
};

export const clearLastRoute = () => {
    deleteCookie('last_route');
};

