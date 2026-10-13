import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface AddMobileModalProps {
    isOpen: boolean;
    onClose: () => void;
    tempCountryCode: string;
    setTempCountryCode: (val: string) => void;
    tempMobileNumber: string;
    setTempMobileNumber: (val: string) => void;
    sendingOtp: boolean;
    submitMobileNumber: () => void;
    title?: string;
}

export default function AddMobileModal({
    isOpen,
    onClose,
    tempCountryCode,
    setTempCountryCode,
    tempMobileNumber,
    setTempMobileNumber,
    sendingOtp,
    submitMobileNumber,
    title,
}: AddMobileModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg serif text-gray-900 mb-1">{title || 'Add Mobile Number'}</h3>
                <p className="text-xs text-gray-500 font-jakarta mb-4 font-medium">
                    Please enter your country code and mobile number below.
                </p>

                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value="+91"
                        disabled
                        readOnly
                        placeholder="+91"
                        className="w-20 border border-gray-200 py-2 px-3 text-sm font-jakarta outline-none bg-gray-50 text-gray-500 cursor-not-allowed select-none rounded-md text-center"
                    />
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={tempMobileNumber}
                        onChange={(e) => setTempMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter mobile number"
                        className="flex-1 border border-gray-200 py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] rounded-md"
                    />
                </div>

                <button
                    onClick={submitMobileNumber}
                    disabled={sendingOtp}
                    className="w-full bg-[#B57A5A] text-white py-2 text-sm font-jakarta tracking-widest hover:opacity-90 disabled:opacity-50"
                >
                    {sendingOtp ? 'SENDING CODE…' : 'SEND OTP'}
                </button>
            </div>
        </div>,
        document.body
    );
}
