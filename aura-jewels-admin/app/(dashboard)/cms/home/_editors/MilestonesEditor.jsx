"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { heading: "", subText: "", brandName: "", items: [] };

const newItem = () => ({ video: "", thumbnail: "" });

export default function MilestonesEditor({ sectionKey, title }) {
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
                    <TextField
                        label={M.home.labels.brandName}
                        value={content.brandName}
                        onChange={(v) => setContent({ ...content, brandName: v })}
                    />

                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title={M.home.labels.items}
                        itemLabel={(i) => `Reel ${i + 1}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <ImageField
                                    label={M.home.labels.video}
                                    value={item.video}
                                    onChange={(v) => update({ video: v })}
                                    accept="video/mp4,video/webm,video/quicktime"
                                />
                                <ImageField
                                    label={M.home.labels.thumbnail}
                                    value={item.thumbnail}
                                    onChange={(v) => update({ thumbnail: v })}
                                />
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
