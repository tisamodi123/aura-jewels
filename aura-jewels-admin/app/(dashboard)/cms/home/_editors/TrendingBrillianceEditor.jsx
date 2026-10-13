"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";

const defaults = { heading: "", subText: "", tags: [] };

export default function TrendingBrillianceEditor({ sectionKey, title }) {
    const token = getToken();
    const [availableTags, setAvailableTags] = useState([]);

    useEffect(() => {
        callApi(API_URL.GET_TAGS, "GET", null, token)
            .then((res) => {
                if ((res.status === 200 || res.errorCode === 200) && res.data) {
                    setAvailableTags(res.data);
                }
            })
            .catch(() => { });
    }, [token]);

    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => {
                const selectedTags = content.tags || [];

                const toggleTag = (id) => {
                    const next = selectedTags.includes(id)
                        ? selectedTags.filter((x) => x !== id)
                        : [...selectedTags, id];
                    setContent({ ...content, tags: next });
                };

                return (
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
                        </div>

                        <div className="bg-zinc-50 p-4 border rounded-md space-y-4">
                            <h3 className="font-semibold text-sm text-zinc-800">Tabs (Tags)</h3>
                            <p className="text-xs text-zinc-500">
                                Select the tags you want to display as product tabs on the homepage.
                            </p>
                            {availableTags.length === 0 ? (
                                <div className="text-xs text-zinc-400 border border-dashed rounded-md py-4 text-center">
                                    No active tags found.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map((tag) => {
                                        const id = String(tag._id);
                                        const selected = selectedTags.includes(id);
                                        return (
                                            <button
                                                type="button"
                                                key={id}
                                                onClick={() => toggleTag(id)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-500"
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );
}
