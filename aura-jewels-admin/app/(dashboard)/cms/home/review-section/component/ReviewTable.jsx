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
import { format } from "date-fns";
import { toast } from "sonner";
import TableSkeleton from "@/components/tableSkeleton";
import UpdateReview from "./UpdateReview";
import Swal from "sweetalert2";

export default function ReviewTable({ tableData, fetchData, isLoading, onEdit, onDelete, onUpdateStatus }) {
    const [openDrawer, setOpenDrawer] = useState(false);
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

    const [data, setData] = useState(Array.isArray(tableData) ? [...tableData] : []);
    const columns = useMemo(
        () => [
            {
                id: "Sr.No",
                accessorKey: "srNo",
                header: "Sr.No",
                cell: (info) => info.row.index + 1,
                enableSorting: false,
                enableColumnFilter: false,
            },
            {
                header: "Name",
                accessorKey: "CustName",
            },
            {
                header: "Location",
                accessorKey: "City",
            },
            {
                header: "Rating",
                accessorKey: "Rate",
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: (info) => {
                    const status = info.getValue();
                    return (
                        <span
                            className={`cursor-pointer px-4 py-2 text-xs rounded-md ${
                                status === "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                            onClick={() => onUpdateStatus(info.row.original.id)}
                        >
                            {status}
                        </span>
                    );
                },
            },
            {
                header: "Title",
                accessorKey: "Title",
            },
            {
                header: "Date",
                accessorKey: "date",
                cell: (info) => {
                    const dateVal = info.getValue();
                    return dateVal ? format(new Date(dateVal), "yyyy-MM-dd") : "N/A";
                },
            },
            {
                header: "Action",
                accessorKey: "",
                id: "action",
                cell: (info) => (
                    <div className="flex items-center justify-center gap-2">
                        <div
                            onClick={() => updateReviewHandler(info.row.original)}
                            className="cursor-pointer"
                        >
                            <img
                                src={PREFIX + "/pencil.svg"}
                                alt="edit icon"
                                height={18}
                                width={18}
                            />
                        </div>
                        <div
                            onClick={() => DeleteReview(info.row.original.id)}
                            className="cursor-pointer"
                        >
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

    // Update Review Handler
    const updateReviewHandler = (info) => {
        setEditValues(info);
        setOpenDrawer(true);
    };

    // Delete Review Handler
    const DeleteReview = (id) => {
        Swal.fire({
            title: "Delete Review",
            text: "Are You Sure Want To Delete This Review?",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "No",
            confirmButtonText: "Yes",
        }).then((result) => {
            if (result.isConfirmed === true) {
                onDelete(id);
                toast.success("Review Deleted successfully!");
            }
        });
    };

    useEffect(() => {
        setData(Array.isArray(tableData) ? [...tableData] : []);
    }, [tableData]);

    return (
        <>
            <div className="sectionTable overflow-x-auto" title="mainTable">
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
                        <TableSkeleton row={3} cell={7} />
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
            {openDrawer && (
                <UpdateReview
                    open={openDrawer}
                    setOpen={setOpenDrawer}
                    data={editValues}
                    onEdit={onEdit}
                />
            )}
        </>
    );
}
