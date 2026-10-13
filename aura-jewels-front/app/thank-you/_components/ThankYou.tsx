'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, ChevronUp } from 'lucide-react';
import { getOrderById } from '@/services/orderService';
import OrderDetails from '@/app/my-account/my-order/_components/OrderDetails';

interface ThankYouProps {
    id?: string;
    initialData?: any;
}

const ThankYou: React.FC<ThankYouProps> = ({ id, initialData }) => {
    const router = useRouter();
    const extractOrder = (res: any) => res?.data?.order || res?.data || res?.order || null;

    const [order, setOrder] = useState<any>(extractOrder(initialData));
    const [loading, setLoading] = useState<boolean>(!extractOrder(initialData));
    const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);

    useEffect(() => {
        if (initialData) {
            setOrder(extractOrder(initialData));
            setLoading(false);
        } else if (id && !order) {
            getOrderById(id).then((res) => {
                const fetched = extractOrder(res);
                if (fetched) setOrder(fetched);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [initialData, id]);

    const shipping = order?.shippingAddress || {};
    const customerName = shipping?.firstName
        ? `${shipping.firstName} ${shipping.lastName || ''}`.trim()
        : 'Customer';

    const displayOrderId = order?.orderId ? `#${order.orderId}` : (order?._id ? `#ARN-${order._id.substring(18).toUpperCase()}` : (id ? `#${id}` : ''));
    const receiptPdfUrl = order?.receiptUrl || order?.detailReceiptUrl || order?.invoiceUrl || '';

    // Handle Button Clicks
    const handleViewReceipt = () => {
        if (receiptPdfUrl) {
            window.open(receiptPdfUrl, '_blank');
        }
    };

    const handleGetOrderDetails = () => {
        const targetId = order?.orderId || order?._id || id;
        if (targetId) {
            router.push(`/my-account/my-order?id=${targetId}`);
        } else {
            router.push('/my-account/my-order');
        }
    };

    const handleContinueShopping = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="bg-[#FAF9F6] min-h-screen py-12 md:py-20 px-4 font-jakarta flex items-center justify-center">
                <div className="bg-white border border-gray-200/80 shadow-sm rounded-sm p-12 text-center max-w-md w-full">
                    <div className="inline-block w-8 h-8 border-2 border-[#013D3D] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 text-sm font-medium">Loading order details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-12 md:py-20 px-4 font-jakarta animate-fadeIn">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Main Thank You Card (Exact match to screenshot with Aura Jewels branding) */}
                <div className="bg-white border border-gray-200/80 shadow-sm rounded-sm p-8 sm:p-12 text-center relative overflow-hidden">

                    {/* Header Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#E25D5D] tracking-[0.15em] uppercase font-semibold mb-6">
                        THANK YOU!
                    </h1>

                    {/* Customer Greeting */}
                    <p className="text-gray-900 font-bold text-base sm:text-lg mb-4 leading-snug">
                        Dear {customerName}, your order has been confirmed.
                    </p>

                    {/* Subtitle / Email Notice */}
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto mb-8 font-normal">
                        We're pleased to confirm that your order has been successfully received. A confirmation email with your order details has been sent to your registered email address. You can view and track your order at any time from your account.
                    </p>

                    {/* Decorative Divider with Star Accent */}
                    <div className="flex items-center justify-center my-6 gap-3">
                        <div className="h-[1px] bg-gray-200 w-24 sm:w-36"></div>
                        <span className="text-[#E25D5D] text-xs select-none">✦</span>
                        <div className="h-[1px] bg-gray-200 w-24 sm:w-36"></div>
                    </div>

                    {/* Aura Jewels Brand Content */}
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 font-medium">
                        Thank you for choosing
                    </p>
                    <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-bold tracking-wide mb-4">
                        Aura Jewels
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto mb-10 font-normal">
                        We appreciate your confidence in Aura Jewels and look forward to being part of your special moments.
                    </p>

                    {/* 3 Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center justify-center gap-3 sm:gap-4 font-jakarta max-w-2xl mx-auto">
                        {/* Button 1: VIEW RECEIPT */}
                        <button
                            onClick={handleViewReceipt}
                            className="bg-[#013D3D] hover:bg-[#022A2A] text-white text-[11px] sm:text-xs font-bold tracking-[0.12em] px-4 py-3.5 uppercase transition-all duration-300 rounded-none shadow-sm flex items-center justify-center gap-2 w-full text-center"
                        >
                            <FileText className="w-4 h-4 flex-shrink-0" /> <span>VIEW RECEIPT</span>
                        </button>

                        {/* Button 2: GET ORDER DETAILS */}
                        <button
                            onClick={handleGetOrderDetails}
                            className="bg-[#013D3D] hover:bg-[#022A2A] text-white text-[11px] sm:text-xs font-bold tracking-[0.12em] px-4 py-3.5 uppercase transition-all duration-300 rounded-none shadow-sm flex items-center justify-center gap-2 w-full text-center"
                        >
                            <span>GET ORDER DETAILS</span> <ArrowRight className="w-4 h-4 flex-shrink-0" />
                        </button>

                        {/* Button 3: CONTINUE SHOPPING */}
                        <button
                            onClick={handleContinueShopping}
                            className="bg-[#013D3D] hover:bg-[#022A2A] text-white text-[11px] sm:text-xs font-bold tracking-[0.12em] px-4 py-3.5 uppercase transition-all duration-300 rounded-none shadow-sm flex items-center justify-center gap-2 w-full text-center"
                        >
                            <span>CONTINUE SHOPPING</span>
                        </button>
                    </div>

                    {/* Order Reference Number Tag */}
                    {displayOrderId && (
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                            <span>Order Reference:</span>
                            <span className="font-bold text-gray-800 tracking-wider">{displayOrderId}</span>
                        </div>
                    )}
                </div>

                {/* Inline Full Order Details Section (Toggled by "GET ORDER DETAILS") */}
                {showOrderDetails && (
                    <div id="thankyou-order-details-section" className="bg-white border border-gray-200 shadow-sm p-6 sm:p-10 rounded-sm animate-fadeIn">
                        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 uppercase tracking-wider">
                                    Order Summary & Details
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Order ID: {displayOrderId}</p>
                            </div>
                            <button
                                onClick={() => setShowOrderDetails(false)}
                                className="text-gray-400 hover:text-gray-900 p-1 text-xs uppercase font-bold tracking-wider flex items-center gap-1"
                            >
                                Hide Details <ChevronUp className="w-4 h-4" />
                            </button>
                        </div>

                        {order ? (
                            <OrderDetails
                                order={order}
                                onBack={() => setShowOrderDetails(false)}
                                onRefresh={() => { }}
                            />
                        ) : (
                            <div className="text-center py-10 font-jakarta text-sm text-gray-500">
                                Loading full order details...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThankYou;