'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PREFIX } from '@/lib/constants';
import { useFormik } from 'formik';
import { authSchema, indianSignUpSchema, internationalSignUpSchema, sanitizeNameInput } from '@/lib/validation-schema';
import { useGlobleStore } from '@/store/globleStore';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useRouter } from 'next/navigation';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { successMsg, errorMsg } from '@/lib/toast';
import { setCookie, deleteCookie } from '@/services/clientCookies';
import ReCAPTCHA from 'react-google-recaptcha';

const SignUp = () => {
    const { country } = useGlobleStore();
    const isIndia = country === 'IN';

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [captchaError, setCaptchaError] = useState("");
    const reCaptchaRef = useRef<ReCAPTCHA>(null);

    // console.log("captchaValue -------->", captchaValue)

    const handleCaptchaChange = (value: string | null) => {
        setCaptchaValue(value);
        if (value) {
            setCaptchaError("");
        }
    };

    const handleCaptchaExpired = () => {
        setCaptchaValue(null);
    };

    // India customers can sign up with Mobile OTP (default) or Email OTP. The
    // email endpoint doesn't take a name, so the name typed here is stashed in a
    // cookie and applied right after OTP verification (see VerifyOtp).
    const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('email');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);


    // Email enter call this api
    const handleEmailOtpSend = async () => {
        const firstNameVal = String((formik.values as any).firstName || '').trim();
        const lastNameVal = String((formik.values as any).lastName || '').trim();
        const nameVal = `${firstNameVal} ${lastNameVal}`.trim();
        const value = email.trim().toLowerCase();
        let ok = true;
        if (!firstNameVal) {
            formik.setFieldTouched('firstName', true);
            formik.setFieldError('firstName', 'First name is required');
            ok = false;
        }
        if (!lastNameVal) {
            formik.setFieldTouched('lastName', true);
            formik.setFieldError('lastName', 'Last name is required');
            ok = false;
        }
        if (!(formik.values as any).agreeTerms) {
            formik.setFieldTouched('agreeTerms', true);
            formik.setFieldError('agreeTerms', 'You must agree to the Terms & Conditions and Privacy Policy');
            ok = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError('Please enter a valid email address');
            ok = false;
        }
        if (!ok) return;

        if (!captchaValue) {
            setCaptchaError("Please complete the reCAPTCHA verification");
            errorMsg('Please complete the reCAPTCHA verification');
            return;
        }

        setEmailError('');
        setEmailLoading(true);

        try {
            const response = await callApi(ENDPOINTS.AUTH.SEND_EMAIL_OTP, 'POST', {
                email: value,
                name: nameVal,
                captcha: captchaValue
            });
            if (response?.success || response?.status === 200 || response?.errorCode === 200) {
                setCookie('otp_email', value, 1);
                setCookie('otp_first_name', firstNameVal, 1);
                setCookie('otp_last_name', lastNameVal, 1);
                setCookie('otp_name', nameVal, 1);
                deleteCookie('otp_phone');
                successMsg('OTP sent to your email');
                router.push('/verify-otp');
            } else {
                errorMsg(response?.message || 'Could not send OTP. Please try again.');
                reCaptchaRef.current?.reset();
                setCaptchaValue(null);
            }
        } catch (error) {
            errorMsg('An error occurred. Please try again.');
            reCaptchaRef.current?.reset();
            setCaptchaValue(null);
        } finally {
            setEmailLoading(false);
        }
    };

    // Mobile enter call this api
    const formik = useFormik({
        initialValues: isIndia ? {
            firstName: '',
            lastName: '',
            mobileNumber: '91',
            isWhatsApp: true,
            agreeTerms: true,
        } : {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            countryCode: '',
            agreeTerms: true,
        },
        validationSchema: isIndia ? indianSignUpSchema : internationalSignUpSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!captchaValue) {
                setCaptchaError("Please complete the reCAPTCHA verification");
                errorMsg('Please complete the reCAPTCHA verification');
                return;
            }

            setIsLoading(true);
            try {
                let payload: any = {};
                const vals = values as any;
                const firstNameVal = (vals.firstName || '').trim();
                const lastNameVal = (vals.lastName || '').trim();
                const fullNameVal = `${firstNameVal} ${lastNameVal}`.trim();

                if (isIndia) {
                    payload = {
                        country: 'India',
                        name: fullNameVal,
                        phone: vals.mobileNumber?.replace(/^91/, '') || '',
                        countryCode: '+91',
                        isWhatsAppSameAsMobile: vals.isWhatsApp || false,
                        captcha: captchaValue
                    };
                } else {
                    const countryCode = vals.countryCode || '';
                    let phone = vals.phone || '';
                    if (countryCode && phone.startsWith(countryCode)) {
                        phone = phone.slice(countryCode.length);
                    }
                    payload = {
                        ...(country ? { country } : {}),
                        name: fullNameVal,
                        email: vals.email,
                        password: vals.password,
                        phone: phone,
                        ...(countryCode ? { countryCode } : {}),
                        captcha: captchaValue
                    };
                }

                const response = await callApi(ENDPOINTS.AUTH.REGISTER, 'POST', payload);
                if (response?.success || response?.errorCode === 200) {
                    successMsg(response?.message || 'Registration successful');

                    if (isIndia) {
                        setCookie('otp_phone', payload.phone, 1);
                        setCookie('otp_first_name', firstNameVal, 1);
                        setCookie('otp_last_name', lastNameVal, 1);
                        setCookie('otp_name', fullNameVal, 1);
                        router.push('/verify-otp');
                    } else {
                        formik.resetForm();
                        setTimeout(() => {
                            router.push('/sign-in');
                        }, 2000);
                    }
                } else {
                    errorMsg(response?.message || 'Registration failed. Please try again.');
                    reCaptchaRef.current?.reset();
                    setCaptchaValue(null);
                }
            } catch (error: any) {
                errorMsg('An error occurred during registration.');
                console.error(error);
                reCaptchaRef.current?.reset();
                setCaptchaValue(null);
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <section className="">
            <div className="">
                <div className="flex flex-col md:flex-row bg-white overflow-hidden">
                    {/* Left Section - Image */}
                    <div className="w-full md:w-1/2 hidden md:flex relative overflow-hidden">
                        <Image
                            src={`${PREFIX}/images/auth/authImage.jpg`}
                            alt="Luxury Jewelry"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
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

                            {/* Sign Up Box */}
                            <div className="w-full border border-gray-100 overflow-hidden rounded-sm shadow-sm">
                                <div className="bg-[--color-primary] py-4 px-6">
                                    <h2 className="text-white text-lg font-medium tracking-widest uppercase text-[14px]">
                                        Sign up Here
                                    </h2>
                                </div>

                                <div className="px-4 py-2 space-y-6 bg-white">
                                    {/* Mobile / Email channel toggle (India OTP signup) */}
                                    {isIndia && (
                                        <div className="flex w-full border border-gray-200 rounded-sm overflow-hidden my-3">
                                            {(['mobile', 'email'] as const).map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setAuthMethod(m)}
                                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${authMethod === m ? 'bg-[--color-primary] text-white' : 'bg-white text-gray-500 hover:text-black'}`}
                                                >
                                                    {m === 'mobile' ? 'Mobile' : 'Email'}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 !mt-0 mb-3">
                                        {isIndia ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label htmlFor="firstName" className='font-semibold text-gray-700 text-[14px] tracking-wider'>First Name*</label>
                                                        <input
                                                            type="text"
                                                            placeholder="First Name"
                                                            id="firstName"
                                                            name="firstName"
                                                            onChange={(e) => formik.setFieldValue('firstName', sanitizeNameInput(e.target.value))}
                                                            onBlur={(e) => {
                                                                formik.setFieldValue('firstName', e.target.value.trim());
                                                                formik.handleBlur(e);
                                                            }}
                                                            value={(formik.values as any).firstName || ''}
                                                            className={`w-full px-4 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.firstName && formik.errors.firstName
                                                                ? 'border-red-500'
                                                                : 'border-gray-300 focus:border-[--color-primary]'
                                                                }`}
                                                        />
                                                        {formik.touched.firstName && formik.errors.firstName && (
                                                            <div className="text-red-500 text-[11px] font-medium">{formik.errors.firstName as string}</div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label htmlFor="lastName" className='font-semibold text-gray-700 text-[14px] tracking-wider'>Last Name*</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Last Name"
                                                            id="lastName"
                                                            name="lastName"
                                                            onChange={(e) => formik.setFieldValue('lastName', sanitizeNameInput(e.target.value))}
                                                            onBlur={(e) => {
                                                                formik.setFieldValue('lastName', e.target.value.trim());
                                                                formik.handleBlur(e);
                                                            }}
                                                            value={(formik.values as any).lastName || ''}
                                                            className={`w-full px-4 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.lastName && formik.errors.lastName
                                                                ? 'border-red-500'
                                                                : 'border-gray-300 focus:border-[--color-primary]'
                                                                }`}
                                                        />
                                                        {formik.touched.lastName && formik.errors.lastName && (
                                                            <div className="text-red-500 text-[11px] font-medium">{formik.errors.lastName as string}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {authMethod === 'mobile' ? (
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label htmlFor="mobileNumber" className='font-semibold text-gray-700 text-[14px] tracking-wider'>Mobile No*</label>
                                                            <PhoneInput
                                                                country={'in'}
                                                                onlyCountries={['in']}
                                                                disableDropdown={true}
                                                                countryCodeEditable={false}
                                                                value={formik.values.mobileNumber || ''}
                                                                onChange={(phone) => formik.setFieldValue('mobileNumber', phone)}
                                                                onBlur={() => formik.setFieldTouched('mobileNumber', true)}
                                                                containerClass="!w-full !h-10"
                                                                inputClass={`!w-full !h-10 !border !rounded-none !text-base md:!text-sm !transition-all ${formik.touched.mobileNumber && formik.errors.mobileNumber ? '!border-red-500' : '!border-gray-300 focus:!border-[--color-primary]'}`}
                                                                buttonClass="!border !border-r-0 !rounded-none !bg-gray-50 !border-gray-300"
                                                                placeholder="Enter Your Mobile Number"
                                                            />
                                                            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                                                                <div className="text-red-500 text-[11px] font-medium mt-1">{formik.errors.mobileNumber}</div>
                                                            )}
                                                        </div>

                                                        {/* ReCAPTCHA centered - Last field for Mobile */}
                                                        <div className="flex flex-col items-center py-1 w-full">
                                                            <ReCAPTCHA
                                                                ref={reCaptchaRef}
                                                                sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || ''}
                                                                onChange={handleCaptchaChange}
                                                                onExpired={handleCaptchaExpired}
                                                                theme="light"
                                                                size="normal"
                                                            />
                                                            {captchaError && (
                                                                <div className="text-red-500 text-[11px] font-medium mt-1">{captchaError}</div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            {/* WhatsApp Checkbox */}
                                                            <div className="flex items-center gap-2 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    id="isWhatsApp"
                                                                    name="isWhatsApp"
                                                                    checked={formik.values.isWhatsApp || false}
                                                                    onChange={formik.handleChange}
                                                                    className="w-4 h-4 rounded border-gray-300 accent-[--color-primary] focus:ring-[--color-primary] cursor-pointer"
                                                                />
                                                                <label htmlFor="isWhatsApp" className="text-[13px] text-gray-600 font-medium cursor-pointer group-hover:text-black transition-colors">
                                                                    This is my WhatsApp number
                                                                </label>
                                                            </div>

                                                            {/* Terms & Conditions Checkbox */}
                                                            <div className="flex items-start gap-2 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    id="agreeTerms"
                                                                    name="agreeTerms"
                                                                    checked={(formik.values as any).agreeTerms || false}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    className="w-4 h-4 rounded border-gray-300 accent-[--color-primary] focus:ring-[--color-primary] cursor-pointer mt-0.5"
                                                                />
                                                                <label htmlFor="agreeTerms" className="text-[12px] text-gray-600 font-medium cursor-pointer leading-tight">
                                                                    I agree to the{' '}
                                                                    <Link href="/policies/terms-and-conditions" target="_blank" className="underline font-bold text-[--color-primary] ">
                                                                        Terms &amp; Conditions
                                                                    </Link>{' '}
                                                                    and{' '}
                                                                    <Link href="/policies/privacy-policy" target="_blank" className="underline font-bold text-[--color-primary] ">
                                                                        Privacy Policy
                                                                    </Link>
                                                                </label>
                                                            </div>
                                                            {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                                                                <div className="text-red-500 text-[11px] font-medium mt-0.5">{formik.errors.agreeTerms as string}</div>
                                                            )}
                                                        </div>

                                                        {/* Full-width Sign-Up Button */}
                                                        <button
                                                            type="submit"
                                                            disabled={isLoading}
                                                            className="w-full bg-[#A96D56] text-white px-8 h-10 font-bold text-xs tracking-[0.2em] hover:bg-[#995e48] transition-all duration-500 uppercase disabled:opacity-70 mt-2"
                                                        >
                                                            {isLoading ? 'WAIT...' : 'SIGN UP'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label htmlFor="signupEmail" className='font-semibold text-gray-700 text-[14px] tracking-wider'>Email*</label>
                                                            <input
                                                                id="signupEmail"
                                                                type="email"
                                                                placeholder="Enter Your Email Address"
                                                                value={email}
                                                                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEmailOtpSend(); } }}
                                                                className={`w-full px-4 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${emailError ? 'border-red-500' : 'border-gray-300 focus:border-[--color-primary]'}`}
                                                            />
                                                            {emailError && (
                                                                <div className="text-red-500 text-[11px] font-medium mt-1">{emailError}</div>
                                                            )}
                                                        </div>

                                                        {/* ReCAPTCHA centered - Last field for Email */}
                                                        <div className="flex flex-col items-center py-1 w-full">
                                                            <ReCAPTCHA
                                                                ref={reCaptchaRef}
                                                                sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || ""}
                                                                onChange={handleCaptchaChange}
                                                                onExpired={handleCaptchaExpired}
                                                                theme="light"
                                                                size="normal"
                                                            />
                                                            {captchaError && (
                                                                <div className="text-red-500 text-[11px] font-medium mt-1">{captchaError}</div>
                                                            )}
                                                        </div>

                                                        {/* Terms & Conditions Checkbox */}
                                                        <div className="space-y-1">
                                                            <div className="flex items-start gap-2 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    id="agreeTermsEmail"
                                                                    name="agreeTerms"
                                                                    checked={(formik.values as any).agreeTerms || false}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    className="w-4 h-4 rounded border-gray-300 accent-[--color-primary] focus:ring-[--color-primary] cursor-pointer mt-0.5"
                                                                />
                                                                <label htmlFor="agreeTermsEmail" className="text-[12px] text-gray-600 font-medium cursor-pointer leading-tight">
                                                                    I agree to the{' '}
                                                                    <Link href="/policies/terms-and-conditions" target="_blank" className="underline font-bold text-[--color-primary] ">
                                                                        Terms &amp; Conditions
                                                                    </Link>{' '}
                                                                    and{' '}
                                                                    <Link href="/policies/privacy-policy" target="_blank" className="underline font-bold text-[--color-primary] ">
                                                                        Privacy Policy
                                                                    </Link>
                                                                </label>
                                                            </div>
                                                            {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                                                                <div className="text-red-500 text-[11px] font-medium mt-0.5">{formik.errors.agreeTerms as string}</div>
                                                            )}
                                                        </div>

                                                        {/* Full-width Sign-Up Button */}
                                                        <button
                                                            type="button"
                                                            onClick={handleEmailOtpSend}
                                                            disabled={emailLoading}
                                                            className="w-full bg-[#A96D56] text-white px-8 h-10 font-bold text-xs tracking-[0.2em] hover:bg-[#995e48] transition-all duration-500 uppercase disabled:opacity-70 mt-2"
                                                        >
                                                            {emailLoading ? 'WAIT...' : 'SIGN UP'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    <div className="space-y-1">
                                                        <input
                                                            type="text"
                                                            placeholder="First Name*"
                                                            id="firstName"
                                                            name="firstName"
                                                            onChange={(e) => formik.setFieldValue('firstName', sanitizeNameInput(e.target.value))}
                                                            onBlur={(e) => {
                                                                formik.setFieldValue('firstName', e.target.value.trim());
                                                                formik.handleBlur(e);
                                                            }}
                                                            value={(formik.values as any).firstName || ''}
                                                            className={`w-full px-4 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : 'border-gray-300 focus:border-[--color-primary]'}`}
                                                        />
                                                        {formik.touched.firstName && formik.errors.firstName && <div className="text-red-500 text-[11px] font-medium">{formik.errors.firstName as string}</div>}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Last Name*"
                                                            id="lastName"
                                                            name="lastName"
                                                            onChange={(e) => formik.setFieldValue('lastName', sanitizeNameInput(e.target.value))}
                                                            onBlur={(e) => {
                                                                formik.setFieldValue('lastName', e.target.value.trim());
                                                                formik.handleBlur(e);
                                                            }}
                                                            value={(formik.values as any).lastName || ''}
                                                            className={`w-full px-4 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : 'border-gray-300 focus:border-[--color-primary]'}`}
                                                        />
                                                        {formik.touched.lastName && formik.errors.lastName && <div className="text-red-500 text-[11px] font-medium">{formik.errors.lastName as string}</div>}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <input
                                                        type="email"
                                                        placeholder="Email Address*"
                                                        id="email"
                                                        name="email"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.email || ''}
                                                        className={`w-full px-4 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[--color-primary]'}`}
                                                    />
                                                    {formik.touched.email && formik.errors.email && <div className="text-red-500 text-[11px] font-medium">{formik.errors.email}</div>}
                                                </div>
                                                <div className="space-y-1 phone-input-container">
                                                    <PhoneInput
                                                        country={country?.toLowerCase() || 'in'}
                                                        // disableDropdown={true}
                                                        countryCodeEditable={false}
                                                        enableSearch={true}
                                                        value={formik.values.phone || ''}
                                                        onChange={(phone, countryData: any) => {
                                                            formik.setFieldValue('phone', phone);
                                                            formik.setFieldValue('countryCode', countryData?.dialCode || '');
                                                        }}
                                                        onBlur={() => formik.setFieldTouched('phone', true)}
                                                        containerClass="!w-full !h-10"
                                                        inputClass={`!w-full !h-10 !border !rounded-none !text-base md:!text-sm !transition-all ${formik.touched.phone && formik.errors.phone ? '!border-red-500' : '!border-gray-300 focus:!border-[--color-primary]'}`}
                                                        buttonClass="!border !border-r-0 !rounded-none !bg-gray-50 !border-gray-300"
                                                        placeholder="Phone Number*"
                                                    />
                                                    {formik.touched.phone && formik.errors.phone && <div className="text-red-500 text-[11px] font-medium">{formik.errors.phone}</div>}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="Password*"
                                                            id="password"
                                                            name="password"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.password || ''}
                                                            className={`w-full pl-4 pr-10 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300 focus:border-[--color-primary]'}`}
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
                                                    {formik.touched.password && formik.errors.password && <div className="text-red-500 text-[11px] font-medium">{formik.errors.password}</div>}
                                                </div>

                                                {/* ReCAPTCHA for International */}
                                                <div className="flex flex-col items-center py-2">
                                                    <ReCAPTCHA
                                                        ref={reCaptchaRef}
                                                        sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || ""}
                                                        onChange={handleCaptchaChange}
                                                        onExpired={handleCaptchaExpired}
                                                        theme="light"
                                                        size="normal"
                                                    />
                                                    {captchaError && (
                                                        <div className="text-red-500 text-[11px] font-medium mt-1">{captchaError}</div>
                                                    )}
                                                </div>

                                                {/* Terms & Conditions Checkbox (International Auth) */}
                                                <div className="space-y-1 pt-1">
                                                    <div className="flex items-start gap-2 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            id="agreeTermsInt"
                                                            name="agreeTerms"
                                                            checked={(formik.values as any).agreeTerms || false}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            className="w-4 h-4 rounded border-gray-300 accent-[--color-primary] focus:ring-[--color-primary] cursor-pointer mt-0.5"
                                                        />
                                                        <label htmlFor="agreeTermsInt" className="text-[12px] text-gray-600 font-medium cursor-pointer leading-tight">
                                                            I agree to the{' '}
                                                            <Link href="/policies/terms-and-conditions" target="_blank" className="underline font-bold text-[--color-primary]">
                                                                Terms &amp; Conditions
                                                            </Link>{' '}
                                                            and{' '}
                                                            <Link href="/policies/privacy-policy" target="_blank" className="underline font-bold text-[--color-primary] ">
                                                                Privacy Policy
                                                            </Link>
                                                        </label>
                                                    </div>
                                                    {formik.touched.agreeTerms && formik.errors.agreeTerms ? (
                                                        <div className="text-red-500 text-[11px] font-medium mt-0.5">{formik.errors.agreeTerms as string}</div>
                                                    ) : null}
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-[#A96D56] text-white px-8 h-10 font-bold text-xs tracking-[0.2em] hover:bg-[#995e48] transition-all duration-500 uppercase disabled:opacity-70"
                                                >
                                                    {isLoading ? 'PLEASE WAIT...' : 'SIGN UP'}
                                                </button>

                                                <div className="relative my-2">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-[10px] uppercase">
                                                        <span className="bg-white px-2 text-gray-400 font-bold">Or</span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-center gap-3 px-4 h-10 border border-gray-300 bg-white text-gray-700 text-xs font-bold tracking-wider hover:bg-gray-50 transition-all uppercase"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                    </svg>
                                                    Sign up with Google
                                                </button>
                                            </div>
                                        )}
                                    </form>

                                    <div className="border-t border-gray-50 !mt-1 pt-2">
                                        <p className="text-[13px] text-gray-500 font-medium ">
                                            Already Have An Account?{' '}
                                            <Link  href="/sign-in" className="font-bold text-[#A96D56] hover:text-[#995e48] transition-colors ml-1 uppercase tracking-wider text-xs">
                                                Log In
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

export default SignUp;

