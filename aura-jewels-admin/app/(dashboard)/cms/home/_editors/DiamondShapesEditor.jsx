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
    redirect: { type: "direct", url: "" },
});

export default function DiamondShapesEditor({ sectionKey, title }) {
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
                        />
                    </div>
                    
                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title="Shapes"
                        itemLabel={(i, item) => `Shape ${i + 1}${item?.title ? ` — ${item.title}` : ""}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <TextField label="Title (e.g. Round, Oval)" value={item.title} onChange={(v) => update({ title: v })} />
                                <ImageField 
                                    label="Shape Image" 
                                    value={item.image} 
                                    onChange={(v) => update({ image: v })} 
                                />
                                <RedirectPicker value={item.redirect} onChange={(redirect) => update({ redirect })} />
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
