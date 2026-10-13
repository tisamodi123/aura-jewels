"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error(M.common.somethingWentWrong);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error(M.common.somethingWentWrong);
            return;
        }

        if (!newPassword || !confirmNewPassword) {
            toast.error(M.validation.required);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error(M.auth.passwordsDoNotMatch);
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("token", token);
            formData.append("newPassword", newPassword);
            formData.append("confirmNewPassword", confirmNewPassword);

            const result = await callApi(`${API_URL.RESET_PASSWORD}`, "POST", formData);

            if (result?.errorCode === STATUS_CODE.OK) {
                toast.success(result?.message || M.auth.passwordResetSuccess);
                router.push("/login");
            } else {
                toast.error(result?.message || M.common.somethingWentWrong);
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error(M.common.networkError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[url('/LoginBG.jpg')] bg-cover bg-center">
            {/* Reset Password Box */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg max-w-md w-full">
                {/* Title & Description */}
                <h2 className="text-left font-semibold text-2xl mb-1">Reset Password</h2>
                <p className="text-left text-gray-600 text-xs mb-5">
                    Set a secure, brand-new password for your administrative account.
                </p>

                {/* Reset Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password Input */}
                    <div>
                        <label className="block text-left font-medium text-sm mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter New Password"
                                required
                                className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                                {showNewPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password Input */}
                    <div>
                        <label className="block text-left font-medium text-sm mb-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                required
                                className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Reset Button */}
                    {isLoading ? (
                        <button
                            type="button"
                            className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition duration-300 font-semibold text-sm"
                        >
                            Resetting...
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="hand w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition duration-300 font-semibold text-sm"
                        >
                            Reset Password
                        </button>
                    )}

                    {/* Back to Login */}
                    <div className="text-center text-sm pt-2">
                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="text-black hover:underline font-semibold focus:outline-none"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
                <span className="text-sm font-medium">Loading form...</span>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
