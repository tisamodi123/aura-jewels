"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

// Multi-select picker for product cross-sell / bundle relationships.
// Stores plain item-code STRINGS in `value` (e.g. "KOEER002RD100-14KT-2Y"),
// matching the import-sheet shape and how the Product model persists
// similarProducts / combineWith.
//
// Why a separate picker instead of reusing ProductPicker:
//   - ProductPicker stores ObjectIds; this stores itemCode strings so the
//     CSV submit payload matches the import format byte-for-byte.
//   - The storefront detail endpoint resolves item-code strings to cards
//     at read time, so admins never need an _id round-trip.
//
// Search hits `/products/getProductList` with a search term. Hydration
// for already-stored item codes uses the same endpoint with
// `search: <code>` per code — fine for the small N typical here.
export default function ItemCodePicker({
    value = [],
    onChange,
    label = "Item Codes",
    placeholder = "Search by item code or title",
    excludeItemCode,
}) {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [picked, setPicked] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = getToken();

    // Hydrate picked product details so admins see titles next to item
    // codes. One search-per-code is fine for small N; if cross-sell lists
    // grow into the hundreds we can switch to a bulk endpoint.
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const missing = (value || []).filter(
                (code) => !picked.find((p) => p.itemCode === code),
            );
            if (missing.length === 0) return;
            try {
                const results = await Promise.all(
                    missing.map((code) =>
                        callApi(
                            API_URL.GET_JEWELLERY_LIST,
                            "POST",
                            { page: 1, limit: 1, search: code },
                            token,
                        ),
                    ),
                );
                if (cancelled) return;
                const found = results
                    .flatMap((r) => r?.data || [])
                    .filter((p) => p?.itemCode);
                setPicked((prev) => {
                    const map = new Map(prev.map((p) => [p.itemCode, p]));
                    for (const p of found) map.set(p.itemCode, p);
                    // Stub any code we couldn't resolve so the row still
                    // renders something useful (e.g. archived items).
                    for (const code of value || []) {
                        if (!map.has(code)) {
                            map.set(code, { itemCode: code, productTitle: `(${code})` });
                        }
                    }
                    return Array.from(map.values());
                });
            } catch (err) {
                console.error("ItemCodePicker hydrate error:", err);
            }
        };
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value?.join("|")]);

    useEffect(() => {
        let cancelled = false;
        const handle = setTimeout(async () => {
            try {
                setLoading(true);
                const body = { page: 1, limit: 20 };
                if (search) body.search = search;
                const res = await callApi(API_URL.GET_JEWELLERY_LIST, "POST", body, token);
                if (cancelled) return;
                const list = Array.isArray(res?.data) ? res.data : [];
                setSearchResults(list);
            } catch (err) {
                console.error("ItemCodePicker search error:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [search, token]);

    const valueSet = useMemo(() => new Set(value || []), [value]);

    const addCode = (code) => {
        if (!code || valueSet.has(code)) return;
        if (excludeItemCode && code === excludeItemCode) return;
        onChange([...(value || []), code]);
    };

    const removeCode = (code) => {
        onChange((value || []).filter((v) => v !== code));
    };

    return (
        <div>
            {label && (
                <label className="block text-[0.85rem] font-semibold mb-2">{label}</label>
            )}

            <div className="space-y-2 mb-3">
                {(value || []).length === 0 ? (
                    <div className="text-[0.75rem] text-zinc-500 border border-dashed rounded-md py-3 text-center">
                        No item codes selected yet
                    </div>
                ) : (
                    (value || []).map((code) => {
                        const p = picked.find((x) => x.itemCode === code);
                        return (
                            <div
                                key={code}
                                className="flex items-center justify-between border border-[#E4E8EE] bg-white rounded-md px-3 py-2 text-[0.8rem]"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-zinc-800 truncate">
                                        {p?.productTitle || code}
                                    </div>
                                    <div className="text-[0.7rem] text-zinc-500 truncate">
                                        {code}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeCode(code)}
                                    className="p-1 rounded hover:bg-red-50 text-red-600"
                                    aria-label="Remove"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="mt-2 max-h-60 overflow-y-auto border border-[#E4E8EE] rounded-md bg-white">
                {loading && (
                    <div className="px-3 py-2 text-[0.75rem] text-zinc-500">Loading...</div>
                )}
                {!loading && searchResults.length === 0 && (
                    <div className="px-3 py-2 text-[0.75rem] text-zinc-500">No products found</div>
                )}
                {!loading &&
                    searchResults.map((p) => {
                        const code = p?.itemCode;
                        if (!code) return null;
                        const already = valueSet.has(code);
                        const isSelf = excludeItemCode && code === excludeItemCode;
                        const disabled = already || isSelf;
                        return (
                            <button
                                type="button"
                                key={code}
                                onClick={() => addCode(code)}
                                disabled={disabled}
                                className={`block w-full text-left px-3 py-2 text-[0.75rem] border-b last:border-b-0 border-zinc-100 ${disabled
                                    ? "bg-zinc-50 text-zinc-400 cursor-not-allowed"
                                    : "hover:bg-zinc-50 text-zinc-800"
                                    }`}
                            >
                                <span className="font-medium">{p.productTitle || p.title || code}</span>
                                <span className="text-zinc-400 ml-2">— {code}</span>
                                {already && <span className="text-zinc-400 ml-2">(added)</span>}
                                {isSelf && <span className="text-zinc-400 ml-2">(this product)</span>}
                            </button>
                        );
                    })}
            </div>
        </div>
    );
}
