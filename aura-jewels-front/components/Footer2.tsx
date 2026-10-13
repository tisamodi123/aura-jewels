'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';
import { CONTACT } from '@/lib/siteConfig';
import { subscribeNewsletter } from '@/services/newsletterService';
import { trackPhoneClick, trackWhatsAppClick } from '@/services/trackingService';
import { successMsg, errorMsg } from '@/lib/toast';
import { Promises } from '@/components/commonts/constVariable';
import {
    Plus,
    Minus,
    MessageCircle,
    Phone,
    Mail,
    Clock,
    ShieldCheck,
    Award,
    RefreshCw,
    Package,
    Truck,
    Lock,
    ChevronRight,
    Home,
    ShoppingBag,
    Headphones,
    Sparkles,
    MapPin,
    Building2,
    CheckCircle2
} from 'lucide-react';

interface CertificationIconProps {
    src: string;
    alt: string;
    title: string;
    textSize?: string;
}

const CertificationIcon = ({
    src,
    alt,
}: CertificationIconProps) => (
    <div className="flex items-center justify-center bg-white rounded-md border border-stone-200/80 p-1.5 w-11 h-11 shadow-2xs shrink-0">
        <Image
            src={src}
            alt={alt}
            width={36}
            height={36}
            className="object-contain max-h-8 w-auto mix-blend-multiply"
        />
    </div>
);

interface PaymentMethodProps {
    src: string;
    alt: string;
}

const PaymentMethod = ({ src, alt }: PaymentMethodProps) => (
    <span className="flex items-center gap-2">
        <div className="flex items-center justify-center">
            <Image
                src={src}
                alt={alt}
                width={36}
                height={20}
                className="w-auto object-contain"
            />
        </div>
    </span>
);

const IGIIcon = () => (
    <CertificationIcon
        src="/images/footerImage/IGI.png"
        alt="IGI Certification"
        title="IGI"
        textSize="text-[10px]"
    />
);

const GIAIcon = () => (
    <CertificationIcon
        src="/images/footerImage/GIA.png"
        alt="GIA Certification"
        title="Gemological Institute of America®"
        textSize="text-[6.5px]"
    />
);

const GSIIcon = () => (
    <CertificationIcon
        src="/images/footerImage/GSI.png"
        alt="GSI Certification"
        title="Gemological Science International"
        textSize="text-[6.5px]"
    />
);

const BISIcon = () => (
    <CertificationIcon
        src="/images/footerImage/BIS.png"
        alt="BIS Hallmark"
        title="BIS Hallmark"
        textSize="text-[8px]"
    />
);

const Footer2: React.FC = () => {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            errorMsg('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            errorMsg('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            const res = await subscribeNewsletter({ email: trimmedEmail });
            if (res?.errorCode === 200 || res?.status === 200 || res?.status === 'success' || res?.success || res?.message?.toLowerCase().includes('success')) {
                successMsg(res?.message || 'Subscribed successfully!');
                setEmail('');
            } else {
                errorMsg(res?.message || 'Failed to subscribe. Please try again.');
            }
        } catch (error: any) {
            console.log("Something went wrong. Please try again.", error);
        } finally {
            setIsLoading(false);
        }
    };

    const Column1Data = [
        { name: 'Our Story', href: '/about-us' },
        { name: 'The 4Cs Guide', href: '/4cs-guide' },
        { name: 'Growing Diamonds', href: '/growing-diamonds' },
        { name: 'Ethical Sourcing', href: '/ethical-sourcing' },
        { name: 'B2B Inquiry', href: '/inquiry' }
    ];

    const Column2Data = [
        { name: 'Bespoke Design', href: '/custom-jewellery' },
        { name: 'Ring Size Guide', href: '/ring-size-guide' },
        { name: 'Bracelet Size Guide', href: '/bracelet-size-guide' },
        { name: 'Necklace / Chain Size Guide', href: '/necklace-size-guide' },
        { name: 'Lifetime Exchange Policy', href: '/policies/lifetime-exchange-policy' },
        { name: 'Aura Care', href: '/aura-care' },
    ];

    const Column3Data = [
        { name: 'FAQ', href: '/faq' },
        { name: 'Shipping & Delivery', href: '/policies/shipping-delivery-policy' },
        { name: 'Return & Refund Policy', href: '/policies/return-refund-policy' },
        { name: 'Payment Policy', href: '/policies/payment-policy' },
        { name: 'Track My Order', href: '/my-account/my-order' },
        { name: 'Get In Touch', href: '/get-in-touch' },
    ];

    const certVerifications = [
        { name: 'Verify GIA Certificate', href: 'https://www.gia.edu/report-check-landing' },
        { name: 'Verify IGI Certificate', href: 'https://www.igi.org/verify-your-report' },
        { name: 'Verify GSI Certificate', href: 'https://wg.gemscience.net/vr/veri.aspx' },
    ];

    // Social Links SVGs
    const socials = [
        {
            name: 'Instagram',
            href: 'https://www.instagram.com/aura_jewels/',
            svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            )
        },
        {
            name: 'WhatsApp',
            href: CONTACT.whatsappHref,
            svg: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
            )
        },
        {
            name: 'Facebook',
            href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
            svg: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.469h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.249h3.328l-.532 3.469h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                </svg>
            )
        },
        // {
        //     name: 'Pinterest',
        //     href: 'https://www.pinterest.com/aura_jewels',
        //     svg: (
        //         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        //             <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.065-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        //         </svg>
        //     )
        // }
    ];

    return (
        <footer className="bg-[#F5EFEB] text-[#1A1A1A] pt-14 md:pt-18 pb-8 border-t border-[#E5E0D5] font-jakarta select-none">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">

                {/* ==================== DESKTOP VIEW (lg+) ==================== */}
                <div className="hidden lg:block">
                    {/* Top Main Grid: 4 + 2 + 2 + 2 + 2 = 12 columns */}
                    <div className="grid grid-cols-12 gap-5 lg:gap-6 xl:gap-8 pb-12">

                        {/* Col 1: Logo, Description & Socials (Span 4) */}
                        <div className="col-span-4 flex flex-col justify-between pr-2 xl:pr-4">
                            <div>
                                {/* Logo */}
                                <div className="relative w-44 h-12 mb-4">
                                    <Image
                                        src={`${PREFIX}/images/Aura Jewels/Logo Png.jpg`}
                                        alt="Aura Jewels Logo"
                                        fill
                                        className="object-contain object-left mix-blend-multiply contrast-[1.1]"
                                        priority
                                    />
                                </div>

                                {/* Description */}
                                <p className="text-[13px] text-[#555] font-jakarta font-light leading-relaxed max-w-sm mb-5">
                                    Aura Jewels is a celebration of timeless elegance and refined craftsmanship. Each piece is thoughtfully designed to capture brilliance, beauty, and individuality in its purest form.
                                </p>

                                {/* Subscribe to Newsletter */}
                                <div className="mb-6 max-w-sm">
                                    <h4 className="font-jakarta text-[13px] tracking-[0.14em] text-[#1A1A1A] uppercase font-semibold mb-3">
                                        Subscribe to our Newsletter
                                    </h4>
                                    <form onSubmit={handleSubscribe} className="flex items-center w-full border-b border-[#1A1A1A]/40 pb-1.5 focus-within:border-[#1A1A1A] transition-colors">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full bg-transparent text-[13px] outline-none text-[#1A1A1A] placeholder:text-[#777] font-light disabled:opacity-50 pr-2 min-w-0"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="text-[#1A1A1A] hover:text-[#A96D56] text-[11px] font-medium tracking-[0.15em] uppercase transition-colors whitespace-nowrap disabled:opacity-50 shrink-0 cursor-pointer"
                                        >
                                            {isLoading ? '...' : 'SUBSCRIBE'}
                                        </button>
                                    </form>
                                </div>

                                {/* Follow Us On */}
                                <div>
                                    <h4 className="font-jakarta text-base text-[#1A1A1A] font-semibold mb-3">
                                        Follow Us On
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        {socials.map((s) => (
                                            <a
                                                key={`desk-social-${s.name}`}
                                                href={s.href}
                                                // onClick={() => {
                                                //     if (s.name === 'WhatsApp') {
                                                //         trackWhatsAppClick('Footer Social Icon');
                                                //     }
                                                // }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={s.name}
                                                className="w-8 h-8 rounded-full border border-stone-300 text-stone-700 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] flex items-center justify-center transition-all"
                                            >
                                                {s.svg}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Col 2: About Us & Guides (Span 2) */}
                        <div className="col-span-2">
                            <h4 className="font-jakarta text-base text-[#1A1A1A] font-semibold mb-4">
                                About Aura Jewels
                            </h4>
                            <ul className="space-y-2.5">
                                {Column1Data.map(link => (
                                    <li key={`desk-col1-${link.name}`}>
                                        <Link href={link.href} className="text-[13px] text-[#444] hover:text-[#1A1A1A] transition-colors font-light">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3: Services & Care (Span 2) */}
                        <div className="col-span-2">
                            <h4 className="font-jakarta text-base text-[#1A1A1A] font-semibold mb-4">
                                Services & Guides
                            </h4>
                            <ul className="space-y-2.5">
                                {Column2Data.map(link => (
                                    <li key={`desk-col2-${link.name}`}>
                                        <Link href={link.href} className="text-[13px] text-[#444] hover:text-[#1A1A1A] transition-colors font-light">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 4: Customer Support & Policies (Span 2) */}
                        <div className="col-span-2">
                            <h4 className="font-jakarta text-base text-[#1A1A1A] font-semibold mb-4">
                                Customer Support
                            </h4>
                            <ul className="space-y-2.5">
                                {Column3Data.map(link => (
                                    <li key={`desk-col3-${link.name}`}>
                                        <Link href={link.href} className="text-[13px] text-[#444] hover:text-[#1A1A1A] transition-colors font-light">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 5: Certifications & Contact (Span 2) */}
                        <div className="col-span-2 flex flex-col justify-between">
                            <div>
                                <h4 className="font-jakarta text-base text-[#1A1A1A] font-semibold mb-4">
                                    Certifications
                                </h4>
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mb-4">
                                    <IGIIcon />
                                    <GIAIcon />
                                    <GSIIcon />
                                    <BISIcon />
                                </div>
                                <div className="space-y-2 pt-1">
                                    {certVerifications.map((cert) => (
                                        <a
                                            key={`desk-cert-${cert.name}`}
                                            href={cert.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-[11.5px] xl:text-[12px] text-[#555] hover:text-[#1A1A1A] transition-colors font-light leading-snug"
                                        >
                                            {cert.name}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#E5E0D5]">
                                <p className="text-[12px] text-[#444] font-light">
                                    Call: <a href={CONTACT.phoneHref} 
                                    // onClick={() => trackPhoneClick("Footer")} 
                                    className="hover:text-[#A96D56] font-medium">{CONTACT.phone}</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* ==================== MOBILE VIEW (< lg) ==================== */}
                <div className="block lg:hidden space-y-6">
                    {/* Header Brand Info */}
                    <div className="text-center flex flex-col items-center">
                        <div className="relative w-40 h-10 mb-3">
                            <Image
                                src={`${PREFIX}/images/Aura Jewels/Logo Png.jpg`}
                                alt="Aura Jewels Logo"
                                fill
                                className="object-contain mix-blend-multiply contrast-[1.1]"
                                priority
                            />
                        </div>
                        <p className="text-[12px] text-[#555] font-light leading-relaxed max-w-xs mb-4">
                            Aura Jewels is a celebration of timeless elegance and refined craftsmanship.
                        </p>

                        {/* Mobile Newsletter */}
                        <div className="w-full max-w-xs mb-5">
                            <h4 className="font-jakarta text-[12px] tracking-[0.14em] text-[#1A1A1A] uppercase font-semibold mb-2 text-center">
                                Subscribe to our Newsletter
                            </h4>
                            <form onSubmit={handleSubscribe} className="flex items-center w-full border-b border-[#1A1A1A]/40 pb-1 focus-within:border-[#1A1A1A] transition-colors">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-transparent text-[12px] outline-none text-[#1A1A1A] placeholder:text-[#777] font-light disabled:opacity-50 pr-2 min-w-0"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="text-[#1A1A1A] hover:text-[#A96D56] text-[10.5px] font-medium tracking-[0.15em] uppercase transition-colors whitespace-nowrap disabled:opacity-50 shrink-0"
                                >
                                    {isLoading ? '...' : 'SUBSCRIBE'}
                                </button>
                            </form>
                        </div>

                        {/* Mobile Socials */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            {socials.map((s) => (
                                <a
                                    key={`mob-social-${s.name}`}
                                    href={s.href}
                                    // onClick={() => {
                                    //     if (s.name === 'WhatsApp') {
                                    //         trackWhatsAppClick('Footer Mobile Social Icon');
                                    //     }
                                    // }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.name}
                                    className="w-8 h-8 rounded-full border border-stone-300 text-stone-700 hover:bg-[#1A1A1A] hover:text-white flex items-center justify-center"
                                >
                                    {s.svg}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Accordions */}
                    <div className="space-y-2">
                        {/* Accordion 1: About Us */}
                        <div className="border border-[#E5E0D5] bg-white/50 rounded-lg overflow-hidden">
                            <button
                                className="w-full flex items-center justify-between p-3.5 text-left text-[13px] font-medium text-[#1A1A1A]"
                                onClick={() => toggleSection('about')}
                            >
                                <span>About Us</span>
                                {openSection === 'about' ? <Minus className="w-4 h-4 text-stone-500" /> : <Plus className="w-4 h-4 text-stone-500" />}
                            </button>
                            {openSection === 'about' && (
                                <ul className="px-4 pb-3.5 space-y-2 border-t border-[#E5E0D5] pt-2">
                                    {Column1Data.map(link => (
                                        <li key={`mob-col1-${link.name}`}>
                                            <Link href={link.href} className="text-[12.5px] text-[#555] hover:text-[#1A1A1A] font-light">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Accordion 2: Services & Guides */}
                        <div className="border border-[#E5E0D5] bg-white/50 rounded-lg overflow-hidden">
                            <button
                                className="w-full flex items-center justify-between p-3.5 text-left text-[13px] font-medium text-[#1A1A1A]"
                                onClick={() => toggleSection('shop')}
                            >
                                <span>Services & Guides</span>
                                {openSection === 'shop' ? <Minus className="w-4 h-4 text-stone-500" /> : <Plus className="w-4 h-4 text-stone-500" />}
                            </button>
                            {openSection === 'shop' && (
                                <ul className="px-4 pb-3.5 space-y-2 border-t border-[#E5E0D5] pt-2">
                                    {Column2Data.map(link => (
                                        <li key={`mob-col2-${link.name}`}>
                                            <Link href={link.href} className="text-[12.5px] text-[#555] hover:text-[#1A1A1A] font-light">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Accordion 3: Customer Support */}
                        <div className="border border-[#E5E0D5] bg-white/50 rounded-lg overflow-hidden">
                            <button
                                className="w-full flex items-center justify-between p-3.5 text-left text-[13px] font-medium text-[#1A1A1A]"
                                onClick={() => toggleSection('support')}
                            >
                                <span>Customer Support</span>
                                {openSection === 'support' ? <Minus className="w-4 h-4 text-stone-500" /> : <Plus className="w-4 h-4 text-stone-500" />}
                            </button>
                            {openSection === 'support' && (
                                <ul className="px-4 pb-3.5 space-y-2 border-t border-[#E5E0D5] pt-2">
                                    {Column3Data.map(link => (
                                        <li key={`mob-col3-${link.name}`}>
                                            <Link href={link.href} className="text-[12.5px] text-[#555] hover:text-[#1A1A1A] font-light">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Mobile Certifications & Contact */}
                    <div className="pt-5 border-t border-[#E5E0D5] text-center flex flex-col items-center">
                        <h4 className="font-jakarta text-[13px] text-[#1A1A1A] font-semibold mb-3">
                            Certifications
                        </h4>
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <IGIIcon />
                            <GIAIcon />
                            <GSIIcon />
                            <BISIcon />
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mb-4 text-[12px] text-[#555] font-light">
                            {certVerifications.map((cert) => (
                                <a
                                    key={`mob-cert-${cert.name}`}
                                    href={cert.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#1A1A1A] transition-colors"
                                >
                                    {cert.name}
                                </a>
                            ))}
                        </div>
                         <p className="text-[12px] text-[#444] font-light">
                            Call: <a href={CONTACT.phoneHref} onClick={() => trackPhoneClick("Footer Mobile")} className="hover:text-[#A96D56] font-medium">{CONTACT.phone}</a>
                        </p>
                    </div>
                </div>

                {/* ==================== COMMON BOTTOM BAR ==================== */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 md:pt-8 mt-6 border-t border-[#E5E0D5]">
                    <p className="text-[12px] text-[#666] font-light text-center sm:text-left">
                        Copyright & Legal © 2026 Aura Jewels All Rights Reserved.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <PaymentMethod src="/images/footerImage/Mastercard.png" alt="Mastercard" />
                        <PaymentMethod src="/images/footerImage/Visa.png" alt="Visa" />
                        <PaymentMethod src="/images/footerImage/UPI.png" alt="UPI" />
                        <PaymentMethod src="/images/footerImage/Netbanking.png" alt="Netbanking" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer2;
