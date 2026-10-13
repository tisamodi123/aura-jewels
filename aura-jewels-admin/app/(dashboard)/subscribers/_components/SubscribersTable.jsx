"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PREFIX, API_URL } from "@/lib/APIUrl";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { confirmDelete } from "@/lib/swal";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";
import { showError, showSuccess } from "@/lib/toast";
import { STATUS_CODE } from "@/lib/Constant";
import Image from "next/image";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";
import TablePagination from "@/components/TablePagination";
import "@/styles/collectiontable.css";

export default function SubscribersTable({
    tableData,
    loading,
    refetch,
    searchText,
    setSearchText,
}) {
    const token = getToken();
    const [data, setData] = useState([...tableData]);
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [showInput, setShowInput] = useState(false);

    // Client-side pagination state
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const handleDelete = async (subscriberId) => {
        const confirmation = await confirmDelete(
            "Delete Subscriber",
            "Are you sure you want to delete this subscription? This action cannot be undone."
        );
        if (!confirmation.isConfirmed) return;

        try {
            const res = await callApi(API_URL.DELETE_SUBSCRIBER(subscriberId), "GET", null, token);

            if (res?.errorCode === STATUS_CODE.OK) {
                showSuccess(res?.message || "Subscriber deleted successfully.");
                refetch();
            } else {
                showError(res?.message || "Failed to delete subscriber.");
            }
        } catch (error) {
            console.log("Delete subscriber error:", error);
        }
    };

    const columns = useMemo(
        () => [
            {
                header: "#",
                id: "serial",
                enableSorting: false,
                cell: (info) => pagination.pageIndex * pagination.pageSize + info.row.index + 1,
            },
            {
                header: "Email Address",
                accessorKey: "email",
                cell: (info) => {
                    const email = info.getValue();
                    return (
                        <div className="text-left font-semibold text-gray-800">
                            <a href={`mailto:${email}`} className="hover:underline text-indigo-600">
                                {email || "—"}
                            </a>
                        </div>
                    );
                },
            },
            // {
            //     header: "Status",
            //     accessorKey: "status",
            //     cell: (info) => {
            //         const status = info.getValue() || "ACTIVE";
            //         const isActive = status === "ACTIVE";
            //         return (
            //             <span
            //                 className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${isActive
            //                     ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            //                     : "bg-amber-50 text-amber-700 border border-amber-200"
            //                     }`}
            //             >
            //                 {status}
            //             </span>
            //         );
            //     },
            // },
            {
                header: "Subscribed On",
                accessorKey: "createdAt",
                cell: (info) => {
                    const val = info.getValue();
                    return val
                        ? new Date(val).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "—";
                },
            },
            {
                header: "Action",
                id: "action",
                enableSorting: false,
                cell: (info) => (
                    <div className="flex items-center justify-center">
                        <button
                            title="Delete"
                            onClick={() => handleDelete(info.row.original._id)}
                            className="p-1.5 rounded-md hover:bg-rose-50 transition-colors text-rose-500 hover:text-rose-700"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ),
            },
        ],
        [pagination.pageIndex, pagination.pageSize, refetch]
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    useEffect(() => {
        setData([...tableData]);
        // Reset page index if search changes search result count below page offset
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [tableData]);

    const totalRows = tableData.length;

    return (
        <>
            {/* Header controls inside table card */}
            <div className="flex px-4 py-3 h-14 items-center justify-between border-b border-zinc-100">
                <div className="text-sm font-semibold text-gray-500">
                    {totalRows > 0 && `${totalRows} Subscriber${totalRows !== 1 ? "s" : ""}`}
                </div>
                <div className="border h-8 flex items-center rounded-lg border-[#E4E8EE] p-1.5 bg-zinc-50 transition-all duration-300">
                    <input
                        type="text"
                        placeholder="Search email..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={`transition-all duration-500 bg-transparent text-xs border-none outline-none ${showInput ? "w-52 px-2 visible" : "w-0 px-0 invisible"
                            }`}
                    />
                    <Image
                        onClick={() => setShowInput(!showInput)}
                        src={`${PREFIX}/searchIcon.svg`}
                        alt="search Icon"
                        height={15}
                        width={15}
                        className="cursor-pointer hover:scale-105 transition-transform"
                    />
                </div>
            </div>

            <div className="collectionTable">
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
                                        {!header.isPlaceholder && (
                                            <div className="flex items-center justify-center gap-1">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && <span>⇅</span>}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    {loading && tableData.length === 0 ? (
                        <TableSkeleton row={5} cell={columns.length} />
                    ) : !loading && tableData.length > 0 ? (
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
                    ) : !loading && tableData.length === 0 ? (
                        <NoDataFound headerLength={columns.length} />
                    ) : null}
                </table>
            </div>

            {data?.length > 0 && (
                <TablePagination
                    pagination={pagination}
                    setPagination={setPagination}
                    totalRows={totalRows}
                />
            )}
        </>
    );
}