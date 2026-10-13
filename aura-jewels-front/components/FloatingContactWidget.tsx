'use client';

import React, { useState } from 'react';
import { Phone, X, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { CONTACT, whatsappLink } from '@/lib/siteConfig';

import { trackPhoneClick, trackWhatsAppClick } from '@/services/trackingService';

const FloatingContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/45 backdrop-blur-[1.5px] z-[9998] animate-in fade-in duration-300"
        />
      )}

      <div className="fixed bottom-10 right-8 z-[9999] flex flex-col items-end gap-3 select-none transition-all duration-500 floating-contact-widget">
        {/* Expanded Menu Options */}
        {isOpen && (
          <div className="flex flex-col gap-2 w-64 md:w-72 animate-in fade-in slide-in-from-right-5 duration-300">
            {/* Talk to our Experts */}
            <a
              href={CONTACT.phoneHref}
              // onClick={() => trackPhoneClick("Floating Widget")}
              className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200/80 text-gray-700 py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] group shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#EC407A]" />
              <span className="font-jakarta text-[13px] font-semibold text-gray-700 tracking-wide group-hover:text-gray-900">
                Talk to our Experts
              </span>
            </a>

            {/* Chat on Whatsapp */}
            <a
              href={whatsappLink('Hi Aura Jewels, I am looking for assistance.')}
              // onClick={() => trackWhatsAppClick("Floating Widget")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200/80 text-gray-700 py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] group shadow-sm"
            >
              <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
              <span className="font-jakarta text-[13px] font-semibold text-gray-700 tracking-wide group-hover:text-gray-900">
                Chat on Whatsapp
              </span>
            </a>
          </div>
        )}

        {/* Toggle Button (Always in the same spot) */}
        <div className="relative">
          {/* Pulsing Highlight Rings - Only shown when closed to draw attention */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-[#A96D56]/20 animate-ping pointer-events-none scale-125" />
              <span className="absolute -inset-1 rounded-full border border-[#A96D56]/30 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group relative flex h-12 w-12 items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95 rounded-full border border-white/20 shadow-xl ${isOpen ? 'bg-[#E57373] hover:bg-red-500 text-white' : 'bg-[#A96D56] text-white'
              }`}
            aria-label={isOpen ? "Close contact menu" : "Open contact menu"}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

            {isOpen ? (
              <X className="h-6 w-6 stroke-[2.5] transition-transform duration-300" />
            ) : (
              <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingContactWidget;