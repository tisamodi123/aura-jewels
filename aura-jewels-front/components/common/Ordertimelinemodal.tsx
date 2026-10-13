'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Clock, Truck, PackageCheck, XCircle, RotateCcw, CreditCard, Undo2 } from 'lucide-react';
import { formatPrice } from '@/lib/priceUtils';

interface OrderTimelineModalProps {
    isOpen: boolean;
    isMounted: boolean;
    order: any;
    onClose: () => void;
}

interface TimelineEvent {
    key: string;
    label: string;
    date: string; // ISO date
    description?: string;
    icon: React.ReactNode;
    tone: 'success' | 'danger' | 'info' | 'warning';
}

const toneClasses: Record<TimelineEvent['tone'], { dot: string; text: string }> = {
    success: { dot: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
    danger: { dot: 'bg-red-100 text-red-700 border-red-200', text: 'text-red-700' },
    info: { dot: 'bg-blue-100 text-blue-700 border-blue-200', text: 'text-blue-700' },
    warning: { dot: 'bg-amber-100 text-amber-700 border-amber-200', text: 'text-amber-700' },
};

// Builds a chronologically sorted list of every status transition that has
// actually happened on this order — order level, payment, and refund
// transactions — so the customer can see the full order-wise history.
const buildOrderTimeline = (order: any): TimelineEvent[] => {
    if (!order) return [];
    const events: TimelineEvent[] = [];

    if (order.createdAt) {
        events.push({
            key: 'placed',
            label: 'Order Placed',
            date: order.createdAt,
            description: order.orderId ? `Order ${order.orderId} was created` : undefined,
            icon: <Clock className="w-4 h-4" />,
            tone: 'info',
        });
    }

    if (order.payment?.capturedAt) {
        events.push({
            key: 'payment_captured',
            label: 'Payment Received',
            date: order.payment.capturedAt,
            description: order.payment?.gatewayPaymentId ? `Txn ID: ${order.payment.gatewayPaymentId}` : undefined,
            icon: <CreditCard className="w-4 h-4" />,
            tone: 'success',
        });
    }

    if (order.approvedAt) {
        events.push({
            key: 'approved',
            label: 'Order Approved',
            date: order.approvedAt,
            icon: <CheckCircle2 className="w-4 h-4" />,
            tone: 'success',
        });
    }

    if (order.shippedAt) {
        events.push({
            key: 'shipped',
            label: 'Order Shipped',
            date: order.shippedAt,
            description: order.trackingNumber ? `Tracking #: ${order.trackingNumber}` : undefined,
            icon: <Truck className="w-4 h-4" />,
            tone: 'info',
        });
    }

    if (order.deliveredAt) {
        events.push({
            key: 'delivered',
            label: 'Order Delivered',
            date: order.deliveredAt,
            icon: <PackageCheck className="w-4 h-4" />,
            tone: 'success',
        });
    }

    if (order.returnedAt) {
        events.push({
            key: 'returned',
            label: 'Order Returned',
            date: order.returnedAt,
            icon: <Undo2 className="w-4 h-4" />,
            tone: 'warning',
        });
    }

    if (order.cancelledAt) {
        events.push({
            key: 'cancelled',
            label: 'Order Cancelled',
            date: order.cancelledAt,
            description: order?.refundDetails?.refundRemarks || undefined,
            icon: <XCircle className="w-4 h-4" />,
            tone: 'danger',
        });
    }

    // Per-item transitions — only added when they differ from the order-level
    // timestamp above, so a single-item order doesn't show duplicate rows.
    (order.items || []).forEach((item: any, idx: number) => {
        const name = item?.productDetails?.productTitle || `Item ${idx + 1}`;
        const pairs: Array<[string, string, TimelineEvent['tone'], React.ReactNode]> = [
            ['cancelledAt', 'Item Cancelled', 'danger', <XCircle className="w-4 h-4" key="i-c" />],
            ['returnedAt', 'Item Returned', 'warning', <Undo2 className="w-4 h-4" key="i-r" />],
            ['shippedAt', 'Item Shipped', 'info', <Truck className="w-4 h-4" key="i-s" />],
            ['deliveredAt', 'Item Delivered', 'success', <PackageCheck className="w-4 h-4" key="i-d" />],
        ];
        pairs.forEach(([field, label, tone, icon]) => {
            const value = item?.[field];
            if (value && value !== order?.[field]) {
                events.push({
                    key: `${item._id || idx}_${field}`,
                    label,
                    date: value,
                    description: name,
                    icon,
                    tone,
                });
            }
        });
    });

    // Refund transactions (each request → approval → completion)
    (order.refundTransactions || []).forEach((rt: any, idx: number) => {
        if (rt.requestedAt) {
            events.push({
                key: `refund_${idx}_requested`,
                label: 'Refund Requested',
                date: rt.requestedAt,
                description: rt.refundNumber ? `${rt.refundNumber} • ${formatPrice(rt.totalRefundAmount || 0)}` : undefined,
                icon: <RotateCcw className="w-4 h-4" />,
                tone: 'warning',
            });
        }
        if (rt.approvedAt) {
            events.push({
                key: `refund_${idx}_approved`,
                label: 'Refund Approved',
                date: rt.approvedAt,
                description: rt.refundNumber,
                icon: <CheckCircle2 className="w-4 h-4" />,
                tone: 'info',
            });
        }
        if (rt.refundedAt) {
            events.push({
                key: `refund_${idx}_completed`,
                label: rt.refundStatus === 'Success' ? 'Refund Completed' : `Refund ${rt.refundStatus || 'Update'}`,
                date: rt.refundedAt,
                description: `${formatPrice(rt.totalRefundAmount || 0)} via ${rt.refundType || 'refund'}`,
                icon: <CheckCircle2 className="w-4 h-4" />,
                tone: rt.refundStatus === 'Success' ? 'success' : 'danger',
            });
        }
    });

    return events
        .filter((e) => !!e.date)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const formatEventDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const OrderTimelineModal: React.FC<OrderTimelineModalProps> = ({ isOpen, isMounted, order, onClose }) => {
    if (!isOpen || !isMounted) return null;

    const events = buildOrderTimeline(order);
    const displayOrderId = order?.orderId ? `#${order.orderId}` : `#${order?._id || ''}`;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fadeIn px-4">
            <div className="bg-white rounded-sm border border-gray-100 w-full max-w-lg shadow-xl animate-scaleUp max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide font-jakarta">Order Timeline</h3>
                        <p className="text-[11px] text-gray-400 font-jakarta mt-0.5">{displayOrderId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto font-jakarta">
                    {events.length === 0 ? (
                        <p className="text-[12px] text-gray-500">No status transitions recorded yet for this order.</p>
                    ) : (
                        <ol className="relative border-l border-gray-200 ml-3">
                            {events.map((event, idx) => {
                                const tone = toneClasses[event.tone];
                                return (
                                    <li key={event.key} className={`relative pl-6 ${idx === events.length - 1 ? '' : 'pb-6'}`}>
                                        <span
                                            className={`absolute -left-[15px] flex items-center justify-center w-7 h-7 rounded-full border ${tone.dot}`}
                                        >
                                            {event.icon}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className={`text-[12px] font-bold ${tone.text}`}>{event.label}</span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">{formatEventDate(event.date)}</span>
                                            {event.description && (
                                                <span className="text-[11px] text-gray-500 mt-1">{event.description}</span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full border border-gray-200 text-gray-700 text-[11px] font-bold tracking-widest px-4 py-2.5 rounded-sm uppercase hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OrderTimelineModal;