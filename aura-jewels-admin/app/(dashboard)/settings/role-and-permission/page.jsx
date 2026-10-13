"use client";
import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { clearMe, useMe } from "@/lib/usePermissions";
import { Loader2, ShieldCheck } from "lucide-react";

const CAP_COLUMNS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

export default function RoleAndPermission() {
  const token = getToken();
  // Editing RBAC needs permission_update (Super Admin only by default). Anyone
  // with permission_view may read the matrix, so gate the Save action rather
  // than letting them submit and get a 403.
  const { can } = useMe();
  const canEdit = can("permission_update");
  const [config, setConfig] = useState(null);
  const [activeRole, setActiveRole] = useState("");
  const [granted, setGranted] = useState(new Set()); // action strings for the active role
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await callApi(API_URL.PERMISSION_CONFIG, "GET", null, token);
      if (res?.errorCode === STATUS_CODE.OK && res.data) {
        setConfig(res.data);
        const first = res.data.roles?.[0];
        setActiveRole(first?.role || "");
        setGranted(new Set(first?.permissions || []));
      } else {
        toast.error(res?.message || "Failed to load permissions");
      }
    } catch (e) {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roles = config?.roles || [];
  const modules = config?.modules || [];

  const switchRole = (role) => {
    setActiveRole(role);
    const r = roles.find((x) => x.role === role);
    setGranted(new Set(r?.permissions || []));
  };

  // Each capability's actions[] are treated as one all-or-nothing toggle.
  const capActions = (mod, cap) => (Array.isArray(mod[cap]) ? mod[cap] : []);
  const capChecked = (mod, cap) => {
    const acts = capActions(mod, cap);
    return acts.length > 0 && acts.every((a) => granted.has(a));
  };
  const toggleCap = (mod, cap) => {
    const acts = capActions(mod, cap);
    if (!acts.length) return;
    const next = new Set(granted);
    const allOn = acts.every((a) => next.has(a));
    acts.forEach((a) => (allOn ? next.delete(a) : next.add(a)));
    setGranted(next);
  };
  const toggleOther = (action) => {
    const next = new Set(granted);
    next.has(action) ? next.delete(action) : next.add(action);
    setGranted(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await callApi(API_URL.SAVE_ROLE_PERMISSION, "PUT", { role: activeRole, permissions: Array.from(granted) }, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        toast.success("Permissions updated");
        clearMe(); // sidebar/menus re-read fresh permissions next load
        setConfig((c) => ({ ...c, roles: c.roles.map((r) => (r.role === activeRole ? { ...r, permissions: Array.from(granted) } : r)) }));
      } else {
        toast.error(res?.message || "Failed to save");
      }
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const activeLabel = useMemo(() => roles.find((r) => r.role === activeRole)?.label || activeRole, [roles, activeRole]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500"><Loader2 className="animate-spin mr-2" size={18} /> Loading…</div>;
  }

  return (
    <div className="p-2">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={20} className="text-[#087B5D]" />
        <h1 className="text-xl font-bold">Roles &amp; Permissions</h1>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Grant each role only what it needs. <b>View</b> lets a role open a section for reference / filters without changing anything. Super Admin always has full access and isn&apos;t listed here.
      </p>

      {/* Role tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {roles.map((r) => (
          <button
            key={r.role}
            onClick={() => switchRole(r.role)}
            className={`px-4 py-2 rounded-md text-sm font-medium border capitalize transition ${activeRole === r.role ? "bg-black text-white border-black" : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Module</th>
              {CAP_COLUMNS.map((c) => <th key={c.key} className="px-4 py-3 font-semibold text-center w-24">{c.label}</th>)}
              <th className="px-4 py-3 font-semibold text-left">Other</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr key={mod.key} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{mod.label}</td>
                {CAP_COLUMNS.map((c) => {
                  const acts = capActions(mod, c.key);
                  return (
                    <td key={c.key} className="px-4 py-3 text-center">
                      {acts.length ? (
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#087B5D] cursor-pointer"
                          checked={capChecked(mod, c.key)}
                          onChange={() => toggleCap(mod, c.key)}
                        />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  {(mod.other || []).length ? (
                    <div className="flex flex-wrap gap-3">
                      {mod.other.map((o) => (
                        <label key={o.action} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                          <input type="checkbox" className="w-4 h-4 accent-[#087B5D]" checked={granted.has(o.action)} onChange={() => toggleOther(o.action)} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button onClick={save} disabled={saving || !canEdit}
          title={canEdit ? undefined : "Only Super Admin can change role permissions"}
          className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? "Saving…" : `Save ${activeLabel} permissions`}
        </button>
        <span className="text-xs text-gray-400">
          {canEdit
            ? "Changes take effect immediately for that role."
            : "Read-only — only Super Admin can change role permissions."}
        </span>
      </div>
    </div>
  );
}
