import React from 'react';
import { RefreshCw, PackageCheck, Scale, Clock, CheckCircle2, Pin, Lock } from 'lucide-react';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-neutral-white border border-neutral-border/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] ${className}`}>
        {children}
    </div>
);
const CardHeader = ({
    icon: Icon,
    title,
    tag,
}: {
    icon: React.ElementType;
    title: string;
    tag: string;
}) => (
    <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
            <Icon size={20} className="text-gray-500 flex-shrink-0" strokeWidth={1.5} />
            <h2 className="text-2xl md:text-3xl el-messiri font-normal tracking-wide text-[#1A1A1A]">
                {title}
            </h2>
        </div>
        <span className="text-xs tracking-widest text-[#1A1A1A]/80 font-jakarta font-medium uppercase">
            {tag}
        </span>
    </div>
);

const ExchangeBuybackPage = () => {
    return (
        <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased">

            {/* ── SECTION 1: Hero Header ── */}
            <section className="max-w-3xl mx-auto text-center px-6 py-10 md:py-12">
                <RefreshCw
                    size={28}
                    className="text-[#013D3D] mx-auto mb-6"
                    strokeWidth={1.5}
                />
                <h1 className="text-3xl md:text-4xl lg:text-4xl el-messiri font-normal tracking-wide text-[#1A1A1A] mb-3 leading-snug">
                    Aura Jewels Exchange &amp; Buy-Back Policy
                </h1>
                <p className="text-xs tracking-widest text-[#013D3D] font-jakarta font-medium uppercase mb-6">
                    Timeless Jewellery. Lifelong Value
                </p>
                <p className="text-md text-gray-500 font-jakarta font-light leading-relaxed max-w-2xl mx-auto">
                    Every Aura Jewels creation is crafted to be treasured for years to come. To ensure flexibility
                    and peace of mind, we offer a thoughtfully designed Lifetime Exchange and Lifetime Buy-Back
                    policy — allowing you to upgrade, exchange, or liquidate your jewellery with confidence.
                </p>
            </section>

            {/* ── MAIN CONTENT GRID ── */}
            <div className="max-w-4xl mx-auto px-6 pb-24 space-y-12">

                {/* ── SECTION 2: Lifetime Exchange ── */}
                <Card>
                    <CardHeader
                        icon={RefreshCw}
                        title="Lifetime Exchange"
                        tag="Simple, Flexible & Designed Around You"
                    />

                    <p className="text-sm text-gray-500 font-light leading-relaxed mb-8">
                        You may exchange your Aura Jewels jewellery{' '}
                        <strong className="text-[#1A1A1A] font-semibold">at any time</strong> and receive the
                        applicable value as{' '}
                        <strong className="text-[#1A1A1A] font-semibold">store credit in your Aura Jewels account</strong>,
                        which can be conveniently used for future purchases.
                    </p>

                    {/* Two-column checklist + notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left: What You Need */}
                        <div>
                            <h4 className="text-lg el-messiri font-medium text-[#1A1A1A] mb-4">
                                What You Need
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    <>Jewellery in its <strong className='font-medium text-[#1A1A1A]'>original condition</strong></>,
                                    <>Original <strong className='font-medium text-[#1A1A1A]'>invoice and certificate</strong></>,
                                    <>Successful <strong>quality verification</strong></>,
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-md text-gray-500 font-light">
                                        <CheckCircle2 size={14} className="text-[#013D3D] mt-0.5 flex-shrink-0" strokeWidth={2} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: Important Notes */}
                        <div>
                            <h4 className="text-lg el-messiri font-medium text-[#1A1A1A] mb-4">
                                Important Notes
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    <>Exchange value will be credited to your <strong className='text-[#1A1A1A] font-medium'>Aura Jewels account only</strong></>,
                                    <>Credits are <strong className='text-[#1A1A1A] font-medium'>non transferable</strong> and <strong className='text-[#1A1A1A] font-medium'>cannot be redeemed for cash</strong></>,
                                    <>Store credit may be used toward any eligible future Aura Jewels purchase</>,
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-md text-gray-500 font-light">
                                        <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* ── SECTION 3: Lifetime Buy-Back ── */}
                <Card>
                    <CardHeader
                        icon={PackageCheck}
                        title="Lifetime Buy-Back"
                        tag="Liquidity When You Need It"
                    />

                    <div className="space-y-4 text-sm text-gray-500 font-light leading-relaxed mb-8">
                        <p>
                            Aura Jewels offers a{' '}
                            <strong className="text-[#1A1A1A] font-semibold">Lifetime Buy-Back option</strong>,
                            allowing you to sell eligible jewellery back to us whenever required.
                        </p>
                        <p>
                            Once approved after inspection, the applicable amount will be transferred directly to
                            your <strong className="text-[#1A1A1A] font-semibold">registered bank account.</strong>
                        </p>
                    </div>

                    {/* Processing Timeline highlight box */}
                    <div className="bg-neutral-gray-light rounded-sm px-6 py-5 flex items-start gap-4">
                        <Clock size={18} className="text-gray-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                            <p className="text-xs tracking-widest text-[#1A1A1A] font-jakarta font-medium uppercase mb-1.5">
                                Processing Timeline
                            </p>
                            <p className="text-sm text-gray-500 font-light leading-relaxed">
                                Buy-back settlements are generally completed{' '}
                                <strong className="text-[#1A1A1A] font-semibold">within 15 business days</strong>,
                                subject to successful quality assessment and verification.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* ── SECTION 4: Value Calculation Table ── */}
                <Card>
                    <CardHeader
                        icon={Scale}
                        title="How Your Value Is Calculated"
                        tag=""
                    />

                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left border-collapse text-sm min-w-[400px]">
                            <thead>
                                <tr className="border-b border-neutral-border bg-neutral-gray-light">
                                    <th className="px-4 py-3 text-xs font-jakarta font-semibold tracking-wider text-[#1A1A1A]">Category</th>
                                    <th className="px-4 py-3 text-xs font-jakarta font-semibold tracking-wider text-[#1A1A1A]">Exchange Value</th>
                                    <th className="px-4 py-3 text-xs font-jakarta font-semibold tracking-wider text-[#1A1A1A]">Buy-Back Value</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-500 font-light divide-y divide-neutral-border">
                                {[
                                    {
                                        category: 'Diamond Jewellery',
                                        exchange: '100% Gold Value + up to 100% Diamond Value',
                                        buyback: '100% Gold Value + 80% Diamond Value',
                                    },
                                    {
                                        category: 'Plain Gold Jewellery',
                                        exchange: '100% Gold Value',
                                        buyback: '100% Gold Value',
                                    },
                                    {
                                        category: 'Gold / Silver Coins',
                                        exchange: '100% Gold/Silver Value',
                                        buyback: '100% Gold/Silver Value',
                                    },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-neutral-gray-light/50 transition-colors">
                                        <td className="px-4 py-4 text-[#1A1A1A] font-medium">{row.category}</td>
                                        <td className="px-4 py-4">{row.exchange}</td>
                                        <td className="px-4 py-4">{row.buyback}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                        Final valuation is based on{' '}
                        <strong className="text-[#1A1A1A] font-semibold">prevailing market rates</strong>,
                        product condition, authenticity, and quality assessment at the time of request.
                    </p>
                </Card>

                {/* ── SECTION 5: Two-Column Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Applicable Deductions */}
                    <Card>
                        <h3 className="text-xl md:text-2xl el-messiri font-normal text-[#1A1A1A] mb-3 leading-snug">
                            Applicable Deductions
                        </h3>
                        <p className="text-sm text-gray-500 font-light leading-relaxed mb-5">
                            The following may be deducted where applicable:
                        </p>
                        <ul className="space-y-3">
                            {[
                                <><strong>Making charges</strong></>,
                                <><strong>Taxes &amp; statutory levies</strong></>,
                                <><strong>₹1,000 processing fee</strong></>,
                                <>Discounts, promotional benefits, or offers availed at the time of purchase</>,
                                <>Pending <strong>EMI dues</strong>, if applicable</>,
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 font-light">
                                    <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Products Not Eligible */}
                    <Card>
                        <h3 className="text-xl md:text-2xl el-messiri font-normal text-[#1A1A1A] mb-3 leading-snug">
                            Products Not Eligible
                        </h3>
                        <p className="text-sm text-gray-500 font-light leading-relaxed mb-5">
                            The following items are currently{' '}
                            <strong className="text-[#1A1A1A] font-semibold">not eligible</strong> for exchange or buy-back:
                        </p>
                        <ul className="space-y-3">
                            {[
                                <>Loose diamonds or unset diamonds</>,
                                <>Polki jewellery</>,
                                <>Pearl jewellery</>,
                                <>Coloured gemstones</>,
                                <>Products modified, resized, repaired, or altered by{' '}
                                    <strong className="text-[#1A1A1A] font-semibold">unauthorized third parties</strong></>,
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 font-light">
                                    <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                </div>

                {/* ── SECTION 6: Important Conditions ── */}
                <Card>
                    <CardHeader
                        icon={Pin}
                        title="Important Conditions"
                        tag=""
                    />
                    <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">
                        To process any exchange or buy-back request:
                    </p>
                    <ul className="space-y-4">
                        {[
                            <><strong className="text-[#1A1A1A] font-semibold">Invoice and certificate are mandatory</strong></>,
                            <>Missing certificate(s) may attract <strong className="text-[#1A1A1A] font-semibold">reissuance charges</strong></>,
                            <>Buy-back is applicable only for products with an <strong className="text-[#1A1A1A] font-semibold">invoice value up to ₹4,99,999</strong></>,
                            <>Applicable dues, liabilities, or adjustments may be deducted prior to settlement</>,
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 font-light">
                                <CheckCircle2 size={14} className="text-[#013D3D] mt-0.5 flex-shrink-0" strokeWidth={2} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* ── SECTION 7: Quality Assessment + Fraud Prevention (2-col) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Quality Assessment Process */}
                    <Card className="flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl md:text-2xl el-messiri font-normal text-[#1A1A1A] mb-1 leading-snug">
                                Quality Assessment Process
                            </h3>
                            <p className="text-xs tracking-widest text-gray-500 font-jakarta font-medium uppercase mb-5">
                                Ensuring Authenticity &amp; Transparency
                            </p>
                            <div className="space-y-4 text-sm text-gray-500 font-light leading-relaxed mb-5">
                                <p>
                                    Every submitted product undergoes a{' '}
                                    <strong className="text-[#1A1A1A] font-semibold">detailed quality inspection</strong>{' '}
                                    before valuation.
                                </p>
                                <p>The final value is determined based on:</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    <><strong className="text-[#1A1A1A] font-semibold">Overall condition of the jewellery</strong></>,
                                    <><strong className="text-[#1A1A1A] font-semibold">Authenticity and certification</strong></>,
                                    <>Product integrity and craftsmanship condition</>,
                                    <>Aura Jewels&apos;s internal quality evaluation standards</>,
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 font-light">
                                        <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-xs text-gray-500 font-light leading-relaxed border-t border-neutral-border pt-4">
                            Please note:{' '}
                            <strong className="text-[#1A1A1A] font-semibold">
                                Aura Jewels&apos;s quality assessment shall be considered final and binding.
                            </strong>
                        </p>
                    </Card>

                    {/* Right column: Fraud Prevention + Legal & Compliance stacked */}
                    <div className="flex flex-col gap-6">

                        {/* Fraud Prevention & Security */}
                        <Card>
                            <h3 className="text-xl md:text-2xl el-messiri font-normal text-[#1A1A1A] mb-5 leading-snug">
                                Fraud Prevention &amp; Security
                            </h3>
                            <p className="text-sm text-gray-500 font-light leading-relaxed mb-5">
                                To maintain fairness and authenticity, Aura Jewels reserves the right to reject requests involving:
                            </p>
                            <ul className="space-y-3">
                                {[
                                    <>Product tampering or alteration</>,
                                    <>Fraudulent activity or misuse of policy</>,
                                    <>Incorrect, mismatched, or unauthorized product submissions</>,
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 font-light">
                                        <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Legal & Compliance */}
                        <Card>
                            <CardHeader
                                icon={Lock}
                                title="Legal & Compliance"
                                tag=""
                            />
                            <ul className="space-y-4">
                                {[
                                    <>Final valuation is determined by Aura Jewels and{' '}
                                        <strong className="text-[#1A1A1A] font-semibold">may differ from external market quotations</strong></>,
                                    <><strong className="text-[#1A1A1A] font-semibold">KYC verification</strong>{' '}
                                        may be required for high-value transactions, where applicable by law</>,
                                    <>Aura Jewels reserves the right to{' '}
                                        <strong className="text-[#1A1A1A] font-semibold">verify, approve, modify, or decline requests</strong>{' '}
                                        in accordance with internal policies and quality standards</>,
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 font-light">
                                        <span className="text-gray-500 mt-1 flex-shrink-0">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                    </div>
                </div>

            </div>

            {/* ── Closing Tagline ── */}
            <div className="border-t border-neutral-border max-w-4xl mx-auto px-6 py-12 text-center">
                <p className="text-sm text-gray-500 font-jakarta font-light tracking-wide">
                    Crafted To Complement Your Style — Designed To Feel As Beautiful As It Looks
                </p>
            </div>

        </div>
    );
};

export default ExchangeBuybackPage;
