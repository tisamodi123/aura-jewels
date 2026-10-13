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
    subTitle: "",
    image: "",
    imageMobile: "",
    redirect: { type: "direct", url: "" },
});

export default function ChaptersOfLightEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <div className="space-y-6">
                    <div className="bg-zinc-50 p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm text-zinc-800">Section Info</h3>
                        <TextField
                            label="Heading"
                            value={content.heading || ""}
                            onChange={(v) => setContent({ ...content, heading: v })}
                        />
                        <TextField
                            label="Subtext"
                            value={content.subText || ""}
                            onChange={(v) => setContent({ ...content, subText: v })}
                            textarea
                        />
                    </div>

                    <ItemListEditor
                        items={content.items || content.categories || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title="Categories"
                        itemLabel={(i, item) => `Category ${i + 1}${item?.title ? ` — ${item.title}` : ""}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                                    <TextField label="Subtitle" value={item.subTitle} onChange={(v) => update({ subTitle: v })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <ImageField
                                        label={M.home.labels.image}
                                        value={item.image}
                                        onChange={(v) => update({ image: v })}
                                        expectedWidth={395}
                                        expectedHeight={495}
                                    />
                                    <ImageField
                                        label={M.home.labels.imageMobile}
                                        value={item.imageMobile}
                                        onChange={(v) => update({ imageMobile: v })}
                                        hint={M.home.labels.imageMobileHint}
                                        expectedWidth={206}
                                        expectedHeight={258}
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
