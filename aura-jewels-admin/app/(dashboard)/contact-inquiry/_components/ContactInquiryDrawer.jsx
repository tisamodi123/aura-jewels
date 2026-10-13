"use client";

import React, { useEffect, useState } from "react";
import { X, User, Mail, Tag, FileText, Loader2 } from "lucide-react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { STATUS_CODE, INQUIRY_STATUS } from "@/lib/Constant";
import { showError, showSuccess } from "@/lib/toast";
import { useMe } from "@/lib/usePermissions";
import { getStatusBadgeColor, prettyStatus } from "./ContactInquiryStatusCell";

const Field = ({ label, value, icon: Icon }) =>
    value || value === 0 ? (
        <div className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
                <span className="text-sm text-gray-800 break-words font-medium">{value}</span>
            </div>
        </div>
    ) : null;

const formattedDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const ContactInquiryDrawer = ({ inquiryId, onClose, refetchList }) => {
    const token = getToken();
    const { can } = useMe();
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [status, setStatus] = useState("");
    const [saving, setSaving] = useState(false);

    const canUpdate = can("contact_inquiry_update");

    // Lock body scroll while the drawer is open.
    useEffect(() => {
        document.body.style.overflow = inquiryId ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [inquiryId]);

    const fetchDetail = async () => {
        if (!inquiryId) return;
        try {
            setLoading(true);
            const res = await callApi(API_URL.GET_CONTACT_INQUIRY_DETAIL(inquiryId), "GET", null, token);

            if (res?.errorCode === STATUS_CODE.OK && res?.data) {
                setInquiry(res.data);
                setAdminNotes(res.data.adminNotes || "");
                setStatus(res.data.status || INQUIRY_STATUS.NEW);
            } else {
                showError(res?.message || "Failed to fetch inquiry details.");
                onClose();
            }
        } catch (error) {
            console.log("Fetch contact inquiry detail error:", error);
            showError("An error occurred while fetching details.");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [inquiryId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await callApi(
                API_URL.UPDATE_CONTACT_INQUIRY_STATUS(inquiryId),
                "POST",
                { status, adminNotes },
                token
            );

            if (res?.errorCode === STATUS_CODE.OK) {
                showSuccess("Inquiry updated successfully.");
                fetchDetail();
                refetchList?.();
            } else {
                showError(res?.message || "Failed to update inquiry.");
            }
        } catch (error) {
            console.log("Update contact inquiry error:", error);
            showError("An error occurred while saving changes.");
        } finally {
            setSaving(false);
        }
    };

    if (!inquiryId) return null;

    const customerName = inquiry
        ? `${inquiry.firstName || ""} ${inquiry.lastName || ""}`.trim()
        : "";

    const isDirty =
        !!inquiry && (status !== inquiry.status || adminNotes !== (inquiry.adminNotes || ""));

    return (
        <div className="fixed inset-0 z-[1000] flex justify-end">
            <style>{`
        @keyframes cFadeIn   { from { opacity: 0; }                 to { opacity: 1; } }
        @keyframes cSlideIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                style={{ animation: "cFadeIn 0.2s ease-out" }}
                onClick={onClose}
            />

            {/* Drawer Body */}
            <div
                className="relative h-full w-full max-w-xl bg-white shadow-2xl flex flex-col"
                style={{ animation: "cSlideIn 0.28s cubic-bezier(0.32,0.72,0,1)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-zinc-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Contact Inquiry Details</h2>
                        {inquiry && <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {inquiry._id}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Loading inquiry details...</p>
                        </div>
                    ) : inquiry ? (
                        <>
                            {/* Status banner */}
                            <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
                                        Current Status
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(inquiry.status)}`}
                                    >
                                        {prettyStatus(inquiry.status)}
                                    </span>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
                                        Submitted On
                                    </span>
                                    <span className="text-sm text-gray-700 font-semibold">
                                        {formattedDate(inquiry.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b pb-1.5">
                                    <User size={14} className="text-zinc-500" /> Customer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Field label="Customer Name" value={customerName} icon={User} />
                                    <Field
                                        label="Email Address"
                                        value={
                                            inquiry.email ? (
                                                <a
                                                    href={`mailto:${inquiry.email}`}
                                                    className="text-indigo-600 hover:underline break-all"
                                                >
                                                    {inquiry.email}
                                                </a>
                                            ) : null
                                        }
                                        icon={Mail}
                                    />
                                    <Field label="Subject" value={inquiry.subject} icon={Tag} />
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b pb-1.5">
                                    <FileText size={14} className="text-zinc-500" /> Message
                                </h3>
                                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                    {inquiry.message || "No message left by the customer."}
                                </div>
                            </div>

                            {/* Follow-up timestamps */}
                            {(inquiry.contactedAt || inquiry.resolvedAt) && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Field label="Contacted On" value={inquiry.contactedAt ? formattedDate(inquiry.contactedAt) : null} />
                                    <Field label="Resolved On" value={inquiry.resolvedAt ? formattedDate(inquiry.resolvedAt) : null} />
                                </div>
                            )}

                            {/* Internal follow-up */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-b pb-1.5">
                                    Internal Follow-up
                                </h3>

                                {canUpdate ? (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Status
                                            </label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
                                            >
                                                {INQUIRY_STATUS.ALL_TYPES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {prettyStatus(s)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Admin Notes (never shown to the customer)
                                            </label>
                                            <textarea
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                rows={4}
                                                maxLength={1000}
                                                placeholder="Add internal remarks about this inquiry..."
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none"
                                            />
                                            <div className="text-right text-[10px] text-gray-400">
                                                {adminNotes.length}/1000
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 whitespace-pre-wrap">
                                        {inquiry.adminNotes || "No internal notes yet."}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">Inquiry details not found.</div>
                    )}
                </div>

                {/* Footer actions */}
                {canUpdate && inquiry && !loading && (
                    <div className="border-t px-6 py-4 bg-zinc-50/50 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !isDirty}
                            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                        >
                            {saving && <Loader2 size={14} className="animate-spin" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactInquiryDrawer;
