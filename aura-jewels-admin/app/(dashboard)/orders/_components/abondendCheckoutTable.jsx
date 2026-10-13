"use client";
import { PREFIX } from "@/lib/APIUrl";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "@/styles/collectiontable.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AbondendCheckoutTable() {
  const tableData = [
    {
      checkId: "#3543443244",
      date: "Monday at 6:52 PM",
      customer: "Rohan Jadhav",
      region: "Surat GJ, India",
      emailStatus: "Not Sent",
      recoveryStatus: "Not Recovered",
      total: "₹10,000.00",
    },
    {
      checkId: "#3543443244",
      date: "Monday at 6:52 PM",
      customer: "Rohan Jadhav",
      region: "Surat GJ, India",
      emailStatus: "Not Sent",
      recoveryStatus: "Not Recovered",
      total: "₹10,000.00",
    },
    {
      checkId: "#3543443244",
      date: "Monday at 6:52 PM",
      customer: "Rohan Jadhav",
      region: "Surat GJ, India",
      emailStatus: "Not Sent",
      recoveryStatus: "Not Recovered",
      total: "₹10,000.00",
    },
    {
      checkId: "#3543443244",
      date: "Monday at 6:52 PM",
      customer: "Rohan Jadhav",
      region: "Surat GJ, India",
      emailStatus: "Not Sent",
      recoveryStatus: "Not Recovered",
      total: "₹10,000.00",
    },
    {
      checkId: "#3543443244",
      date: "Monday at 6:52 PM",
      customer: "Rohan Jadhav",
      region: "Surat GJ, India",
      emailStatus: "Not Sent",
      recoveryStatus: "Not Recovered",
      total: "₹10,000.00",
    },
    {
      checkId: "#3543443244",
      date: "Monday at 6:52 PM",
      customer: "Rohan Jadhav",
      region: "Surat GJ, India",
      emailStatus: "Not Sent",
      recoveryStatus: "Not Recovered",
      total: "₹10,000.00",
    },
  ];
  const [isLoading, setIsLoading] = useState(true);

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
  const router = useRouter();
  const columns = useMemo(
    () => [
      {
        id: "checkbox",
        accessorKey: "",
        header: ({ table }) => (
          <div className="flex justify-center">
            <input type="checkbox" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input type="checkbox" />
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Checkout",
        accessorKey: "checkId",
      },
      { header: "Date", accessorKey: "date" },
      { header: "Customer", accessorKey: "customer" },
      {
        header: "Region",
        accessorKey: "region", // <-- yeh original array ka naam
      },
      {
        header: "Email Status",
        accessorKey: "emailStatus",
        cell: (info) => {
          return (
            <span className="bg-[#F0D747] text-[0.80rem] px-4 py-1.5 rounded-md">
              {info.getValue()}
            </span>
          );
        },
      },
      {
        header: "Recovery Status",
        accessorKey: "recoveryStatus",
        cell: (info) => {
          return (
            <span className="bg-[#FFB37C] text-[0.80rem] px-4 py-1.5 rounded-md">
              {info.getValue()}
            </span>
          );
        },
      },
      {
        header: "Total",
        accessorKey: "total",
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
        className="flex px-4 py-3 h-14  items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center">
          <div className="text-[0.90rem] cursor-pointer pr-3 border-r-[1px] border-[#E4E8EE]">
            All
          </div>
          <div className="text-[0.90rem] cursor-pointer pr-3 pl-3 text-[#656B7B] border-r-[1px] border-[#E4E8EE]">
            Active
          </div>
          <div className="text-[0.90rem] cursor-pointer pr-3 pl-3 text-[#656B7B]">
            Archieved
          </div>
          <div className="border h-7 w-7 flex cursor-pointer justify-center items-center rounded-md border-[#E4E8EE] p-1">
            <Image
              src={`${PREFIX}/filterFunnel.svg`}
              alt="addIcon"
              height={14}
              width={14}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="border h-7 w-7 flex justify-center cursor-pointer items-center rounded-md border-[#E4E8EE] p-1">
            <Image
              src={`${PREFIX}/searchIcon.svg`}
              alt="search Icon"
              height={15}
              width={15}
            />
          </div>
          <div className="border h-7 w-7 flex justify-center cursor-pointer items-center rounded-md border-[#E4E8EE] p-1">
            <Image
              src={`${PREFIX}/updownarrow.svg`}
              alt="UpDownArrowIcon"
              height={15}
              width={15}
            />
          </div>
        </div>
      </div>
      {/* Main Abondend Table */}
      <div className="abondendCheckoutTable overflow-auto" title="mainTable">
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
              <tr
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/orders/abandon-checkout/3924923`)}
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
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
