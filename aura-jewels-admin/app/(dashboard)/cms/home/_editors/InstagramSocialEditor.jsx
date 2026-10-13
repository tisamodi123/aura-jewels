"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { heading: "", subText: "", items: [] };

const newItem = () => ({
    image: "",
    link: "", // Usually an instagram post URL
});

export default function InstagramSocialEditor({ sectionKey, title }) {
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <TextField 
                                label="Button Text" 
                                value={content.ctaText || ""} 
                                onChange={(v) => setContent({ ...content, ctaText: v })} 
                            />
                            <TextField 
                                label="Button Link" 
                                value={content.ctaLink || ""} 
                                onChange={(v) => setContent({ ...content, ctaLink: v })} 
                            />
                        </div>
                    </div>
                    
                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title="Instagram Posts"
                        itemLabel={(i, item) => `Post ${i + 1}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <ImageField label={M.home.labels.image} value={item.image} onChange={(v) => update({ image: v })} />
                                <TextField label="Instagram URL" value={item.link} onChange={(v) => update({ link: v })} />
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
