"use client";

import React from "react";
import { HelpCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function AssociationTable({
  subtitle,
  title,
  isHeaderDark = false,
  data = [],
  total = 0,
  page = 1,
  pageSize = 10,
  setPage,
  setPageSize,
  selectedSet = new Set(),
  toggleSelect,
  toggleSelectAll,
  emptyMessage = "No products found.",
  emptySubtitle = "Try changing filters or search criteria."
}) {
  const allCurrentSelected = data.length > 0 && data.every((d) => selectedSet.has(d._id));

  return (
    <div className="bg-white rounded-lg border border-[#e4e8ee] shadow-md flex flex-col overflow-hidden">
      {/* Table Header Bar */}
      <div
        className={`flex px-4 py-3 h-10 items-center justify-between border-b border-[#e4e8ee] ${isHeaderDark ? "bg-zinc-900 text-white border-b-zinc-800" : "bg-[#f5f8fc] text-zinc-900"
          }`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isHeaderDark ? "text-zinc-400" : "text-zinc-400"}`}>
            {subtitle}
          </span>
          <h2 className="text-sm font-bold">{title}</h2>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isHeaderDark ? "bg-white/10 text-white" : "bg-zinc-200 text-zinc-700"
          }`}>
          {total} items
        </span>
      </div>

      {/* Main Table Content */}
      <div className="jewelleryTable overflow-auto">
        <table className="w-full text-left text-sm min-w-[1000px]">
          <thead>
            <tr className={isHeaderDark ? "!bg-zinc-800 !text-zinc-300" : ""}>
              <th className="p-3 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900 accent-zinc-900 cursor-pointer"
                />
              </th>
              <th className={isHeaderDark ? "!text-zinc-300" : ""}>Sku</th>
              <th className={isHeaderDark ? "!text-zinc-300" : ""}>Parent Code</th>
              <th className={isHeaderDark ? "!text-zinc-300" : ""}>ProductTitle</th>
              <th className={isHeaderDark ? "!text-zinc-300" : ""}>Category</th>
              <th className={isHeaderDark ? "!text-zinc-300" : ""}>Metal</th>
              <th className={isHeaderDark ? "!text-zinc-300" : ""}>Metal Wgt.</th>
              <th className={isHeaderDark ? "!text-zinc-300 text-right" : "text-right"}>Price</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row._id}
                onClick={() => toggleSelect(row._id)}
                className={`hover:bg-zinc-50 transition cursor-pointer ${selectedSet.has(row._id) ? "bg-zinc-50" : ""
                  }`}
              >
                <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedSet.has(row._id)}
                    onChange={() => toggleSelect(row._id)}
                    className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900 accent-zinc-900 cursor-pointer"
                  />
                </td>
                <td className="font-mono text-xs font-semibold text-zinc-600">
                  {row.itemCode}
                </td>
                <td className="font-mono text-xs font-semibold text-zinc-600">
                  {row.parentItemCode || "-"}
                </td>
                <td>{row.productTitle || "-"}</td>
                <td>{row.categoryId?.categoryName || "-"}</td>
                <td>{row.metalId?.metalName || "Gold"}</td>
                <td>{row.appxMetalWgt ? `${row.appxMetalWgt}g` : "-"}</td>
                <td className="font-bold text-zinc-950 text-right">
                  ₹ {row.finalPrice || 0}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-16 text-zinc-400">
                  <p className="font-semibold text-center text-zinc-700">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {total > 0 && (
        <div className="flex justify-between items-center border-t border-t-gray-300 p-4 bg-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none cursor-pointer"
            >
              {[10, 20, 50, 100].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-700">
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <button
              className="transition-all h-9 text-sm duration-300 px-3 py-1 rounded-md flex items-center gap-1 bg-[#e4e4e7] hover:bg-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 font-medium"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              className="transition-all h-9 text-sm duration-300 px-3 py-1 rounded-md flex items-center gap-1 bg-[#e4e4e7] hover:bg-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 font-medium"
              onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
              disabled={page >= Math.ceil(total / pageSize)}
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
