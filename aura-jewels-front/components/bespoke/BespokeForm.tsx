'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BespokeForm() {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: 'Ring',
        budget: '',
        description: '',
        consultation: 'WhatsApp'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    if (formSubmitted) {
        return (
            <div className="py-32 px-6 text-center animate-fadeIn min-h-[70vh] flex flex-col items-center justify-center bg-white">
                <div className="w-20 h-20 bg-[#013D3D] rounded-full flex items-center justify-center mb-10 text-white mx-auto shadow-xl">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-4xl md:text-6xl serif mb-6">Request Received</h2>
                <p className="text-gray-500 font-jakarta max-w-lg mx-auto leading-relaxed mb-12">
                    Your vision has been shared with our lead artisans. A dedicated consultant will reach out to you via {formData.consultation} within 24 hours to begin your journey.
                </p>
                <Link href="/" className="btn-luxury px-12">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn bg-white pb-24">
            {/* Editorial Header */}
            <section className="py-24 md:py-32 bg-gray-50 border-b border-gray-100">
                <div className="mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <p className="text-[11px] tracking-[0.6em] uppercase text-[#013D3D] font-bold font-jakarta">The Bespoke Atelier</p>
                        <h1 className="text-5xl md:text-7xl serif leading-[1.1] text-[#1A1A1A]">Your Vision, <br />Our Artistry.</h1>
                        <p className="text-gray-500 font-jakarta text-[16px] md:text-[18px] leading-relaxed max-w-lg font-light">
                            Transform your deepest inspirations into a tangible legacy. Our bespoke service allows you to collaborate directly with master craftsmen to create a piece that is uniquely yours.
                        </p>
                    </div>
                    <div className="relative group">
                        <div className="aspect-[16/10] overflow-hidden bg-white shadow-2xl border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=1200"
                                alt="Bespoke Design Process"
                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[2s]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* The Form Section */}
            <section className="py-24 px-6 md:px-12 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Instructions Column */}
                    <div className="lg:col-span-5 space-y-16">
                        <div className="space-y-6">
                            <h3 className="text-3xl serif">The Design Journey</h3>
                            <p className="text-gray-400 font-jakarta font-light text-[15px] leading-relaxed">
                                From initial sketch to final polish, our process is defined by absolute transparency and uncompromising detail.
                            </p>
                        </div>

                        <div className="space-y-12">
                            {[
                                { n: '01', t: 'Vision Shared', d: 'Tell us about your inspiration, preferred diamonds, and budget through this form.' },
                                { n: '02', t: 'Expert Dialogue', d: 'Consult with our artisans via video call or at our atelier to refine the design.' },
                                { n: '03', t: '3D Sculpting', d: 'We provide detailed CAD renders and sketches for your final approval before setting.' }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-8 group">
                                    <span className="text-2xl serif text-gray-200 group-hover:text-[#013D3D] transition-colors">{step.n}</span>
                                    <div className="space-y-2">
                                        <h4 className="text-[15px] font-bold text-[#1A1A1A] font-jakarta">{step.t}</h4>
                                        <p className="text-[13px] text-gray-500 font-jakarta font-light leading-relaxed">{step.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="lg:col-span-7 bg-white p-8 md:p-12 border border-gray-100 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[11px] uppercase tracking-widest font-black text-[#1A1A1A] font-jakarta">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#013D3D] transition-colors font-jakarta text-[15px] bg-transparent"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] uppercase tracking-widest font-black text-[#1A1A1A] font-jakarta">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#013D3D] transition-colors font-jakarta text-[15px] bg-transparent"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[11px] uppercase tracking-widest font-black text-[#1A1A1A] font-jakarta">Contact Number</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#013D3D] transition-colors font-jakarta text-[15px] bg-transparent"
                                        placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] uppercase tracking-widest font-black text-[#1A1A1A] font-jakarta">Jewellery Type</label>
                                    <select
                                        className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#013D3D] transition-colors font-jakarta text-[15px] bg-transparent appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Engagement Ring</option>
                                        <option>Wedding Band</option>
                                        <option>Necklace</option>
                                        <option>Earrings</option>
                                        <option>Modern Mangalsutra</option>
                                        <option>Heirloom Redesign</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] uppercase tracking-widest font-black text-[#1A1A1A] font-jakarta">Estimated Budget (INR)</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#013D3D] transition-colors font-jakarta text-[15px] bg-transparent"
                                    placeholder="e.g. ₹1,00,000 - ₹2,50,000"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] uppercase tracking-widest font-black text-[#1A1A1A] font-jakarta">Describe Your Vision</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border border-gray-100 p-4 outline-none focus:border-[#013D3D] transition-colors font-jakarta text-[15px] bg-gray-50 resize-none"
                                    placeholder="Tell us about the styles, diamonds, or special meaning behind this piece..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] uppercase tracking-widest font-black text-[#1A1A1A] font-jakarta">Preferred Consultation Method</label>
                                <div className="flex flex-wrap gap-6">
                                    {['WhatsApp', 'Video Call', 'In-Person (Mumbai Atelier)'].map(method => (
                                        <label key={method} className="flex items-center space-x-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="consultation"
                                                className="w-4 h-4 accent-[#013D3D]"
                                                checked={formData.consultation === method}
                                                onChange={() => setFormData({ ...formData, consultation: method })}
                                            />
                                            <span className="text-[13px] text-gray-500 font-jakarta group-hover:text-black transition-colors">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full btn-luxury py-6 mt-10 shadow-lg">
                                Submit Consultation Request
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
