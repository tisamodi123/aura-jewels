'use client';
import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import ContactForm from './ContactForm';
import { CONTACT } from '@/lib/siteConfig';

export default function GetInTouchPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white min-h-screen py-10 md:py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <span className="block text-xs uppercase tracking-[0.3em] font-semibold text-gray-500 font-jakarta mb-6">
            Concierge Service
          </span>
          <h1 className="font-el-messiri text-4xl md:text-5xl text-[#1A1A1A] font-normal mb-6">
            Get in Touch
          </h1>
          <p className="text-gray-500 font-jakarta font-light max-w-xl mx-auto">
            Our diamond experts and design consultants are available to assist you with bespoke commissions, inquiries, or order support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h3 className="font-el-messiri text-2xl text-[#1A1A1A] mb-6">Contact Information</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gray-500 font-jakarta opacity-60 mt-1" />
                  <div>
                    <span className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A] mb-1">Phone</span>
                    <a href={CONTACT.phoneHref} className="text-gray-500 font-jakarta font-light hover:text-[#013D3D] transition-colors">{CONTACT.phone}</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-gray-500 font-jakarta opacity-60 mt-1" />
                  <div>
                    <span className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A] mb-1">Email</span>
                    <a href={CONTACT.emailHref} className="text-gray-500 font-jakarta font-light hover:text-[#013D3D] transition-colors">{CONTACT.email}</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gray-500 font-jakarta opacity-60 mt-1" />
                  <div>
                    <span className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A] mb-1">Address</span>
                    <p className="text-gray-500 font-jakarta font-light">
                      Plot No. 102, Bandra Kurla Complex,<br/>Bandra East<br/>Mumbai - 400051, Maharashtra, India
                      {/* <br />(Visits by appointment only for bespoke clients) */}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <h3 className="font-el-messiri text-2xl text-[#1A1A1A] mb-4">Hours of Operation</h3>
              <p className="text-gray-500 font-jakarta font-light text-sm mb-2">{CONTACT.hours}</p>
              <p className="text-gray-500 font-jakarta font-light text-sm">Sunday: Closed</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white">
            {submitted ? (
              <div className="text-center py-12 animate-in fade-in duration-700">
                <h3 className="font-el-messiri text-2xl text-[#1A1A1A] mb-4">Message Received</h3>
                <p className="text-gray-500 font-jakarta font-light">Thank you for reaching out. Aura Jewels concierge will contact you within 24 hours.</p>
              </div>
            ) : (
              <ContactForm onSuccess={() => setSubmitted(true)} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
