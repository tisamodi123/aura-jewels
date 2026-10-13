'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';

import { Plus, Minus } from 'lucide-react';

const Footer: React.FC = () => {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        if (window.innerWidth >= 1024) return;
        setOpenSection(openSection === section ? null : section);
    };

    const [posCenter, setPosCenter] = useState({ x: 50, y: 50 });
    const [posLeft, setPosLeft] = useState({ x: 50, y: 50 });

    const handleCenterMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosCenter({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    const handleLeftMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosLeft({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    return (
        <>
            <footer className="bg-[#013D3D] text-white px-4 sm:px-6 md:px-10 pt-10 pb-6 border-t border-white/10">
                {/* Footer logo */}
                <div className="image-section">
                    <div
                        onMouseMove={(e) => {
                            if (window.innerWidth >= 1024) handleCenterMove(e);
                        }}
                        className="relative w-[80%] max-w-3xl mx-auto select-none"
                    >
                        {/* Layout handle for sizing */}
                        <Image
                            src={`${PREFIX}/images/Aura Jewels-new-logo.svg`}
                            alt="Aura Jewels Logo"
                            width={1000}
                            height={333}
                            className="w-full h-auto opacity-0"
                        />
                        {/* Base layer: White logo */}
                        <div
                            className="absolute inset-0 w-full h-full bg-[#fff]"
                            style={{
                                maskImage: `url('${PREFIX}/images/Aura Jewels-new-logo.svg')`,
                                maskSize: '100% 100%',
                                maskRepeat: 'no-repeat',
                                WebkitMaskImage: `url('${PREFIX}/images/Aura Jewels-new-logo.svg')`,
                                WebkitMaskSize: '100% 100%',
                                WebkitMaskRepeat: 'no-repeat',
                            }}
                        />
                        {/* Overlay layer: spotlight effect in brand color [#013D3D] - Hidden on mobile */}
                        <div
                            className="absolute inset-0 w-full h-full hidden lg:block"
                            style={{
                                maskImage: `url('${PREFIX}/images/Aura Jewels-new-logo.svg')`,
                                maskSize: '100% 100%',
                                maskRepeat: 'no-repeat',
                                WebkitMaskImage: `url('${PREFIX}/images/Aura Jewels-new-logo.svg')`,
                                WebkitMaskSize: '100% 100%',
                                WebkitMaskRepeat: 'no-repeat',
                            }}
                        >
                            <div
                                className="absolute inset-0 w-full h-full bg-[#013D3D] transition-all duration-100"
                                style={{
                                    maskImage: `radial-gradient(circle 120px at ${posCenter.x}% ${posCenter.y}%, black 20%, transparent 90%)`,
                                    WebkitMaskImage: `radial-gradient(circle 120px at ${posCenter.x}% ${posCenter.y}%, black 20%, transparent 90%)`,
                                }}
                            />
                        </div>
                    </div>
                    <p className={`tracking-[0.2em] min-[414px]:tracking-[0.1em] min-[417px]:tracking-[0.1em] md:tracking-[0.8em] lg:tracking-[1em] [word-spacing:0.4em] lg:[word-spacing:1.2em] uppercase text-[#fff] mb-12 font-jakarta font-[900] text-center`}>
                        The dawn of diamond luxury
                    </p>
                </div>

                {/* Footer section */}
                <div className=" mx-auto">
                    {/* Main Grid: Branding + Links */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b border-white/10">

                        {/* Left: Branding & Newsletter */}
                        <div className="lg:col-span-4 flex flex-col gap-5">

                            {/* Description */}
                            <p className="text-[13px] text-white/85 font-jakarta font-light leading-relaxed max-w-sm">
                                Aura Jewels Jewellers is where thoughtful design meets uncompromised quality. With secure insured delivery and expert diamond consultation, the brand is built to make every jewellery decision confident, personal, and meaningful.
                            </p>

                            {/* Newsletter */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-[12px] font-jakarta font-light text-white">Get Exclusive Offers and News</h4>
                                <div className="relative max-w-xs">
                                    <input
                                        type="email"
                                        placeholder="Enter Email Address"
                                        className="w-full bg-transparent border border-white/30 py-2.5 px-4 text-[12px] font-jakarta outline-none focus:border-white transition-colors pr-11 placeholder:text-white/30 text-white"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="text-[11px] text-white/55 font-jakarta leading-relaxed max-w-xs">
                                    <p>I agree to receive promotional emails from Aura Jewels. You can unsubscribe at any time.</p>
                                    <p className="mt-1">By clicking join, you accept our{' '}
                                        <Link href="/privacy" className="underline underline-offset-2 hover:text-white transition-colors">Privacy Policy.</Link>
                                    </p>
                                </div>
                            </div>

                            {/* Social Icons */}
                            <div className="flex gap-4">
                                {[
                                    { name: 'instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', href: '#' },
                                    { name: 'linkedin', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', href: '#' },
                                    { name: 'facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.469h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.249h3.328l-.532 3.469h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z', href: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#' },
                                    { name: 'pinterest', path: 'M12.017 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z', href: '#' },
                                ].map(({ name, path, href }) => (
                                    <a
                                        key={name}
                                        href={href}
                                        target={href !== '#' ? "_blank" : undefined}
                                        rel={href !== '#' ? "noopener noreferrer" : undefined}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d={path} />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Right: Navigation Columns */}
                        <div className="lg:col-span-8">
                            <div className="flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-3 lg:gap-x-4 gap-y-0 lg:gap-y-8">
                                {/* The Boutique */}
                                <div className="border-b border-white/10 lg:border-none">
                                    <button
                                        className="w-full flex justify-between items-center py-4 lg:py-0 lg:block lg:space-y-4 text-left"
                                        onClick={() => toggleSection('boutique')}
                                    >
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-white font-jakarta">The Boutique</h4>
                                        <span className="lg:hidden">
                                            {openSection === 'boutique' ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openSection === 'boutique' ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'} lg:block lg:opacity-100 lg:pb-0 lg:space-y-4 lg:mt-4`}>
                                        <div className="overflow-hidden">
                                            <ul className="space-y-2.5">
                                                {[
                                                    { name: 'New Arrivals', href: '/shop' },
                                                    { name: 'Rings', href: '/shop' },
                                                    { name: 'Earrings', href: '/shop' },
                                                    { name: 'Necklaces', href: '/shop' },
                                                    { name: 'Bracelets', href: '/shop' }
                                                ].map(link => (
                                                    <li key={link.name}>
                                                        <Link href={link.href} className="text-[13px] text-white/80 font-jakarta hover:text-white transition-colors font-light">{link.name}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Service */}
                                <div className="border-b border-white/10 lg:border-none">
                                    <button
                                        className="w-full flex justify-between items-center py-4 lg:py-0 lg:block lg:space-y-4 text-left"
                                        onClick={() => toggleSection('service')}
                                    >
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-white font-jakarta">Personal Service</h4>
                                        <span className="lg:hidden">
                                            {openSection === 'service' ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openSection === 'service' ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'} lg:block lg:opacity-100 lg:pb-0 lg:space-y-4 lg:mt-4`}>
                                        <div className="overflow-hidden">
                                            <ul className="space-y-2.5">
                                                {[
                                                    { name: 'Custom Design', href: '/bespoke' },
                                                    { name: 'Virtual Consultation', href: '/bespoke' },
                                                    { name: 'Diamond Appraisal', href: '/bespoke' },
                                                    { name: 'Ring Sizer Guide', href: '/bespoke' }
                                                ].map(link => (
                                                    <li key={link.name}>
                                                        <Link href={link.href} className="text-[13px] text-white/80 font-jakarta hover:text-white transition-colors font-light">{link.name}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* The Brand */}
                                <div className="border-b border-white/10 lg:border-none">
                                    <button
                                        className="w-full flex justify-between items-center py-4 lg:py-0 lg:block lg:space-y-4 text-left"
                                        onClick={() => toggleSection('brand')}
                                    >
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-white font-jakarta">The Brand</h4>
                                        <span className="lg:hidden">
                                            {openSection === 'brand' ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openSection === 'brand' ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'} lg:block lg:opacity-100 lg:pb-0 lg:space-y-4 lg:mt-4`}>
                                        <div className="overflow-hidden">
                                            <ul className="space-y-2.5">
                                                {[
                                                    { name: 'About Us', href: '/about-us' },
                                                    { name: 'Ethical Sourcing', href: '/story' },
                                                    { name: 'Atelier Visit', href: '/story' },
                                                    { name: 'Press', href: '/story' }
                                                ].map(link => (
                                                    <li key={link.name}>
                                                        <Link href={link.href} className="text-[13px] text-white/80 font-jakarta hover:text-white transition-colors font-light">{link.name}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Guest Support */}
                                <div className="border-b border-white/10 lg:border-none">
                                    <button
                                        className="w-full flex justify-between items-center py-4 lg:py-0 lg:block lg:space-y-4 text-left"
                                        onClick={() => toggleSection('support')}
                                    >
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-white font-jakarta">Guest Support</h4>
                                        <span className="lg:hidden">
                                            {openSection === 'support' ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openSection === 'support' ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'} lg:block lg:opacity-100 lg:pb-0 lg:space-y-4 lg:mt-4`}>
                                        <div className="overflow-hidden">
                                            <ul className="space-y-2.5">
                                                {[
                                                    { name: 'FAQs', href: '/faq' },
                                                    { name: 'Shipping & Returns', href: '/shipping-returns' },
                                                    { name: 'Lifetime Exchange', href: '/faq' },
                                                    { name: 'Warranty Claims', href: '/faq' },
                                                    { name: 'Check GIA Certificate', href: 'https://www.gia.edu/report-check-landing', target: '_blank', rel: 'noopener noreferrer' },
                                                    { name: 'Check IGI Certificate', href: 'https://www.igi.org/verify-your-report', target: '_blank', rel: 'noopener noreferrer' },
                                                    { name: 'Check GIS Certificate', href: 'http://gislab.in/', target: '_blank', rel: 'noopener noreferrer' }
                                                ].map(link => (
                                                    <li key={link.name}>
                                                        <Link href={link.href} target={link.target} rel={link.rel} className="text-[13px] text-white/80 font-jakarta hover:text-white transition-colors font-light">{link.name}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Us */}
                                <div className="border-b border-white/10 lg:border-none">
                                    <button
                                        className="w-full flex justify-between items-center py-4 lg:py-0 lg:block lg:space-y-4 text-left"
                                        onClick={() => toggleSection('contact')}
                                    >
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-white font-jakarta">Contact Us</h4>
                                        <span className="lg:hidden">
                                            {openSection === 'contact' ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                        </span>
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openSection === 'contact' ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'} lg:block lg:opacity-100 lg:pb-0 lg:space-y-4 lg:mt-4`}>
                                        <div className="overflow-hidden">
                                            <div className="space-y-2 text-[12px] text-white/80 font-jakarta font-light mt-4 lg:mt-0">
                                                <p>Bandra Kurla Complex, Mumbai 400051</p>
                                                <p className="font-bold text-white text-[13px]">+91 98765 43210</p>
                                                <p>concierge@aurajewels.com</p>
                                                <div className="pt-3">
                                                    <Link
                                                        href="#"
                                                        className="px-5 py-2.5 bg-[#002A2A] text-white text-[9px] font-black uppercase tracking-[0.18em] hover:bg-[#003A3A] transition-all inline-block rounded-sm hover:-translate-y-0.5 active:translate-y-0 transform font-jakarta"
                                                    >
                                                        Chat with Expert
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Bottom Bar: Copyright */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4">
                        <p className="text-[12px] text-white/55 font-jakarta font-light text-center sm:text-left">
                            Copyright &amp; Legal &copy; 2026 Aura Jewels. All Rights Reserved.
                        </p>
                        <div className="flex gap-5">
                            <Link href="/privacy" className="text-[12px] text-white/55 font-jakarta hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-[12px] text-white/55 font-jakarta hover:text-white transition-colors">Terms of Use</Link>
                        </div>
                    </div>

                </div>
            </footer>
        </>
    );
};

export default Footer;
