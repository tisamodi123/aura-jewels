"use client";
import { API_URL, PREFIX } from "@/lib/APIUrl";
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
import { isValidData } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

export default function DiamondMarginTable({ diaType }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [data, setData] = useState([]);
  console.log('data ---->>', data)
  const columns = useMemo(
    () => [
      { header: "Shape ⇅", accessorKey: "shape" },
      { header: "Color ⇅", accessorKey: "color" },
      { header: "Clarity ⇅", accessorKey: "clarity" },
      { header: "Cut ⇅", accessorKey: "cut" },
      { header: "Carat From", accessorKey: "carat_From" },
      { header: "Carat To", accessorKey: "carat_To" },
      { header: "Margin", accessorKey: "margin" },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    manualPagination: true, // ✅ tell table we handle pagination
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

  // Create stable reference for data fetching
  const GetSellingPriceData = async () => {
    const token = getToken();

    const formData = new FormData();
    formData.append("page", pagination.pageIndex + 1);
    formData.append("limit", pagination.pageSize);
    formData.append("diamondType", diaType);

    try {
      const result = await callApi(`${API_URL?.GET_SELLING_PRICE_LIST}`, "POST", formData, token);
      if (result?.errorCode === STATUS_CODE.OK) {
        setData(result?.data || []);
        setTotalRows(result?.count > 0 ? result?.count : 0);
      }
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    GetSellingPriceData();
  }, [diaType]);

  useEffect(() => {
    GetSellingPriceData();
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <>
      <div className="rounded-md border border-gray-200  mb-3 bg-white shadow-sm">
        {/* Table Header */}
        {/* <div
          className="flex px-4 py-3 h-14  items-center  justify-between "
          title="table-header"
        >
          {/* <div className="flex items-center gap-4">
            <div>All</div>
            <div className="border h-7 w-7 flex cursor-pointer justify-center items-center rounded-xl border-[#E4E8EE] p-1">
              <Image
                src={`${PREFIX}/plusIcon.svg`}
                alt="addIcon"
                height={12}
                width={12}
              />
            </div>
          </div> */}
        {/* <div className="flex items-center gap-4">
            <div className="border h-7 w-7 flex justify-center cursor-pointer items-center rounded-xl border-[#E4E8EE] p-1">
              <Image
                src={`${PREFIX}/searchIcon.svg`}
                alt="search Icon"
                height={15}
                width={15}
              />
            </div>
            <div className="border h-7 w-7 flex justify-center cursor-pointer items-center rounded-xl border-[#E4E8EE] p-1">
              <Image
                src={`${PREFIX}/updownarrow.svg`}
                alt="UpDownArrowIcon"
                height={15}
                width={15}
              />
            </div>
          </div> */}
        {/* </div>  */}
        {/* Main Diamond Margin Table */}
        <div className="diamondMarginTable" title="mainTable">
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
                          {/* {header.column.getCanSort() && <span>⇅</span>} */}
                          {header.column.getCanSort()}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem" }}>
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
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
                ))
              )}
            </tbody>
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

{
  /* <Image
  src={imageUrl}
  alt="..."
  width={300}
  height={300}
  onError={(e) => (e.target.src = "/fallback.png")}
/> */
}
