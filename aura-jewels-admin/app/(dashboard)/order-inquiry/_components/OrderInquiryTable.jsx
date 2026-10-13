"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PREFIX, JEWELLERY_IMAGE_PATH } from "@/lib/APIUrl";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { confirmDelete } from "@/lib/swal";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { showError, showSuccess } from "@/lib/toast";
import { STATUS_CODE } from "@/lib/Constant";
import Image from "next/image";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";
import TablePagination from "@/components/TablePagination";
import OrderInquiryStatusCell from "./OrderInquiryStatusCell";
import "@/styles/collectiontable.css";

export default function OrderInquiryTable({
  tableData,
  loading,
  totalRows,
  pagination,
  setPagination,
  refetch,
  onViewDetails,
  searchText,
  setSearchText,
}) {
  const token = getToken();
  const [data, setData] = useState([...tableData]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [showInput, setShowInput] = useState(false);

  // Helper to resolve product image
  const getImageSrc = (img) => {
    if (!img) return `${PREFIX || ""}/noImage2.jpg`;
    if (img.startsWith("http") || img.startsWith("/")) return img;
    return `${JEWELLERY_IMAGE_PATH || ""}${img}`;
  };

  // Helper to safely parse and fall back on sku/productId schema shapes
  const getProductInfo = (row) => {
    const productIdObj = row.productId || {};
    const skuObj = typeof row.sku === 'object' ? row.sku : {};
    const skuStr = typeof row.sku === 'string' ? row.sku : "";

    const title = productIdObj.productTitle || skuObj.productTitle || "—";
    const code = productIdObj.itemCode || skuObj.itemCode || skuStr || "—";
    const images = productIdObj.images || skuObj.images || [];
    const slug = productIdObj.slug || skuObj.slug || "";

    return { title, code, images, slug };
  };

  // Delete handler
  const handleDelete = async (inquiryId) => {
    const confirmation = await confirmDelete(
      "Delete Inquiry",
      "Are you sure you want to delete this order inquiry? This action cannot be undone."
    );

    if (confirmation.isConfirmed) {
      try {
        const url = API_URL.DELETE_ORDER_INQUIRY(inquiryId);
        const res = await callApi(url, "GET", null, token);

        if (res?.errorCode === STATUS_CODE.OK || res?.message === "Deleted successfully" || res?.status === 200) {
          showSuccess(res?.message || "Inquiry deleted successfully.");
          refetch();
        } else {
          showError(res?.message || "Failed to delete inquiry.");
        }
      } catch (error) {
        console.log("Delete inquiry error:", error);
        showError("An error occurred while deleting the inquiry.");
      }
    }
  };

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
        header: "Product Image",
        id: "productImage",
        cell: (info) => {
          const { images } = getProductInfo(info.row.original);
          const mainImage = images.find((img) => img.IsMainMedia)?.MediaLocation || images[0]?.MediaLocation;
          return (
            <div className="relative h-12 w-12 mx-auto rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
              <Image
                src={getImageSrc(mainImage)}
                alt="product"
                fill
                className="object-cover"
              />
            </div>
          );
        },
      },
      {
        header: "Product / SKU",
        id: "productSku",
        accessorFn: (row) => {
          const { title } = getProductInfo(row);
          return title;
        },
        cell: (info) => {
          const { title, code } = getProductInfo(info.row.original);
          return (
            <div className="text-left font-medium text-gray-800">
              <div className="line-clamp-1">{title}</div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5">{code}</div>
            </div>
          );
        },
      },
      {
        header: "Customer Details",
        id: "customerDetails",
        accessorFn: (row) => row.name || "—",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="text-left">
              <div className="font-semibold text-gray-800">{row.name || "—"}</div>
              <div className="text-xs text-gray-500 break-all">
                <a href={`mailto:${row.email}`} className="hover:underline text-indigo-600">
                  {row.email}
                </a>
              </div>
              {(row.phone || row.mobileNumber) && (
                <div className="text-[11px] text-gray-400 mt-0.5">
                  <a
                    href={`tel:${row.countryCode || ""}${row.phone || row.mobileNumber}`.replace(/\s+/g, "")}
                    className="hover:underline"
                  >
                    {row.countryCode ? `${row.countryCode} ` : ""}{row.phone || row.mobileNumber}
                  </a>
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: "Notes",
        accessorKey: "notes",
        cell: (info) => {
          const notes = info.getValue();
          return notes ? (
            <div className="max-w-[180px] truncate text-xs text-gray-500 italic mx-auto" title={notes}>
              "{notes}"
            </div>
          ) : (
            <span className="text-gray-300">—</span>
          );
        },
      },
      {
        header: "Status",
        id: "status",
        cell: (info) => (
          <OrderInquiryStatusCell inquiry={info.row.original} refetch={refetch} />
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
          <div className="flex items-center justify-center gap-1.5">
            <button
              title="View Details"
              onClick={() => onViewDetails(info.row.original._id)}
              className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-black"
            >
              <Eye size={16} />
            </button>
            <button
              title="Delete"
              onClick={() => handleDelete(info.row.original._id)}
              className="p-1.5 rounded-md hover:bg-rose-50 transition-colors text-rose-500 hover:text-rose-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize, refetch, onViewDetails, handleDelete]
  );

  // React Table
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
    onSortingChange: setSorting,
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

  // Sync data
  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  return (
    <>
      {/* Header controls inside table card */}
      <div className="flex px-4 py-3 h-14 items-center justify-between border-b border-zinc-100">
        <div className="text-sm font-semibold text-gray-500">
          {totalRows > 0 && `${totalRows} Inquir${totalRows !== 1 ? "ies" : "y"}`}
        </div>
        <div className="border h-8 flex items-center rounded-lg border-[#E4E8EE] p-1.5 bg-zinc-50 transition-all duration-300">
          <input
            type="text"
            placeholder="Search SKU or customer..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={`transition-all duration-500 bg-transparent text-xs border-none outline-none ${showInput ? "w-52 px-2 visible" : "w-0 px-0 invisible"
              }`}
          />
          <Image
            onClick={() => setShowInput(!showInput)}
            src={`${PREFIX}/searchIcon.svg`}
            alt="search Icon"
            height={15}
            width={15}
            className="cursor-pointer hover:scale-105 transition-transform"
          />
        </div>
      </div>

      <div className="collectionTable">
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
    </>
  );
}
