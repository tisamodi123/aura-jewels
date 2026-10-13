"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import SmallSpinner from "@/components/SmallSpinner";
import { M } from "@/lib/messages";
import { fetchSection, saveSection } from "./sectionApi";
import { uploadPendingFiles } from "./imageHelpers";

// Generic editor shell:
// - Loads section by key on mount
// - Hands content to children via a render-prop `renderContent`
// - Provides save/loading/error UI consistently across the 11 editor pages
export default function SectionShell({ sectionKey, title, defaults = {}, renderContent }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [section, setSection] = useState(null);
    const [content, setContent] = useState(defaults);
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchSection(sectionKey);
                if (cancelled) return;
                setSection(data);
                setContent({ ...defaults, ...(data?.content || {}) });
                setEnabled(data?.enabled !== false);
            } catch (err) {
                toast.error(err.message || M.home.sectionFetchFailed);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionKey]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const uploadedContent = await uploadPendingFiles(content);
            const updatedSection = await saveSection(sectionKey, { content: uploadedContent, enabled });
            if (updatedSection) {
                setSection(updatedSection);
                if (updatedSection.content) {
                    setContent({ ...defaults, ...updatedSection.content });
                }
            }
            toast.success(M.home.sectionUpdated);
        } catch (err) {
            toast.error(err.message || M.home.sectionUpdateFailed);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <SmallSpinner />
            </div>
        );
    }

    return (
        <div>
            <div className="p-2 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/cms/home"
                        className="text-zinc-600 hover:text-black flex items-center gap-1 text-[0.8rem]"
                    >
                        <ChevronLeft size={16} /> {M.common.back}
                    </Link>
                    <div className="font-semibold text-xl">{title}</div>
                </div>
                <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-2 text-[0.8rem] mr-2">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        {M.home.labels.enabled}
                    </label>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleSave}
                        className="h-[36px] px-5 flex items-center rounded-md justify-center font-normal bg-black text-[0.80rem] text-white disabled:opacity-60"
                    >
                        {saving ? M.common.loading : M.home.labels.saveSection}
                    </button>
                </div>
            </div>

            <div className="bg-white border border-zinc-200 shadow-sm rounded-md p-5 mb-5 space-y-5">
                {renderContent({ content, setContent, section })}
            </div>
        </div>
    );
}
