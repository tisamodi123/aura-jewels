'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, FileText } from 'lucide-react';
import policiesData from '@/data/policies';

interface PolicyLayoutProps {
    defaultSlug: string;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ defaultSlug }) => {
    const [activeSlug, setActiveSlug] = useState(defaultSlug);
    const [activeSectionId, setActiveSectionId] = useState<string>('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const isManualScrolling = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Find the currently selected policy
    const currentPolicy = policiesData.find(p => p.slug === activeSlug) || policiesData[0];

    useEffect(() => {
        setActiveSlug(defaultSlug);
    }, [defaultSlug]);

    // Initialize active section on policy change
    useEffect(() => {
        if (currentPolicy.sections.length > 0 && !isManualScrolling.current) {
            setActiveSectionId(currentPolicy.sections[0].id);
        }
    }, [activeSlug, currentPolicy]);

    // Update active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isManualScrolling.current) return;

            const scrollPosition = window.scrollY + 180;
            let currentActive = '';

            for (const section of currentPolicy.sections) {
                const el = sectionRefs.current[section.id];
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        currentActive = section.id;
                        break;
                    }
                }
            }

            if (currentActive) {
                setActiveSectionId(currentActive);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Run once initially if not manual scrolling
        if (!isManualScrolling.current) {
            handleScroll();
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeSlug, currentPolicy]);

    // Handle hash deep-linking on mount, hash change, or policy change
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash) {
                const targetIdOrTitle = decodeURIComponent(hash.replace('#', '')).toLowerCase();
                const matchedSection = currentPolicy.sections.find(
                    s => s.id.toLowerCase() === targetIdOrTitle ||
                        s.rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetIdOrTitle ||
                        s.rawTitle.toLowerCase() === targetIdOrTitle
                );
                if (matchedSection) {
                    // Slight delay to ensure DOM is ready and offset is correct
                    setTimeout(() => {
                        scrollToSection(matchedSection.id);
                    }, 150);
                }
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [activeSlug, currentPolicy]);

    const scrollToSection = (id: string) => {
        const el = sectionRefs.current[id];
        if (el) {
            isManualScrolling.current = true;
            setActiveSectionId(id);

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            const offset = 120; // offset for fixed header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setIsMobileMenuOpen(false);

            scrollTimeoutRef.current = setTimeout(() => {
                isManualScrolling.current = false;
            }, 1000);
        }
    };

    const categories = [
        {
            title: "CUSTOMER POLICIES",
            items: [
                { name: "Payment policy", slug: "payment-policy" },
                { name: "Shipping & delivery policy", slug: "shipping-delivery-policy" },
                { name: "Cancellation policy", slug: "cancellation-policy" },
                { name: "Return & refund policy", slug: "return-refund-policy" },
                { name: "Warranty policy", slug: "warranty-policy" },
                { name: "Grievance redressal policy", slug: "grievance-redressal-policy" }
            ]
        },
        {
            title: "JEWELLERY SERVICES",
            items: [
                { name: "Bespoke Design / Custom jewellery policy", slug: "custom-jewellery-policy" },
                { name: "Lifetime exchange policy", slug: "lifetime-exchange-policy" }
            ]
        },
        {
            title: "LEGAL",
            items: [
                { name: "Terms & conditions", slug: "terms-and-conditions" },
                { name: "Privacy policy", slug: "privacy-policy" },
                // { name: "Cookie policy", slug: "cookie-policy" },
                { name: "Mandatory e-commerce disclosures", slug: "mandatory-ecommerce-disclosures" }
            ]
        },
        {
            title: "CERTIFICATION & COMPLIANCE",
            items: [
                { name: "Diamond certification policy", slug: "diamond-certification-policy" },
                { name: "BIS hallmark policy", slug: "bis-hallmark-huid-policy" },
            ]
        }
    ];

    return (
        <div className="bg-white min-h-screen text-[#1A1A1A] font-jakarta antialiased pb-24">
            {/* Breadcrumb Area */}
            <div className="mx-auto px-6 md:px-12 pt-10">
                <nav className="flex items-center space-x-2 text-[12px] font-jakarta text-gray-400">
                    <Link href="/" className="hover:text-[#A96D56]">Home</Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-900 font-medium">Policies</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-900 font-medium lowercase first-letter:uppercase">
                        {currentPolicy.title}
                    </span>
                </nav>
            </div>

            {/* Policy Title Header */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-6 text-center">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#A96D56]">
                    Aura Jewels LEGAL & COMPLIANCE
                </span>
                <h1 className="text-3xl md:text-5xl font-el-messiri tracking-wide text-[#1A1A1A] mt-3 mb-5">
                    Policies & Corporate Compliance
                </h1>
                <div className="w-16 h-[1.5px] bg-[#A96D56]/30 mx-auto mb-6"></div>
                <p className="text-[11px] md:text-[13px] text-gray-400 font-light leading-relaxed max-w-2xl mx-auto font-jakarta">
                    Operational commitments, consumer rights, and data protection disclosures in alignment with the Consumer Protection Act, 2019 and DPDP Act, 2023.
                </p>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Mobile Navigation Toggle */}
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="w-full flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 shadow-sm"
                    >
                        <span>Other Policies</span>
                        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* Left Sidebar: Other Policies */}
                    <div className={`lg:col-span-3 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto pr-1`}>
                        <div className="bg-gray-50/60 rounded-lg p-5 border border-gray-200/70 shadow-sm">
                            <h5 className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#A96D56] font-el-messiri mb-4 border-b border-gray-200/80 pb-2.5">
                                Other Policies
                            </h5>
                            <div className="space-y-5">
                                {categories.map((category) => (
                                    <div key={category.title} className="space-y-2">
                                        <h6 className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                                            {category.title}
                                        </h6>
                                        <ul className="space-y-1 pl-1">
                                            {category.items.map((item) => (
                                                <li key={item.slug}>
                                                    <button
                                                        type="button"
                                                        className={`text-[12.5px] font-jakarta flex items-center gap-2 transition-colors w-full text-left py-1 px-1.5 rounded ${activeSlug === item.slug
                                                            ? 'text-[#A96D56] font-bold bg-[#A96D56]/5'
                                                            : 'text-gray-600 hover:text-[#A96D56] hover:bg-gray-100/50 font-normal'
                                                            }`}
                                                        onClick={() => {
                                                            setActiveSlug(item.slug);
                                                            window.history.pushState(null, '', `/policies/${item.slug}`);
                                                            window.scrollTo(0, 0);
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                    >
                                                        <FileText size={13} className="opacity-60 shrink-0" />
                                                        <span className="line-clamp-1">{item.name}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Main Policy Content */}
                    <div className="lg:col-span-6 min-w-0 space-y-8">
                        {/* Policy Title & Intro Header */}
                        <div className="pb-6 border-b border-gray-100">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-el-messiri tracking-wide text-[#1A1A1A] mb-4 leading-tight">
                                {currentPolicy.title}
                            </h1>
                            <div
                                className="policy-content text-sm sm:text-base text-gray-600 font-light leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: currentPolicy.introHtml }}
                            />
                        </div>

                        {currentPolicy.sections.map((section) => (
                            <div
                                key={section.id}
                                id={section.id}
                                ref={(el) => { sectionRefs.current[section.id] = el; }}
                                className="bg-white border border-gray-200/70 rounded-lg p-5 sm:p-8 shadow-sm scroll-mt-28 transition-all hover:shadow-md"
                            >
                                <h2 className="text-lg sm:text-xl font-el-messiri font-semibold tracking-wide text-[#1A1A1A] mb-5">
                                    {section.title}
                                </h2>
                                <div
                                    className="policy-content border-t border-gray-100 pt-5 text-gray-700 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: section.contentHtml }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar: On This Page */}
                    <div className="lg:col-span-3 lg:sticky lg:top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto pr-1">
                        {currentPolicy.sections && currentPolicy.sections.length > 0 && (
                            <div className="bg-gray-50/60 rounded-lg p-5 border border-gray-200/70 shadow-sm">
                                <h5 className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#A96D56] font-el-messiri mb-4 border-b border-gray-200/80 pb-2.5">
                                    On This Page
                                </h5>
                                <ul className="space-y-2.5 pl-2.5 border-l-2 border-gray-200/60">
                                    {currentPolicy.sections.map((section) => (
                                        <li key={section.id} className="relative">
                                            {activeSectionId === section.id && (
                                                <div className="absolute -left-[12px] top-0 bottom-0 w-[3px] bg-[#A96D56] rounded-full shadow-[0_0_8px_rgba(169,109,86,0.2)]" />
                                            )}
                                            <button
                                                onClick={() => scrollToSection(section.id)}
                                                className={`text-left text-[12px] font-jakarta transition-all duration-200 w-full line-clamp-2 ${activeSectionId === section.id
                                                    ? 'text-[#A96D56] font-bold translate-x-1'
                                                    : 'text-gray-500 hover:text-gray-800 font-medium hover:translate-x-0.5'
                                                    }`}
                                            >
                                                {section.rawTitle}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PolicyLayout;
