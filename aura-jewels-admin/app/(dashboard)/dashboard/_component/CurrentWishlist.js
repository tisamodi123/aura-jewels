"use client";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getToken } from "@/lib/auth";
import WishlistRowExpand from "./WishlistRowExpand";
import NoDataFound from "@/components/NoDataFound";

export default function CurrentWishlistTable() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const token = getToken();
  const [data, setData] = useState([]);

  const handleRowClick = useCallback((rowId, data) => {
    if (expanded == rowId) {
      setExpanded(null);
      setRowData([]);
    } else {
      setExpanded(rowId);
      setRowData(data?.jewelery || data?.jewellery || []);
    }
  }, [expanded]);

  const columns = useMemo(
    () => [
      {
        id: "detail",
        accessorKey: "",
        header: "",
        cell: ({ row }) => {
          const isOpen = expanded === row.original._id;
          return (
            <div
              onClick={() => handleRowClick(row.original._id, row.original)}
              className="flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 w-6 h-6 rounded-md hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
      },
      {
        header: "Total Items",
        accessorKey: "totalItem",
        cell: (info) => <span className="font-semibold text-slate-700">{info.getValue()}</span>
      },
      // {
      //   header: "Name",
      //   accessorFn: (row) => {
      //     const u = Array.isArray(row.user_detail) ? row.user_detail[0] : row.user_detail;
      //     if (!u) return "N/A";
      //     if (u.name) return u.name;
      //     if (u.firstName || u.lastName) return `${u.firstName || ""} ${u.lastName || ""}`.trim();
      //     return "N/A";
      //   },
      //   cell: (info) => <span className="font-medium text-slate-700">{info.getValue()}</span>
      // },
      {
        header: "Name",
        accessorFn: (row) => {
          const u = Array.isArray(row.user_detail)
            ? row.user_detail[0]
            : row.user_detail;

          return (
            u?.name ||
            `${u?.firstName || ""} ${u?.lastName || ""}`.trim() ||
            u?.fullName ||
            "N/A"
          );
        },
      },
      {
        header: "Email",
        accessorFn: (row) => {
          const u = Array.isArray(row.user_detail) ? row.user_detail[0] : row.user_detail;
          return u?.email || "N/A";
        },
      },
      // {
      //   header: "Mobile No.",
      //   accessorFn: (row) => {
      //     const u = Array.isArray(row.user_detail) ? row.user_detail[0] : row.user_detail;
      //     if (!u) return "N/A";
      //     const code = u.phoneCountryCode || u.countryCode || "";
      //     const num = u.phone || u.number || "";
      //     if (!num) return "N/A";
      //     return `${code} ${num}`.trim();
      //   },
      // },
      {
        header: "Mobile No.",
        accessorFn: (row) => {
          const u = Array.isArray(row.user_detail)
            ? row.user_detail[0]
            : row.user_detail;

          const phone =
            u?.phone ||
            u?.mobile ||
            u?.mobileNo ||
            u?.number ||
            "";

          if (!phone) return "N/A";

          const code =
            u?.phoneCountryCode ||
            u?.countryCode ||
            "";

          return `${code} ${phone}`.trim();
        },
      }
    ],
    [expanded, handleRowClick]
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
    globalFilterFn: "includesString",
  });



  const GetWishlistData = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append("page", 1);
    formData.append("limit", 1000);

    callApi(`${API_URL.USER_WISHLIST_DATA}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setData(result?.data || []);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch wishlist data:", err);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);
  useEffect(() => {
    GetWishlistData();
  }, [GetWishlistData]);
  return (
    <div>
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex px-5 py-4 items-center justify-between border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Wishlist</h3>
          <div className="flex items-center gap-2">
            <div className="border border-slate-200 h-8 flex justify-center items-center rounded-lg p-1.5 bg-slate-50 transition-all duration-300 ease-in-out">
              <input
                type="text"
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className={`
                  transition-all duration-300 ease-in-out
                  bg-transparent text-xs text-slate-600
                  ${showInput ? "w-28 px-1 visible" : "w-0 px-0 invisible"}
                  border-none outline-none
                `}
              />
              <Search
                onClick={() => setShowInput(!showInput)}
                className="h-3.5 w-3.5 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none ${header.column.getCanSort() ? "cursor-pointer" : ""
                        }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-slate-300 ml-1 text-[10px]">
                              {header.column.getIsSorted() === "asc"
                                ? "▲"
                                : header.column.getIsSorted() === "desc"
                                  ? "▼"
                                  : "⇅"}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-slate-400 text-sm">
                    Loading...
                  </td>
                </tr>
              </tbody>
            ) : data?.length > 0 ? (
              <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.map((row) => {
                  const isOpen = expanded == row.original._id;
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className={`hover:bg-slate-50/50 transition-colors ${isOpen ? "bg-slate-50/30" : ""
                          }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-4 text-sm text-slate-600 align-middle">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                      {isOpen && (
                        <tr>
                          <td
                            className="bg-slate-50/10 p-0"
                            colSpan={row.getAllCells().length}
                          >
                            <WishlistRowExpand rowData={rowData} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-slate-400 text-sm">
                    No data found
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div>
          {data?.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 p-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Rows per page:</span>
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-16 border border-slate-200 bg-white rounded-lg px-2 py-1 text-xs h-8 text-slate-600 focus:ring-0 focus:ring-offset-0">
                    <SelectValue
                      placeholder={`${table.getState().pagination.pageSize}`}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {[10, 20, 50, 100].map((pageSize) => (
                      <SelectItem
                        className="hover:bg-slate-50 cursor-pointer text-xs"
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
                <span className="text-xs text-slate-500 font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <button
                  className={`transition-all h-8 text-xs duration-300 px-2.5 py-1 rounded-lg flex items-center gap-1 border ${table.getCanPreviousPage()
                    ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Prev
                </button>
                <Select
                  value={String(table.getState().pagination.pageIndex + 1)}
                  onValueChange={(value) =>
                    table.setPageIndex(Number(value) - 1)
                  }
                >
                  <SelectTrigger className="w-16 border border-slate-200 bg-white rounded-lg px-2 py-1 text-xs h-8 text-slate-600 focus:ring-0 focus:ring-offset-0">
                    <SelectValue
                      placeholder={`Page ${table.getState().pagination.pageIndex + 1
                        }`}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {Array.from(
                      { length: table.getPageCount() },
                      (_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)} className="text-xs cursor-pointer">
                          {index + 1}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <button
                  className={`transition-all h-8 text-xs duration-300 px-2.5 py-1 rounded-lg flex items-center gap-1 border ${table.getCanNextPage()
                    ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                    : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
