import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the routes you want to protect from unauthenticated users
const protectedRoutes = ['/my-account'];

// Add the routes you want to protect from authenticated users (e.g. they shouldn't see login page if they are already logged in)
const authRoutes = ['/sign-in', '/sign-up', '/verify-otp'];

export function middleware(request: NextRequest) {
    // Both 'customer_token' and the legacy 'token' are checked for migration compatibility.
    // The storefront cookie is named 'customer_token' in `clientCookies.ts`.
    const token = request.cookies.get('customer_token')?.value || request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    let response: NextResponse;

    // 1. If user is NOT logged in and tries to access a protected route
    if (!token && isProtectedRoute) {
        // Redirect them to login, and save the previous route they were trying to access
        const signInUrl = new URL('/sign-in', request.url);
        response = NextResponse.redirect(signInUrl);
        response.cookies.set('last_route', pathname, { path: '/', maxAge: 86400, sameSite: 'lax' });
    }
    // 2. If user IS logged in and tries to access an auth route (login/register)
    else if (token && isAuthRoute) {
        // Redirect them away from the auth pages, using last_route or fallback to home page
        const lastRoute = request.cookies.get('last_route')?.value;
        const decodedRoute = lastRoute ? decodeURIComponent(lastRoute) : '/';
        const redirectUrl = new URL(decodedRoute, request.url);
        response = NextResponse.redirect(redirectUrl);
        response.cookies.delete('last_route');
    }
    // 3. Cleanup stale last_route cookie if unauthenticated user is browsing public pages
    else if (!token && !isProtectedRoute && !isAuthRoute && request.cookies.has('last_route')) {
        response = NextResponse.next();
        response.cookies.delete('last_route');
    }
    else {
        response = NextResponse.next();
    }

    // Geo country header detection (Cloudflare / Vercel / Fastly / Nginx / query param override)
    const countryParam = request.nextUrl.searchParams.get('country');
    const geoCountry = (
        countryParam ||
        request.headers.get('x-vercel-ip-country') ||
        request.headers.get('cf-ipcountry') ||
        request.headers.get('x-country-code') ||
        request.headers.get('fastly-geo-country') ||
        ''
    ).toUpperCase().replace(/^XX$/, '');

    if (geoCountry) {
        response.cookies.set('x-country-code', geoCountry, { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
    }

    return response;
}

// Configure the paths where this middleware should run
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images/ (public images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
};
