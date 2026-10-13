"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { STATUS_CODE } from "@/lib/Constant";
import { getToken } from "@/lib/auth";
import CommonProductTable from "./CommonProductTable";
import TablePagination from "@/components/TablePagination";

const OfferedProductsTable = ({ offerId, selectedProducts = [], onChange }) => {
    const token = getToken();
    const [productsList, setProductsList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination States
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalProducts, setTotalProducts] = useState(0);

    // Fetch products list on mount or filter/pagination change
    useEffect(() => {
        fetchOfferedProducts();
    }, [offerId, token, pagination.pageIndex, pagination.pageSize]);

    // Reset pagination to first page when offerId changes
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [offerId]);

    // Fetch products list
    const fetchOfferedProducts = async () => {
        if (!offerId) {
            setProductsList([]);
            setTotalProducts(0);
            return;
        }
        setLoading(true);
        try {
            // Append page and limit parameters
            const url = `${API_URL.GET_OFFER_APPLIED_PRODUCTS(offerId)}?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`;
            const res = await callApi(url, "GET", null, token);
            if (res?.errorCode === STATUS_CODE.OK) {
                const rawData = res.data || [];
                const products = Array.isArray(rawData) ? rawData : (rawData.products || []);
                const total = res.pagination?.total || res.totalCount || rawData.totalCount;

                if (total !== undefined) {
                    // Backend paginated response
                    setProductsList(products);
                    setTotalProducts(total);
                } else {
                    // Non-paginated response fallback: slice array locally
                    setTotalProducts(products.length);
                    const startIndex = pagination.pageIndex * pagination.pageSize;
                    const slicedProducts = products.slice(startIndex, startIndex + pagination.pageSize);
                    setProductsList(slicedProducts);
                }
            } else {
                setProductsList([]);
                setTotalProducts(0);
            }
        } catch (error) {
            console.log("Error fetching offered products:", error);
            setProductsList([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    };

    // Selection helpers
    const toggleProductSelection = (productId) => {
        const current = [...selectedProducts];
        let nextSelected;
        if (current.includes(productId)) {
            nextSelected = current.filter(id => id !== productId);
        } else {
            nextSelected = [...current, productId];
        }
        if (onChange) {
            onChange(nextSelected);
        }
    };

    // Handle select all on page
    const handleSelectAllOnPage = (checked) => {
        const currentPageIds = productsList.map(p => p._id);
        const currentSelected = [...selectedProducts];
        let nextSelected;

        if (checked) {
            nextSelected = [...currentSelected];
            currentPageIds.forEach(id => {
                if (!nextSelected.includes(id)) {
                    nextSelected.push(id);
                }
            });
        } else {
            nextSelected = currentSelected.filter(id => !currentPageIds.includes(id));
        }

        if (onChange) {
            onChange(nextSelected);
        }
    };

    // Check if all products on the current page are selected
    const isAllSelectedOnPage = () => {
        if (productsList.length === 0) return false;
        return productsList?.every(p => selectedProducts.includes(p._id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border border-[#E4E8EE] rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Offered Products ({totalProducts})
                    </span>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                            <Loader2 size={32} className="animate-spin text-zinc-400 mb-2" />
                            <p className="text-xs font-medium">Fetching offered products list...</p>
                        </div>
                    ) : !offerId ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                            <ImageIcon size={32} className="stroke-[1.5] text-zinc-300 mb-2" />
                            <p className="text-xs font-medium">New Offer - No products fetched from backend yet</p>
                            <p className="text-[10px] text-zinc-400">Save the offer or select products in the "Product Selection" tab first.</p>
                        </div>
                    ) : productsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                            <ImageIcon size={32} className="stroke-[1.5] text-zinc-300 mb-2" />
                            <p className="text-xs font-medium">No products applied to this offer</p>
                            <p className="text-[10px] text-zinc-400">Select products in the "Product Selection" tab to link them.</p>
                        </div>
                    ) : (
                        <CommonProductTable
                            products={productsList}
                            selectedProducts={selectedProducts}
                            onToggleSelect={toggleProductSelection}
                            onSelectAll={handleSelectAllOnPage}
                            isAllSelected={isAllSelectedOnPage()}
                            loading={loading}
                        />
                    )}
                </div>
                {productsList.length > 0 && (
                    <TablePagination
                        pagination={pagination}
                        setPagination={setPagination}
                        totalRows={totalProducts}
                    />
                )}
            </div>
        </div>
    );
};

export default OfferedProductsTable;