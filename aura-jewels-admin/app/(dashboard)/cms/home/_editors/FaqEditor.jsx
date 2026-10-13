"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { heading: "", subText: "", image: "", imageMobile: "", items: [] };

const newItem = () => ({ question: "", answer: "" });

export default function FaqEditor({ sectionKey, title }) {
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ImageField
                            label={M.home.labels.image}
                            value={content.image}
                            onChange={(v) => setContent({ ...content, image: v })}
                        />
                        <ImageField
                            label={M.home.labels.imageMobile}
                            value={content.imageMobile}
                            onChange={(v) => setContent({ ...content, imageMobile: v })}
                            hint={M.home.labels.imageMobileHint}
                        />
                    </div>

                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title={M.home.labels.items}
                        itemLabel={(i, it) => `Q${i + 1}${it?.question ? ` — ${it.question.slice(0, 40)}` : ""}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <TextField label={M.home.labels.question} value={item.question} onChange={(v) => update({ question: v })} />
                                <TextField label={M.home.labels.answer} value={item.answer} onChange={(v) => update({ answer: v })} textarea />
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
