"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

// Options every RedirectPicker needs (pages + entity dropdowns + filter facets).
// Fetched ONCE per app session from GET menu/options and cached at module level,
// so any number of pickers on any page (menu builder, home CMS, card editors)
// share a single request instead of each fetching its own.

const EMPTY = { pages: [], categories: [], collections: [], offers: [], tags: [], shapes: [], metals: [] };

let _cache = null;
let _promise = null;

export const loadRedirectOptions = () => {
    if (_cache) return Promise.resolve(_cache);
    if (!_promise) {
        _promise = callApi(API_URL.MENU_REDIRECT_OPTIONS, "GET", null, getToken())
            .then((res) => {
                _cache = (res?.errorCode === STATUS_CODE.OK && res.data) ? { ...EMPTY, ...res.data } : EMPTY;
                return _cache;
            })
            .catch((err) => {
                console.error("loadRedirectOptions error:", err);
                _promise = null; // allow retry on next mount
                return EMPTY;
            });
    }
    return _promise;
};

export function useRedirectOptions() {
    const [opts, setOpts] = useState(_cache || EMPTY);
    useEffect(() => {
        if (_cache) { setOpts(_cache); return; }
        let mounted = true;
        loadRedirectOptions().then((o) => { if (mounted) setOpts(o); });
        return () => { mounted = false; };
    }, []);
    return opts;
}
