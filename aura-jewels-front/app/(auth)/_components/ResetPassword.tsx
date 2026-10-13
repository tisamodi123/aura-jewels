'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PREFIX } from '@/lib/constants';
import { useFormik } from 'formik';
import { resetPasswordSchema } from '@/lib/validation-schema';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { successMsg, errorMsg } from '@/lib/toast';
import { Loader2, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

const ResetPasswordContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const hasCalled = useRef(false);

    useEffect(() => {
        if (!token) {
            setTokenStatus('invalid');
            return;
        }

        const verifyToken = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;

            try {
                const response = await callApi(ENDPOINTS.AUTH.CHECK_RESET_TOKEN, 'POST', { token });
                if (response?.errorCode === 200) {
                    setTokenStatus('valid');
                } else {
                    setTokenStatus('invalid');
                }
            } catch (error) {
                console.error('Error checking token status:', error);
                setTokenStatus('invalid');
            }
        };

        verifyToken();
    }, [token]);

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: resetPasswordSchema,
        onSubmit: async (values) => {
            if (!token) {
                errorMsg('Verification token is missing.');
                return;
            }

            setIsLoading(true);
            try {
                const response = await callApi(ENDPOINTS.AUTH.RESET_PASSWORD, 'POST', {
                    token: token,
                    newPassword: values.password,
                    confirmNewPassword: values.confirmPassword,
                });

                if (response?.success || response?.status === 200 || response?.errorCode === 200) {
                    successMsg(response?.message || 'Password reset successful! Redirecting to login...');
                    setTimeout(() => {
                        router.push('/sign-in');
                    }, 2000);
                } else {
                    errorMsg(response?.message || 'Failed to reset password. The link might have expired.');
                }
            } catch (error: any) {
                errorMsg('An error occurred during password reset.');
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
                    {/* Left Section - Image */}
                    <div className="w-full md:w-1/2 h-[80vh] hidden md:flex relative overflow-hidden p-10">
                        <Image
                            src={`${PREFIX}/images/auth/authImage.jpg`}
                            alt="Luxury Jewelry"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Right Section - Form / Loading / Error states */}
                    <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
                        <div className="w-full max-w-md flex flex-col items-center animate-fadeIn">
                            {/* Logo */}
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
                                Reset Password
                            </h1>

                            {/* Container */}
                            <div className="w-full border border-gray-100 overflow-hidden rounded-sm shadow-sm bg-white">
                                {tokenStatus === 'loading' && (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 space-y-4">
                                        <Loader2 className="h-10 w-10 text-[--color-primary] animate-spin" />
                                        <h2 className="text-lg font-medium text-gray-800 tracking-wide uppercase text-[13px]">
                                            Verifying Reset Link...
                                        </h2>
                                        <p className="text-xs text-gray-500 text-center">
                                            Please wait while we validate your secure token.
                                        </p>
                                    </div>
                                )}

                                {tokenStatus === 'invalid' && (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
                                        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                                            <AlertCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h2 className="text-lg font-medium text-red-700 tracking-wide uppercase text-[13px]">
                                                Link Invalid or Expired
                                            </h2>
                                            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                                This password reset link is invalid, expired, or has already been used. Please request a new one.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <Link
                                                href="/forgot-password"
                                                className="w-full bg-[--color-primary] text-white py-3 text-center font-bold text-xs tracking-[0.2em] hover:bg-black transition-all duration-500 uppercase rounded-sm"
                                            >
                                                Request New Link
                                            </Link>
                                            <Link
                                                href="/sign-in"
                                                className="w-full border border-gray-300 py-3 text-center text-gray-700 font-bold text-xs tracking-[0.2em] hover:bg-gray-50 transition-all duration-500 uppercase rounded-sm"
                                            >
                                                Back to Login
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {tokenStatus === 'valid' && (
                                    <>
                                        <div className="bg-[--color-primary] py-4 px-6">
                                            <h2 className="text-white text-lg font-medium tracking-widest uppercase text-[14px]">
                                                New Password
                                            </h2>
                                        </div>

                                        <div className="px-4 py-8 space-y-6 bg-white mb-2">
                                            <p className="text-[13px] text-gray-500 font-medium text-center md:text-left leading-relaxed">
                                                Please enter and confirm your new secure password below.
                                            </p>

                                            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 !mt-0 py-3">
                                                {/* Password input */}
                                                <div className="space-y-1">
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="New Password"
                                                            id="password"
                                                            name="password"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.password}
                                                            className={`w-full px-4 pr-10 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.password && formik.errors.password
                                                                ? 'border-red-500'
                                                                : 'border-gray-300 focus:border-[--color-primary]'
                                                                }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {formik.touched.password && formik.errors.password && (
                                                        <div className="text-red-500 text-[11px] font-medium">{formik.errors.password}</div>
                                                    )}
                                                </div>

                                                {/* Confirm Password input */}
                                                <div className="space-y-1">
                                                    <div className="relative">
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            placeholder="Confirm New Password"
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.confirmPassword}
                                                            className={`w-full px-4 pr-10 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${formik.touched.confirmPassword && formik.errors.confirmPassword
                                                                ? 'border-red-500'
                                                                : 'border-gray-300 focus:border-[--color-primary]'
                                                                }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                                        <div className="text-red-500 text-[11px] font-medium">{formik.errors.confirmPassword}</div>
                                                    )}
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-[--color-primary] text-white px-8 h-10 font-bold text-xs tracking-[0.2em] hover:bg-black transition-all duration-500 uppercase disabled:opacity-70"
                                                >
                                                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ResetPassword = () => {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ResetPasswordContent />
        </React.Suspense>
    );
};

export default ResetPassword;
