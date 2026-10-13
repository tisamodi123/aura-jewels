"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";

const field =
    "w-full px-3 py-2 border text-[0.85rem] text-zinc-900 bg-white border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500";
const label = "block text-[0.80rem] font-semibold mb-1.5 text-zinc-700";

export default function SmsConfigPage() {
    const token = getToken();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        provider: "nimbus",
        apiUrl: "",
        userId: "",
        password: "",
        passwordSet: false,
        senderId: "",
        entityId: "",
        templateId: "",
        messageTemplate: "",
        enabled: false,
        testMode: true,
    });

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const load = async () => {
        setLoading(true);
        try {
            const res = await callApi(API_URL.SMS_CONFIG, "GET", null, token);
            if (res?.errorCode === 200 && res.data) {
                setForm((p) => ({ ...p, ...res.data, password: "" }));
            } else {
                toast.error(res?.message || "Failed to load SMS config");
            }
        } catch (e) {
            toast.error("Failed to load SMS config");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            // Only send password if the admin typed a new one.
            const payload = { ...form };
            if (!payload.password) delete payload.password;
            delete payload.passwordSet;

            const res = await callApi(API_URL.SMS_CONFIG, "PUT", payload, token);
            if (res?.errorCode === 200) {
                toast.success(res.message || "Saved");
                load();
            } else {
                toast.error(res?.message || "Failed to save");
            }
        } catch (e) {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-sm text-zinc-500">Loading SMS configuration…</div>;
    }

    return (
        <div className="p-4 max-w-3xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-xl font-semibold">SMS Gateway (OTP)</h1>
                    <p className="text-[0.8rem] text-zinc-500 mt-1">
                        Credentials are stored encrypted. Used only for phone-OTP delivery.
                    </p>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="bg-black text-white rounded-md px-5 py-2 text-[0.8rem] disabled:opacity-60"
                >
                    {saving ? "Saving…" : "Save"}
                </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-4">
                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-[0.85rem]">
                        <input type="checkbox" checked={!!form.enabled} onChange={(e) => set("enabled", e.target.checked)} />
                        <span className="font-semibold">Enabled</span>
                        <span className="text-zinc-400">(off = OTP falls back to console log)</span>
                    </label>
                    <label className="flex items-center gap-2 text-[0.85rem]">
                        <input type="checkbox" checked={!!form.testMode} onChange={(e) => set("testMode", e.target.checked)} />
                        <span className="font-semibold">Test mode</span>
                        <span className="text-zinc-400">(on = do not dispatch real SMS)</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={label}>Provider</label>
                        <input className={field} value={form.provider || ""} onChange={(e) => set("provider", e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>API URL</label>
                        <input className={field} value={form.apiUrl || ""} onChange={(e) => set("apiUrl", e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>User ID</label>
                        <input className={field} value={form.userId || ""} onChange={(e) => set("userId", e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Password {form.passwordSet && <span className="text-green-600 font-normal">(set — leave blank to keep)</span>}</label>
                        <input type="password" className={field} value={form.password || ""} placeholder={form.passwordSet ? "••••••••" : ""} onChange={(e) => set("password", e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Sender ID</label>
                        <input className={field} value={form.senderId || ""} onChange={(e) => set("senderId", e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Entity ID (DLT)</label>
                        <input className={field} value={form.entityId || ""} onChange={(e) => set("entityId", e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Template ID (DLT)</label>
                        <input className={field} value={form.templateId || ""} onChange={(e) => set("templateId", e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={label}>Message Template</label>
                    <textarea
                        className={`${field} h-24`}
                        value={form.messageTemplate || ""}
                        onChange={(e) => set("messageTemplate", e.target.value)}
                    />
                    <p className="text-[0.72rem] text-zinc-400 mt-1">
                        Use <code>{"{otp}"}</code> where the code should appear. Must match the DLT-registered template.
                    </p>
                </div>
            </div>
        </div>
    );
}
