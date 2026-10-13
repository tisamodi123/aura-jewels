"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { heading: "", subText: "", items: [] };

const newItem = () => ({
    title: "",
    image: "",
    imageMobile: "",
    redirect: { type: "list", listOf: "all" },
});

export default function ArtisanCollectionEditor({ sectionKey, title }) {
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
                        itemLabel={(i, it) => `Card ${i + 1}${it?.title ? ` — ${it.title}` : ""}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <TextField label={M.home.labels.heading} value={item.title} onChange={(v) => update({ title: v })} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ImageField label={M.home.labels.image} value={item.image} onChange={(v) => update({ image: v })} />
                                    <ImageField
                                        label={M.home.labels.imageMobile}
                                        value={item.imageMobile}
                                        onChange={(v) => update({ imageMobile: v })}
                                        hint={M.home.labels.imageMobileHint}
                                    />
                                </div>
                                <RedirectPicker value={item.redirect} onChange={(redirect) => update({ redirect })} />
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
