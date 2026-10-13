'use client';

import { API_URL } from '@/lib/APIUrl';
import { callApi } from '@/lib/callApi';
import { useState } from 'react';
import { toast } from 'sonner';
import { STATUS_CODE } from '@/lib/Constant';
import { M } from '@/lib/messages';

export default function SuccessPopUp({ selectedRow, isOpen, setIsOpen, token, setRefresh, setStatusDialog }) {
    const [transactionId, setTransactionId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
        if (setStatusDialog) setStatusDialog('');
        setErrors({});
        setTransactionId('');
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
            formData.append('status_flag', 'success');
            formData.append('orderId', selectedRow?._id);
            formData.append('statusId', '26');
            formData.append('transactionId', transactionId);
            formData.append('payment_method', paymentMethod);

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
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop with blur effect */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-lg bg-white rounded-lg shadow-xl pointer-events-auto transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Change Order Status</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Id <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => handleInputChange('transactionId', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.transactionId
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                />
                                {errors.transactionId && (
                                    <p className="mt-1 text-xs text-red-500">{errors.transactionId}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-700 ${errors?.paymentMethod
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                >
                                    <option value="">Select Payment Method</option>
                                    <option value="razorpay">Razor Pay</option>
                                </select>
                                {errors?.paymentMethod && (
                                    <p className="mt-1 text-xs text-red-500">{errors?.paymentMethod}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
