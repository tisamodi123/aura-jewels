"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { 
    heading: "", 
    subText: "", 
    ctaText: "", 
    redirect: { type: "direct", url: "" }, 
    items: [] 
};

const newItem = () => ({
    title: "",
    subTitle: "",
    description: "",
    image: "",
    imageMobile: "",
    ctaText: "",
    redirect: { type: "direct", url: "" },
});

export default function CollectionsOfNoteEditor({ sectionKey, title }) {
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
                        <div className="border-t pt-4 mt-4 space-y-4">
                            <h4 className="font-medium text-xs text-zinc-700">Section Button</h4>
                            <TextField 
                                label="Button Text" 
                                value={content.ctaText || ""} 
                                onChange={(v) => setContent({ ...content, ctaText: v })} 
                            />
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Button Link</label>
                                <RedirectPicker 
                                    value={content.redirect || { type: "direct", url: "" }} 
                                    onChange={(redirect) => setContent({ ...content, redirect })} 
                                />
                            </div>
                        </div>
                    </div>
                    
                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title="Collections"
                        itemLabel={(i, item) => `Collection ${i + 1}${item?.title ? ` — ${item.title}` : ""}`}
                        renderItem={({ item, update, index }) => {
                            const isLeft = index === 0;
                            const desktopW = isLeft ? 745 : 745;
                            const desktopH = isLeft ? 600 : 300;
                            const mobileW = isLeft ? 366 : 366;
                            const mobileH = isLeft ? 430 : 230;

                            return (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} />
                                        <TextField label="Subtitle" value={item.subTitle} onChange={(v) => update({ subTitle: v })} />
                                    </div>
                                    <TextField label="Description" value={item.description} onChange={(v) => update({ description: v })} textarea />
                                    <TextField label="Button Text" value={item.ctaText} onChange={(v) => update({ ctaText: v })} />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <ImageField 
                                            label="Image (Desktop)" 
                                            value={item.image} 
                                            onChange={(v) => update({ image: v })} 
                                        />
                                        <ImageField 
                                            label="Image (Mobile)" 
                                            value={item.imageMobile} 
                                            onChange={(v) => update({ imageMobile: v })} 
                                        />
                                    </div>

                                    <RedirectPicker value={item.redirect} onChange={(redirect) => update({ redirect })} />
                                </div>
                            );
                        }}
                    />
                </div>
            )}
        />
    );
}
