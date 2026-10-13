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
import ChargesModal from "./_components/ChargesModal";
import ChargesTable from "./_components/ChargesTable";
import { STATUS_CODE } from "@/lib/Constant";

const LabourChargMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [ChargeList, setChargeList] = useState([]);

  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false)

  const GetChargeList = () => {
    setLoading(true)
    const formData = new FormData()
    formData.append("page", pagination.pageIndex + 1)
    formData.append("limit", pagination.pageSize)
    callApi(`${API_URL?.CHARGE_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setChargeList(result?.data);
          setTotalRows(result?.pagination.total)
        }
      }).catch(error => console.log(error)).finally(setLoading(false));
  };

  const UpdateStatus = (id) => {
    setLoading(true)
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_CHARGE_STATUS}/${id}`, "PATCH", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetChargeList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    }).catch(error => console.log(error)).finally(setLoading(false))
  };

  const DeleteParaType = (id) => {
    setLoading(true)
    Swal.fire({
      title: "Delete Charge",
      text: "Are You Sure Want To Delete Charge?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_CHARGE}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetChargeList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    }).catch(error => console.log(error)).finally(setLoading(false))

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
    GetChargeList();
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <>
      <div className=" flex items-center text-lg font-semibold mb-3 justify-between">
        <div>Charges</div>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Add Charges
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
        {/* <DataTable
          columns={columns}
          data={ChargeList}
          pagination={true}
          paginationPerPage={10}
        /> */}
        <ChargesTable
          tableData={ChargeList}
          onUpdateStatus={UpdateStatus}
          onEdit={handleShowModal}
          onDelete={DeleteParaType}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={totalRows}
          loading={loading}
        />
      </div>

      <ChargesModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetChargeList={GetChargeList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default LabourChargMaster;
