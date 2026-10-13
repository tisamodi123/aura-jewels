import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    verifyType: 'email' | 'phone';
    email: string;
    phone: string;
    tempCountryCode: string;
    tempMobileNumber: string;
    emailOtp: string;
    setEmailOtp: (val: string) => void;
    verifying: boolean;
    sendingOtp: boolean;
    submitEmailOtp: () => void;
    handleResendOtp: () => void;
    onChangeMobileNumber: () => void;
}

export default function OtpVerificationModal({
    isOpen,
    onClose,
    verifyType,
    email,
    phone,
    tempCountryCode,
    tempMobileNumber,
    emailOtp,
    setEmailOtp,
    verifying,
    sendingOtp,
    submitEmailOtp,
    handleResendOtp,
    onChangeMobileNumber,
}: OtpVerificationModalProps) {
    const [mounted, setMounted] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimer(30);
        }
    }, [isOpen]);

    useEffect(() => {
        if (timer <= 0 || !isOpen) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, isOpen]);

    const onResendClick = () => {
        handleResendOtp();
        setTimer(30);
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg serif text-gray-900 mb-1">
                    Verify {verifyType === 'email' ? 'Email' : 'Mobile Number'}
                </h3>
                <p className="text-xs text-gray-500 font-jakarta mb-4">
                    We sent a 6-digit code to{' '}
                    <b>
                        {verifyType === 'email'
                            ? email
                            : (tempMobileNumber ? (tempCountryCode + ' ' + tempMobileNumber) : phone)}
                    </b>
                    .
                    {verifyType === 'phone' && !phone && (
                        <button
                            type="button"
                            onClick={onChangeMobileNumber}
                            className="text-[#B57A5A] font-bold underline ml-1 hover:text-black transition-colors block mt-1"
                        >
                            Change mobile number
                        </button>
                    )}
                </p>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter code"
                    className="w-full border border-gray-200 py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] rounded-md tracking-[0.3em] text-center mb-4"
                />
                <div className="flex gap-3">
                    <button
                        onClick={submitEmailOtp}
                        disabled={verifying}
                        className="flex-1 bg-[#B57A5A] text-white py-2 text-sm font-jakarta tracking-widest hover:opacity-90 disabled:opacity-50"
                    >
                        {verifying ? 'VERIFYING…' : 'VERIFY'}
                    </button>
                    <button
                        onClick={onResendClick}
                        disabled={sendingOtp || timer > 0}
                        className="px-4 bg-white text-[#B57A5A] border border-[#B57A5A] py-2 text-sm font-jakarta hover:bg-gray-50 disabled:opacity-50 min-w-[120px]"
                    >
                        {sendingOtp ? '…' : timer > 0 ? `Resend (${timer}s)` : 'Resend'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
