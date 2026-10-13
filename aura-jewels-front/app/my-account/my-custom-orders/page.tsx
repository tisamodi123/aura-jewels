'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getMyCustomOrders } from '@/services/customOrderService';
import { errorMsg } from '@/lib/toast';
import { CUSTOMER_ORDER_STATUSES } from '@/lib/constants';
import Pagination from '@/components/common/Pagination';
import CustomOrderCard, { CustomOrder } from './_components/CustomOrderCard';

const CustomOrdersPage = () => {
    const [orders, setOrders] = useState<CustomOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const limit = 5;

    const fetchCustomOrders = async () => {
        setLoading(true);
        try {
            const payload: any = {
                page: currentPage,
                limit: limit
            };
            if (statusFilter !== 'All') {
                payload.status = statusFilter;
            }

            const res = await getMyCustomOrders(payload);

            console.log("getOrder res", res)

            if (res?.errorCode === 200) {
                let orderList: CustomOrder[] = [];
                if (Array.isArray(res.data)) {
                    orderList = res.data;
                }

                setOrders(orderList);

                const total = res.pagination?.total || res.total || res.totalCount || res.data?.total || res.data?.totalCount || orderList.length;
                const pages = res.pagination?.totalPages || res.totalPages || res.pages || res.data?.totalPages || res.data?.pages || Math.ceil(total / limit) || 1;

                setTotalPages(pages);
            }
        } catch (error: any) {
            console.log("Fetch custom orders error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomOrders();
    }, [currentPage, statusFilter]);

    // Handle filter reset or change
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const toggleExpand = (id: string) => {
        setExpandedOrder(prev => prev === id ? null : id);
    };

    if (loading && orders.length === 0) {
        return (
            <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px] flex flex-col items-center justify-center font-jakarta text-sm text-gray-500 gap-3">
                <div className="w-8 h-8 border-2 border-[#B57A5A] border-t-transparent rounded-full animate-spin"></div>
                Loading your custom orders...
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm border border-gray-100 animate-fadeIn">
            {/* Header Section */}
            <div className="bg-[#F5EBE4] px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl serif text-gray-800 tracking-wider uppercase flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#B57A5A]" /> My Custom Orders
                </h3>
                <div className="flex items-center gap-2 font-jakarta text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={handleFilterChange}
                        className="bg-white border border-gray-200 px-3 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#B57A5A] text-gray-700 font-bold uppercase tracking-widest cursor-pointer text-[10px]"
                    >
                        {CUSTOMER_ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status === 'All' ? 'All Custom Orders' : status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-gray-100 w-full"></div>

            {/* Content Section */}
            <div className="p-6 md:p-10 min-h-[400px]">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center font-jakarta text-center min-h-[300px]">
                        <p className="text-gray-500 mb-6 text-sm">
                            {statusFilter === 'All'
                                ? "You have not requested any bespoke or custom orders yet."
                                : `No custom orders match the "${statusFilter}" status filter.`
                            }
                        </p>
                        <Link
                            href="/custom-jewellery"
                            className="bg-[#B57A5A] hover:bg-[#9C684B] text-white px-6 py-3 text-xs uppercase tracking-widest font-bold transition-colors duration-300 rounded-sm shadow-sm"
                        >
                            Design Bespoke Jewellery
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const isExpanded = expandedOrder === order._id;

                            return (
                                <CustomOrderCard
                                    key={order._id}
                                    order={order}
                                    isExpanded={isExpanded}
                                    onToggleExpand={() => toggleExpand(order._id)}
                                    onRefresh={fetchCustomOrders}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomOrdersPage;