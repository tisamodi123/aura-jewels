"use client";

import { useRef } from "react";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import FilePicker from "@/components/FilePicker";
import { uploadCmsImage } from "@/app/(dashboard)/cms/home/_components/imageHelpers";
import RedirectPicker from "@/app/(dashboard)/cms/home/_components/RedirectPicker";

// Mega-menu right-side cards for one Category. Stored on the Category as
// `menuSideCards: [{ image, imageMobile, title, subtitle, redirect }]`.
// Each image uploads through the CMS upload endpoint immediately so the
// parent form only carries path strings in a JSON-encoded array.
export default function MenuSideCardsEditor({ value = [], onChange }) {
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
                title: "",
                subtitle: "",
                ctaText: "",
                redirect: { type: "none" },
            },
        ]);
    };

    const onUploadFor = (idx, key) => async (file) => {
        if (!(file instanceof File)) {
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
                    Mega-Menu Side Cards
                </div>
                <button
                    type="button"
                    onClick={add}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-black text-white"
                >
                    <Plus size={14} /> Add card
                </button>
            </div>

            {value.length === 0 && (
                <div className="text-xs text-zinc-500 border border-dashed rounded-md py-4 text-center">
                    No cards yet — admins can curate the right-side panel of
                    this category's mega-menu dropdown here.
                </div>
            )}

            <div className="space-y-4">
                {value.map((c, i) => (
                    <div key={i} className="border border-[#E4E8EE] rounded-md p-3 bg-zinc-50/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold text-zinc-700">
                                Card {i + 1}{c.title ? ` — ${c.title}` : ""}
                            </div>
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
                                label="Image (Desktop - 310x240px)"
                                value={c.image instanceof File ? c.image : ""}
                                existingUrl={typeof c.image === "string" ? c.image : ""}
                                onChange={onUploadFor(i, "image")}
                                accept="image/*"
                                resetKey={`side-${i}-${dropRef.current}`}
                                expectedWidth={310}
                                expectedHeight={240}
                            />
                            <FilePicker
                                label="Image (Mobile - 310x240px, optional)"
                                value={c.imageMobile instanceof File ? c.imageMobile : ""}
                                existingUrl={typeof c.imageMobile === "string" ? c.imageMobile : ""}
                                onChange={onUploadFor(i, "imageMobile")}
                                accept="image/*"
                                resetKey={`side-${i}-mob-${dropRef.current}`}
                                expectedWidth={310}
                                expectedHeight={240}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={c.title || ""}
                                    onChange={(e) => update(i, { title: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g. The Solitaire Edit"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={c.subtitle || ""}
                                    onChange={(e) => update(i, { subtitle: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Short one-liner"
                                />
                            </div>
                        </div>

                        {/* CTA label — empty defaults to "Explore" on the
                            storefront. When the redirect resolves to no
                            href, the storefront hides the CTA entirely. */}
                        <div className="mt-3">
                            <label className="block text-xs font-medium mb-1">CTA text</label>
                            <input
                                type="text"
                                value={c.ctaText || ""}
                                onChange={(e) => update(i, { ctaText: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Defaults to Explore"
                            />
                        </div>

                        <div className="mt-3">
                            <RedirectPicker
                                value={c.redirect}
                                onChange={(redirect) => update(i, { redirect })}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
