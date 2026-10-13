"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";

// Heritage is a fixed 5-card layout (row1Large + row1Stack1 + row1Stack2 + row2Small + row2Large).
// We render each as its own labelled block — no add/remove.
const SLOTS = [
    { key: "row1Large", label: "Row 1 — Large", defaultAlign: "right" },
    { key: "row1Stack1", label: "Row 1 — Stack Top", defaultAlign: "left" },
    { key: "row1Stack2", label: "Row 1 — Stack Bottom", defaultAlign: "left" },
    { key: "row2Small", label: "Row 2 — Small", defaultAlign: "center" },
    { key: "row2Large", label: "Row 2 — Large", defaultAlign: "center" },
];

const ALIGN_OPTIONS = ["left", "center", "right"];

const defaults = SLOTS.reduce(
    (acc, slot) => {
        acc[slot.key] = { title: "", image: "", imageMobile: "", align: slot.defaultAlign, redirect: { type: "none" } };
        return acc;
    },
    { heading: "", subText: "" },
);

export default function HeritageCollectionEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => {
                const updateSlot = (key, patch) => {
                    setContent({ ...content, [key]: { ...(content[key] || {}), ...patch } });
                };

                return (
                    <div className="space-y-5">
                        <TextField
                            label={M.home.labels.heading}
                            value={content.heading}
                            onChange={(v) => setContent({ ...content, heading: v })}
                        />
                        <TextField
                            label={M.home.labels.subText}
                            value={content.subText}
                            onChange={(v) => setContent({ ...content, subText: v })}
                            textarea
                        />

                        {SLOTS.map((slot) => {
                            const item = content[slot.key] || {};
                            return (
                                <div key={slot.key} className="border border-[#E4E8EE] rounded-md p-3 space-y-3">
                                    <div className="text-[0.85rem] font-semibold text-zinc-800">{slot.label}</div>
                                    <TextField
                                        label={M.home.labels.heading}
                                        value={item.title}
                                        onChange={(v) => updateSlot(slot.key, { title: v })}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <ImageField
                                            label={M.home.labels.image}
                                            value={item.image}
                                            onChange={(v) => updateSlot(slot.key, { image: v })}
                                        />
                                        <ImageField
                                            label={M.home.labels.imageMobile}
                                            value={item.imageMobile}
                                            onChange={(v) => updateSlot(slot.key, { imageMobile: v })}
                                            hint={M.home.labels.imageMobileHint}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[0.80rem] font-semibold mb-2">
                                            {M.home.labels.align}
                                        </label>
                                        <select
                                            value={item.align || slot.defaultAlign}
                                            onChange={(e) => updateSlot(slot.key, { align: e.target.value })}
                                            className="w-full px-3 py-2 border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            {ALIGN_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <RedirectPicker
                                        value={item.redirect}
                                        onChange={(redirect) => updateSlot(slot.key, { redirect })}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            }}
        />
    );
}
