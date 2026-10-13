"use client";
import React, { useEffect, useState } from "react";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

// Admin — Payment Gateway configuration. Key secret + webhook secret are stored
// ENCRYPTED server-side; they are never returned to this page (only a "set"
// flag). Leaving a secret field blank keeps the stored value unchanged.
export default function PaymentGatewayPage() {
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    provider: "razorpay",
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    enabled: false,
    testMode: true,
  });
  const [meta, setMeta] = useState({ keySecretSet: false, webhookSecretSet: false, updatedAt: null });

  const load = async () => {
    setLoading(true);
    try {
      const res = await callApi(API_URL.PAYMENT_GATEWAYS, "GET", null, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        const rzp = (res.data || []).find((g) => g.provider === "razorpay");
        if (rzp) {
          setForm((f) => ({ ...f, keyId: rzp.keyId || "", enabled: !!rzp.enabled, testMode: !!rzp.testMode }));
          setMeta({ keySecretSet: !!rzp.keySecretSet, webhookSecretSet: !!rzp.webhookSecretSet, updatedAt: rzp.updatedAt });
        }
      }
    } catch (e) {
      toast.error("Failed to load payment gateway config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    if (!form.keyId.trim()) {
      toast.error("Key ID is required");
      return;
    }
    setSaving(true);
    try {
      // Only send secrets if the admin typed something (blank = keep existing).
      const body = {
        provider: "razorpay",
        keyId: form.keyId.trim(),
        enabled: form.enabled,
        testMode: form.testMode,
      };
      if (form.keySecret.trim()) body.keySecret = form.keySecret.trim();
      if (form.webhookSecret.trim()) body.webhookSecret = form.webhookSecret.trim();

      const res = await callApi(API_URL.SAVE_PAYMENT_GATEWAY, "PUT", body, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        toast.success("Payment gateway saved");
        setForm((f) => ({ ...f, keySecret: "", webhookSecret: "" }));
        load();
      } else {
        toast.error(res?.message || "Failed to save");
      }
    } catch (e) {
      toast.error("Failed to save payment gateway");
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D]";

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Payment Gateway</h1>
      <p className="text-sm text-gray-500 mb-6">
        Razorpay credentials. The Key Secret and Webhook Secret are encrypted at rest and never displayed again — leave them blank to keep the current value.
      </p>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
        </div>
      ) : (
        <div className="space-y-5 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
              <span className="text-sm font-medium">Enabled (live checkout)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={form.testMode} onChange={(e) => setForm({ ...form, testMode: e.target.checked })} />
              <span className="text-sm font-medium">Test mode</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Key ID <span className="text-red-500">*</span></label>
            <input className={field} value={form.keyId} onChange={(e) => setForm({ ...form, keyId: e.target.value })} placeholder="rzp_test_xxxxxxxx" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Key Secret {meta.keySecretSet && <span className="text-green-600 text-xs">(set — leave blank to keep)</span>}
            </label>
            <input className={field} type="password" autoComplete="new-password" value={form.keySecret} onChange={(e) => setForm({ ...form, keySecret: e.target.value })} placeholder={meta.keySecretSet ? "••••••••" : "Enter key secret"} />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Webhook Secret {meta.webhookSecretSet && <span className="text-green-600 text-xs">(set — leave blank to keep)</span>}
            </label>
            <input className={field} type="password" autoComplete="new-password" value={form.webhookSecret} onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })} placeholder={meta.webhookSecretSet ? "••••••••" : "From Razorpay dashboard webhook"} />
            <p className="text-xs text-gray-400">Register the webhook at <span className="font-mono">/app/payment/webhook</span> in the Razorpay dashboard, then paste its secret here.</p>
          </div>

          <div className="pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {meta.updatedAt && <span className="ml-4 text-xs text-gray-400">Last updated: {new Date(meta.updatedAt).toLocaleString()}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
