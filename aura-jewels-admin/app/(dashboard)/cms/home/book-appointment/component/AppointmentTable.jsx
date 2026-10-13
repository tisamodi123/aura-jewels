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
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import NoDataFound from "@/components/NoDataFound";

import Swal from "sweetalert2";
import UpdateAppointment from "./UpdateAppointment";

export default function AppointmentTable({ tableData, fetchData, isLoading }) {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [toggleValue, setToggleValue] = useState("Add");
    const [rowData, setRowData] = useState({});
    const [addUpdateLoading, setAddUpdateLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSatatusModal, setShowSatatusModal] = useState(false);
    const token = getToken();
    const [editValues, setEditValues] = useState(null);
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
                header: "Description",
                accessorKey: "description",
                enableSorting: false,
                enableColumnFilter: false,
            },
            {
                header: "Button text",
                accessorKey: "buttontext1",
                enableSorting: false,
                enableColumnFilter: false,
            },
            {
                header: "Button Link",
                accessorKey: "buttonlink1",
                cell: (info) => (
                    <a
                        href={info.getValue()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline truncate block max-w-[200px]"
                    >
                        {info.getValue()}
                    </a>
                ),
                enableSorting: false,
                enableColumnFilter: false,
            },

            // {
            //   header: "Status",
            //   accessorKey: "status",
            //   cell: (info) => (
            //     <span
            //       onClick={() => UpdateStatus(info.row.original.id)}
            //       className={`${info.getValue() === "ACTIVE"
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

    // Update Session Handler

    const updateSessionHandler = (info) => {
        setEditValues(info);
        setOpenDrawer(true);
    };

    const DeleteSession = (id) => {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
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

    useEffect(() => {
        setData([...tableData]);
    }, [tableData]);

    const debounceTimeout = useRef(null);


    const [searchText, setSearchText] = useState("");
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            setGlobalFilter(searchText);
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }, 500);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchText]);
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
                    ) : tableData.length === 0 ? (
                        <NoDataFound headerLength={5} />
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
                <UpdateAppointment
                    open={openDrawer}
                    setOpen={setOpenDrawer}
                    data={editValues}
                    refetchFn={fetchData}
                />
            )}
        </>
    );
}
