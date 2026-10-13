'use client';

import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Calendar,
    ExternalLink,
    FileText,
    Phone,
    Mail,
    Image as ImageIcon
} from 'lucide-react';
import { formatPrice } from '@/lib/priceUtils';
import { getImageUrl } from '@/lib/utils';
import QuotationModal from './QuotationModal';
import { successMsg, errorMsg } from '@/lib/toast';
import { cancelCustomOrder, returnCustomOrder } from '@/services/customOrderService';
import CancelConfirmationModal from '@/components/common/CancelConfirmationModal';
import ReturnRequestModal from '@/components/common/ReturnRequestModal';

export interface CustomOrder {
    _id: string;
    categoryId?: any;
    otherProduct?: string;
    metalId?: any;
    approxMetalWeight?: string | number;
    ringSizeId?: any;
    braceletSize?: string;
    stoneType?: string;
    approxStoneWeight?: string | number;
    gemstonePreference?: string;
    budget?: string | number;
    engraving?: string;
    remarks?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    countryCode?: string;
    mobileNumber?: string;
    referenceUrls?: string[] | string;
    attachments?: any[];
    status?: string;
    createdAt?: string;
    orderStatus?: string;
}

interface CustomOrderCardProps {
    order: CustomOrder;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onRefresh?: () => void;
}

const CustomOrderCard: React.FC<CustomOrderCardProps> = ({ order, isExpanded, onToggleExpand, onRefresh }) => {
    const orderIdStr = order._id.substring(18).toUpperCase();
    const displayOrderId = `#CUST-${orderIdStr}`;
    const [isQuotationOpen, setIsQuotationOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [returnError, setReturnError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const formattedDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Date TBD';

    const handleCancel = async () => {
        setIsSubmitting(true);
        try {
            const res = await cancelCustomOrder(order._id);
            if (res && res.errorCode === 200) {
                successMsg("Custom order request cancelled successfully");
                if (onRefresh) {
                    onRefresh();
                }
            } else {
                errorMsg(res?.message || "Failed to cancel custom order request");
            }
        } catch (err: any) {
            errorMsg(err?.message || "Failed to cancel custom order request");
        } finally {
            setIsSubmitting(false);
            setIsCancelModalOpen(false);
        }
    };

    const handleReturn = () => {
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
            const res = await returnCustomOrder(order._id, payloadToUse);
            if (res && (res.errorCode === 200 || res.status === 200 || res.success)) {
                successMsg("Return request submitted successfully");
                if (onRefresh) {
                    onRefresh();
                }
            } else {
                errorMsg(res?.message || "Failed to submit return request");
            }
        } catch (err: any) {
            errorMsg(err?.message || "Failed to submit return request");
        } finally {
            setIsSubmitting(false);
            setIsReturnModalOpen(false);
        }
    };

    const getStatusStyles = (status: string = 'Pending') => {
        const s = status.toLowerCase();
        if (s.includes('pending')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        if (s.includes('approved') || s.includes('complete') || s.includes('delivered') || s.includes('success')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (s.includes('reject') || s.includes('cancel')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }
        if (s.includes('review') || s.includes('process') || s.includes('progress')) {
            return 'bg-blue-50 text-blue-700 border-blue-200';
        }
        return 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getCategoryName = (order: CustomOrder) => {
        if (order.categoryId && typeof order.categoryId === 'object') {
            return order.categoryId.name || order.categoryId.categoryName || '';
        }
        return order.otherProduct || 'Jewellery';
    };

    const getMetalName = (order: CustomOrder) => {
        if (order.metalId && typeof order.metalId === 'object') {
            return order.metalId.name || order.metalId.type || '';
        }
        return order.metalId || 'Not Sure';
    };

    const getSizeLabel = (order: CustomOrder) => {
        if (order.ringSizeId) {
            if (typeof order.ringSizeId === 'object') {
                return order.ringSizeId.name || 'Custom';
            }
            return order.ringSizeId;
        }
        if (order.braceletSize) {
            return order.braceletSize;
        }
        return 'N/A';
    };

    const renderAttachments = (attachments?: any[]) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#B57A5A]" /> Inspiration Attachments
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {attachments.map((file, idx) => {
                        const fileUrl = getImageUrl(file);
                        return (
                            <a
                                key={idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-square border border-gray-200 rounded-sm overflow-hidden group hover:border-[#B57A5A] transition-colors"
                            >
                                <img
                                    src={fileUrl}
                                    alt={`Attachment ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <ExternalLink className="w-4 h-4 text-white" />
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderReferenceUrls = (urls?: string[] | string) => {
        if (!urls) return null;
        let parsedUrls: string[] = [];

        try {
            if (typeof urls === 'string') {
                parsedUrls = JSON.parse(urls);
            } else if (Array.isArray(urls)) {
                parsedUrls = urls;
            }
        } catch (e) {
            if (typeof urls === 'string') {
                parsedUrls = [urls];
            }
        }

        const filtered = parsedUrls.filter(Boolean);
        if (filtered.length === 0) return null;

        return (
            <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reference Links</p>
                <div className="space-y-1">
                    {filtered.map((url, idx) => (
                        <a
                            key={idx}
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-[#B57A5A] hover:underline flex items-center gap-1.5 break-all"
                        >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            {url}
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    const categoryName = getCategoryName(order);

    return (
        <div className="border border-gray-100 p-6 md:p-8 hover:shadow-md transition-all duration-300 rounded-sm bg-white">
            {/* Top Metadata */}
            <div className="flex justify-between items-center mb-3">
                {/* <span className="text-[#B57A5A] text-[10px] font-bold tracking-widest uppercase bg-[#F5EBE4] px-2 py-0.5 rounded-sm">
                    {displayOrderId}
                </span> */}
                <h4 className="text-xl md:text-2xl serif text-gray-800 tracking-wide uppercase">
                    Custom {categoryName} Design
                </h4>
                <span title="Order Status" className={`border text-[10px] font-bold tracking-widest px-3 py-1 rounded-sm uppercase ${getStatusStyles(order.status)}`}>
                    Order: {order.orderStatus || 'Pending'}
                </span>
            </div>

            {/* Order Name/Category */}

            <div className="h-[1px] bg-gray-50 w-full mb-6"></div>

            {/* Overview Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 mb-6 font-jakarta text-xs">
                <div>
                    <p className="text-gray-400 font-medium uppercase tracking-wider mb-1">Metal Preference</p>
                    <p className="font-bold text-gray-900 capitalize">{getMetalName(order)}</p>
                </div>
                <div>
                    <p className="text-gray-400 font-medium uppercase tracking-wider mb-1">Diamond / Diamonds</p>
                    <p className="font-bold text-gray-900 capitalize">{order.stoneType || 'No preference'}</p>
                </div>
                <div>
                    <p className="text-gray-400 font-medium uppercase tracking-wider mb-1">Size Spec</p>
                    <p className="font-bold text-gray-900 capitalize">{getSizeLabel(order)}</p>
                </div>
                <div>
                    <p className="text-gray-400 font-medium uppercase tracking-wider mb-1">Approx Budget</p>
                    <p className="font-bold text-[#B57A5A]">
                        {order.budget && Number(order.budget) > 0 ? formatPrice(Number(order.budget)) : 'Consult Designer'}
                    </p>
                </div>
            </div>

            {/* Expandable Specifications Area */}
            {isExpanded && (
                <div className="border-t border-dashed border-gray-200 pt-6 mt-6 font-jakarta text-xs space-y-5 animate-slideDown">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Specification Column */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-gray-400 tracking-widest uppercase border-b border-gray-100 pb-1.5">Design Specs</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 mb-0.5">Approx Metal Weight</p>
                                    <p className="font-semibold text-gray-900">{order.approxMetalWeight ? `${order.approxMetalWeight} g` : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5">Approx Diamond Weight</p>
                                    <p className="font-semibold text-gray-900">{order.approxStoneWeight ? `${order.approxStoneWeight} Carat` : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5">Gemstone Preference</p>
                                    <p className="font-semibold text-gray-900 capitalize">{order.gemstonePreference || 'None'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5">Custom Engraving</p>
                                    <p className="font-semibold text-gray-900 italic">{order.engraving ? `"${order.engraving}"` : 'None'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Contact Info Column */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-gray-400 tracking-widest uppercase border-b border-gray-100 pb-1.5">Contact & Consultation</h5>
                            <div className="space-y-2">
                                <p className="flex items-center gap-2 text-gray-700">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span>{order.email || 'N/A'}</span>
                                </p>
                                <p className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{order.countryCode || ''} {order.mobileNumber || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    {order.remarks && (
                        <div className="bg-[#FAFAFA] p-4 border border-gray-100 rounded-sm">
                            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1.5 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-gray-400" /> Additional Requirements
                            </p>
                            <p className="text-gray-700 leading-relaxed italic">{order.remarks}</p>
                        </div>
                    )}

                    {/* References & Attachments */}
                    {renderReferenceUrls(order.referenceUrls)}
                    {renderAttachments(order.attachments)}
                </div>
            )}

            {/* Card Footer Actions */}
            <div className="h-[1px] bg-gray-50 w-full my-6"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-xs text-gray-400 font-jakarta flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted on {formattedDate}
                </p>
                <div className="flex flex-wrap items-center gap-6">
                    {['pending', 'approved', 'in production', 'processing', 'ready to ship'].includes((order.orderStatus || order.status || '').toLowerCase()) && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold tracking-widest px-4 py-2 rounded-sm uppercase transition-colors font-jakarta shadow-sm cursor-pointer"
                        >
                            Cancel Request
                        </button>
                    )}
                    {order.orderStatus === 'Delivered' && (
                        <div className="pt-2">
                            <button
                                onClick={handleReturn}
                                className="bg-[#B57A5A] hover:bg-[#9C684B] text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded uppercase transition-colors"
                            >
                                Request Return
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsQuotationOpen(true)}
                        className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-[#B57A5A] hover:underline uppercase font-jakarta cursor-pointer"
                    >
                        <FileText className="w-4 h-4" /> VIEW QUOTATION
                    </button>
                    <button
                        onClick={onToggleExpand}
                        className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-gray-900 hover:text-[#B57A5A] transition-colors uppercase font-jakarta cursor-pointer"
                    >
                        {isExpanded ? (
                            <>COLLAPSE DETAILS <ChevronUp className="w-4 h-4" /></>
                        ) : (
                            <>VIEW SPECIFICATIONS <ChevronDown className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>

            {/* Quotation Details Modal */}
            <QuotationModal
                isOpen={isQuotationOpen}
                onClose={() => setIsQuotationOpen(false)}
                customOrderId={order._id}
                displayOrderId={displayOrderId}
                categoryName={categoryName}
                budget={order.budget || 0}
            />

            {/* Cancellation Confirmation Modal */}
            <CancelConfirmationModal
                isOpen={isCancelModalOpen}
                isMounted={isMounted}
                isSubmitting={isSubmitting}
                title="Cancel Request"
                description={
                    <>Are you sure you want to cancel the custom design request <span className="font-bold text-gray-900">{displayOrderId}</span>? This action cannot be undone.</>
                }
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancel}
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
                    <>Please provide the reason for returning custom order <span className="font-bold text-gray-900">{displayOrderId}</span>:</>
                }
                onClose={() => setIsReturnModalOpen(false)}
                onConfirm={confirmReturn}
            />
        </div>
    );
};

export default CustomOrderCard;
