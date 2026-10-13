"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error(M.validation.required);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error(M.validation.emailInvalid);
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("email", email);

            const result = await callApi(`${API_URL.FORGOT_PASSWORD}`, "POST", formData);

            if (result?.errorCode === STATUS_CODE.OK) {
                toast.success(result?.message || M.auth.resetLinkSent);
                setEmail("");
                router.push("/login");
            } else {
                toast.error(result?.message || M.common.somethingWentWrong);
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error(M.common.networkError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[url('/LoginBG.jpg')] bg-cover bg-center">
            {/* Box */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg max-w-md w-full">
                {/* Title & Description */}
                <h2 className="text-left font-semibold text-2xl mb-1">Forgot Password</h2>
                <p className="text-left text-gray-600 text-xs mb-5">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="block text-left font-medium text-sm mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter Email Address"
                            required
                            className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                        />
                    </div>

                    {/* Submit Button */}
                    {isLoading ? (
                        <button
                            type="button"
                            className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition duration-300 font-semibold text-sm"
                        >
                            Sending...
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="hand w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition duration-300 font-semibold text-sm"
                        >
                            Send Reset Link
                        </button>
                    )}

                    {/* Back to Login */}
                    <div className="text-center text-sm pt-2">
                        <Link
                            href="/login"
                            className="text-black hover:underline font-semibold focus:outline-none"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
