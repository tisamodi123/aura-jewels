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
import VendorModal from "./_components/VendorModal";
import VendorTable from "./_components/VendorTable";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

const VendorMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [vendorList, setVendorList] = useState([]);

  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  const GetVendorList = () => {
    callApi(`${API_URL?.VENDOR_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setVendorList(result?.vendorList);
        }
      });
  };

  const UpdateStatus = (id) => {
    const targetId = typeof id === "object" ? id?.id : id;
    console.log("Updating status for vendor ID:", targetId);

    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_VENDOR_STATUS}/${targetId}`, "PUT", null, token)
          .then((result) => {
            console.log("Update Status Response:", result);
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetVendorList();
            } else {
              toast.error(result?.message);
            }
          })
          .catch((err) => {
            console.error("Update Status Error:", err);
            toast.error(M.common.updateFailed);
          });
      }
    });
  };

  const DeleteVendor = (id) => {
    const targetId = typeof id === "object" ? id?.id : id;
    console.log("Attempting to delete vendor with ID:", targetId);

    Swal.fire({
      title: "Delete Vendor!",
      text: "Are You Sure Want To Delete Vendor?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        console.log("Confirmed deletion for ID:", targetId);
        callApi(`${API_URL?.DELETE_VENDOR}/${targetId}`, "DELETE", null, token)
          .then((result) => {
            console.log("Delete API Response:", result);
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetVendorList();
            } else {
              toast.error(result?.message);
            }
          })
          .catch((err) => {
            console.error("Delete Error:", err);
            toast.error(M.common.deleteFailed);
          });
      }
    });
  };

  const handleExportList = () => {
    callApi(`${API_URL?.EXPORT_VENDOR}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK && result?.url) {
          window.location.href = result?.url;
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
      name: "First Name",
      selector: (row) => row.firstName,
    },
    {
      name: "Last Name",
      selector: (row) => row.lastName,
    },
    {
      name: "Email",
      selector: (row) => row.email,
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
    },
    {
      name: "Created At",
      selector: (row) => row.createOn,
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
                onClick={() => DeleteVendor(row?.id)}
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
    GetVendorList();
  }, []);

  return (
    <>
      <div className=" flex items-center text-lg font-semibold mb-3 justify-between">
        <div>Vendor</div>
        <div>
          <Button
            className="hand bg-black text-white mr-2"
            onClick={() => handleExportList()}
          >
            Export List
          </Button>
          <Button
            className="hand bg-black text-white"
            onClick={() => handleShowModal()}
          >
            Create
          </Button>
        </div>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md p-3 mb-5">
        {/* <DataTable
          columns={columns}
          data={vendorList}
          pagination={true}
          paginationPerPage={10}
        /> */}
        <VendorTable
          onUpdateStatus={UpdateStatus}
          onEditVendor={handleShowModal}
          onDelete={DeleteVendor}
          tableData={vendorList}
        />
      </div>

      <VendorModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetVendorList={GetVendorList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default VendorMaster;
