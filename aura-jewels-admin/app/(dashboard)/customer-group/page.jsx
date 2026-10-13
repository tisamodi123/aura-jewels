"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";

import { HomeIcon } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import CustomerGroupModal from "./_components/CustomerGroupModal";
import CustomerGroupTable from "./_components/CustomerGroupTable";
import { useDebounce } from "use-debounce";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

const CustomerGroupMaster = () => {
  const token = getToken();
  const router = useRouter();
  const pathname = usePathname();
  const title = "Customer Group";

  const [groupList, setGroupList] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);

  const GetGroupList = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("page", pagination?.pageIndex + 1);
    formData.append("limit", pagination?.pageSize);
    formData.append("search", debouncedSearch);

    callApi(`${API_URL?.GET_CUSTOMER_GROUP_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setGroupList(result?.data);
          const count = result?.pagination?.total || result?.totalCount || result?.count || result?.total || 0;
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

  const UpdateStatus = (id) => {
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_CUSTOMER_GROUP_STATUS}/${id}`, "PATCH", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetGroupList();
            } else {
              toast.error(result?.message);
            }
          }
        );
      }
    });
  };

  const DeleteGroup = (id) => {
    Swal.fire({
      title: "Delete Customer Group",
      text: "Are You Sure Want To Delete Customer Group?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_CUSTOMER_GROUP}/${id}`, "DELETE", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetGroupList();
            } else {
              toast.error(result?.message);
            }
          }
        );
      }
    });
  };

  const handleShowModal = (rowData = "") => {
    if (rowData) {
      setRowData(rowData);
    } else {
      setRowData({});
    }
    setOpenDrawer(true);
  };

  useEffect(() => {
    GetGroupList();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  return (
    <>
      <div className=" p-2 mb-3  items-center  flex justify-between">
        <div className="font-semibold text-xl">{title}</div>

        <div className="flex gap-2 items-center">
          <Button
            className="hand bg-black text-white"
            onClick={() => handleShowModal()}
          >
            Create Customer Group
          </Button>
        </div>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
        <div>
          <CustomerGroupTable
            tableData={groupList}
            onUpdateStatus={UpdateStatus}
            OnDelete={DeleteGroup}
            loading={loading}
            handleShowModal={handleShowModal}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={totalRows}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        </div>
      </div>

      <CustomerGroupModal
        key={rowData?._id || "new-group-modal"}
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetGroupList={GetGroupList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default CustomerGroupMaster;
