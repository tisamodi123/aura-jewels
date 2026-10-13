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
import "../../../../styles/collectiontable.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";

export default function CustomerGroupTable({
  tableData,
  onUpdateStatus,
  OnDelete,
  loading,
  handleShowModal,
  pagination,
  setPagination,
  totalRows,
  searchText,
  setSearchText,
}) {
  const [showInput, setShowInput] = useState(false);
  const [data, setData] = useState([...tableData]);
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(
    () => [
      {
        header: "Group Name",
        accessorKey: "name",
        cell: (info) => (
          <span className="font-medium text-zinc-900">
            {info.getValue() || "-"}
          </span>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: (info) => (
          <span className="text-zinc-500 max-w-md truncate block">
            {info.getValue() || "-"}
          </span>
        ),
      },
      {
        header: "Discount (%)",
        accessorKey: "discountPercent",
        cell: (info) => (
          <span className="font-semibold text-zinc-700">
            {info.getValue() !== undefined ? `${info.getValue()}%` : "0%"}
          </span>
        ),
      },
      // {
      //   header: "Status",
      //   accessorKey: "status",
      //   cell: (info) => (
      //     <span
      //       onClick={() => onUpdateStatus(info.row.original.id || info.row.original._id)}
      //       className={`${info.row.original.status === "ACTIVE"
      //         ? "text-[#17863E]  bg-[#17863e1a]"
      //         : "text-[#ED4842]  bg-[#ed48421a]"
      //         } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
      //     >
      //       {info.getValue()}
      //     </span>
      //   ),
      //   enableSorting: false,
      //   enableColumnFilter: false,
      // },
      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => {
          const id = info.row.original._id;
          return (
            <div className="flex items-center justify-center gap-2">
              <div
                onClick={() => handleShowModal(info.row.original)}
                className="cursor-pointer p-1 hover:bg-zinc-100 rounded"
              >
                <img
                  src={PREFIX + "/pencil.svg"}
                  alt="edit icon"
                  height={18}
                  width={18}
                />
              </div>
              <div
                onClick={() => OnDelete(id)}
                className="cursor-pointer p-1 hover:bg-zinc-100 rounded"
              >
                <img
                  src={PREFIX + "/trashIcon.svg"}
                  alt="delete icon"
                  height={12}
                  width={12}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [onUpdateStatus, OnDelete, handleShowModal]
  );

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize) || 0,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  return (
    <>
      <div className="flex px-4 py-3 h-14 items-center justify-between">
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

      <div className="categoryTable">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1 justify-center">
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
            <TableSkeleton row={4} cell={5} />
          ) : data.length === 0 ? (
            <NoDataFound headerLength={10} />
          ) : (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
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

      <div>
        {data?.length > 0 && (
          <div className="flex justify-between items-center border-t-gray-300 p-4 bg-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white">
                  <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
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
                  ? "bg-[#e4e4e7] hover:bg-gray-200 cursor-pointer"
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
                <SelectTrigger className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white">
                  <SelectValue placeholder={`Page ${table.getState().pagination.pageIndex + 1}`} />
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
                  ? "bg-[#e4e4e7] hover:bg-gray-200 cursor-pointer"
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
