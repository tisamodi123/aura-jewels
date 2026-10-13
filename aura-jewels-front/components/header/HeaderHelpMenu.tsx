'use client';

import React from 'react';
import { Phone, MessageCircle, Mail, Clock } from 'lucide-react';
import { CONTACT } from '@/lib/siteConfig';

import { trackPhoneClick, trackWhatsAppClick } from '@/services/trackingService';

interface HeaderHelpMenuProps {
  isMobile?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const HeaderHelpMenu: React.FC<HeaderHelpMenuProps> = ({
  isMobile = false,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    className={`${isMobile ? 'fixed inset-x-4 top-20' : 'absolute top-[100%] right-0 mt-1'
      } w-[290px] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-stone-100 rounded-sm z-[120] transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden`}
    onMouseEnter={!isMobile ? onMouseEnter : undefined}
    onMouseLeave={!isMobile ? onMouseLeave : undefined}
  >
    <div className="h-[3px] bg-[#A96D56]" />
    <div className="py-5 px-6">
      <div className="text-center pb-3">
        <h3 className="text-[12px] font-bold font-jakarta uppercase text-[#A96D56] tracking-[0.2em]">
          NEED HELP?
        </h3>
        <div className="w-full h-[1px] bg-stone-100 mt-2.5 mx-auto" />
      </div>
      <div className="space-y-3.5 pt-1.5">
        <a
          href={CONTACT.phoneHref}
          // onClick={() => trackPhoneClick("Header Help Menu")}
          className="flex items-center gap-4 group w-full"
        >
          <div className="w-9 h-9 rounded-full bg-stone-100/70 flex items-center justify-center flex-shrink-0 group-hover:bg-[#A96D56]/10 transition-colors">
            <Phone className="w-4 h-4 stroke-[1.5] text-stone-600 group-hover:text-[#A96D56] transition-colors" />
          </div>
          <span className="text-[12.5px] font-jakarta font-bold text-stone-700 group-hover:text-[#A96D56] transition-colors tracking-wide">
            {CONTACT.phone}
          </span>
        </a>
        <a
          href={CONTACT.whatsappHref}
          // onClick={() => trackWhatsAppClick("Header Help Menu")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 group w-full"
        >
          <div className="w-9 h-9 rounded-full bg-stone-100/70 flex items-center justify-center flex-shrink-0 group-hover:bg-[#A96D56]/10 transition-colors">
            <MessageCircle className="w-4 h-4 stroke-[1.5] text-stone-600 group-hover:text-[#A96D56] transition-colors" />
          </div>
          <span className="text-[12.5px] font-jakarta font-bold text-stone-700 group-hover:text-[#A96D56] transition-colors tracking-wide">
            WhatsApp us
          </span>
        </a>
        <a href={CONTACT.emailHref} className="flex items-center gap-4 group w-full">
          <div className="w-9 h-9 rounded-full bg-stone-100/70 flex items-center justify-center flex-shrink-0 group-hover:bg-[#A96D56]/10 transition-colors">
            <Mail className="w-4 h-4 stroke-[1.5] text-stone-600 group-hover:text-[#A96D56] transition-colors" />
          </div>
          <span className="text-[12.5px] font-jakarta font-bold text-stone-700 group-hover:text-[#A96D56] transition-colors tracking-wide break-all">
            {CONTACT.email}
          </span>
        </a>
        <div className="flex items-center gap-4 w-full">
          <div className="w-9 h-9 rounded-full bg-stone-100/70 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 stroke-[1.5] text-stone-500" />
          </div>
          <span className="text-[11.5px] font-jakarta font-medium text-stone-400 leading-tight">
            {CONTACT.hours}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default HeaderHelpMenu;
