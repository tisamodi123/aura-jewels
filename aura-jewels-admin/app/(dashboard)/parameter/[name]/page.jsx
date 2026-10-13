"use client";
import { API_URL } from "@/lib/APIUrl";
import React, { useEffect, useState, useCallback } from "react";
import { getToken } from "@/lib/auth";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { usePathname, useParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import ParameterModal from "../_components/ParameterModal";
import ParameterTable from "../_components/ParameterTable";

const ParameterMaster = () => {
  const token = getToken();
  const pathname = usePathname();
  const { name } = useParams();
  console.log("paramName-->", name);

  const title = pathname?.replace("/", "")?.split("")?.join("");

  const [paraTypeId, setParaTypeId] = useState(name);
  const [parameterList, setParameterList] = useState([]);

  const [sort, setSort] = useState("");
  const [isPrevImg, setIsPrevImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  const GetParameterList = useCallback(() => {
    setLoading(true);
    const payload = {
      type: paraTypeId,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch
    };

    callApi(`${API_URL?.PARAMETER_LIST}`, "POST", payload, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setParameterList(result?.data || []);
          setTotalRows(result?.pagination?.total || 0);
          setSort(result?.pagination?.total > 0 ? result?.pagination?.total + 1 : 1);
        }
      }).catch((err) => {
        console.log(err);
        toast.error(M.common.fetchFailed);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paraTypeId, pagination.pageIndex, pagination.pageSize, debouncedSearch, token]);

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
        callApi(`${API_URL?.UPDATE_PARAMETER_STATUS}/${id}`, "PATCH", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetParameterList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteParaType = (id) => {
    Swal.fire({
      title: "Delete Parameter",
      text: "Are You Sure Want To Delete Parameter?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_PARAMETER}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetParameterList();
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
    setParaTypeId(name);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setSearchText("");
  }, [name]);

  useEffect(() => {
    if (paraTypeId) {
      GetParameterList();
    }
  }, [paraTypeId, GetParameterList]);

  useEffect(() => {
    if (name == "shape") {
      setIsPrevImg(true);
    } else {
      setIsPrevImg(false);
    }
  }, [name]);

  return (
    <>
      <div className=" flex items-center mb-5 justify-between">
        <div className="font-semibold  text-lg">
          <span>{name === "collection" && "Collection"}</span>
          <span>{name === "tags" && "Tags"}</span>
          <span>{name === "metalstamp" && "Metal Stamp"}</span>
          <span>{name === "metaltype" && "Metal Type"}</span>
          <span>{name === "settingtype" && "Setting Type"}</span>
          <span>{name === "clarity" && "Clarity"}</span>
          <span>{name === "color" && "Color"}</span>
          <span>{name === "cut" && "Cut"}</span>
          <span>{name === "polish" && "Polish"}</span>
          <span>{name === "fluorescence" && "Fluorescence"}</span>
          <span>{name === "symmetry" && "Symmetry"}</span>
          <span>{name === "shape" && "Shape"}</span>
          <span>{name === "lab" && "Lab"}</span>
          <span>{name === "table" && "Table"}</span>
          <span>{name === "depth" && "Depth"}</span>
          <span>{name === "ringsize" && "Ring Size"}</span>
          <span>{name === "carat" && "Carat"}</span>
          <span>{name === "centerstonesize" && "Center Stone Size"}</span>
          <span>{name === "braceletsize" && "Bracelet Size"}</span>
          <span>{name === "fancycolor" && "Fancy Color"}</span>
        </div>
        <button
          className="bg-black px-4 py-2 rounded-lg cursor-pointer text-[0.87rem] text-white"
          onClick={() => handleShowModal()}
        >
          <span>{name === "collection" && "Add Collection"}</span>
          <span>{name === "tags" && "Add Tags"}</span>
          <span>{name === "metalstamp" && "Add Metal Stamp"}</span>
          <span>{name === "metaltype" && "Add Metal Type"}</span>
          <span>{name === "settingtype" && "Add Setting"}</span>
          <span>{name === "clarity" && "Add Clarity"}</span>
          <span>{name === "color" && "Add Color"}</span>
          <span>{name === "cut" && "Add Cut"}</span>
          <span>{name === "polish" && "Add Polish"}</span>
          <span>{name === "fluorescence" && "Add Fluor"}</span>
          <span>{name === "symmetry" && "Add Symmetry"}</span>
          <span>{name === "shape" && "Add Shape"}</span>
          <span>{name === "lab" && "Add Lab"}</span>
          <span>{name === "table" && "Add Table"}</span>
          <span>{name === "depth" && "Add Depth"}</span>
          <span>{name === "ringsize" && "Add Size"}</span>
          <span>{name === "braceletsize" && "Add Size"}</span>
          <span>{name === "carat" && "Add Carat"}</span>
          <span>{name === "centerstonesize" && "Add Size"}</span>
          <span>{name === "fancycolor" && "Add Fancy Color"}</span>
        </button>
      </div>

      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
        <ParameterTable
          loading={loading}
          onUpdateStatus={UpdateStatus}
          onEditParameter={handleShowModal}
          onDelete={DeleteParaType}
          tableData={parameterList}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={totalRows}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </div>

      <ParameterModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetParameterList={GetParameterList}
        rowData={rowData}
        setRowData={setRowData}
        paraTypeId={paraTypeId}
        setIsPrevImg={setIsPrevImg}
        isPrevImg={isPrevImg}
      />
    </>
  );
};

export default ParameterMaster;
