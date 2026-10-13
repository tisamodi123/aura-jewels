"use client";
import { PREFIX } from "@/lib/APIUrl";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";

export default function LabelTable({
  tableData,
  onUpdateStatus,
  OnDelete,
  loading,
  handleShowModal,
  pagination,
  setPagination,
  totalRows,
  searchText,
  setSearchText,
}) {
  const [showInput, setShowInput] = useState(false);

  const columns = useMemo(
    () => [
      {
        header: "Stone Type",
        accessorKey: "stoneType",
        cell: (info) => (
          <span className="font-semibold text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full uppercase">
            {info.getValue() || "-"}
          </span>
        ),
      },
      {
        header: "Color",
        accessorKey: "color",
        // Free text now. A legacy row may still hold a populated Parameter
        // object until the migration script has run; render its code.
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span>-</span>;
          return <span>{typeof val === "object" ? (val.code || val.name || "-") : val}</span>;
        },
      },
      {
        header: "Clarity",
        accessorKey: "clarity",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span>-</span>;
          return <span>{typeof val === "object" ? (val.code || val.name || "-") : val}</span>;
        },
      },
      {
        header: "Display Label",
        accessorKey: "labelName",
        cell: (info) => <span className="font-bold text-sm text-[#087B5D]">{info.getValue() || "-"}</span>,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue();
          const id = info.row.original._id;
          return (
            <span
              onClick={() => onUpdateStatus(id)}
              className={`${status === "ACTIVE"
                  ? "text-[#17863E] bg-[#17863e1a]"
                  : "text-[#ED4842] bg-[#ed48421a]"
                } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => {
          const id = info.row.original._id;
          return (
            <div className="flex items-center justify-center gap-3">
              <div
                onClick={() => handleShowModal(info.row.original)}
                className="cursor-pointer"
              >
                <Image
                  src={PREFIX + "/pencil.svg"}
                  alt="edit"
                  height={18}
                  width={18}
                />
              </div>
              <div onClick={() => OnDelete(id)} className="cursor-pointer">
                <Image
                  src={PREFIX + "/trashIcon.svg"}
                  alt="delete"
                  height={14}
                  width={14}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [handleShowModal, OnDelete, onUpdateStatus],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  });

  const pageCount = Math.ceil(totalRows / pagination.pageSize) || 1;

  return (
    <div className="w-full">
      <div className="flex px-4 py-3 items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <div className="border h-9 flex items-center rounded-lg border-[#E4E8EE] px-2">
            <input
              type="text"
              placeholder="Search display label..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className={`transition-all duration-300 bg-transparent text-sm outline-none ${showInput ? "w-48 visible" : "w-0 invisible"
                }`}
            />
            <Image
              onClick={() => setShowInput(!showInput)}
              src={`${PREFIX}/searchIcon.svg`}
              alt="search"
              height={16}
              width={16}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-[0.85rem] text-gray-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 font-semibold text-left border-b"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {loading ? (
            <TableSkeleton row={5} cell={6} />
          ) : tableData.length === 0 ? (
            <NoDataFound headerLength={6} />
          ) : (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 text-sm">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-left border-b text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {tableData.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                  pageIndex: 0,
                }))
              }
            >
              <SelectTrigger className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white">
                <SelectValue placeholder={`${pagination.pageSize}`} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem
                    className="hover:bg-gray-100"
                    key={size}
                    value={String(size)}
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {pagination.pageIndex + 1} of {pageCount}
            </span>
            <button
              className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${pagination.pageIndex > 0
                  ? "bg-[#e4e4e7] hover:bg-gray-100 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              disabled={pagination.pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <Select
              value={String(pagination.pageIndex + 1)}
              onValueChange={(value) =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Number(value) - 1,
                }))
              }
            >
              <SelectTrigger className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white">
                <SelectValue placeholder={`Page ${pagination.pageIndex + 1}`} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Array.from({ length: pageCount }, (_, index) => (
                  <SelectItem key={index + 1} value={String(index + 1)}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${pagination.pageIndex + 1 < pageCount
                  ? "bg-[#e4e4e7] hover:bg-gray-100 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              disabled={pagination.pageIndex + 1 >= pageCount}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
