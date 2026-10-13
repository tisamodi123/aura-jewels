"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import VideoField from "../_components/VideoField";
import RedirectPicker from "../_components/RedirectPicker";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { 
    subTitle: "", 
    heading: "", 
    items: [] 
};

const newItem = () => ({ 
    image: "", 
    video: "",
    redirect: { type: "direct", url: "" } 
});

export default function EndlessMemoriesEditor({ sectionKey, title }) {
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
                                label="Subtitle (e.g., ENDLESS MEMORIES)" 
                                value={content.subTitle || ""} 
                                onChange={(v) => setContent({ ...content, subTitle: v })} 
                            />
                            <TextField 
                                label="Heading (e.g., Make Every Moment Unforgettable...)" 
                                value={content.heading || ""} 
                                onChange={(v) => setContent({ ...content, heading: v })} 
                            />
                        </div>
                    </div>

                    <ItemListEditor
                        items={content.items || []}
                        onChange={(items) => setContent({ ...content, items })}
                        createItem={newItem}
                        title="Video Cards"
                        itemLabel={(i, it) => `Video Card ${i + 1}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-4 p-4 border rounded-md bg-white">
                                <VideoField 
                                    label="Upload Video" 
                                    value={item.video || ""} 
                                    onChange={(v) => update({ video: v })} 
                                />
                                <ImageField 
                                    label="Video Thumbnail Image" 
                                    value={item.image || ""} 
                                    onChange={(v) => update({ image: v })} 
                                />
                                <div className="pt-2">
                                    <label className="block text-sm font-medium mb-1">Play Button Redirect (Link to Video/Reel)</label>
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

