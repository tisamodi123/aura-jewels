"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";

// Searchable multi-select: a compact trigger showing the selected values as
// removable chips, opening a type-to-filter checkable dropdown. Same
// value/onChange contract as the old checkbox grid (array of ids).
export default function SearchableMultiSelect({
    label,
    items = [],
    value = [],
    onChange,
    getId,
    getLabel,
    placeholder = "Select…",
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const ref = useRef(null);

    const selected = useMemo(() => new Set((value || []).map(String)), [value]);

    // Close on outside click.
    useEffect(() => {
        if (!open) return;
        const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return items || [];
        return (items || []).filter((it) => String(getLabel(it)).toLowerCase().includes(t));
    }, [items, q, getLabel]);

    const toggle = (id) => {
        const s = String(id);
        onChange(selected.has(s) ? (value || []).filter((v) => String(v) !== s) : [...(value || []), s]);
    };

    const selectedItems = (items || []).filter((it) => selected.has(String(getId(it))));

    return (
        <div ref={ref} className="relative">
            {label && <div className="text-[0.75rem] font-semibold mb-1">{label}</div>}

            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full min-h-[2.25rem] flex flex-wrap items-center gap-1 px-2 py-1.5 border border-[#E4E8EE] rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                {selectedItems.length === 0 && <span className="text-[0.8rem] text-zinc-400">{placeholder}</span>}
                {selectedItems.map((it) => {
                    const id = getId(it);
                    return (
                        <span key={id} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-[0.72rem] px-2 py-0.5 rounded-full">
                            <span className="truncate max-w-[10rem]">{getLabel(it)}</span>
                            <X size={12} className="cursor-pointer hover:text-red-500"
                                onClick={(e) => { e.stopPropagation(); toggle(id); }} />
                        </span>
                    );
                })}
                <ChevronDown size={14} className="ml-auto text-zinc-400 flex-shrink-0" />
            </button>

            {open && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-[#E4E8EE] rounded-md shadow-lg">
                    <div className="flex items-center gap-2 px-2 py-1.5 border-b border-[#E4E8EE]">
                        <Search size={14} className="text-zinc-400 flex-shrink-0" />
                        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
                            className="w-full text-[0.8rem] outline-none bg-transparent" />
                        {selectedItems.length > 0 && (
                            <button type="button" onClick={() => onChange([])} className="text-[0.68rem] text-zinc-400 hover:text-red-500 flex-shrink-0">Clear</button>
                        )}
                    </div>
                    <div className="max-h-56 overflow-auto py-1">
                        {filtered.length === 0 && <div className="px-3 py-2 text-[0.72rem] text-zinc-400">No matches</div>}
                        {filtered.map((it) => {
                            const id = getId(it);
                            const on = selected.has(String(id));
                            return (
                                <button type="button" key={id} onClick={() => toggle(id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[0.8rem] text-left hover:bg-zinc-50">
                                    <span className={`w-4 h-4 flex items-center justify-center rounded border flex-shrink-0 ${on ? "bg-black border-black text-white" : "border-[#E4E8EE]"}`}>
                                        {on && <Check size={12} />}
                                    </span>
                                    <span className="truncate">{getLabel(it)}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
