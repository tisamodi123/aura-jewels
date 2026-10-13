"use client";

//** React import */
import React, { useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";
import { useRouter } from "next/navigation";

//** Third party imports */
import { toast } from "sonner";
import DataTable from "react-data-table-component";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { formatedPrice, isValidData } from "@/lib/utils";
import useTableHeight from "@/hooks/useTableHeightHooks";
import { callApi } from "@/lib/callApi";

//** Custom component imports */
import TableSkeletonLoader from "@/components/tableSkeletonLoader";

const DiamondTable = ({ tableData, pagination, setPagination, totalRows, isLoading, fetchDiamondData, handleSort, onEdit, onDelete, onToggleStatus }) => {
  //** Get token */
  const token = getToken();

  //** Next Hooks */
  const router = useRouter();

  //** Custom hooks */
  const tableHieght = useTableHeight(320);

  //** State */
  const [diamondData, setDiamondData] = useState([...tableData]);
  const [perPage, setPerPage] = useState(10);
  
  // 3-state sorting state
  const [currentSort, setCurrentSort] = useState({ column: null, direction: null });

  useEffect(() => {
    setDiamondData([...tableData]);
  }, [tableData]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, pageIndex: page - 1 }));
  };

  const handlePerRowChange = (newPerPage) => {
    setPagination({ pageIndex: 0, pageSize: newPerPage });
  };

  const onCustomSort = (colName) => {
    let newDirection = 'asc';
    if (currentSort.column === colName) {
      if (currentSort.direction === 'asc') newDirection = 'desc';
      else if (currentSort.direction === 'desc') newDirection = null;
    }
    
    setCurrentSort({
      column: newDirection ? colName : null,
      direction: newDirection
    });

    if (newDirection === null) {
      // Reset to default sort order (which is 'price' 'asc' initially)
      handleSort({ name: "Total Price" }, "asc"); 
    } else {
      handleSort({ name: colName }, newDirection);
    }
  };

  const SortableHeader = ({ name }) => {
    const isSorted = currentSort.column === name;
    const direction = isSorted ? currentSort.direction : null;
    
    return (
      <div 
        className="flex items-center justify-center gap-1 cursor-pointer select-none w-full h-full hover:text-gray-900"
        onClick={() => onCustomSort(name)}
      >
        <span>{name}</span>
        {direction === 'asc' && <ArrowUp size={14} className="text-gray-400" />}
        {direction === 'desc' && <ArrowDown size={14} className="text-gray-400" />}
      </div>
    );
  };

  const columns = [
    {
      name: <SortableHeader name="Lot No" />,
      selector: (row) => row?.stockId || "",
      width: "160px",
      cell: (row) => (
        <div style={{ width: "160px" }}>
          {isValidData(row?.stockId) ? row?.stockId : <span>{"-"}</span>}
        </div>
      ),
    },
    {
      name: <SortableHeader name="Status" />,
      selector: (row) => row?.status || "",
      cell: (row) => {
        const isAvailable = row?.status?.toLowerCase() === "available";
        const newStatus = isAvailable ? "SUSPENDED" : "ACTIVE";
        return (
          <div className="cursor-pointer" onClick={() => onToggleStatus && onToggleStatus(row?._id, newStatus)}>
            {isValidData(row?.status) ? (
              <span
                className={`p-1 rounded-[8px] whitespace-nowrap py-0.5 px-3
                  ${isAvailable
                    ? "bg-green-600 text-white"
                    : row?.status?.toLowerCase() === "sold"
                      ? "bg-red-600 text-white"
                      : row?.status?.toLowerCase() === "memo"
                        ? "bg-orange-600 text-white"
                        : "bg-red-600 text-white"
                  }`}
              >
                {row?.status}
              </span>
            ) : (
              <span>{"-"}</span>
            )}
          </div>
        );
      },
    },
    {
      name: <SortableHeader name="Shape" />,
      selector: (row) => row?.shape || "",
      cell: (row) => (
        <div>{isValidData(row?.shape) ? row?.shape : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Carat" />,
      selector: (row) => row?.carat || 0,
      cell: (row) => (
        <div>{isValidData(row?.carat) ? row?.carat : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Colour" />,
      selector: (row) => row?.color || "",
      cell: (row) => (
        <div>{isValidData(row?.color) ? row?.color : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Clarity" />,
      selector: (row) => row?.clarity || "",
      cell: (row) => (
        <div>
          {isValidData(row?.clarity) ? row?.clarity : <span>{"-"}</span>}
        </div>
      ),
    },
    {
      name: <SortableHeader name="Cut" />,
      selector: (row) => row?.cut || "",
      cell: (row) => (
        <div>{isValidData(row?.cut) ? row?.cut : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Polish" />,
      selector: (row) => row?.polish || "",
      cell: (row) => (
        <div>{isValidData(row?.polish) ? row?.polish : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Symmetry" />,
      selector: (row) => row?.sym || "",
      width: "110px",
      cell: (row) => (
        <div>{isValidData(row?.sym) ? row?.sym : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Fluro" />,
      selector: (row) => row?.flo || "",
      cell: (row) => (
        <div>{isValidData(row?.flo) ? row?.flo : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Lab" />,
      selector: (row) => row?.lab || "",
      cell: (row) => (
        <div>{isValidData(row?.lab) ? row?.lab : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Certificate" />,
      selector: (row) => row?.certno || "",
      width: "150px",
      cell: (row) => (
        <div style={{ width: "150px" }}>
          {isValidData(row?.certno) ? row?.certno : <span>{"-"}</span>}
        </div>
      ),
    },
    {
      name: <SortableHeader name="Size-LWD" />,
      selector: (row) => row?.measurement || "",
      width: "150px",
      cell: (row) => (
        <div style={{ width: "150px" }}>
          {isValidData(row?.measurement) ? (
            row?.measurement
          ) : (
            <span>{"-"}</span>
          )}
        </div>
      ),
    },
    {
      name: <SortableHeader name="Price Per CTS" />,
      selector: (row) => row?.price_per_carat || 0,
      width: "150px",
      cell: (row) => (
        <div style={{ width: "150px" }}>
          {isValidData(row?.price_per_carat) ? (
            formatedPrice(parseFloat(row?.price_per_carat))
          ) : (
            <span>{"-"}</span>
          )}
        </div>
      ),
    },
    {
      name: <SortableHeader name="RAP" />,
      selector: (row) => row?.rapnet || 0,
      cell: (row) => (
        <div>{isValidData(row?.rapnet) ? row?.rapnet : <span>{"-"}</span>}</div>
      ),
    },
    {
      name: <SortableHeader name="Total Price" />,
      selector: (row) => row?.finalamount || 0,
      width: "120px",
      cell: (row) => (
        <div>
          {isValidData(row?.finalamount) ? (
            row?.finalamount?.toFixed(2)
          ) : (
            <span>{"-"}</span>
          )}
        </div>
      ),
    },
    {
      name: <SortableHeader name="Discount" />,
      selector: (row) => row?.discount || 0,
      width: "110px",
      cell: (row) => (
        <div>
          {isValidData(row?.discount) ? (
            parseFloat(row?.discount).toFixed(2)
          ) : (
            <span>{"-"}</span>
          )}
        </div>
      ),
    },

    {
      name: "Image",
      cell: (row) => (
        <div>
          {isValidData(row?.image) ? (
            <Link href={row.image} className="text-blue-500" target="_blank">
              {row?.image}
            </Link>
          ) : (
            <span>{"-"}</span>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      width: "100px",
      cell: (row) => (
        <div className="flex items-center justify-center gap-3">
          <div onClick={() => onEdit && onEdit(row)} className="cursor-pointer text-zinc-600 hover:text-blue-600 transition-colors">
            <Pencil size={16} />
          </div>
          <div onClick={() => onDelete && onDelete(row?._id)} className="cursor-pointer text-zinc-600 hover:text-red-600 transition-colors">
            <Trash2 size={16} />
          </div>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#F6F8FB", // Light grayish blue background
        color: "#67728A", // Text color
        fontWeight: "600", // Bold font
        fontSize: "14px",
        textTransform: "capitalize",
        borderBottom: "none",
        justifyContent: "center", // Center align cell content
        textAlign: "center",
        whiteSpace: "normal",
        wordBreak: "break-word",
      },
    },
    cells: {
      style: {
        justifyContent: "center", // Center align cell content
        textAlign: "center",
      },
    },
  };

  return (
    <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
      <style>{`
        .rdt_TableCol,
        .rdt_TableCol_Name,
        .rdt_TableCol div {
          white-space: normal !important;
          word-break: break-word !important;
          overflow: visible !important;
          text-overflow: unset !important;
          text-align: center !important;
        }
      `}</style>
      <DataTable
        data={diamondData}
        columns={columns}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={pagination.pageSize}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowChange}
        progressPending={isLoading}
        progressComponent={<TableSkeletonLoader rowLength={20} />}
        highlightOnHover
        sortServer
        onSort={handleSort}
        sortIcon={<ArrowDown size={14} className="ml-1 text-gray-400" />}
        customStyles={customStyles}
        noDataComponent={
          <div className="p-5 flex items-center text-center text-gray-500 h-[400px]">
            <p>No records found.</p>
          </div>
        }
      />
    </div>
  );
};

export default DiamondTable;
