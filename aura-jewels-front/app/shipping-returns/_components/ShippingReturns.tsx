'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import policiesData from '@/data/policies';

const POLICY_CATEGORIES = [
    {
        title: "CUSTOMER POLICIES",
        items: [
            { name: "Shipping & delivery policy", slug: "shipping-delivery-policy" },
            { name: "Return & refund policy", slug: "return-refund-policy" },
            { name: "Cancellation policy", slug: "cancellation-policy" },
            { name: "Payment policy", slug: "payment-policy" },
            { name: "Warranty policy", slug: "warranty-policy" },
            { name: "Grievance redressal policy", slug: "grievance-redressal-policy" }
        ]
    },
    {
        title: "JEWELLERY SERVICES",
        items: [
            { name: "Lifetime exchange policy", slug: "lifetime-exchange-policy" },
            { name: "Exchange & buy-back policy", slug: "lifetime-exchange-policy" },
            { name: "Custom jewellery policy", slug: "custom-jewellery-policy" }
        ]
    },
    {
        title: "LEGAL",
        items: [
            { name: "Privacy policy", slug: "privacy-policy" },
            { name: "Terms & conditions", slug: "terms-and-conditions" },
            { name: "Cookie policy", slug: "cookie-policy" },
            { name: "Mandatory e-commerce disclosures", slug: "mandatory-ecommerce-disclosures" }
        ]
    },
    {
        title: "CERTIFICATION & COMPLIANCE",
        items: [
            { name: "Diamond certification policy", slug: "diamond-certification-policy" },
            { name: "BIS hallmark policy", slug: "bis-hallmark-huid-policy" },
            { name: "Legal compliance & audit report", slug: "legal-compliance-audit-report" }
        ]
    }
];

interface ShippingReturnsProps {
    defaultSlug?: string;
}

const ShippingReturns: React.FC<ShippingReturnsProps> = ({ defaultSlug = "shipping-delivery-policy" }) => {
    const [activeSlug, setActiveSlug] = useState(defaultSlug);
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const accordionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setIsMenuOpen(true);
        }
    }, []);

    useEffect(() => {
        setActiveSlug(defaultSlug);
        setOpenAccordion(0);
    }, [defaultSlug]);

    const toggleAccordion = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const handleTabChange = (slug: string) => {
        setActiveSlug(slug);
        setOpenAccordion(0);
        window.history.pushState(null, '', `/policies/${slug}`);
        // window.scrollTo({ top: 0, behavior: 'smooth' });
        // if (window.innerWidth < 1024) {
        //     setIsMenuOpen(false);
        // }
    };

    // Find the currently selected policy
    const currentPolicy = policiesData.find(p => p.slug === activeSlug) || policiesData.find(p => p.slug === defaultSlug) || policiesData[0];

    // Handle hash deep-linking on mount or hash change
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash) {
                const targetIdOrTitle = decodeURIComponent(hash.replace('#', '')).toLowerCase();
                const matchedIndex = currentPolicy.sections.findIndex(
                    s => s.id.toLowerCase() === targetIdOrTitle ||
                        s.rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetIdOrTitle ||
                        s.rawTitle.toLowerCase() === targetIdOrTitle
                );
                if (matchedIndex !== -1) {
                    setOpenAccordion(matchedIndex);
                    setTimeout(() => {
                        const el = accordionRefs.current[matchedIndex];
                        if (el) {
                            const offset = 120;
                            const bodyRect = document.body.getBoundingClientRect().top;
                            const elementRect = el.getBoundingClientRect().top;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }, 150);
                }
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [activeSlug, currentPolicy]);

    return (
        <div className="bg-white min-h-screen text-[#1A1A1A]">
            {/* Breadcrumb Area */}
            <div className="mx-auto px-6 md:px-12 pt-10">
                <nav className="flex items-center space-x-2 text-[12px] font-jakarta text-gray-500">
                    <Link href="/" className="hover:text-black">Home</Link>
                    <span className="text-gray-300">›</span>
                    <Link href="/policies" className="hover:text-black transition-colors">Policies</Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-900 font-medium first-letter:uppercase">{currentPolicy.title}</span>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="mx-auto px-6 md:px-12 py-10">
                <div className="flex flex-col lg:flex-row gap-9">

                    {/* Sidebar - Grouped Category-wise */}
                    <div className="w-full lg:w-[320px] shrink-0">
                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden flex items-center justify-center p-3 bg-[#F9F9F9] rounded-xl border border-gray-100 mb-4 transition-all hover:bg-gray-50 shadow-sm"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-[#013D3D]" />
                            ) : (
                                <Menu className="w-6 h-6 text-[#013D3D]" />
                            )}
                        </button>

                        <div className={`${isMenuOpen ? 'max-h-[1200px] opacity-100 mb-8' : 'max-h-0 opacity-0 overflow-hidden'} lg:max-h-none lg:opacity-100 lg:block lg:h-full transition-all duration-500 ease-in-out`}>
                            <div className="bg-[#F9F9F9] rounded-lg p-7 sticky top-32">
                                <div className="relative border-l-[1.5px] border-gray-200/40">
                                    <div className="space-y-6 pl-4">
                                        {POLICY_CATEGORIES.map((category) => (
                                            <div key={category.title} className="space-y-3">
                                                {/* Category Title */}
                                                <h5 className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-[#013D3D] font-el-messiri opacity-90 pt-1">
                                                    {category.title}
                                                </h5>
                                                {/* Subtitles (Policy Links) */}
                                                <ul className="space-y-2.5 pl-3 border-l border-gray-200/50">
                                                    {category.items.map((policy) => (
                                                        <li key={policy.slug} className="relative group">
                                                            {activeSlug === policy.slug && (
                                                                <div className="absolute -left-[16.5px] top-0 bottom-0 w-[2.5px] bg-[#013D3D] rounded-full shadow-[0_0_8px_rgba(1,61,61,0.2)]" />
                                                            )}
                                                            <button
                                                                onClick={() => handleTabChange(policy.slug)}
                                                                className={`text-left text-[13.5px] font-jakarta transition-all duration-300 ${activeSlug === policy.slug
                                                                    ? 'text-[#013D3D] font-bold'
                                                                    : 'text-gray-500 hover:text-gray-800 font-medium'
                                                                    }`}
                                                            >
                                                                {policy.name}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-[#F4F6F6] rounded-lg p-5 md:p-9">
                            <h2 className="text-2xl font-bold font-jakarta text-gray-900 mb-6">{currentPolicy.title}</h2>
                            <div
                                className="policy-content text-[15.5px] font-jakarta text-gray-700 leading-[1.7] mb-12 font-medium max-w-4xl"
                                dangerouslySetInnerHTML={{ __html: currentPolicy.introHtml }}
                            />

                            <div className="space-y-3">
                                {currentPolicy.sections.map((section, index) => {
                                    const isOpen = openAccordion === index;
                                    return (
                                        <div
                                            key={section.id}
                                            ref={(el) => { accordionRefs.current[index] = el; }}
                                            className="bg-white rounded-[16px] overflow-hidden transition-all duration-300 border border-transparent hover:border-gray-100"
                                        >
                                            <button
                                                onClick={() => toggleAccordion(index)}
                                                className="w-full flex items-center justify-between p-7 text-left group"
                                            >
                                                <span className={`text-[16px] font-jakarta font-bold transition-colors ${isOpen ? 'text-[#013D3D]' : 'text-gray-800 group-hover:text-[#013D3D]'}`}>
                                                    {section.title}
                                                </span>
                                                <div className={`p-1.5 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors ${isOpen ? 'rotate-180' : ''}`}>
                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                </div>
                                            </button>

                                            <div
                                                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2500px] opacity-100 pb-8 px-7' : 'max-h-0 opacity-0'
                                                    }`}
                                            >
                                                <div
                                                    className="policy-content text-[15px] font-jakarta text-gray-500 leading-[1.7] font-normal"
                                                    dangerouslySetInnerHTML={{ __html: section.contentHtml }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingReturns;