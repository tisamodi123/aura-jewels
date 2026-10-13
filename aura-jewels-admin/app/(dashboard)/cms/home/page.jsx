"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronRight, ArrowUp, ArrowDown, ExternalLink, Image as ImageIcon } from "lucide-react";
import SmallSpinner from "@/components/SmallSpinner";
import { HOME_SECTION_KEYS, HOME_SECTION_LABELS } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { fetchSectionList, saveSection } from "./_components/sectionApi";
import { resolveCmsImage } from "./_components/imageHelpers";

// Live storefront homepage (for the Preview button). Configurable per env.
const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000";

// Pull the first image found anywhere in a section's content, so each row can
// show a recognizable thumbnail of what it renders on the homepage.
const IMG_KEYS = new Set(["image", "imageMobile", "imageDesktop", "desktopImage", "src", "thumbnail", "bgImage", "backgroundImage"]);
const firstImage = (content) => {
    let found = "";
    const walk = (v) => {
        if (found || !v) return;
        if (Array.isArray(v)) { v.forEach(walk); return; }
        if (typeof v === "object") {
            for (const [k, val] of Object.entries(v)) {
                if (found) return;
                if (IMG_KEYS.has(k) && typeof val === "string" && val.trim()) { found = val; return; }
                walk(val);
            }
        }
    };
    walk(content);
    return found;
};

// The section's actual on-site heading, so the row matches what the user sees.
const liveHeading = (content) => {
    if (!content) return "";
    return content.heading || content.title
        || content.slides?.[0]?.headingLine1 || content.slides?.[0]?.headingLine2
        || content.info?.title || "";
};

export default function HomeCmsListPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState([]);
    const [orderedKeys, setOrderedKeys] = useState(HOME_SECTION_KEYS.ALL_KEYS);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const list = await fetchSectionList();
                setSections(list);
                // Sort keys based on list if available, else fallback to ALL_KEYS
                if (list && list.length > 0) {
                    const sortedList = [...list].sort((a, b) => (a.sort || 0) - (b.sort || 0));
                    setOrderedKeys(sortedList.map(s => s.key));
                }
            } catch (err) {
                toast.error(err.message || M.home.sectionListFetchFailed);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const byKey = sections.reduce((acc, s) => {
        acc[s.key] = s;
        return acc;
    }, {});

    const moveUp = (index) => {
        if (index === 0) return;
        const newKeys = [...orderedKeys];
        const temp = newKeys[index];
        newKeys[index] = newKeys[index - 1];
        newKeys[index - 1] = temp;
        setOrderedKeys(newKeys);
    };

    const moveDown = (index) => {
        if (index === orderedKeys.length - 1) return;
        const newKeys = [...orderedKeys];
        const temp = newKeys[index];
        newKeys[index] = newKeys[index + 1];
        newKeys[index + 1] = temp;
        setOrderedKeys(newKeys);
    };

    const saveOrder = async () => {
        try {
            setSaving(true);
            const promises = orderedKeys.map((key, index) => {
                return saveSection(key, { sort: index });
            });
            await Promise.all(promises);
            toast.success("Order saved successfully");
        } catch (err) {
            toast.error("Failed to save order");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="p-2 mb-3 flex items-center justify-between">
                <div>
                    <div className="font-semibold text-xl">{M.home.title}</div>
                    <p className="text-[0.78rem] text-zinc-500">Rows are in the same top-to-bottom order as the live homepage. Click a row to edit that section.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href={STOREFRONT_URL} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 border border-zinc-300 text-zinc-700 px-3 py-2 rounded text-sm hover:bg-zinc-50">
                        <ExternalLink size={15} /> Preview homepage
                    </a>
                    <button
                        onClick={saveOrder}
                        disabled={saving}
                        className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Order"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <SmallSpinner />
                </div>
            ) : (
                <div className="bg-white border border-zinc-200 shadow-sm rounded-md divide-y">
                    {orderedKeys.map((key, index) => {
                        const sec = byKey[key] || {};
                        const thumb = resolveCmsImage(firstImage(sec.content));
                        const heading = liveHeading(sec.content);
                        return (
                            <div key={key} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition">
                                <Link
                                    href={`/cms/home/${key}`}
                                    className="flex-1 flex items-center gap-4 min-w-0"
                                >
                                    {/* position number */}
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-[0.72rem] font-semibold">
                                        {index + 1}
                                    </span>
                                    {/* thumbnail of what this section shows */}
                                    <span className="flex-shrink-0 w-16 h-12 rounded overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                        {thumb ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={16} className="text-zinc-300" />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-[0.95rem] font-medium text-zinc-800 truncate">
                                            {HOME_SECTION_LABELS[key] || key}
                                        </div>
                                        {/* the section's actual on-site heading so it matches what you see */}
                                        <div className="text-[0.75rem] text-zinc-500 truncate">
                                            {heading ? `“${heading}”` : (sec?.title || "")}
                                        </div>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`text-[0.7rem] px-2 py-1 rounded-full ${sec?.enabled === false
                                            ? "bg-zinc-100 text-zinc-500"
                                            : "bg-green-100 text-green-700"}`}
                                    >
                                        {sec?.enabled === false ? M.common.inactive : M.common.active}
                                    </span>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-zinc-200 rounded disabled:opacity-30"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === orderedKeys.length - 1}
                                            className="p-1 hover:bg-zinc-200 rounded disabled:opacity-30"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>

                                    <ChevronRight size={18} className="text-zinc-400 ml-2" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
