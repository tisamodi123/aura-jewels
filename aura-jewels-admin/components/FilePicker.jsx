"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ASSET_URL, API_BASE_URL } from "@/lib/APIUrl";
import { X, UploadCloud } from "lucide-react";
import { toast } from "sonner";

// Reusable file picker with preview. Works in two modes:
//
//   1. Single:   value = File | string (URL of existing image) | "" | null
//                onChange(File | "")
//
//   2. Multiple: value = (File | string)[]
//                onChange(Array<File | string>)
//
// String values are treated as previously uploaded URLs and rendered via
// `resolveSrc`. File objects get short-lived blob URLs that are revoked on
// unmount or replacement, so the component never leaks blob memory.
//
// `existingUrl` (single) / `existingUrls` (multi) are convenience props for
// edit screens that hold a "previous image" reference separately from the
// pending File object — when the user hasn't picked a new file, the previous
// image is still shown.
//
// Set `resetKey` (e.g. the row id) to force-clear the internal preview when
// the parent reuses the picker across different records — solves the
// "edit shows previous selection" leak.

// Server returns image paths as relative `uploads/...` strings — we need
// to prepend the API host to render them. Prefer `ASSET_URL` if the
// environment defines one, otherwise fall back to `API_BASE_URL` (which
// already points at the API host). Without the fallback, an unset
// `ASSET_URL` makes the browser request the path from the admin host,
// returning 404 for every preview.
const resolveSrc = (val) => {
    if (!val) return "";
    if (typeof val !== "string") return "";
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    if (val.startsWith("blob:") || val.startsWith("data:")) return val;
    const host = (ASSET_URL || API_BASE_URL || "").replace(/\/+$/, "");
    const clean = val.startsWith("/") ? val.slice(1) : val;
    return host ? `${host}/${clean}` : `/${clean}`;
};

const buildPreviewSrc = (entry, blobMap) => {
    if (!entry) return "";
    if (typeof entry === "string") return resolveSrc(entry);
    if (entry instanceof File) {
        const existing = blobMap.get(entry);
        if (existing) return existing;
        const url = URL.createObjectURL(entry);
        blobMap.set(entry, url);
        return url;
    }
    return "";
};

export default function FilePicker({
    label,
    hint,
    value,
    onChange,
    existingUrl,
    existingUrls,
    multiple = false,
    accept = "image/*",
    maxFiles = 10,
    disabled = false,
    previewClassName = "",
    resetKey,
    expectedWidth,
    expectedHeight,
}) {
    const inputRef = useRef(null);
    const blobMapRef = useRef(new Map());
    // Internal flag flips when `resetKey` changes so we ignore stale `value`
    // from a previous record until the parent supplies new data. Without it,
    // opening an edit modal could flash the previous record's image briefly.
    const [resetVersion, setResetVersion] = useState(0);

    useEffect(() => {
        if (resetKey !== undefined) setResetVersion((v) => v + 1);
    }, [resetKey]);

    // Revoke every blob URL we've created when the component unmounts or
    // resetKey changes, so the preview never leaks memory.
    useEffect(() => {
        return () => {
            for (const url of blobMapRef.current.values()) {
                URL.revokeObjectURL(url);
            }
            blobMapRef.current.clear();
        };
    }, []);

    useEffect(() => {
        if (resetVersion === 0) return;
        for (const url of blobMapRef.current.values()) {
            URL.revokeObjectURL(url);
        }
        blobMapRef.current.clear();
    }, [resetVersion]);

    // Normalize value/existing into a list for the render layer.
    const entries = useMemo(() => {
        if (multiple) {
            const next = [];
            if (Array.isArray(value)) {
                next.push(...value.filter(Boolean));
            }
            if (Array.isArray(existingUrls)) {
                for (const url of existingUrls) {
                    if (!url) continue;
                    if (!next.some((e) => typeof e === "string" && e === url)) {
                        next.push(url);
                    }
                }
            }
            return next;
        }
        if (value) return [value];
        if (existingUrl) return [existingUrl];
        return [];
    }, [multiple, value, existingUrl, existingUrls]);

    const blobMap = blobMapRef.current;

    const handlePick = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const validFiles = [];
        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                toast.error("Only image files are allowed");
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Each file size must be less than 5MB");
                continue;
            }

            if (expectedWidth || expectedHeight) {
                try {
                    await new Promise((resolve, reject) => {
                        const img = new Image();
                        const objectUrl = URL.createObjectURL(file);
                        img.onload = () => {
                            URL.revokeObjectURL(objectUrl);
                            if (expectedWidth && img.width !== expectedWidth) {
                                reject(`Image width must be exactly ${expectedWidth}px (got ${img.width}px)`);
                            } else if (expectedHeight && img.height !== expectedHeight) {
                                reject(`Image height must be exactly ${expectedHeight}px (got ${img.height}px)`);
                            } else {
                                resolve();
                            }
                        };
                        img.onerror = () => {
                            URL.revokeObjectURL(objectUrl);
                            reject("Invalid image file");
                        };
                        img.src = objectUrl;
                    });
                } catch (errMsg) {
                    toast.error(errMsg);
                    continue;
                }
            }

            validFiles.push(file);
        }

        if (!validFiles.length) {
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        if (multiple) {
            const current = Array.isArray(value) ? value.slice() : [];
            const merged = [...current, ...validFiles].slice(0, maxFiles);
            onChange?.(merged);
        } else {
            onChange?.(validFiles[0]);
        }
        // Allow re-selecting the same file by clearing the native input value.
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleRemove = (index) => {
        if (multiple) {
            const current = Array.isArray(value) ? value.slice() : [];
            const removed = current[index];
            current.splice(index, 1);
            if (removed instanceof File) {
                const url = blobMap.get(removed);
                if (url) {
                    URL.revokeObjectURL(url);
                    blobMap.delete(removed);
                }
            }
            onChange?.(current);
        } else {
            // Single mode — also revoke the staged blob if any.
            if (value instanceof File) {
                const url = blobMap.get(value);
                if (url) {
                    URL.revokeObjectURL(url);
                    blobMap.delete(value);
                }
            }
            onChange?.("");
        }
    };

    let finalHint = hint || "";
    if (expectedWidth && expectedHeight) {
        const resolutionStr = `${expectedWidth}x${expectedHeight}px`;
        if (finalHint) {
            finalHint = `${resolutionStr} - ${finalHint}`;
        } else {
            finalHint = `Required resolution: ${resolutionStr}`;
        }
    }

    return (
        <div>
            {label && (
                <label className="block text-[0.85rem] font-semibold mb-2">{label}</label>
            )}

            {entries.length === 0 ? (
                <button
                    type="button"
                    onClick={handlePick}
                    disabled={disabled}
                    className={`w-full flex flex-col items-center justify-center gap-2 border border-dashed border-[#E4E8EE] rounded-md py-6 px-4 hover:border-zinc-400 hover:bg-zinc-50/60 transition-colors text-[0.8rem] text-[#656B7B] disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                    <UploadCloud size={20} />
                    <span>Click to upload{multiple ? " files" : ""}</span>
                    <span className="text-[0.7rem] text-zinc-400">{finalHint ? `${finalHint} (Max 5MB)` : "Max size: 5MB"}</span>
                </button>
            ) : (
                <div className="space-y-2">
                    <div className={`flex flex-wrap gap-3 ${previewClassName}`}>
                        {entries.map((entry, i) => {
                            const src = buildPreviewSrc(entry, blobMap);
                            return (
                                <div
                                    key={typeof entry === "string" ? `s-${entry}-${i}` : `f-${i}-${entry.name}`}
                                    className="relative w-24 h-24 rounded-md overflow-hidden border border-[#E4E8EE] bg-zinc-50"
                                >
                                    {src && (
                                        <img
                                            src={src}
                                            alt={typeof entry === "string" ? "" : entry.name}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                e.currentTarget.style.opacity = "0.35";
                                            }}
                                        />
                                    )}
                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(i)}
                                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow"
                                            aria-label="Remove"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {multiple && entries.length < maxFiles && !disabled && (
                            <button
                                type="button"
                                onClick={handlePick}
                                className="w-24 h-24 rounded-md border border-dashed border-[#E4E8EE] flex flex-col items-center justify-center text-[0.7rem] text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50/60"
                            >
                                <UploadCloud size={18} />
                                <span>Add</span>
                            </button>
                        )}
                    </div>

                    {!multiple && !disabled && (
                        <button
                            type="button"
                            onClick={handlePick}
                            className="text-[0.7rem] text-zinc-500 underline hover:text-zinc-800"
                        >
                            Change image
                        </button>
                    )}

                    <div className="text-[0.7rem] text-zinc-400">{finalHint ? `${finalHint} (Max 5MB)` : "Max size: 5MB"}</div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}
