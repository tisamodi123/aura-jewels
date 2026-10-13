"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import RedirectPicker from "../_components/RedirectPicker";
import ItemListEditor from "../_components/ItemListEditor";
import ProductPicker from "../_components/ProductPicker";

const defaults = {
    heading: "",
    subText: "",
    viewAllText: "",
    viewAllRedirect: { type: "direct", url: "" },
    tabs: [],
};

const newTab = () => ({
    label: "",
    productIds: [],
    // Per-tab CTA shown below the carousel when the tab is active.
    // Hidden on the storefront unless BOTH text and a resolved redirect
    // href are present.
    ctaText: "",
    ctaRedirect: { type: "none" },
});

export default function FeaturedProductsEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <div className="space-y-5">
                    <TextField
                        label={M.home.labels.heading}
                        value={content.heading}
                        onChange={(v) => setContent({ ...content, heading: v })}
                    />
                    <TextField
                        label={M.home.labels.subText}
                        value={content.subText}
                        onChange={(v) => setContent({ ...content, subText: v })}
                        textarea
                    />
                    <TextField
                        label={M.home.labels.viewAllText}
                        value={content.viewAllText}
                        onChange={(v) => setContent({ ...content, viewAllText: v })}
                    />
                    <RedirectPicker
                        label={`${M.home.labels.viewAllText} — ${M.home.labels.redirect}`}
                        value={content.viewAllRedirect}
                        onChange={(viewAllRedirect) => setContent({ ...content, viewAllRedirect })}
                    />

                    <ItemListEditor
                        items={content.tabs || []}
                        onChange={(tabs) => setContent({ ...content, tabs })}
                        createItem={newTab}
                        title={M.home.labels.tabs}
                        itemLabel={(i, it) => `Tab ${i + 1}${it?.label ? ` — ${it.label}` : ""}`}
                        renderItem={({ item, update }) => (
                            <div className="space-y-3">
                                <TextField
                                    label={M.home.labels.tabLabel}
                                    value={item.label}
                                    onChange={(v) => update({ label: v })}
                                />
                                <ProductPicker
                                    label={M.home.labels.products}
                                    value={item.productIds || []}
                                    onChange={(productIds) => update({ productIds })}
                                />
                                {/* Per-tab "Explore the designs" CTA. Both
                                    fields are optional — the storefront hides
                                    the button unless ctaText is non-empty AND
                                    ctaRedirect resolves to a real href. */}
                                <TextField
                                    label="CTA Text (optional)"
                                    value={item.ctaText || ""}
                                    onChange={(v) => update({ ctaText: v })}
                                    placeholder="e.g. Explore the designs"
                                />
                                <RedirectPicker
                                    label="CTA Redirect (optional)"
                                    value={item.ctaRedirect || { type: "none" }}
                                    onChange={(ctaRedirect) => update({ ctaRedirect })}
                                />
                            </div>
                        )}
                    />
                </div>
            )}
        />
    );
}
