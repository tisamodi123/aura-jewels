"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { showError } from "@/lib/toast";
import { useDebounce } from "use-debounce";
import SubscribersTable from "./SubscribersTable";

const Subscribers = () => {
    const token = getToken();
    const [subscribersList, setSubscribersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch] = useDebounce(searchText, 300);

    const GetSubscribersList = async () => {
        try {
            setLoading(true);
            const payload = {};

            const result = await callApi(API_URL.GET_SUBSCRIBER_LIST, "POST", payload, token);

            if (result?.errorCode === STATUS_CODE.OK) {
                setSubscribersList(result?.data || []);
            } else {
                showError(result?.message || "Failed to fetch subscribers list.");
            }
        } catch (error) {
            console.log("GetSubscribersList Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetSubscribersList();
    }, [token]);

    // Client-side search filtering on email
    const filteredSubscribers = subscribersList.filter((sub) => {
        if (!debouncedSearch) return true;
        return sub.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    });

    return (
        <div>
            {/* Page Header */}
            <div className="p-2 mb-4 flex items-center justify-between gap-3">
                <div className="font-semibold text-xl text-gray-800">Newsletter Subscribers</div>
            </div>

            {/* Table Container */}
            <div className="bg-white shadow-md rounded-md overflow-hidden border border-zinc-150">
                <SubscribersTable
                    tableData={filteredSubscribers}
                    loading={loading}
                    refetch={GetSubscribersList}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
            </div>
        </div>
    );
};

export default Subscribers;