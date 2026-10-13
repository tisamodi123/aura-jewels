"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { showError, showSuccess } from "@/lib/toast";
import Image from "next/image";
import Swal from 'sweetalert2';
import NoDataFound from "@/components/NoDataFound";
import TablePagination from "@/components/TablePagination";
import TableSkeleton from "@/components/tableSkeleton";
import CouponModal from "./CouponModal";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import "@/styles/jewellerylisttable.css";

const AssigneeCell = ({ assignees }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // 200ms delay to smoothly cross the gap
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="capitalize text-emerald-600 font-semibold underline decoration-dotted decoration-emerald-500/50 hover:text-emerald-700 cursor-pointer inline-block"
        >
          Assignee Only ({assignees.length})
        </span>
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-white border border-[#E4E8EE] rounded-lg p-3 shadow-xl w-60 z-[9999]"
        align="center"
        side="top"
        sideOffset={8}
      >
        <p className="font-semibold border-b border-[#E4E8EE] pb-1.5 mb-1.5 text-[10px] uppercase text-zinc-500 tracking-wider">
          Assigned Customers ({assignees.length})
        </p>
        <div className="max-h-36 overflow-y-auto custom-scrollbar flex flex-col gap-2 text-left">
          {assignees.map((a, idx) => {
            const name = typeof a === 'object' ? (a.name || 'Unnamed User') : a;
            const email = typeof a === 'object' && a.email ? a.email : '';
            return (
              <div key={idx} className="flex flex-col border-b border-gray-50 last:border-0 pb-1 last:pb-0">
                <span className="font-semibold text-[#111827] text-xs leading-normal">{name}</span>
                {email && <span className="text-[10px] text-[#4b5563] leading-normal">{email}</span>}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function CouponTable({ tableData, pagination, setPagination, totalRows, getCoupenList, loading }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState([...tableData]);
  const token = getToken();
  const [open, setOpen] = useState(false);
  const [isRefresh, setIsRefresh] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [editData, setEditData] = useState([]);

  // Debounced search value with 500ms delay
  const debouncedSearchText = useDebounce(searchText, 500);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await callApi(API_URL.DELETE_COUPON(id), "GET", null, token);

        if (res?.errorCode === STATUS_CODE.OK) {
          showSuccess(res?.message || 'Coupon has been deleted successfully.');
          getCoupenList();
        } else {
          showError(res?.message || 'Failed to delete coupon.');
        }
      } catch (error) {
        console.log('Error from Delete Coupon:', error);
      }
    }
  };

  const handleEdit = (data) => {
    setEditData(data);
    setOpen(true);
  };

  // Custom filter function for multiple columns
  const multiColumnFilterFn = (row, columnId, filterValue) => {
    const code = row.original?.code?.toString().toLowerCase() || '';
    const name = row.original?.name?.toString().toLowerCase() || '';
    const discountValue = row.original?.discountValue?.toString().toLowerCase() || '';
    const startDate = row.original?.startDate ? new Date(row.original.startDate).toLocaleDateString('en-GB').toLowerCase() : '';
    const endDate = row.original?.endDate ? new Date(row.original.endDate).toLocaleDateString('en-GB').toLowerCase() : '';
    const priceFrom = row.original?.priceRange?.from?.toString().toLowerCase() || '';
    const priceTo = row.original?.priceRange?.to?.toString().toLowerCase() || '';
    const couponType = row.original?.couponType?.toString().toLowerCase() || '';

    const searchableContent = `${code} ${name} ${discountValue} ${startDate} ${endDate} ${priceFrom} ${priceTo} ${couponType}`;

    return searchableContent.includes(filterValue.toLowerCase());
  };

  const columns = useMemo(
    () => [
      {
        header: "Coupon Code",
        accessorKey: "code",
        cell: (info) => (
          <p className="font-semibold text-zinc-900">{info?.row?.original?.code || '-'}</p>
        ),
        filterFn: multiColumnFilterFn,
      },
      {
        header: "Coupon Name",
        accessorKey: "name",
        cell: (info) => (
          <p>{info?.row?.original?.name || '-'}</p>
        ),
      },
      {
        header: "Applied On",
        accessorKey: "appliedOn",
        cell: (info) => {
          const r = info?.row?.original || {};
          const a = (r.appliedOn || (r.discountType === 'combined' ? 'combined' : 'total')).toLowerCase();
          const label = a === 'diamond' ? 'Diamond Price'
            : a === 'making charge' ? 'Making Charge'
              : a === 'combined' ? 'Diamond + Making'
                : 'Final Price';
          return <p>{label}</p>;
        }
      },
      {
        header: "Discount Value",
        accessorKey: "discountValue",
        cell: (info) => {
          const r = info?.row?.original || {};
          // Combined (new appliedOn OR legacy discountType) shows the two
          // component %s — its discountValue is 0 and must NOT render as "0%".
          const isCombined = r.appliedOn === 'combined' || r.discountType === 'combined';
          if (isCombined) {
            const parts = [];
            if (Number(r.makingChargePercent) > 0) parts.push(`${r.makingChargePercent}% Making`);
            if (Number(r.diamondPercent) > 0) parts.push(`${r.diamondPercent}% Diamond`);
            return <p>{parts.length ? parts.join(' + ') : '-'}</p>;
          }
          const val = r.discountValue;
          if (val === undefined || val === null) return '-';
          return (
            <p>{r.discountType === 'percentage' ? `${val}%` : `₹${val} (Fixed)`}</p>
          );
        }
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
        cell: (info) => (
          <p>{info.row.original?.startDate ? new Date(info.row.original?.startDate).toLocaleDateString('en-GB') : '-'}  </p>
        )
      },
      {
        header: "Expiry Date",
        accessorKey: "endDate",
        cell: (info) => (
          <p>{info.row.original?.endDate ? new Date(info.row.original?.endDate).toLocaleDateString('en-GB') : '-'}</p>
        )
      },
      {
        header: "Spend Range",
        accessorKey: "priceRange",
        cell: (info) => {
          const from = info?.row?.original?.priceRange?.from;
          const to = info?.row?.original?.priceRange?.to;
          if (from === undefined && to === undefined) return '-';
          return (
            <p>{`₹${from || 0} - ₹${to || 0}`}</p>
          );
        }
      },
      {
        header: "Max Discount",
        accessorKey: "maxDiscountAmount",
        cell: (info) => {
          const amt = info?.row?.original?.maxDiscountAmount;
          return (
            <p>{amt ? `₹${amt}` : 'N/A'}</p>
          );
        }
      },
      {
        header: "Coupon Type",
        accessorKey: "couponType",
        cell: (info) => {
          const couponType = info?.row?.original?.couponType;
          const assignees = info?.row?.original?.assignees || [];
          const isAssigneeOnly = couponType === 'assigneeOnly';

          if (isAssigneeOnly) {
            return <AssigneeCell assignees={assignees} />;
          }

          return <p className="capitalize">{couponType || '-'}</p>;
        }
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info?.row?.original?.status;
          const isActive = status === 'active';
          return (
            <p
              onClick={() => handleStutasChanged(info?.row?.original)}
              className={`py-1 px-2.5 rounded-full text-xs font-semibold text-center cursor-pointer transition-colors max-w-[80px] m-auto ${isActive
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
            >
              {status ? status.toUpperCase() : 'INACTIVE'}
            </p>
          );
        }
      },
      {
        header: "Action",
        accessorKey: "",
        id: "action",
        cell: (info) => (
          <div className="flex items-center justify-center gap-3">
            <div onClick={() => handleEdit(info?.row?.original)} className="cursor-pointer hover:opacity-85 transition-opacity">
              <img
                src={PREFIX + "/pencil.svg"}
                alt="pencil icon"
                height={18}
                width={18}
              />
            </div>
            <div onClick={() => handleDelete(info?.row?.original?._id)} className="cursor-pointer hover:opacity-85 transition-opacity">
              <img
                src={PREFIX + "/trashIcon.svg"}
                alt="trash icon"
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
    manualPagination: true,
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
    onRowSelectionChange: setRowSelection,
    globalFilterFn: multiColumnFilterFn,
  });

  //   When Table Data Changes
  useEffect(() => {
    setData([...tableData]);
  }, [tableData]);

  // Apply debounced search to global filter
  useEffect(() => {
    setGlobalFilter(debouncedSearchText);
  }, [debouncedSearchText]);

  const handleStutasChanged = async (couponData) => {
    const id = couponData?._id;
    const currentStatus = couponData?.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change the coupon status to ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#087B5D',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }
    try {
      const fData = new FormData();
      fData.append('id', id);
      fData.append('code', couponData.code);
      fData.append('name', couponData.name);
      fData.append('description', couponData.description || '');
      fData.append('startDate', couponData.startDate);
      fData.append('endDate', couponData.endDate);
      fData.append('priceRange', JSON.stringify({
        from: couponData.priceRange?.from !== undefined ? couponData.priceRange.from : 0,
        to: couponData.priceRange?.to !== undefined ? couponData.priceRange.to : 0
      }));
      fData.append('discountType', couponData.discountType);
      fData.append('discountValue', couponData.discountValue);
      if (couponData.discountType === 'percentage' && couponData.maxDiscountAmount) {
        fData.append('maxDiscountAmount', couponData.maxDiscountAmount);
      }
      fData.append('couponType', couponData.couponType);
      fData.append('assignees', JSON.stringify(couponData.assignees || []));
      fData.append('status', newStatus);
      fData.append('isActive', couponData.isActive ? 'true' : 'false');
      if (couponData.image) fData.append('image', couponData.image);
      if (couponData.imageMobile) fData.append('imageMobile', couponData.imageMobile);

      const response = await callApi(API_URL.EDIT_COUPON(id), "POST", fData, token);

      if (response?.errorCode === STATUS_CODE.OK) {
        showSuccess(response?.message || 'Coupon status changed successfully');
        getCoupenList();
      } else {
        showError(response?.message || 'Failed to change coupon status');
      }
    } catch (error) {
      console.log('Error get From Coupon stutas changed :', error);
    }
  };

  const handleResetSearch = () => {
    setSearchText("");
    setGlobalFilter("");
    setShowInput(false);
  };

  return (
    <>
      {open && (
        <CouponModal mode="edit" open={open} setOpen={setOpen} data={editData} onSuccess={getCoupenList} />
      )}
      <div
        className="flex px-4 py-3 h-14 items-center justify-between"
        title="table-header"
      >
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
          {searchText && showInput && (
            <X
              onClick={handleResetSearch}
              className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700 mr-1"
            />
          )}
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

      <div className="couponTable overflow-auto" title="mainTable">
        <table key={isRefresh}>
          <thead>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <tr key={index}>
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={idx}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
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

          {loading ? (
            <TableSkeleton row={5} cell={columns.length} />
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row, index) => (
              <tbody key={index}>
                <tr data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              </tbody>
            ))
          ) : (
            <NoDataFound headerLength={columns.length} />
          )}
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
