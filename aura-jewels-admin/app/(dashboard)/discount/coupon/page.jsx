"use client";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import CouponTable from "./_component/CouponTable";
import CouponModal from "./_component/CouponModal";
import Swal from 'sweetalert2';

export default function CouponPage() {
  const token = getToken();
  const [open, setOpen] = useState(false);
  const [createRefresh, setCreateRefresh] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const GetCouponList = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("page", pagination.pageIndex + 1);
      formData.append("limit", pagination.pageSize);

      const res = await callApi(`${API_URL.GET_COUPON_LIST}`, "POST", formData, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        setData(res?.data || []);
        setTotalRows(res?.count > 0 ? res?.count : 0);
      } else {
        toast.error(res?.message || M.common.fetchFailed);
      }
    } catch (error) {
      console.log('Error fetching Coupon list:', error);
      toast.error(M.common.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetCouponList();
  }, [pagination.pageIndex, pagination.pageSize, createRefresh]);

  // Removed handleSyncPrice(): it POSTed to coupon/coupon_sync, a route that
  // does not exist (404). Its only caller — the "Sync Coupon Price" link —
  // sits inside a commented-out JSX block. Product price syncing lives in
  // <SyncPriceModal> (products/syncPrice), which requires a password.

  return (
    <>
      <div>
        {/* Coupon Hedar */}
        <div className=" p-2 mb-3 flex items-center justify-between">
          <div className="font-semibold text-xl">Coupon</div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => setOpen(true)}
              className="hand h-[36px] px-5  font-normal bg-black text-[0.80rem] text-white"
            >
              Create Coupon
            </Button>
          </div>
        </div>

        {/* <div className="w-full border py-2 px-3 bg-[#fff] text-gray-600">
          <p>After Successfully Import Data You need to Sync Price for calculate Price
            <span onClick={handleSyncPrice} className="text-blue-600 hover:underline cursor-pointer"> Sync Coupon Price</span>
          </p>
        </div> */}

        {/* Coupon Table */}
        <div className="pt-2">
          <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
            {" "}
            <CouponTable
              tableData={data}
              pagination={pagination}
              setPagination={setPagination}
              totalRows={totalRows}
              getCoupenList={GetCouponList}
              loading={loading}
            />
          </div>
        </div>
      </div>
      <CouponModal mode="create" open={open} setOpen={setOpen} onSuccess={() => setCreateRefresh(prev => prev + 1)} />
    </>
  );
}
