import React from "react";
import OrderDetailsPage from "../../_components/orderDetail";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { cookies } from "next/headers";
import { STATUS_CODE } from "@/lib/Constant";

const fetchOrderDetails = async (id, token) => {
  try {
    const data = await callApi(`${API_URL.GET_ORDER_DETAIL}/${id}`, "GET", null, token);

    if (data.errorCode === STATUS_CODE.OK) {
      return data?.data;
    }
  } catch (err) {
    console.error("Failed order detail fetch error:", err);
  }
};

export default async function page({ params }) {
  const paramValue = await params;
  const { slug } = paramValue;
  const token = await cookies();
  const f_token = token.get("aura-admin-token")?.value;

  const detailData = await fetchOrderDetails(slug, f_token);
  return (
    <div>
      <OrderDetailsPage detailData={detailData} />
    </div>
  );
}
