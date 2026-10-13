'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PREFIX } from '@/lib/constants';
import { useFormik } from 'formik';
import { forgotPasswordSchema } from '@/lib/validation-schema';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { successMsg, errorMsg } from '@/lib/toast';

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: forgotPasswordSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const response = await callApi(ENDPOINTS.AUTH.FORGOT_PASSWORD, 'POST', {
                    email: values.email.toLowerCase().trim(),
                });

                if (response?.success || response?.status === 200 || response?.errorCode === 200) {
                    successMsg(response?.message || 'Password reset link sent successfully! Please check your email.');
                    formik.resetForm();
                } else {
                    errorMsg(response?.message || 'Failed to send reset link. Please check the email and try again.');
                }
            } catch (error: any) {
                errorMsg('An error occurred. Please try again.');
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

                    {/* Right Section - Form */}
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

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl serif text-[--color-primary] mb-4 text-center tracking-wide">
                                Forgot Password
                            </h1>

                            {/* Form Box */}
                            <div className="w-full border border-gray-100 overflow-hidden rounded-sm shadow-sm">
                                <div className="bg-[--color-primary] py-4 px-6">
                                    <h2 className="text-white text-lg font-medium tracking-widest uppercase text-[14px]">
                                        Reset Here
                                    </h2>
                                </div>

                                <div className="px-4 py-8 space-y-6 bg-white mb-2">
                                    <p className="text-[13px] text-gray-500 font-medium text-center md:text-left leading-relaxed">
                                        Enter your registered email address below. We will send you a link to reset your password.
                                    </p>

                                    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 !mt-0 py-3">
                                        <div className="space-y-1">
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                id="email"
                                                name="email"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.email}
                                                className={`w-full px-4 py-3 h-10 border outline-none text-gray-800 text-base md:text-sm transition-all ${
                                                    formik.touched.email && formik.errors.email
                                                        ? 'border-red-500'
                                                        : 'border-gray-300 focus:border-[--color-primary]'
                                                }`}
                                            />
                                            {formik.touched.email && formik.errors.email && (
                                                <div className="text-red-500 text-[11px] font-medium">{formik.errors.email}</div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-[--color-primary] text-white px-8 h-10 font-bold text-xs tracking-[0.2em] hover:bg-black transition-all duration-500 uppercase disabled:opacity-70"
                                        >
                                            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                                        </button>
                                    </form>

                                    <div className="pt-2 border-t border-gray-50 !mt-0 text-center">
                                        <Link href="/sign-in" className="font-bold text-[--color-primary] hover:text-black transition-colors uppercase tracking-wider text-xs">
                                            Back To Login
                                        </Link>
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

export default ForgotPassword;
