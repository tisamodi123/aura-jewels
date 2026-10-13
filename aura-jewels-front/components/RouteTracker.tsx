'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setLastRoute } from '@/services/clientCookies';

// Auth screens the user should NEVER be returned to after logging in. A login
// that started on /product/X must land back on /product/X, not bounce to
// /sign-in or /verify-otp.
const AUTH_PREFIXES = [
    '/sign-in',
    '/sign-up',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
];

// Records the last NON-auth route the customer visited into the `last_route`
// cookie. SignIn / VerifyOtp read it (getLastRoute) and redirect there after a
// successful login/signup — the common "return to where you were" behaviour.
const RouteTracker = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return;
        const isAuthPage = AUTH_PREFIXES.some(
            (r) => pathname === r || pathname.startsWith(`${r}/`)
        );
        if (isAuthPage) return;
        // Capture the full URL (incl. query) so filters/params survive the round-trip.
        setLastRoute(window.location.pathname + window.location.search);
    }, [pathname]);

    return null;
};

export default RouteTracker;
