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
import CurrencyModal from "./_components/CurrencyModal";
import CurrencyTable from "./_components/CurrencyTable";
import { STATUS_CODE } from "@/lib/Constant";

const CurrencyMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [currencyList, setCurrencyList] = useState([]);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  const GetCurrencyList = () => {
    callApi(`${API_URL?.CURRENCY_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setCurrencyList(result?.data);
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
        callApi(`${API_URL?.UPDATE_CURRENCY_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCurrencyList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteCurrency = (id) => {
    Swal.fire({
      title: "Delete Currency",
      text: "Are You Sure Want To Delete Currency?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_CURRENCY}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCurrencyList();
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
      name: "Currency Name",
      selector: (row) => row.currency,
    },
    {
      name: "Caption",
      selector: (row) => row.caption,
    },
    {
      name: "Sign",
      selector: (row) => row.sign,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
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
                onClick={() => DeleteCurrency(row?.id)}
              />
            </div>
          </>
        );
      },
    },
  ];
  console.log("currenct data->>>", currencyList);
  const handleShowModal = (rowData = "") => {
    if (rowData) {
      setRowData(rowData);
    } else {
      setRowData({});
    }
    setOpenDrawer(true);
  };

  useEffect(() => {
    GetCurrencyList();
  }, []);

  return (
    <>
      <div className=" flex items-center text-lg font-semibold mb-3 justify-between">
        <div>Currency</div>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Add Currency
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
        {/* <DataTable
          columns={columns}
          data={currencyList}
          pagination={true}
          paginationPerPage={10}
        /> */}
        <CurrencyTable
          onUpdateStatus={UpdateStatus}
          onEditCurrency={handleShowModal}
          onDeleteCurrency={DeleteCurrency}
          tableData={currencyList}
        />
      </div>

      <CurrencyModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetCurrencyList={GetCurrencyList}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default CurrencyMaster;
