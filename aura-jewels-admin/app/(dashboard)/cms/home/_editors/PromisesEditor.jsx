"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { heading: "", subText: "", items: [] };

const newItem = () => ({ icon: "", title: "", desc: "" });

export default function PromisesEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
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

                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title={M.home.labels.items}
                        itemLabel={(i, it) => `Promise ${i + 1}${it?.title ? ` — ${it.title}` : ""}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <ImageField
                                    label={M.home.labels.icon}
                                    value={item.icon}
                                    onChange={(v) => update({ icon: v })}
                                    accept="image/svg+xml,image/png,image/jpeg,image/webp"
                                />
                                <TextField label={M.home.labels.heading} value={item.title} onChange={(v) => update({ title: v })} />
                                <TextField label={M.home.labels.description} value={item.desc} onChange={(v) => update({ desc: v })} textarea />
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
