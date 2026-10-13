import React, { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { errorMsg } from '@/lib/toast';

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    isSubmitting: boolean;
    contactInfo: string;
}

export default function OtpModal({
    isOpen,
    onClose,
    onVerify,
    onResend,
    isSubmitting,
    contactInfo,
}: OtpModalProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '', '', '']);
            setTimer(30);
            // Focus the first input after the modal animation completes
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (timer > 0 && isOpen) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer, isOpen]);

    if (!isOpen) return null;

    const handleChange = (val: string, i: number) => {
        if (!/^\d*$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[i] = val.slice(-1);
        setOtp(newOtp);
        if (val && i < 5) {
            inputRefs.current[i + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

    const handleVerifyClick = () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            errorMsg('Please enter a valid 6-digit OTP');
            return;
        }
        onVerify(otpValue);
    };

    const handleResendClick = async () => {
        if (timer > 0 || isResending) return;
        setIsResending(true);
        try {
            await onResend();
            setTimer(30);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-stone-200 shadow-2xl p-8 max-w-md w-full rounded-sm text-center relative space-y-6 animate-scaleIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    disabled={isSubmitting}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Lock Icon */}
                <div className="w-16 h-16 bg-[#B57A5A] rounded-full flex items-center justify-center mx-auto text-white">
                    <Lock className="w-8 h-8" />
                </div>

                {/* Modal Title */}
                <h3 className="font-el-messiri text-2xl text-[#1A1A1A] font-normal">
                    Enter Verification Code
                </h3>

                {/* Subtitle */}
                <p className="font-dm-sans font-light text-stone-500 leading-relaxed text-sm">
                    We have sent a 6-digit OTP code to <br />
                    <strong className="text-[#B57A5A]">{contactInfo}</strong>.
                    Please enter it below to verify your request.
                </p>

                {/* OTP Input Fields */}
                <div className="flex gap-2 sm:gap-3 justify-center !mt-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-10 h-12 border border-stone-300 rounded-md text-center text-xl font-bold focus:border-[#B57A5A] focus:ring-1 focus:ring-[#B57A5A] outline-none transition-all font-dm-sans"
                            disabled={isSubmitting}
                        />
                    ))}
                </div>

                {/* Timer and Resend Option */}
                <div className="text-center font-dm-sans text-xs text-stone-500">
                    {timer > 0 ? (
                        <span>
                            Resend code in <strong className="text-[#B57A5A]">{timer}s</strong>
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResendClick}
                            disabled={isResending || isSubmitting}
                            className="text-[#B57A5A] font-semibold hover:underline cursor-pointer disabled:opacity-50"
                        >
                            {isResending ? 'Resending...' : 'Resend OTP'}
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <button
                        type="button"
                        onClick={handleVerifyClick}
                        disabled={isSubmitting}
                        className="bg-[#B57A5A] hover:bg-black text-white transition-colors duration-300 py-3.5 px-8 text-xs font-semibold uppercase tracking-widest rounded-sm cursor-pointer w-full disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Verifying...' : 'Verify & Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
