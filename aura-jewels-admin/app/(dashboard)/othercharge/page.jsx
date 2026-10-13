"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import DataTable from "react-data-table-component";
import { HomeIcon } from "lucide-react";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";
import { useFormik } from "formik";
import { STATUS_CODE } from "@/lib/Constant";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { MdDelete, MdEdit } from "react-icons/md";
import OtherChargeModal from "./_components/OtherChargeModal";
import OtherChargeTable from "./_components/OtherChargeTable";

const OtherChargeMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [otherChargeList, setOtherChargeList] = useState([]);
  const [otherChargeCode, setOtherChargeCode] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [otherChargeId, setOtherChargeId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  const GetOtherChargeList = () => {
    callApi(`${API_URL?.OTHER_CHARGE_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setOtherChargeList(result?.data);
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
        callApi(`${API_URL?.UPDATE_OTHER_CHARGE_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetOtherChargeList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteParaType = (id) => {
    Swal.fire({
      title: "Delete Other Charge",
      text: "Are You Sure Want To Delete Other Charge?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_OTHER_CHARGE}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetOtherChargeList();
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
      name: "Other Charge Code",
      selector: (row) => row.chargeCode,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
    },
    {
      name: "Remark",
      selector: (row) => row.remark,
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
    GetOtherChargeList();
  }, []);
  console.log("other charge table-->", otherChargeList);
  return (
    <>
      <div className=" flex items-center text-lg font-semibold mb-3 justify-between">
        <div>Other Charge</div>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Add Charge
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md p-3 mb-5">
        {/* <DataTable
          columns={columns}
          data={otherChargeList}
          pagination={true}
          paginationPerPage={10}
        /> */}
        <OtherChargeTable
          onDelete={DeleteParaType}
          onEdit={handleShowModal}
          onUpdateStatus={UpdateStatus}
          tableData={otherChargeList}
        />
      </div>

      <OtherChargeModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetOtherChargeList={GetOtherChargeList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default OtherChargeMaster;
