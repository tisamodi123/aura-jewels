"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PREFIX, API_URL } from "@/lib/APIUrl";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import { confirmDelete } from "@/lib/swal";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";
import { showError, showSuccess } from "@/lib/toast";
import { STATUS_CODE } from "@/lib/Constant";
import { useMe } from "@/lib/usePermissions";
import Image from "next/image";
import TableSkeleton from "@/components/tableSkeleton";
import NoDataFound from "@/components/NoDataFound";
import TablePagination from "@/components/TablePagination";
import ContactInquiryStatusCell from "./ContactInquiryStatusCell";
import "@/styles/collectiontable.css";

export default function ContactInquiryTable({
    tableData,
    loading,
    totalRows,
    pagination,
    setPagination,
    refetch,
    onViewDetails,
    searchText,
    setSearchText,
}) {
    const token = getToken();
    const { can } = useMe();
    const [data, setData] = useState([...tableData]);
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [showInput, setShowInput] = useState(false);

    const canUpdate = can("contact_inquiry_update");

    const handleDelete = async (inquiryId) => {
        const confirmation = await confirmDelete(
            "Delete Inquiry",
            "Are you sure you want to delete this contact inquiry? This action cannot be undone."
        );
        if (!confirmation.isConfirmed) return;

        try {
            const res = await callApi(API_URL.DELETE_CONTACT_INQUIRY(inquiryId), "GET", null, token);

            if (res?.errorCode === STATUS_CODE.OK) {
                showSuccess(res?.message || "Inquiry deleted successfully.");
                refetch();
            } else {
                showError(res?.message || "Failed to delete inquiry.");
            }
        } catch (error) {
            console.log("Delete contact inquiry error:", error);
            showError("An error occurred while deleting the inquiry.");
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
                header: "Customer Details",
                id: "customerDetails",
                accessorFn: (row) => `${row.firstName || ""} ${row.lastName || ""}`.trim(),
                cell: (info) => {
                    const row = info.row.original;
                    const name = `${row.firstName || ""} ${row.lastName || ""}`.trim();
                    return (
                        <div className="text-left">
                            <div className="font-semibold text-gray-800">{name || "—"}</div>
                            <div className="text-xs text-gray-500 break-all">
                                <a href={`mailto:${row.email}`} className="hover:underline text-indigo-600">
                                    {row.email}
                                </a>
                            </div>
                        </div>
                    );
                },
            },
            {
                header: "Subject",
                accessorKey: "subject",
                cell: (info) => (
                    <span className="text-xs font-medium text-gray-700">{info.getValue() || "—"}</span>
                ),
            },
            {
                header: "Message",
                accessorKey: "message",
                enableSorting: false,
                cell: (info) => {
                    const message = info.getValue();
                    return message ? (
                        <div
                            className="max-w-[240px] truncate text-xs text-gray-500 italic mx-auto"
                            title={message}
                        >
                            {message}
                        </div>
                    ) : (
                        <span className="text-gray-300">—</span>
                    );
                },
            },
            {
                header: "Status",
                id: "status",
                enableSorting: false,
                cell: (info) => <ContactInquiryStatusCell inquiry={info.row.original} refetch={refetch} />,
            },
            {
                header: "Submitted On",
                accessorKey: "createdAt",
                cell: (info) => {
                    const val = info.getValue();
                    return val
                        ? new Date(val).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })
                        : "—";
                },
            },
            {
                header: "Action",
                id: "action",
                enableSorting: false,
                cell: (info) => (
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                            title="View Details"
                            onClick={() => onViewDetails(info.row.original._id)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-black"
                        >
                            <Eye size={16} />
                        </button>
                        {canUpdate && (
                            <button
                                title="Delete"
                                onClick={() => handleDelete(info.row.original._id)}
                                className="p-1.5 rounded-md hover:bg-rose-50 transition-colors text-rose-500 hover:text-rose-700"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [pagination.pageIndex, pagination.pageSize, refetch, onViewDetails, canUpdate]
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
        manualPagination: true,
        pageCount: Math.ceil(totalRows / pagination.pageSize),
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
            {/* Header controls inside table card */}
            <div className="flex px-4 py-3 h-14 items-center justify-between border-b border-zinc-100">
                <div className="text-sm font-semibold text-gray-500">
                    {totalRows > 0 && `${totalRows} Inquir${totalRows !== 1 ? "ies" : "y"}`}
                </div>
                <div className="border h-8 flex items-center rounded-lg border-[#E4E8EE] p-1.5 bg-zinc-50 transition-all duration-300">
                    <input
                        type="text"
                        placeholder="Search name, email or message..."
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
