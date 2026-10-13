"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { showError } from "@/lib/toast";
import CustomOrderTable from "./CustomOrderTable";

const CustomeOrder = () => {
  const token = getToken();
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // fetch custom order list
  const GetCustomOrderList = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("page", pagination.pageIndex + 1);
      formData.append("limit", pagination.pageSize);

      const result = await callApi(API_URL.GET_CUSTOM_ORDER_LIST, "POST", formData, token);

      if (result?.errorCode === STATUS_CODE.OK) {
        setOrderList(result?.data || []);

        const count =
          result?.pagination?.total ||
          result?.totalCount ||
          result?.total ||
          result?.count ||
          0;

        setTotalRows(count);
      } else {
        showError(result?.message || "Failed to fetch custom orders.");
      }
    } catch (error) {
      console.log("GetCustomOrderList Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch custom order list
  useEffect(() => {
    GetCustomOrderList();
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <div>
      {/* Page Header */}
      <div className="p-2 mb-3 flex items-center justify-between">
        <div className="font-semibold text-xl">Custom Orders</div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-md">
        <CustomOrderTable
          tableData={orderList}
          loading={loading}
          totalRows={totalRows}
          pagination={pagination}
          setPagination={setPagination}
          refetch={GetCustomOrderList}
        />
      </div>
    </div>
  );
};

export default CustomeOrder;