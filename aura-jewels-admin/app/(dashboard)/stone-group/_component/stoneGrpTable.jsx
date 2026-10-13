"use client";

//** React import */
import React, { useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";
import { useRouter } from "next/navigation";

//** Third party imports */
import { toast } from "sonner";
import DataTable from "react-data-table-component";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { formatedPrice, isValidData } from "@/lib/utils";
import useTableHeight from "@/hooks/useTableHeightHooks";

//** Custom component imports */
import TableSkeletonLoader from "@/components/tableSkeletonLoader";
import { MdDelete, MdEdit } from "react-icons/md";
import Swal from "sweetalert2";
import StoneGrpModal from "./StoneGrpModal";

const StoneGrpTable = () => {
  //** Get token */
  const token = getToken();

  //** Next Hooks */
  const router = useRouter();

  //** Custom hooks */
  const tableHieght = useTableHeight(320);

  //** State */
  const [perPage, setPerPage] = useState(25);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [stoneGrpData, setStoneGrpData] = useState([]);

  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    if (!isValidData(token)) {
      router.replace("login");
    } else {
      fetchStoneGrpData();
    }
  }, [perPage, currentPage]);

  const fetchStoneGrpData = async () => {
    try {
      setStoneGrpData([]);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("page", currentPage);
      formData.append("limit", perPage);

      const result = await callApi(`${API_URL?.STONE_GROUP_LIST}`, "POST", formData, token);
      setIsLoading(false);

      if (result?.errorCode === STATUS_CODE.OK) {
        setStoneGrpData(result?.data || []);
        setTotalRows(result?.count > 0 ? result?.count : 0);
      } else {
        setStoneGrpData([]);
        setTotalRows(0);
        toast.error(result?.message || M.common.fetchFailed);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Error fetching diamond data.", error);
      toast.error(M.common.fetchFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
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
        callApi(`${API_URL?.UPDATE_STONE_GROUP_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchStoneGrpData();
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

  const columns = [
    {
      name: "No",
      selector: (row, index) => {
        return index + 1;
      },
    },
    {
      name: "Shape",
      selector: (row) => row.shape,
    },
    {
      name: "Color",
      selector: (row) => row.color,
    },
    {
      name: "Clarity",
      selector: (row) => row.clarity,
    },
    {
      name: "Carat",
      selector: (row) => row.carat,
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
            {/* <div className="ml-5">
                        <MdDelete color='red' className='hand hover: rounded-lg hover:bg-red-200 p-1' size={30} 
                                onClick={() => DeleteParaType(row?.id)}
                        />
                </div> */}
          </>
        );
      },
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#F6F8FB", // Light grayish blue background
        color: "#67728A", // Text color
        fontWeight: "600", // Bold font
        fontSize: "14px",
        textTransform: "capitalize",
        borderBottom: "none",
        justifyContent: "center", // Center align cell content
        textAlign: "center",
      },
    },
    cells: {
      style: {
        justifyContent: "center", // Center align cell content
        textAlign: "center",
      },
    },
  };

  return (
    <>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
        <DataTable
          data={stoneGrpData}
          columns={columns}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[25, 50, 100]}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowChange}
          progressPending={isLoading}
          progressComponent={<TableSkeletonLoader rowLength={20} />}
          highlightOnHover
          fixedHeader
          // fixedHeaderScrollHeight={'500px'}
          fixedHeaderScrollHeight={tableHieght}
          customStyles={customStyles}
          noDataComponent={
            <div className="p-5 flex items-center text-center text-gray-500 h-[400px]">
              <p>No records found.</p>
            </div>
          }
        />
      </div>
      <StoneGrpModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        fetchStoneGrpData={fetchStoneGrpData}
        rowData={rowData}
        setRowData={setRowData}
      />
    </>
  );
};

export default StoneGrpTable;
