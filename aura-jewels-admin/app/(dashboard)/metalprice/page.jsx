"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState, useMemo } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import MetalPriceModal from "./_components/MetalPriceModal";
import MetalPriceTable from "./_components/MetalPriceTable";
import { STATUS_CODE } from "@/lib/Constant";

const MetalPriceMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [metalPriceList, setMetalPriceList] = useState([]);
  const [activeMetalPrice, setActiveMetalPrice] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
  const [totalRows, setTotalRows] = useState(0);

  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const GetMetalPriceList = () => {
    const formData = new FormData();
    formData.append("page", pagination.pageIndex + 1);
    formData.append("limit", pagination.pageSize);
    callApi(`${API_URL?.METAL_PRICE_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setMetalPriceList(result?.data || []);
          setTotalRows(result?.pagination?.total || 0);
        }
      });
  };

  const fetchActiveMetalPrice = () => {
    callApi(`${API_URL?.GET_ACTIVE_METAL_PRICE}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setActiveMetalPrice(result?.data || null);
        }
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
        callApi(`${API_URL?.UPDATE_METAL_PRICE_STATUS}/${id}`, "PATCH", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchActiveMetalPrice();
              GetMetalPriceList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteMetalPrice = (id) => {
    Swal.fire({
      title: "Delete Metal Price",
      text: "Are You Sure Want To Delete Metal Price?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_METAL_PRICE}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchActiveMetalPrice();
              GetMetalPriceList();
            } else {
              toast.error(result?.message);
            }
          });
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
    fetchActiveMetalPrice();
    GetMetalPriceList();
  }, [pagination.pageIndex, pagination.pageSize]);

  // Memoize stable references to prevent infinite rendering loops
  const mainTableData = useMemo(() => {
    return activeMetalPrice ? [activeMetalPrice] : [];
  }, [activeMetalPrice]);

  const historyData = useMemo(() => {
    return metalPriceList.filter(
      (item) => item._id !== activeMetalPrice?._id
    );
  }, [metalPriceList, activeMetalPrice]);

  return (
    <>
      <div className="flex items-center text-lg font-semibold mb-3 justify-between">
        <div>Metal Price</div>
        <div className="flex gap-2">
          <Button
            className="hand bg-black text-white"
            onClick={() => handleShowModal()}
          >
            Add Metal Price
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "active"
            ? "text-black border-b-2 border-black font-bold"
            : "text-zinc-400 hover:text-zinc-600"
            }`}
        >
          Active Price
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "history"
            ? "text-black border-b-2 border-black font-bold"
            : "text-zinc-400 hover:text-zinc-600"
            }`}
        >
          History
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === "active" ? (
        <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
          <MetalPriceTable
            onUpdateStatus={UpdateStatus}
            onEditMetal={handleShowModal}
            onDelete={DeleteMetalPrice}
            tableData={mainTableData}
            hidePagination={true}
            hideSearch={true}
          />
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
          <MetalPriceTable
            onUpdateStatus={UpdateStatus}
            onEditMetal={handleShowModal}
            onDelete={DeleteMetalPrice}
            tableData={historyData}
            pagination={pagination}
            setPagination={setPagination}
            hidePagination={false}
            hideSearch={false}
          />
        </div>
      )}

      {/* Add/Edit Metal Price Modal */}
      <MetalPriceModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetMetalPriceList={() => {
          fetchActiveMetalPrice();
          GetMetalPriceList();
        }}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default MetalPriceMaster;
