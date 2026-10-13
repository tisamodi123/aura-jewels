"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, INQUIRY_STATUS } from "@/lib/Constant";
import { showError } from "@/lib/toast";
import { useDebounce } from "use-debounce";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderInquiryTable from "./OrderInquiryTable";
import OrderInquiryDrawer from "./OrderInquiryDrawer";

const OrderInquiry = () => {
    const token = getToken();
    const [inquiryList, setInquiryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [searchText, setSearchText] = useState("");
    const [debouncedSearch] = useDebounce(searchText, 500);
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);

    // Fetch inquiries
    const GetOrderInquiryList = async () => {
        try {
            setLoading(true);

            const payload = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            };

            if (debouncedSearch) {
                payload.search = debouncedSearch;
            }

            if (statusFilter) {
                payload.status = statusFilter;
            }

            const result = await callApi(
                API_URL.GET_ORDER_INQUIRY_LIST,
                "POST",
                payload,
                token
            );

            if (result?.errorCode === STATUS_CODE.OK || result?.data) {
                setInquiryList(result?.data || []);

                const count =
                    result?.pagination?.total ||
                    result?.totalCount ||
                    result?.total ||
                    0;

                setTotalRows(count);
            } else {
                showError(result?.message || "Failed to fetch order inquiries.");
            }
        } catch (error) {
            console.log("GetOrderInquiryList Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset pagination index on filter or search changes
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, statusFilter]);

    // Fetch data
    useEffect(() => {
        GetOrderInquiryList();
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter]);

    return (
        <div>
            {/* Page Header */}
            <div className="p-2 mb-4 flex items-center justify-between">
                <div className="font-semibold text-xl text-gray-800">Order Inquiries</div>
                <div className="w-[180px]">
                    <Select
                        value={statusFilter || "ALL"}
                        onValueChange={(val) => setStatusFilter(val === "ALL" ? "" : val)}
                    >
                        <SelectTrigger className="w-full bg-white border-[#E4E8EE] text-xs font-semibold text-[#656B7B] h-[36px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#E4E8EE] shadow-lg rounded-md">
                            <SelectGroup>
                                <SelectItem value="ALL" className="text-xs font-semibold cursor-pointer py-1.5 hover:bg-zinc-50">All Statuses</SelectItem>
                                <SelectItem value={INQUIRY_STATUS.NEW} className="text-xs font-semibold cursor-pointer py-1.5 hover:bg-zinc-50">New</SelectItem>
                                <SelectItem value={INQUIRY_STATUS.CONTACTED} className="text-xs font-semibold cursor-pointer py-1.5 hover:bg-zinc-50">Contacted</SelectItem>
                                <SelectItem value={INQUIRY_STATUS.COMPLETED} className="text-xs font-semibold cursor-pointer py-1.5 hover:bg-zinc-50">Completed</SelectItem>
                                <SelectItem value={INQUIRY_STATUS.CANCELLED} className="text-xs font-semibold cursor-pointer py-1.5 hover:bg-zinc-50">Cancelled</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white shadow-md rounded-md overflow-hidden border border-zinc-150">
                <OrderInquiryTable
                    tableData={inquiryList}
                    loading={loading}
                    totalRows={totalRows}
                    pagination={pagination}
                    setPagination={setPagination}
                    refetch={GetOrderInquiryList}
                    onViewDetails={setSelectedInquiryId}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
            </div>

            {/* Details Slide-out Drawer */}
            <OrderInquiryDrawer
                inquiryId={selectedInquiryId}
                onClose={() => setSelectedInquiryId(null)}
                refetchList={GetOrderInquiryList}
            />
        </div>
    );
};

export default OrderInquiry;