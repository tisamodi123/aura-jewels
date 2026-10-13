"use client";
import OrdersTable from "./_components/OrdersTable";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import ChangeOrderStatusModal from "./_components/SuccessPopUp";
import { STATUS_CODE, FAILED_ORDER_STATUS_CAPTIONS } from "@/lib/Constant";
import { M } from "@/lib/messages";

function Orders() {
  const [orderListData, setOrderListData] = useState([]);
  const [orderCaptionData, setOrderCaptionData] = useState(FAILED_ORDER_STATUS_CAPTIONS);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const token = getToken();

  const GetOrderList = (selectedStatusId, pagination, searchKey) => {
    setLoading(true);
    const stringSelectedStatusId = selectedStatusId
      ?.map((id) => id.toString())
      .join(",");

    const formData = new FormData();
    formData.append("orderStatusId", stringSelectedStatusId?.length > 0 ? stringSelectedStatusId : orderCaptionData?.map(item => item?.status_id).join(",") || "");
    formData.append("search", searchKey || "");
    formData.append("page", pagination.pageIndex + 1 || 1);
    formData.append("limit", pagination.pageSize || 10);

    callApi(`${API_URL.GET_ORDER_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setOrderListData(result?.data);
          setTotalRows(result?.totalOrder || 0);
        }
      })
      .catch((err) => {
        toast.error(M.order.listFetchFailed);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Initial fetch
  }, []);

  return (
    <>
      <div className="p-2 mb-3 flex items-center justify-between">
        <div className="font-semibold text-xl">Failed Orders</div>
      </div>
      {/* <ChangeOrderStatusModal /> */}
      <OrdersTable
        orderCaptionData={orderCaptionData}
        GetOrderList={GetOrderList}
        tableData={orderListData}
        totalRows={totalRows}
        loading={loading}
      />
    </>
  );
}

export default Orders;
