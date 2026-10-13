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
import NoDataFound from "@/components/NoDataFound";
import TableSkeleton from "@/components/tableSkeleton";
import { useCustomerStore } from "@/lib/stores/useCustomer";

export default function CustomerMasterTable({
  tableData,
  onDelete,
  loading,
  VerifyUserAPI,
  onEdit,
  onUpdateStatus,
  pagination,
  setPagination,
  totalRows,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [toggleValue, setToggleValue] = useState("Add");
  const [rowData, setRowData] = useState({});
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatatusModal, setShowSatatusModal] = useState(false);
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const noImg = PREFIX + "/noImagee.png";
  const [data, setData] = useState([...tableData]);

  // Custom multi-column filter function
  const multiColumnFilterFn = (row, columnId, filterValue) => {
    const searchableContent = `${row.original.name || ""} ${row.original.email || ""} ${row.original.phone || ""}`.toLowerCase();
    return searchableContent.includes(filterValue.toLowerCase());
  };

  const columns = useMemo(
    () => [
      // {
      //   id: "checkbox",
      //   accessorKey: "",
      //   header: ({ table }) => (
      //     <div className="flex justify-center">
      //       <input type="checkbox" />
      //     </div>
      //   ),
      //   cell: ({ row }) => (
      //     <div className="flex justify-center">
      //       <input type="checkbox" />
      //     </div>
      //   ),
      //   enableSorting: false,
      //   enableColumnFilter: false,
      // },
      {
        header: "Customer Name",
        accessorKey: "name",
        cell: (info) => (
          <div className="capitalize">
            {info.getValue() || "-"}
          </div>
        ),
        filterFn: multiColumnFilterFn,
      },
      {
        header: "Email Address",
        accessorKey: "email",
        filterFn: multiColumnFilterFn,
      },
      {
        header: "Phone Number",
        accessorKey: "phone",
        cell: (info) => (
          <div>
            {info.row.original.countryCode
              ? `${info.row.original.countryCode} ${info.getValue()}`
              : info.getValue() || "-"}
          </div>
        ),
        filterFn: multiColumnFilterFn,
      },
      {
        header: "Location",
        accessorKey: "addresses.city",
        cell: (info) => (
          <div>
            {info.row.original.addresses?.[0]?.city
              ? info.row.original.addresses[0].city
              : "-"}
          </div>
        ),
      },
      {
        header: "Email Verified",
        accessorKey: "emailVerified",
        cell: (info) => (
          <span
            // onClick={() => VerifyUserAPI(info.row.original)}
            className={`${info.getValue() === true ? "text-[#17863E] " : "text-[#ED4842] "
              } text-[0.80rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
          >
            {info.getValue() === true ? "Yes" : "No"}
          </span>
        ),
      },
      {
        header: "Phone Number Verified",
        accessorFn: (row) => row.phoneVerified,
        cell: ({ getValue }) => {
          const verified = getValue();

          return (
            <span
              className={`${verified ? "text-[#17863E]" : "text-[#ED4842]"
                } text-[0.80rem] font-semibold px-4 py-2 rounded-md`}
            >
              {verified ? "Yes" : "No"}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <span
            onClick={() => onUpdateStatus(info.row.original.id || info.row.original._id, info.row.original.status)}
            className={`${info.row.original.status === "ACTIVE"
              ? "text-[#17863E]  bg-[#17863e1a]"
              : "text-[#ED4842]  bg-[#ed48421a]"
              } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Action",
        accessorKey: "",
        enableSorting: false,
        enableColumnFilter: false,
        id: "action",
        cell: (info) => {
          return (
            <div className="flex items-center justify-center gap-2">
              <div
                onClick={() => handleEdit(info.row.original)}
                className="cursor-pointer"
              >
                <img
                  src={PREFIX + "/pencil.svg"}
                  alt="pencil icon"
                  height={18}
                  width={18}
                />
              </div>
              <div
                onClick={() => onDelete(info.row.original.id || info.row.original._id)}
                className="cursor-pointer"
              >
                <img
                  src={PREFIX + "/trashIcon.svg"}
                  alt="trash icon"
                  height={12}
                  width={12}
                />
              </div>
            </div>
          );
        },
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
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: multiColumnFilterFn,
  });

  const handleEdit = (customer) => {
    useCustomerStore.getState().setCustomer(customer);
    router.push(`/customer-master/update/${customer.id || customer._id}`);
  };

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // When Table Data Changes
  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  return (
    <>
      {/* Table Header */}
      <div
        className="flex px-4 py-3 h-14 items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center gap-2">
          <div className="border h-8 flex justify-center items-center rounded-lg border-[#E4E8EE] p-1.5 transition-all duration-300 ease-in-out">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`
                transition-all duration-500 ease-in-out
                bg-transparent text-sm
                ${showInput ? "w-64 px-2 visible" : "w-0 px-0 invisible"}
                border-none outline-none
              `}
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
        <div className="flex items-center gap-4"></div>
      </div>

      {/* Main Customer Table */}
      <div className="customerTable" title="mainTable">
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
          {loading ? (
            <TableSkeleton row={3} cell={columns?.length} />
          ) : table.getRowModel().rows.length === 0 ? (
            <NoDataFound headerLength={columns?.length} />
          ) : (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
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
                onValueChange={(value) => table.setPageIndex(Number(value) - 1)}
              >
                <SelectTrigger className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm">
                  <SelectValue
                    placeholder={`Page ${table.getState().pagination.pageIndex + 1
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
    </>
  );
}
