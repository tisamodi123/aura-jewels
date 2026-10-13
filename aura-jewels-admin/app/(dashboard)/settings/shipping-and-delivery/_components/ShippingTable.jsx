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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getToken } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";

export default function ShippingTable({ onUpdateStatus }) {
  //** Get Token */
  const token = getToken();

  // ** States **/
  const [openDrawer, setOpenDrawer] = useState(false);
  const [toggleValue, setToggleValue] = useState("Add");
  const [rowData, setRowData] = useState({});
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatatusModal, setShowSatatusModal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

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
  const [data, setData] = useState([
    {
      country: "India",
      minAmt: "5000",
      maxAmt: "5000",
      shippingCharge: "1000",
      number: "+91 34344343434",
      status: "Active",
    },
    {
      country: "India",
      minAmt: "5000",
      maxAmt: "5000",
      shippingCharge: "1000",
      number: "+91 34344343434",
      status: "Active",
    },
    {
      country: "India",
      minAmt: "5000",
      maxAmt: "5000",
      shippingCharge: "1000",
      number: "+91 34344343434",
      status: "Active",
    },
    {
      country: "India",
      minAmt: "5000",
      maxAmt: "5000",
      shippingCharge: "1000",
      number: "+91 34344343434",
      status: "Active",
    },
    {
      country: "India",
      minAmt: "5000",
      maxAmt: "5000",
      shippingCharge: "1000",
      number: "+91 34344343434",
      status: "Active",
    },
  ]);
  const columns = useMemo(
    () => [
      { header: "Contry", accessorKey: "country" },
      {
        header: "Minimum Amount",
        accessorKey: "minAmt",
        cell: (info) => <div>₹{info.getValue()}</div>,
      },

      {
        header: "Maximum Amount",
        accessorKey: "maxAmt",
        cell: (info) => <div>₹{info.getValue()}</div>,
      },
      {
        header: "Shipping Charge",
        accessorKey: "shippingCharge",
        cell: (info) => <div>₹{info.getValue()}</div>,
      },

      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const id = info.row.original._id;
          const status = info.row.original.status;
          return (
            <span
              className={`${
                "ACTIVE" === "ACTIVE"
                  ? "text-[#17863E]  bg-[#17863e1a]"
                  : "text-[#ED4842]  bg-[#ed48421a]"
              } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
            >
              {info.getValue()}
            </span>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => {
          const id = info.row.original._id;
          return (
            <div className="flex items-center justify-center gap-2">
              <div className="cursor-pointer">
                <img
                  src={PREFIX + "/pencil.svg"}
                  alt="penicl icon"
                  height={18}
                  width={18}
                />
              </div>
              <div>
                <img
                  src={PREFIX + "/trashIcon.svg"}
                  alt="penicl icon"
                  height={12}
                  width={12}
                />
              </div>
            </div>
          );
        },
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

  return (
    <>
      {/* Table Header */}
      <div
        className="flex px-6 py-3 h-14  items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#656B7B] ">Show 10 Entries</div>
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
      {/* Shipping Table */}
      <div className="shippingTable" title="mainTable">
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
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
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
                className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${
                  table.getCanPreviousPage()
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
                    placeholder={`Page ${
                      table.getState().pagination.pageIndex + 1
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
                className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${
                  table.getCanNextPage()
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
