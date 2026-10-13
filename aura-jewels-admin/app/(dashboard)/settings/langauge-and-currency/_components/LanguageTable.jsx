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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getToken } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function LanguageTable({ onUpdateStatus }) {
  //** Get Token */
  const token = getToken();

  // ** States **/

  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [importHistoryData, setImportHistoryData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const noImg = PREFIX + "/noImagee.png";
  const [data, setData] = useState([
    {
      srNo: "1",
      language: "English",
      caption: "ENG",
      flagImg: "ukFlag.svg",
      status: "ACTIVE",
    },
    {
      srNo: "2",
      language: "French",
      caption: "FR",
      flagImg: "franceFlag.svg",
      status: "ACTIVE",
    },
  ]);
  const columns = useMemo(
    () => [
      { header: "SrNO.", accessorKey: "srNo" },
      { header: "Language Name", accessorKey: "language" },
      { header: "Caption", accessorKey: "caption" },
      {
        header: "Flag",
        accessorKey: "flagImg",
        cell: (info) => (
          <div className="flex items-center justify-center">
            <Image
              src={`${PREFIX}/${info.getValue()}`}
              height={22}
              width={22}
              alt="flagIcon"
            />
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const id = info.row.original._id;
          const status = info.row.original.status;
          return (
            <span
              className={`${
                status === "ACTIVE"
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

      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <div className="cursor-pointer">
              <img
                src={PREFIX + "/pencil.svg"}
                alt="penicl icon"
                height={18}
                width={18}
              />
            </div>
            <div className="cursor-pointer">
              <img
                src={PREFIX + "/trashIcon.svg"}
                alt="delete icon"
                height={12}
                width={12}
              />
            </div>
          </div>
        ),
      },
      {
        header: "Default",
        accessorKey: "",
        id: "default",
        cell: (info) => (
          <div>
            <Switch className="h-4 w-8 [&>span]:h-3 [&>span]:w-3" />
          </div>
        ),
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <>
      {/* Table Header */}
      <div
        className="flex px-6 py-3 h-14  items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#656B7B] ">Show 05 Entries</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="border h-8 flex justify-center items-center rounded-lg border-[#E4E8EE] p-1.5 transition-all duration-300 ease-in-out">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className={`
        transition-all duration-500 ease-in-out
        bg-transparent text-sm
        ${showInput ? "w-40 px-2 visible" : "w-0 px-0 invisible"}
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
      {/* Language & Currency Table */}
      <div className="langCurrTable" title="mainTable">
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
    </>
  );
}
