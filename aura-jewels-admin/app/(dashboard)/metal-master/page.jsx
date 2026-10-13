"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";

import Swal from "sweetalert2";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import MetalMasterModal from "./_components/MetalMasterModal";
import MetalMasterTable from "./_components/MetalMasterTable";
import SyncPriceModal from "@/components/SyncPriceModal";
import { useDebounce } from "use-debounce";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

const MetalMaster = () => {
  const token = getToken();
  const pathname = usePathname();
  const title = "Metal Master";

  const [metalList, setMetalList] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
   const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSyncModal, setOpenSyncModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);

  const GetMetalList = () => {
    setLoading(true);
    const body = {
      page: pagination?.pageIndex + 1,
      limit: pagination?.pageSize,
      search: debouncedSearch,
    };

    callApi(`${API_URL?.METAL_LIST}`, "POST", body, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setMetalList(result?.data);
          setTotalRows(result?.pagination?.total || 0);
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
        callApi(`${API_URL?.UPDATE_METAL_STATUS}/${id}`, "PATCH", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetMetalList();
            } else {
              toast.error(result?.message);
            }
          }
        );
      }
    });
  };

  const DeleteMetal = (id) => {
    Swal.fire({
      title: "Delete Metal",
      text: "Are You Sure Want To Delete Metal?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_METAL}/${id}`, "DELETE", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetMetalList();
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
    GetMetalList();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  return (
    <>
      <div className=" p-2 mb-3  items-center  flex justify-between">
        <div className="font-semibold">{title}</div>

        <div className="flex gap-2 items-center">
           <Button
            className="hand bg-black text-white"
            onClick={() => handleShowModal()}
          >
            Create Metal
          </Button>

          <Button
            className="hand bg-[#087B5D] hover:bg-[#06614a] text-white flex items-center gap-2"
            onClick={() => setOpenSyncModal(true)}
            title="Recalculates ALL prices + offers: metal, making, diamond (from stone rates) → finalPrice, then re-applies active offers. Run this after changing metal rates so product prices update."
          >
            Sync Price
          </Button>
        </div>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
        <div>
          <MetalMasterTable
            tableData={metalList}
            onUpdateStatus={UpdateStatus}
            OnDelete={DeleteMetal}
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

      <MetalMasterModal
        key={rowData?._id || "new-metal-modal"}
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetMetalList={GetMetalList}
        rowData={rowData}
        setRowData={setRowData}
      />

      <SyncPriceModal
        open={openSyncModal}
        setOpen={setOpenSyncModal}
        onSuccess={GetMetalList}
        apiUrl={API_URL.SYNC_METAL_PRICE}
      />
    </>
  );
};

export default MetalMaster;
