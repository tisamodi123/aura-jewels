"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import * as Yup from 'yup';
import { Form, useFormik } from "formik";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { getCookie, setCookie } from 'cookies-next';
import { PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { getToken, saveToken } from "@/lib/auth";

const LoginPage = () => {
    const router = useRouter();
    const token = getToken();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Password visibility state

    const { touched, errors, values, handleChange, handleBlur, handleSubmit, resetForm } = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Email is required."),
            password: Yup.string().required("Required"),
        }),
        onSubmit: async (userData) => {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('email', userData?.email)
            formData.append('password', userData?.password)

            try {
                const data = await callApi(`${API_URL.LOGIN}`, "POST", formData);
                if (data?.errorCode == STATUS_CODE.OK) {
                    saveToken(data?.accessToken)
                    toast?.success(data.message || M.auth.loggedIn);
                    window.location.href = (PREFIX || '') + '/dashboard';
                } else {
                    toast?.error(data.message || M.auth.invalidCredentials);
                    resetForm();
                }
            } catch (error) {
                console.error('Network error:', error);
                toast?.error(M.common.networkError);
                resetForm();
            } finally {
                setIsLoading(false);
            }
        }
    });

    useEffect(() => {
        if (token) {
            router.push('/dashboard');
        }
    }, [token, router])

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[url('/LoginBG.jpg')] bg-cover bg-center">
            {/* Login Box */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg max-w-md w-full">
                {/* Title & Description */}
                <h2 className="text-left font-semibold text-2xl mb-1">Login</h2>
                <p className="text-left text-gray-600 text-xs mb-5">
                    Log in to access your account and explore all features.
                </p>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="block text-left font-medium text-sm mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter Email Address"
                            className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                        />
                        {touched?.email && errors?.email && <p className="text-red-500 text-xs mt-1 text-left">{errors?.email}</p>}
                    </div>

                    {/* Password Input with Eye Icon */}
                    <div>
                        <label className="block text-left font-medium text-sm mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter Password"
                                className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    // Eye Icon (Password Visible)
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                ) : (
                                    // Eye-Off Icon (Password Hidden)
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {touched?.password && errors?.password && <p className="text-red-500 text-xs mt-1 text-left">{errors?.password}</p>}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right text-sm">
                        <Link
                            href="/forgot-password"
                            className="text-black hover:underline font-semibold focus:outline-none"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Login Button */}
                    {isLoading ? (
                        <button
                            type="button"
                            className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition duration-300 font-semibold text-sm"
                        >
                            Loading...
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="hand w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition duration-300 font-semibold text-sm"
                        >
                            Login
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
