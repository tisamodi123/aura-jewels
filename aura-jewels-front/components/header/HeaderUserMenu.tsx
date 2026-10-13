'use client';

import React from 'react';
import Link from 'next/link';
import { User, ShoppingBag, MapPin, LogOut } from 'lucide-react';

interface HeaderUserMenuProps {
  isMounted: boolean;
  token?: string | null;
  userData: any;
  onLogout: () => void;
}

export const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({
  isMounted,
  token,
  userData,
  onLogout,
}) => (
  <div className="group relative">
    <Link
      href="/my-account/profile"
      className="text-[#1A1A1A] hover:text-[#A96D56] transition-colors flex items-center justify-center p-2"
      aria-label="Account"
    >
      <User className="w-[18px] h-[18px] stroke-[1.5]" />
    </Link>
    <div className="absolute top-[100%] right-0 mt-1 w-60 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-gray-100/80 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[110] overflow-hidden">
      <div className="h-[3px] bg-[#A96D56]" />
      {!isMounted || !token ? (
        <div className="p-4 space-y-3">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase font-jakarta font-semibold">
              Welcome to Aura Jewels
            </p>
            <p className="text-[11px] text-gray-500 mt-1 font-jakarta">
              Discover luxury & bespoke jewelry
            </p>
          </div>
          <Link
            href="/sign-in"
            className="block w-full text-center py-2 bg-[#A96D56] text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#995e48] transition-colors duration-300 font-jakarta rounded-sm"
          >
            Log In
          </Link>
          <div className="text-center pt-1">
            <p className="text-[11px] text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-[#A96D56] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="px-4 py-3 bg-gray-50 flex items-center gap-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#A96D56] text-white flex items-center justify-center font-serif text-[13px] font-semibold uppercase shrink-0">
              {userData?.name ? userData.name.charAt(0) : <User className="w-3.5 h-3.5 stroke-[1.5]" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-bold text-gray-800 font-jakarta truncate leading-none uppercase tracking-wide">
                {userData?.name || 'My Account'}
              </p>
              <p className="text-[10px] text-gray-400 font-medium font-jakarta truncate mt-1">
                {userData?.phone ? `+91 ${userData.phone}` : userData?.email || ''}
              </p>
            </div>
          </div>
          <div className="py-1">
            <Link
              href="/my-account/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#A96D56] font-jakarta tracking-wider transition-colors group/item"
            >
              <User className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#A96D56] transition-colors" />
              MY PROFILE
            </Link>
            <Link
              href="/my-account/my-order"
              className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#A96D56] font-jakarta tracking-wider transition-colors group/item"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#A96D56] transition-colors" />
              ORDER HISTORY
            </Link>
            <Link
              href="/my-account/my-address"
              className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#A96D56] font-jakarta tracking-wider transition-colors group/item"
            >
              <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#A96D56] transition-colors" />
              MY ADDRESSES
            </Link>
          </div>
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 font-jakarta tracking-wider transition-colors group/item"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400 group-hover/item:text-red-600 transition-colors" />
              LOGOUT
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default HeaderUserMenu;
