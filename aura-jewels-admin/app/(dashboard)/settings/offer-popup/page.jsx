"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { uploadCmsImage, resolveCmsImage } from "@/app/(dashboard)/cms/home/_components/imageHelpers";

const field =
    "w-full px-3 py-2 border text-[0.85rem] text-zinc-900 bg-white border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500";
const label = "block text-[0.80rem] font-semibold mb-1.5 text-zinc-700";

// One image slot: shows the current image, lets the admin pick a new file
// (uploaded immediately), and clear it.
function ImageSlot({ title, hint, value, onChange, uploading, onUpload }) {
    return (
        <div>
            <label className={label}>{title}</label>
            <div className="border border-dashed border-zinc-300 rounded-md p-3 bg-zinc-50/50">
                {value ? (
                    <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveCmsImage(value)} alt={title} className="w-full max-h-48 object-contain rounded" />
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="mt-2 text-[0.72rem] text-red-600 hover:underline"
                        >
                            Remove image
                        </button>
                    </div>
                ) : (
                    <div className="text-[0.75rem] text-zinc-400 py-6 text-center">No image yet</div>
                )}
                <label className="mt-2 inline-block text-[0.75rem] font-semibold text-blue-600 cursor-pointer hover:underline">
                    {uploading ? "Uploading…" : (value ? "Replace image" : "Upload image")}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onUpload(f);
                            e.target.value = "";
                        }}
                    />
                </label>
            </div>
            <p className="text-[0.72rem] text-zinc-400 mt-1">{hint}</p>
        </div>
    );
}

export default function OfferPopupPage() {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({ desktop: false, mobile: false });
    const [form, setForm] = useState({
        enabled: false,
        desktopImage: "",
        mobileImage: "",
        linkUrl: "",
    });

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const load = async () => {
        setLoading(true);
        try {
            const res = await callApi(API_URL.OFFER_POPUP, "GET", null, token);
            if (res?.errorCode === 200 && res.data) setForm((p) => ({ ...p, ...res.data }));
            else toast.error(res?.message || "Failed to load popup config");
        } catch (e) {
            toast.error("Failed to load popup config");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = async (slot, file) => {
        setUploading((p) => ({ ...p, [slot]: true }));
        try {
            const url = await uploadCmsImage(file);
            set(slot === "desktop" ? "desktopImage" : "mobileImage", url);
            toast.success("Image uploaded");
        } catch (e) {
            toast.error(e?.message || "Upload failed");
        } finally {
            setUploading((p) => ({ ...p, [slot]: false }));
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await callApi(API_URL.OFFER_POPUP, "PUT", form, token);
            if (res?.errorCode === 200) {
                toast.success(res.message || "Saved");
                load();
            } else {
                toast.error(res?.message || "Failed to save");
            }
        } catch (e) {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-sm text-zinc-500">Loading popup configuration…</div>;
    }

    return (
        <div className="p-4 max-w-3xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-semibold">Today&apos;s Offer Popup</h1>
                    <p className="text-[0.8rem] text-zinc-500 mt-1">
                        Shown once per visitor session on the storefront. Upload a desktop and a mobile image.
                    </p>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="bg-black text-white rounded-md px-5 py-2 text-[0.8rem] disabled:opacity-60"
                >
                    {saving ? "Saving…" : "Save"}
                </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-5">
                <label className="flex items-center gap-2 text-[0.85rem]">
                    <input type="checkbox" checked={!!form.enabled} onChange={(e) => set("enabled", e.target.checked)} />
                    <span className="font-semibold">Enabled</span>
                    <span className="text-zinc-400">(off = popup never shows; needs at least one image too)</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ImageSlot
                        title="Desktop Image"
                        hint="Shown on screens ≥ 768px. Landscape works best (e.g. 900×600)."
                        value={form.desktopImage}
                        onChange={(v) => set("desktopImage", v)}
                        uploading={uploading.desktop}
                        onUpload={(f) => handleUpload("desktop", f)}
                    />
                    <ImageSlot
                        title="Mobile Image"
                        hint="Shown on phones. Portrait works best (e.g. 600×800)."
                        value={form.mobileImage}
                        onChange={(v) => set("mobileImage", v)}
                        uploading={uploading.mobile}
                        onUpload={(f) => handleUpload("mobile", f)}
                    />
                </div>

                <div>
                    <label className={label}>Link URL (optional)</label>
                    <input
                        className={field}
                        value={form.linkUrl || ""}
                        placeholder="/offer/diwali  or  /all  (blank = clicking just closes)"
                        onChange={(e) => set("linkUrl", e.target.value)}
                    />
                    <p className="text-[0.72rem] text-zinc-400 mt-1">
                        Where the popup image links to when clicked. Leave blank to make it non-clickable.
                    </p>
                </div>
            </div>
        </div>
    );
}
