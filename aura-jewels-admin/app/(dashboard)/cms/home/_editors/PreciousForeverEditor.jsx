"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";

const defaults = { 
    subTitle: "", 
    heading: "", 
    placeholderText: "", 
    ctaText: "", 
    image: "", 
    imageMobile: "", 
    redirect: { type: "direct", url: "" } 
};

export default function PreciousForeverEditor({ sectionKey, title }) {
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
                                label="Subtitle (e.g., NEAR BY STORE)" 
                                value={content.subTitle || ""} 
                                onChange={(v) => setContent({ ...content, subTitle: v })} 
                            />
                            <TextField 
                                label="Heading (e.g., Experience Luxury And Elegance...)" 
                                value={content.heading || ""} 
                                onChange={(v) => setContent({ ...content, heading: v })} 
                            />
                        </div>

                        <TextField 
                            label="Search Input Placeholder (e.g., Enter Pincode or city)" 
                            value={content.placeholderText || ""} 
                            onChange={(v) => setContent({ ...content, placeholderText: v })} 
                        />
                        
                        <TextField 
                            label="Button Text (e.g., View All Stores)" 
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
