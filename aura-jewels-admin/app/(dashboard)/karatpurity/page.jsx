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
import KaratPurityModal from "./_components/KaratPurityModal";
import KaratPurityTable from "./_components/KaratPurityTable";
import { STATUS_CODE } from "@/lib/Constant";

const KaratPurityMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [karatPurityList, setKaratPurityList] = useState([]);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  const GetKaratPurityList = () => {
    callApi(`${API_URL?.KARAT_PURITY_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setKaratPurityList(result?.data);
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
        callApi(`${API_URL?.UPDATE_KARAT_PURITY_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetKaratPurityList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteParaType = (id) => {
    Swal.fire({
      title: "Delete Karat Purity",
      text: "Are You Sure Want To Delete Karat Purity?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_KARAT_PURITY}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetKaratPurityList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) => {
        return index + 1;
      },
    },
    {
      name: "Metal Stamp",
      selector: (row) => row.karat,
    },
    {
      name: "Gravity",
      selector: (row) => row.gravity,
    },
    {
      name: "Status",
      cell: (row) => {
        return (
          <span
            className={`hand px-4 py-2 text-xs rounded-md ${row.status == "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              } `}
            onClick={() => UpdateStatus(row?.id)}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      name: "Action",
      cell: (row) => {
        return (
          <>
            <div>
              <MdEdit
                color="green"
                className="hand hover: rounded-lg hover:bg-green-200 p-1"
                size={30}
                onClick={() => handleShowModal(row)}
              />
            </div>
            <div className="ml-5">
              <MdDelete
                color="red"
                className="hand hover: rounded-lg hover:bg-red-200 p-1"
                size={30}
                onClick={() => DeleteParaType(row?.id)}
              />
            </div>
          </>
        );
      },
    },
  ];

  const handleShowModal = (rowData = "") => {
    if (rowData) {
      setRowData(rowData);
    } else {
      setRowData({});
    }
    setOpenDrawer(true);
  };

  useEffect(() => {
    GetKaratPurityList();
  }, []);

  console.log("karat list--->", karatPurityList);
  return (
    <>
      <div className="flex items-center mb-3 justify-between">
        <div className="text-lg font-semibold">Karat Purity </div>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Add Karat Purity
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
        {/* <DataTable
          columns={columns}
          data={karatPurityList}
          pagination={true}
          paginationPerPage={10}
        /> */}
        <KaratPurityTable
          onUpdateStatus={UpdateStatus}
          onEditKarat={handleShowModal}
          onDelete={DeleteParaType}
          tableData={karatPurityList}
        />
      </div>

      <KaratPurityModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetKaratPurityList={GetKaratPurityList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default KaratPurityMaster;
