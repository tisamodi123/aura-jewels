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
import "@/styles/collectiontable.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { toast } from "sonner";
import SafeImage from "@/components/SafeImage";
import TableSkeleton from "@/components/tableSkeleton";
import Link from "next/link";
import UpdateSession from "./UpdateSession";
import Swal from "sweetalert2";

export default function SectionTable({ tableData, fetchData, isLoading }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [toggleValue, setToggleValue] = useState("Add");
  const [rowData, setRowData] = useState({});
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatatusModal, setShowSatatusModal] = useState(false);
  const token = getToken();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [data, setData] = useState([...tableData]);
  const columns = useMemo(
    () => [
      {
        id: "Sr.No",
        accessorKey: "srNo",
        header: "Sr.No",

        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        header: "Desktop Image",
        accessorKey: "image",
        cell: (info) => {
          return (
            <div className="flex  justify-center">
              <SafeImage
                src={info.getValue() || null}
                fallback={`${PREFIX}/noImage2.jpg`}
                fallbackWidth={50}
                fallbackHeight={50}
                alt={"descktop_image"}
              />
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Mobile Image",
        accessorKey: "mobile_img",
        cell: (info) => {
          return (
            <div className="flex  justify-center">
              <SafeImage
                src={info.getValue() || null}
                fallback={`${PREFIX}/noImage2.jpg`}
                fallbackWidth={50}
                fallbackHeight={50}
                alt={"descktop_image"}
              />
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        header: "Title",
        accessorKey: "title",
        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        header: "URL",
        accessorKey: "buttontext1",
        cell: (info) => {
          const field = info.row.original;
          console.log(field.buttonlink1);
          return (
            <div>
              <div className="">
                {field.buttonlink1 && (
                  <div className="pb-2">
                    <Link
                      target="_blank"
                      className="bg-black text-white p-2 rounded-md"
                      href={`${field["buttonlink1"]}`}
                    >
                      {field["buttontext1"]}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <span
            onClick={() => UpdateStatus(info.row.original.id)}
            className={`${info.getValue() === "ACTIVE"
                ? "text-[#17863E]  bg-[#17863e1a]"
                : "text-[#ED4842]  bg-[#ed48421a]"
              } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <div
              onClick={() => updateSessionHandler(info.row.original)}
              className="cursor-pointer"
            >
              <img
                src={PREFIX + "/pencil.svg"}
                alt="penicl icon"
                height={18}
                width={18}
              />
            </div>
            <div
              onClick={() => DeleteSession(info.row.original.id)}
              className="cursor-pointer"
            >
              <img
                src={PREFIX + "/trashIcon.svg"}
                alt="penicl icon"
                height={12}
                width={12}
              />
            </div>
          </div>
        ),
      },
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
  });

  // Update Session Handler

  const updateSessionHandler = (info) => {
    setEditValues(info);
    setOpenDrawer(true);
  };

  // Delete Session Handler

  const DeleteSession = (id) => {
    Swal.fire({
      title: "Delete Session",
      text: "Are You Sure Want To Delete This Slider?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_SESSION}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  // Update Session Status

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
        callApi(`${API_URL?.UPDATE_SESSION_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);
  return (
    <>
      {/* Table Header */}
      {/* <div
        className="flex px-4 py-3 h-14  items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center gap-4">
          <div className="border h-7 w-7 flex cursor-pointer justify-center items-center rounded-lg border-[#E4E8EE] p-1">
            <Image
              src={`${PREFIX}/searchIcon.svg`}
              alt="search Icon"
              height={15}
              width={15}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="border h-7 w-7 flex justify-center cursor-pointer items-center rounded-lg border-[#E4E8EE] p-1">
            <Image
              src={`${PREFIX}/updownarrow.svg`}
              alt="UpDownArrowIcon"
              height={15}
              width={15}
            />
          </div>
        </div>
      </div> */}
      {/* Main Section 1 Table */}
      <div className="sectionTable overflow-x-auto" title="mainTable">
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
            <TableSkeleton row={3} cell={11} />
          ) : (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
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
      {openDrawer && (
        <UpdateSession
          open={openDrawer}
          setOpen={setOpenDrawer}
          data={editValues}
          refetchFn={fetchData}
        />
      )}
    </>
  );
}
