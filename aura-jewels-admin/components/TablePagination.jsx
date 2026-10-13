"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TablePagination({
  pagination,
  setPagination,
  totalRows,
  pageSizeOptions = [10, 20, 50, 100],
}) {
  const pageCount = Math.ceil(totalRows / pagination.pageSize) || 1;

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
      {/* Rows Per Page */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">Rows per page:</span>
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
          <SelectTrigger className="w-24 h-[32px] border border-gray-300 rounded-md px-2 py-1 text-xs bg-white">
            <SelectValue placeholder={`${pagination.pageSize}`} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {pageSizeOptions.map((size) => (
              <SelectItem
                className="hover:bg-gray-100 text-xs"
                key={size}
                value={String(size)}
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-600 font-medium mr-2">
          Page {pagination.pageIndex + 1} of {pageCount}
        </span>
        <button
          type="button"
          className={`transition-all h-8 text-xs duration-300 px-3 py-1 rounded-md flex items-center gap-1.5 ${
            pagination.pageIndex > 0
              ? "bg-[#e4e4e7] hover:bg-gray-200 cursor-pointer font-medium"
              : "bg-gray-200 cursor-not-allowed opacity-50 text-zinc-400"
          }`}
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              pageIndex: prev.pageIndex - 1,
            }))
          }
          disabled={pagination.pageIndex === 0}
        >
          <ChevronLeft size={14} />
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
          <SelectTrigger className="w-20 h-[32px] border border-gray-300 rounded-md px-2 py-1 text-xs bg-white">
            <SelectValue placeholder={`Page ${pagination.pageIndex + 1}`} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {Array.from({ length: pageCount }, (_, index) => (
              <SelectItem
                className="hover:bg-gray-100 text-xs"
                key={index + 1}
                value={String(index + 1)}
              >
                {index + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          className={`transition-all h-8 text-xs duration-300 px-3 py-1 rounded-md flex items-center gap-1.5 ${
            pagination.pageIndex + 1 < pageCount
              ? "bg-[#e4e4e7] hover:bg-gray-200 cursor-pointer font-medium"
              : "bg-gray-200 cursor-not-allowed opacity-50 text-zinc-400"
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
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
