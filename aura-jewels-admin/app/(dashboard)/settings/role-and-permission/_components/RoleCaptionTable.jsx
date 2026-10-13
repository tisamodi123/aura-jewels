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

export default function RoleCaptionTable({ onUpdateStatus }) {
  //** Get Token */
  const token = getToken();

  // ** States **/
  const [openDrawer, setOpenDrawer] = useState(false);
  const [toggleValue, setToggleValue] = useState("Add");
  const [rowData, setRowData] = useState({});
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatatusModal, setShowSatatusModal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState({});
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
      caption: "Dashboard",

      isParent: true,
      children: [
        { id: "diamond", caption: "Diamond List" },
        { id: "shape", caption: "Shape" },
        { id: "color", caption: "Color" },
        { id: "clarity", caption: "Clarity" },
      ],
    },
    {
      caption: "Dashboard",
    },
    {
      caption: "Dashboard",
    },
    {
      caption: "Dashboard",
    },
  ]);
  const columns = useMemo(
    () => [
      {
        header: "Caption",
        accessorKey: "caption",
        cell: ({ row }) => {
          const isParent = row.original.isParent;
          const isExpanded = row.getIsExpanded();
          return (
            <div className="flex justify-center items-center gap-2">
              {row.getCanExpand() && (
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent bubbling
                    row.getToggleExpandedHandler()?.(e);
                  }}
                  className="cursor-pointer"
                >
                  {isExpanded ? (
                    <span>
                      {" "}
                      <Image
                        src={`${PREFIX}/ChevRight.svg`}
                        alt="chev rights"
                        className="rotate-90"
                        height={8}
                        width={8}
                      />
                    </span>
                  ) : (
                    <Image
                      src={`${PREFIX}/ChevRight.svg`}
                      alt="chev rights"
                      height={8}
                      width={8}
                    />
                  )}
                </div>
              )}
              {row.original.caption}
            </div>
          );
        },
      },

      {
        header: () => (
          <div className="flex items-center justify-center gap-2">
            <input type="checkbox" />
            IsEdit/Delete
          </div>
        ),
        id: "isedit",
        cell: () => (
          <div className="flex justify-center">
            <input type="checkbox" />
          </div>
        ),
      },
      {
        header: () => (
          <div className="flex items-center justify-center gap-2">
            <input type="checkbox" />
            IsView
          </div>
        ),
        accessorKey: "",
        id: "isview",
        cell: (info) => (
          <div className="flex justify-center">
            <input type="checkbox" />
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
      expanded,
      pagination,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.children,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
          <div className="text-sm text-[#656B7B] ">Total 2,521 Roles</div>
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
      {/* Role-Caption Table */}
      <div className="roleCaption" title="mainTable">
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
