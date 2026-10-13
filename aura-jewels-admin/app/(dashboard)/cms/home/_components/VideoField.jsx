"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { M } from "@/lib/messages";
import { resolveCmsImage } from "./imageHelpers";

export default function VideoField({ label, value, onChange, hint, accept = "video/*" }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleChoose = () => {
        if (uploading) return;
        inputRef.current?.click();
    };

    const handleChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("video/")) {
            toast.error("Only video files are allowed");
            if (inputRef.current) inputRef.current.value = "";
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            toast.error("Video size must be less than 50MB");
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        onChange(file);
    };

    const handleClear = () => {
        onChange("");
    };

    let finalHint = hint || "";

    return (
        <div>
            {label && (
                <label className="block text-[0.80rem] font-semibold mb-2">{label}</label>
            )}
            {value ? (
                <div className="relative w-full h-32 border rounded-md overflow-hidden bg-zinc-50">
                    <video
                        src={resolveCmsImage(value)}
                        className="object-cover w-full h-full"
                        autoPlay
                        loop
                        muted
                        controls
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
                        {uploading ? M.common.loading : "Click to upload video"}
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
                <div className="text-[#656B7B] text-[0.7rem] mt-1">{finalHint} (Max 50MB)</div>
            ) : (
                <div className="text-[#656B7B] text-[0.7rem] mt-1">Max 50MB</div>
            )}
        </div>
    );
}
