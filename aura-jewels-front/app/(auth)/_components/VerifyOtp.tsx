'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PREFIX } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import callApi, { getWishlist, getCart } from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { successMsg, errorMsg } from '@/lib/toast';
import { getCookie, setToken, setRefreshToken, setUser, getWishlistCookie, getCartCookie, deleteCookie, getLastRoute, clearLastRoute } from '@/services/clientCookies';
import { useGlobleStore } from '@/store/globleStore';

const VerifyOtpContent = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // OTP is 6 digits based on validator
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(30);

    // Countdown effect for the Resend OTP lock
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const router = useRouter();
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [email, setEmail] = useState<string | undefined>(undefined);
    const [firstName, setFirstName] = useState<string | undefined>(undefined);
    const [lastName, setLastName] = useState<string | undefined>(undefined);
    const [isNewAccount, setIsNewAccount] = useState(false);
    const [firstNameInput, setFirstNameInput] = useState('');
    const [lastNameInput, setLastNameInput] = useState('');

    useEffect(() => {
        setPhone(getCookie('otp_phone'));
        setEmail(getCookie('otp_email'));
        const isNew = getCookie('is_new_account') === 'true';
        setIsNewAccount(isNew);
        const fn = getCookie('otp_first_name') || '';
        const ln = getCookie('otp_last_name') || '';
        const name = getCookie('otp_name') || '';
        if (fn || ln) {
            setFirstName(fn);
            setLastName(ln);
            setFirstNameInput(fn);
            setLastNameInput(ln);
        } else if (name) {
            const parts = name.trim().split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
            setFirstNameInput(parts[0] || '');
            setLastNameInput(parts.slice(1).join(' ') || '');
        }
    }, []);

    const { country } = useGlobleStore();
    const isIndia = country === 'IN' || country === 'India' || !country; // Default to true if not set properly in context

    const handleChange = (val: string, i: number) => {
        if (!/^\d*$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[i] = val.slice(-1);
        setOtp(newOtp);
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (e: any, i: number) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        } else if (e.key === 'Enter') {
            handleVerify();
        }
    };

    const handlePaste = (e: any) => {
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        if (pastedData.length > 0) {
            const newOtp = [...otp];
            pastedData.forEach((char: string, index: number) => {
                if (index < 6) newOtp[index] = char;
            });
            setOtp(newOtp);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            errorMsg('Please enter a valid 6-digit OTP');
            return;
        }

        if (isNewAccount) {
            if (!firstNameInput.trim()) {
                errorMsg('Please enter your first name');
                return;
            }
            if (!lastNameInput.trim()) {
                errorMsg('Please enter your last name');
                return;
            }
        }

        setIsLoading(true);
        try {
            // Email flow is chosen when the send step stored an email (and cleared
            // the phone cookie). Otherwise it's the phone OTP flow.
            const isEmailFlow = !!email && !phone;

            let payload: any = { otp: otpValue };

            if (isNewAccount) {
                const fname = firstNameInput.trim();
                const lname = lastNameInput.trim();
                payload.firstName = fname;
                // payload.fristName = fname;
                payload.lastName = lname;
                // payload.name = `${fname} ${lname}`.trim();
            }

            let endpoint = ENDPOINTS.AUTH.VERIFY_OTP;

            if (isEmailFlow) {
                payload.email = email;
                endpoint = ENDPOINTS.AUTH.VERIFY_EMAIL_OTP;
            } else if (isIndia && phone) {
                payload.country = 'India';
                payload.phone = phone;
                payload.countryCode = '+91';
            } else {
                errorMsg('Missing contact information (phone or email)');
                setIsLoading(false);
                return;
            }

            // Include local guest wishlist items to sync with user account database on login
            const wishlistCookie = getWishlistCookie();
            if (wishlistCookie && wishlistCookie.length > 0) {
                payload.wishlist = wishlistCookie;
            }
            // Same for the guest cart — merged into the account cart server-side.
            const cartCookie = getCartCookie();
            if (cartCookie && cartCookie.length > 0) {
                payload.cart = cartCookie;
            }

            const response = await callApi(endpoint, 'POST', payload);

            if (response?.success || response?.status === 200 || response?.errorCode === 200) {
                successMsg('OTP verified successfully');
                const token = response?.token || response?.accessToken;
                if (token) {
                    setToken(token);
                    if (response?.refreshToken) setRefreshToken(response.refreshToken);
                    let signedInUser = response?.user;

                    // Email SIGNUP: the name typed on the signup form was stashed in
                    // a cookie (the email OTP endpoint doesn't take it). Persist it
                    // now that we have a token.
                    const pendingName = getCookie('otp_name');
                    if (isEmailFlow && pendingName && response?.user?.profileIncomplete) {
                        try {
                            const upd = await callApi(ENDPOINTS.PROFILE.UPDATE_PROFILE, 'PATCH', { name: pendingName }, token);
                            if (upd?.user) signedInUser = upd.user;
                        } catch { /* non-fatal — user can set the name in My Profile */ }
                    }

                    if (signedInUser) setUser(signedInUser);
                    deleteCookie('Aura Jewels-wishlist');
                    deleteCookie('Aura Jewels-cart');
                    deleteCookie('otp_phone');
                    deleteCookie('otp_email');
                    deleteCookie('otp_name');
                    deleteCookie('otp_first_name');
                    deleteCookie('otp_last_name');
                    deleteCookie('is_new_account');
                    await getWishlist();
                    await getCart();
                }
                const lastRoute = getLastRoute();
                if (lastRoute) {
                    clearLastRoute();
                    window.location.href = lastRoute;
                } else {
                    const searchParams = new URLSearchParams(window.location.search);
                    const next = searchParams.get('next');
                    window.location.href = next ? next : '/';
                }
            } else {
                errorMsg(response?.message || 'Invalid OTP. Please try again.');
            }
        } catch (error: any) {
            errorMsg('An error occurred during verification.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const isEmailFlow = !!email && !phone;
            let payload: any = {};
            let endpoint = ENDPOINTS.AUTH.RESEND_OTP;

            if (isEmailFlow) {
                payload.email = email;
                endpoint = ENDPOINTS.AUTH.RESEND_EMAIL_OTP;
            } else if (isIndia && phone) {
                payload.country = 'India';
                payload.phone = phone;
                payload.countryCode = '+91';
            } else {
                errorMsg('Missing contact information (phone or email)');
                return;
            }

            const response = await callApi(endpoint, 'POST', payload);

            if (response?.success || response?.status === 200 || response?.errorCode === 200) {
                successMsg('OTP resent successfully');
            } else {
                errorMsg(response?.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error: any) {
            errorMsg('An error occurred while resending OTP.');
            console.error(error);
        }
    };

    return (
        <section className="">
            <div className="">
                <div className="flex flex-col md:flex-row bg-white overflow-hidden">
                    {/* Left Section - Image */}
                    <div className="w-full md:w-1/2 relative hidden md:flex overflow-hidden">
                        <Image
                            src={`${PREFIX}/images/auth/authImage.jpg`}
                            alt="Luxury Jewelry"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Right Section - Form */}
                    <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
                        <div className="w-full max-w-md flex flex-col items-center animate-fadeIn">
                            {/* Aura Jewels logo set */}
                            <div className="mb-4 relative">
                                <Image
                                    src={`${PREFIX}/images/1.png`}
                                    alt="Aura Jewels Logo"
                                    width={120}
                                    height={120}
                                    className="w-16 h-auto"
                                />
                            </div>
                            {/* Welcome Text */}
                            <h1 className="text-3xl md:text-4xl serif text-[--color-primary] mb-4 text-center tracking-wide">
                                Welcome to Aura Jewels
                            </h1>

                            {/* Verify OTP Box */}
                            <div className="w-full border border-gray-100 overflow-hidden rounded-sm shadow-sm">
                                <div className="bg-[--color-primary] py-4 px-6 flex items-center justify-between">
                                    <h2 className="text-white text-lg font-medium tracking-widest uppercase text-[14px] !mb-0">
                                        Verify OTP
                                    </h2>
                                    <Link
                                        href="/sign-in"
                                        className="text-white hover:text-white/80 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </Link>
                                </div>

                                <div className="px-8 pb-8 space-y-2 bg-white flex flex-col items-center">
                                    <p className="text-xs sm:text-sm md:text-base text-gray-500 font-bold text-center leading-relaxed py-2 mb-2 border-b">
                                        We Have Sent An OTP To <span className="text-gray-800 whitespace-nowrap">{phone ? `+91 ${phone}` : email}</span>
                                    </p>

                                    {isNewAccount ? (
                                        <div className="w-full flex gap-3 mb-2">
                                            <div className="flex-1 space-y-1">
                                                <label className='font-semibold text-gray-700 text-[11px] tracking-wider uppercase text-left w-full block'>First Name*</label>
                                                <input
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={firstNameInput}
                                                    onChange={(e) => setFirstNameInput(e.target.value)}
                                                    className="w-full px-4 h-10 border border-gray-300 outline-none text-gray-800 text-sm focus:border-[--color-primary] rounded-sm transition-all"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <label className='font-semibold text-gray-700 text-[11px] tracking-wider uppercase text-left w-full block'>Last Name*</label>
                                                <input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={lastNameInput}
                                                    onChange={(e) => setLastNameInput(e.target.value)}
                                                    className="w-full px-4 h-10 border border-gray-300 outline-none text-gray-800 text-sm focus:border-[--color-primary] rounded-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        (firstName || lastName) && (
                                            <div className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-center mb-1">
                                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Name</p>
                                                <p className="text-sm font-bold text-gray-800">{firstName} {lastName}</p>
                                            </div>
                                        )
                                    )}

                                    {/* OTP Inputs */}
                                    <div className="flex gap-2 md:gap-4 justify-center !mt-4">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => { inputRefs.current[index] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleChange(e.target.value, index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                onPaste={index === 0 ? handlePaste : undefined}
                                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 border border-gray-300 rounded-lg text-center text-xl font-bold focus:border-[--color-primary] outline-none transition-all"
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center !mt-2">
                                        <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                            Didn&apos;t Receive OTP?{' '}
                                            {timer > 0 ? (
                                                <span className="text-gray-400">
                                                    Resend OTP in <span className="font-bold text-[--color-primary]">{timer}</span> Sec
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleResendOtp();
                                                        setTimer(30);
                                                    }}
                                                    className="text-[--color-primary] font-bold hover:underline"
                                                >
                                                    Resend
                                                </button>
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleVerify}
                                        disabled={isLoading}
                                        className="w-full bg-[--color-primary] text-white py-3 font-bold text-xs tracking-[0.2em] hover:bg-[#9D6A4B] transition-all duration-500 uppercase rounded-sm disabled:opacity-70"
                                    >
                                        {isLoading ? 'VERIFYING...' : 'CONTINUE'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const VerifyOtp = () => {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <VerifyOtpContent />
        </React.Suspense>
    );
}

export default VerifyOtp;
