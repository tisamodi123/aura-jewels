'use client';

import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { formatPrice, getOfferDiscountLabel } from '@/lib/priceUtils';
import { cancelOrder, requestReturn, cancelOrderItem, requestReturnItem, retryPayment } from '@/services/orderService';
import { successMsg, errorMsg, warningMsg } from '@/lib/toast';
import { openRazorpayForOrder } from '@/lib/razorpay';
import { getToken } from '@/services/clientCookies';
import CancelConfirmationModal from '@/components/common/CancelConfirmationModal';
import CancelRefundModal, { CancelRefundPayload } from '@/components/common/CancelRefundModal';
import ReturnRequestModal from '@/components/common/ReturnRequestModal';
import { resolveDiamondOrigin } from '@/lib/diamondOrigin';
import { formatShipmentDays } from '@/lib/shipmentDays';
import { amountShowOrderStatus, PAYMENT_STATUS, REFUND_STATUS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import callApi, { getCart } from '@/lib/commonApi';
import { API_BASE_URL, ENDPOINTS } from '@/lib/Api_Url';

export const isDatePassed = (dateStr?: string | null): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return new Date() > d;
};

export const formatDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const dateFormatted = d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const timeFormatted = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    return `${dateFormatted} at ${timeFormatted}`;
};

export const getPaymentStatusBadge = (status?: string) => {
    const s = String(status || '').toLowerCase().trim();
    switch (s) {
        case PAYMENT_STATUS.PAID:
            return { label: 'Paid', className: 'bg-green-100 text-green-700' };
        case PAYMENT_STATUS.FAILED:
            return { label: 'Failed', className: 'bg-red-100 text-red-700' };
        case PAYMENT_STATUS.REFUND_PENDING:
            return { label: 'Refund Pending', className: 'bg-amber-100 text-amber-800' };
        case PAYMENT_STATUS.REFUND_PROCESSING:
            return { label: 'Refund Processing', className: 'bg-blue-100 text-blue-700' };
        case PAYMENT_STATUS.REFUND_SUCCESS:
            return { label: 'Refund Success', className: 'bg-emerald-100 text-emerald-800' };
        case PAYMENT_STATUS.PENDING:
        default:
            return { label: s ? s.toUpperCase() : 'Pending', className: 'bg-amber-100 text-amber-700' };
    }
};

export const getRefundStatusBadge = (status?: string) => {
    const s = String(status || '').trim();
    const sLower = s.toLowerCase();
    switch (sLower) {
        case REFUND_STATUS.PENDING_LOWER:
            return { label: 'Pending', className: 'bg-amber-100 text-amber-800' };
        case REFUND_STATUS.PROCESSING_LOWER:
            return { label: 'Processing', className: 'bg-blue-100 text-blue-700' };
        case REFUND_STATUS.COMPLETED_LOWER:
            return { label: 'Completed', className: 'bg-emerald-100 text-emerald-800' };
        case REFUND_STATUS.FAILED_LOWER:
            return { label: 'Failed', className: 'bg-red-100 text-red-700' };
        case REFUND_STATUS.REJECTED_LOWER:
            return { label: 'Rejected', className: 'bg-rose-100 text-rose-700' };
        default:
            return { label: s, className: 'bg-gray-100 text-gray-700' };
    }
};

interface OrderDetailsProps {
    order: any;
    onBack: () => void;
    onRefresh: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack, onRefresh }) => {
    const router = useRouter();
    const items = order?.items || [];

    // Resolve GST details
    const gstNo = order?.gstNo || order?.shippingAddress?.gstNo || order?.billingAddress?.gstNo || '';
    const companyName = order?.companyName || order?.shippingAddress?.companyName || order?.billingAddress?.companyName || '';
    const isGst = order?.isGst || !!gstNo || !!companyName;
    const calculatedOriginalSubtotal = items.reduce((sum: number, item: any) => {
        const details = item?.productDetails || {};
        const itemQty = Number(item.qty || item.quantity || details?.qty || details?.quantity || 1);
        const itemOriginalPrice = Number(item.originalPrice || details?.originalPrice || item.price || details?.price || 0);
        return sum + (itemOriginalPrice * itemQty);
    }, 0);

    const calculatedDiscountAmount = items.reduce((sum: number, item: any) => {
        const details = item?.productDetails || {};
        const itemQty = Number(item.qty || item.quantity || details?.qty || details?.quantity || 1);
        const itemOriginalPrice = Number(item.originalPrice || details?.originalPrice || item.price || details?.price || 0);
        const itemPrice = Number(item.price || details?.price || 0);
        const diff = Math.max(0, itemOriginalPrice - itemPrice);
        return sum + (diff * itemQty);
    }, 0);

    // Subtotal shown in the summary. Prefer the server's post-offer subTotal.
    // NEVER fall back to order.total — that is GST-INCLUSIVE, and using it as the
    // subtotal while ALSO rendering the GST line + grand total double-counts GST
    // and makes the breakdown not foot. When subTotal is missing, reconstruct the
    // pre-GST, pre-coupon value from the total (total = subTotal - coupon + GST).
    const reconstructedSubtotal = Math.max(0,
        (Number(order?.total) || 0) - (Number(order?.taxAmount) || 0) + (Number(order?.coupon?.discountAmount) || 0));
    const displaySubtotal = calculatedDiscountAmount > 0
        ? calculatedOriginalSubtotal
        : (order?.subTotal != null ? Number(order.subTotal) : reconstructedSubtotal);

    const isOrderRefunded = String(order?.status || '').toLowerCase() === "cancelled" ||
        String(order?.status || '').toLowerCase() === "refunded";

    const refundTxns = order?.refundTransactions || [];
    const successfulTxnsTotal = refundTxns
        .filter((tx: any) => String(tx?.refundStatus || '').toLowerCase() === 'success' || String(tx?.refundStatus || '').toLowerCase() === 'refunded')
        .reduce((sum: number, tx: any) => sum + (Number(tx?.totalRefundAmount || tx?.amount) || 0), 0);

    const itemsRefundTotal = items.reduce((sum: number, item: any) => {
        const rfd = item?.refundDetails;
        const jewelStatus = item?.JeweleryDetail?.[0]?.jewelery_current_status?.[0]?.adminstatuscaption || '';
        const diaStatus = item?.diamondDetail?.[0]?.diamond_current_status?.[0]?.adminstatuscaption || '';
        const statusStr = (item?.status || jewelStatus || diaStatus || '').toLowerCase();

        if (
            statusStr === 'refunded' ||
            statusStr === 'refund success' ||
            String(rfd?.refundStatus || '').toLowerCase() === 'success' ||
            String(rfd?.refundStatus || '').toLowerCase() === 'refunded'
        ) {
            const itemRefund = Number(rfd?.amount);
            if (itemRefund > 0) return sum + itemRefund;
            const price = Number(item?.price || item?.productDetails?.price || 0);
            const qty = Number(item?.qty || item?.quantity || item?.productDetails?.qty || 1);
            return sum + (price * qty);
        }
        return sum;
    }, 0);

    const totalRefundedAmount = Math.max(
        successfulTxnsTotal,
        itemsRefundTotal,
        Number(order?.refundDetails?.amount) || 0
    );

    const isAnyItemRefunded = items.some((item: any) => {
        const rfd = item?.refundDetails;
        const jewelStatus = item?.JeweleryDetail?.[0]?.jewelery_current_status?.[0]?.adminstatuscaption || '';
        const diaStatus = item?.diamondDetail?.[0]?.diamond_current_status?.[0]?.adminstatuscaption || '';
        const statusStr = (item?.status || jewelStatus || diaStatus || '').toLowerCase();
        return (
            statusStr === 'refunded' ||
            statusStr === 'refund success' ||
            String(rfd?.refundStatus || '').toLowerCase() === 'success' ||
            String(rfd?.refundStatus || '').toLowerCase() === 'refunded'
        );
    }) || itemsRefundTotal > 0 || successfulTxnsTotal > 0;

    const isStatusInShowList = Array.isArray(amountShowOrderStatus) && amountShowOrderStatus.some(
        (s: string) => s.toLowerCase() === String(order?.status || '').toLowerCase()
    );

    const isRefunded = isOrderRefunded || isAnyItemRefunded || isStatusInShowList;

    const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = React.useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = React.useState(false);
    const [returnReason, setReturnReason] = React.useState("");
    const [returnError, setReturnError] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
    const [selectedItemName, setSelectedItemName] = React.useState<string>("");
    const [isMounted, setIsMounted] = React.useState(false);
    const [retrying, setRetrying] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Re-initiate payment for a pending/failed order. Asks the server for a fresh
    // gateway session, reopens the Razorpay modal, and refreshes on confirmation.

    const handleRetryPayment = async () => {
        if (retrying) return;
        setRetrying(true);
        try {
            const token = getToken();
            const res: any = await callApi(ENDPOINTS?.CART?.ORDER_MOVE_TO_CART, "POST", {
                orderId: order?._id,
            }, token);

            if (res?.errorCode === 200 || res?.status === 200 || res?.status === 201 || res?.success) {
                await getCart();
                successMsg(res?.message || 'Items added to cart successfully');
                router.push('/cart');
            } else {
                errorMsg(res?.message || 'Failed to move items to cart');
            }
        } catch (e: any) {
            errorMsg(e?.message || 'Something went wrong while retrying payment.');
        } finally {
            setRetrying(false);
        }
    };

    // const handleRetryPayment = async () => {
    //     if (retrying) return;
    //     setRetrying(true);
    //     try {
    //         const token = getToken();
    //         const res: any = await retryPayment(order._id, token);
    //         const ok = res?.errorCode === 200 || res?.status === 200 || res?.success;
    //         if (!ok) {
    //             errorMsg(res?.message || 'Could not start the payment. Please try again.');
    //             return;
    //         }
    //         const pd = res?.data?.paymentDetails || {};
    //         const ord = res?.data?.order || order;

    //         // Fully covered by wallet / already confirmed server-side.
    //         if (pd?.paid || pd?.paymentGateway === 'wallet') {
    //             successMsg('Payment successful!');
    //             onRefresh();
    //             onBack();
    //             return;
    //         }

    //         if (pd?.paymentGateway === 'razorpay' && pd?.gatewayOrderId) {
    //             const outcome = await openRazorpayForOrder({
    //                 order: ord,
    //                 paymentDetails: pd,
    //                 prefill: {
    //                     name: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
    //                     email: order.shippingAddress?.email || '',
    //                     contact: order.shippingAddress?.phone || '',
    //                 },
    //                 token,
    //             });
    //             if (outcome === 'paid') {
    //                 successMsg('Payment successful!');
    //                 onRefresh();
    //                 onBack();
    //             } else if (outcome === 'unconfirmed') {
    //                 warningMsg('We are confirming your payment. If money was debited it will reflect shortly.');
    //                 onRefresh();
    //             } else if (outcome === 'dismissed') {
    //                 warningMsg('Payment cancelled. Your order is still saved — you can retry anytime.');
    //             } else {
    //                 errorMsg('Could not open the payment window. Please try again.');
    //             }
    //         } else {
    //             warningMsg('Payment could not be started for this order.');
    //         }
    //     } catch (e: any) {
    //         errorMsg(e?.message || 'Something went wrong while retrying payment.');
    //     } finally {
    //         setRetrying(false);
    //     }
    // };

    const orderLastDayToCancel = order?.lastDayToCancel || items.find((it: any) => it?.lastDayToCancel)?.lastDayToCancel;
    const orderLastDayToReturn = order?.lastDayToReturn || items.find((it: any) => it?.lastDayToReturn)?.lastDayToReturn;

    const isItemCancelExpired = (item: any) => {
        const itemCancelDate = item?.lastDayToCancel || order?.lastDayToCancel;
        return itemCancelDate ? isDatePassed(itemCancelDate) : false;
    };

    const isItemReturnExpired = (item: any) => {
        const itemReturnDate = item?.lastDayToReturn || order?.lastDayToReturn;
        return itemReturnDate ? isDatePassed(itemReturnDate) : false;
    };

    const isOrderCancelExpired = React.useMemo(() => {
        if (order?.lastDayToCancel && isDatePassed(order.lastDayToCancel)) {
            return true;
        }
        if (items.length > 0) {
            const cancellableItems = items.filter((it: any) =>
                ['Pending', 'Approved', 'Confirmed', 'In Production'].includes(it.status)
            );
            if (cancellableItems.length > 0 && cancellableItems.every((it: any) => isItemCancelExpired(it))) {
                return true;
            }
        }
        return false;
    }, [order, items]);

    const isOrderReturnExpired = React.useMemo(() => {
        if (order?.lastDayToReturn && isDatePassed(order.lastDayToReturn)) {
            return true;
        }
        if (items.length > 0) {
            const deliveredItems = items.filter((it: any) => it.status === 'Delivered');
            if (deliveredItems.length > 0 && deliveredItems.every((it: any) => isItemReturnExpired(it))) {
                return true;
            }
        }
        return false;
    }, [order, items]);

    const handleCancelClick = () => {
        if (isOrderCancelExpired) {
            warningMsg("Cancellation period for this order has expired.");
            return;
        }
        setSelectedItemId(null);
        setSelectedItemName("");
        if (![PAYMENT_STATUS.FAILED, PAYMENT_STATUS.PENDING].includes(order?.paymentStatus?.toLowerCase())) {
            setIsRefundModalOpen(true);
        } else {
            setIsCancelModalOpen(true);
        }
    };

    const handleCancelItemClick = (itemId: string, itemName: string, itemCancelDate?: string) => {
        const cancelDate = itemCancelDate || order?.lastDayToCancel;
        if (cancelDate && isDatePassed(cancelDate)) {
            warningMsg("Cancellation period for this item has expired.");
            return;
        }
        setSelectedItemId(itemId);
        setSelectedItemName(itemName);
        if (![PAYMENT_STATUS.FAILED, PAYMENT_STATUS.PENDING].includes(order?.paymentStatus?.toLowerCase())) {
            setIsRefundModalOpen(true);
        } else {
            setIsCancelModalOpen(true);
        }
    };

    const confirmCancel = async () => {
        setIsSubmitting(true);
        try {

            const refundType = 'none';

            const res = selectedItemId
                ? await cancelOrderItem(selectedItemId, { refundType })
                : await cancelOrder(order._id, { refundType });
            if (res && (res.errorCode === 200 || res.status === 200 || res.success)) {
                successMsg(selectedItemId ? "Item successfully cancelled" : "Order successfully cancelled");
                onRefresh();
                onBack();
            } else {
                errorMsg(res?.message || (selectedItemId ? "Failed to cancel item" : "Failed to cancel order"));
            }
        } catch (err: any) {
            errorMsg(err?.message || (selectedItemId ? "Failed to cancel item" : "Failed to cancel order"));
        } finally {
            setIsSubmitting(false);
            setIsCancelModalOpen(false);
            setSelectedItemId(null);
        }
    };

    const confirmCancelWithRefund = async (refundPayload: CancelRefundPayload) => {
        setIsSubmitting(true);
        try {
            const res = selectedItemId
                ? await cancelOrderItem(selectedItemId, refundPayload)
                : await cancelOrder(order._id, refundPayload);
            if (res && (res.errorCode === 200 || res.status === 200 || res.success)) {
                successMsg(selectedItemId ? "Cancellation request submitted successfully" : "Order cancellation request submitted successfully");
                onRefresh();
                onBack();
            } else {
                errorMsg(res?.message || (selectedItemId ? "Failed to cancel item" : "Failed to cancel order"));
            }
        } catch (err: any) {
            errorMsg(err?.message || (selectedItemId ? "Failed to cancel item" : "Failed to cancel order"));
        } finally {
            setIsSubmitting(false);
            setIsRefundModalOpen(false);
            setSelectedItemId(null);
        }
    };

    const handleReturn = () => {
        if (isOrderReturnExpired) {
            warningMsg("Return period for this order has expired.");
            return;
        }
        setSelectedItemId(null);
        setSelectedItemName("");
        setReturnReason("");
        setReturnError("");
        setIsReturnModalOpen(true);
    };

    const handleReturnItemClick = (itemId: string, itemName: string, itemReturnDate?: string) => {
        const returnDate = itemReturnDate || order?.lastDayToReturn;
        if (returnDate && isDatePassed(returnDate)) {
            warningMsg("Return period for this item has expired.");
            return;
        }
        setSelectedItemId(itemId);
        setSelectedItemName(itemName);
        setReturnReason("");
        setReturnError("");
        setIsReturnModalOpen(true);
    };

    const confirmReturn = async (returnPayload?: any) => {
        const payloadToUse = returnPayload && typeof returnPayload === 'object' ? returnPayload : { reason: returnReason };
        const reason = payloadToUse?.reason || returnReason;
        if (!reason || !reason.trim()) {
            setReturnError("Return reason is required");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = selectedItemId
                ? await requestReturnItem(selectedItemId, payloadToUse)
                : await requestReturn(order._id, payloadToUse);
            if (res && (res.errorCode === 200 || res.status === 200 || res.success)) {
                successMsg("Return request submitted successfully");
                onRefresh();
                onBack();
            } else {
                errorMsg(res?.message || "Failed to submit return request");
            }
        } catch (err: any) {
            errorMsg(err?.message || "Failed to submit return request");
        } finally {
            setIsSubmitting(false);
            setIsReturnModalOpen(false);
            setSelectedItemId(null);
        }
    };

    // Sum total carat weight across all items and diamonds
    const totalCarat = items.reduce((totalSum: number, item: any) => {
        const itemDiamondDetails = item?.diamondDetails;
        const itemCarat = Array.isArray(itemDiamondDetails)
            ? itemDiamondDetails.reduce((sum: number, s: any) => sum + (Number(s.totalCarat) || 0), 0)
            : (Number(itemDiamondDetails?.totalCarat) || 0);
        return totalSum + itemCarat;
    }, 0);

    const formattedDate = order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Date TBD';

    const displayOrderId = order?.orderId ? `#${order.orderId}` : `#ARN-${order?._id?.substring(18).toUpperCase() || 'ORDER'}`;
    const invoiceUrl = order?.invoiceUrl || '';

    return (
        <div className="bg-white animate-fadeIn">
            {/* Top Bar with Back Button and Download Invoice */}
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-gray-900 transition-colors uppercase font-jakarta"
                >
                    <ArrowLeft className="w-4 h-4" /> BACK TO ORDERS
                </button>
                {invoiceUrl && (
                    <a
                        href={invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-2 bg-[#B57A5A] hover:bg-[#9C684B] text-white text-[10px] font-bold tracking-widest px-4 py-2 rounded uppercase transition-colors font-jakarta shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Download Invoice
                    </a>
                )}
            </div>

            {/* Top Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 font-jakarta">
                {/* Order Details */}
                <div className="border border-gray-100 rounded-sm">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="text-[12px] font-bold text-gray-900">Order Details</h4>
                        {/* {invoiceUrl && (
                            <a
                                href={invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="flex items-center gap-1 text-[10px] font-bold text-[#B57A5A] hover:underline uppercase tracking-wider"
                            >
                                <Download className="w-3.5 h-3.5" /> Invoice
                            </a>
                        )} */}
                    </div>
                    <div className="p-4 space-y-2 text-[12px]">
                        <div className="flex gap-2">
                            <span className="font-bold">Order ID:</span>
                            <span className="text-gray-500">{displayOrderId}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold">Date Added:</span>
                            <span className="text-gray-500">{formattedDate}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold">Total Items:</span>
                            <span className="text-gray-500">{items.length}</span>
                        </div>
                        {totalCarat > 0 && (
                            <div className="flex gap-2">
                                <span className="font-bold">Total Carat:</span>
                                <span className="text-gray-500">{totalCarat.toFixed(3)} CT</span>
                            </div>
                        )}
                        {invoiceUrl && (
                            <div className="flex gap-2 items-center pt-1.5 border-t border-gray-100 mt-2">
                                <span className="font-bold">Invoice:</span>
                                <a
                                    href={invoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="text-[#B57A5A] hover:underline font-bold text-[11px] flex items-center gap-1"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download Invoice (PDF)
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status and Support */}
                <div className="border border-gray-100 rounded-sm">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                        <h4 className="text-[12px] font-bold text-gray-900">Order Status</h4>
                    </div>
                    <div className="p-4 space-y-2 text-[12px]">
                        <div className="flex gap-2">
                            <span className="font-bold">Current Status:</span>
                            <span title="Order Status" className="bg-[#EEEEEE] text-gray-700 text-[10px] font-bold tracking-widest px-3.5 py-0.5 rounded uppercase">
                                {order.status}
                            </span>
                        </div>
                        {['Pending', 'Approved', "Confirmed", "In Production"].includes(order.status) && (
                            <div className="pt-2 flex flex-col items-start gap-1">
                                {!isOrderCancelExpired ? (
                                    <>
                                        <button
                                            onClick={handleCancelClick}
                                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded uppercase transition-colors"
                                        >
                                            Cancel Order
                                        </button>
                                        {orderLastDayToCancel && (
                                            <span className="text-[10px] text-gray-500 font-medium">
                                                Last day to cancel: <span className="font-semibold text-gray-700">{formatDateTime(orderLastDayToCancel)}</span>
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] px-3 py-1.5 rounded font-medium">
                                        Cancellation period expired on <span className="font-bold">{formatDateTime(orderLastDayToCancel)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {order.status === 'Delivered' && (
                            <div className="pt-2 flex flex-col items-start gap-1">
                                {!isOrderReturnExpired ? (
                                    <>
                                        <button
                                            onClick={handleReturn}
                                            className="bg-[#B57A5A] hover:bg-[#9C684B] text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded uppercase transition-colors"
                                        >
                                            Request Return
                                        </button>
                                        {orderLastDayToReturn && (
                                            <span className="text-[10px] text-gray-500 font-medium">
                                                Last day to return: <span className="font-semibold text-gray-700">{formatDateTime(orderLastDayToReturn)}</span>
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] px-3 py-1.5 rounded font-medium">
                                        Return period expired on <span className="font-bold">{formatDateTime(orderLastDayToReturn)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {order.trackingNumber && (
                            <div className="flex gap-2">
                                <span className="font-bold">Tracking #:</span>
                                <span className="text-gray-500">{order.trackingNumber}</span>
                            </div>
                        )}
                        {order.shippingCarrier && (
                            <div className="flex gap-2">
                                <span className="font-bold">Carrier:</span>
                                <span className="text-gray-500">{order.shippingCarrier}</span>
                            </div>
                        )}
                        {order.estimatedDeliveryDate && (
                            <div className="flex gap-2">
                                <span className="font-bold">Est. Delivery:</span>
                                <span className="text-gray-500">
                                    {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}
                        {order.trackingUrl && (
                            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[#B57A5A] underline text-[11px] font-bold">
                                Track shipment →
                            </a>
                        )}
                        <div className="flex gap-2 pt-1.5">
                            <span className="font-bold text-gray-500">For support, please contact customer care.</span>
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="border border-gray-100 rounded-sm">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                        <h4 className="text-[12px] font-bold text-gray-900">Payment</h4>
                    </div>
                    <div className="p-4 space-y-2 text-[12px]">
                        <div className="flex gap-2 items-center">
                            <span className="font-bold">Status:</span>
                            <span title="Payment Status" className={`text-[10px] font-bold tracking-widest px-3 py-0.5 rounded uppercase ${getPaymentStatusBadge(order?.paymentStatus).className}`}>
                                {getPaymentStatusBadge(order?.paymentStatus).label}
                            </span>
                        </div>
                        {(order?.refundStatus || order?.refundDetails?.refundStatus || order?.refundDetails?.status) && (
                            <div className="flex gap-2 items-center">
                                <span className="font-bold">Refund Status:</span>
                                <span className={`text-[10px] font-bold tracking-widest px-3 py-0.5 rounded uppercase ${getRefundStatusBadge(order?.refundStatus || order?.refundDetails?.refundStatus || order?.refundDetails?.status).className}`}>
                                    {getRefundStatusBadge(order?.refundStatus || order?.refundDetails?.refundStatus || order?.refundDetails?.status).label}
                                </span>
                            </div>
                        )}
                        {order.payment?.method && (
                            <div className="flex gap-2">
                                <span className="font-bold">Method:</span>
                                <span className="text-gray-500 uppercase">{order.payment.method}</span>
                            </div>
                        )}
                        {order.payment?.gatewayPaymentId && (
                            <div className="flex gap-2">
                                <span className="font-bold">Txn ID:</span>
                                <span className="text-gray-500 break-all">{order.payment.gatewayPaymentId}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {['pending', 'failed'].includes(String(order?.paymentStatus || '').toLowerCase()) && ['Pending', 'Failed'].includes(order.status) && (
                                <div className="pt-2">
                                    <button
                                        onClick={handleRetryPayment}
                                        disabled={retrying}
                                        className="bg-[#B57A5A] hover:bg-[#9C684B] disabled:opacity-60 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded uppercase transition-colors"
                                    >
                                        {retrying ? 'Please wait…' : 'Retry Payment'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Billing Address */}
                {order.hasBilling && order.billingAddress && (
                    <div className="border border-gray-100 rounded-sm">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <h4 className="text-[12px] font-bold text-gray-900">Billing Address</h4>
                        </div>
                        <div className="p-4 space-y-1 text-[12px] text-gray-500">
                            <p className="text-gray-900 font-bold">
                                {order.billingAddress.firstName} {order.billingAddress.lastName}
                            </p>
                            {order.billingAddress.address && <p>{order.billingAddress.address}</p>}
                            <p>{order.billingAddress.city} {order.billingAddress.zipCode}</p>
                            <p>{order.billingAddress.state}</p>
                            <p>{order.billingAddress.country?.toUpperCase()}</p>
                            {order.billingAddress.email && <p className="pt-1">Email: {order.billingAddress.email}</p>}
                            {order.billingAddress.phone && <p>Phone: {order.billingAddress.phone}</p>}
                        </div>
                    </div>
                )}

                {/* Shipping Address */}
                <div className="border border-gray-100 rounded-sm">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                        <h4 className="text-[12px] font-bold text-gray-900">Shipping Address</h4>
                    </div>
                    <div className="p-4 space-y-1 text-[12px] text-gray-500">
                        <p className="text-gray-900 font-bold">
                            {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </p>
                        {order.shippingAddress?.address && <p>{order.shippingAddress.address}</p>}
                        <p>{order.shippingAddress?.city} {order.shippingAddress?.zipCode}</p>
                        <p>{order.shippingAddress?.state}</p>
                        <p>{order.shippingAddress?.country?.toUpperCase()}</p>
                        {order.shippingAddress?.email && <p className="pt-1">Email: {order.shippingAddress.email}</p>}
                        {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                        {(!order.hasBilling || !order.billingAddress || order.sameAddress) && (
                            <div className="mt-3 pt-2.5 border-t border-gray-100">
                                <p className="text-[11px] text-[#B57A5A] font-bold bg-[#FAF6F3] border border-[#B57A5A]/20 px-3 py-1.5 rounded-sm flex items-center gap-1.5">
                                    <span className="text-emerald-600 font-bold">✓</span> Billing Address Same As Shipping
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* GST Details */}
                {isGst && (
                    <div className="border border-gray-100 rounded-sm">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <h4 className="text-[12px] font-bold text-gray-900">GST Invoice Details</h4>
                        </div>
                        <div className="p-4 space-y-2 text-[12px]">
                            {companyName && (
                                <div className="flex gap-2">
                                    <span className="font-bold">Company Name:</span>
                                    <span className="text-gray-500">{companyName}</span>
                                </div>
                            )}
                            {gstNo && (
                                <div className="flex gap-2">
                                    <span className="font-bold">GST Number:</span>
                                    <span className="text-gray-500 uppercase">{gstNo}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Order Notes */}
                {(order.orderComment || order.orderNotes || order.notes || order.message) && (
                    <div className="border border-gray-100 rounded-sm col-span-1 md:col-span-2">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                            <h4 className="text-[12px] font-bold text-gray-900">Order Notes / Instructions</h4>
                        </div>
                        <div className="p-4 text-[12px] text-gray-600">
                            <p className="whitespace-pre-line">{order.orderComment || order.orderNotes || order.notes || order.message}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Table */}
            <div className="border border-gray-100 rounded-sm overflow-x-auto font-jakarta">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-[12px] font-bold text-gray-900 uppercase">
                            <th className="px-6 py-3 border-r border-gray-100 w-32">Image</th>
                            <th className="px-6 py-3 border-r border-gray-100">Product Details</th>
                            <th className="px-6 py-3 border-r border-gray-100 w-32 text-center">Status</th>
                            <th className="px-6 py-3 w-32 text-center">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any, index: number) => {
                            const details = item?.productDetails || {};
                            const itemOriginalPrice = item.originalPrice || details?.originalPrice;
                            const itemOfferDetails = item.offerDetails || details?.offerDetails;
                            const hasItemOffer = itemOriginalPrice && itemOriginalPrice > (item.price || 0);
                            const offerDiscountLabel = getOfferDiscountLabel(itemOfferDetails);
                            const stone = Array.isArray(item?.diamondDetails)
                                ? (item?.diamondDetails?.[0] || {})
                                : (item?.diamondDetails || {});
                            const diamondOrigin = resolveDiamondOrigin(item);
                            const firstImage = details?.images?.[0];
                            const itemImage = typeof firstImage === 'object'
                                ? (firstImage?.MediaLocation || firstImage?.url || '')
                                : (firstImage || '');

                            const itemCategory = details?.categoryDetails?.categoryName ||
                                details?.categoryName ||
                                details?.category?.categoryName ||
                                (typeof details?.category === 'string' ? details.category : '') ||
                                item?.categoryName ||
                                item?.category?.categoryName ||
                                (typeof item?.category === 'string' ? item.category : '');

                            return (
                                <tr key={item._id || index} className="border-t border-gray-100 align-top">
                                    <td className="px-6 py-6 border-r border-gray-100">
                                        <div className="w-20 h-20 bg-[#F9F9F9] border border-gray-100 flex items-center justify-center rounded-sm relative">
                                            {itemImage ? (
                                                <Image
                                                    src={getImageUrl(itemImage)}
                                                    alt={details?.productTitle || 'Product Image'}
                                                    fill
                                                    className="object-contain mix-blend-multiply"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 border-2 border-gray-200 rotate-45"></div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-r border-gray-100">
                                        <h5 className="text-[13px] font-bold text-gray-800 mb-0.5 uppercase">
                                            {details?.productTitle}
                                        </h5>
                                        <p className="text-[11px] text-gray-400 mb-4">SKU: {details?.itemCode}</p>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px]">
                                            {details?.shape && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Shape:</span>
                                                    <span className="text-gray-500">
                                                        {typeof details.shape === 'object'
                                                            ? (details.shape.name || details.shape.type || '')
                                                            : details.shape}
                                                    </span>
                                                </div>
                                            )}
                                            {diamondOrigin && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Diamond:</span>
                                                    <span className="text-gray-500">{diamondOrigin}</span>
                                                </div>
                                            )}
                                            {(item.color || details?.color) && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Color:</span>
                                                    <span className="text-gray-500">{item.color || details.color}</span>
                                                </div>
                                            )}
                                            {(item.clarity || stone?.clarity) && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Clarity:</span>
                                                    <span className="text-gray-500">{item.clarity || stone.clarity}</span>
                                                </div>
                                            )}
                                            {stone?.cut && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Cut:</span>
                                                    <span className="text-gray-500">{stone.cut}</span>
                                                </div>
                                            )}
                                            {stone?.lab && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Lab:</span>
                                                    <span className="text-gray-500">{stone.lab}</span>
                                                </div>
                                            )}
                                            {details?.metal && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Metal:</span>
                                                    <span className="text-gray-500">
                                                        {typeof details.metal === 'object'
                                                            ? (details.metal.name || details.metal.type || details.metal.stamp || '')
                                                            : details.metal}
                                                        {details.metalStamp || ''}
                                                    </span>
                                                </div>
                                            )}
                                            {details?.size && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Size:</span>
                                                    <span className="text-gray-500">{details.size}</span>
                                                </div>
                                            )}
                                            {itemCategory && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Category:</span>
                                                    <span className="text-gray-500 uppercase">{itemCategory}</span>
                                                </div>
                                            )}
                                            {stone?.certificate && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Certificate:</span>
                                                    <span className="text-gray-500">{stone.certificate}</span>
                                                </div>
                                            )}
                                            {stone?.stockId && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Stock ID:</span>
                                                    <span className="text-gray-500">{stone.stockId}</span>
                                                </div>
                                            )}
                                            {(() => {
                                                const engravingTxt = item?.engravingText || item?.engraving_text || details?.engravingText || item?.JeweleryDetail?.[0]?.engravingText;
                                                const isEngraved = item?.engraving === 1 || item?.engraving === true || Boolean(engravingTxt);
                                                if (isEngraved && engravingTxt) {
                                                    return (
                                                        <div className="space-x-2 col-span-2">
                                                            <span className="font-bold text-gray-600">Engraving:</span>
                                                            <span className="text-[#B57A5A] font-semibold italic">"{engravingTxt}"</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {/* Per-item shipping estimate. Hidden once the item is
                                                delivered / cancelled / rejected / in a return flow —
                                                an expected date makes no sense there. */}
                                            {formatShipmentDays(item.shipmentDays) && (
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-600">Shipping Days:</span>
                                                    <span className="text-gray-500">{formatShipmentDays(item.shipmentDays)}</span>
                                                </div>
                                            )}
                                            {item.expectedDeliveryDate &&
                                                !['Deliver', 'Cancel', 'Reject', 'Return'].some((s) => String(item.status || '').includes(s)) && (
                                                    <div className="space-x-2 col-span-2">
                                                        <span className="font-bold text-gray-600">Expected Delivery:</span>
                                                        <span className="text-gray-500">
                                                            {new Date(item.expectedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-r border-gray-100 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="inline-block px-4 py-1 border border-[#FFB800] text-[#FFB800] text-[10px] font-bold rounded-full uppercase">
                                                {item.status}
                                            </span>
                                            {['Pending', 'Approved', "Confirmed", "In Production"].includes(item.status) && (() => {
                                                const itemCancelDate = item?.lastDayToCancel || order?.lastDayToCancel;
                                                const expired = itemCancelDate ? isDatePassed(itemCancelDate) : false;

                                                if (expired) {
                                                    return (
                                                        <span className="text-[10px] text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-1 rounded text-center leading-tight mt-1 max-w-[150px]">
                                                            Cancellation expired on<br />
                                                            <span className="font-bold">{formatDateTime(itemCancelDate)}</span>
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <div className="flex flex-col items-center gap-1 mt-1">
                                                        <button
                                                            onClick={() => handleCancelItemClick(item._id, details?.productTitle || "Item", itemCancelDate)}
                                                            className="text-[9px] font-bold text-red-600 hover:text-red-700 uppercase tracking-widest hover:underline transition-all"
                                                        >
                                                            Cancel Item
                                                        </button>
                                                        {itemCancelDate && (
                                                            <span className="text-[9px] text-gray-500 font-medium text-center leading-tight">
                                                                Last day to cancel:<br />
                                                                <span className="text-gray-700 font-semibold">{formatDateTime(itemCancelDate)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            {item.status === 'Delivered' && (() => {
                                                const itemReturnDate = item?.lastDayToReturn || order?.lastDayToReturn;
                                                const expired = itemReturnDate ? isDatePassed(itemReturnDate) : false;

                                                if (expired) {
                                                    return (
                                                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-1 rounded text-center leading-tight mt-1 max-w-[150px]">
                                                            Return expired on<br />
                                                            <span className="font-bold">{formatDateTime(itemReturnDate)}</span>
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <div className="flex flex-col items-center gap-1 mt-1">
                                                        <button
                                                            onClick={() => handleReturnItemClick(item._id, details?.productTitle || "Item", itemReturnDate)}
                                                            className="text-[9px] font-bold text-[#B57A5A] hover:text-[#9C684B] uppercase tracking-widest hover:underline transition-all"
                                                        >
                                                            Return Item
                                                        </button>
                                                        {itemReturnDate && (
                                                            <span className="text-[9px] text-gray-500 font-medium text-center leading-tight">
                                                                Last day to return:<br />
                                                                <span className="text-gray-700 font-semibold">{formatDateTime(itemReturnDate)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center text-gray-800 text-sm">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-bold">
                                                {formatPrice(item.price || 0)}
                                            </span>
                                            {hasItemOffer && (
                                                <>
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {formatPrice(itemOriginalPrice)}
                                                    </span>
                                                    {offerDiscountLabel && (
                                                        <div className="flex flex-col items-center gap-0.5 mt-1">
                                                            <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1 py-0.5 rounded font-medium whitespace-nowrap">
                                                                {offerDiscountLabel}
                                                            </span>
                                                            {(itemOfferDetails.offer?.name || itemOfferDetails.offer?.code) && (
                                                                <span className="text-[9px] text-gray-500 font-medium text-center max-w-[120px] leading-tight">
                                                                    {itemOfferDetails.offer.name || itemOfferDetails.offer.code}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {
                                                console.log("item ------->", item)
                                            }
                                            <span className="text-[10px] text-gray-400 mt-1">Qty: {item?.productDetails?.qty || item.quantity || 1}</span>
                                            <span className="text-[11px] text-gray-700 font-semibold">
                                                {/* {formatPrice((item.price || 0) * (item.qty || item.quantity || 1))} */}
                                                {formatPrice(item.productDetails?.totalItemPrice || 0)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-4 font-jakarta">
                <div className="w-full md:w-96 border border-gray-100 rounded-sm">
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="font-bold text-gray-600">Subtotal:</span>
                            <span className="font-bold text-gray-900">
                                {formatPrice(displaySubtotal)}
                            </span>
                        </div>
                        {calculatedDiscountAmount > 0 && (
                            <div className="flex justify-between items-center text-[12px] text-green-700">
                                <span className="font-bold">Offer Discount:</span>
                                <span className="font-bold">-{formatPrice(calculatedDiscountAmount)}</span>
                            </div>
                        )}
                        {Number(order?.coupon?.discountAmount) > 0 && (
                            <div className="flex justify-between items-center text-[12px] text-green-700">
                                <span className="font-bold">Coupon{order.coupon?.code ? ` (${order.coupon.code})` : ''}:</span>
                                <span className="font-bold">-{formatPrice(order.coupon.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="font-bold text-gray-600">Shipping & Handling:</span>
                            <span className="font-bold text-[#B57A5A] uppercase text-[10px] tracking-wider">Free</span>
                        </div>
                        {Number(order?.taxAmount) > 0 && (
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="font-bold text-gray-600">GST{order?.taxRate ? ` (${order.taxRate * 100}%)` : ''}:</span>
                                <span className="font-bold text-gray-900">{formatPrice(order.taxAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100">
                            <span className="font-bold text-gray-900">Grand Total:</span>
                            <span className="font-bold text-gray-900">{formatPrice(order.total || 0)}</span>
                        </div>
                        {Number(order?.walletUsed) > 0 && (
                            <>
                                <div className="flex justify-between items-center text-[12px] text-emerald-700">
                                    <span className="font-bold">Wallet Applied:</span>
                                    <span className="font-bold">-{formatPrice(order.walletUsed)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="font-bold text-gray-600">Paid Online:</span>
                                    <span className="font-bold text-gray-900">{formatPrice(Math.max(0, (order.total || 0) - order.walletUsed))}</span>
                                </div>
                            </>
                        )}
                        {
                            totalRefundedAmount > 0 && isRefunded && (
                                <div className="flex justify-between items-center text-[12px] text-emerald-700 pt-2 border-t border-gray-100 font-bold">
                                    <span>
                                        Refunded Amount{order?.refundDetails?.refundType && order.refundDetails.refundType !== 'none'
                                            ? ` (${order.refundDetails.refundType === 'gateway' ? 'to original payment' : order.refundDetails.refundType})`
                                            : ''}:
                                    </span>
                                    <span>-{formatPrice(totalRefundedAmount)}</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* Cancellation Confirmation Modal (Pending Orders) */}
            <CancelConfirmationModal
                isOpen={isCancelModalOpen}
                isMounted={isMounted}
                isSubmitting={isSubmitting}
                title={`Cancel ${selectedItemId ? "Item" : "Order"}`}
                confirmText={`Cancel ${selectedItemId ? "Item" : "Order"}`}
                cancelText={`Keep ${selectedItemId ? "Item" : "Order"}`}
                description={
                    selectedItemId ? (
                        <>Are you sure you want to cancel the item <span className="font-bold text-gray-900">{selectedItemName}</span>? This action cannot be undone.</>
                    ) : (
                        <>Are you sure you want to cancel order <span className="font-bold text-gray-900">{order.orderId || order._id}</span>? This action cannot be undone.</>
                    )
                }
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={confirmCancel}
            />

            {/* Cancel Refund Modal (Paid Orders) */}
            <CancelRefundModal
                isOpen={isRefundModalOpen}
                isMounted={isMounted}
                isSubmitting={isSubmitting}
                refundDetails={order?.refundDetails}
                title={`Cancel ${selectedItemId ? "Item" : "Order"} & Request Refund`}
                description={
                    selectedItemId ? (
                        <>Cancel item <span className="font-bold text-gray-900">{selectedItemName}</span>. Please choose your preferred refund method below.</>
                    ) : (
                        <>Cancel order <span className="font-bold text-gray-900">{order.orderId || order._id}</span>. Please choose your preferred refund method below.</>
                    )
                }
                onClose={() => setIsRefundModalOpen(false)}
                onConfirm={confirmCancelWithRefund}
            />

            {/* Return Request Modal */}
            <ReturnRequestModal
                isOpen={isReturnModalOpen}
                isMounted={isMounted}
                isSubmitting={isSubmitting}
                returnReason={returnReason}
                returnError={returnError}
                setReturnReason={setReturnReason}
                setReturnError={setReturnError}
                description={
                    selectedItemId ? (
                        <>Please provide the reason for returning the item <span className="font-bold text-gray-900">{selectedItemName}</span>:</>
                    ) : (
                        <>Please provide the reason for returning order <span className="font-bold text-gray-900">{order.orderId || order._id}</span>:</>
                    )
                }
                onClose={() => setIsReturnModalOpen(false)}
                onConfirm={confirmReturn}
            />
        </div>
    );
};

export default OrderDetails;
