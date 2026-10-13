'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Download } from 'lucide-react';
import Image from 'next/image';
import OrderDetails, { getPaymentStatusBadge } from './_components/OrderDetails';
import { getMyOrders, getOrderById, deleteOrder } from '@/services/orderService';
import { successMsg, errorMsg } from '@/lib/toast';
import { getImageUrl } from '@/lib/utils';
import { formatPrice } from '@/lib/priceUtils';
import { CUSTOMER_INDIVIDUAL_ORDER_STATUSES } from '@/lib/constants';
import { getToken } from '@/services/clientCookies';
import callApi, { getCart } from '@/lib/commonApi';
import CancelConfirmationModal from '@/components/common/CancelConfirmationModal';

const OrdersContent = () => {
    const searchParams = useSearchParams();
    const targetOrderId = searchParams.get('id') || searchParams.get('orderId');

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orders, setOrders] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isMounted, setIsMounted] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchOrders = async (filterVal?: string) => {
        try {
            setLoading(true);
            const activeFilter = filterVal !== undefined ? filterVal : statusFilter;
            const res = await getMyOrders(activeFilter);
            const list = res?.data || res?.orders || [];
            if (res && list) {
                setOrders(list);

                if (targetOrderId) {
                    const matched = list.find((o: any) =>
                        String(o._id).toLowerCase() === String(targetOrderId).toLowerCase() ||
                        String(o.orderId).toLowerCase() === String(targetOrderId).toLowerCase()
                    );
                    if (matched) {
                        setSelectedOrder(matched);
                    } else {
                        // Fallback: fetch single order by ID
                        const singleRes = await getOrderById(targetOrderId);
                        const singleOrder = singleRes?.data?.order || singleRes?.data || singleRes?.order;
                        if (singleOrder) {
                            setSelectedOrder(singleOrder);
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error("Fetch orders error:", error);
            errorMsg("Failed to load your orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(statusFilter);
    }, [statusFilter, targetOrderId]);

    const handleDeleteClick = (order: any) => {
        setOrderToDelete(order);
        setDeleteModalOpen(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete?._id || deleting) return;
        setDeleting(true);
        try {
            const token = getToken();
            const res: any = await deleteOrder(orderToDelete._id, token);

            if (res?.errorCode === 200 || res?.status === 200 || res?.status === 201 || res?.success) {
                await getCart();
                successMsg(res?.message || 'Order deleted successfully');
                setDeleteModalOpen(false);
                setOrderToDelete(null);
                fetchOrders();
            } else {
                errorMsg(res?.message || 'Failed to delete order');
            }
        } catch (e: any) {
            errorMsg(e?.message || 'Something went wrong while deleting order.');
        } finally {
            setDeleting(false);
        }
    };

    const filteredOrders = orders;

    if (loading) {
        return (
            <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px] flex items-center justify-center font-jakarta text-sm text-gray-500">
                Loading your orders...
            </div>
        );
    }

    if (selectedOrder) {
        return (
            <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-10 min-h-[600px]">
                <OrderDetails
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                    onRefresh={fetchOrders}
                />
            </div>
        );
    }

    if (orders.length === 0 && statusFilter === 'All') {
        return (
            <div className="bg-white shadow-sm border border-gray-100 animate-fadeIn">
                <div className="bg-[#F5EBE4] px-6 py-3">
                    <h3 className="text-xl serif text-gray-800 tracking-wider uppercase">My Orders</h3>
                </div>
                <div className="h-[1px] bg-gray-100 w-full"></div>
                <div className="p-6 md:p-10 min-h-[400px] flex flex-col items-center justify-center font-jakarta text-center">
                    <p className="text-gray-500">You have not placed any orders yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm border border-gray-100 animate-fadeIn">
            {/* Header Section */}
            <div className="bg-[#F5EBE4] px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl serif text-gray-800 tracking-wider uppercase">My Orders</h3>
                <div className="flex items-center gap-2 font-jakarta text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Filter By:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 px-3 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#B57A5A] text-gray-700 font-bold uppercase tracking-widest cursor-pointer text-[10px]"
                    >
                        {CUSTOMER_INDIVIDUAL_ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-gray-100 w-full"></div>

            {/* Content Section */}
            <div className="p-6 md:p-10 min-h-[400px]">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center font-jakarta text-center min-h-[200px]">
                        <p className="text-gray-500">No orders match the selected filter.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order: any) => {
                            const displayOrderId = order?.orderId ? `#${order.orderId}` : `#ARN-${order?._id?.substring(18).toUpperCase()}`;
                            const itemsCount = order?.items?.length || 0;
                            const firstItemTitle = order?.items?.[0]?.productDetails?.productTitle || 'Product';
                            const orderTitle = itemsCount > 1
                                ? `ORDER FOR ${firstItemTitle.toUpperCase()} & ${itemsCount - 1} MORE ITEM(S)`
                                : `ORDER FOR ${firstItemTitle.toUpperCase()}`;
                            const formattedDate = order?.createdAt
                                ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : 'Date TBD';
                            const firstImageRaw = order?.items?.[0]?.productDetails?.images?.[0];
                            const firstImage = typeof firstImageRaw === 'object'
                                ? (firstImageRaw?.MediaLocation || firstImageRaw?.url || '')
                                : (firstImageRaw || '');
                            const payStatus = order?.paymentStatus;
                            const invoiceUrl = order?.invoiceUrl || '';
                            const canDeleteOrder = ['pending', 'failed'].includes(String(order?.paymentStatus || '').toLowerCase()) && ['Pending', 'Failed'].includes(order.status);

                            return (
                                <div key={order?._id} className="border border-gray-100 p-6 md:p-8 hover:shadow-md transition-shadow duration-300">
                                    <div className="flex justify-between items-start mb-2 gap-3">
                                        <span className="text-[#FFBABA] text-[10px] font-bold tracking-widest uppercase">
                                            {displayOrderId}
                                        </span>
                                        <div className="flex items-center gap-2 flex-wrap justify-end">
                                            <span
                                                title="Payment Status"
                                                className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded uppercase ${getPaymentStatusBadge(payStatus).className}`}
                                            >
                                                Payment: {getPaymentStatusBadge(payStatus).label}
                                            </span>
                                            <span
                                                title="Order Status"
                                                className="bg-[#EEEEEE] text-gray-500 text-[10px] font-bold tracking-widest px-3 py-1 rounded uppercase"
                                            >
                                                Order: {order?.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        {firstImage && (
                                            <div className="w-16 h-16 flex-shrink-0 bg-[#F9F9F9] border border-gray-100 rounded-sm relative">
                                                <Image
                                                    src={getImageUrl(firstImage)}
                                                    alt={firstItemTitle}
                                                    fill
                                                    sizes="64px"
                                                    className="object-contain mix-blend-multiply"
                                                />
                                            </div>
                                        )}
                                        <h4 className="text-xl md:text-2xl serif text-gray-800 tracking-wide uppercase">
                                            {orderTitle}
                                        </h4>
                                    </div>

                                    <div className="h-[1px] bg-gray-50 w-full mb-6"></div>

                                    <div className="flex justify-between items-center gap-3 flex-wrap">
                                        <div>
                                            <p className="text-sm text-gray-400 font-jakarta">
                                                Submitted on {formattedDate}
                                            </p>
                                            <p className="text-sm font-bold text-gray-900 font-jakarta mt-1">
                                                {formatPrice(order.total || 0)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {canDeleteOrder && (
                                                <button
                                                    onClick={() => handleDeleteClick(order)}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded uppercase transition-colors font-jakarta"
                                                >
                                                    Delete Order
                                                </button>
                                            )}
                                            {invoiceUrl && (
                                                <a
                                                    href={invoiceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="flex items-center gap-1.5 text-[11px] font-bold text-[#B57A5A] border border-[#B57A5A] hover:bg-[#B57A5A] hover:text-white px-3 py-1.5 rounded transition-colors uppercase tracking-wider font-jakarta"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> INVOICE
                                                </a>
                                            )}
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="flex items-center gap-2 text-[11px] font-black tracking-widest text-gray-900 hover:text-[#B57A5A] transition-colors uppercase font-jakarta whitespace-nowrap"
                                            >
                                                VIEW DETAILS <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Confirmation Modal for Delete Order */}
            <CancelConfirmationModal
                isOpen={deleteModalOpen}
                isMounted={isMounted}
                isSubmitting={deleting}
                title="Delete Order"
                description="Are you sure you want to delete this order?"
                confirmText="Delete Order"
                submittingText="Deleting..."
                cancelText="Cancel"
                onClose={() => {
                    if (!deleting) {
                        setDeleteModalOpen(false);
                        setOrderToDelete(null);
                    }
                }}
                onConfirm={confirmDeleteOrder}
            />
        </div>
    );
};

const OrdersPage = () => {
    return (
        <Suspense fallback={
            <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px] flex items-center justify-center font-jakarta text-sm text-gray-500">
                Loading your orders...
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
};

export default OrdersPage;
