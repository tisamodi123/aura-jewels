"use client";

import React, { useState, useEffect } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { useDebounce } from "use-debounce";
import SyncPriceModal from "@/components/SyncPriceModal";

// Components
import CreateOfferForm from "./_components/CreateOfferForm";
import OffersTable from "./_components/OffersTable";

// Utils & Libs
import { confirmDelete, confirmStatusChange } from "@/lib/swal";
import { showSuccess, showError } from "@/lib/toast";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";

// Constants
import { API_URL } from "@/lib/APIUrl";
import { STATUS_CODE } from "@/lib/Constant";

const OffersPage = () => {
    const token = getToken();

    // View State
    const [view, setView] = useState("list"); // "list" | "create" | "edit"
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [openSyncModal, setOpenSyncModal] = useState(false);

    // List View States
    const [offersList, setOffersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch] = useDebounce(searchText, 500);

    // Pagination
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalRows, setTotalRows] = useState(0);

    // Fetch Offers List
    const fetchOffers = async () => {
        setLoading(true);
        try {
            const payload = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                search: debouncedSearch,
            };
            const res = await callApi(API_URL.GET_OFFER_LIST, "POST", payload, token);
            if (res?.errorCode === STATUS_CODE.OK) {
                setOffersList(res?.data || []);
                setTotalRows(res?.pagination?.total || res?.totalCount || 0);
            } else {
                setOffersList([]);
                setTotalRows(0);
            }
        } catch (err) {
            console.log("Error fetching offers:", err);
            setOffersList([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === "list") {
            fetchOffers();
        }
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, token]);

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch]);

    // Handlers
    const handleEditClick = (offer) => {
        setSelectedOffer(offer);
        setView("edit");
    };

    const handleDeleteClick = async (offerId) => {
        const result = await confirmDelete(
            "Delete Offer",
            "Are you sure you want to delete this offer? This action cannot be undone."
        );

        if (result.isConfirmed) {
            try {
                const res = await callApi(`${API_URL.DELETE_OFFER}/${offerId}`, "GET", null, token);
                if (res?.errorCode === STATUS_CODE.OK) {
                    showSuccess(res?.message || "Offer deleted successfully");
                    fetchOffers();
                } else {
                    showError(res?.message || "Failed to delete the offer");
                }
            } catch (err) {
                console.error("Delete offer error:", err);
            }
        }
    };

    const handleStatusToggle = async (offerId, newStatus) => {
        if (!newStatus) return;
        const result = await confirmStatusChange(
            "Change Offer Status",
            `Do you want to change the offer status to ${newStatus}?`
        );

        if (result.isConfirmed) {
            try {
                const res = await callApi(`${API_URL.UPDATE_OFFER_STATUS}/${offerId}`, "POST", { status: newStatus }, token);
                if (res?.errorCode === STATUS_CODE.OK) {
                    showSuccess("Offer status updated successfully");
                    fetchOffers();
                } else {
                    showError(res?.message || "Failed to update offer status");
                }
            } catch (err) {
                console.error("Update status error:", err);
            }
        }
    };

    const handleCancel = () => {
        setSelectedOffer(null);
        setView("list");
    };

    const handleSuccess = () => {
        setSelectedOffer(null);
        setView("list");
        fetchOffers();
    };

    const handleCreateClick = () => {
        setView("create");
    };

    return (
        <main className="space-y-6" aria-label="Offer Management Page">
            <header className="flex justify-between items-center bg-white p-4 border border-[#E4E8EE] rounded-lg shadow-sm">
                <div>
                    <h1 id="page-title" className="text-2xl font-bold text-gray-900">Offer Master</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Manage marketing offers, discount campaign definitions, and targeted product tags
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setOpenSyncModal(true)}
                        className="px-5 py-2 bg-[#087B5D] hover:bg-[#06614a] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
                        aria-label="Sync offers"
                        title="Refresh offers only — faster. Re-applies active offers to products. Use after toggling an offer. For metal/stone rate changes, use Sync Prices instead."
                    >
                        <RefreshCcw size={16} aria-hidden="true" /> Sync Offers
                    </button>
                    <button
                        id="btn-create-offer"
                        onClick={handleCreateClick}
                        className="px-5 py-2 bg-black text-white hover:bg-zinc-800 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
                        aria-label="Create new offer"
                    >
                        <Plus size={16} aria-hidden="true" /> Create Offer
                    </button>
                </div>
            </header>

            {/* List Table Card */}
            <section
                aria-labelledby="page-title"
                className="bg-white border border-[#E4E8EE] rounded-lg shadow-sm overflow-hidden"
            >
                <OffersTable
                    tableData={offersList}
                    loading={loading}
                    onUpdateStatus={handleStatusToggle}
                    onDelete={handleDeleteClick}
                    handleEditClick={handleEditClick}
                    pagination={pagination}
                    setPagination={setPagination}
                    totalRows={totalRows}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
            </section>

            <SyncPriceModal
                open={openSyncModal}
                setOpen={setOpenSyncModal}
                onSuccess={fetchOffers}
                apiUrl={API_URL.SYNC_OFFER_APPLIED_PRODUCTS}
                title="Sync Offers"
                description="This action will recalculate and sync all products associated with active offers. Please enter your password to authorize this action."
            />

            {view !== "list" && (
                <CreateOfferForm
                    rowData={view === "edit" ? selectedOffer : null}
                    onCancel={handleCancel}
                    onSuccess={handleSuccess}
                />
            )}
        </main>
    );
};

export default OffersPage;