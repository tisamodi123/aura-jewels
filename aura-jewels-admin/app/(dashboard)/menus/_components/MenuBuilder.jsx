"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, MENU_LOCATION } from "@/lib/Constant";
import { uploadPendingFiles } from "@/app/(dashboard)/cms/home/_components/imageHelpers";
import MenuItemEditor from "./MenuItemEditor";
import { uid, ensureUids, moveByUid } from "./treeUtil";

// Drops server-only / client-only meta keys before saving so Mongoose
// regenerates clean subdocuments and no resolved `href` / client `_uid` leaks
// into the DB.
const META_KEYS = new Set(["_id", "id", "_uid", "createdAt", "updatedAt", "__v", "href"]);
const stripMeta = (value) => {
    if (Array.isArray(value)) return value.map(stripMeta);
    if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (META_KEYS.has(k)) continue;
            out[k] = stripMeta(v);
        }
        return out;
    }
    return value;
};

const newItem = () => ({
    _uid: uid(),
    label: "New item",
    redirect: { type: "none" },
    hasMegaMenu: true,
    isActive: true,
    columns: [],
    featuredCards: [],
});

export default function MenuBuilder({ location = MENU_LOCATION.HEADER }) {
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("ACTIVE");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [openId, setOpenId] = useState(null); // accordion: which item is expanded

    const token = getToken();

    // Redirect-picker options are loaded (and cached) by the shared picker via
    // useRedirectOptions — the builder only needs to fetch the menu tree.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const menuRes = await callApi(API_URL.GET_MENU(location), "GET", null, token);
                if (cancelled) return;
                if (menuRes?.errorCode === STATUS_CODE.OK) {
                    setItems(ensureUids(Array.isArray(menuRes.data?.items) ? menuRes.data.items : []));
                    setStatus(menuRes.data?.status || "ACTIVE");
                }
            } catch (err) {
                console.error("Menu load error:", err);
                toast.error("Failed to load menu");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [location, token]);

    // Stable, functional callbacks (empty deps) so memoized item editors don't
    // re-render just because the parent re-rendered.
    const updateItem = useCallback((id, updater) => {
        setItems((prev) => prev.map((it) => (it._uid === id ? updater(it) : it)));
    }, []);
    const removeItem = useCallback((id) => {
        setItems((prev) => prev.filter((it) => it._uid !== id));
    }, []);
    const moveItem = useCallback((id, dir) => {
        setItems((prev) => moveByUid(prev, id, dir));
    }, []);
    const toggleOpen = useCallback((id) => {
        setOpenId((cur) => (cur === id ? null : id));
    }, []);

    const addItem = () => {
        const it = newItem();
        setItems((prev) => [...prev, it]);
        setOpenId(it._uid); // open the new one for editing
    };

    const save = async () => {
        setSaving(true);
        try {
            const uploaded = await uploadPendingFiles(items);
            const clean = stripMeta(uploaded);
            const res = await callApi(API_URL.SAVE_MENU(location), "PUT", { items: clean, status }, token);
            if (res?.errorCode === STATUS_CODE.OK) {
                toast.success(res?.message || "Menu saved");
                // `uploaded` keeps the client _uids (and File→URL swaps) so the
                // open item stays open and images aren't re-uploaded next save.
                setItems(uploaded);
            } else {
                toast.error(res?.message || "Failed to save menu");
            }
        } catch (err) {
            console.error("Menu save error:", err);
            toast.error(err?.message || "Failed to save menu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-zinc-500">
                <Loader2 className="animate-spin mr-2" size={18} /> Loading menu…
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between sticky top-0 z-10 bg-white/90 backdrop-blur py-3 border-b border-[#E4E8EE]">
                    <div>
                        <h1 className="text-lg font-semibold">Mega Menu — {location}</h1>
                        <p className="text-[0.78rem] text-zinc-500">Click a row to expand and edit it. Only the open item is rendered, so the page stays fast.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-[0.78rem] text-zinc-600">
                            <input type="checkbox" checked={status === "ACTIVE"} onChange={(e) => setStatus(e.target.checked ? "ACTIVE" : "SUSPENDED")} />
                            Published
                        </label>
                        <button type="button" onClick={save} disabled={saving}
                            className="flex items-center gap-1.5 bg-black text-white text-[0.8rem] px-4 py-2 rounded-md disabled:opacity-50">
                            {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Save menu
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {items.map((item, i) => (
                        <MenuItemEditor
                            key={item._uid}
                            item={item}
                            index={i}
                            total={items.length}
                            isOpen={openId === item._uid}
                            onToggle={toggleOpen}
                            update={updateItem}
                            remove={removeItem}
                            move={moveItem}
                        />
                    ))}
                </div>

                <button type="button" onClick={addItem}
                    className="flex items-center gap-1.5 text-[0.85rem] font-medium text-blue-600 hover:underline">
                    <Plus size={16} /> Add top-level item
                </button>
            </div>
    );
}
