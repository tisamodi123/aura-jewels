"use client";

import { Button } from "@/components/ui/button";
import OrdersTable from "./_components/OrdersTable";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, ORDER_STATUS_CAPTIONS } from "@/lib/Constant";
import { M } from "@/lib/messages";

function Orders() {
  const [orderListData, setOrderListData] = useState([]);
  const [orderCaptionData, setOrderCaptionData] = useState(ORDER_STATUS_CAPTIONS);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const token = getToken();
  let filteredOrderCaptionList = [];

  const GetOrderList = (selectedStatusId, pagination, searchKey) => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    const stringSelectedStatusId = selectedStatusId
      ?.map((id) => id.toString())
      .join(",");
    const OrderCaptionList = orderCaptionData?.map((item) => ({
      ...item,
      parentid: JSON.parse(item.parentid),
    }));
    const EXCLUDED_STATUSES = ["Payment Pending", "Failed Payment"];
    const allFilter = OrderCaptionList.filter(
      (status) => !EXCLUDED_STATUSES.includes(status.adminstatuscaption)
    );
    console.log('stringSelectedStatusId', stringSelectedStatusId)
    console.log('filteredOrderCaptionList', orderCaptionData)

    // -----FormData-----
    const formData = new FormData();
    formData.append("orderStatusId", stringSelectedStatusId?.length > 0 ? stringSelectedStatusId : allFilter?.map(item => item?.status_id) || "");
    formData.append("search", searchKey || "");
    formData.append("page", pagination.pageIndex + 1 || 1);
    formData.append("limit", pagination.pageSize || 10);
    // -------------------
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
        <div className="font-semibold text-xl">Orders</div>
      </div>
      <OrdersTable
        filteredOrderCaptionList={filteredOrderCaptionList}
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
