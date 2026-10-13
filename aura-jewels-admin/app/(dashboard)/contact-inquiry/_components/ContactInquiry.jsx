"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, INQUIRY_STATUS, CONTACT_SUBJECT } from "@/lib/Constant";
import { showError } from "@/lib/toast";
import { useDebounce } from "use-debounce";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ContactInquiryTable from "./ContactInquiryTable";
import ContactInquiryDrawer from "./ContactInquiryDrawer";

const selectItemClass = "text-xs font-semibold cursor-pointer py-1.5 hover:bg-zinc-50";
const triggerClass =
    "w-full bg-white border-[#E4E8EE] text-xs font-semibold text-[#656B7B] h-[36px]";
const contentClass = "bg-white border border-[#E4E8EE] shadow-lg rounded-md";

const prettyStatus = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const ContactInquiry = () => {
    const token = getToken();
    const [inquiryList, setInquiryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const [searchText, setSearchText] = useState("");
    const [debouncedSearch] = useDebounce(searchText, 500);
    const [statusFilter, setStatusFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);

    const GetContactInquiryList = async () => {
        try {
            setLoading(true);

            const payload = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            };
            if (debouncedSearch) payload.search = debouncedSearch;
            if (statusFilter) payload.status = statusFilter;
            if (subjectFilter) payload.subject = subjectFilter;

            const result = await callApi(API_URL.GET_CONTACT_INQUIRY_LIST, "POST", payload, token);

            if (result?.errorCode === STATUS_CODE.OK) {
                setInquiryList(result?.data || []);
                setTotalRows(result?.total || 0);
            } else {
                showError(result?.message || "Failed to fetch contact inquiries.");
            }
        } catch (error) {
            console.log("GetContactInquiryList Error:", error);
            showError("An error occurred while fetching contact inquiries.");
        } finally {
            setLoading(false);
        }
    };

    // A filter/search change invalidates the current page number.
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, statusFilter, subjectFilter]);

    useEffect(() => {
        GetContactInquiryList();
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter, subjectFilter]);

    return (
        <div>
            {/* Page Header */}
            <div className="p-2 mb-4 flex items-center justify-between gap-3">
                <div className="font-semibold text-xl text-gray-800">Contact Inquiries</div>

                <div className="flex items-center gap-3">
                    <div className="w-[200px]">
                        <Select
                            value={subjectFilter || "ALL"}
                            onValueChange={(val) => setSubjectFilter(val === "ALL" ? "" : val)}
                        >
                            <SelectTrigger className={triggerClass}>
                                <SelectValue placeholder="Filter by Subject" />
                            </SelectTrigger>
                            <SelectContent className={contentClass}>
                                <SelectGroup>
                                    <SelectItem value="ALL" className={selectItemClass}>
                                        All Subjects
                                    </SelectItem>
                                    {CONTACT_SUBJECT.ALL_TYPES.map((subject) => (
                                        <SelectItem key={subject} value={subject} className={selectItemClass}>
                                            {subject}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[180px]">
                        <Select
                            value={statusFilter || "ALL"}
                            onValueChange={(val) => setStatusFilter(val === "ALL" ? "" : val)}
                        >
                            <SelectTrigger className={triggerClass}>
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent className={contentClass}>
                                <SelectGroup>
                                    <SelectItem value="ALL" className={selectItemClass}>
                                        All Statuses
                                    </SelectItem>
                                    {INQUIRY_STATUS.ALL_TYPES.map((status) => (
                                        <SelectItem key={status} value={status} className={selectItemClass}>
                                            {prettyStatus(status)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white shadow-md rounded-md overflow-hidden border border-zinc-150">
                <ContactInquiryTable
                    tableData={inquiryList}
                    loading={loading}
                    totalRows={totalRows}
                    pagination={pagination}
                    setPagination={setPagination}
                    refetch={GetContactInquiryList}
                    onViewDetails={setSelectedInquiryId}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
            </div>

            {/* Details Slide-out Drawer */}
            <ContactInquiryDrawer
                inquiryId={selectedInquiryId}
                onClose={() => setSelectedInquiryId(null)}
                refetchList={GetContactInquiryList}
            />
        </div>
    );
};

export default ContactInquiry;
