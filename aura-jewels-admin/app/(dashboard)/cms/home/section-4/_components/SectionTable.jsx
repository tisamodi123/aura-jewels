"use client";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
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
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import SafeImage from "@/components/SafeImage";
import TableSkeleton from "@/components/tableSkeleton";
import Link from "next/link";
import UpdateSession from "./UpdateSession";
import Swal from "sweetalert2";

export default function SectionTable({ tableData, fetchData, isLoading }) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [toggleValue, setToggleValue] = useState("Add");
  const [rowData, setRowData] = useState({});
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatatusModal, setShowSatatusModal] = useState(false);
  const token = getToken();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [data, setData] = useState([...tableData]);
  const columns = useMemo(
    () => [
      {
        id: "Sr.No",
        accessorKey: "srNo",
        header: "Sr.No",

        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        header: "Title",
        accessorKey: "title",
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Sub Title",
        accessorKey: "subTitle",
        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <span
            onClick={() => UpdateStatus(info.row.original.id)}
            className={`${info.getValue() === "ACTIVE"
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
              onClick={() => updateSessionHandler(info.row.original)}
              className="cursor-pointer"
            >
              <img
                src={PREFIX + "/pencil.svg"}
                alt="penicl icon"
                height={18}
                width={18}
              />
            </div>
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



  const updateSessionHandler = (info) => {
    setEditValues(info);
    setOpenDrawer(true);
  };

  // Delete Session Handler

  const DeleteSession = (id) => {
    Swal.fire({
      title: "Delete Session",
      text: "Are You Sure Want To Delete This Slider?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_SESSION}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  // Update Session Status

  const UpdateStatus = (id) => {
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_SESSION_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);
  return (
    <>
      {/* Table Header */}
      {/* <div
        className="flex px-4 py-3 h-14  items-center justify-between"
        title="table-header"
      >
        <div className="flex items-center gap-4">
          <div className="border h-7 w-7 flex cursor-pointer justify-center items-center rounded-lg border-[#E4E8EE] p-1">
            <Image
              src={`${PREFIX}/searchIcon.svg`}
              alt="search Icon"
              height={15}
              width={15}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="border h-7 w-7 flex justify-center cursor-pointer items-center rounded-lg border-[#E4E8EE] p-1">
            <Image
              src={`${PREFIX}/updownarrow.svg`}
              alt="UpDownArrowIcon"
              height={15}
              width={15}
            />
          </div>
        </div>
      </div> */}
      {/* Main Section 1 Table */}
      <div className="sectionTable2 overflow-x-auto" title="mainTable">
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
          {isLoading ? (
            <TableSkeleton row={3} cell={11} />
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

      {openDrawer && (
        <UpdateSession
          open={openDrawer}
          setOpen={setOpenDrawer}
          data={editValues}
          refetchFn={fetchData}
        />
      )}
    </>
  );
}
