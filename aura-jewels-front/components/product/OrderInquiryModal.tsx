import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { X } from 'lucide-react';
import { orderInquirySchema } from '@/lib/validation-schema';
import { createInquiry } from '@/services/inquiryService';
import { errorMsg, successMsg } from '@/lib/toast';
import { getUser } from '@/services/clientCookies';
import { useGlobleStore } from '@/store/globleStore';
import PhoneInput from 'react-phone-input-2';
import SuccessMessage from '@/components/common/SuccessMessage';
import 'react-phone-input-2/lib/style.css';

interface ProductInfo {
    itemCode?: string;
    sku?: string;
    _id?: string;
    productTitle?: string;
    title?: string;
    name?: string;
}

interface OrderInquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductInfo | null | undefined;
}

interface UserData {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    mobileNumber?: string;
    countryCode?: string;
}

export default function OrderInquiryModal({ isOpen, onClose, product }: OrderInquiryModalProps) {
    const { country } = useGlobleStore();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [userData, setUserData] = useState<UserData | null>(null);

    // Get product SKU or itemCode
    const productSku = product?.itemCode || product?.sku || product?._id || '';
    const displayTitle = product?.productTitle || product?.title || product?.name || '';

    useEffect(() => {
        if (isOpen) {
            const user = getUser();
            if (user) {
                setUserData(user);
            }
            setStep('form');
        }
    }, [isOpen]);

    const formik = useFormik({
        initialValues: {
            sku: String(productSku || ''),
            name: String(userData?.name || (userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : '')),
            email: String(userData?.email || ''),
            mobileNumber: String(userData?.phone || userData?.mobileNumber || ''),
            countryCode: String(userData?.countryCode || '').replace(/\D/g, '') || '1',
            notes: '',
        },
        enableReinitialize: true,
        validationSchema: orderInquirySchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const countryCodeNumeric = values.countryCode || '1';
                const cleanPhone = values.mobileNumber.startsWith(countryCodeNumeric)
                    ? values.mobileNumber.slice(countryCodeNumeric.length)
                    : values.mobileNumber;

                const payload = {
                    sku: values.sku,
                    name: values.name,
                    email: values.email,
                    mobileNumber: cleanPhone,
                    countryCode: `+${countryCodeNumeric}`,
                    notes: values.notes,
                };

                const res = await createInquiry(payload);

                if (res && (res.status === 200 || res.status === 201 || res.errorCode === 201 || res.errorCode === 200 || res.success)) {
                    successMsg(res?.message || 'Your inquiry has been submitted successfully!');
                    setStep('success');
                } else {
                    errorMsg(res?.message || 'Failed to submit inquiry. Please try again.');
                }
            } catch (error: any) {
                console.log('Failed to submit inquiry request:', error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    if (!isOpen) return null;

    // Helper for input styles to keep code DRY and consistent
    const getInputClass = (fieldName: 'name' | 'email') => {
        const hasError = formik.touched[fieldName] && formik.errors[fieldName];
        return `w-full bg-white border ${hasError ? 'border-red-500' : 'border-stone-200'
            } focus:border-[#013D3D] focus:ring-1 focus:ring-[#013D3D] rounded-sm py-2.5 px-3.5 text-xs text-stone-800 transition-colors`;
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-stone-200 shadow-2xl p-6 md:p-8 max-w-lg w-full rounded-sm relative animate-scaleIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    disabled={formik.isSubmitting}
                >
                    <X className="w-5 h-5" />
                </button>

                {step === 'form' ? (
                    <div className="space-y-2">
                        <div className="text-center space-y-2">
                            <h3 className="font-el-messiri text-2xl md:text-3xl text-[#1A1A1A] font-normal">
                                Product Inquiry
                            </h3>
                            <p className="font-dm-sans font-light text-stone-500 text-sm leading-relaxed max-w-md mx-auto">
                                Interested in <strong className="text-[#013D3D]">{displayTitle}</strong>? Please fill out the form below and our international advisor will contact you.
                            </p>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-2 font-dm-sans">
                            {/* SKU Field */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">Product SKU / Code</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formik.values.sku}
                                    readOnly
                                    className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-3.5 text-xs text-stone-600 cursor-not-allowed font-medium"
                                />
                            </div>

                            {/* Name Field */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter your full name"
                                    className={getInputClass('name')}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-[10px] text-red-500 mt-0.5">{String(formik.errors.name)}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter your email address"
                                    className={getInputClass('email')}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p className="text-[10px] text-red-500 mt-0.5">{String(formik.errors.email)}</p>
                                )}
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">Phone Number *</label>
                                <PhoneInput
                                    country={(!country || country.toLowerCase() === 'in') ? 'us' : country.toLowerCase()}
                                    excludeCountries={['in']}
                                    countryCodeEditable={false}
                                    enableSearch={true}
                                    value={formik.values.mobileNumber}
                                    onChange={(phone, countryData: any) => {
                                        formik.setFieldValue('mobileNumber', phone);
                                        if (countryData?.dialCode) {
                                            formik.setFieldValue('countryCode', countryData.dialCode);
                                        }
                                    }}
                                    onBlur={() => formik.setFieldTouched('mobileNumber', true)}
                                    containerClass="phone-input-container !w-full"
                                    inputClass={`!w-full !h-10 !bg-white !border !rounded-sm !text-xs !text-stone-800 !transition-all ${formik.touched.mobileNumber && formik.errors.mobileNumber
                                        ? '!border-red-500'
                                        : '!border-stone-200 focus:!border-[#013D3D] focus:!ring-1 focus:!ring-[#013D3D]'
                                        }`}
                                    buttonClass="!border !border-r-0 !rounded-l-sm !bg-stone-50 !border-stone-200"
                                    placeholder="Enter your phone number"
                                />
                                {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                                    <p className="text-[10px] text-red-500 mt-0.5">{String(formik.errors.mobileNumber)}</p>
                                )}
                            </div>

                            {/* Notes Field */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">Inquiry Notes / Special Requests</label>
                                <textarea
                                    name="notes"
                                    value={formik.values.notes}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    rows={3}
                                    placeholder="e.g. customized dimensions, metal preference, delivery timeline requests..."
                                    className="w-full bg-white border border-stone-200 focus:border-[#013D3D] focus:ring-1 focus:ring-[#013D3D] rounded-sm py-2.5 px-3.5 text-xs text-stone-800 resize-none transition-colors"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="w-full bg-black hover:bg-[#013D3D] text-white transition-colors duration-300 py-3.5 text-xs uppercase tracking-widest font-bold flex items-center justify-center rounded-sm cursor-pointer disabled:opacity-50"
                                >
                                    {formik.isSubmitting ? 'Submitting Inquiry...' : 'Submit Order Inquiry'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <SuccessMessage
                        name={formik.values.name}
                        productName={displayTitle}
                        sku={formik.values.sku}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
}