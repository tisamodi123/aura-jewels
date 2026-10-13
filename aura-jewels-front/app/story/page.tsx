import React from 'react';

export default function Story() {
    return (
        <div className="animate-fadeIn bg-white">
            {/* Editorial Hero */}
            <section className="min-h-[60vh] flex items-center bg-gray-50 border-b border-gray-100">
                <div className=" mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <p className="text-[12px] tracking-[0.5em] uppercase text-[#013D3D] font-bold font-jakarta">The Origin Story</p>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] serif">The Dawn of <br />Modern Luxury.</h1>
                        <div className="w-20 h-[1px] bg-[#013D3D]"></div>
                        <p className="text-[17px] md:text-lg font-jakarta text-gray-600 leading-relaxed font-light max-w-lg">
                            "Aura Jewels" translates to 'The Dawn'. Like the first rays of the sun, our jewellery is designed to be essential, warm, and brilliant.
                        </p>
                    </div>
                    <div className="hidden lg:block aspect-square overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                        <img src="https://images.unsplash.com/photo-1573408302185-9127ff5f6133?auto=format&fit=crop&q=80&w=1200" alt="Editorial" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 md:px-12  mx-auto space-y-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-5 aspect-[4/5] bg-gray-100 overflow-hidden shadow-sm">
                        <img src="https://images.unsplash.com/photo-1596944210900-3467b3ee82bc?auto=format&fit=crop&q=80&w=1000" alt="Detail" className="w-full h-full object-cover" />
                    </div>
                    <div className="lg:col-span-7 lg:pt-16 space-y-8">
                        <h2 className="text-4xl md:text-5xl serif leading-tight">Designed for the <br />Modern Individual.</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-jakarta">
                            <p className="text-[14px] text-gray-500 leading-relaxed font-light">
                                Indian jewellery has long been associated with heavy, bridal sets reserved for grand occasions. At Aura Jewels, we believe luxury should be lived every single day. Our designs are minimal, sleek, and contemporary—perfect for the boardroom, the brunch, and the home.
                            </p>
                            <p className="text-[14px] text-gray-500 leading-relaxed font-light">
                                We focus on the urban professional who wants brilliance that doesn't scream, but whispers elegance. Every piece is a conversation between tradition and tomorrow.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-7 order-2 lg:order-1 lg:pt-16 space-y-10">
                        <h2 className="text-4xl md:text-5xl serif leading-tight">The Ethical Diamond.</h2>
                        <p className="text-[16px] text-gray-600 leading-relaxed font-light font-jakarta max-w-2xl">
                            The earth has given us enough. We choose to create rather than extract. Our lab-grown diamonds are chemically, physically, and optically identical to earth-mined diamonds, crafted with zero environmental compromise.
                        </p>
                        <div className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-gray-100">
                            {[
                                { t: 'Conflict Free', d: 'Guaranteed ethical sourcing' },
                                { t: 'Zero Mining', d: 'No environmental excavation' },
                                { t: 'Recycled Gold', d: 'Sustainable gold alloys' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <p className="text-[11px] uppercase tracking-widest font-bold text-[#013D3D] font-jakarta">{item.t}</p>
                                    <p className="text-[13px] text-gray-400 font-jakarta font-light">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-5 order-1 lg:order-2 aspect-[4/5] bg-gray-100 overflow-hidden shadow-sm">
                        <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000" alt="Brilliance" className="w-full h-full object-cover" />
                    </div>
                </div>
            </section>

            {/* Minimal Footer Signature */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className=" mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-12">
                    <h2 className="text-4xl md:text-5xl serif leading-none">Join the New Era.</h2>
                    <div className="flex space-x-12 opacity-30 grayscale font-serif text-lg tracking-tighter">
                        <span>VOGUE</span>
                        <span>BAZAAR</span>
                        <span>ELLE</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
