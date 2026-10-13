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
import Swal from "sweetalert2";

export default function InstagramSession({ data, fetchData, isLoading, onEdit }) {

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


    useEffect(() => {
        // Load Instagram embed script if there's any script content
        const hasScript = data?.some(item => item.type === "script" || item.scriptText);
        if (hasScript) {
            const scriptId = "instagram-embed-script";
            if (!document.getElementById(scriptId)) {
                const script = document.createElement("script");
                script.id = scriptId;
                script.src = "//www.instagram.com/embed.js";
                script.async = true;
                script.onload = () => {
                    if (window.instgrm) window.instgrm.Embeds.process();
                };
                document.body.appendChild(script);
            } else if (window.instgrm) {
                window.instgrm.Embeds.process();
            }
        }
    }, [data]);


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
                header: "Media",
                accessorKey: "image",
                cell: (info) => {
                    const row = info.row.original;
                    const imageValue = row.image;
                    const videoValue = row.video;
                    const scriptValue = row.scriptText;
                    const type = row.type;

                    return (
                        <div className="flex justify-center">
                            {type === "video" || videoValue ? (
                                <video
                                    src={videoValue}
                                    width={100}
                                    height={100}
                                    className="rounded-md object-cover h-[100px] w-[100px]"
                                    muted
                                    loop
                                    autoPlay
                                />
                            ) : type === "script" || scriptValue ? (
                                <div
                                    className="w-[100px] h-[100px] overflow-hidden text-[10px] border rounded-md p-1 bg-gray-50 flex items-center justify-center text-center relative"
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: scriptValue }}
                                        className="scale-50 origin-top transform-gpu"
                                    />
                                    <div className="absolute inset-0 bg-transparent" title="Instagram Content" />
                                </div>
                            ) : imageValue ? (
                                <SafeImage
                                    src={imageValue}
                                    fallback={`${PREFIX}/noImage2.jpg`}
                                    fallbackWidth={50}
                                    fallbackHeight={50}
                                    width={100}
                                    height={100}
                                    alt={"desktop_image"}
                                />
                            ) : (
                                <div className="text-[0.75rem] text-gray-400 font-medium italic">
                                    No Media
                                </div>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            },


            {
                header: "URL",
                accessorKey: "buttonlink1",
                cell: (info) => {
                    const row = info.row.original;
                    const link = row.buttonlink1 || row.buttontext1;
                    return (
                        <div>
                            <div className="">
                                <div className="pb-2 text-center">
                                    {link ? (
                                        <Link
                                            className="hover:text-blue-600 underline text-sm"
                                            target="_blank"
                                            href={link}
                                        >
                                            Link
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400 italic text-[0.75rem]">No Link</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                },
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
                        <div
                            onClick={() => DeleteSession(info.row.original.id)}
                            className="cursor-pointer"
                        >
                            <img
                                src={PREFIX + "/trashIcon.svg"}
                                alt="penicl icon"
                                height={12}
                                width={12}
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
        if (onEdit) {
            onEdit(info);
        }
    };


    // Delete Session Handler
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


    // Update Session Status
    const UpdateStatus = (id) => {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

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


    return (
        <>
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
                        <TableSkeleton row={3} cell={5} />
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
