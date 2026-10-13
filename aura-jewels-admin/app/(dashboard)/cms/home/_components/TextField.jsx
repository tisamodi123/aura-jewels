"use client";

export default function TextField({ label, value, onChange, placeholder, type = "text", textarea = false, rows = 3 }) {
    return (
        <div>
            {label && (
                <label className="block text-[0.80rem] font-semibold mb-2">{label}</label>
            )}
            {textarea ? (
                <textarea
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || ""}
                    rows={rows}
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            ) : (
                <input
                    type={type}
                    value={value ?? ""}
                    onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                    placeholder={placeholder || ""}
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            )}
        </div>
    );
}
