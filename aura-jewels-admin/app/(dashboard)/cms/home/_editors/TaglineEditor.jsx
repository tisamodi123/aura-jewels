"use client";

import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ItemListEditor from "../_components/ItemListEditor";

// Tagline marquee items are strings — wrap/unwrap for the array editor.
const defaults = { items: [] };

export default function TaglineEditor({ sectionKey, title }) {
    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => {
                const wrapped = (content.items || []).map((v) => ({ value: v }));
                const onChange = (arr) => setContent({ ...content, items: arr.map((it) => it.value || "") });

                return (
                    <ItemListEditor
                        items={wrapped}
                        onChange={onChange}
                        createItem={() => ({ value: "" })}
                        title={M.home.labels.items}
                        itemLabel={(i, it) => `#${i + 1}${it?.value ? ` — ${it.value}` : ""}`}
                        renderItem={({ item, update }) => (
                            <TextField
                                label={M.home.labels.text}
                                value={item.value}
                                onChange={(v) => update({ value: v })}
                            />
                        )}
                    />
                );
            }}
        />
    );
}
