"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SizeTable from "./_components/SizeTable";
import SizeModal from "./_components/SizeModal";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function SizeMasterPage() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  const token = getToken();

  // Load size-enabled categories once for the filter dropdown.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await callApi(API_URL.PARENT_CATEGORY_LIST, "GET", null, token);
        if (response?.errorCode === STATUS_CODE.OK) {
          setCategories((response.data || []).filter((cat) => cat.hasSize === true));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, [token]);

  const fetchSizes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await callApi(API_URL.SIZE_LIST, "POST", {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchText,
        category: categoryFilter,
      }, token);

      if (response?.errorCode === STATUS_CODE.OK) {
        setTableData(response.data || []);
        setTotalRows(response.pagination?.total || 0);
      } else {
        toast.error(response?.message || M.common.fetchFailed);
      }
    } catch (error) {
      toast.error(M.common.fetchFailed);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, searchText, categoryFilter, token]);

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  const handleShowModal = (row = null) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setShowModal(false);
  };

  const onUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await callApi(`${API_URL.UPDATE_SIZE_STATUS}/${id}`, "PATCH", {
            status: newStatus,
          }, token);

          if (response?.errorCode === STATUS_CODE.OK) {
            toast.success(M.size.statusUpdated);
            fetchSizes();
          } else {
            toast.error(response?.message || M.common.updateFailed);
          }
        } catch (error) {
          toast.error(M.common.updateFailed);
        }
      }
    });
  };

  const OnDelete = (id) => {
    Swal.fire({
      title: "Delete Size",
      text: "Are You Sure Want To Delete Size?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await callApi(`${API_URL.DELETE_SIZE}/${id}`, "DELETE", null, token);
          if (response?.errorCode === STATUS_CODE.OK) {
            toast.success(M.size.deleted);
            fetchSizes();
          } else {
            toast.error(response?.message || M.common.deleteFailed);
          }
        } catch (error) {
          toast.error(M.common.deleteFailed);
        }
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Size Master</h1>
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className="h-9 min-w-[180px] border border-gray-300 rounded-md px-2 text-sm text-gray-700 bg-white focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          <Button onClick={() => handleShowModal()} className="flex items-center gap-2 bg-black text-white">
            <Plus size={18} /> Add Size
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <SizeTable
          tableData={tableData}
          loading={loading}
          onUpdateStatus={onUpdateStatus}
          OnDelete={OnDelete}
          handleShowModal={handleShowModal}
          pagination={pagination}
          setPagination={setPagination}
          totalRows={totalRows}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </div>

      {showModal && (
        <SizeModal
          isOpen={showModal}
          onClose={handleCloseModal}
          rowData={selectedRow}
          refreshData={fetchSizes}
        />
      )}
    </div>
  );
}
