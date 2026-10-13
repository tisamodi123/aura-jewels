"use client";

//** React imports */
import React, { useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";

//** Third party imports */
import { Download } from "lucide-react";
import DataTable from "react-data-table-component";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { isValidData } from "../../../../../lib/utils";
import useTableHeight from "@/hooks/useTableHeightHooks";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

//** Custom component imports */
import TableSkeletonLoader from "@/components/tableSkeletonLoader";
import PreviousUploadFileTable from "./previousUpload";

const ImportHistoryTable = ({ isSuccess }) => {
  //** Get Token */
  const token = getToken();

  //** Custom hooks */
  const tableHieght = useTableHeight(320);

  //** State */
  const [perPage, setPerPage] = useState(25);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [importHistoryData, setImportHistoryData] = useState([]);
  // Natural , Lab Grown

  useEffect(() => {
    getImportHistoryData();
  }, [perPage, currentPage, isSuccess]);

  const getImportHistoryData = () => {
    setImportHistoryData([]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("page", currentPage);
    formData.append("limit", perPage);

    callApi(`${API_URL?.GET_IMPORT_JEWELLEY_HISTORY}`, "POST", formData, token)
      .then((result) => {
        setIsLoading(false);
        if (result?.errorCode === STATUS_CODE.OK) {
          setImportHistoryData(result?.data);
          setTotalRows(result?.count > 0 ? result?.count : 0);
        }
      })
      .catch((error) => setIsLoading(false));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when per-page changes
  };

  console.log(importHistoryData, "Import History Data");

  const columns = [
    {
      name: "File Name",
      cell: (row) => (
        <div>
          {isValidData(row?.fileName) ? row?.fileName : <span>{"-"}</span>}
        </div>
      ),
    },
    {
      name: "Uploaded By",
      cell: (row) => (
        <div>
          {isValidData(row?.uploadedBy?.name) ? row?.uploadedBy?.name : <span>{"-"}</span>}
        </div>
      ),
    },
    {
      name: "Created By",
      cell: (row) => (
        <div>
          {isValidData(row?.createdBy?.name) ? row?.createdBy?.name : <span>{"-"}</span>}
        </div>
      ),
    },
    {
      name: "Download",
      cell: (row) => (
        <div>
          {isValidData(row.url) ? (
            <Link
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              <Download />
            </Link>
          ) : (
            <span>{"-"}</span>
          )}
        </div>
      ),
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
    <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
      <DataTable
        columns={columns}
        data={importHistoryData}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[25, 50, 100]}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
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
      {/* <PreviousUploadFileTable /> */}
    </div>
  );
};

export default ImportHistoryTable;
