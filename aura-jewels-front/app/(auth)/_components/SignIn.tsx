'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PREFIX } from '@/lib/constants';
import { useFormik } from 'formik';
import { authSchema, internationalSignInSchema } from '@/lib/validation-schema';
import { useGlobleStore } from '@/store/globleStore';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useRouter } from 'next/navigation';
import callApi, { getWishlist, getCart } from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { successMsg, errorMsg } from '@/lib/toast';
import { setCookie, setToken, setRefreshToken, setUser, getWishlistCookie, getCartCookie, deleteCookie, getLastRoute, clearLastRoute } from '@/services/clientCookies';
import { useState } from 'react';

const SignIn = () => {
    const { country } = useGlobleStore();
    const isIndia = country === 'IN';

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // India customers can log in with a Mobile OTP (default) OR an Email OTP —
    // the email channel is a peer flow (used when SMS is unavailable). The
    // email state is kept out of formik so the working mobile form is untouched.
    const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('email');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    const handleEmailOtpSend = async () => {
        const value = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        setEmailError('');
        setEmailLoading(true);
        try {
            const response = await callApi(ENDPOINTS.AUTH.SEND_EMAIL_OTP, 'POST', { email: value });

            console.log("login response ------->", response)

            if (response?.success || response?.status === 200 || response?.errorCode === 200) {
                // Hand off to the shared OTP screen. Clear the phone/name cookies
                // so VerifyOtp routes down the email branch.
                setCookie('otp_email', value, 1);
                if (response?.isNewAccount === true) {
                    setCookie('is_new_account', 'true', 1);
                } else {
                    deleteCookie('is_new_account');
                }
                deleteCookie('otp_phone');
                deleteCookie('otp_name');
                successMsg('OTP sent to your email');
                router.push('/verify-otp');
            } else {
                errorMsg(response?.message || 'Could not send OTP. Please try again.');
            }
        } catch (error) {
            errorMsg('An error occurred. Please try again.');
        } finally {
            setEmailLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: isIndia ? {
            mobileNumber: '91',
        } : {
            email: '',
            password: '',
        },
        validationSchema: isIndia ? authSchema : internationalSignInSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Email channel has its own handler; ignore a stray form submit
            // (e.g. Enter pressed in the email field) so it never runs mobile login.
            if (isIndia && authMethod === 'email') {
                handleEmailOtpSend();
                return;
            }
            setIsLoading(true);
            try {
                let payload: any = {};
                const vals = values as any;
                if (isIndia) {
                    payload = {
                        country: 'India',
                        phone: vals.mobileNumber?.replace(/^91/, '') || '',
                        countryCode: '+91',
                    };
                } else {
                    payload = {
                        country: country || 'US',
                        email: vals.email,
                        password: vals.password
                    };
                }

                // Add wishlist items from cookies if present
                const wishlistCookie = getWishlistCookie();
                if (wishlistCookie && wishlistCookie.length > 0) {
                    payload.wishlist = wishlistCookie;
                }
                const cartCookie = getCartCookie();
                if (cartCookie && cartCookie.length > 0) {
                    payload.cart = cartCookie;
                }

                const response = await callApi(ENDPOINTS.AUTH.LOGIN, 'POST', payload);

                if (response?.success || response?.status === 200 || response?.errorCode === 200) {
                    successMsg(response?.message || 'Login successful');

                    const token = response?.token || response?.accessToken;
                    // If it's India, we might need to go to verify OTP if token isn't provided directly
                    if (isIndia && !token) {
                        setCookie('otp_phone', payload.phone, 1);
                        if (response?.isNewAccount === true) {
                            setCookie('is_new_account', 'true', 1);
                        } else {
                            deleteCookie('is_new_account');
                        }
                        const searchParams = new URLSearchParams(window.location.search);
                        const next = searchParams.get('next');
                        window.location.href = `/verify-otp${next ? `?next=${encodeURIComponent(next)}` : ''}`;
                    } else {
                        if (token) {
                            setToken(token);
                            if (response?.refreshToken) setRefreshToken(response.refreshToken);
                            if (response?.user) {
                                setUser(response.user);
                            }
                            deleteCookie('Aura Jewels-wishlist');
                            deleteCookie('Aura Jewels-cart');
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
                    }
                } else {
                    errorMsg(response?.message || 'Login failed. Please try again.');
                }
            } catch (error: any) {
                errorMsg('An error occurred during login.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <section className="">
            <div className="">
                <div className="flex flex-col md:flex-row bg-white overflow-hidden">
                    {/* Left Section - Image (Square) */}
                    <div className={`${!isIndia ? 'h-100' : "h-[80vh]"} w-full md:w-1/2 h-100 hidden md:flex relative overflow-hidden p-10`}>
                        <Image
                            src={`${PREFIX}/images/auth/authImage.jpg`}
                            alt="Luxury Jewelry"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            // className="object-cover animate-kenBurns"
                            className="object-cover"
                            priority
                        />
                        {/* <div className="absolute inset-0 bg-black/5"></div> */}
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

                            {/* Login Box */}
                            <div className="w-full border border-[#ECECEC] overflow-hidden rounded-none">
                                <div className="bg-[--color-primary] py-4 px-6">
                                    <h2 className="text-white text-lg font-medium tracking-widest uppercase text-[14px]">
                                        Login Here
                                    </h2>
                                </div>

                                <div className="px-4 py-2 space-y-8 bg-white mb-2">
                                    <p className="text-[13px] text-gray-500 font-medium text-center md:text-left leading-relaxed">
                                        {isIndia
                                            ? (authMethod === 'mobile'
                                                ? 'Please Enter Your Phone Number Below. We Will Send You The OTP.'
                                                : 'Please Enter Your Email Below. We Will Send You The OTP.')
                                            : 'Please Enter Your Email And Password To Login.'}
                                    </p>

                                    {/* Mobile / Email channel toggle (India OTP login) */}
                                    {isIndia && (
                                        <div className="flex w-full border border-[#ECECEC] rounded-none overflow-hidden mb-2">
                                            {(['mobile', 'email'] as const).map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setAuthMethod(m)}
                                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-none ${authMethod === m ? 'bg-[--color-primary] text-white' : 'bg-white text-gray-500 hover:text-[#B57A5A]'}`}
                                                >
                                                    {m === 'mobile' ? 'Mobile' : 'Email'}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 !mt-0 py-3">
                                        {isIndia ? (
                                            authMethod === 'mobile' ? (
                                                <div className="space-y-1">
                                                    <div className="flex flex-col md:flex-row gap-3 md:gap-0 group">
                                                        <div className="flex w-full md:flex-1 items-stretch phone-input-container">
                                                            <PhoneInput
                                                                country={'in'}
                                                                onlyCountries={['in']}
                                                                disableDropdown={true}
                                                                countryCodeEditable={false}
                                                                value={formik.values.mobileNumber || ''}
                                                                onChange={(phone) => formik.setFieldValue('mobileNumber', phone)}
                                                                onBlur={() => formik.setFieldTouched('mobileNumber', true)}
                                                                containerClass="!w-full !h-10"
                                                                inputClass={`!w-full !h-10 !border !rounded-none !text-base md:!text-sm !transition-all ${formik.touched.mobileNumber && formik.errors.mobileNumber ? '!border-red-500' : '!border-[#ECECEC] focus:!border-[--color-primary]'}`}
                                                                buttonClass="!border !border-r-0 !rounded-none !bg-gray-50 !border-[#ECECEC]"
                                                                placeholder="Enter Your Mobile Number"
                                                            />
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={isLoading}
                                                            className="w-full md:w-auto bg-[--color-primary] text-white px-8 !h-10 font-bold text-xs tracking-[0.2em] hover:bg-[#9D6A4B] transition-all duration-500 uppercase disabled:opacity-70 flex-shrink-0 rounded-none"
                                                        >
                                                            {isLoading ? 'Wait...' : 'LOGIN'}
                                                        </button>
                                                    </div>
                                                    {formik.touched.mobileNumber && formik.errors.mobileNumber ? (
                                                        <div className="text-red-500 text-[11px] font-medium mt-1">{formik.errors.mobileNumber}</div>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <div className="flex flex-col md:flex-row gap-3 md:gap-0 group">
                                                        <input
                                                            type="email"
                                                            placeholder="Enter Your Email Address"
                                                            value={email}
                                                            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEmailOtpSend(); } }}
                                                            className={`w-full md:flex-1 px-4 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all flex-shrink-0 rounded-none ${emailError ? 'border-red-500' : 'border-[#ECECEC] focus:border-[--color-primary]'}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleEmailOtpSend}
                                                            disabled={emailLoading}
                                                            className="w-full md:w-auto bg-[--color-primary] text-white px-8 !h-10 font-bold text-xs tracking-[0.2em] hover:bg-[#9D6A4B] transition-all duration-500 uppercase disabled:opacity-70 flex-shrink-0 rounded-none"
                                                        >
                                                            {emailLoading ? 'Wait...' : 'SEND OTP'}
                                                        </button>
                                                    </div>
                                                    {emailError ? (
                                                        <div className="text-red-500 text-[11px] font-medium mt-1">{emailError}</div>
                                                    ) : null}
                                                </div>
                                            )
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address"
                                                        id="email"
                                                        name="email"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.email || ''}
                                                        className={`w-full px-4 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all rounded-none ${formik.touched.email && formik.errors.email
                                                            ? 'border-red-500'
                                                            : 'border-[#ECECEC] focus:border-[--color-primary]'
                                                            }`}
                                                    />
                                                    {formik.touched.email && formik.errors.email && (
                                                        <div className="text-red-500 text-[11px] font-medium">{formik.errors.email}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="Password"
                                                            id="password"
                                                            name="password"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.password || ''}
                                                            className={`w-full pl-4 pr-10 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all rounded-none ${formik.touched.password && formik.errors.password
                                                                ? 'border-red-500'
                                                                : 'border-[#ECECEC] focus:border-[--color-primary]'
                                                                }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                        >
                                                            {showPassword ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                    {formik.touched.password && formik.errors.password && (
                                                        <div className="text-red-500 text-[11px] font-medium">{formik.errors.password}</div>
                                                    )}
                                                    <div className="flex justify-end !mt-1">
                                                        <Link
                                                            href="/forgot-password"
                                                            className="text-xs text-gray-500 hover:text-[#9D6A4B] transition-colors uppercase tracking-wider font-semibold"
                                                        >
                                                            Forgot Password?
                                                        </Link>
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-[--color-primary] text-white px-8 h-10 font-bold text-xs tracking-[0.2em] hover:bg-[#9D6A4B] transition-all duration-500 uppercase disabled:opacity-70 rounded-none"
                                                >
                                                    {isLoading ? 'Please Wait...' : 'LOGIN'}
                                                </button>

                                                <div className="relative my-4">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-white px-2 text-gray-400">Or Continue With</span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-center gap-3 px-4 h-10 border border-[#ECECEC] bg-white text-gray-700 text-xs font-bold tracking-wider hover:bg-gray-50 transition-all uppercase rounded-none"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                        <path
                                                            fill="#4285F4"
                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        />
                                                        <path
                                                            fill="#34A853"
                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        />
                                                        <path
                                                            fill="#FBBC05"
                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                                        />
                                                        <path
                                                            fill="#EA4335"
                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        />
                                                    </svg>
                                                    Google
                                                </button>
                                            </div>
                                        )}
                                    </form>

                                    <div className="pt-2 border-t border-[#ECECEC] !mt-0">
                                        <p className="text-[13px] text-gray-500 font-medium">
                                            Don&apos;t Have An Account?{' '}
                                            <Link href="/sign-up" className="font-bold text-[--color-primary] hover:text-[#A96D56] transition-colors ml-1 uppercase tracking-wider text-xs">
                                                Sign Up
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


export default SignIn;