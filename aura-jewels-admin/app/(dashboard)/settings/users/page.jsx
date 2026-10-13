"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import UserTable from "./_components/UserTable";
import AddUserModal from "../_components/AddUserModal";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function UserPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const token = getToken();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  // Fetch Staff Data API

  const GetStaffList = () => {
    setLoading(true);
    // Backend Joi schema expects `page` + `limit`. The frontend keeps
    // 0-indexed pagination so we add one. totalRows comes from the
    // `pagination.total` field the controller spreads onto the response.
    const form = new FormData();
    form.append("page", pagination?.pageIndex + 1);
    form.append("limit", pagination?.pageSize);

    callApi(`${API_URL?.GET_STAFF_LIST}`, "POST", form, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setStaffList(result?.data || []);
          const count =
            result?.pagination?.total ?? result?.totalCount ?? result?.count ?? 0;
          setTotalRows(count);
        }
      })
      .catch((err) => {
        toast.error(M.common.fetchFailed);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    GetStaffList();
  }, [pagination.pageIndex, pagination.pageSize]);

  console.log("stafflist--->", staffList);

  // Update Status API

  const UpdateStatus = (id, status) => {
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_STAFF_STATUS}/${id}`, "PATCH", {
          status: status,
        }, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetStaffList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  // Delete API integration
  const DeleteStaff = (id) => {
    Swal.fire({
      title: "Delete Category",
      text: "Are You Sure Want To Delete ?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_STAFF}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetStaffList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };
  return (
    <>
      <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" px-6 pt-6 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">Staff</h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[80%] pb-4">
                Users refer to individuals who interact with a system, platform,
                application, or service. They can have various roles and levels
                of access, depending on the system's purpose and functionality.
              </p>
              <div>
                <Button
                  onClick={() => setIsOpen(true)}
                  className="hand h-[36px] px-5  font-normal bg-black text-[0.80rem] text-white"
                >
                  Add Staff
                </Button>
              </div>
            </div>
          </div>
          {/* User Table */}
          <UserTable
            tableData={staffList}
            onUpdateStatus={UpdateStatus}
            OnDelete={DeleteStaff}
            GetStaffList={GetStaffList}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={totalRows}
          />
        </div>
      </div>
      <AddUserModal
        GetStaffList={GetStaffList}
        open={isOpen}
        setOpen={setIsOpen}
      />
    </>
  );
}
