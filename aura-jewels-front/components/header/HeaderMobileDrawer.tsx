'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';
import { Heart, User, ShoppingBag, ChevronDown, Phone, MessageCircle, Mail, Clock, X } from 'lucide-react';
import { CONTACT } from '@/lib/siteConfig';
import { trackPhoneClick, trackWhatsAppClick } from '@/services/trackingService';
import { formatBudgetLabel } from '@/lib/priceUtils';

interface NavItem {
  label: string;
  href: string;
  isDirectLink: boolean;
  hasMegaMenu: boolean;
  raw: any;
}

interface HeaderMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  expandedMobileItem: string | null;
  onToggleSubMenu: (label: string) => void;
  isMounted: boolean;
  token?: string | null;
  wishCount: number;
  cartCount: number;
  isIndia: boolean;
  onLogout: () => void;
}

export const HeaderMobileDrawer: React.FC<HeaderMobileDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  expandedMobileItem,
  onToggleSubMenu,
  isMounted,
  token,
  wishCount,
  cartCount,
  isIndia,
  onLogout,
}) => {
  return (
    <div
      className={`fixed inset-0 z-[999] bg-black/40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      onClick={onClose}
    >
      <div
        className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-[110px] h-[34px]">
            <Image
              src={`${PREFIX}/images/Aura Jewels/Logo Png.jpg`}
              alt="Aura Jewels New York"
              fill
              priority
              className="object-contain object-left mix-blend-multiply contrast-[1.1] brightness-[1.03]"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Drawer Navigation Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {navItems.map((item, idx) => {
            const raw = item.raw || {};
            const hrefOf = (r: any, label?: string) => {
              let href = (r?.href || r?.url || '').trim();
              if (label) {
                const l = label.toLowerCase();
                if (l.includes('start with a setting') || l.includes('start with setting')) {
                  return '/rings?mode=builder&diamondType=all';
                }
                if (l.includes('start with color lab diamond') || l.includes('start with a color lab diamond')) {
                  return '/diamonds?diamondType=Color+Lab+Diamond&view=all&builderStep=2&mode=builder';
                }
                if (
                  l.includes('start with lab diamond') ||
                  l.includes('start with a lab diamond') ||
                  l.includes('start with a diamond') ||
                  l.includes('start with diamond')
                ) {
                  return '/diamonds?diamondType=Lab+Grown&view=all&builderStep=2&mode=builder';
                }
              }
              return href;
            };
            const columns = (raw.columns || []).filter(
              (c: any) => (c.links && c.links.length) || (c.groups && c.groups.length)
            );
            const hasExpandable = item.hasMegaMenu !== false && columns.length > 0;
            const isExpanded = expandedMobileItem === item.label;

            return (
              <div key={idx} className={idx === navItems.length - 1 ? '' : 'border-b border-gray-50'}>
                <div className="flex items-center justify-between py-1">
                  {hasExpandable ? (
                    <div className="flex-1 flex items-center justify-between">
                      <Link
                        href={item.href || '#'}
                        className="flex-1 py-3 text-sm md:text-base tracking-[0.1em] text-[#1A1A1A] hover:text-[#A96D56] uppercase font-bold font-jakarta"
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                      <button
                        onClick={() => onToggleSubMenu(item.label)}
                        className="p-3 text-[#1A1A1A] hover:text-[#A96D56] transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                            }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className="block w-full py-3 text-sm md:text-base tracking-[0.1em] text-[#1A1A1A] hover:text-[#A96D56] uppercase font-bold font-jakarta"
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>

                {hasExpandable && (
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    style={{ maxHeight: isExpanded ? '2000px' : '0' }}
                  >
                    <div className="pl-4 space-y-8 pb-4 pt-1">
                      {columns.map((col: any, cIdx: number) => (
                        <div key={col._id || cIdx} className="space-y-4">
                          <h4 className="text-[11px] font-black tracking-[0.2em] text-[#1A1A1A] uppercase border-b border-gray-100 pb-2 font-jakarta">
                            {col.title}
                          </h4>
                          {col.layout === 'grouped' ? (
                            <div className="space-y-6 pl-1">
                              {(col.groups || []).map((g: any, gIdx: number) => (
                                <div key={g._id || gIdx} className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3.5 h-3.5 rounded-full"
                                      style={{ backgroundColor: g.hex || '#C0C0C0' }}
                                    />
                                    <span className="text-[14px] font-bold text-gray-800 font-jakarta">
                                      {formatBudgetLabel(g.label, isIndia)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {(g.options || []).map((opt: any, oIdx: number) => (
                                      <Link
                                        key={oIdx}
                                        href={hrefOf(opt.redirect, opt.label) || '#'}
                                        className="px-3 py-1.5 border border-gray-100 text-[10px] text-gray-500 hover:border-[#A96D56] hover:text-[#A96D56] transition-all font-jakarta uppercase tracking-wider bg-gray-50/50"
                                        onClick={onClose}
                                      >
                                        {formatBudgetLabel(opt.label, isIndia)}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3 pl-1">
                              {(col.links || []).map((l: any, lIdx: number) => (
                                <Link
                                  key={l._id || lIdx}
                                  href={hrefOf(l.redirect, l.label) || '#'}
                                  className="block text-[15px] font-jakarta text-gray-600 hover:text-[#A96D56] transition-colors py-1"
                                  onClick={onClose}
                                >
                                  {formatBudgetLabel(l.label, isIndia)}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {item.href && item.href !== '#' && (
                        <Link
                          href={item.href}
                          className="block text-[13px] font-black tracking-widest text-[#A96D56] uppercase font-jakarta pt-4 border-t border-gray-50"
                          onClick={onClose}
                        >
                          View All {item.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Drawer Footer Actions */}
          <div className="border-t border-gray-100 py-6 mt-8 space-y-8">
            <div className="space-y-4">
              {!isMounted || !token ? (
                <Link
                  href="/sign-in"
                  onClick={onClose}
                  className="flex items-center gap-4 text-gray-700 hover:text-[#A96D56] transition-colors group"
                >
                  <User className="w-5 h-5 stroke-[1.5] text-gray-400 group-hover:text-[#A96D56]" />
                  <span className="text-[13px] font-black tracking-[0.15em] uppercase font-jakarta">
                    Sign In / Register
                  </span>
                </Link>
              ) : (
                <Link
                  href="/my-account/profile"
                  onClick={onClose}
                  className="flex items-center gap-4 text-gray-700 hover:text-[#A96D56] transition-colors group"
                >
                  <User className="w-5 h-5 stroke-[1.5] text-gray-400 group-hover:text-[#A96D56]" />
                  <span className="text-[13px] font-black tracking-[0.15em] uppercase font-jakarta">
                    My Account
                  </span>
                </Link>
              )}

              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center gap-4 text-gray-700 hover:text-[#A96D56] transition-colors group"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 stroke-[1.5] text-gray-400 group-hover:text-[#A96D56]" />
                  {wishCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#A96D56] text-white text-[9px] font-bold min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center font-sans">
                      {wishCount}
                    </span>
                  )}
                </div>
                <span className="text-[13px] font-black tracking-[0.15em] uppercase font-jakarta">
                  Wishlist
                </span>
              </Link>

              {isIndia && (
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-4 text-gray-700 hover:text-[#A96D56] transition-colors group"
                >
                  <div className="relative">
                    <ShoppingBag className="w-5 h-5 stroke-[1.5] text-gray-400 group-hover:text-[#A96D56]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#A96D56] text-white text-[9px] font-bold min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center font-sans">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-black tracking-[0.15em] uppercase font-jakarta">
                    Cart
                  </span>
                </Link>
              )}

              {isMounted && token && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex items-center gap-4 text-red-600 hover:text-red-700 transition-colors group w-full text-left pt-2"
                >
                  <X className="w-5 h-5 stroke-[1.5] text-red-400 group-hover:text-red-600" />
                  <span className="text-[13px] font-black tracking-[0.15em] uppercase font-jakarta">
                    Logout
                  </span>
                </button>
              )}

              {/* Contact Information */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="text-[11px] font-bold tracking-[0.2em] text-gray-900 uppercase font-jakarta">
                  Need Help?
                </h4>
                <div className="space-y-4">
                  <a
                    href={CONTACT.phoneHref}
                    // onClick={() => trackPhoneClick("Header Mobile Drawer")}
                    className="flex items-center gap-4 group"
                  >
                    <Phone className="w-5 h-5 stroke-[1.5] text-gray-400 group-hover:text-[#A96D56]" />
                    <span className="text-[13px] font-jakarta font-semibold text-gray-700 group-hover:text-[#A96D56] transition-colors">
                      {CONTACT.phone}
                    </span>
                  </a>
                  <a
                    href={CONTACT.whatsappHref}
                    // onClick={() => trackWhatsAppClick("Header Mobile Drawer")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <MessageCircle className="w-5 h-5 stroke-[1.5] text-gray-400 group-hover:text-[#A96D56]" />
                    <span className="text-[13px] font-jakarta font-semibold text-gray-700 group-hover:text-[#A96D56] transition-colors">
                      WhatsApp us
                    </span>
                  </a>
                  <a href={CONTACT.emailHref} className="flex items-center gap-4 group">
                    <Mail className="w-5 h-5 stroke-[1.5] text-gray-400 group-hover:text-[#A96D56]" />
                    <span className="text-[13px] font-jakarta font-semibold text-gray-700 group-hover:text-[#A96D56] transition-colors">
                      {CONTACT.email}
                    </span>
                  </a>
                  <div className="flex items-center gap-4 text-gray-500">
                    <Clock className="w-5 h-5 stroke-[1.5] text-gray-400" />
                    <span className="text-[12px] font-jakarta">{CONTACT.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMobileDrawer;
