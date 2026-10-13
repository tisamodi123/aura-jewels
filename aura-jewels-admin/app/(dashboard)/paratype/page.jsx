"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import DataTable from "react-data-table-component";
import { HomeIcon } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { usePathname } from "next/navigation";
import { MdDelete, MdEdit } from "react-icons/md";
import ParaTypeModal from "./_components/ParaTypeModal";

const ParaTypeMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [paraTypeList, setParaTypeList] = useState([]);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  const GetParaTypeList = () => {
    callApi(`${API_URL?.PARA_TYPE_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setParaTypeList(result?.data);
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
        callApi(`${API_URL?.UPDATE_PARA_TYPE_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetParaTypeList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteParaType = (id) => {
    Swal.fire({
      title: "Delete Para Type",
      text: "Are You Sure Want To Delete ParaType?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_PARA_TYPE}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetParaTypeList();
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
      name: "Para Type Name",
      selector: (row) => row.name,
    },
    {
      name: "Type",
      selector: (row) => row.type,
    },
    {
      name: "Description",
      selector: (row) => row.description,
    },
    {
      name: "Status",
      cell: (row) => {
        return (
          <span
            className={`hand px-4 py-2 text-xs rounded-md ${
              row.status == "ACTIVE"
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
    GetParaTypeList();
  }, []);

  return (
    <>
      <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm flex justify-between">
        <nav aria-label="Breadcrumb" className="la pt-2">
          <ol role="list" className="flex">
            <li>
              <div>
                <Link href="/dashboard" className="flex">
                  <HomeIcon
                    size={18}
                    className="cursor-pointer text-blue-900 mr-2"
                  />
                  <span>Home</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex">
                <svg
                  fill="#888"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="flex-none w-[25px]"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path>
                </svg>
                <span>All Settings</span>
              </div>
            </li>
            <li>
              <div className="flex">
                <svg
                  fill="#888"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="flex-none w-[25px]"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path>
                </svg>
                <span>{title} Master</span>
              </div>
            </li>
          </ol>
        </nav>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Create
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md p-3 mb-5">
        <DataTable
          columns={columns}
          data={paraTypeList}
          pagination={true}
          paginationPerPage={10}
        />
      </div>

      <ParaTypeModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetParaTypeList={GetParaTypeList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default ParaTypeMaster;
