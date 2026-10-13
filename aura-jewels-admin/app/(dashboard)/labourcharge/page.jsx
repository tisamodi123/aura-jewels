"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import DataTable from "react-data-table-component";
import { HomeIcon } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { MdDelete, MdEdit } from "react-icons/md";
import LabourChargeModal from "./_components/LabourChargeModal";
import LabourChargeTable from "./_components/LabourChargeTable";
import { STATUS_CODE } from "@/lib/Constant";

const LabourChargMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [labourChargeList, setLabourtChargeList] = useState([]);

  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  const GetLabourChargeList = () => {
    const formData = new FormData()
    formData.append("page", pagination.pageIndex + 1)
    formData.append("limit", pagination.pageSize)
    callApi(`${API_URL?.LABOUR_CHARGE_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setLabourtChargeList(result?.data);
          setTotalRows(result?.pagination.total)
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
        callApi(`${API_URL?.UPDATE_LABOUR_CHARGE_STATUS}/${id}`, "PATCH", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetLabourChargeList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteParaType = (id) => {
    Swal.fire({
      title: "Delete Labour Charge",
      text: "Are You Sure Want To Delete Labour Charge?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_LABOUR_CHARGE}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetLabourChargeList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  // const columns = [
  //   {
  //     name: "No",
  //     selector: (row, index) => {
  //       return index + 1;
  //     },
  //   },
  //   {
  //     name: "Labour Charge Code",
  //     selector: (row) => row.labourCode,
  //   },
  //   {
  //     name: "Amount",
  //     selector: (row) => row.amount,
  //   },
  //   {
  //     name: "Remark",
  //     selector: (row) => row.remark,
  //   },
  //   {
  //     name: "Status",
  //     cell: (row) => {
  //       return (
  //         <span
  //           className={`hand px-4 py-2 text-xs rounded-md ${row.status == "ACTIVE"
  //             ? "bg-green-100 text-green-700"
  //             : "bg-red-100 text-red-700"
  //             } `}
  //           onClick={() => UpdateStatus(row?.id)}
  //         >
  //           {row.status}
  //         </span>
  //       );
  //     },
  //   },
  //   {
  //     name: "Action",
  //     cell: (row) => {
  //       return (
  //         <>
  //           <div>
  //             <MdEdit
  //               color="green"
  //               className="hand hover: rounded-lg hover:bg-green-200 p-1"
  //               size={30}
  //               onClick={() => handleShowModal(row)}
  //             />
  //           </div>
  //           <div className="ml-5">
  //             <MdDelete
  //               color="red"
  //               className="hand hover: rounded-lg hover:bg-red-200 p-1"
  //               size={30}
  //               onClick={() => DeleteParaType(row?.id)}
  //             />
  //           </div>
  //         </>
  //       );
  //     },
  //   },
  // ];

  const handleShowModal = (rowData = "") => {
    if (rowData) {
      setRowData(rowData);
    } else {
      setRowData({});
    }
    setOpenDrawer(true);
  };

  useEffect(() => {
    GetLabourChargeList();
  }, [pagination.pageIndex, pagination.pageSize]);

  console.log("labour charge list--->", labourChargeList);
  return (
    <>
      <div className=" flex items-center text-lg font-semibold mb-3 justify-between">
        <div>Labour Charge</div>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Add Labour Charge
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
        {/* <DataTable
          columns={columns}
          data={labourChargeList}
          pagination={true}
          paginationPerPage={10}
        /> */}
        <LabourChargeTable
          tableData={labourChargeList}
          onUpdateStatus={UpdateStatus}
          onEdit={handleShowModal}
          onDelete={DeleteParaType}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={totalRows}
        />
      </div>

      <LabourChargeModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetLabourChargeList={GetLabourChargeList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default LabourChargMaster;
