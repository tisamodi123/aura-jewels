"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { 
    subTitle: "", 
    heading: "", 
    items: [] 
};

const newItem = () => ({ 
    image: "", 
    title: "", 
    description: "", 
    redirect: { type: "direct", url: "" } 
});

export default function FromTheBlogEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <div className="space-y-6">
                    <div className="bg-zinc-50 p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm text-zinc-800">Section Header</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField 
                                label="Subtitle (e.g., FROM THE BLOG)" 
                                value={content.subTitle || ""} 
                                onChange={(v) => setContent({ ...content, subTitle: v })} 
                            />
                            <TextField 
                                label="Heading (e.g., Insights, Inspirations & Stories...)" 
                                value={content.heading || ""} 
                                onChange={(v) => setContent({ ...content, heading: v })} 
                            />
                        </div>
                    </div>

                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title="Blog Cards"
                        itemLabel={(i, it) => `Blog Card ${i + 1}${it?.title ? ` — ${it.title}` : ""}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-4 p-4 border rounded-md bg-white">
                                <ImageField 
                                    label="Thumbnail Image" 
                                    value={item.image || ""} 
                                    onChange={(v) => update({ image: v })} 
                                />
                                <TextField 
                                    label="Title (e.g., Our Story In Motion)" 
                                    value={item.title || ""} 
                                    onChange={(v) => update({ title: v })} 
                                />
                                <TextField 
                                    label="Description (e.g., Our Story In Motion captures...)" 
                                    value={item.description || ""} 
                                    onChange={(v) => update({ description: v })} 
                                    textarea 
                                />
                                <div className="pt-2">
                                    <label className="block text-sm font-medium mb-1">Read More Link</label>
                                    <RedirectPicker 
                                        value={item.redirect || { type: "direct", url: "" }} 
                                        onChange={(redirect) => update({ redirect })} 
                                    />
                                </div>
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
