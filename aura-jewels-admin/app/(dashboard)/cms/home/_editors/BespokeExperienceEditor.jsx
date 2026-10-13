"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";

const defaults = { 
    heading: "", 
    subText: "", 
    image: "", 
    ctaText: "", 
    redirect: { type: "direct", url: "" },
    ctaText2: "",
    redirect2: { type: "direct", url: "" }
};

export default function BespokeExperienceEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <div className="space-y-6">
                    <div className="bg-zinc-50 p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm text-zinc-800">Bespoke Experience Content</h3>
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
                        <TextField 
                            label="Description" 
                            value={content.description || ""} 
                            onChange={(v) => setContent({ ...content, description: v })} 
                            textarea 
                        />
                        
                        <div className="border-t pt-4 mt-4 space-y-4">
                            <h4 className="font-medium text-xs text-zinc-700">Primary Button</h4>
                            <TextField 
                                label="Button Text 1" 
                                value={content.ctaText || ""} 
                                onChange={(v) => setContent({ ...content, ctaText: v })} 
                            />
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Button Link 1</label>
                                <RedirectPicker 
                                    value={content.redirect || { type: "direct", url: "" }} 
                                    onChange={(redirect) => setContent({ ...content, redirect })} 
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4 space-y-4">
                            <h4 className="font-medium text-xs text-zinc-700">Secondary Button</h4>
                            <TextField 
                                label="Button Text 2" 
                                value={content.ctaText2 || ""} 
                                onChange={(v) => setContent({ ...content, ctaText2: v })} 
                            />
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Button Link 2</label>
                                <RedirectPicker 
                                    value={content.redirect2 || { type: "direct", url: "" }} 
                                    onChange={(redirect2) => setContent({ ...content, redirect2 })} 
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <ImageField 
                                label="Image" 
                                value={content.image || ""} 
                                onChange={(v) => setContent({ ...content, image: v })} 
                            />
                        </div>
                    </div>
                </div>
            )}
        />
    );
}
