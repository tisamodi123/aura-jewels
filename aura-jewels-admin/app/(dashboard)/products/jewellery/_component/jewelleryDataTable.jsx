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
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "@/styles/jewellerylisttable.css";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import NoDataFound from "@/components/NoDataFound";
import TableSkeletonLoader from "@/components/tableSkeletonLoader";
import TableSkeleton from "@/components/tableSkeleton";
import { PRODUCT_STATUS } from "@/lib/Constant";

export default function JewelleryDataTable({
  tableData,
  onDelete,
  onUpdateStatus,
  pagination,
  totalRows,
  searchText,
  setSerchText,
  archived,
  setArchieved,
  setStatus,
  status,
  setPagination,
  isLoading,
  setSelectedIds,
  selectedIds
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [toggleValue, setToggleValue] = useState("Add");
  const [rowData, setRowData] = useState({});
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSatatusModal, setShowSatatusModal] = useState(false);
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [activeStatus, setActiveStatus] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const rowSelection = useMemo(() => {
    const sel = {};
    if (Array.isArray(selectedIds)) {
      selectedIds.forEach((id) => {
        sel[id] = true;
      });
    }
    return sel;
  }, [selectedIds]);
  const [globalFilter, setGlobalFilter] = useState([]);

  const [data, setData] = useState([...tableData]);

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="cursor-pointer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="cursor-pointer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "view",
        accessorKey: "",
        header: "View",
        cell: ({ row }) => (
          <div
            onClick={() => handleNavigator(row.original._id)}
            className="flex justify-center cursor-pointer"
          >
            <Eye size={18} className="hover:text-blue-300" />
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      // {
      //   header: "Build Product",
      //   accessorKey: "buildproduct",
      // },
      {
        header: "Product",
        accessorKey: "productTitle",
      },
      { header: "Sku", accessorKey: "itemCode" },
      {
        header: "Parent Item Code",
        accessorKey: "parentItemCode",
        cell: (info) => {
          const value = info.getValue();
          return <span>{value || '-'}</span>;
        }
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: (info) => {
          const category = info.getValue();
          if (typeof category === 'object' && category !== null) {
            return <span>{category.categoryName || '-'}</span>;
          }
          return <span>{category || '-'}</span>;
        }
      },
      {
        header: "Sub Category",
        accessorKey: "subCategories",
        cell: (info) => {
          const subCategories = info.getValue() || [];
          return (
            <div className="flex flex-wrap gap-1">
              {subCategories.map((subCat, index) => {
                const subCatName = typeof subCat === 'object' && subCat !== null
                  ? subCat.categoryName
                  : subCat;
                return (
                  <span
                    key={index}
                    className="bg-gray-200 m-auto px-2 py-1 rounded text-xs"
                  >
                    {subCatName || '-'}
                  </span>
                )
              })}
            </div>
          );
        },
      },
      {
        header: "Price",
        accessorKey: "finalPrice",
        cell: (info) => {
          const price = info.getValue();
          return <span>{price ? `₹${price.toLocaleString()}` : '-'}</span>;
        }
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const newStatus = info.row.original.status === PRODUCT_STATUS.AVALIABLE ? PRODUCT_STATUS.HOLD : PRODUCT_STATUS.AVALIABLE;
          return (
            <span
              className={`${info.row.original.status === PRODUCT_STATUS.AVALIABLE
                ? "text-[#17863E]  bg-[#17863e1a]"
                : "text-[#ED4842]  bg-[#ed48421a]"
                } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
              onClick={() => onUpdateStatus(info.row.original._id, newStatus)}
            >
              {info.getValue() == PRODUCT_STATUS.AVALIABLE ? "Available" : "Hold"}
            </span>
          )
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Metal Wgt.",
        accessorKey: "appxMetalWgt",
      },
      {
        header: "Metal",
        accessorKey: "metalType",
        cell: (info) => {
          const metal = info.getValue();
          if (typeof metal === 'object' && metal !== null) {
            return <span>{metal.metalName || '-'}</span>;
          }
          return <span>{metal || '-'}</span>;
        }
      },
      {
        header: "Last Update Date", accessorKey: "updatedAt",
        cell: (info) => {
          const date = info.getValue();
          return <span>{date ? new Date(date).toISOString().split('T')[0] : '-'}</span>;
        }
      },
      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <div onClick={() => router.push(`/products/jewellery/${info.row.original._id}`)} className="cursor-pointer">
              <img
                src={PREFIX + "/pencil.svg"}
                alt="penicl icon"
                height={18}
                width={18}
              />
            </div>

            <div
              onClick={() => onDelete(info.row.original._id)}
              className="cursor-pointer"
            >
              <Image
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
    data: data,
    columns,
    manualPagination: true,
    getRowId: (row) => row._id,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
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
    onRowSelectionChange: (updater) => {
      if (setSelectedIds) {
        const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
        const selected = Object.keys(newSelection).filter((key) => newSelection[key]);
        setSelectedIds(selected);
      }
    },
  });

  //   When Table Data Changes
  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  const handleNavigator = (id) => {
    router.push(`/products/jewellery/${id}?mode=view`);
  };

  const handleStatus = (state) => {
    if (state === "Archieved") {
      setStatus("");
      setActiveStatus(state);
      setArchieved(true);
    } else {
      setStatus(state);
      setActiveStatus(state);
      setArchieved(false);
    }
  };
  return (
    <>

      {/* Main Jewellery Table */}
      <div className="jewelleryTable overflow-auto" title="mainTable">
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
            <TableSkeleton row={4} cell={12}></TableSkeleton>
          ) : tableData.length > 0 ? (
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
          ) : (
            <NoDataFound headerLength={columns.length} />
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
