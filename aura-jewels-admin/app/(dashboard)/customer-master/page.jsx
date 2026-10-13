"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import CustomerMasterTable from "./_components/CustomerMasterTable";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { STATUS, STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function CustomerMaster() {
  const router = useRouter();
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  const deletehandler = () => { };
  const GetCustomerList = () => {
    setLoading(true);
    let formData = new FormData();
    formData.append('page', pagination.pageIndex + 1);
    formData.append('limit', pagination.pageSize);
    callApi(`${API_URL?.GET_CUSTOMER_LIST}`, "POST", formData, token)
      .then((result) => {
        console.log(result)
        if (result?.errorCode == STATUS_CODE.OK) {
          setCustomerList(result?.data);
          const count = result?.pagination?.total || result?.totalCount || result?.count || result?.total || 0;
          setTotalRows(count);
        }
      })
      .catch((err) => {
        toast.error(M.customer.listFetchFailed);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const UpdateStatus = (id, currentStatus) => {
    const statusOptions = {};
    if (STATUS && Array.isArray(STATUS.ALL_STATUS)) {
      STATUS.ALL_STATUS.forEach((status) => {
        statusOptions[status] = status;
      });
    }
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      input: "select",
      inputOptions: statusOptions,
      inputValue: currentStatus || "PENDING",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      customClass: {
        input: "border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black min-w-[220px] h-10 shadow-sm mt-3",
      },
      inputValidator: (value) => {
        if (!value) {
          return "You must select a status!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = { status: result.value };
        callApi(`${API_URL?.UPDATE_CUSTOMER_STATUS}/${id}`, "PATCH", payload, token)
          .then((res) => {
            if (res?.errorCode == STATUS_CODE.OK) {
              toast.success(res?.message || M.customer.statusUpdated);
              GetCustomerList();
            } else {
              toast.error(res?.message || M.common.updateFailed);
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error(M.common.updateFailed);
          });
      }
    });
  };

  const VerifyUserAPI = (data) => {
    console.log("Verify=========>", data)
    if (data.emailVerified === false) {
      Swal.fire({
        title: "Wanna Verify Customer",
        text: "Are You Sure Want To Verify This Customer?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "No",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed === true) {
          callApi(`${API_URL?.VERIFY_CUSTOMER}/${data.id}`, "PUT", null, token)
            .then((result) => {
              if (result?.errorCode == STATUS_CODE.OK) {
                toast.success(result?.message);
                GetCustomerList();
              } else {
                toast.error(result?.message);
              }
            });
        }
      });
    } else {
      toast.success("Customer Already Verified...!");
    }
  };

  const DeleteCustomer = (id) => {
    Swal.fire({
      title: "Delete Customer",
      text: "Are You Sure Want To Delete Customer?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_CUSTOMER}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCustomerList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  useEffect(() => {
    GetCustomerList();
  }, [pagination.pageIndex, pagination.pageSize]);
  return (
    <div>
      {/* Bread Crumb */}
      <div className=" p-2 mb-3 flex items-center justify-between">
        <div className="font-semibold text-xl">Customer Master</div>
        <div className="flex gap-2 items-center">
          {/* <Button className="primaryWhiteButton">Export</Button>
          <Button className="primaryWhiteButton">Import</Button> */}
          <Button
            onClick={() => router.push("/customer-master/add-customer")}
            className="hand h-[36px] px-5  font-normal bg-black text-[0.80rem] text-white"
          >
            Add Customer
          </Button>
        </div>
      </div>
      {/* Header */}
      {/* <div className="bg-white flex mb-6 justify-between shadow-sm px-3 py-4 rounded-md">
        <div className="flex text-[0.98rem] font-[500] items-center">
          <div className="border-r-[1px] border-[#E4E8EE] px-2">
            01 Customer
          </div>
          <div className="px-2">100% Of Your Customer Base</div>
        </div>
        <div className="flex text-md gap-2 font-semibold items-center">
          <span>Add Filter</span>
          <span>
            <ChevronDown size={18} />
          </span>
        </div>
      </div> */}
      {/* Table */}
      <div className="bg-white shadow-md rounded-md">
        <CustomerMasterTable
          tableData={customerList}
          loading={loading}
          onDelete={DeleteCustomer}
          onEdit={deletehandler}
          onUpdateStatus={UpdateStatus}
          VerifyUserAPI={VerifyUserAPI}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={totalRows}
        />
      </div>
    </div>
  );
}
