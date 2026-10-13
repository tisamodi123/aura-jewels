"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";

const defaults = {
    label: "",
    heading: "",
    desc: "",
    image: "",
    imageMobile: "",
    ctaText: "",
    redirect: { type: "direct", url: "" },
};

export default function InfiniteEleganceEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <div className="space-y-4">
                    <TextField label={M.home.labels.label} value={content.label} onChange={(v) => setContent({ ...content, label: v })} />
                    <TextField label={M.home.labels.heading} value={content.heading} onChange={(v) => setContent({ ...content, heading: v })} />
                    <TextField label={M.home.labels.description} value={content.desc} onChange={(v) => setContent({ ...content, desc: v })} textarea />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ImageField label={M.home.labels.image} value={content.image} onChange={(v) => setContent({ ...content, image: v })} />
                        <ImageField
                            label={M.home.labels.imageMobile}
                            value={content.imageMobile}
                            onChange={(v) => setContent({ ...content, imageMobile: v })}
                            hint={M.home.labels.imageMobileHint}
                        />
                    </div>
                    <TextField label={M.home.labels.ctaText} value={content.ctaText} onChange={(v) => setContent({ ...content, ctaText: v })} />
                    <RedirectPicker value={content.redirect} onChange={(redirect) => setContent({ ...content, redirect })} />
                </div>
            )}
        />
    );
}
