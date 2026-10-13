"use client";

import React, { useMemo, useState } from "react";
import Select from "react-select";
import { reactSelectStyles } from "@/components/common/common";
import { INQUIRY_STATUS, STATUS_CODE } from "@/lib/Constant";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { showError, showSuccess } from "@/lib/toast";
import { API_URL } from "@/lib/APIUrl";
import { confirmStatusChange } from "@/lib/swal";
import { useMe } from "@/lib/usePermissions";

export const getStatusBadgeColor = (status) => {
    switch (status) {
        case INQUIRY_STATUS.NEW:
            return "bg-blue-50 text-blue-700 border-blue-200";
        case INQUIRY_STATUS.CONTACTED:
            return "bg-amber-50 text-amber-700 border-amber-200";
        case INQUIRY_STATUS.COMPLETED:
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case INQUIRY_STATUS.CANCELLED:
            return "bg-rose-50 text-rose-700 border-rose-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};

export const prettyStatus = (status) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "";

const ContactInquiryStatusCell = ({ inquiry, refetch }) => {
    const token = getToken();
    const { can } = useMe();
    const [updating, setUpdating] = useState(false);

    const canUpdate = can("contact_inquiry_update");

    const statusOptions = useMemo(
        () => INQUIRY_STATUS.ALL_TYPES.map((status) => ({ value: status, label: prettyStatus(status) })),
        []
    );

    const handleStatusChange = async (option) => {
        const newStatus = option?.value;
        if (!newStatus || newStatus === inquiry.status) return;

        const confirm = await confirmStatusChange(
            "Change Status",
            `Do you want to change the status of this inquiry to ${newStatus}?`
        );
        if (!confirm.isConfirmed) return;

        try {
            setUpdating(true);
            const res = await callApi(
                API_URL.UPDATE_CONTACT_INQUIRY_STATUS(inquiry._id),
                "POST",
                { status: newStatus },
                token
            );

            if (res?.errorCode === STATUS_CODE.OK) {
                showSuccess(res?.message || "Status updated successfully.");
                refetch?.();
            } else {
                showError(res?.message || "Failed to update status.");
            }
        } catch (error) {
            console.log("Update contact inquiry status error:", error);
            showError("An error occurred while updating the status.");
        } finally {
            setUpdating(false);
        }
    };

    const currentValue = statusOptions.find((opt) => opt.value === inquiry?.status) || null;

    // Staff with view-only permission see the status but cannot change it — the
    // API would reject the call with 403 anyway.
    if (!canUpdate) {
        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(inquiry?.status)}`}
            >
                {prettyStatus(inquiry?.status)}
            </span>
        );
    }

    const customSelectStyles = {
        ...reactSelectStyles,
        control: (base, state) => ({
            ...reactSelectStyles.control(base, state),
            backgroundColor: "transparent",
            borderColor: state.isFocused ? "#818cf8" : "#e5e7eb",
        }),
    };

    return (
        <div className="w-[140px] mx-auto" onClick={(e) => e.stopPropagation()}>
            <Select
                options={statusOptions}
                value={currentValue}
                onChange={handleStatusChange}
                isDisabled={updating}
                placeholder="Select Status"
                isSearchable={false}
                menuPosition="fixed"
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                styles={customSelectStyles}
                classNames={{
                    control: () => `border rounded-md ${getStatusBadgeColor(inquiry?.status)} font-normal text-xs`,
                }}
            />
        </div>
    );
};

export default ContactInquiryStatusCell;
