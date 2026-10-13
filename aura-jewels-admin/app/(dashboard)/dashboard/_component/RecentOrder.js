"use client";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, ORDER_STATUS_CAPTIONS } from "@/lib/Constant";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "@/styles/collectiontable.css";
import { ChevronLeft, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import RowExpandContent from "./RowExpandContent";
import { formatDate } from "@/lib/utils";

export default function RecentOrder({ }) {
  const [sorting, setSorting] = useState([]);

  const [columnFilters, setColumnFilters] = useState([]);
  const [orderListData, setOrderListData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const token = getToken();

  const router = useRouter();

  const [data, setData] = useState([]);

  const handleRowClick = useCallback((rowId) => {
    if (expanded == rowId) {
      setExpanded(null);
    } else {
      setExpanded(rowId);
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
              onClick={() => handleRowClick(row.original._id)}
              className="flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 w-6 h-6 rounded-md hover:bg-slate-100 transition-colors"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      { header: "Order Number", accessorKey: "orderNumber" },
      {
        header: "Customer",
        accessorFn: (row) =>
          row.customer?.name ||
          `${row.customer?.firstName || ""} ${row.customer?.lastName || ""}`.trim() ||
          "N/A",
        cell: (info) => (
          <span className="font-medium text-slate-700">
            {info.getValue()}
          </span>
        ),
      },
      {
        header: "Email Address",
        accessorFn: (row) => row.customer?.email || "N/A",
      },
      {
        header: "Order Date",
        accessorKey: "createdAt",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        header: "Payment",
        accessorFn: (row) =>
          row?.paymentStatus ||
          row?.payment_status?.[0]?.adminstatuscaption ||
          row?.payment?.status ||
          "N/A",
        cell: (info) => {
          const val = info.getValue();
          if (!val || val === "N/A") {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                N/A
              </span>
            );
          }
          const s = String(val).toLowerCase();
          const isSuccess = s === "paid" || s === "success";
          const isPending = s === "pending";
          const isFailed = s.includes("fail");

          let label = val;
          if (s === "paid" || s === "success") label = "Paid";
          else if (s === "pending") label = "Pending";
          else if (s.includes("fail")) label = "Failed";
          else label = s.charAt(0).toUpperCase() + s.slice(1);

          let badgeClass = "bg-slate-50 text-slate-700 border-slate-200";
          if (isSuccess) {
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100/60";
          } else if (isPending) {
            badgeClass = "bg-amber-50 text-amber-700 border-amber-100/60";
          } else if (isFailed) {
            badgeClass = "bg-rose-50 text-rose-700 border-rose-100/60";
          }

          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
              {label}
            </span>
          );
        },
      },
      {
        header: "Amount",
        accessorKey: "totalamount",
        cell: (info) => {
          return (
            <span className="font-semibold text-slate-800">
              ₹{info.row.original.amount}
            </span>
          );
        },
      },

      // { header: "Items", accessorKey: "TotalItem" },

      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => {
          const id = info.row.original._id;
          return (
            <div
              onClick={() => router.push(`/orders/order-details/${id}`)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-[#087B5D] hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Eye className="h-4 w-4" />
            </div>
          );
        },
      },
    ],
    [handleRowClick, expanded, router]
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

  //   When Table Data Changes

  const GetOrderDetails = useCallback((id) => {
    callApi(`${API_URL.GET_ORDER_DETAIL}/${id}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setRowData(result?.data);
        }
      })
      .catch((err) => {
        console.log("Error to get order details :", err);
      });
  }, [token]);

  const GetOrderList = useCallback(() => {
    const formData = new FormData();
    formData.append("orderStatusId", "1,2");
    formData.append("search", "");
    formData.append("page", 1);
    formData.append("limit", 10);

    callApi(`${API_URL.RECENT_ORDER_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setOrderListData(result?.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch order list.");
      });
  }, [token]);

  useEffect(() => {
    if (expanded) {
      GetOrderDetails(expanded);
    }
  }, [expanded, GetOrderDetails]);

  useEffect(() => {
    GetOrderList();
  }, [GetOrderList]);

  useEffect(() => {
    if (orderListData.length > 0) {
      setData(orderListData);
    }
  }, [orderListData]);

  return (
    <>
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex px-5 py-4 items-center justify-between border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Recent Orders</h3>
          <button
            onClick={() => router.push("/orders")}
            className="text-xs font-semibold text-[#087B5D] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        {/* Main Jewellery Table */}
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
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="text-center py-10 text-slate-400 text-sm bg-white"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isOpen = expanded == row.original._id;
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className={`hover:bg-slate-50/50 transition-colors ${isOpen ? "bg-slate-50/30" : ""
                          }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3.5 px-4 text-sm text-slate-600 align-middle">
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
                            <RowExpandContent
                              rowData={rowData}
                              orderCaptionData={ORDER_STATUS_CAPTIONS}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
