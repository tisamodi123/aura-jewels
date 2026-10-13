'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Ban, AlertTriangle } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

const ReturnPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased py-16 px-6">
      <div className="max-w-[760px] mx-auto space-y-8 animate-in fade-in duration-1000">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <Image
              src={getImageUrl('/images/icons-svg/32.svg')}
              alt="Return Policy Hero Icon"
              width={24}
              height={24}
              className="h-12 w-12"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-el-messiri tracking-wide text-[#1A1A1A]">
            10-Day Money-Back Guarantee & Returns Policy
          </h1>
          <span className="text-xs tracking-[0.2em] text-[#013D3D] font-semibold uppercase block">
            EFFECTIVE DATE: JUNE 2025 | APPLICABLE: INDIA
          </span>
        </div>

        {/* ─── Card 01: Policy Overview ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
            01 Policy Overview
          </h2>

          <p className="text-sm md:text-lg text-gray-500 font-jakarta leading-relaxed font-light pt-4 border-t border-gray-200/40">
            Aura Jewels offers a 10-Day Money-Back Guarantee on eligible products, allowing customers to request a return and refund within 10 calendar days from the date of confirmed delivery. This policy is subject to the eligibility conditions, quality verification process, and terms set out below.
          </p>
        </div>

        {/* ─── Card 02: Return Window ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            02 Return Window
          </h2>

          <div className="border-t border-gray-200/40 pt-6">
            <div className="overflow-hidden border border-gray-200/60 rounded-sm mb-6">
              <table className="w-full text-left border-collapse text-sm md:text-base">
                <tbody className="text-gray-500 font-jakarta font-light divide-y divide-neutral-border/60">
                  <tr className="hover:bg-[#013D3D]/5 transition-colors">
                    <td className="py-4 px-6 text-[#1A1A1A] align-middle w-1/3 min-w-[120px] ">
                      Return Period
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-jakarta leading-relaxed align-middle">
                      10 calendar days from the date of delivery
                    </td>
                  </tr>
                  <tr className="hover:bg-[#013D3D]/5 transition-colors">
                    <td className="py-4 px-6 text-[#1A1A1A] align-middle ">
                      Request Method
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-jakarta leading-relaxed align-middle">
                      Via Aura Jewels customer support (email / WhatsApp)
                    </td>
                  </tr>
                  <tr className="hover:bg-[#013D3D]/5 transition-colors">
                    <td className="py-4 px-6 text-[#1A1A1A] align-middle ">
                      Pickup Arrangement
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-jakarta leading-relaxed align-middle">
                      Secure reverse pickup arranged by Aura Jewels
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs md:text-sm text-gray-500 font-jakarta opacity-70 italic leading-relaxed">
              Return requests raised after 10 days from the date of delivery will not be accepted under this policy.
            </p>
          </div>
        </div>

        {/* ─── Card 03: Refund Details ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            03 Refund Details
          </h2>

          <div className="border-t border-gray-200/40 pt-6">
            <div className="overflow-hidden border border-gray-200/60 rounded-sm mb-6">
              <table className="w-full text-left border-collapse text-sm md:text-base">
                <tbody className="text-gray-500 font-jakarta font-light divide-y divide-neutral-border/60">
                  <tr className="hover:bg-[#013D3D]/5 transition-colors">
                    <td className="py-4 px-6 text-[#1A1A1A] align-middle w-1/3 min-w-[120px] ">
                      Refund Amount
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-jakarta leading-relaxed align-middle">
                      Full purchase price minus ₹1,000 processing fee
                    </td>
                  </tr>
                  <tr className="hover:bg-[#013D3D]/5 transition-colors">
                    <td className="py-4 px-6 text-[#1A1A1A] align-middle ">
                      Processing Timeline
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-jakarta leading-relaxed align-middle">
                      Within 10 business days of quality verification and approval
                    </td>
                  </tr>
                  <tr className="hover:bg-[#013D3D]/5 transition-colors">
                    <td className="py-4 px-6 text-[#1A1A1A] align-middle ">
                      Prepaid Orders
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-jakarta leading-relaxed align-middle">
                      Credited to the original payment method
                    </td>
                  </tr>
                  <tr className="hover:bg-[#013D3D]/5 transition-colors">
                    <td className="py-4 px-6 text-[#1A1A1A] align-middle ">
                      COD Orders
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-jakarta leading-relaxed align-middle">
                      Processed via bank transfer to the customer&apos;s registered account
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs md:text-sm text-gray-500 font-jakarta opacity-70 italic leading-relaxed">
              Actual credit timelines may vary based on the customer&apos;s bank or payment provider. Aura Jewels is not responsible for delays caused by financial institutions.
            </p>
          </div>
        </div>

        {/* ─── Card 04: EMI Order Refunds ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
            04 EMI Order Refunds
          </h2>

          <div className="pt-4 border-t border-gray-200/40 space-y-4">
            <p className="text-sm md:text-lg text-gray-500 font-jakarta leading-relaxed">
              For purchases made via EMI or financing options, the following additional terms apply:
            </p>

            <ul className="space-y-4 text-sm md:text-lg text-gray-500 font-jakarta list-disc pl-4 marker:text-gray-500 font-jakarta opacity-70">
              <li className="leading-relaxed">
                A deduction of <strong className="text-[#1A1A1A] font-semibold">2% of the refund amount</strong> may apply toward payment processing and financing charges.
              </li>
              <li className="leading-relaxed">
                Refund processing is also subject to the terms and conditions of the respective bank, EMI provider, or financing partner.
              </li>
              <li className="leading-relaxed">
                Aura Jewels shall not be liable for delays or disputes arising from third-party EMI or financing providers.
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Card 05: Products Not Eligible For Return ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
            05 Products Not Eligible For Return
          </h2>

          <div className="pt-4 border-t border-gray-200/40 space-y-4">
            <p className="text-sm md:text-lg text-gray-500 font-jakarta font-light leading-relaxed">
              The following are excluded from the 10-Day Money-Back Guarantee:
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Customised, personalised, or engraved jewellery",
                "Products that have previously been exchanged under any Aura Jewels policy",
                "Items that have been resized, repaired, altered, or modified after delivery",
                "Products that fail Aura Jewels's quality verification assessment",
                "Items returned without original packaging, invoice, or certification documents"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-lg text-gray-500 font-jakarta font-light leading-relaxed">
                  <Ban size={18} className="text-red-500 mt-1 flex-shrink-0" strokeWidth={1.8} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs md:text-sm text-gray-500 font-jakarta opacity-70 italic leading-relaxed pt-4 border-t border-gray-200/20">
              Products ineligible for return may, where applicable, be considered under Aura Jewels&apos;s Buy-Back Policy at Aura Jewels&apos;s discretion.
            </p>
          </div>
        </div>

        {/* ─── Card 06: Return Eligibility Conditions ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)] space-y-6">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
            06 Return Eligibility Conditions
          </h2>

          <div className="pt-4 border-t border-gray-200/40 space-y-4">
            <p className="text-sm md:text-lg text-gray-500 font-jakarta font-light leading-relaxed">
              To qualify for a return under this policy, the product must:
            </p>

            <ul className="space-y-3 pt-2">
              {[
                "Be in unused and unworn condition",
                "Show no signs of damage, alteration, resizing, tampering, or wear",
                "Be returned with all original packaging, jewellery box, invoice, and certificate(s)",
                "Pass Aura Jewels's quality and authenticity assessment"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-lg text-gray-500 font-jakarta font-light leading-relaxed">
                  <Check size={18} className="text-[#013D3D] mt-1 flex-shrink-0" strokeWidth={2} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm md:text-lg text-[#1A1A1A] font-medium leading-relaxed pt-4 border-t border-gray-200/20">
              Aura Jewels reserves the right to reject any return request that does not meet the above conditions.
            </p>
          </div>
        </div>

        {/* ─── Card 07: Quality Verification Process ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            07 Quality Verification Process
          </h2>

          <div className="border-t border-gray-200/40 pt-6 space-y-6">
            <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light">
              All returned items are subject to a thorough inspection upon receipt. The assessment includes evaluation of:
            </p>

            <ul className="space-y-3 text-sm md:text-base text-gray-500 font-jakarta font-light pl-4 list-disc marker:text-gray-500 font-jakarta opacity-70">
              <li className="leading-relaxed">
                <strong className="text-[#1A1A1A] font-semibold">Physical condition</strong> — signs of wear, damage, or modification
              </li>
              <li className="leading-relaxed">
                <strong className="text-[#1A1A1A] font-semibold">Authenticity</strong> — verification against original certification
              </li>
              <li className="leading-relaxed">
                <strong className="text-[#1A1A1A] font-semibold">Completeness</strong> — presence of all required documentation and packaging
              </li>
            </ul>

            <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light">
              Aura Jewels&apos;s quality assessment decision shall be final and binding. If a product is deemed ineligible following inspection, the customer will be notified and the item returned.
            </p>

            <p className="text-xs md:text-base text-gray-500 font-jakarta opacity-70 italic leading-relaxed ">
              Quality verification is typically completed within 5 business days of receiving the returned product.
            </p>
          </div>
        </div>

        {/* ─── Card 08: Customer Responsibilities ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            08 Customer Responsibilities
          </h2>

          <div className="border-t border-gray-200/40 pt-6 space-y-4">
            <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light">
              Customers are responsible for the following throughout the return process:
            </p>

            <ul className="space-y-3 text-sm md:text-base text-gray-500 font-jakarta font-light pl-4 list-disc marker:text-gray-500 font-jakarta opacity-70">
              <li className="leading-relaxed">
                Providing accurate delivery, contact, and bank account details at the time of purchase and return request
              </li>
              <li className="leading-relaxed">
                Carefully inspecting jewellery upon delivery and reporting concerns promptly
              </li>
              <li className="leading-relaxed">
                Ensuring safe and secure packaging of the product prior to handover for reverse pickup
              </li>
              <li className="leading-relaxed">
                Maintaining the security of their Aura Jewels account and credentials
              </li>
              <li className="leading-relaxed">
                Ensuring the correct product is handed over to the pickup agent with all required inclusions
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Card 09: Misuse & Fraud Prevention ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            09 Misuse & Fraud Prevention
          </h2>

          <div className="border-t border-gray-200/40 pt-6 space-y-4">
            <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light">
              Aura Jewels reserves the right to decline or void return requests in cases of:
            </p>

            <ul className="space-y-3">
              {[
                "Suspected misuse, fraud, or abuse of this policy",
                "Repeated or pattern-based return behaviour indicating policy exploitation",
                "Provision of false or misleading information",
                "Maintaining the security of their Aura Jewels account and credentials",
                "Failure to meet eligibility or packaging conditions at the time of pickup"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-500 font-jakarta font-light leading-relaxed">
                  <svg className="w-5 h-5 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L1 21h22L12 2z" fill="#EF4444" />
                    <path d="M12 8v5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="17" r="1.25" fill="white" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Card 10: Policy Amendments ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            10 Policy Amendments
          </h2>

          <div className="border-t border-gray-200/40 pt-6">
            <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light">
              Aura Jewels reserves the right to modify, update, or withdraw this policy at any time without prior notice. The version published on Aura Jewels.in at the time of purchase shall govern the applicable terms for that transaction.
            </p>
          </div>
        </div>

        {/* ─── Card 11: Contact & Support ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl md:text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-4">
            11 Contact & Support
          </h2>

          <div className="border-t border-gray-200/40 pt-6 space-y-6">
            <p className="text-sm md:text-base text-gray-500 font-jakarta leading-relaxed font-light">
              For return requests or policy queries, customers may contact:
            </p>

            <div className="space-y-3">
              <div className="bg-neutral-muted/5 border border-gray-200/30 rounded-sm px-6 py-4 flex items-center">
                <span className="w-1/3 min-w-[120px] font-semibold text-[#1A1A1A] text-sm md:text-base">Email:</span>
                <span className="text-gray-500 font-jakarta text-sm md:text-base">support@aurajewels.com</span>
              </div>
              <div className="bg-neutral-muted/5 border border-gray-200/30 rounded-sm px-6 py-4 flex items-center">
                <span className="w-1/3 min-w-[120px] font-semibold text-[#1A1A1A] text-sm md:text-base">Phone / WhatsApp:</span>
                <span className="text-gray-500 font-jakarta text-sm md:text-base">+91 98765 43210</span>
              </div>
              <div className="bg-neutral-muted/5 border border-gray-200/30 rounded-sm px-6 py-4 flex items-center">
                <span className="w-1/3 min-w-[120px] font-semibold text-[#1A1A1A] text-sm md:text-base">Support Hours:</span>
                <span className="text-gray-500 font-jakarta text-sm md:text-base">Monday–Saturday, 10:00 AM – 6:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReturnPolicyPage;
