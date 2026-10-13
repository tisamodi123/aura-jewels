import React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';

export const POLICY_HUB_CATEGORIES = [
    {
        title: "CUSTOMER POLICIES",
        items: [
            {
                name: "Payment Policy",
                slug: "payment-policy",
                description: "Payment methods, invoicing, Store Wallet, failed transactions and related matters."
            },
            {
                name: "Shipping & Delivery Policy",
                slug: "shipping-delivery-policy",
                description: "Delivery timelines, shipping charges, tracking and insurance details."
            },
            {
                name: "Cancellation Policy",
                slug: "cancellation-policy",
                description: "Conditions under which orders can be cancelled before dispatch."
            },
            {
                name: "Return & Refund Policy",
                slug: "return-refund-policy",
                description: "Eligibility, process, timelines and refund methods for returned orders."
            },
            {
                name: "Warranty Policy",
                slug: "warranty-policy",
                description: "Coverage period, what's included and how to claim your warranty."
            },
            {
                name: "Grievance Redressal Policy",
                slug: "grievance-redressal-policy",
                description: "How we address and resolve customer concerns and complaints."
            }
        ]
    },
    {
        title: "JEWELLERY SERVICES",
        items: [
            {
                name: "Bespoke Design / Custom Jewellery Policy",
                slug: "custom-jewellery-policy",
                description: "Guidelines for custom orders, design modifications and cancellations."
            },
            {
                name: "Lifetime Exchange Policy",
                slug: "lifetime-exchange-policy",
                description: "Details on our lifetime exchange benefit and applicable conditions."
            }
        ]
    },
    {
        title: "LEGAL",
        items: [
            {
                name: "Terms & Conditions",
                slug: "terms-and-conditions",
                description: "The terms that govern your use of our website and purchases."
            },
            {
                name: "Privacy Policy",
                slug: "privacy-policy",
                description: "How we collect, use and protect your personal information."
            },
            {
                name: "Mandatory E-commerce Disclosures",
                slug: "mandatory-ecommerce-disclosures",
                description: "Important legal disclosures as per Indian e-commerce regulations."
            }
        ]
    },
    {
        title: "CERTIFICATION & COMPLIANCE",
        items: [
            {
                name: "Diamond Certification Policy",
                slug: "diamond-certification-policy",
                description: "Information about diamond certificates from IGI and other labs."
            },
            {
                name: "BIS Hallmark Policy",
                slug: "bis-hallmark-huid-policy",
                description: "Details about BIS hallmarking standards for our gold jewellery."
            }
        ]
    }
];

const PolicyHub: React.FC = () => {
    return (
        <div className="bg-white min-h-screen text-[#1A1A1A] font-jakarta antialiased pb-24">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-10 text-center">
                <h1 className="text-3xl md:text-5xl font-el-messiri tracking-wide text-[#A96D56] uppercase mb-4">
                    OUR POLICIES
                </h1>
                
                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-3 my-4">
                    <div className="w-12 md:w-20 h-[1px] bg-[#A96D56]/30" />
                    <div className="rotate-45 w-2 h-2 border border-[#A96D56]/60 bg-[#A96D56]/20" />
                    <div className="w-12 md:w-20 h-[1px] bg-[#A96D56]/30" />
                </div>

                <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed max-w-xl mx-auto font-jakarta mt-3">
                    We believe in complete transparency. Explore all our policies that govern your experience with Aura Jewels.
                </p>
            </div>

            {/* Policy Categories & Items */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
                {POLICY_HUB_CATEGORIES.map((category) => (
                    <div key={category.title} className="space-y-4">
                        {/* Category Heading */}
                        <div className="border-b border-gray-200/80 pb-2">
                            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[#A96D56] font-el-messiri">
                                {category.title}
                            </h2>
                        </div>

                        {/* Category Items List */}
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
                            {category.items.map((item) => (
                                <Link
                                    key={item.slug}
                                    href={`/policies/${item.slug}`}
                                    className="group flex items-center justify-between p-3.5 sm:p-5 transition-all duration-200 hover:bg-gray-50/80 gap-3.5 sm:gap-4"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        {/* Icon Container */}
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100/70 flex items-center justify-center text-[#A96D56] shrink-0 group-hover:bg-[#A96D56] group-hover:text-white transition-colors duration-200">
                                            <FileText size={16} className="sm:hidden" />
                                            <FileText size={18} className="hidden sm:block" />
                                        </div>

                                        {/* Title & Description */}
                                        <div className="min-w-0">
                                            <h3 className="text-xs sm:text-base font-semibold text-gray-900 group-hover:text-[#A96D56] transition-colors font-jakarta leading-snug">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-light mt-0.5 line-clamp-2 leading-relaxed hidden sm:block">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow Indicator */}
                                    <div className="shrink-0">
                                        <ChevronRight
                                            size={18}
                                            className="text-gray-400 group-hover:text-[#A96D56] group-hover:translate-x-1 transition-all duration-200"
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PolicyHub;
