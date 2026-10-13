'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ENDPOINTS } from '@/lib/Api_Url';

import { errorMsg, successMsg } from '@/lib/toast';
import { Loader2 } from 'lucide-react';
import callApi, { getWishlist, getCart } from '@/lib/commonApi';
import { setToken, setUser, deleteCookie, getWishlistCookie, getCartCookie } from '@/services/clientCookies';

const VerifyEmailContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Please wait, your email is being verified...');

    const hasCalled = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification token.');
            return;
        }

        const verifyToken = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;

            try {
                const payload: any = { token };
                const wishlistCookie = getWishlistCookie();
                if (wishlistCookie && wishlistCookie.length > 0) {
                    payload.wishlist = wishlistCookie;
                }
                const cartCookie = getCartCookie();
                if (cartCookie && cartCookie.length > 0) {
                    payload.cart = cartCookie;
                }

                const response = await callApi(ENDPOINTS.AUTH.VERIFY_EMAIL_TOKEN, 'POST', payload);
                console.log("response==========>", response)
                if (response?.success || response?.errorCode === 200) {
                    setStatus('success');
                    setMessage(response?.message || 'Email verified successfully!');
                    successMsg(response?.message || 'Email verified successfully!');

                    if (response?.user && response?.accessToken) {
                        setToken(response.accessToken);
                        setUser(response.user);
                        deleteCookie('Aura Jewels-wishlist');
                        deleteCookie('Aura Jewels-cart');
                        await getWishlist();
                        await getCart();
                    }

                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(response?.message || 'Verification failed. The link might be expired.');
                    errorMsg(response?.message || 'Verification failed.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage('An error occurred during verification.');
                console.error(error);
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <section>
            <div className="flex items-center justify-center min-h-[50vh] p-4">
                <div className="bg-white p-8 shadow-md rounded-md max-w-md w-full text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <h2 className="text-xl font-semibold text-gray-800">Verifying Email</h2>
                            <p className="text-gray-600">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-green-700">Success!</h2>
                            <p className="text-gray-600">{message}</p>
                            <p className="text-sm text-gray-500">Redirecting to homepage...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-red-700">Verification Failed</h2>
                            <p className="text-gray-600">{message}</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const VerifyEmailPage = () => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
};

export default VerifyEmailPage;
