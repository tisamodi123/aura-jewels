'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Building2, CreditCard, X, AlertCircle } from 'lucide-react';

export type RefundMethodType = 'wallet' | 'bank' | 'gateway';

export interface CancelRefundPayload {
    refundType?: RefundMethodType;
    refundMethod?: RefundMethodType;
    reason?: string;
    bankDetails?: {
        accountHolderName: string;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    };
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
}

interface CancelRefundModalProps {
    isOpen: boolean;
    isMounted: boolean;
    isSubmitting: boolean;
    title?: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    refundDetails?: any;
    initialRefundMethod?: RefundMethodType;
    initialBankDetails?: {
        accountHolderName?: string;
        accountNumber?: string;
        bankName?: string;
        ifscCode?: string;
    };
    onClose: () => void;
    onConfirm: (payload: CancelRefundPayload) => void;
}

const CancelRefundModal: React.FC<CancelRefundModalProps> = ({
    isOpen,
    isMounted,
    isSubmitting,
    title = "Cancel Request & Refund Options",
    description,
    confirmText = "Submit Cancellation",
    cancelText = "Keep Order",
    refundDetails,
    initialRefundMethod,
    initialBankDetails,
    onClose,
    onConfirm,
}) => {
    const [refundMethod, setRefundMethod] = useState<RefundMethodType>('wallet');

    // Bank Form State
    const [accountHolderName, setAccountHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [ifscCode, setIfscCode] = useState('');

    // Optional Reason State
    const [reason, setReason] = useState('');

    // Error State
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill existing refund details if present when modal opens
    useEffect(() => {
        if (isOpen) {
            const existingType = refundDetails?.refundType || refundDetails?.refundMethod || initialRefundMethod;
            if (existingType === 'bank') {
                setRefundMethod('bank');
            } else if (existingType === 'gateway') {
                setRefundMethod('gateway');
            } else {
                setRefundMethod('wallet');
            }

            const bank = refundDetails?.bankDetails || refundDetails || initialBankDetails || {};
            setAccountHolderName(bank.accountHolderName || '');
            setAccountNumber(bank.accountNumber || '');
            setBankName(bank.bankName || '');
            setIfscCode(bank.ifscCode || '');
            setReason(refundDetails?.reason || '');
            setErrors({});
        }
    }, [isOpen, refundDetails, initialRefundMethod, initialBankDetails]);

    if (!isOpen || !isMounted) return null;

    const validateAndSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (refundMethod === 'bank') {
            if (!accountHolderName.trim()) {
                newErrors.accountHolderName = 'Account Holder Name is required';
            }
            if (!accountNumber.trim()) {
                newErrors.accountNumber = 'Account Number is required';
            }
            if (!bankName.trim()) {
                newErrors.bankName = 'Bank Name is required';
            }
            if (!ifscCode.trim()) {
                newErrors.ifscCode = 'IFSC Code is required';
            } else if (!/^[A-Z0-9]{4,11}$/i.test(ifscCode.trim())) {
                newErrors.ifscCode = 'Please enter a valid IFSC code (e.g. SBIN0001234)';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const cleanReason = reason.trim();
        const payload: CancelRefundPayload = {
            refundType: refundMethod,
            refundMethod,
            ...(cleanReason ? { reason: cleanReason } : {}),
        };

        if (refundMethod === 'bank') {
            const cleanBankDetails = {
                accountHolderName: accountHolderName.trim(),
                accountNumber: accountNumber.trim(),
                bankName: bankName.trim(),
                ifscCode: ifscCode.trim().toUpperCase(),
            };
            payload.bankDetails = cleanBankDetails;
            payload.accountHolderName = cleanBankDetails.accountHolderName;
            payload.accountNumber = cleanBankDetails.accountNumber;
            payload.bankName = cleanBankDetails.bankName;
            payload.ifscCode = cleanBankDetails.ifscCode;
        }

        onConfirm(payload);
    };

    const handleMethodChange = (method: RefundMethodType) => {
        setRefundMethod(method);
        setErrors({});
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
            <div className="bg-white rounded-sm border border-gray-100 p-6 md:p-8 max-w-lg w-full shadow-xl animate-scaleUp my-8 relative max-h-[90vh] flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="mb-4 pr-6">
                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide font-jakarta">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-jakarta leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Optional Reason / Notes Field */}
                <div className="mb-4">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Reason for Cancellation <span className="text-gray-400 font-normal uppercase">(Optional)</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={2}
                        placeholder="Reason for cancellation / notes..."
                        className="w-full p-2.5 text-xs border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#013D3D] bg-white resize-none"
                    />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-jakarta">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Select Refund Option:
                    </p>

                    {/* Options Stack */}
                    <div className="space-y-3">
                        {/* Option 1: Wallet */}
                        <label
                            onClick={() => handleMethodChange('wallet')}
                            className={`flex items-start p-4 rounded-sm border cursor-pointer transition-all ${refundMethod === 'wallet'
                                ? 'border-[#013D3D] bg-[#013D3D]/5 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <input
                                type="radio"
                                name="refundMethod"
                                value="wallet"
                                checked={refundMethod === 'wallet'}
                                onChange={() => handleMethodChange('wallet')}
                                className="mt-1 text-[#013D3D] focus:ring-[#013D3D]"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-[#013D3D]" />
                                    <span className="text-xs font-bold text-gray-900 uppercase">
                                        Wallet
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                    The refund amount will be credited to your wallet after the cancellation is successfully processed.
                                </p>
                            </div>
                        </label>

                        {/* Option 2: Bank Account */}
                        <div
                            className={`rounded-sm border transition-all ${refundMethod === 'bank'
                                ? 'border-[#013D3D] bg-[#013D3D]/5 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <label
                                onClick={() => handleMethodChange('bank')}
                                className="flex items-start p-4 cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="refundMethod"
                                    value="bank"
                                    checked={refundMethod === 'bank'}
                                    onChange={() => handleMethodChange('bank')}
                                    className="mt-1 text-[#013D3D] focus:ring-[#013D3D]"
                                />
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-[#013D3D]" />
                                        <span className="text-xs font-bold text-gray-900 uppercase">
                                            Bank Account
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                        The refund amount will be transferred to your bank account.
                                    </p>
                                </div>
                            </label>

                            {/* Bank Input Fields */}
                            {refundMethod === 'bank' && (
                                <div className="px-4 pb-4 pt-1 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                            Account Holder Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={accountHolderName}
                                            onChange={(e) => {
                                                setAccountHolderName(e.target.value);
                                                if (errors.accountHolderName) setErrors({ ...errors, accountHolderName: '' });
                                            }}
                                            placeholder="e.g. Rahul Sharma"
                                            className={`w-full p-2.5 text-xs border rounded-sm focus:outline-none focus:ring-1 ${errors.accountHolderName ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
                                                }`}
                                        />
                                        {errors.accountHolderName && (
                                            <p className="text-[10px] text-red-500 mt-0.5">{errors.accountHolderName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                            Account Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={accountNumber}
                                            onChange={(e) => {
                                                setAccountNumber(e.target.value);
                                                if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' });
                                            }}
                                            placeholder="e.g. 1234567890"
                                            className={`w-full p-2.5 text-xs border rounded-sm focus:outline-none focus:ring-1 ${errors.accountNumber ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
                                                }`}
                                        />
                                        {errors.accountNumber && (
                                            <p className="text-[10px] text-red-500 mt-0.5">{errors.accountNumber}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                            Bank Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={bankName}
                                            onChange={(e) => {
                                                setBankName(e.target.value);
                                                if (errors.bankName) setErrors({ ...errors, bankName: '' });
                                            }}
                                            placeholder="e.g. State Bank of India"
                                            className={`w-full p-2.5 text-xs border rounded-sm focus:outline-none focus:ring-1 ${errors.bankName ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
                                                }`}
                                        />
                                        {errors.bankName && (
                                            <p className="text-[10px] text-red-500 mt-0.5">{errors.bankName}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                            IFSC Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={ifscCode}
                                            onChange={(e) => {
                                                setIfscCode(e.target.value.toUpperCase());
                                                if (errors.ifscCode) setErrors({ ...errors, ifscCode: '' });
                                            }}
                                            placeholder="e.g. SBIN0001234"
                                            className={`w-full p-2.5 text-xs border rounded-sm uppercase focus:outline-none focus:ring-1 ${errors.ifscCode ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
                                                }`}
                                        />
                                        {errors.ifscCode && (
                                            <p className="text-[10px] text-red-500 mt-0.5">{errors.ifscCode}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Option 3: Original Payment Method (Gateway) */}
                        <label
                            onClick={() => handleMethodChange('gateway')}
                            className={`flex items-start p-4 rounded-sm border cursor-pointer transition-all ${refundMethod === 'gateway'
                                ? 'border-[#013D3D] bg-[#013D3D]/5 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <input
                                type="radio"
                                name="refundMethod"
                                value="gateway"
                                checked={refundMethod === 'gateway'}
                                onChange={() => handleMethodChange('gateway')}
                                className="mt-1 text-[#013D3D] focus:ring-[#013D3D]"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[#013D3D]" />
                                    <span className="text-xs font-bold text-gray-900 uppercase">
                                        Original Payment Method
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                    The refund amount will be refunded to your original payment method via the gateway.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Warning note */}
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm flex items-start gap-2 text-[11px] text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                            Please verify your details carefully. Cancellation cannot be undone once submitted.
                        </span>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-4 mt-2 border-t border-gray-100 font-jakarta">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 border border-gray-200 text-gray-700 text-[11px] font-bold tracking-widest px-4 py-2.5 rounded-sm uppercase hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={validateAndSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold tracking-widest px-4 py-2.5 rounded-sm uppercase transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {isSubmitting ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CancelRefundModal;
