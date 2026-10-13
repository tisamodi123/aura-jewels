"use client";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { FaFileDownload } from "react-icons/fa";
import "@/styles/collectiontable.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Link } from "lucide-react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import TableSkeleton from "@/components/tableSkeleton";

export default function PreviousUploadFileTable({
  onDelete,
  onEdit,
  isSuccess,
  onUpdateStatus,
}) {
  //** Get Token */
  const token = getToken();

  // ** States **/

  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [importHistoryData, setImportHistoryData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const noImg = PREFIX + "/noImagee.png";
  const [data, setData] = useState([]);
  const columns = useMemo(
    () => [
      {
        header: "No",
        accessorKey: "",
        id: "no",
        cell: (info) => <div>{info.row.index + 1}</div>,
      },
      { header: "FileName", accessorKey: "fileName" },
      { header: "Date & Time", accessorKey: "createdAt" },
      { header: "Upload By", accessorKey: "uploadedBy.name" },
      {
        header: "Download",
        accessorKey: "uploadedFileUrl",
        id: "download",
        cell: (info) => {
          const fileUrl = info.getValue();

          // The file lives on S3 in production, so a same-origin <a download>
          // is useless — the `download` attribute is ignored cross-origin and
          // an empty href just navigates. Open it like the Success/Rejected
          // sheets, and show N/A when there is genuinely no URL.
          const handleDownload = () => {
            try {
              window.open(fileUrl, "_blank");
            } catch (err) {
              toast.error(M.common.somethingWentWrong);
            }
          };

          return (
            <div className="flex justify-center items-center">
              {fileUrl ? (
                <Image
                  src={`${PREFIX}/downloadIcon.svg`}
                  alt="Download Icon"
                  height={15}
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                  width={15}
                  onClick={handleDownload}
                  title="Download the uploaded source file"
                />
              ) : (
                <div className="text-gray-400">N/A</div>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        // Lists the products that actually landed (INSERTED / UPDATED per row).
        // Null for imports that ran before the Success sheet existed.
        header: "Success File",
        accessorKey: "successFileUrl",
        cell: (info) => {
          const fileUrl = info.getValue();

          const handleDownload = async () => {
            try {
              window.open(fileUrl, '_blank');
            } catch (err) {
              toast.error(M.common.somethingWentWrong);
            }
          };

          return (
            <div className="flex items-center justify-center cursor-pointer">
              {fileUrl ? (
                <button
                  onClick={handleDownload}
                  className="hover:opacity-80 transition-opacity"
                  type="button"
                  title="Download imported products (Success)"
                >
                  <FaFileDownload color="#2f9e44" size={18} />
                </button>
              ) : (
                <div className="text-gray-400">N/A</div>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Rejected File",
        accessorKey: "rejectedFileUrl",
        cell: (info) => {
          const fileUrl = info.getValue();

          const handleDownload = async () => {
            try {
              window.open(fileUrl, '_blank');
            } catch (err) {
              toast.error(M.common.somethingWentWrong);
            }
          };

          return (
            <div className="flex items-center justify-center cursor-pointer">
              {info?.getValue() ? (
                <button
                  onClick={handleDownload}
                  className="hover:opacity-80 transition-opacity"
                  type="button"
                  title="Download rejected rows"
                >
                  <FaFileDownload color="#fa5252" size={18} />
                </button>
              ) : (
                <div className="text-gray-400">N/A</div>
              )}
            </div>
          );
        },
      },

      // {
      //   header: "Delete",
      //   accessorKey: "",
      //   id: "action",
      //   cell: (info) => (
      //     <div className="flex items-center justify-center gap-2">
      //       <div
      //         onClick={() => onDelete(info.row.original.id)}
      //         className="cursor-pointer"
      //       >
      //         <img
      //           src={PREFIX + "/trashIcon2.svg"}
      //           alt="penicl icon"
      //           height={16}
      //           width={16}
      //         />
      //       </div>
      //     </div>
      //   ),
      // },
    ],
    []
  );
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  });

  useEffect(() => {
    getImportHistoryData();
  }, [isSuccess, pagination.pageIndex, pagination.pageSize]);

  const getImportHistoryData = () => {
    setImportHistoryData([]);
    setIsLoading(true);
    const formData = new FormData();
    formData.append("page", pagination.pageIndex + 1);
    formData.append("limit", pagination.pageSize);

    callApi(`${API_URL?.GET_IMPORT_JEWELLEY_HISTORY}`, "POST", formData, token)
      .then((result) => {
        setIsLoading(false);
        if (result?.errorCode === STATUS_CODE.OK) {
          setData(result?.data);
          setTotalRows(result?.pagination?.total > 0 ? result?.pagination?.total : 0);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error fetching import history:", error);
      });
  };

  return (
    <>

      <div
        className="flex px-4 py-3 h-14  items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center gap-4">
          <div className="text-md font-semibold">Previous Upload Files</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="border h-8 flex justify-center items-center rounded-lg border-[#E4E8EE] p-1.5 transition-all duration-300 ease-in-out">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className={`
        transition-all duration-500 ease-in-out
        bg-transparent text-sm
        ${showInput ? "w-40 px-2 visible" : "w-0 px-0 invisible"}
        border-none outline-none
      `}
            />
            <Image
              onClick={() => setShowInput(!showInput)}
              src={`${PREFIX}/searchIcon.svg`}
              alt="search Icon"
              height={15}
              width={15}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
      {/* Main Upload File Table */}
      <div className="uploadFilesTable" title="mainTable">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                      userSelect: "none",
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          justifyContent: "center",
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && <span>⇅</span>}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}

          </thead>
          {isLoading ? (
            <TableSkeleton row={5} cell={columns.length} />
          ) : (
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>
      {/* Pagination */}
      <div>
        {data?.length > 0 && (
          <div className="flex justify-between items-center border-t-gray-300 p-4 bg-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm">
                  <SelectValue
                    placeholder={`${table.getState().pagination.pageSize}`}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem
                      className="hover:bg-gray-100"
                      key={pageSize}
                      value={String(pageSize)}
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <button
                className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${table.getCanPreviousPage()
                  ? "bg-[#e4e4e7] hover:bg-gray-100 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                  }`}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <Select
                value={String(table.getState().pagination.pageIndex + 1)}
                onValueChange={(value) => table.setPageIndex(Number(value) - 1)}
              >
                <SelectTrigger className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm">
                  <SelectValue
                    placeholder={`Page ${table.getState().pagination.pageIndex + 1
                      }`}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {Array.from({ length: table.getPageCount() }, (_, index) => (
                    <SelectItem key={index + 1} value={String(index + 1)}>
                      {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${table.getCanNextPage()
                  ? "bg-[#e4e4e7] hover:bg-gray-100 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                  }`}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

{
  /* <Image
  src={imageUrl}
  alt="..."
  width={300}
  height={300}
  onError={(e) => (e.target.src = "/fallback.png")}
/> */
}
