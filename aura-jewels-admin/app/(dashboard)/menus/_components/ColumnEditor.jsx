"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import FilePicker from "@/components/FilePicker";
import { MENU_COLUMN_LAYOUT } from "@/lib/Constant";
import RedirectPicker from "./RedirectPicker";
import LazyInput from "./LazyInput";
import { uid, moveByUid } from "./treeUtil";

const fieldCls =
    "w-full px-3 py-2 border text-[0.8rem] text-zinc-900 bg-white border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500";
const iconBtn = "p-1 rounded border border-[#E4E8EE] bg-white hover:bg-zinc-100 disabled:opacity-40";

const newLink = () => ({ _uid: uid(), label: "", redirect: { type: "none" }, image: "" });
const newGroup = () => ({ _uid: uid(), label: "", hex: "", redirect: { type: "none" }, options: [] });
const newOption = () => ({ _uid: uid(), label: "", redirect: { type: "none" } });

// onChange(columnUid, updater), onRemove(columnUid), onMove(columnUid, dir)
function ColumnEditor({ column, onChange, onRemove, onMove, canUp, canDown }) {
    const id = column._uid;
    const layout = column.layout || MENU_COLUMN_LAYOUT.LINKS;
    const patch = (p) => onChange(id, (c) => ({ ...c, ...p }));
    const setLinks = (fn) => onChange(id, (c) => ({ ...c, links: fn(c.links || []) }));
    const setGroups = (fn) => onChange(id, (c) => ({ ...c, groups: fn(c.groups || []) }));

    const links = column.links || [];
    const groups = column.groups || [];

    return (
        <div className="border border-[#E4E8EE] rounded-lg p-3 bg-white space-y-3">
            <div className="flex items-center gap-2">
                <LazyInput className={fieldCls + " flex-1"} placeholder="Column title (e.g. Shop By Style)"
                    value={column.title || ""} onCommit={(v) => patch({ title: v })} />
                <button type="button" className={iconBtn} disabled={!canUp} onClick={() => onMove(id, -1)}><ChevronUp size={15} /></button>
                <button type="button" className={iconBtn} disabled={!canDown} onClick={() => onMove(id, 1)}><ChevronDown size={15} /></button>
                <button type="button" className={iconBtn} onClick={() => onRemove(id)}><X size={15} /></button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-[0.72rem] text-zinc-500">Layout:</span>
                {[
                    { key: MENU_COLUMN_LAYOUT.LINKS, label: "Links" },
                    { key: MENU_COLUMN_LAYOUT.GROUPED, label: "Grouped (swatch)" },
                ].map((opt) => (
                    <button type="button" key={opt.key} onClick={() => patch({ layout: opt.key })}
                        className={`text-[0.72rem] px-2.5 py-1 rounded-full border ${layout === opt.key ? "bg-black text-white border-black" : "bg-white border-[#E4E8EE] text-zinc-700"}`}>
                        {opt.label}
                    </button>
                ))}
            </div>

            {layout === MENU_COLUMN_LAYOUT.LINKS && (
                <div className="space-y-3">
                    {links.map((l, i) => (
                        <div key={l._uid} className="border border-dashed border-[#E4E8EE] rounded-md p-2.5 space-y-2">
                            <div className="flex items-center gap-2">
                                <LazyInput className={fieldCls + " flex-1"} placeholder="Link label"
                                    value={l.label || ""} onCommit={(v) => setLinks((arr) => arr.map((x) => (x._uid === l._uid ? { ...x, label: v } : x)))} />
                                <button type="button" className={iconBtn} disabled={i === 0} onClick={() => setLinks((arr) => moveByUid(arr, l._uid, -1))}><ChevronUp size={14} /></button>
                                <button type="button" className={iconBtn} disabled={i === links.length - 1} onClick={() => setLinks((arr) => moveByUid(arr, l._uid, 1))}><ChevronDown size={14} /></button>
                                <button type="button" className={iconBtn} onClick={() => setLinks((arr) => arr.filter((x) => x._uid !== l._uid))}><X size={14} /></button>
                            </div>
                            <FilePicker
                                label="Thumbnail (optional)"
                                value={l.image instanceof File ? l.image : ""}
                                existingUrl={typeof l.image === "string" ? l.image : ""}
                                onChange={(v) => setLinks((arr) => arr.map((x) => (x._uid === l._uid ? { ...x, image: v } : x)))}
                                resetKey={`link-${l._uid}`}
                            />
                            <RedirectPicker value={l.redirect} onChange={(redirect) => setLinks((arr) => arr.map((x) => (x._uid === l._uid ? { ...x, redirect } : x)))} />
                        </div>
                    ))}
                    <button type="button" onClick={() => setLinks((arr) => [...arr, newLink()])} className="flex items-center gap-1 text-[0.75rem] text-blue-600 hover:underline">
                        <Plus size={14} /> Add link
                    </button>
                </div>
            )}

            {layout === MENU_COLUMN_LAYOUT.GROUPED && (
                <div className="space-y-3">
                    {groups.map((g, i) => {
                        const opts = g.options || [];
                        const setOpts = (fn) => setGroups((arr) => arr.map((x) => (x._uid === g._uid ? { ...x, options: fn(x.options || []) } : x)));
                        const patchGroup = (p) => setGroups((arr) => arr.map((x) => (x._uid === g._uid ? { ...x, ...p } : x)));
                        return (
                            <div key={g._uid} className="border border-dashed border-[#E4E8EE] rounded-md p-2.5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <LazyInput className={fieldCls + " flex-1"} placeholder="Group label (e.g. Yellow Gold)"
                                        value={g.label || ""} onCommit={(v) => patchGroup({ label: v })} />
                                    <input type="color" className="h-8 w-9 rounded border border-[#E4E8EE]"
                                        value={g.hex || "#cccccc"} onChange={(e) => patchGroup({ hex: e.target.value })} title="Swatch colour" />
                                    <button type="button" className={iconBtn} disabled={i === 0} onClick={() => setGroups((arr) => moveByUid(arr, g._uid, -1))}><ChevronUp size={14} /></button>
                                    <button type="button" className={iconBtn} disabled={i === groups.length - 1} onClick={() => setGroups((arr) => moveByUid(arr, g._uid, 1))}><ChevronDown size={14} /></button>
                                    <button type="button" className={iconBtn} onClick={() => setGroups((arr) => arr.filter((x) => x._uid !== g._uid))}><X size={14} /></button>
                                </div>
                                <RedirectPicker label="Group destination (optional)" value={g.redirect} onChange={(redirect) => patchGroup({ redirect })} />
                                <div className="pl-3 border-l-2 border-zinc-100 space-y-2">
                                    <div className="text-[0.7rem] font-semibold text-zinc-500">Options</div>
                                    {opts.map((o, oi) => (
                                        <div key={o._uid} className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <LazyInput className={fieldCls + " flex-1"} placeholder="Option label (e.g. 18K)"
                                                    value={o.label || ""} onCommit={(v) => setOpts((arr) => arr.map((x) => (x._uid === o._uid ? { ...x, label: v } : x)))} />
                                                <button type="button" className={iconBtn} disabled={oi === 0} onClick={() => setOpts((arr) => moveByUid(arr, o._uid, -1))}><ChevronUp size={13} /></button>
                                                <button type="button" className={iconBtn} disabled={oi === opts.length - 1} onClick={() => setOpts((arr) => moveByUid(arr, o._uid, 1))}><ChevronDown size={13} /></button>
                                                <button type="button" className={iconBtn} onClick={() => setOpts((arr) => arr.filter((x) => x._uid !== o._uid))}><X size={13} /></button>
                                            </div>
                                            <RedirectPicker value={o.redirect} onChange={(redirect) => setOpts((arr) => arr.map((x) => (x._uid === o._uid ? { ...x, redirect } : x)))} />
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setOpts((arr) => [...arr, newOption()])}
                                        className="flex items-center gap-1 text-[0.72rem] text-blue-600 hover:underline">
                                        <Plus size={13} /> Add option
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <button type="button" onClick={() => setGroups((arr) => [...arr, newGroup()])} className="flex items-center gap-1 text-[0.75rem] text-blue-600 hover:underline">
                        <Plus size={14} /> Add group
                    </button>
                </div>
            )}
        </div>
    );
}

export default memo(ColumnEditor);
