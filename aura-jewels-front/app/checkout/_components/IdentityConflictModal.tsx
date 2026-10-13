import React from 'react';
import Link from 'next/link';
import { Mail, Phone, AlertTriangle, X, LogIn } from 'lucide-react';

interface AccountDetails {
    email?: string;
    phone?: string;
}

interface IdentityConflictModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    emailAccount?: AccountDetails | null;
    phoneAccount?: AccountDetails | null;
    enteredEmail?: string;
    enteredPhone?: string;
}

export const IdentityConflictModal: React.FC<IdentityConflictModalProps> = ({
    isOpen,
    title,
    message,
    onClose,
    emailAccount,
    phoneAccount,
    enteredEmail,
    enteredPhone
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-sm shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-[#FCF8EC] border-b border-[#F5EEDC] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FEF3C7] flex items-center justify-center border border-[#FDE68A] shrink-0">
                            <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                        </div>
                        <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-gray-900 font-jakarta">{title || "Details Mismatched"}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 font-jakarta">
                    <p className="text-[12px] text-gray-500 mb-5 leading-relaxed whitespace-pre-wrap font-jakarta">
                        {message || "The details you entered match existing accounts with different combinations. Please review:"}
                    </p>

                    {/* Account Cards */}
                    <div className="space-y-3 mb-4">
                        {/* Card 1: Email Account */}
                        <div className="border border-gray-200 bg-[#FAFAFA] rounded-sm p-4">
                            <div className="flex items-center gap-2 mb-2.5 text-[#A96D56] font-black text-[10px] uppercase tracking-[0.15em] font-jakarta">
                                <Mail className="w-3.5 h-3.5 text-[#A96D56]" />
                                <span>Account for entered email</span>
                            </div>
                            <div className="space-y-1.5 text-[12px] text-gray-500 font-jakarta">
                                <div>
                                    Email: <span className="font-bold text-gray-900">{emailAccount?.email || enteredEmail || "-"}</span>
                                </div>
                                <div>
                                    Linked Phone: {emailAccount?.phone ? (
                                        <span className="font-bold text-gray-900">{emailAccount.phone}</span>
                                    ) : (
                                        <span className="font-medium text-gray-400 italic">Not Registered</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Phone Account */}
                        <div className="border border-gray-200 bg-[#FAFAFA] rounded-sm p-4">
                            <div className="flex items-center gap-2 mb-2.5 text-[#013D3D] font-black text-[10px] uppercase tracking-[0.15em] font-jakarta">
                                <Phone className="w-3.5 h-3.5 text-[#A96D56]" />
                                <span className='text-[#A96D56]'>Account for entered phone</span>
                            </div>
                            <div className="space-y-1.5 text-[12px] text-gray-500 font-jakarta">
                                <div>
                                    Phone: <span className="font-bold text-gray-900">{phoneAccount?.phone || enteredPhone || "-"}</span>
                                </div>
                                <div>
                                    Linked Email: {phoneAccount?.email ? (
                                        <span className="font-bold text-gray-900">{phoneAccount.email}</span>
                                    ) : (
                                        <span className="font-medium text-gray-400 italic">Not Registered</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice Block */}
                    <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-sm p-3.5 text-[11px] text-[#1E40AF] mb-5 leading-relaxed font-medium font-jakarta">
                        <span className="font-bold">Need help?</span> Please sign in with your registered account or contact customer support for assistance.
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end mt-5">
                        <button
                            onClick={onClose}
                            className="px-5 py-3 border border-gray-200 text-gray-500 font-black uppercase tracking-[0.15em] text-[10px] rounded-sm hover:bg-gray-50 transition font-jakarta text-center"
                        >
                            Edit Form Details
                        </button>
                        <Link
                            href={`/sign-in?next=${encodeURIComponent('/checkout')}`}
                            className="px-6 py-3 bg-[#A96D56] text-white hover:bg-opacity-95 font-black uppercase tracking-[0.15em] text-[10px] rounded-sm transition text-center font-jakarta flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
