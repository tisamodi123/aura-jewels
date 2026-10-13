"use client";

import { useRef } from "react";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import FilePicker from "@/components/FilePicker";
import { uploadCmsImage } from "@/app/(dashboard)/cms/home/_components/imageHelpers";
import RedirectPicker from "@/app/(dashboard)/cms/home/_components/RedirectPicker";

// Reusable editor for the `interProductBanners` array on Category /
// Collection. Stores items as plain objects:
//   { image, imageMobile, position, redirect, alt }
//
// `redirect` uses the same RedirectPicker shape as CMS home sections —
// {type: "none" | "direct" | "list" | "product", url?, listOf?, refId?,
// productId?}. The backend resolves the final `href` via decorateRedirects
// so the storefront never builds banner links itself.
//
// Each image picker uploads through the CMS uploadImage endpoint immediately
// so the form's submit payload only carries path strings — keeps the parent
// FormData simple (no nested files).
export default function InterProductBannersEditor({ value = [], onChange }) {
    const dropRef = useRef(0);

    const update = (idx, patch) => {
        const next = value.slice();
        next[idx] = { ...next[idx], ...patch };
        onChange(next);
    };

    const remove = (idx) => {
        const next = value.slice();
        next.splice(idx, 1);
        onChange(next);
    };

    const move = (idx, dir) => {
        const j = idx + dir;
        if (j < 0 || j >= value.length) return;
        const next = value.slice();
        [next[idx], next[j]] = [next[j], next[idx]];
        onChange(next);
    };

    const add = () => {
        onChange([
            ...value,
            {
                image: "",
                imageMobile: "",
                position: value.length + 1,
                redirect: { type: "none" },
                alt: "",
            },
        ]);
    };

    const onUploadFor = (idx, key) => async (file) => {
        if (!(file instanceof File)) {
            // Picker reported a clear / existing value — pass through.
            update(idx, { [key]: typeof file === "string" ? file : "" });
            return;
        }
        try {
            const path = await uploadCmsImage(file);
            update(idx, { [key]: path });
        } catch (err) {
            toast.error(err.message || "Upload failed");
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                    Inter-product Banners
                </div>
                <button
                    type="button"
                    onClick={add}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-black text-white"
                >
                    <Plus size={14} /> Add banner
                </button>
            </div>

            {value.length === 0 && (
                <div className="text-xs text-zinc-500 border border-dashed rounded-md py-4 text-center">
                    No banners yet — admins can add editorial cards that appear
                    between product rows on the list page.
                </div>
            )}

            <div className="space-y-4">
                {value.map((b, i) => (
                    <div key={i} className="border border-[#E4E8EE] rounded-md p-3 bg-zinc-50/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold text-zinc-700">Banner {i + 1}</div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => move(i, -1)}
                                    disabled={i === 0}
                                    className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(i, 1)}
                                    disabled={i === value.length - 1}
                                    className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30"
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="p-1 rounded hover:bg-red-50 text-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FilePicker
                                label="Image (Desktop - 1440x400px)"
                                value={b.image instanceof File ? b.image : ""}
                                existingUrl={typeof b.image === "string" ? b.image : ""}
                                onChange={onUploadFor(i, "image")}
                                accept="image/*"
                                resetKey={`banner-${i}-${dropRef.current}`}
                                expectedWidth={1440}
                                expectedHeight={400}
                            />
                            <FilePicker
                                label="Image (Mobile - 768x400px, optional)"
                                value={b.imageMobile instanceof File ? b.imageMobile : ""}
                                existingUrl={typeof b.imageMobile === "string" ? b.imageMobile : ""}
                                onChange={onUploadFor(i, "imageMobile")}
                                accept="image/*"
                                resetKey={`banner-${i}-mob-${dropRef.current}`}
                                expectedWidth={768}
                                expectedHeight={400}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Position (1-indexed)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={b.position || ""}
                                    onChange={(e) =>
                                        update(i, { position: Number(e.target.value) || 0 })
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g. 4"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Alt text</label>
                                <input
                                    type="text"
                                    value={b.alt || ""}
                                    onChange={(e) => update(i, { alt: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Accessibility description"
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            {/* Same Redirect shape as home CMS sections /
                                menuSideCards — None / Category / Collection /
                                Product / Direct link. Backend resolves the
                                final href via decorateRedirects. */}
                            <RedirectPicker
                                value={b.redirect}
                                onChange={(redirect) => update(i, { redirect })}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
