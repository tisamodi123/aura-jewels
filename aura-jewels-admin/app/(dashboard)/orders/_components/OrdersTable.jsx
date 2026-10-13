"use client";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { FaEye } from "react-icons/fa";
import React, { useEffect, useMemo, useState } from "react";
import { FaCaretRight, FaCaretDown } from "react-icons/fa";
import "@/styles/collectiontable.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ChevronLeft, ChevronRight, Check, ChevronDown, Download, FileText } from "lucide-react";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";
import RowExpandContent from "./RowExpandContent";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, ORDER_STATUS_CAPTIONS } from "@/lib/Constant";
import { formatDate } from "@/lib/utils";

export default function OrdersTable({
  loading,
  tableData,
  orderCaptionData,
  GetOrderList,
  totalRows,
  filteredOrderCaptionList,
  handleShowModal,
}) {
  const [sorting, setSorting] = useState([]);
  const [searchText, setSerchText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [columnFilters, setColumnFilters] = useState([]);
  const token = getToken();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchKey, setSearchKey] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const EXCLUDED_STATUSES = ["Payment Pending", "Failed Payment"];
  const router = useRouter();
  const [data, setData] = useState([...tableData]);
  const handleRowClick = (rowId) => {
    if (expanded == rowId) {
      setExpanded(null);
    } else {
      setExpanded(rowId);
    }
  };
  const columns = useMemo(
    () => [
      {
        id: "detail",
        accessorKey: "",
        header: "",
        cell: ({ row }) => {
          const isOpen = expanded === row?.original._id;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(row?.original._id);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all duration-200 focus:outline-none"
              aria-label={isOpen ? "Collapse row" : "Expand row"}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"
                  }`}
              />
            </button>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      { header: "Order Number", accessorKey: "orderNumber" },
      {
        header: "Customer",
        accessorFn: (row) => row?.user_detail?.[0]?.firstName || "N/A",
        cell: (info) => {
          return (
            <span>
              {info.getValue() +
                " " +
                info?.row?.original?.user_detail?.[0]?.lastName}
            </span>
          );
        },
      },
      {
        header: "Email Address",
        accessorFn: (row) => row?.user_detail?.[0]?.email || "N/A",
      },
      {
        header: "Order Date",
        accessorKey: "createdAt",
        accessorFn: (row) => row?.createdAt || "N/A",
      },
      // {
      //   header: "Order Date",
      //   accessorKey: "createdAt",
      //   cell: (info) => formatDate(info.getValue()),
      // },
      {
        header: "Status",
        accessorFn: (row) => row?.status || "N/A",
        cell: (info) => {
          const val = info.getValue();
          const s = String(val).toLowerCase();
          let cls = "bg-zinc-100 text-zinc-700 border-zinc-200";
          if (["delivered", "qa done", "returned approved"].includes(s)) {
            cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
          } else if (["shipped", "in production", "ready to ship", "approved", "item received"].includes(s)) {
            cls = "bg-blue-50 text-blue-700 border-blue-200";
          } else if (["pending", "return request", "cancel request", "cancelled"].includes(s)) {
            cls = "bg-amber-50 text-amber-700 border-amber-200";
          } else if (["cancelled approved", "cancelled rejected", "returned rejected", "rejected", "refunded"].includes(s)) {
            cls = "bg-rose-50 text-rose-700 border-rose-200";
          }

          const found = ORDER_STATUS_CAPTIONS.find(item => item.status_id === val || item._id === val);
          const displayVal = found ? found.adminstatuscaption : (val === "Cancelled" ? "Cancel Request" : val);

          return (
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border capitalize inline-block ${cls}`}>
              {displayVal}
            </span>
          );
        },
      },
      {
        header: "Payment",
        accessorFn: (row) =>
          row?.paymentStatus || row?.payment_status?.[0]?.adminstatuscaption || "N/A",
        cell: (info) => {
          const raw = info.getValue();
          const s = String(raw).toLowerCase();
          let cls = "bg-[#E0A100]";
          let label = raw;

          if (s === "paid" || s === "success") {
            cls = "bg-[#17863E]";
            label = "Paid";
          } else if (s === "refund success" || s === "refunded") {
            cls = "bg-[#17863E]";
            label = "Refund Success";
          } else if (s === "refund processing") {
            cls = "bg-[#2563EB]";
            label = "Refund Processing";
          } else if (s === "refund pending") {
            cls = "bg-[#7C3AED]";
            label = "Refund Pending";
          } else if (s === "failed" || s.includes("failed")) {
            cls = "bg-[#DE6565]";
            label = "Failed";
          } else if (s === "pending") {
            cls = "bg-[#E0A100]";
            label = "Pending";
          }

          return (
            <span className={`${cls} text-white px-2.5 py-1 rounded-md text-xs font-semibold inline-block`}>
              {label}
            </span>
          );
        },
      },
      {
        header: "Amount",
        accessorKey: "totalamount",
        cell: (info) => {
          const val = Math.round(Number(info.getValue()) || 0);
          return (
            <span>
              {(info.row?.original.currencysign || "₹") + " " + val.toLocaleString()}
            </span>
          );
        },
      },

      { header: "Items", accessorKey: "TotalItem" },

      {
        header: "Invoice",
        accessorKey: "invoiceUrl",
        id: "invoiceUrl",
        cell: (info) => {
          const row = info.row?.original;
          const invoiceUrl = row?.invoiceUrl || (row?.invoicepath && row?.invoicepath !== '#' ? row?.invoicepath : '');
          if (!invoiceUrl) return <span className="text-zinc-400 text-xs">-</span>;
          return (
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-xs"
              title="Download Uploaded Invoice"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Invoice</span>
            </a>
          );
        },
      },
      {
        header: "Order Receipt",
        accessorKey: "receiptUrl",
        id: "receiptUrl",
        cell: (info) => {
          const row = info.row?.original;
          const receiptUrl = row?.receiptUrl;
          if (!receiptUrl) return <span className="text-zinc-400 text-xs">-</span>;
          return (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
              title="Download Order Receipt"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Receipt</span>
            </a>
          );
        },
      },
      {
        header: "Item Receipt",
        accessorKey: "detailReceiptUrl",
        id: "detailReceiptUrl",
        cell: (info) => {
          const row = info.row?.original;
          const detailReceiptUrl = row?.detailReceiptUrl && row?.detailReceiptUrl !== '#' ? row?.detailReceiptUrl : '';
          if (!detailReceiptUrl) return <span className="text-zinc-400 text-xs">-</span>;
          return (
            <a
              href={detailReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
              title="Download Item Receipt"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Item Receipt</span>
            </a>
          );
        },
      },
      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => {
          const id = info.row?.original?._id;
          return (
            <div
              onClick={() => router.push(`/orders/order-details/${id}`)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200 cursor-pointer mx-auto"
              title="View Order details page"
            >
              <FaEye size={18} />
            </div>
          );
        },
      },
    ],
    [expanded, handleRowClick]
  );
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      expanded,
      pagination,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  const GetOrderDetails = (id) => {
    setDetailLoading(true);

    callApi(`${API_URL.GET_ORDER_DETAIL}/${id}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setRowData(result?.data);
        }
      })
      .catch((err) => {
        console.log("Error to get order details :", err);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  useEffect(() => {
    if (expanded) {
      GetOrderDetails(expanded);
    }
  }, [expanded]);


  const OrderCaptionList = orderCaptionData?.map((item) => ({
    ...item,
    parentid: JSON.parse(item.parentid),
  }));
  const [CurrencyList, setsetCurrencyList] = useState([]);
  const GetCurrencyList = () => {
    callApi(`${API_URL?.CURRENCY_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setCurrencyList(result?.data);
        }
      });
  };

  const toggleSelection = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const displayValue = () => {
    const selectedStatus = OrderCaptionList.filter((status) =>
      selected.includes(status._id)
    ).map((status) => status.adminstatuscaption);


    if (selected.length === 0) return "Select status";
    if (selected.length <= 2) return selectedStatus.join(", ");
    return `${selectedStatus.slice(0, 2).join(", ")} +${selectedStatus.length - 2
      } `;
  };


  filteredOrderCaptionList = OrderCaptionList.filter(
    (status) => !EXCLUDED_STATUSES.includes(status.adminstatuscaption)
  );



  useEffect(() => {
    if (selected.length > 0) {
      const selectedStatus = OrderCaptionList.filter((status) =>
        selected.includes(status._id)
      ).map((status) => status.status_id);
      console.log("Selected Status IDs:", selectedStatus);
      GetOrderList(selectedStatus, pagination, searchKey);
    } else {

      GetOrderList(undefined, pagination, searchKey);
    }
  }, [selected, searchKey, pagination.pageIndex, pagination.pageSize, orderCaptionData?.length, refresh]);
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchKey(searchText);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  return (
    <>
      {/* Table Header */}
      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5 overflow-auto">
        <div
          className="flex px-4 py-3 h-14  items-center justify-between"
          title="table-header"
        >
          <div className="flex items-center gap-4">
            <div title="select-tag">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  asChild
                  className="inline-flex items-center justify-between w-[220px] px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <button type="button">
                    <span className="max-w-3xl truncate">{displayValue()}</span>
                    <ChevronDown className="ml-2 h-4 w-4 inline" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0 ">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {filteredOrderCaptionList?.map((status) => (
                        <CommandItem
                          key={status._id}
                          onSelect={() => toggleSelection(status._id)}
                          className="flex justify-between"
                        >
                          <span>{status.adminstatuscaption}</span>
                          {selected.includes(status._id) && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="border h-8 flex justify-center items-center rounded-lg border-[#E4E8EE] p-1.5 transition-all duration-300 ease-in-out">
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSerchText(e.target.value)}
                className={`transition-all duration-500 ease-in-out bg-transparent text-sm ${showInput ? "w-40 px-2 visible" : "w-0 px-0 invisible"}border-none outline-none`}
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
        {/* Main Category Table */}
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
            {loading && tableData.length == 0 ? (
              <TableSkeleton row={5} cell={9} />
            ) : tableData.length > 0 ? (
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isOpen = expanded == row?.original._id;
                  return (
                    <React.Fragment key={row?.id}>
                      <tr
                        key={row?.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="transition-colors duration-150 hover:bg-zinc-50/70"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
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
                            style={{ textAlign: "left" }}
                            colSpan={row.getAllCells().length}
                            className="bg-zinc-50/50 p-6"
                          >
                            <div className="w-full max-w-[calc(100vw-48px)] md:max-w-[calc(100vw-120px)] lg:max-w-[calc(100vw-340px)] overflow-x-hidden">
                              <RowExpandContent
                                rowData={rowData}
                                orderCaptionData={orderCaptionData}
                                GetOrderDetails={GetOrderDetails}
                                detailLoading={detailLoading}
                                refreshOrderList={() => setRefresh(prev => prev + 1)}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            ) : !loading && tableData.length == 0 ? (
              <NoDataFound headerLength={columns.length} />
            ) : null}
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
                  className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${table.getCanPreviousPage()
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
                  onValueChange={(value) =>
                    table.setPageIndex(Number(value) - 1)
                  }
                >
                  <SelectTrigger className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm">
                    <SelectValue
                      placeholder={`Page ${table.getState().pagination.pageIndex + 1
                        }`}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {Array.from(
                      { length: table.getPageCount() },
                      (_, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          {index + 1}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <button
                  className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${table.getCanNextPage()
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
      </div>
    </>
  );
}
