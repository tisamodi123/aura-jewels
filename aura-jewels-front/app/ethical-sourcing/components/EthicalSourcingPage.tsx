import React from 'react';
import Link from 'next/link';
import { ShieldCheck, BadgeCheck, Gem, Infinity as InfinityIcon } from 'lucide-react';

const STEPS = [
  { title: 'Sourcing', text: 'Diamonds procured only from suppliers who comply with the Kimberley Process and international ethical trade standards.' },
  { title: 'Grading & Selection', text: 'Every diamond evaluated against the 4Cs with precision and consistency, so nothing is misrepresented.' },
  { title: 'Crafting', text: 'Jewellery made by skilled artisans, with quality checks at every stage of production.' },
  { title: 'Certification', text: 'Independent verification before a piece ever reaches you.' },
];

const EthicalSourcingPage = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased">

      {/* ─── Hero ─── */}
      <section className="max-w-[900px] mx-auto px-6 pt-16 pb-12 text-center space-y-5">
        <span className="text-xs tracking-[0.2em] text-[#B57A5A] font-semibold uppercase block">
          Ethical Sourcing &amp; Sustainability
        </span>
        <h1 className="text-3xl md:text-5xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] leading-tight">
          Every Diamond Has a Journey<br className="hidden md:block" /> Ours Begins With Integrity
        </h1>
        <p className="text-gray-500 leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto pt-2">
          At Aura Jewels, sourcing a diamond isn&apos;t just a transaction — it&apos;s a responsibility. Before a
          diamond ever reaches your hand, we make sure its journey from the earth to your everyday life is
          one you can trust completely.
        </p>
      </section>

      <div className="max-w-[900px] mx-auto px-6 pb-24 space-y-12">

        {/* ─── Section 1: Our Sourcing Promise ─── */}
        <section className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#B57A5A] shrink-0" />
            <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A]">
              Our Sourcing Promise
            </h2>
          </div>
          <span className="text-xs tracking-[0.15em] text-gray-500 uppercase font-bold block mb-6">
            Conflict-Free. Always.
          </span>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light mb-4">
            Every diamond that carries the Aura Jewels name is <strong className="text-[#1A1A1A] font-semibold">100% conflict-free</strong>,
            sourced in full compliance with the <strong className="text-[#1A1A1A] font-semibold">Kimberley Process Certification Scheme</strong> — the
            international standard that prevents &quot;blood diamonds&quot; from entering the legitimate diamond trade.
          </p>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light">
            We don&apos;t see this as an add-on to our business. It&apos;s the foundation of it. Long before Aura Jewels
            existed as a jewellery brand, our team was grading and sourcing rough diamonds — which means ethical
            sourcing isn&apos;t a policy we adopted; it&apos;s the standard we started with.
          </p>
        </section>

        {/* ─── Section 2: Certified, Not Just Claimed ─── */}
        <section className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-3 mb-1">
            <BadgeCheck className="w-5 h-5 text-[#B57A5A] shrink-0" />
            <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A]">
              Certified, Not Just Claimed
            </h2>
          </div>
          <span className="text-xs tracking-[0.15em] text-gray-500 uppercase font-bold block mb-6">
            Transparency You Can Verify
          </span>
          {/* <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light mb-4">
            We believe trust shouldn&apos;t rest on our word alone. That&apos;s why every diamond above a specified
            carat weight comes with third-party certification from globally recognised grading laboratories —
            including <strong className="text-[#1A1A1A] font-semibold">IGI and GIA</strong> — so you always know exactly what you&apos;re
            wearing: verified carat, cut, clarity, and colour, backed by an independent authority, not just our own claim.
          </p>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light mb-4">
            Our jewellery is also <strong className="text-[#1A1A1A] font-semibold">BIS Hallmarked</strong>, so the same standard of
            verification applies to the gold and metal in every piece, not just the diamond.
          </p> */}
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light mb-4">
            We believe trust shouldn&apos;t rest on our word alone. That&apos;s why every diamond above a specified
            carat weight comes with third-party certification from globally recognised grading laboratories —
            including <strong className="text-[#1A1A1A] font-semibold">IGI, GIA, and GSI</strong> — so you always know exactly what you&apos;re
            wearing: verified carat, cut, clarity, and colour, backed by an independent authority, not just our own claim.
          </p>

          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light mb-4">
            Our jewellery is also <strong className="text-[#1A1A1A] font-semibold">BIS Hallmarked</strong>, so the same standard of
            verification applies to the gold and metal in every piece, not just the diamond.
          </p>
          <p className="text-sm md:text-base text-[#1A1A1A] font-medium">
            In short: what&apos;s on the certificate is what&apos;s on your finger.
          </p>
        </section>

        {/* ─── Section 3: Responsible at Every Step ─── */}
        <section className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-3 mb-1">
            <Gem className="w-5 h-5 text-[#B57A5A] shrink-0" />
            <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A]">
              Responsible at Every Step
            </h2>
          </div>
          <span className="text-xs tracking-[0.15em] text-gray-500 uppercase font-bold block mb-6">
            From Rough Diamond to Finished Piece
          </span>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light mb-8">
            Ethical sourcing doesn&apos;t end once a diamond is mined. At Aura Jewels, we carry that same standard of
            responsibility through every stage:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.title} className="border border-gray-100 rounded-sm p-5 bg-gray-50/40">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[#B57A5A] font-el-messiri text-lg">{i + 1}.</span>
                  <h3 className="text-[#1A1A1A] font-semibold text-sm">{s.title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-light">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light">
            Nothing about this process is outsourced to guesswork. It&apos;s the same discipline we built our name
            on, applied to every single piece we make.
          </p>
        </section>

        {/* ─── Section 4: Built to Last, Made to Matter ─── */}
        <section className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-3 mb-1">
            <InfinityIcon className="w-5 h-5 text-[#B57A5A] shrink-0" />
            <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A]">
              Built to Last, Made to Matter
            </h2>
          </div>
          <span className="text-xs tracking-[0.15em] text-gray-500 uppercase font-bold block mb-6">
            Sustainability Beyond the Diamond
          </span>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light mb-4">
            Diamonds are, by nature, one of the most enduring materials on earth — and we believe the jewellery
            built around them should be too. That&apos;s why Aura Jewels pieces are designed for everyday wear and built
            for a lifetime, not for a season or a single occasion. Fewer disposable pieces, more jewellery you&apos;ll
            actually keep wearing — that&apos;s sustainability in practice, not just in messaging.
          </p>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light">
            {/* We also stand behind what we make with our Lifetime Value and warranty
            support</strong>, so your diamond&apos;s journey with you doesn&apos;t end at checkout — it continues for as long as
            you wear it. */}

            We also stand behind what we make with our <strong className="text-[#1A1A1A] font-semibold">enduring value</strong> and <strong className="text-[#1A1A1A] font-semibold">dedicated warranty support</strong>, ensuring your diamond's journey with you is fully cared for long after checkout.
          </p>
        </section>

        {/* ─── Section 5: Why This Matters to Us ─── */}
        <section className="bg-[#B57A5A] text-white rounded-sm p-8 md:p-12">
          <h2 className="text-2xl font-el-messiri font-normal tracking-wide mb-6">
            Why This Matters to Us
          </h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed font-light mb-6">
            At Aura Jewels, our values aren&apos;t a marketing layer — they&apos;re where we started. Integrity, Ethics, and
            Transparency aren&apos;t words we added to sound responsible; they&apos;re the same principles our team
            practiced back when our work began and ended with grading polished diamonds, long before &quot;Aura Jewels&quot; was a
            name on a jewellery box.
          </p>
          <blockquote className="border-l-2 border-white/40 pl-5 my-6 text-base md:text-lg font-el-messiri italic text-white leading-relaxed">
            &quot;We are not creating another jewellery brand. We are creating a movement to make diamonds a part of
            everyday life for every person who has always dream't of wearing them.&quot;
          </blockquote>
          <p className="text-sm md:text-base text-white/80 leading-relaxed font-light">
            That movement only works if it&apos;s built on trust — so we&apos;ve made sure it is.
          </p>
        </section>

        {/* ─── Closing CTA ─── */}
        <section className="text-center pt-4 space-y-6">
          <h2 className="text-2xl md:text-3xl font-el-messiri font-normal tracking-wide text-[#1A1A1A]">
            Wear It With Confidence
          </h2>
          {/* <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light max-w-2xl mx-auto">
            Every Aura Jewels diamond comes with a story you can verify — not just one we tell you. Explore our
            collections, knowing exactly where your diamond came from and exactly what it&apos;s worth.
          </p> */}
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-light max-w-2xl mx-auto">
            Every Aura Jewels diamond is chosen with exceptional care and craftsmanship. Explore our collections with confidence, knowing each piece is thoughtfully created to deliver lasting beauty, quality, and value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/collections"
              className="bg-[#B57A5A] text-white hover:bg-[#8B5E45] transition-colors py-3.5 px-8 text-xs font-semibold uppercase tracking-widest rounded-sm"
            >
              Explore Our Collections
            </Link>
            {/* <Link
              href="/policies/diamond-certification-policy"
              className="border border-[#B57A5A] text-[#B57A5A] hover:bg-[#B57A5A]/5 transition-colors py-3.5 px-8 text-xs font-semibold uppercase tracking-widest rounded-sm"
            >
              View Certification Details
            </Link> */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EthicalSourcingPage;
