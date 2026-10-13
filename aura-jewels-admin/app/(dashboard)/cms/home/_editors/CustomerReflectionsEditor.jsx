"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";

const defaults = { 
    subTitle: "", 
    heading: "", 
    description: "", 
    ctaText: "", 
    image: "", 
    imageMobile: "", 
    redirect: { type: "direct", url: "" } 
};

export default function CustomerReflectionsEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <div className="space-y-6">
                    <div className="bg-zinc-50 p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm text-zinc-800">Section Content</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField 
                                label="Subtitle (e.g., HERITAGE HEIRLOOMS)" 
                                value={content.subTitle || ""} 
                                onChange={(v) => setContent({ ...content, subTitle: v })} 
                            />
                            <TextField 
                                label="Heading (e.g., Made For The Present...)" 
                                value={content.heading || ""} 
                                onChange={(v) => setContent({ ...content, heading: v })} 
                                textarea
                            />
                        </div>

                        <TextField 
                            label="Description" 
                            value={content.description || ""} 
                            onChange={(v) => setContent({ ...content, description: v })} 
                            textarea 
                        />
                        
                        <TextField 
                            label="Button Text" 
                            value={content.ctaText || ""} 
                            onChange={(v) => setContent({ ...content, ctaText: v })} 
                        />

                        <RedirectPicker 
                            value={content.redirect} 
                            onChange={(redirect) => setContent({ ...content, redirect })} 
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <ImageField 
                                label="Background/Hero Image (Desktop)" 
                                value={content.image || ""} 
                                onChange={(v) => setContent({ ...content, image: v })} 
                            />
                            <ImageField 
                                label="Background/Hero Image (Mobile)" 
                                value={content.imageMobile || ""} 
                                onChange={(v) => setContent({ ...content, imageMobile: v })} 
                                hint={M.home.labels.imageMobileHint}
                            />
                        </div>
                    </div>
                </div>
            )}
        />
    );
}
