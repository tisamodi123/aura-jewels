"use client";

//** React import */
import React, { useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";
import { useRouter } from "next/navigation";

//** Third party imports */
import { toast } from "sonner";
import DataTable from "react-data-table-component";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { formatedPrice, isValidData } from "@/lib/utils";
import useTableHeight from "@/hooks/useTableHeightHooks";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

//** Custom component imports */
import TableSkeletonLoader from "@/components/tableSkeletonLoader";
import { MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
import JewelleryDataTable from "./jewelleryDataTable";

const JewelleryTable = ({
  diamondData,
  totalRows,
  isLoading,
  setPagination,
  pagination,
  GetJewelleryData,
  searchText,
  setStatus,
  archived,
  setArchieved,
  status,
  setSerchText,
  setSelectedIds,
  selectedIds,
}) => {
  //** Get token */
  const token = getToken();

  //** Next Hooks */
  const router = useRouter();

  //** Custom hooks */
  const tableHieght = useTableHeight(320);

  //** State */

  useEffect(() => {
    if (!isValidData(token)) {
      router.replace("login");
    } else {
      GetJewelleryData();
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  const UpdateStatus = (id, newStatus) => {
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      const formData = new FormData();
      formData.append("status", newStatus)
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_JEWELLERY_STATUS}/${id}`, "PATCH", formData, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetJewelleryData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteJewellery = (id) => {
    Swal.fire({
      title: "Delete Jewellery",
      text: "Are You Sure Want To Delete Jewellery?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_JEWELLERY}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetJewelleryData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };


  return (
    <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
      <JewelleryDataTable
        tableData={diamondData}
        onDelete={DeleteJewellery}
        onUpdateStatus={UpdateStatus}
        pagination={pagination}
        status={status}
        setStatus={setStatus}
        archived={archived}
        setArchieved={setArchieved}
        setPagination={setPagination}
        searchText={searchText}
        setSerchText={setSerchText}
        totalRows={totalRows}
        isLoading={isLoading}
        setSelectedIds={setSelectedIds}
        selectedIds={selectedIds}
      />
    </div>
  );
};

export default JewelleryTable;
