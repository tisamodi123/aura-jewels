"use client";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";

// Loads the logged-in staff's profile + permissions ONCE per session and caches
// it at module level (same pattern as the storefront's useRedirectOptions). Used
// by the header, the settings card, the sidebar gating and per-page action
// gating so every consumer shares one request.

let _cache = null;
let _promise = null;

export const loadMe = () => {
    if (_cache) return Promise.resolve(_cache);
    if (_promise) return _promise;
    _promise = callApi(API_URL.STAFF_ME, "GET", null, getToken())
        .then((res) => {
            if ((res?.errorCode === 200 || res?.errorCode === "200") && res?.data) {
                _cache = res.data;
                return _cache;
            }
            return { permissions: [], role: null };
        })
        .catch(() => ({ permissions: [], role: null }))
        .finally(() => { _promise = null; });
    return _promise;
};

export const clearMe = () => { _cache = null; _promise = null; };

export function useMe() {
    const [me, setMe] = useState(_cache);
    useEffect(() => {
        let mounted = true;
        if (_cache) { setMe(_cache); return; }
        loadMe().then((d) => { if (mounted) setMe(d); });
        return () => { mounted = false; };
    }, []);

    const permSet = new Set(me?.permissions || []);
    const isSuperAdmin = !!me?.isSuperAdmin;

    return {
        me,
        role: me?.role || null,
        isSuperAdmin,
        loaded: !!me,
        // Super Admin can do everything; otherwise check the granted set.
        can: (action) => isSuperAdmin || (Array.isArray(action) ? action.some((a) => permSet.has(a)) : permSet.has(action)),
    };
}
