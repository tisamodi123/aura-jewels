"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TagTable from "./_components/TagTable";
import TagModal from "./_components/TagModal";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { useDebounce } from "use-debounce";

export default function TagMasterPage() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);

  const token = getToken();

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await callApi(
        API_URL.TAG_LIST,
        "POST",
        {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: debouncedSearch,
        },
        token,
      );

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
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, token]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleShowModal = (row = null) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setShowModal(false);
  };

  const onUpdateStatus = async (id) => {
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
          const response = await callApi(
            `${API_URL.UPDATE_TAG_STATUS}/${id}`,
            "PATCH",
            null,
            token,
          );
          if (response?.errorCode === STATUS_CODE.OK) {
            toast.success(M.tag.statusUpdated);
            fetchTags();
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
      title: "Delete Tag",
      text: "Are You Sure Want To Delete Tag?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await callApi(
            `${API_URL.DELETE_TAG}/${id}`,
            "DELETE",
            null,
            token,
          );
          if (response?.errorCode === STATUS_CODE.OK) {
            toast.success(M.tag.deleted);
            fetchTags();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button
          onClick={() => handleShowModal()}
          className="flex items-center gap-2 bg-black text-white"
        >
          <Plus size={18} /> Add Tag
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TagTable
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
        <TagModal
          isOpen={showModal}
          onClose={handleCloseModal}
          rowData={selectedRow}
          refreshData={fetchTags}
        />
      )}
    </div>
  );
}
