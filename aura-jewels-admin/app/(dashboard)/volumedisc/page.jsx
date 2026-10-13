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
import VolumeDiscModal from "./_components/VolumeDiscModal";
import VolumDiscTable from "./_components/VolumeDiscTable";
import { STATUS_CODE } from "@/lib/Constant";

const VolumeDiscout = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [volumeDisclist, setVolumeDiscList] = useState([]);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  const GetVolumeDiscList = () => {
    callApi(`${API_URL?.VOLUME_DISC_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setVolumeDiscList(result?.data);
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
        callApi(`${API_URL?.UPDATE_VOLUME_DISC_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetVolumeDiscList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteVolumeDisc = (id) => {
    Swal.fire({
      title: "Delete Volume Discount",
      text: "Are You Sure Want To Delete Volume Discount?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_VOLUME_DISC}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetVolumeDiscList();
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
      name: "From Amount",
      selector: (row) => row.fromAmount,
    },
    {
      name: "To Amount",
      selector: (row) => row.toAmount,
    },
    {
      name: "Discount%",
      selector: (row) => row.discount,
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
                onClick={() => DeleteVolumeDisc(row?.id)}
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
    GetVolumeDiscList();
  }, []);

  console.log("Volum list-->", volumeDisclist);
  return (
    <>
      <div className=" flex items-center text-lg font-semibold mb-3 justify-between">
        <div>Volume Discount</div>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Add Discount
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
        {/* <DataTable
          columns={columns}
          data={volumeDisclist}
          pagination={true}
          paginationPerPage={10}
        /> */}
        <VolumDiscTable
          tableData={volumeDisclist}
          onEdit={handleShowModal}
          onDelete={DeleteVolumeDisc}
          onUpdateStatus={UpdateStatus}
        />
      </div>

      <VolumeDiscModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetVolumeDiscList={GetVolumeDiscList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default VolumeDiscout;
