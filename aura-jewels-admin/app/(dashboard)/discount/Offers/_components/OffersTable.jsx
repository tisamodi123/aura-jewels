"use client";

import React, { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Edit3, Trash2, Search, X, Loader2 } from "lucide-react";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";
import TablePagination from "@/components/TablePagination";

export default function OffersTable({
  tableData,
  loading,
  onUpdateStatus,
  onDelete,
  handleEditClick,
  pagination,
  setPagination,
  totalRows,
  searchText,
  setSearchText,
}) {

  const [showInput, setShowInput] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const columns = useMemo(
    () => [
      {
        header: "Offer Code",
        accessorKey: "code",
        cell: (info) => (
          <span className="font-mono font-bold text-zinc-950">
            {info.getValue() || "-"}
          </span>
        ),
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: (info) => (
          <span className="font-medium text-zinc-900">
            {info.getValue() || "-"}
          </span>
        ),
      },
      {
        header: "Duration",
        id: "duration",
        cell: (info) => {
          const row = info.row.original;
          const formattedStart = row.startDate
            ? new Date(row.startDate).toLocaleDateString("en-GB")
            : "-";
          const formattedEnd = row.endDate
            ? new Date(row.endDate).toLocaleDateString("en-GB")
            : "-";
          return (
            <span className="text-zinc-500 whitespace-nowrap">
              {formattedStart} to {formattedEnd}
            </span>
          );
        },
      },
      {
        header: "Min/Max Price",
        id: "priceRange",
        cell: (info) => {
          const row = info.row.original;
          const fromPrice = row.priceRange?.from ?? 0;
          const toPrice = row.priceRange?.to ?? 0;
          return (
            <span className="text-zinc-500">
              ₹{fromPrice} - ₹{toPrice}
            </span>
          );
        },
      },
      {
        header: "Applied On",
        accessorKey: "appliedOn",
        cell: (info) => {
          const a = String(info.row.original?.appliedOn || "product").toLowerCase();
          const label = a === "diamond" ? "Diamond Price"
            : a === "making charge" ? "Making Charge"
              : a === "combined" ? "Diamond + Making"
                : "Final Price";
          return <span className="text-zinc-700">{label}</span>;
        },
      },
      {
        header: "Discount Type",
        accessorKey: "discountType",
        cell: (info) => {
          const row = info.row.original;
          const isCombined = String(row?.appliedOn || "").toLowerCase() === "combined";
          const val = isCombined ? "combined" : info.getValue();
          return (
            <span
              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${val?.toLowerCase() === "percentage"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-purple-50 text-purple-700 border border-purple-200"
                }`}
            >
              {val || "-"}
            </span>
          );
        },
      },
      {
        header: "Discount Value",
        id: "discountValue",
        cell: (info) => {
          const row = info.row.original;
          // Combined offers use the two component %s; discountValue is 0 and must
          // NOT render as "0%".
          const isCombined = String(row?.appliedOn || "").toLowerCase() === "combined";
          if (isCombined) {
            const parts = [];
            if (Number(row.makingChargePercent) > 0) parts.push(`${row.makingChargePercent}% Making`);
            if (Number(row.diamondPercent) > 0) parts.push(`${row.diamondPercent}% Diamond`);
            return <span className="font-semibold text-zinc-800">{parts.length ? parts.join(" + ") : "-"}</span>;
          }
          return (
            <span className="font-semibold text-zinc-800">
              {row.discountType?.toLowerCase() === "percentage"
                ? `${row.discountValue}%`
                : `₹${row.discountValue}`}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue() || "inactive";
          const row = info.row.original;
          const normalizedStatus = status.toLowerCase() === "active" ? "active" : "inactive";
          return (
            <Select
              disabled={updatingId === row._id}
              value={normalizedStatus}
              onValueChange={async (val) => {
                setUpdatingId(row._id);
                try {
                  await onUpdateStatus(row._id, val);
                } catch (err) {
                  console.error("Update status error:", err);
                } finally {
                  setUpdatingId(null);
                }
              }}
            >
              <SelectTrigger
                className={`inline-flex h-7 w-[95px] items-center justify-between px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all shadow-sm border-none focus:ring-0 focus:ring-offset-0 cursor-pointer ${normalizedStatus === "active"
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  } ${updatingId === row._id ? "opacity-70 pointer-events-none cursor-not-allowed [&>svg]:hidden" : ""}`}
              >
                {updatingId === row._id ? (
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <Loader2 size={10} className="animate-spin text-gray-600" />
                    <span>Updating</span>
                  </div>
                ) : (
                  <SelectValue placeholder={normalizedStatus} />
                )}
              </SelectTrigger>
              <SelectContent className="bg-white min-w-[100px] border border-zinc-200 shadow-lg rounded-md">
                <SelectItem value="active" className="text-[10px] font-bold uppercase text-green-800 hover:bg-green-50 focus:bg-green-50 focus:text-green-800 cursor-pointer">
                  Active
                </SelectItem>
                <SelectItem value="inactive" className="text-[10px] font-bold uppercase text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-800 cursor-pointer">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        header: "Actions",
        id: "actions",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEditClick(row)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Campaign"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(row._id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete Campaign"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        },
      },
    ],
    [handleEditClick, onDelete, onUpdateStatus]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  });

  return (
    <div className="w-full">
      {/* Table Header / Search Area */}
      <div className="flex px-4 py-3 items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <div className="border h-9 flex items-center rounded-lg border-[#E4E8EE] px-2 relative bg-white">
            <input
              type="text"
              placeholder="Search code or campaign name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`transition-all duration-300 bg-transparent text-sm outline-none ${showInput ? "w-56 pr-6 visible" : "w-0 invisible"
                }`}
            />
            {showInput && searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-8 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
            <Search
              onClick={() => setShowInput(!showInput)}
              size={16}
              className="cursor-pointer text-gray-400 hover:text-gray-600 ml-1"
            />
          </div>
        </div>

        {/* <span className="text-xs text-zinc-500 font-semibold bg-white border px-3 py-1.5 rounded-full shadow-sm">
          Total Campaigns: {totalRows}
        </span> */}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs text-left">
          <thead className="bg-gray-50 text-[10px] text-gray-600 font-semibold uppercase tracking-wider border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-3.5 px-4">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {loading ? (
            <TableSkeleton row={5} cell={8} />
          ) : tableData.length === 0 ? (
            <NoDataFound headerLength={8} />
          ) : (
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4">
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

      {/* Pagination Footer */}
      {tableData.length > 0 && (
        <TablePagination
          pagination={pagination}
          setPagination={setPagination}
          totalRows={totalRows}
        />
      )}
    </div>
  );
}