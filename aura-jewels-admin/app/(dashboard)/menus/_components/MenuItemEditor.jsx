"use client";

import { memo, useCallback } from "react";
import { ChevronRight, ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import FilePicker from "@/components/FilePicker";
import RedirectPicker from "./RedirectPicker";
import ColumnEditor from "./ColumnEditor";
import LazyInput from "./LazyInput";
import { uid, moveByUid } from "./treeUtil";

const fieldCls =
    "w-full px-3 py-2 border text-[0.8rem] text-zinc-900 bg-white border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500";
const iconBtn = "p-1.5 rounded border border-[#E4E8EE] bg-white hover:bg-zinc-100 disabled:opacity-40";

const newColumn = () => ({ _uid: uid(), title: "New column", layout: "links", links: [], groups: [] });
const newCard = () => ({ _uid: uid(), image: "", imageMobile: "", title: "", subtitle: "", ctaText: "", redirect: { type: "none" } });

function MenuItemEditor({ item, index, total, isOpen, onToggle, update, remove, move }) {
    const id = item._uid;

    // Top-level field patches.
    const patch = useCallback((p) => update(id, (it) => ({ ...it, ...p })), [update, id]);

    // Column ops — stable across item re-renders (memoised ColumnEditors).
    const changeColumn = useCallback((colId, updater) => {
        update(id, (it) => ({ ...it, columns: it.columns.map((c) => (c._uid === colId ? updater(c) : c)) }));
    }, [update, id]);
    const removeColumn = useCallback((colId) => {
        update(id, (it) => ({ ...it, columns: it.columns.filter((c) => c._uid !== colId) }));
    }, [update, id]);
    const moveColumn = useCallback((colId, dir) => {
        update(id, (it) => ({ ...it, columns: moveByUid(it.columns, colId, dir) }));
    }, [update, id]);
    const addColumn = () => update(id, (it) => ({ ...it, columns: [...(it.columns || []), newColumn()] }));

    // Featured card ops.
    const patchCard = (cardId, p) =>
        update(id, (it) => ({ ...it, featuredCards: it.featuredCards.map((c) => (c._uid === cardId ? { ...c, ...p } : c)) }));
    const moveCard = (cardId, dir) => update(id, (it) => ({ ...it, featuredCards: moveByUid(it.featuredCards, cardId, dir) }));
    const removeCard = (cardId) => update(id, (it) => ({ ...it, featuredCards: it.featuredCards.filter((c) => c._uid !== cardId) }));
    const addCard = () => update(id, (it) => ({ ...it, featuredCards: [...(it.featuredCards || []), newCard()] }));

    const columns = item.columns || [];
    const cards = item.featuredCards || [];
    const summary = `${columns.length} column${columns.length !== 1 ? "s" : ""}${cards.length ? ` · ${cards.length} card${cards.length !== 1 ? "s" : ""}` : ""}`;

    return (
        <div className="border border-[#E4E8EE] rounded-xl bg-white overflow-hidden">
            {/* Collapsed header row — always rendered */}
            <div className={`flex items-center gap-2 px-3 py-2 ${isOpen ? "border-b border-[#E4E8EE] bg-zinc-50/60" : ""}`}>
                <button type="button" onClick={() => onToggle(id)} className="p-1 text-zinc-500 hover:text-zinc-800">
                    <ChevronRight size={16} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                <LazyInput
                    className={fieldCls + " flex-1 font-semibold"}
                    placeholder="Top-level label (e.g. Rings)"
                    value={item.label || ""}
                    onCommit={(v) => patch({ label: v })}
                />
                {!isOpen && <span className="text-[0.72rem] text-zinc-400 whitespace-nowrap hidden sm:inline">{summary}</span>}
                <label className="flex items-center gap-1 text-[0.72rem] text-zinc-600 whitespace-nowrap">
                    <input type="checkbox" checked={item.isActive !== false} onChange={(e) => patch({ isActive: e.target.checked })} />
                    Active
                </label>
                <label className="flex items-center gap-1 text-[0.72rem] text-zinc-600 whitespace-nowrap">
                    <input type="checkbox" checked={item.hasMegaMenu !== false} onChange={(e) => patch({ hasMegaMenu: e.target.checked })} />
                    Mega
                </label>
                <button type="button" className={iconBtn} disabled={index === 0} onClick={() => move(id, -1)}><ChevronUp size={15} /></button>
                <button type="button" className={iconBtn} disabled={index === total - 1} onClick={() => move(id, 1)}><ChevronDown size={15} /></button>
                <button type="button" className={iconBtn} onClick={() => remove(id)}><X size={15} /></button>
            </div>

            {/* Body — only mounted when expanded (keeps the page fast) */}
            {isOpen && (
                <div className="p-4 space-y-4 bg-zinc-50/40">
                    <RedirectPicker label="Top-level link destination (when clicked)" value={item.redirect} onChange={(redirect) => patch({ redirect })} />

                    {item.hasMegaMenu !== false && (
                        <>
                            <div className="space-y-3">
                                <div className="text-[0.78rem] font-semibold text-zinc-700">Mega-menu columns</div>
                                {columns.map((col, i) => (
                                    <ColumnEditor
                                        key={col._uid}
                                        column={col}
                                        canUp={i > 0}
                                        canDown={i < columns.length - 1}
                                        onChange={changeColumn}
                                        onRemove={removeColumn}
                                        onMove={moveColumn}
                                    />
                                ))}
                                <button type="button" onClick={addColumn} className="flex items-center gap-1 text-[0.78rem] text-blue-600 hover:underline">
                                    <Plus size={14} /> Add column
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[0.78rem] font-semibold text-zinc-700">Featured cards (right side)</div>
                                {cards.map((c, i) => (
                                    <div key={c._uid} className="border border-[#E4E8EE] rounded-lg p-3 bg-white space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[0.72rem] font-semibold text-zinc-500">Card {i + 1}</span>
                                            <div className="flex gap-1">
                                                <button type="button" className={iconBtn} disabled={i === 0} onClick={() => moveCard(c._uid, -1)}><ChevronUp size={14} /></button>
                                                <button type="button" className={iconBtn} disabled={i === cards.length - 1} onClick={() => moveCard(c._uid, 1)}><ChevronDown size={14} /></button>
                                                <button type="button" className={iconBtn} onClick={() => removeCard(c._uid)}><X size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <FilePicker label="Image (desktop)" value={c.image instanceof File ? c.image : ""}
                                                existingUrl={typeof c.image === "string" ? c.image : ""} onChange={(v) => patchCard(c._uid, { image: v })} resetKey={`card-${c._uid}-d`} />
                                            <FilePicker label="Image (mobile)" value={c.imageMobile instanceof File ? c.imageMobile : ""}
                                                existingUrl={typeof c.imageMobile === "string" ? c.imageMobile : ""} onChange={(v) => patchCard(c._uid, { imageMobile: v })} resetKey={`card-${c._uid}-m`} />
                                        </div>
                                        <LazyInput className={fieldCls} placeholder="Title" value={c.title || ""} onCommit={(v) => patchCard(c._uid, { title: v })} />
                                        <LazyInput className={fieldCls} placeholder="Subtitle" value={c.subtitle || ""} onCommit={(v) => patchCard(c._uid, { subtitle: v })} />
                                        <LazyInput className={fieldCls} placeholder="CTA text (e.g. Explore)" value={c.ctaText || ""} onCommit={(v) => patchCard(c._uid, { ctaText: v })} />
                                        <RedirectPicker value={c.redirect} onChange={(redirect) => patchCard(c._uid, { redirect })} />
                                    </div>
                                ))}
                                <button type="button" onClick={addCard} className="flex items-center gap-1 text-[0.78rem] text-blue-600 hover:underline">
                                    <Plus size={14} /> Add featured card
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Only re-render an item when its own data / open-state changes — editing one
// item never re-renders the others.
export default memo(MenuItemEditor);
