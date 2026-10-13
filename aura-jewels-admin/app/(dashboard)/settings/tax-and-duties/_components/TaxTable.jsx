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

export default function TaxTable({ onUpdateStatus }) {
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
      region: "India",
      collectingTax: "Yes",
      taxPercentage: "2.50%",
      image: "indiaFlag.svg",
    },
    {
      region: "United State",
      collectingTax: "Yes",
      taxPercentage: "2.50%",
      image: "americaFlag.svg",
    },
    {
      region: "Austrilia",
      collectingTax: "Yes",
      taxPercentage: "2.50%",
      image: "austriliaFlag.svg",
    },
    {
      region: "New Zealand",
      collectingTax: "Yes",
      taxPercentage: "2.50%",
      image: "newZelandFlag.svg",
    },
  ]);
  const columns = useMemo(
    () => [
      {
        header: "Region",
        accessorKey: "region",
        cell: (info) => {
          return (
            <div className="flex items-center gap-2">
              <Image
                src={`${PREFIX}/${info.row.original.image}`}
                alt={`${info.row.original.image}-icon`}
                height={26}
                width={26}
              />
              <span>{info.getValue()}</span>
            </div>
          );
        },
      },
      {
        header: "Collecting Tax",
        accessorKey: "collectingTax",
        cell: (info) => <div>{info.getValue()}</div>,
      },

      {
        header: "Tax Percentage",
        accessorKey: "taxPercentage",
        cell: (info) => <div>{info.getValue()}</div>,
      },
      ,
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
      <div className="border rounded-md">
        {/* Table Header */}
        <div className="px-4 py-4 " title="table-header">
          <div className="flex items-center   gap-4">
            <div className="flex border flex-1 border-[#E4E8EE] px-2 py-1 rounded-md">
              <input
                type="text"
                className="border-none outline-none w-full text-[0.80rem]"
                placeholder="Search"
              />
              <Image
                src={`${PREFIX}/searchIcon.svg`}
                alt="search Icon"
                height={13}
                width={13}
              />
            </div>
            <div className="border h-7 w-7 flex justify-center cursor-pointer items-center rounded-md border-[#E4E8EE] p-1">
              <Image
                src={`${PREFIX}/updownarrow.svg`}
                alt="UpDownArrowIcon"
                height={14}
                width={14}
              />
            </div>
          </div>
        </div>
        {/* Tax Table */}
        <div className="taxTable" title="mainTable">
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
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="ml-2">⇅</span>
                          )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
