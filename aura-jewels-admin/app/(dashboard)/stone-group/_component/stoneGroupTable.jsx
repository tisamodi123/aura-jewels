"use client";
import { PREFIX } from "@/lib/APIUrl";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { formatedPrice, isValidData } from "@/lib/utils";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import Swal from "sweetalert2";
import StoneGrpModal from "./StoneGrpModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "@/styles/collectiontable.css";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import NoDataFound from "@/components/NoDataFound";
import TableSkeleton from "@/components/tableSkeleton";

const EMPTY_FILTERS = {
  stoneType: "",
  shape: "",
  color: "",
  clarity: "",
  status: "",
  caratMin: "",
  caratMax: "",
};

export default function StoneGroupTable({ diaType, setDiaType }) {
  const token = getToken();
  const router = useRouter();

  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stoneGrpData, setStoneGrpData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterOptions, setFilterOptions] = useState({
    colors: [],
    clarities: [],
    stoneTypes: [],
    shapes: [],
    // Every shape in the Parameter master, so the Add form can introduce the
    // first group for a shape no group uses yet.
    allShapes: [],
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(
    () => [
      // {
      //   header: "No",
      //   id: "no",
      //   accessorKey: "",

      //   cell: (info) => <div>
      //     {console.log('info.row --->', info.row)}
      //     {info.row.index + 1}
      //   </div>,
      //   enableSorting: false,
      // },
      { header: "Stone Type", accessorKey: "stoneType" },
      { header: "Type", accessorKey: "type", cell: (info) => { return info.getValue() || "-"; } },
      { header: "Shape", accessorKey: "shape", cell: (info) => { return info.getValue() || "-"; } },
      { header: "Color", accessorKey: "color", cell: (info) => { return info.getValue() || "-"; } },
      { header: "Clarity", accessorKey: "clarity", cell: (info) => { return info.getValue() || "-"; } },
      { header: "Size", accessorKey: "carat", cell: (info) => { return info.getValue() || "-"; } },
      {
        header: "LGD Price",
        accessorKey: "lgdPrice",
        cell: (info) => {
          const rawAmount = info.row.original.lgdPrice;
          const price = typeof rawAmount === "number" && !isNaN(rawAmount)
            ? Math.round(rawAmount * 100) / 100
            : "-";
          return <div>{price}</div>;
        },
      },
      {
        header: "Natural Price",
        accessorKey: "naturalPrice",
        cell: (info) => {
          const rawAmount = info.row.original.naturalPrice;
          const price = typeof rawAmount === "number" && !isNaN(rawAmount)
            ? Math.round(rawAmount * 100) / 100
            : "-";
          return <div>{price}</div>;
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <span
            onClick={() => UpdateStatus(info.row.original.id)}
            className={`${info.row.original.status === "ACTIVE"
              ? "text-[#17863E]  bg-[#17863e1a]"
              : "text-[#ED4842]  bg-[#ed48421a]"
              } text-[0.70rem] cursor-pointer font-semibold px-4 py-2 rounded-md`}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
      },
      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <div
              onClick={() => handleShowModal(info.row.original)}
              className="cursor-pointer"
            >
              <img
                src={PREFIX + "/pencil.svg"}
                alt="pencil icon"
                height={18}
                width={18}
              />
            </div>
            <div
              onClick={() => handleDelete(info.row.original.id || info.row.original._id)}
              className="cursor-pointer"
            >
              <img
                src={PREFIX + "/trashIcon.svg"}
                alt="trash icon"
                height={14}
                width={14}
              />
            </div>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: stoneGrpData,
    columns,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    manualPagination: true,
    manualFiltering: true, // ✅ Add this
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  const debounceTimeout = useRef(null);

  // useEffect(() => {
  //   if (!isValidData(token)) {
  //     router.replace("login");
  //     return;
  //   }

  //   if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

  //   debounceTimeout.current = setTimeout(() => {
  //     setPagination(prev => ({ ...prev, pageIndex: 0 }));
  //     fetchStoneGrpData();
  //   }, 1000);

  //   return () => debounceTimeout.current && clearTimeout(debounceTimeout.current);

  // }, [searchText, diaType]);
  // useEffect(() => {
  //   if (!isValidData(token)) {
  //     router.replace("login");
  //     return;
  //   }

  //   if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

  //   debounceTimeout.current = setTimeout(() => {
  //     // Only reset page if not already on page 0
  //     if (pagination.pageIndex !== 0) {
  //       setPagination(prev => ({ ...prev, pageIndex: 0 }));
  //     } else {
  //       fetchStoneGrpData();
  //     }
  //   }, 1000);

  //   return () => clearTimeout(debounceTimeout.current);
  // }, [searchText, diaType]);

  // useEffect(() => {
  //   if (!isValidData(token)) {
  //     router.replace("login");
  //     return;
  //   }

  //   fetchStoneGrpData();
  // }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    if (!isValidData(token)) {
      router.replace("login");
      return;
    }
    fetchFilterOptions();
  }, []);

  // A new search term or filter invalidates the current page number — searching
  // while on page 5 would otherwise land on an empty page.
  useEffect(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, [searchText, diaType, filters]);

  useEffect(() => {
    if (!isValidData(token)) {
      router.replace("login");
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      fetchStoneGrpData();
    }, 500);

    return () => clearTimeout(debounceTimeout.current);

  }, [searchText, diaType, filters, pagination.pageIndex, pagination.pageSize]);

  // useEffect(() => {
  //   if (!isValidData(token)) {
  //     router.replace("login");
  //   } else {
  //     fetchStoneGrpData();
  //   }
  // }, [pagination.pageIndex, pagination.pageSize, diaType]);

  const fetchStoneGrpData = async () => {
    try {
      setStoneGrpData([]);
      setIsLoading(true);
      const formData = new FormData();
      formData.append("page", pagination.pageIndex + 1);
      formData.append("limit", pagination.pageSize);

      // The search box and the filters used to be re-render triggers only —
      // they were never sent, so typing just refetched the same unfiltered page.
      // Only append non-empty values: the API validates `status` against an enum
      // and `caratMin`/`caratMax` as numbers.
      if (searchText.trim()) formData.append("search", searchText.trim());
      if (filters.stoneType) formData.append("stoneType", filters.stoneType);
      if (filters.shape) formData.append("shape", filters.shape);
      if (filters.color) formData.append("color", filters.color);
      if (filters.clarity) formData.append("clarity", filters.clarity);
      if (filters.status) formData.append("status", filters.status);
      if (filters.caratMin !== "") formData.append("caratMin", filters.caratMin);
      if (filters.caratMax !== "") formData.append("caratMax", filters.caratMax);

      const result = await callApi(`${API_URL?.STONE_GROUP_LIST}`, "POST", formData, token);
      setIsLoading(false);

      if (result?.errorCode === STATUS_CODE.OK) {
        setStoneGrpData(result?.data || []);
        setTotalRows(result?.pagination?.total > 0 ? result?.pagination.total : 0);
      } else {
        setStoneGrpData([]);
        setTotalRows(0);
        toast.error(result?.message || M.common.fetchFailed);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Error fetching diamond data.", error);
      toast.error(M.common.fetchFailed);
    }
  };

  // Dropdown options come from the rows that actually exist, so the filters can
  // never offer a value that returns nothing.
  const fetchFilterOptions = async () => {
    try {
      const res = await callApi(API_URL.STONE_GROUP_DISTINCT_ATTRIBUTES, "GET", null, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        setFilterOptions({
          colors: res.data?.colors || [],
          clarities: res.data?.clarities || [],
          stoneTypes: res.data?.stoneTypes || [],
          shapes: res.data?.shapes || [],
          allShapes: res.data?.allShapes || res.data?.shapes || [],
        });
      }
    } catch (error) {
      console.log("Error fetching stone group filter options.", error);
    }
  };

  // A new/edited group can introduce a colour, clarity or shape the filter
  // dropdowns have never seen, so refresh both after any write.
  const refreshAll = () => {
    fetchStoneGrpData();
    fetchFilterOptions();
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchText("");
    setFilters(EMPTY_FILTERS);
  };

  const hasActiveFilter =
    searchText.trim() !== "" || Object.values(filters).some((v) => v !== "");

  const handleShowModal = (rowData = "") => {
    if (rowData) {
      setRowData(rowData);
    } else {
      setRowData({});
    }
    setOpenDrawer(true);
  };

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
        callApi(`${API_URL?.UPDATE_STONE_GROUP_STATUS}/${id}`, "PUT", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              fetchStoneGrpData();
            } else {
              toast.error(result?.message);
            }
          }
        );
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Stone Group",
      text: "Are you sure you want to delete this stone group?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_STONE_GROUP}/${id}`, "DELETE", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message || "Stone group deleted successfully!");
              fetchStoneGrpData();
            } else {
              toast.error(result?.message || "Failed to delete stone group!");
            }
          }
        );
      }
    });
  };

  return (
    <>
      <div className="shadow-md border border-zinc-200 bg-white rounded-md">
        <div
          className="flex flex-wrap gap-2 px-4 py-3 items-center justify-between border-b border-zinc-100"
          title="table-header"
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Search is always expanded now that it actually filters. */}
            <div className="border h-9 flex items-center rounded-lg border-[#E4E8EE] px-2 bg-zinc-50">
              <Image
                src={`${PREFIX}/searchIcon.svg`}
                alt="search Icon"
                height={15}
                width={15}
              />
              <input
                type="text"
                placeholder="Search shape, colour, clarity, size..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-56 px-2 bg-transparent text-xs border-none outline-none"
              />
            </div>

            <select
              value={filters.stoneType}
              onChange={(e) => updateFilter("stoneType", e.target.value)}
              className="h-9 rounded-lg border border-[#E4E8EE] bg-white px-2 text-xs text-[#656B7B] outline-none"
            >
              <option value="">All Stone Types</option>
              {filterOptions.stoneTypes.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <select
              value={filters.shape}
              onChange={(e) => updateFilter("shape", e.target.value)}
              className="h-9 rounded-lg border border-[#E4E8EE] bg-white px-2 text-xs text-[#656B7B] outline-none"
            >
              <option value="">All Shapes</option>
              {filterOptions.shapes.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <select
              value={filters.color}
              onChange={(e) => updateFilter("color", e.target.value)}
              className="h-9 rounded-lg border border-[#E4E8EE] bg-white px-2 text-xs text-[#656B7B] outline-none"
            >
              <option value="">All Colours</option>
              {filterOptions.colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filters.clarity}
              onChange={(e) => updateFilter("clarity", e.target.value)}
              className="h-9 rounded-lg border border-[#E4E8EE] bg-white px-2 text-xs text-[#656B7B] outline-none"
            >
              <option value="">All Clarities</option>
              {filterOptions.clarities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="h-9 rounded-lg border border-[#E4E8EE] bg-white px-2 text-xs text-[#656B7B] outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {/* Size range. `carat` is stored as a string bucket, so the API
                converts it numerically and drops non-numeric buckets. */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="Size min"
                value={filters.caratMin}
                onChange={(e) => updateFilter("caratMin", e.target.value)}
                className="h-9 w-24 rounded-lg border border-[#E4E8EE] bg-white px-2 text-xs outline-none"
              />
              <span className="text-xs text-gray-400">–</span>
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="Size max"
                value={filters.caratMax}
                onChange={(e) => updateFilter("caratMax", e.target.value)}
                className="h-9 w-24 rounded-lg border border-[#E4E8EE] bg-white px-2 text-xs outline-none"
              />
            </div>

            {hasActiveFilter && (
              <Button
                variant="outline"
                className="h-9 text-xs hand"
                onClick={resetFilters}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-gray-500">
              {totalRows > 0 && `${totalRows} record${totalRows !== 1 ? "s" : ""}`}
            </div>
            {/* Adds one group in place. The Import button replaces the whole
                master, which orphans every product's stone reference. */}
            <Button
              className="h-9 text-xs hand bg-[#087B5D] hover:bg-[#29AB87] text-white"
              onClick={() => handleShowModal()}
            >
              <Plus size={14} className="mr-1" />
              Add Stone Group
            </Button>
          </div>
        </div>

        <div className="priceDiscountTable" title="mainTable">
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
            {
              isLoading ? (<>
                <TableSkeleton row={4} cell={columns?.length} />
              </>) : (

                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-8">
                        <p className="text-gray-500">No data available</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              )
            }
          </table>
        </div>

        {stoneGrpData?.length > 0 && (
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
      <StoneGrpModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        fetchStoneGrpData={refreshAll}
        rowData={rowData}
        setRowData={setRowData}
        filterOptions={filterOptions}
      />
    </>
  );
}
