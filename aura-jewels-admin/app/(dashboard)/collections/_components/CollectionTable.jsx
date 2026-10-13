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
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CollectionTable({
  tableData,
  onDelete,
  onEdit,
  onUpdateStatus,
  onAddProducts,
  pagination,
  setPagination,
  totalRows,
  loading,
  searchText,
  setSearchText,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const noImg = PREFIX + "/noImagee.png";
  const [data, setData] = useState([...tableData]);
  const [showInput, setShowInput] = useState(false);
  const handleAdd = (collectionData) => {
    onAddProducts(collectionData);
  }
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
        header: "Image",
        accessorKey: "image",
        cell: (info) => {
          const { image } = info.row.original;
          console.log('image --->>',  image);


          return (
            <div className="flex justify-center">
              {image ? (
                <Image src={image} height={18} width={18} alt="iamge" />

              ) : (
                <Image src={`${PREFIX}/noImage2.jpg`} height={18} width={18} alt="iamge" />
              )}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      { header: "Collection Name", accessorKey: "collectionName" },
      { header: "Slug", accessorKey: "slug" },
      // { header: "Sort Order", accessorKey: "sort" },
      // { header: "Description", accessorKey: "description" },
      {
        header: "Is Menu",
        accessorKey: "isMenu",
        cell: (info) => (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${info.getValue() ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
            {info.getValue() ? "YES" : "NO"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <span
            onClick={() => onUpdateStatus(info.row.original.id || info.row.original._id)}
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
        id: "action",
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <div
              onClick={() => onEdit(info.row.original)}
              className="cursor-pointer"
            >
              <img
                src={PREFIX + "/pencil.svg"}
                alt="penicl icon"
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
                alt="penicl icon"
                height={12}
                width={12}
              />
            </div>
            {/* <div
              onClick={() => handleAdd(info.row.original)}
              className="cursor-pointer"
            >
              <img
                src={PREFIX + "/plusIcon.svg"}
                alt="penicl icon"
                height={12}
                width={12}
              />
            </div> */}
          </div>
        ),
      },
    ],
    []
  );
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
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
  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);
  return (
    <>
      {/* Table Header */}
      <div
        className="flex px-4 py-3 h-14  items-center justify-between"
        title="table-header"
      >

        <div className="flex items-center gap-4">
          <div className="border h-8 flex justify-center items-center rounded-lg border-[#E4E8EE] p-1.5 transition-all duration-300 ease-in-out">
            <input
              type="text"
              placeholder="Type to search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`
                       transition-all duration-500 ease-in-out
                       bg-transparent text-sm
                       ${showInput ? "w-32 px-2 visible" : "w-0 px-0 invisible"}
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

      </div>
      {/* Main Collection Table */}
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
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
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

