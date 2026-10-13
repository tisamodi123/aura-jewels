'use client';

import React, { useEffect, useState } from 'react';
import { Ticket, Copy, Check, Calendar, Info, Tag } from 'lucide-react';
import { getApplicableCoupons } from '@/services/cartService';
import { getToken } from '@/services/clientCookies';
import { formatPrice } from '@/lib/priceUtils';
import { successMsg } from '@/lib/toast';

interface Coupon {
    _id: string;
    code: string;
    name: string;
    description: string;
    image?: string;
    imageMobile?: string;
    startDate: string;
    endDate: string;
    priceRange?: {
        from?: number;
        to?: number;
    };
    discountType: 'percentage' | 'fixed' | string;
    discountValue: number;
    maxDiscountAmount?: number;
    couponType: 'public' | 'assigneeOnly' | string;
}

export default function CouponsPage() {
    const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
    const [assignedCoupons, setAssignedCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            setError('');
            const token = getToken();
            if (!token) {
                setError('Authentication required. Please sign in.');
                return;
            }
            const response = await getApplicableCoupons(token);
            if (response && (response.errorCode === 200 || response.status === 200)) {
                const data = response.data || {};
                // setPublicCoupons(data.public || []);
                setAssignedCoupons(data.assigneeOnly || []);
            } else {
                setError(response?.message || 'Failed to retrieve active coupons.');
            }
        } catch (err: any) {
            console.error('Error fetching coupons:', err);
            setError(err?.message || 'An error occurred while loading coupons.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fallbackCopy = (code: string) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                setCopiedCode(code);
                successMsg(`Coupon code "${code}" copied!`);
                setTimeout(() => setCopiedCode(null), 2000);
            } else {
                console.error('Fallback copy command was unsuccessful');
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
        }
    };

    const handleCopy = (code: string) => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code)
                .then(() => {
                    setCopiedCode(code);
                    successMsg(`Coupon code "${code}" copied!`);
                    setTimeout(() => setCopiedCode(null), 2000);
                })
                .catch((err) => {
                    console.error('Clipboard writeText failed:', err);
                    fallbackCopy(code);
                });
        } else {
            fallbackCopy(code);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch (e) {
            return dateStr;
        }
    };

    const renderCouponCard = (coupon: Coupon) => {
        const isCopied = copiedCode === coupon.code;
        const discountText = coupon.discountType === 'percentage'
            ? `${coupon.discountValue}% OFF`
            : `${formatPrice(coupon.discountValue)} OFF`;

        const minSpend = coupon.priceRange?.from || 0;

        return (
            <div
                key={coupon._id}
                className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-200 hover:border-gray-300"
            >
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                <Tag className="w-3 h-3 text-[#B57A5A]" />
                                {coupon.discountType === 'percentage' ? 'Percentage' : 'Flat Value'}
                            </span>
                            {/* <h4 className="text-xl font-bold font-jakarta text-gray-900">
                                {discountText}
                            </h4> */}
                        </div>
                        <span className="bg-gray-100 text-gray-800 text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                            {coupon.couponType === 'assigneeOnly' ? 'Exclusive' : 'Public'}
                        </span>
                    </div>

                    {/* Code Container */}
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-2.5">
                        <span className="font-mono text-sm font-bold text-gray-800 tracking-wider">
                            {coupon.code}
                        </span>
                        <button
                            onClick={() => handleCopy(coupon.code)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${isCopied
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-[#B57A5A] hover:bg-[#B57A5A]/5'
                                }`}
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-gray-600">
                        {coupon.name && (
                            <h5 className="font-semibold text-gray-800 leading-tight">
                                {coupon.name}
                            </h5>
                        )}
                        {coupon.description && (
                            <p className="text-gray-500 leading-relaxed">
                                {coupon.description}
                            </p>
                        )}

                        <div className="flex gap-4 pt-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                            {minSpend > 0 && (
                                <div>
                                    Min spend: <span className="text-gray-700 font-bold font-sans">{formatPrice(minSpend)}</span>
                                </div>
                            )}
                            {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 && (
                                <div>
                                    Max savings: <span className="text-gray-700 font-bold font-sans">{formatPrice(coupon.maxDiscountAmount)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expiry / Footer */}
                    <div className="flex items-center gap-1 pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Expires: {formatDate(coupon.endDate)}</span>
                    </div>
                </div>
            </div>
        );
    };

    const hasAnyCoupons = publicCoupons.length > 0 || assignedCoupons.length > 0;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-xl md:text-2xl font-jakarta font-medium text-gray-900 uppercase tracking-wide mb-1.5">
                    My Coupons
                </h1>
                <p className="text-xs text-gray-500 font-jakarta">
                    View list of active coupons and copy the codes to apply them on your checkout summary.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 animate-pulse">
                            <div className="h-3 bg-gray-200/60 rounded w-1/4" />
                            <div className="h-6 bg-gray-200/60 rounded w-1/3" />
                            <div className="h-9 bg-gray-200/60 rounded w-full" />
                            <div className="h-4 bg-gray-200/60 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold font-jakarta text-sm">Failed to Load Coupons</h4>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                        <button
                            onClick={fetchCoupons}
                            className="mt-2 text-xs font-bold uppercase tracking-wider text-red-700 hover:text-red-900 underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : !hasAnyCoupons ? (
                <div className="p-12 bg-[#FDFBF7] border border-[#F5ECE0] text-center space-y-4 rounded-lg">
                    <Ticket className="w-6 h-6 text-[#B57A5A] mx-auto" />
                    <div className="space-y-1">
                        <h4 className="text-base font-semibold font-jakarta text-gray-900">No coupons available</h4>
                        <p className="text-gray-500 font-jakarta text-xs max-w-sm mx-auto">
                            Check back later for exclusive member discounts and promotions.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Exclusive / Assigned Coupons Section */}
                    {assignedCoupons.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#B57A5A] font-jakarta">
                                Exclusive Offers
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignedCoupons.map((coupon) => renderCouponCard(coupon))}
                            </div>
                        </div>
                    )}

                    {/* Public Coupons Section */}
                    {publicCoupons.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#B57A5A] font-jakarta">
                                General Offers
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {publicCoupons.map((coupon) => renderCouponCard(coupon))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

