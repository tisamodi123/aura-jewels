"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { M } from "@/lib/messages";
import { resolveCmsImage, uploadCmsImage } from "./imageHelpers";

export default function ImageField({ label, value, onChange, hint, accept = "image/*", expectedWidth, expectedHeight }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleChoose = () => {
        if (uploading) return;
        inputRef.current?.click();
    };

    const handleChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed");
            if (inputRef.current) inputRef.current.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            if (inputRef.current) inputRef.current.value = "";
            return;
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
                if (inputRef.current) inputRef.current.value = "";
                return;
            }
        }

        onChange(file);
    };

    const handleClear = () => {
        onChange("");
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
                <label className="block text-[0.80rem] font-semibold mb-2">{label}</label>
            )}
            {value ? (
                <div className="relative w-full h-32 border rounded-md overflow-hidden bg-zinc-50">
                    <img
                        src={resolveCmsImage(value)}
                        alt={label || "preview"}
                        className="object-cover w-full h-full"
                        onError={(e) => { e.currentTarget.style.opacity = "0.3"; }}
                    />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                        {M.common.delete}
                    </button>
                </div>
            ) : (
                <div
                    onClick={handleChoose}
                    className="flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer hover:bg-zinc-50"
                >
                    <div className="text-[#656B7B] text-[0.80rem]">
                        {uploading ? M.common.loading : "Click to upload"}
                    </div>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
            {finalHint ? (
                <div className="text-[#656B7B] text-[0.7rem] mt-1">{finalHint} (Max 5MB)</div>
            ) : (
                <div className="text-[#656B7B] text-[0.7rem] mt-1">Max 5MB</div>
            )}
        </div>
    );
}
