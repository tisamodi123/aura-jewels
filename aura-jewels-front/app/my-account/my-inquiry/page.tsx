'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, Calendar, Tag, FileText, Loader2 } from 'lucide-react';
import { getMyInquiries } from '@/services/inquiryService';
import { useGlobleStore } from '@/store/globleStore';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';
import { getImageUrl } from '@/lib/utils';
import { INQUIRY_STATUS } from '@/lib/constants';
import Pagination from '@/components/common/Pagination';

interface Inquiry {
    _id: string;
    sku: any;
    name: string;
    email: string;
    phone: string;
    notes?: string;
    status: string;
    adminNotes?: string;
    contactedAt?: string | null;
    resolvedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    productDetails?: {
        title?: string;
        name?: string;
        slug?: string;
        images?: string[];
    };
}

export default function MyInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const router = useRouter();

    const { country } = useGlobleStore();
    const isIndia = country === DEFAULT_COUNTRY;

    const limit = 5;

    // Secure route: redirect Indian users
    useEffect(() => {
        if (isIndia) {
            router.push('/my-account/profile');
        }
    }, [isIndia, router]);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const payload: any = {
                page: currentPage,
                limit: limit
            };
            if (statusFilter !== 'All') {
                payload.status = statusFilter;
            }

            const res = await getMyInquiries(payload);

            if (res && (res.status === 200 || res.errorCode === 200 || res.success)) {
                let list: Inquiry[] = [];
                if (Array.isArray(res.data)) {
                    list = res.data;
                } else if (res.data?.inquiries && Array.isArray(res.data.inquiries)) {
                    list = res.data.inquiries;
                }
                setInquiries(list);

                const total = res.pagination?.total || res.total || res.totalCount || res.data?.total || res.data?.totalCount || list.length;
                const pages = res.pagination?.totalPages || res.totalPages || res.pages || res.data?.totalPages || res.data?.pages || Math.ceil(total / limit) || 1;
                setTotalPages(pages);
            }
        } catch (error: any) {
            console.log("Fetch inquiries error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isIndia) {
            fetchInquiries();
        }
    }, [currentPage, statusFilter, isIndia]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case INQUIRY_STATUS.NEW:
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case INQUIRY_STATUS.CONTACTED:
                return 'bg-blue-50 text-blue-800 border-blue-200';
            case INQUIRY_STATUS.COMPLETED:
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case INQUIRY_STATUS.CANCELLED:
                return 'bg-rose-50 text-rose-800 border-rose-200';
            default:
                return 'bg-stone-50 text-stone-600 border-stone-200';
        }
    };

    if (isIndia) {
        return (
            <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px] flex items-center justify-center font-jakarta text-sm text-gray-500">
                Redirecting...
            </div>
        );
    }

    if (loading && inquiries.length === 0) {
        return (
            <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px] flex flex-col items-center justify-center font-jakarta text-sm text-gray-500 gap-3">
                <Loader2 className="w-8 h-8 text-[#B57A5A] animate-spin" />
                Loading your product inquiries...
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm border border-gray-100 animate-fadeIn">
            {/* Header Section */}
            <div className="bg-[#F5EBE4] px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl serif text-gray-800 tracking-wider uppercase flex items-center gap-2 font-el-messiri">
                    <MessageSquare className="w-5 h-5 text-[#B57A5A]" /> My Inquiries
                </h3>
                <div className="flex items-center gap-2 font-jakarta text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={handleFilterChange}
                        className="bg-white border border-gray-200 px-3 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#B57A5A] text-gray-700 font-bold uppercase tracking-widest cursor-pointer text-[10px]"
                    >
                        <option value="All">All Inquiries</option>
                        <option value={INQUIRY_STATUS.NEW}>New</option>
                        <option value={INQUIRY_STATUS.CONTACTED}>Contacted</option>
                        <option value={INQUIRY_STATUS.COMPLETED}>Completed</option>
                        <option value={INQUIRY_STATUS.CANCELLED}>Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-gray-100 w-full"></div>

            {/* Content Section */}
            <div className="p-6 md:p-10 min-h-[400px]">
                {inquiries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center font-jakarta text-center min-h-[300px] space-y-4">
                        <p className="text-gray-500 text-sm">
                            {statusFilter === 'All'
                                ? "You have not submitted any product inquiries yet."
                                : `No inquiries match the "${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}" status filter.`
                            }
                        </p>
                        <Link
                            href="/all"
                            className="bg-[#B57A5A] hover:bg-[#9C684B] text-white px-6 py-3 text-xs uppercase tracking-widest font-bold transition-colors duration-300 rounded-sm shadow-sm"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {inquiries.map((inquiry) => {
                            const isSkuObj = typeof inquiry.sku === 'object' && inquiry.sku !== null;
                            const skuData = isSkuObj ? (inquiry.sku as any) : null;

                            const itemCode = skuData ? skuData.itemCode : (inquiry.sku as string);
                            const productTitle = skuData ? skuData.productTitle : (inquiry.productDetails?.title || inquiry.productDetails?.name || 'Product Inquiry');
                            const slug = skuData ? skuData.slug : inquiry.productDetails?.slug;

                            let imageLocation = '';
                            if (skuData) {
                                const mainImage = skuData.images?.find((img: any) => img.IsMainMedia) || skuData.images?.[0];
                                imageLocation = mainImage?.MediaLocation || '';
                            } else {
                                imageLocation = inquiry.productDetails?.images?.[0] || '';
                            }

                            const productLink = slug ? `/product/${slug}` : null;

                            return (
                                <div
                                    key={inquiry._id}
                                    className="border border-stone-200/80 rounded-sm p-5 md:p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300 font-dm-sans bg-white"
                                >
                                    {/* Inquiry Header: Product Image & Details */}
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-stone-100 pb-4">
                                        <div className="flex gap-4 items-center">
                                            {imageLocation && (
                                                <div className="relative w-16 h-16 bg-stone-50 border border-stone-200 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={getImageUrl(imageLocation)}
                                                        alt={productTitle}
                                                        className="object-contain w-full h-full mix-blend-multiply"
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-[#B57A5A]" />
                                                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">SKU / Code:</span>
                                                    <span className="text-xs font-bold text-[#1A1A1A]">{itemCode}</span>
                                                </div>
                                                {productLink ? (
                                                    <Link href={productLink} className="text-sm font-semibold text-stone-800 hover:text-[#B57A5A] transition-colors">
                                                        {productTitle}
                                                    </Link>
                                                ) : (
                                                    <h4 className="text-sm font-semibold text-stone-800">
                                                        {productTitle}
                                                    </h4>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(inquiry.status)}`}>
                                            {inquiry.status || INQUIRY_STATUS.NEW}
                                        </span>
                                    </div>

                                    {/* Inquiry Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-stone-600">
                                                <Calendar className="w-4 h-4 text-stone-400" />
                                                <span>Requested on: <strong>{new Date(inquiry.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                                            </div>
                                            {inquiry.contactedAt && (
                                                <div className="flex items-center gap-2 text-stone-600">
                                                    <Calendar className="w-4 h-4 text-stone-400" />
                                                    <span>Contacted on: <strong>{new Date(inquiry.contactedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                                                </div>
                                            )}
                                            {inquiry.resolvedAt && (
                                                <div className="flex items-center gap-2 text-stone-600">
                                                    <Calendar className="w-4 h-4 text-stone-400" />
                                                    <span>Resolved on: <strong>{new Date(inquiry.resolvedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-stone-600">
                                                <FileText className="w-4 h-4 text-stone-400" />
                                                <span>Contact Name: <strong>{inquiry.name}</strong></span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 border-t md:border-t-0 pt-3 md:pt-0">
                                            <p className="text-stone-500">Contact details:</p>
                                            <p className="text-stone-700">Email: <strong>{inquiry.email}</strong></p>
                                            <p className="text-stone-700">Phone: <strong>{inquiry.phone}</strong></p>
                                        </div>
                                    </div>

                                    {/* Inquiry Notes */}
                                    {inquiry.notes && (
                                        <div className="bg-stone-50 border border-stone-150 p-4 rounded-sm">
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Inquiry Notes</p>
                                            <p className="text-xs text-stone-600 font-light leading-relaxed whitespace-pre-line">
                                                {inquiry.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Admin Notes / Response */}
                                    {inquiry.adminNotes && (
                                        <div className="bg-[#F5EBE4]/30 border border-[#B57A5A]/10 p-4 rounded-sm">
                                            <p className="text-[10px] font-bold text-[#B57A5A] uppercase tracking-widest mb-1.5">Admin Response</p>
                                            <p className="text-xs text-stone-700 font-light leading-relaxed whitespace-pre-line">
                                                {inquiry.adminNotes}
                                            </p>
                                        </div>
                                    )}
                                </div>
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
}
