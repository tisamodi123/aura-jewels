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

const StatusCell = ({ inquiry, refetch }) => {
  const token = getToken();
  const [updating, setUpdating] = useState(false);

  const statusOptions = useMemo(() => {
    return INQUIRY_STATUS.ALL_TYPES.map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
    }));
  }, []);

  const handleStatusChange = async (option) => {
    const newStatus = option?.value;
    if (!newStatus || newStatus === inquiry.status) return;

    // Confirm status change
    const confirm = await confirmStatusChange(
      "Change Status",
      `Do you want to change the status of this inquiry to ${newStatus}?`
    );
    if (!confirm.isConfirmed) return;

    try {
      setUpdating(true);
      const url = API_URL.UPDATE_ORDER_INQUIRY_STATUS(inquiry._id);

      // Let's pass the status in the body
      const res = await callApi(
        url,
        "POST",
        { status: newStatus },
        token
      );

      if (res?.errorCode === STATUS_CODE.OK || res?.errorCode === 200 || res?.status === 200 || res?.message === "Status updated successfully") {
        showSuccess(res?.message || "Status updated successfully.");
        refetch?.();
      } else {
        showError(res?.message || "Failed to update status.");
      }
    } catch (error) {
      console.log("Update inquiry status error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const currentValue = statusOptions.find(
    (opt) => opt.value === inquiry?.status
  ) || null;

  // Render color badge based on status
  const getBadgeColor = (status) => {
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
        menuPortalTarget={
          typeof window !== "undefined" ? document.body : null
        }
        styles={customSelectStyles}
        classNames={{
          control: () => `border rounded-md ${getBadgeColor(inquiry?.status)} font-normal text-xs`,
        }}
      />
    </div>
  );
};

export default StatusCell;