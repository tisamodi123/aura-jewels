'use client';

import { API_URL } from '@/lib/APIUrl';
import { callApi } from '@/lib/callApi';
import { useState } from 'react';
import { toast } from 'sonner';
import { STATUS_CODE } from '@/lib/Constant';
import { M } from '@/lib/messages';

export default function FailedStatusPopUp({ selectedRow, isFaildOpen, setIsFaildOpen, token, setRefresh, setStatusDialog }) {
    const [transactionId, setTransactionId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [remark, setRemark] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setIsFaildOpen(false);
        if (setStatusDialog) setStatusDialog('');
        setErrors({});
        setTransactionId('');
        setRemark('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!transactionId.trim()) {
            newErrors.transactionId = 'Transaction ID is required';
        }

        if (!paymentMethod || paymentMethod === '') {
            newErrors.paymentMethod = 'Please select a payment method';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please enter required fields (Transaction ID)');
            return;
        }
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('status_flag', 'failed');
            formData.append('orderId', selectedRow?._id);
            formData.append('statusId', '23');
            formData.append('transactionId', transactionId);
            formData.append('payment_method', paymentMethod);
            if (remark) formData.append('remark', remark);

            const response = await callApi(`${API_URL.CHANGE_ORDER_STATUS}`, 'POST', formData, token);
            const isSuccess =
                response?.errorCode === STATUS_CODE.OK ||
                response?.errorCode === 200 ||
                response?.statusCode === 200 ||
                response?.success;

            if (isSuccess) {
                toast.success(response?.message || M.order.statusUpdated);
                handleClose();
                if (setRefresh) setRefresh(prev => (typeof prev === 'number' ? prev + 1 : Math.random()));
            } else {
                toast.error(response?.message || M.order.statusUpdateFailed);
            }
        } catch (error) {
            console.log('Error to change order status:', error);
            toast.error(error?.message || M.order.statusUpdateFailed);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        if (field === 'transactionId') setTransactionId(value);
        if (field === 'paymentMethod') setPaymentMethod(value);
        if (field === 'remark') setRemark(value);
    };

    if (!isFaildOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-lg bg-white rounded-lg shadow-xl pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Change Order Status</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none w-6 h-6 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-5">
                            {/* Transaction ID */}
                            <div>
                                <label className="block text-sm font-normal text-gray-700 mb-2">
                                    Transaction Id <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => handleInputChange('transactionId', e.target.value)}
                                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${errors.transactionId
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                />
                                {errors.transactionId && (
                                    <p className="mt-1 text-xs text-red-500">{errors.transactionId}</p>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-normal text-gray-700 mb-2">
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                    className={`w-full px-3 py-2 text-sm border rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 appearance-none cursor-pointer ${errors.paymentMethod
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.5rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem'
                                    }}
                                >
                                    <option value="">Select Payment Method</option>
                                    <option value="razorpay">Razor Pay</option>
                                </select>
                                {errors.paymentMethod && (
                                    <p className="mt-1 text-xs text-red-500">{errors.paymentMethod}</p>
                                )}
                            </div>

                            {/* Remark / Reason */}
                            <div>
                                <label className="block text-sm font-normal text-gray-700 mb-2">
                                    Remark / Reason
                                </label>
                                <textarea
                                    value={remark}
                                    onChange={(e) => handleInputChange('remark', e.target.value)}
                                    rows={4}
                                    className={`w-full px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-1 ${errors.remark
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                />
                                {errors.remark && (
                                    <p className="mt-1 text-xs text-red-500">{errors.remark}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
