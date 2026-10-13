'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PREFIX, FAQ_IMAGE } from '@/lib/constants';

interface FAQItem {
    q: React.ReactNode;
    a: React.ReactNode;
}

const FAQS: FAQItem[] = [
    {
        q: <>Is this jewellery authentic and certified?</>,
        a: <>
            Yes. Every diamond above 1.00 carat comes certified by a leading international laboratory
            such as IGI, GSI, or GIA. All our gold jewellery is BIS Hallmarked, and every jewellery piece
            comes with its own authenticity certificate, so you know exactly what you're buying.
        </>
    },
    {
        q: <>Is this a natural or lab-grown diamond?</>,
        a: <>
            As of now, we offer only lab-grown diamond jewellery, and every product listing clearly
            mentions this. Each eligible diamond comes with a certification from a leading
            international laboratory such as IGI, GSI, or GIA, confirming its authenticity and quality.
            We will also be introducing natural diamond jewellery soon.
        </>
    },
    {
        q: <>How do I find the right size for this piece?</>,
        a: <>
            It depends on what you&apos;re shopping for — check our Size Guide for step-by-step instructions on measuring at home, whether that&apos;s a ring, bracelet, bangle, or necklace.
        </>
    },
    {
        q: <>How long will delivery take?</>,
        a: <>
            Each piece is made to order and is typically delivered within 15–17 calendar days. If you
            need your order sooner, please contact us at info@Aura Jewels.co or +91 9967800000, and
            we'll do our best to accommodate your request.
        </>
    },
    {
        q: <>What payment methods can I use?</>,
        a: <>
            We accept Visa, Mastercard, American Express, RuPay, all major Indian debit cards, net banking, and UPI (Google Pay, PhonePe, Paytm, and more), through secure gateways including RazorPay and CCAvenue.
        </>
    },
    {
        q: <>Can I return this if I change my mind?</>,
        a: <>
            Yes, you can return your item for a refund within 10 days of delivery, provided it is unused and returned with its original packaging, certificate, and all included accessories. Please refer to our Refund &amp; Return Policy page for complete details.
        </>
    }
];

const JewelleryListFaq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="bg-[#F8F8F8] py-14 md:py-20 overflow-hidden">
            <div className="px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Column: FAQ Content */}
                    <div className="animate-fadeIn flex flex-col justify-center">
                        <div className="mb-10">
                            <h2 className=" text-4xl md:text-5xl el-messiri text-[#1A1A1A] mb-5 leading-tight">Frequently Asked Questions</h2>
                            <p className="text-gray-500 font-jakarta max-w-lg leading-relaxed text-[15px]">
                                At Aura Jewels Jewellery, every piece reflects elegance and craftsmanship. Here are answers to common questions to make your experience smooth—our team is always here to help.
                            </p>
                        </div>

                        <div className="space-y-0 border-t border-gray-200">
                            {FAQS.map((item, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div key={index} className="border-b border-gray-200">
                                        <button
                                            onClick={() => toggle(index)}
                                            className="w-full py-6 flex justify-between items-center text-left group"
                                        >
                                            <span className={`text-[18px] md:text-[20px] el-messiri transition-colors duration-300 ${isOpen ? 'text-[#A96D56]' : 'text-[#1A1A1A] group-hover:text-[#A96D56]'}`}>
                                                {item.q}
                                            </span>
                                            <span className={`transform transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                                                <svg className={`w-5 h-5 ${isOpen ? 'text-[#A96D56]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="text-gray-600 font-jakarta leading-relaxed text-[15px] max-w-xl">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: High-End Packaging Image */}
                    <div className="relative aspect-video lg:aspect-auto lg:h-[600px] overflow-hidden rounded-sm group shadow-sm">
                        <Image
                            src={FAQ_IMAGE}
                            alt="Aura Jewels Luxury Packaging"
                            fill
                            className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/[0.03] pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default JewelleryListFaq;