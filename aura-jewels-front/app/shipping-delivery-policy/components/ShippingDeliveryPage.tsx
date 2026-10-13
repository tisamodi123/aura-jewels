'use client';

import React from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { Ban, Phone, AlertTriangle } from 'lucide-react';

const ShippingDeliveryPage = () => {
  return (
    <div className="min-h-screen bg-neutral-white text-neutral-dark antialiased py-16 px-6">
      <div className="max-w-[760px] mx-auto space-y-8 animate-in fade-in duration-1000">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Image
              src={getImageUrl('/images/home/Free-Shipping.svg')}
              alt="Shipping & Delivery Hero Icon"
              width={48}
              height={48}
              className="h-12 w-12 brand-icon-filter"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-neutral-dark">
            Shipping & Delivery Policy
          </h1>
          <span className="text-xs tracking-[0.2em] text-brand font-semibold uppercase block">
            SECURE, INSURED, AND COMPLIMENTARY.
          </span>
        </div>

        {/* ─── Card 01: Shipping Coverage & Charges ─── */}
        <div className="bg-neutral-white border border-neutral-border/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-wide text-neutral-dark">
            01 Shipping Coverage & Charges
          </h2>

          <div className="pt-4 border-t border-neutral-border/40 space-y-4">
            <p className="text-sm md:text-lg text-neutral-muted leading-relaxed font-light">
              Aura Jewels offers <strong className="text-neutral-dark font-semibold">complimentary shipping</strong> on all orders delivered within India. No minimum order value is required to qualify for free shipping.
            </p>
            <p className="text-sm md:text-lg text-neutral-muted leading-relaxed font-light">
              International shipping is currently unavailable. All orders are dispatched exclusively to addresses within the Republic of India.
            </p>
          </div>
        </div>

        {/* ─── Card 02: Delivery Timelines ─── */}
        <div className="bg-neutral-white border border-neutral-border/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-wide text-neutral-dark mb-4">
            02 Delivery Timelines
          </h2>

          <div className="border-t border-neutral-border/40 pt-6">
            <p className="text-sm md:text-base text-neutral-muted leading-relaxed font-light mb-6">
              Estimated delivery timelines are as follows:
            </p>

            <div className="overflow-hidden border border-neutral-border/60 rounded-sm mb-6">
              <table className="w-full text-left border-collapse text-sm md:text-base">
                <thead>
                  <tr className="bg-neutral-muted/5 border-b border-neutral-border/60">
                    <th className="py-4 px-6 text-neutral-dark font-semibold text-xs md:text-sm uppercase tracking-wider w-1/2">
                      Order Type
                    </th>
                    <th className="py-4 px-6 text-neutral-dark font-semibold text-xs md:text-sm uppercase tracking-wider w-1/2">
                      Estimated Delivery Timeline
                    </th>
                  </tr>
                </thead>
                <tbody className="text-neutral-muted font-light divide-y divide-neutral-border/60">
                  <tr className="hover:bg-neutral-brand-light/20 transition-colors">
                    <td className="py-4 px-6 text-neutral-dark align-middle font-medium">
                      Ready-to-Ship Products
                    </td>
                    <td className="py-4 px-6 text-neutral-muted leading-relaxed align-middle">
                      48–72 hours from dispatch confirmation
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-brand-light/20 transition-colors">
                    <td className="py-4 px-6 text-neutral-dark align-middle font-medium">
                      Made-to-Order / Custom
                    </td>
                    <td className="py-4 px-6 text-neutral-muted leading-relaxed align-middle">
                      Up to 20 business days from order confirmation
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs md:text-sm text-neutral-muted/70 italic leading-relaxed">
              <strong className="font-semibold not-italic text-neutral-dark">Note:</strong> Business days exclude Sundays and public holidays. Timelines are estimates and may vary based on delivery location, customisation complexity, or unforeseen logistical circumstances. Aura Jewels shall not be held liable for delays caused by factors beyond its reasonable control.
            </p>
          </div>
        </div>

        {/* ─── Card 03: Dispatch & Transit ─── */}
        <div className="bg-neutral-white border border-neutral-border/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-wide text-neutral-dark">
            03 Dispatch & Transit
          </h2>

          <div className="pt-4 border-t border-neutral-border/40 space-y-4">
            <p className="text-sm md:text-lg text-neutral-muted leading-relaxed font-light">
              All orders are dispatched through trusted and verified logistics partners. Every shipment is:
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Fully insured for transit value",
                "Securely packed to prevent damage or tampering",
                "Accompanied by a dispatch confirmation and tracking details"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-lg text-neutral-muted font-light leading-relaxed">
                  <span className="text-brand mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm md:text-lg text-neutral-muted leading-relaxed font-light pt-2">
              Tracking information will be shared via registered email and/or SMS upon dispatch.
            </p>
          </div>
        </div>

        {/* ─── Card 04: Signature Packaging ─── */}
        <div className="bg-neutral-white border border-neutral-border/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-wide text-neutral-dark">
            04 Signature Packaging
          </h2>

          <div className="pt-4 border-t border-neutral-border/40 space-y-4">
            <p className="text-sm md:text-lg text-neutral-muted leading-relaxed font-light">
              Every Aura Jewels order is presented in our signature luxury packaging, designed to protect the integrity of the creation and enhance the unboxing experience.
            </p>

            <p className="text-sm md:text-lg text-neutral-muted font-light leading-relaxed">
              Each shipment includes:
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Tamper-evident, sealed outer packaging",
                "Signature Aura Jewels jewellery box",
                "Product certificate and authenticity documentation (where applicable)",
                "Invoice and purchase record"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-lg text-neutral-muted font-light leading-relaxed">
                  <span className="text-brand mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Card 05: Delivery Acceptance & Inspection ─── */}
        <div className="bg-neutral-white border border-neutral-border/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-wide text-neutral-dark">
            05 Delivery Acceptance & Inspection
          </h2>

          <div className="pt-4 border-t border-neutral-border/40 space-y-4">
            <p className="text-sm md:text-lg text-neutral-muted leading-relaxed font-light">
              Aura Jewels strongly recommends that customers inspect all packages prior to accepting delivery. Customers should verify the following at the time of receipt:
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Outer packaging is intact, sealed, and shows no signs of tampering or damage",
                "The shipment matches the order details and delivery address"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-lg text-neutral-muted font-light leading-relaxed">
                  <span className="text-brand mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Warning Callout Box */}
            <div className="bg-neutral-muted/5 border border-neutral-border/30 rounded-sm p-6 md:p-8 space-y-4 mt-6">
              <p className="text-sm md:text-base text-neutral-dark font-medium leading-relaxed">
                If the packaging appears <strong className="font-semibold text-neutral-dark">damaged, tampered with, or suspicious</strong> in any manner, the customer must:
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm md:text-base text-neutral-muted font-light leading-relaxed">
                  <Ban size={18} className="text-red-500 mt-1 flex-shrink-0" strokeWidth={2} />
                  <span>Refuse acceptance of the delivery</span>
                </li>
                <li className="flex items-start gap-3 text-sm md:text-base text-neutral-muted font-light leading-relaxed">
                  <Phone size={18} className="text-brand mt-1 flex-shrink-0" strokeWidth={2} />
                  <span>Immediately notify Aura Jewels&apos;s customer support team</span>
                </li>
                <li className="flex items-start gap-3 text-sm md:text-base text-neutral-muted font-light leading-relaxed">
                  <AlertTriangle size={18} className="text-amber-500 mt-1 flex-shrink-0" strokeWidth={2} />
                  <span>Report the issue to the delivery partner at the time of refusal</span>
                </li>
              </ul>
            </div>

            <p className="text-xs md:text-sm text-neutral-muted/70 italic leading-relaxed pt-2">
              Acceptance of a visibly damaged or tampered package without timely reporting may affect eligibility for claims, replacements, or refunds.
            </p>
          </div>
        </div>

        {/* ─── Card 06: Reverse Pickup — Returns, Exchanges & Buy-Back ─── */}
        <div className="bg-neutral-white border border-neutral-border/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-wide text-neutral-dark">
            06 Reverse Pickup — Returns, Exchanges & Buy-Back
          </h2>

          <div className="pt-4 border-t border-neutral-border/40 space-y-4">
            <p className="text-sm md:text-lg text-neutral-muted leading-relaxed font-light">
              For all eligible return, exchange, or buy-back requests, Aura Jewels arranges a secure reverse pickup from the customer&apos;s delivery address. The reverse pickup process is fully insured and complimentary, ensuring your precious items are protected throughout their journey back to us.
            </p>

            <p className="text-sm md:text-lg text-neutral-muted font-light leading-relaxed">
              To ensure a smooth pickup process, customers must:
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Keep the jewellery in its original, unused condition inside the signature Aura Jewels box",
                "Include the original invoice, product certificate, and authenticity documentation",
                "Securely pack and seal the package before handing it over to our authorized pickup representative"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-lg text-neutral-muted font-light leading-relaxed">
                  <span className="text-brand mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShippingDeliveryPage;
