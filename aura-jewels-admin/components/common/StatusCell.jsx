"use client";

import React, { useMemo, useState } from "react";
import Select from "react-select";
import { reactSelectStyles } from "@/components/common/common";
import { ORDER_STATUS_CAPTIONS, STATUS_CODE } from "@/lib/Constant";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { showError, showSuccess } from "@/lib/toast";
import { API_URL } from "@/lib/APIUrl";

const LOCKED_STATUSES = ["Rejected", "Returned Rejected", "Refunded", "Failed"];

const StatusCell = ({ order, refetch }) => {
  const token = getToken();
  const [updating, setUpdating] = useState(false);

  const isLocked = useMemo(
    () => LOCKED_STATUSES.includes(order?.orderStatus),
    [order?.orderStatus]
  );

  const statusOptions = useMemo(() => {
    const currentStatus = order?.orderStatus || "Pending";
    return ORDER_STATUS_CAPTIONS.map((item) => {
      let parsedParentIds = [];
      try {
        parsedParentIds = typeof item.parentid === "string" ? JSON.parse(item.parentid) : item.parentid || [];
      } catch (e) {
        console.error("Error parsing parentid for status caption", e);
      }
      return {
        ...item,
        parsedParentIds,
      };
    })
      .filter((caption) => {
        return (
          caption.parsedParentIds.includes(currentStatus) ||
          caption.status_id === currentStatus
        );
      })
      .map((item) => ({
        value: item.status_id,
        label: item.adminstatuscaption,
      }));
  }, [order?.orderStatus]);

  const handleStatusChange = async (option) => {
    const newStatus = option?.value;
    if (!newStatus || newStatus === order.orderStatus || isLocked) return;

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("customOrderId", order._id);
      formData.append("status", newStatus);

      const res = await callApi(
        API_URL.UPDATE_CUSTOM_ORDER_STATUS,
        "POST",
        formData,
        token
      );

      if (res?.errorCode === STATUS_CODE.OK) {
        showSuccess(res?.message || "Order status updated successfully.");
        refetch?.();
      } else {
        showError(res?.message || "Failed to update order status.");
      }
    } catch (error) {
      console.log("Update custom order status error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const currentValue = statusOptions.find(
    (opt) => opt.value?.toLowerCase() === order?.orderStatus?.toLowerCase()
  ) || null;

  return (
    <div className="w-[160px]" onClick={(e) => e.stopPropagation()}>
      <Select
        options={statusOptions}
        value={currentValue}
        onChange={handleStatusChange}
        isDisabled={updating || isLocked}
        placeholder="Select Status"
        isSearchable={false}
        menuPosition="fixed"
        menuPortalTarget={
          typeof window !== "undefined" ? document.body : null
        }
        styles={reactSelectStyles}
      />
    </div>
  );
};

export default StatusCell;
