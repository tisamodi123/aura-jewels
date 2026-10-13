"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";
import ItemListEditor from "../_components/ItemListEditor";

const defaults = { slides: [] };

const newSlide = () => ({
    label: "",
    headingLine1: "",
    headingLine2: "",
    desc: "",
    image: "",
    imageMobile: "",
    ctaText: "",
    redirect: { type: "direct", url: "" },
});

export default function HeroEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <ItemListEditor
                    items={content.slides || []}
                    onChange={(slides) => setContent({ ...content, slides })}
                    createItem={newSlide}
                    title={M.home.labels.slides}
                    itemLabel={(i, item) => `Slide ${i + 1}${item?.label ? ` — ${item.label}` : ""}`}
                    renderItem={({ item, update }) => (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <TextField label={M.home.labels.label} value={item.label} onChange={(v) => update({ label: v })} />
                                <TextField label={M.home.labels.ctaText} value={item.ctaText} onChange={(v) => update({ ctaText: v })} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <TextField label={M.home.labels.headingLine1} value={item.headingLine1} onChange={(v) => update({ headingLine1: v })} />
                                <TextField label={M.home.labels.headingLine2} value={item.headingLine2} onChange={(v) => update({ headingLine2: v })} />
                            </div>
                            <TextField label={M.home.labels.description} value={item.desc} onChange={(v) => update({ desc: v })} textarea />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <ImageField
                                    label={M.home.labels.image}
                                    value={item.image}
                                    onChange={(v) => update({ image: v })}
                                    expectedWidth={1585}
                                    expectedHeight={618}
                                />
                                <ImageField
                                    label={M.home.labels.imageMobile}
                                    value={item.imageMobile}
                                    onChange={(v) => update({ imageMobile: v })}
                                    hint={M.home.labels.imageMobileHint}
                                    expectedWidth={375}
                                    expectedHeight={468}
                                />
                            </div>
                            <RedirectPicker value={item.redirect} onChange={(redirect) => update({ redirect })} />
                        </div>
                    )}
                />
            )}
        />
    );
}
