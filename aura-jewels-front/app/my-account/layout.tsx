'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, ShoppingBag, MapPin, Ticket, Settings, LogOut, Menu, X, Sparkles, MessageSquare, Wallet } from 'lucide-react';
import { getToken, getUser } from '@/services/clientCookies';
import { useGlobleStore } from '@/store/globleStore';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';
import { logout } from '@/lib/commonApi';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/sign-in');
        } else {
            setUser(getUser());
        }

        const handleCookieChange = () => {
            setUser(getUser());
        };
        window.addEventListener('cookie-user-change', handleCookieChange);
        return () => {
            window.removeEventListener('cookie-user-change', handleCookieChange);
        };
    }, [router]);

    const { country } = useGlobleStore();
    const isIndia = country === DEFAULT_COUNTRY;

    const menuItems = [
        { id: 'profile', label: 'PERSONAL INFORMATION', icon: User, href: '/my-account/profile' },
        { id: 'my-order', label: 'ORDER HISTORY', icon: ShoppingBag, href: '/my-account/my-order' },
        { id: 'my-wallet', label: 'MY WALLET', icon: Wallet, href: '/my-account/my-wallet' },
        { id: 'my-custom-orders', label: 'MY CUSTOM ORDERS', icon: Sparkles, href: '/my-account/my-custom-orders' },
        ...(!isIndia ? [
            { id: 'my-inquiry', label: 'MY INQUIRIES', icon: MessageSquare, href: '/my-account/my-inquiry' }
        ] : []),
        { id: 'my-address', label: 'MY ADDRESS', icon: MapPin, href: '/my-account/my-address' },
        { id: 'coupons', label: 'COUPONS', icon: Ticket, href: '/my-account/coupons' },
        // { id: 'settings', label: 'SETTINGS & PREFERENCE', icon: Settings, href: '/my-account/settings' },
    ];

    return (
        <div className="bg-[#FAFAFA] min-h-screen">
            <div className=" mx-auto px-4 md:px-12 py-8 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    <div className="lg:col-span-3 space-y-4 lg:space-y-8 lg:sticky lg:top-32 lg:self-start">
                        {/* User Profile Section */}
                        <div className="flex items-center justify-between lg:justify-start lg:space-x-4 mb-4 lg:mb-8 px-2 lg:px-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                    <User className="w-6 h-6 lg:w-8 lg:h-8 text-gray-900" />
                                </div>
                                <h2 className="text-xl lg:text-2xl font-jakarta font-medium text-gray-900 uppercase tracking-wide">
                                    Hello, {user?.name || user?.email?.split('@')[0] || 'Customer'}
                                </h2>
                            </div>

                            {/* Mobile Toggle Button */}
                            <button
                                onClick={() => setIsNavOpen(!isNavOpen)}
                                className="lg:hidden p-2 bg-white rounded-md shadow-sm border border-gray-100 text-[#B57A5A]"
                            >
                                {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
 
                        {/* Points Badge - Hidden on mobile when menu is closed if needed, but let's keep it */}
                        {/* <div className="bg-[#F5EBE4] p-4 text-center rounded-lg mb-4 lg:mb-8 border border-[#B57A5A]/10">
                            <p className="text-[11px] lg:text-[12px] font-jakarta font-bold text-[#B57A5A] leading-tight uppercase tracking-wider">
                                Earn 500 Exclusive Points by completing your personal details.
                            </p>
                        </div> */}
 
                        {/* Navigation - Conditional visibility on mobile */}
                        <nav className={`
                            ${isNavOpen ? 'flex' : 'hidden lg:flex'} 
                            flex-col bg-white lg:bg-transparent rounded-lg lg:rounded-none shadow-lg lg:shadow-none p-4 lg:p-0
                            border lg:border-none border-gray-100 lg:space-y-0 relative z-50
                        `}>
                            {/* Full-height thin right border for the sidebar (Desktop only) */}
                            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[1px] bg-gray-200 z-0"></div>
 
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <div key={item.id} className="relative mb-1 lg:mb-2 w-full">
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsNavOpen(false)}
                                            className={`
                                                w-full text-left py-3 px-6 text-[11px] lg:text-[12px] font-bold tracking-wider font-jakarta transition-all flex items-center gap-4 relative z-10 rounded-md lg:rounded-none
                                                ${isActive ? 'bg-[#B57A5A] text-white' : 'text-gray-900 hover:bg-gray-50'}
                                            `}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                            {item.label}
                                        </Link>
                                        {isActive && (
                                            <div className="hidden lg:block absolute right-[-24px] top-0 bottom-0 w-[4px] bg-[#B57A5A] z-20"></div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="relative mt-2 pt-2 border-t border-gray-50 lg:border-none">
                                <button
                                    onClick={() => {
                                        setIsNavOpen(false);
                                        logout();
                                    }}
                                    className="w-full text-left py-3 px-6 text-[11px] lg:text-[12px] font-bold tracking-wider font-jakarta text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-4 relative z-10 rounded-md lg:rounded-none"
                                >
                                    <LogOut className="w-5 h-5 text-red-500" />
                                    LOGOUT
                                </button>
                            </div>
                        </nav>
                    </div>

                    <div className="lg:col-span-9 mt-4 lg:mt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
