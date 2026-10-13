"use client";

import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import { M } from "@/lib/messages";

// Generic editor for an array of items (slides, cards, faqs, etc).
// `renderItem({ item, update, index })` returns the inline form for one item.
export default function ItemListEditor({
    items = [],
    onChange,
    createItem,
    renderItem,
    title = M.home.labels.items,
    itemLabel = (index) => `#${index + 1}`,
}) {
    const update = (index, patch) => {
        const next = items.slice();
        next[index] = { ...next[index], ...patch };
        onChange(next);
    };

    const remove = (index) => {
        const next = items.slice();
        next.splice(index, 1);
        onChange(next);
    };

    const add = () => {
        onChange([...items, createItem ? createItem() : {}]);
    };

    const move = (index, dir) => {
        const target = index + dir;
        if (target < 0 || target >= items.length) return;
        const next = items.slice();
        const tmp = next[index];
        next[index] = next[target];
        next[target] = tmp;
        onChange(next);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="text-[0.85rem] font-semibold">{title}</div>
                <button
                    type="button"
                    onClick={add}
                    className="flex items-center gap-1 text-[0.75rem] px-3 py-1 rounded-md bg-black text-white"
                >
                    <Plus size={14} /> {M.home.labels.addItem}
                </button>
            </div>

            <div className="space-y-4">
                {items.length === 0 && (
                    <div className="text-[0.8rem] text-zinc-500 border border-dashed rounded-md py-4 text-center">
                        {M.common.noData}
                    </div>
                )}
                {items.map((item, index) => (
                    <div key={index} className="border border-[#E4E8EE] rounded-md p-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[0.8rem] font-semibold text-zinc-700">
                                {itemLabel(index, item)}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => move(index, -1)}
                                    disabled={index === 0}
                                    className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30"
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(index, 1)}
                                    disabled={index === items.length - 1}
                                    className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30"
                                >
                                    <ChevronDown size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-1 rounded hover:bg-red-50 text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        {renderItem({ item, update: (patch) => update(index, patch), index })}
                    </div>
                ))}
            </div>
        </div>
    );
}
