
import { Mail, Phone, MapPin, Share2 } from 'lucide-react';
import B2bInquiryForm from './B2bInquiryForm';

export default function B2bInquiry() {
    const contactDetails = [
        {
            icon: <Share2 className="w-4 h-4 text-[#B57A5A] stroke-[1.25]" />,
            label: 'Company Name',
            value: 'Aura Jewels - Powered by Aura Jewels Diamonds LLP',
        },
        {
            icon: <Mail className="w-4 h-4 text-[#B57A5A] stroke-[1.25]" />,
            label: 'Email Address',
            value: 'support@aurajewels.com',
            href: 'mailto:support@aurajewels.com',
        },
        {
            icon: <Phone className="w-4 h-4 text-[#B57A5A] stroke-[1.25]" />,
            label: 'Phone Number',
            value: '+91 98765 43210',
            href: 'tel:+919876543210',
        },
        {
            icon: <MapPin className="w-4 h-4 text-[#B57A5A] stroke-[1.25]" />,
            label: '',
            value: "Plot No. 102, Bandra Kurla Complex, Bandra East, Mumbai - 400051, Maharashtra, India",
        },
    ];

    return (
        <div className="bg-white py-12 md:py-20">
            <div className="max-w-6xl mx-auto px-6">

                {/* Page Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
                    <h1 className="font-el-messiri text-4xl md:text-5xl text-black font-normal tracking-wide mb-6">
                        B2B Partnership Inquiry
                    </h1>
                    <p className="text-gray-500 font-jakarta text-sm md:text-base font-light leading-relaxed">
                        Join hands with Aura Jewels to bring our exquisite lab-grown diamond jewellery to a wider audience.
                        Fill in your details below, and our team will get back to you with partnership opportunities.
                    </p>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                    {/* Left Column: Direct Contact Info */}
                    <div className="lg:col-span-4 space-y-8 px-6 md:px-8 py-0">
                        <h3 className="font-el-messiri text-2xl text-black font-normal tracking-wide mb-2">
                            Direct Contact
                        </h3>

                        <div className="space-y-4">
                            {contactDetails.map((item, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex-shrink-0 flex justify-center">
                                        {item.icon}
                                    </div>
                                    <div className="space-y-1">
                                        {/* <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                                            {item.label}
                                        </span> */}
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                className="text-[#1A1A1A] font-jakarta text-sm font-light hover:text-[#B57A5A] transition-colors duration-200"
                                            >
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="text-[#1A1A1A] font-jakarta text-sm font-light leading-relaxed">
                                                {item.value}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Reusable Form */}
                    <div className="lg:col-span-8">
                        <B2bInquiryForm variant="underline" />
                    </div>

                </div>
            </div>
        </div>
    );
}
