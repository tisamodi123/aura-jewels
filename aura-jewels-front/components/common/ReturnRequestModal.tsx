'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Building2, CreditCard, X, AlertCircle } from 'lucide-react';

export type RefundMethodType = 'wallet' | 'bank' | 'gateway';

export interface ReturnRefundPayload {
    reason: string;
    refundType?: RefundMethodType;
    refundMethod?: RefundMethodType;
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

interface ReturnRequestModalProps {
    isOpen: boolean;
    isMounted: boolean;
    isSubmitting: boolean;
    title?: string;
    description: React.ReactNode;
    returnReason?: string;
    returnError?: string;
    setReturnReason?: (val: string) => void;
    setReturnError?: (val: string) => void;
    initialRefundMethod?: RefundMethodType;
    initialBankDetails?: {
        accountHolderName?: string;
        accountNumber?: string;
        bankName?: string;
        ifscCode?: string;
    };
    onClose: () => void;
    onConfirm: (payload: ReturnRefundPayload) => void;
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
    isOpen,
    isMounted,
    isSubmitting,
    title = "Request Return & Refund Options",
    description,
    returnReason: propReturnReason = "",
    returnError: propReturnError = "",
    setReturnReason: propSetReturnReason,
    setReturnError: propSetReturnError,
    initialRefundMethod = "wallet",
    initialBankDetails,
    onClose,
    onConfirm,
}) => {
    // Return Reason State
    const [reason, setReason] = useState(propReturnReason);
    const [reasonError, setReasonError] = useState(propReturnError);

    // Refund Method State
    const [refundMethod, setRefundMethod] = useState<RefundMethodType>('wallet');

    // Bank Form State
    const [accountHolderName, setAccountHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [ifscCode, setIfscCode] = useState('');

    // Error State
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Keep internal reason state synced with prop if provided
    useEffect(() => {
        setReason(propReturnReason);
    }, [propReturnReason]);

    useEffect(() => {
        setReasonError(propReturnError);
    }, [propReturnError]);

    // Reset/init form when modal opens
    useEffect(() => {
        if (isOpen) {
            setRefundMethod(initialRefundMethod || 'wallet');
            setReason(propReturnReason || '');
            setReasonError('');

            const bank = initialBankDetails || {};
            setAccountHolderName(bank.accountHolderName || '');
            setAccountNumber(bank.accountNumber || '');
            setBankName(bank.bankName || '');
            setIfscCode(bank.ifscCode || '');
            setErrors({});
        }
    }, [isOpen, initialRefundMethod, initialBankDetails]);

    if (!isOpen || !isMounted) return null;

    const handleReasonChange = (val: string) => {
        setReason(val);
        if (propSetReturnReason) propSetReturnReason(val);

        if (val.trim()) {
            setReasonError("");
            if (propSetReturnError) propSetReturnError("");
        }
    };

    const validateAndSubmit = () => {
        const newErrors: Record<string, string> = {};

        const cleanReason = reason.trim();
        if (!cleanReason) {
            setReasonError("Return reason is required");
            if (propSetReturnError) propSetReturnError("Return reason is required");
            newErrors.reason = "Return reason is required";
        }

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

        const payload: ReturnRefundPayload = {
            reason: cleanReason,
            refundType: refundMethod,
            refundMethod,
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
            <div className="bg-white rounded-sm border border-gray-100 p-6 md:p-8 max-w-lg w-full shadow-xl animate-scaleUp my-8 relative max-h-[90vh] flex flex-col font-jakarta">
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
                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Return Reason Field */}
                <div className="mb-4">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Reason for Return <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        rows={3}
                        placeholder="Type your reason here (e.g. Wrong size, didn't match description...)"
                        className={`w-full p-2.5 text-xs border rounded-sm focus:outline-none focus:ring-1 resize-none ${
                            reasonError || errors.reason
                                ? 'border-red-500 focus:ring-red-500 bg-red-50/20'
                                : 'border-gray-300 focus:ring-[#013D3D] bg-white'
                        }`}
                    />
                    {(reasonError || errors.reason) && (
                        <p className="text-[10px] text-red-500 mt-0.5">{reasonError || errors.reason}</p>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Select Refund Option:
                    </p>

                    {/* Options Stack */}
                    <div className="space-y-3">
                        {/* Option 1: Wallet */}
                        <label
                            onClick={() => handleMethodChange('wallet')}
                            className={`flex items-start p-4 rounded-sm border cursor-pointer transition-all ${
                                refundMethod === 'wallet'
                                    ? 'border-[#013D3D] bg-[#013D3D]/5 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                            <input
                                type="radio"
                                name="returnRefundMethod"
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
                                    The refund amount will be credited to your wallet once your return request is processed and verified.
                                </p>
                            </div>
                        </label>

                        {/* Option 2: Bank Account */}
                        <div
                            className={`rounded-sm border transition-all ${
                                refundMethod === 'bank'
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
                                    name="returnRefundMethod"
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
                                        The refund amount will be transferred directly to your bank account.
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
                                            className={`w-full p-2.5 text-xs border rounded-sm focus:outline-none focus:ring-1 ${
                                                errors.accountHolderName ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
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
                                            className={`w-full p-2.5 text-xs border rounded-sm focus:outline-none focus:ring-1 ${
                                                errors.accountNumber ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
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
                                            className={`w-full p-2.5 text-xs border rounded-sm focus:outline-none focus:ring-1 ${
                                                errors.bankName ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
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
                                            className={`w-full p-2.5 text-xs border rounded-sm uppercase focus:outline-none focus:ring-1 ${
                                                errors.ifscCode ? 'border-red-500 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-[#013D3D] bg-white'
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
                            className={`flex items-start p-4 rounded-sm border cursor-pointer transition-all ${
                                refundMethod === 'gateway'
                                    ? 'border-[#013D3D] bg-[#013D3D]/5 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                            <input
                                type="radio"
                                name="returnRefundMethod"
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
                                    The refund amount will be credited back to your original payment method via the payment gateway.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Warning Note */}
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm flex items-start gap-2 text-[11px] text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                            Please verify your details carefully before submitting your return request.
                        </span>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-4 mt-2 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 border border-gray-200 text-gray-700 text-[11px] font-bold tracking-widest px-4 py-2.5 rounded-sm uppercase hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={validateAndSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-[#013D3D] hover:bg-[#022A2A] text-white text-[11px] font-bold tracking-widest px-4 py-2.5 rounded-sm uppercase transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReturnRequestModal;
