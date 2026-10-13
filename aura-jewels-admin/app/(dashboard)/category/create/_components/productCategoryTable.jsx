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
import "@/styles/collectiontable.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function ProductCategoryTable({
  setSelectedProduct,
  selectedProduct,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [toggleValue, setToggleValue] = useState("Add");
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [jewelleryData, setJewelleryData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatatusModal, setShowSatatusModal] = useState(false);
  const token = getToken();
  const [totalRows, setTotalRows] = useState(0);
  const [categoryList, setCategoryList] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState([]);
  console.log("selectedProduct", selectedProduct);
  const columns = useMemo(
    () => [
      {
        id: "checkbox",
        accessorKey: "",
        header: ({ table }) => (
          <div className="flex justify-center">
            <input type="checkbox" />
          </div>
        ),
        cell: ({ row }) => {
          return (
            <input
              type="checkbox"
              checked={selectedProduct.some(
                (item) => item._id === row.original._id
              )}
              onChange={() => handleAddCategory(row.original)}
            />
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      { header: "Product", accessorKey: "itemCode" },
      {
        header: "Metal Type",
        accessorKey: "metalType",
      },

      { header: "Price", accessorKey: "price" },

      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          return (
            <span
              className={`${
                info.row.original.status === "ACTIVE"
                  ? "text-[#17863E]  bg-[#17863e1a]"
                  : "text-[#ED4842]  bg-[#ed48421a]"
              } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
            >
              {info.getValue()}
            </span>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [selectedProduct]
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
  //   useEffect(() => {
  //     setData([...tableData]);
  //   }, [tableData]);

  // Add Existing Product Drawer
  const handleAddExistProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("page", currentPage);
      formData.append("limit", perPage);

      const result = await callApi(`${API_URL?.GET_JEWELLERY_LIST}`, "POST", formData, token);

      if (result?.errorCode === STATUS_CODE.OK) {
        setData(result?.data || []);
        setTotalRows(result?.count > 0 ? result?.count : 0);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.log("Error fetching  data.", error);
      toast.error("Failed To Add Data");
    }
  };

  // Add Selected Product to Category
  const handleAddCategory = (field) => {
    setSelectedProduct((prev) => {
      const isSelected = prev.some((item) => item._id === field._id);
      if (isSelected) {
        return prev.filter((item) => item._id !== field._id);
      } else {
        return [...prev, field];
      }
    });
  };
  return (
    <>
      {/* Table Header */}
      <div
        className="flex px-6 py-3 h-14  items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold">Product In This Category</div>
        </div>
        <div className="flex items-center gap-2">
          {selectedProduct.length > 0 && (
            <Button
              onClick={() => setData(selectedProduct)}
              className="border border-[#E4E8EE] bg-black text-white px-3 py-1 hover:text-[#656B7B] text-[0.80rem] cursor-pointer hover:bg-white  rounded-lg"
            >
              Add To Category
            </Button>
          )}
          <Button
            onClick={handleAddExistProduct}
            className="border border-[#E4E8EE] hover:bg-black hover:text-white px-3 py-1 text-[#656B7B] text-[0.80rem] cursor-pointer bg-white  rounded-lg"
          >
            Add Existing Products
          </Button>
        </div>
      </div>
      {/* Main Collection Table */}
      <div className="productCategoryTable" title="mainTable">
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
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
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
            ) : (
              <tr className="h-20">
                <td
                  colSpan={columns.length}
                  className="text-center  text-[#656B7B]"
                >
                  <span className="font-semibold p-4">No Product Added</span>
                </td>
              </tr>
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
                className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${
                  table.getCanPreviousPage()
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
                    placeholder={`Page ${
                      table.getState().pagination.pageIndex + 1
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
                className={`transition-all h-9 text-sm duration-300 px-2 py-1 rounded-md flex items-center gap-1 pl-2.5 ${
                  table.getCanNextPage()
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
