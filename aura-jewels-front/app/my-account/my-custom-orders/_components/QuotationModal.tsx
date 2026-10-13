'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Sparkles, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { getMyQuotations, updateQuotationStatus } from '@/services/customOrderService';
import { formatPrice } from '@/lib/priceUtils';
import { successMsg, errorMsg } from '@/lib/toast';
import { statuses, QUOTATION_CLIENT_STATUSES } from '@/lib/constants';

interface Quotation {
    _id: string;
    quotationId?: string;
    title?: string;
    name?: string;
    status?: string;
    remarks?: string;
    metalInfo?: {
        metalType?: any;
        metalWeight?: number | string;
        metalPrice?: number | string;
    };
    metalType?: string;
    metalWeight?: number | string;
    metalPrice?: number | string;
    diamond?: {
        diamondLabel?: string;
        carate?: number | string;
        price?: number | string;
    };
    diamondLabel?: string;
    carate?: number | string;
    price?: number | string;
    totalPrice?: number | string;
    canChangeStatus?: boolean;
    approvedByAdmin?: any;
}

interface QuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    customOrderId: string;
    displayOrderId: string;
    categoryName: string;
    budget: number | string;
    canChangeStatus?: boolean;
}

const QuotationModal: React.FC<QuotationModalProps> = ({
    isOpen,
    onClose,
    customOrderId,
    displayOrderId,
    categoryName,
    budget,
}) => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchQuotations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyQuotations(customOrderId);
            if (res && res.errorCode === 200) {
                setQuotations(res.data || []);
            } else {
                setQuotations([]);
            }
        } catch (err: any) {
            console.error('Fetch quotations error:', err);
            setError('Failed to load quotation details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && customOrderId) {
            fetchQuotations();
        } else {
            setQuotations([]);
        }
    }, [isOpen, customOrderId]);

    const getStatusConfig = (status?: string) => {
        const val = (status || 'Pending').toLowerCase();
        const matched = statuses.find(s => s.value.toLowerCase() === val);
        if (matched) return matched;

        // Fallbacks for equivalent status strings
        if (val === 'active' || val === 'accepted') {
            return statuses.find(s => s.value === 'Approved') || statuses.find(s => s.value === 'Accept') || statuses[0];
        }
        if (val === 'rejected' || val === 'declined') {
            return statuses.find(s => s.value === 'Reject') || statuses[0];
        }
        return statuses.find(s => s.value === 'Pending') || statuses[0];
    };

    const handleStatusUpdate = async (quotationId: string, newStatus: string) => {
        setUpdatingId(quotationId);
        try {
            const formData = new FormData();
            let apiStatus = newStatus;
            if (newStatus === 'Accept') {
                apiStatus = 'Approved';
            } else if (newStatus === 'Reject') {
                apiStatus = 'Rejected';
            }
            formData.append('status', apiStatus);
            formData.append('customOrderId', customOrderId);
            formData.append('quotationId', quotationId);

            const res = await updateQuotationStatus(formData);
            if (res && (res.errorCode === 200 || res.status === 200 || res.success)) {
                successMsg(res.message || 'Quotation status updated successfully');
                await fetchQuotations();
            } else {
                errorMsg(res?.message || 'Failed to update quotation status');
            }
        } catch (err: any) {
            console.log('Update status error:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fadeIn font-dm-sans">
            <div className="bg-white border border-stone-200 shadow-2xl rounded-sm max-w-4xl w-full flex flex-col max-h-[90vh] relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-stone-100 p-2 text-[#B57A5A]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-el-messiri text-xl text-[#1A1A1A] font-normal flex items-center gap-2">
                                Quotation Invoice
                                {/* <span className="text-[#B57A5A] text-[10px] font-bold tracking-widest uppercase bg-[#F5EBE4] px-2 py-0.5 rounded-sm font-dm-sans">
                                    {displayOrderId}
                                </span> */}
                            </h3>
                            <p className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold mt-0.5">
                                Design: Custom {categoryName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* General Specs Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 border border-stone-150 p-4 text-xs rounded-sm">
                        <div>
                            <p className="text-stone-400 font-bold uppercase tracking-wider mb-0.5">Product Category</p>
                            <p className="font-semibold text-[#1A1A1A] capitalize">{categoryName}</p>
                        </div>
                        <div>
                            <p className="text-stone-400 font-bold uppercase tracking-wider mb-0.5">Estimated Budget</p>
                            <p className="font-semibold text-[#B57A5A]">{budget ? formatPrice(Number(budget)) : '—'}</p>
                        </div>
                    </div>

                    {/* Table of quotation versions */}
                    <div className="border border-stone-200 rounded-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="p-4 w-10">#</th>
                                        <th className="p-4">Quotation Info</th>
                                        <th className="p-4">Metal Details</th>
                                        <th className="p-4">Diamond Details</th>
                                        <th className="p-4 text-right">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-150 text-stone-600">
                                    {loading ? (
                                        Array.from({ length: 2 }).map((_, idx) => (
                                            <tr key={idx} className="animate-pulse">
                                                <td className="p-4"><div className="h-3 w-4 bg-stone-200 rounded"></div></td>
                                                <td className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="h-3.5 w-32 bg-stone-200 rounded"></div>
                                                        <div className="h-3 w-48 bg-stone-200 rounded"></div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="h-3.5 w-24 bg-stone-200 rounded"></div>
                                                        <div className="h-3 w-16 bg-stone-200 rounded"></div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-2">
                                                        <div className="h-3.5 w-28 bg-stone-200 rounded"></div>
                                                        <div className="h-3 w-16 bg-stone-200 rounded"></div>
                                                    </div>
                                                </td>
                                                <td className="p-4"><div className="h-4 w-20 bg-stone-200 rounded ml-auto"></div></td>
                                            </tr>
                                        ))
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-rose-500 font-medium">
                                                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                                                    <AlertCircle className="w-4 h-4" /> {error}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : quotations.length > 0 ? (
                                        quotations.map((q, idx) => {
                                            const metalTypeStr = q?.metalInfo?.metalType?.name ||
                                                (typeof q?.metalInfo?.metalType === 'string' ? q?.metalInfo.metalType : '') ||
                                                q?.metalType || '—';
                                            const metalWeightVal = q?.metalInfo?.metalWeight || q?.metalWeight;
                                            const metalPriceVal = q?.metalInfo?.metalPrice || q?.metalPrice;

                                            const diamondLabelStr = q?.diamond?.diamondLabel || q?.diamondLabel || '—';
                                            const diamondCarateVal = q?.diamond?.carate || q?.carate;
                                            const diamondPriceVal = q?.diamond?.price || q?.price;
                                            const AdminApproved = q?.approvedByAdmin

                                            // console.log("AdminApproved", AdminApproved)

                                            return (
                                                <tr key={q._id || idx} className="hover:bg-stone-50/50 align-top transition-colors">
                                                    <td className="p-4 font-bold text-stone-400">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="p-4 space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-[#1A1A1A]">{q.title || 'Quotation Version'}</span>
                                                            {q.name && (
                                                                <span className="rounded bg-stone-100 border border-stone-200 px-1.5 py-0.5 font-mono text-[9px] font-medium text-stone-500 uppercase">
                                                                    {q.name}
                                                                </span>
                                                            )}
                                                            {/* Status Dropdown */}
                                                            <div className="relative inline-flex items-center">
                                                                {q?.canChangeStatus === false ? (
                                                                    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${getStatusConfig(q.status).bg}`}>
                                                                        <span className={`w-1 h-1 rounded-full ${getStatusConfig(q.status).dot}`} />
                                                                        {q.status || 'Pending'}
                                                                    </span>
                                                                ) : updatingId === (q.quotationId || q._id) ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-stone-50 text-stone-500 border-stone-200">
                                                                        <span className="w-1 h-1 rounded-full bg-stone-400 animate-pulse" />
                                                                        Updating...
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <span className={`w-1.5 h-1.5 rounded-full absolute left-2 pointer-events-none z-10 ${getStatusConfig(q.status).dot}`} />
                                                                        <select
                                                                            value={q.status === 'Rejected' ? 'Reject' : (q.status || 'Pending')}
                                                                            onChange={(e) => handleStatusUpdate(q.quotationId || q._id, e.target.value)}
                                                                            className={`appearance-none pl-5 pr-6 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-sm border cursor-pointer focus:outline-none transition-all outline-none ${getStatusConfig(q.status).bg}`}
                                                                        >
                                                                            {/* If current status is not one of the allowed customer actions, show it as disabled */}
                                                                            {q.status && !QUOTATION_CLIENT_STATUSES.includes(q.status) && q.status !== 'Rejected' && (
                                                                                <option value={q.status} disabled className="bg-white text-stone-400 font-semibold">
                                                                                    {q.status}
                                                                                </option>
                                                                            )}
                                                                            {!q.status && (
                                                                                <option value="Pending" disabled className="bg-white text-stone-400 font-semibold">
                                                                                    Pending
                                                                                </option>
                                                                            )}
                                                                            {statuses
                                                                                .filter(item => {
                                                                                    if (!QUOTATION_CLIENT_STATUSES.includes(item.value)) return false;
                                                                                    if (item.value === 'Accept') {
                                                                                        return !!AdminApproved || q.status === 'Accept' || q.status === 'Approved';
                                                                                    }
                                                                                    return true;
                                                                                })
                                                                                .map((statusItem) => (
                                                                                    <option
                                                                                        key={statusItem.value}
                                                                                        value={statusItem.value}
                                                                                        className="bg-white text-stone-800 font-semibold"
                                                                                    >
                                                                                        {statusItem.value}
                                                                                    </option>
                                                                                ))}
                                                                        </select>
                                                                        <ChevronDown className="w-2.5 h-2.5 absolute right-1.5 pointer-events-none opacity-60" />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {AdminApproved && (q.status === 'Accept' || !q.status) && (
                                                            <div className="text-[10px] text-emerald-750 bg-emerald-50/70 border border-emerald-150 rounded px-2.5 py-1 mt-1.5 flex items-center gap-1.5 font-medium max-w-xs leading-normal">
                                                                <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                                                                <span>Approved by admin. Pending your approval.</span>
                                                            </div>
                                                        )}
                                                        {q.remarks && (
                                                            <p className="text-[11px] text-stone-500 italic max-w-xs break-words whitespace-pre-line leading-normal">
                                                                {q.remarks}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="p-4 space-y-1">
                                                        <p className="font-semibold text-stone-800 capitalize">{metalTypeStr}</p>
                                                        {(metalWeightVal || metalPriceVal) && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                                                                {metalWeightVal && <span>{metalWeightVal}g</span>}
                                                                {metalWeightVal && metalPriceVal && <span className="text-stone-300">|</span>}
                                                                {metalPriceVal && <span className="font-medium text-[#B57A5A]">{formatPrice(Number(metalPriceVal))}</span>}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 space-y-1">
                                                        <p className="font-semibold text-stone-800 capitalize">{diamondLabelStr}</p>
                                                        {(diamondCarateVal || diamondPriceVal) && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                                                                {diamondCarateVal && <span>{diamondCarateVal}ct</span>}
                                                                {diamondCarateVal && diamondPriceVal && <span className="text-stone-300">|</span>}
                                                                {diamondPriceVal && <span className="font-medium text-[#B57A5A]">{formatPrice(Number(diamondPriceVal))}</span>}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-[#1A1A1A] text-sm">
                                                        {formatPrice(Number(q.totalPrice || 0))}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-stone-400">
                                                    <Sparkles className="w-8 h-8 text-stone-300 mb-2" />
                                                    <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">No Quotations Found</p>
                                                    <p className="text-xs text-stone-400">Aura Jewels's design team is currently preparing custom quotations for this order.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-stone-100 bg-stone-50/50 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="bg-[#B57A5A] text-white hover:bg-[#9C684B] transition-colors py-2.5 px-6 text-xs font-semibold uppercase tracking-widest rounded-sm cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default QuotationModal;