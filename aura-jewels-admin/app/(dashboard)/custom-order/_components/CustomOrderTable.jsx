"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PREFIX } from "@/lib/APIUrl";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Eye, FilePlus, FileText } from "lucide-react";
import Image from "next/image";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";
import TablePagination from "@/components/TablePagination";
import CustomOrderDrawer from "./CustomOrderDrawer";
import AddQuotationModal from "./AddQuotationModal";
import QuotationViewModal from "./QuotationViewModal";
import "@/styles/collectiontable.css";
import StatusCell from "@/components/common/StatusCell";

export default function CustomOrderTable({
  tableData,
  loading,
  totalRows,
  pagination,
  setPagination,
  refetch,
}) {
  const [data, setData] = useState([...tableData]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [quotationOrder, setQuotationOrder] = useState(null);
  const [viewQuotationOrder, setViewQuotationOrder] = useState(null);

  // table columns
  const columns = useMemo(
    () => [
      {
        header: "#",
        id: "serial",
        enableSorting: false,
        cell: (info) =>
          pagination.pageIndex * pagination.pageSize + info.row.index + 1,
      },
      {
        header: "Customer Name",
        id: "customerName",
        accessorFn: (row) =>
          `${row.firstName || ""} ${row.lastName || ""}`.trim() || "—",
        cell: (info) => (
          <span className="font-medium text-gray-800">{info.getValue()}</span>
        ),
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: (info) => {
          const email = info.getValue();
          if (!email || email === "—") return "—";
          return (
            <a
              href={`mailto:${email}`}
              className="text-blue-600 hover:underline"
            >
              {email}
            </a>
          );
        },
      },
      {
        header: "Mobile",
        id: "mobile",
        accessorFn: (row) =>
          row.mobileNumber
            ? `${row.countryCode || ""} ${row.mobileNumber}`.trim()
            : "—",
        cell: (info) => {
          const row = info.row.original;
          if (!row.mobileNumber) return "—";
          const displayVal = `${row.countryCode || ""} ${row.mobileNumber}`.trim();
          const cleanPhone = `${row.countryCode || ""}${row.mobileNumber}`.replace(/\s+/g, "");
          return (
            <a
              href={`tel:${cleanPhone}`}
              className="text-blue-600 hover:underline"
            >
              {displayVal}
            </a>
          );
        },
      },
      {
        header: "Category",
        id: "category",
        accessorFn: (row) =>
          row.categoryId?.categoryName || row.categoryId || "—",
      },
      {
        header: "Metal",
        id: "metal",
        accessorFn: (row) => row.metalId?.name || row.metalId || "—",
      },
      {
        header: "Stone Type",
        id: "stoneType",
        accessorFn: (row) => row.stoneType || "—",
      },
      {
        header: "Budget",
        accessorKey: "budget",
        cell: (info) => {
          const val = info.getValue();
          return val ? `₹ ${Number(val).toLocaleString("en-IN")}` : "—";
        },
      },
      {
        header: "Status",
        id: "status",
        cell: (info) => (
          <StatusCell order={info.row.original} refetch={refetch} />
        ),
      },
      {
        header: "Submitted On",
        accessorKey: "createdAt",
        cell: (info) => {
          const val = info.getValue();
          return val
            ? new Date(val).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : "—";
        },
      },
      {
        header: "Action",
        id: "action",
        enableSorting: false,
        cell: (info) => (
          <div className="flex items-center justify-center gap-1">
            <button
              title="View Details"
              onClick={() => setSelectedOrder(info.row.original)}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
            >
              <Eye size={16} />
            </button>
            <button
              title="View Quotation"
              onClick={() => setViewQuotationOrder(info.row.original)}
              className="p-1.5 rounded-md hover:bg-emerald-50 transition-colors text-emerald-500 hover:text-emerald-700"
            >
              <FileText size={16} />
            </button>
            <button
              title="Add Quotation"
              onClick={() => setQuotationOrder(info.row.original)}
              className="p-1.5 rounded-md hover:bg-indigo-50 transition-colors text-indigo-400 hover:text-indigo-700"
            >
              <FilePlus size={16} />
            </button>
          </div>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  // react table
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // update table data when tableData changes
  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  // search
  useEffect(() => {
    const timer = setTimeout(() => setGlobalFilter(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <>
      <div className="flex px-4 py-3 h-14 items-center justify-between" title="table-header">
        <div className="text-sm font-medium text-gray-500">
          {totalRows > 0 && `${totalRows} order${totalRows !== 1 ? "s" : ""}`}
        </div>
        <div className="border h-8 flex items-center rounded-lg border-[#E4E8EE] p-1.5 transition-all duration-300">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={`transition-all duration-500 bg-transparent text-sm border-none outline-none ${showInput ? "w-52 px-2 visible" : "w-0 px-0 invisible"
              }`}
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

      <div className="collectionTable" title="mainTable">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    {!header.isPlaceholder && (
                      <div className="flex items-center justify-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <span>⇅</span>}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {loading && tableData.length === 0 ? (
            <TableSkeleton row={5} cell={columns.length} />
          ) : !loading && tableData.length > 0 ? (
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
          ) : !loading && tableData.length === 0 ? (
            <NoDataFound headerLength={columns.length} />
          ) : null}
        </table>
      </div>

      {/* Pagination */}
      {data?.length > 0 && (
        <TablePagination
          pagination={pagination}
          setPagination={setPagination}
          totalRows={totalRows}
        />
      )}

      {/* Detail Drawer */}
      <CustomOrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* View Quotation Modal */}
      <QuotationViewModal
        order={viewQuotationOrder}
        onClose={() => setViewQuotationOrder(null)}
      />

      {/* Add Quotation Modal */}
      <AddQuotationModal
        order={quotationOrder}
        onClose={() => setQuotationOrder(null)}
        onSuccess={refetch}
      />
    </>
  );
}