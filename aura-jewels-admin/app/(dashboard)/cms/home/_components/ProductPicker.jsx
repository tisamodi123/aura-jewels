"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import TextField from "./TextField";

// Multi-select product picker for CMS sections that reference catalog items
// (e.g. FeaturedProducts tabs). Stores plain string IDs in `value`; the
// resolved product docs are kept locally so admins see titles + previews.
export default function ProductPicker({ value = [], onChange, label = M.home.labels.products }) {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [picked, setPicked] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = getToken();

    // Hydrate picked product details for the IDs we already have stored.
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const missing = (value || []).filter(
                (id) => !picked.find((p) => (p._id || p.id) === id)
            );
            if (missing.length === 0) return;
            try {
                const res = await callApi(
                    API_URL.HOME_SECTION_PRODUCT_SEARCH,
                    "POST",
                    { page: 1, limit: missing.length, ids: missing, parentOnly: true },
                    token,
                );
                if (cancelled) return;
                const list = res?.data?.list || res?.data?.products || res?.data || [];
                if (Array.isArray(list)) {
                    const byId = new Map(list.map((p) => [(p._id || p.id)?.toString(), p]));
                    const next = (value || [])
                        .map((id) => byId.get(id?.toString()))
                        .filter(Boolean);
                    // Preserve any already-known product even if the server didn't
                    // return it (e.g. archived) by stashing a stub.
                    const fallback = (value || []).map(
                        (id) => byId.get(id?.toString()) || picked.find((p) => (p._id || p.id) === id) || { _id: id, productTitle: `(${id})` },
                    );
                    setPicked(fallback);
                }
            } catch (err) {
                console.error("ProductPicker hydrate error:", err);
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
                const body = { page: 1, limit: 20, parentOnly: true };
                if (search) body.search = search;
                const res = await callApi(API_URL.HOME_SECTION_PRODUCT_SEARCH, "POST", body, token);
                if (cancelled) return;
                const list = res?.data?.list || res?.data?.products || res?.data || [];
                setSearchResults(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error("ProductPicker search error:", err);
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

    const addId = (id) => {
        if (!id || valueSet.has(id)) return;
        onChange([...(value || []), id]);
    };

    const removeId = (id) => {
        onChange((value || []).filter((v) => v !== id));
    };

    const move = (id, dir) => {
        const arr = (value || []).slice();
        const i = arr.indexOf(id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        onChange(arr);
    };

    return (
        <div>
            {label && (
                <label className="block text-[0.80rem] font-semibold mb-2">{label}</label>
            )}

            <div className="space-y-2 mb-3">
                {(value || []).length === 0 ? (
                    <div className="text-[0.75rem] text-zinc-500 border border-dashed rounded-md py-3 text-center">
                        No products selected yet
                    </div>
                ) : (
                    (value || []).map((id, idx) => {
                        const p = picked.find((x) => (x._id || x.id)?.toString() === id?.toString());
                        return (
                            <div key={id} className="flex items-center justify-between border border-[#E4E8EE] bg-white rounded-md px-3 py-2 text-[0.75rem]">
                                <div className="flex-1 truncate text-zinc-800">
                                    <span className="text-zinc-400 mr-2">#{idx + 1}</span>
                                    {p?.productTitle || p?.name || p?.title || id}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => move(id, -1)}
                                        disabled={idx === 0}
                                        className="px-2 py-0.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                                    >↑</button>
                                    <button
                                        type="button"
                                        onClick={() => move(id, 1)}
                                        disabled={idx === (value || []).length - 1}
                                        className="px-2 py-0.5 text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                                    >↓</button>
                                    <button
                                        type="button"
                                        onClick={() => removeId(id)}
                                        className="p-1 rounded hover:bg-red-50 text-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <TextField
                value={search}
                onChange={setSearch}
                placeholder="Search products by title or item code"
            />

            <div className="mt-2 max-h-60 overflow-y-auto border border-[#E4E8EE] rounded-md bg-white">
                {loading && (
                    <div className="px-3 py-2 text-[0.75rem] text-zinc-500">{M.common.loading}</div>
                )}
                {!loading && searchResults.length === 0 && (
                    <div className="px-3 py-2 text-[0.75rem] text-zinc-500">{M.common.noData}</div>
                )}
                {!loading && searchResults.map((p) => {
                    const id = (p._id || p.id)?.toString();
                    const already = valueSet.has(id);
                    return (
                        <button
                            type="button"
                            key={id}
                            onClick={() => addId(id)}
                            disabled={already}
                            className={`block w-full text-left px-3 py-2 text-[0.75rem] border-b last:border-b-0 border-zinc-100 ${already
                                ? "bg-zinc-50 text-zinc-400 cursor-not-allowed"
                                : "hover:bg-zinc-50 text-zinc-800"}`}
                        >
                            <span className="font-medium">{p.productTitle || p.title || p.name}</span>
                            {p.itemCode && <span className="text-zinc-400 ml-2">— {p.itemCode}</span>}
                            {already && <span className="text-zinc-400 ml-2">(added)</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
