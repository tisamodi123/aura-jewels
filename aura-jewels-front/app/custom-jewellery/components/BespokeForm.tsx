'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';

// Bespoke Form Sub-components
import ProductDetailsSection from './bespoke/ProductDetailsSection';
import InspirationSection from './bespoke/InspirationSection';
import MetalDetailsSection from './bespoke/MetalDetailsSection';
import StonePreferencesSection from './bespoke/StonePreferencesSection';
import BudgetSection from './bespoke/BudgetSection';
import PersonalisationSection from './bespoke/PersonalisationSection';
import RemarksSection from './bespoke/RemarksSection';
import ContactInfoSection from './bespoke/ContactInfoSection';
import SuccessModal from './bespoke/SuccessModal';
import OtpModal from './bespoke/OtpModal';
import { BespokeFormValues } from './bespoke/types';
import { useGlobleStore } from '@/store/globleStore';
import { bespokeFormSchema } from '@/lib/validation-schema';
import { customOrderService, createCustomOrder } from '@/services/productService';
import { STATUS_CODE } from '@/lib/constants';
import { stoneOptions } from '@/components/commonts/constVariable';
import { errorMsg, successMsg } from '@/lib/toast';
import { getUser } from '@/services/clientCookies';
import { trackLeadSubmitted } from '@/services/trackingService';

export default function BespokeForm() {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
    const [jewelleryTypes, setJewelleryTypes] = useState<{ value: string; label: string; hasSize?: boolean }[]>([]);
    const [metalOptions, setMetalOptions] = useState<{ value: string; label: string }[]>([]);
    const [ringSizes, setRingSizes] = useState<{ value: string; label: string; category?: string }[]>([]);
    const [userData, setUserData] = useState<any>(null);

    const { country } = useGlobleStore();
    const isIndia = country === 'IN';

    console.log("isIndia ----->", country)

    // useEffect to get catagory and metal type
    useEffect(() => {
        catagoryAndMetalType();
        const user = getUser();
        if (user) {
            setUserData(user);
        }
    }, []);

    // function get catagory and metal type
    const catagoryAndMetalType = async () => {
        try {
            const res = await customOrderService();

            if (res && res.status === STATUS_CODE.OK && res.data) {
                const { category = [], metals = [], ringSizes = [] } = res.data;

                const types = category
                    .map((cat: any) => ({
                        value: cat._id,
                        label: cat.name || cat.categoryName,
                        hasSize: cat.hasSize,
                    }))
                    .filter(
                        (c: any) =>
                            c.value &&
                            c.label?.trim().toLowerCase() !== "for him"
                    );

                setJewelleryTypes([...types, { value: "Other", label: "Other" }]);

                // const types = category.map((cat: any) => ({
                //     value: cat._id,
                //     label: cat.name || cat.categoryName,
                //     hasSize: cat.hasSize
                // })).filter((c: any) => c.value);
                // setJewelleryTypes([...types, { value: 'Other', label: 'Other' }]);

                const metalList = metals.map((m: any) => ({ value: m._id || m.name || m.type, label: m.name || m.type })).filter((m: any) => m.value);
                setMetalOptions([...metalList, { value: 'Not Sure', label: 'Not Sure ?' }]);

                const sizesList = ringSizes.map((sz: any) => ({
                    value: sz._id,
                    label: sz.name || sz.code || `Size ${sz.name}`,
                    category: sz.category
                })).filter((sz: any) => sz.value);

                // console.log("sizesList _________>", sizesList)

                setRingSizes(sizesList);
            }
        } catch (error) {
            console.log('Failed to fetch categories and metal types:', error);
        }
    };


    // handle form submission
    // Helper to build FormData
    const getSubmitFormData = (values: BespokeFormValues, otpValue?: string) => {
        const formData = new FormData();

        // Text fields
        if (values.categoryId && values.categoryId !== 'Other') {
            formData.append('categoryId', values.categoryId);
        }
        if (values.otherProduct) {
            formData.append('otherProduct', values.otherProduct);
        }
        formData.append('metalId', values.metalId);
        formData.append('ringSizeId', values.ringSizeId);
        formData.append('braceletSize', values.braceletSize);
        formData.append('gemstonePreference', values.gemstonePreference);
        formData.append('engraving', values.engraving);
        formData.append('remarks', values.remarks);
        formData.append('firstName', values.firstName);
        formData.append('lastName', values.lastName);
        formData.append('email', values.email);
        formData.append('countryCode', values.countryCode);
        formData.append('country', values.country);
        formData.append('referenceUrls', JSON.stringify(values.referenceUrls.filter(Boolean)));

        // Numeric fields
        formData.append('approxMetalWeight', String(parseFloat(values.approxMetalWeight) || 0));
        formData.append('approxStoneWeight', String(parseFloat(values.approxStoneWeight) || 0));
        formData.append('budget', String(parseFloat(values.budget) || 0));

        // Mapped enum
        formData.append('stoneType', values.stoneType);

        // Phone number without country dial code prefix
        const dialCode = values.countryCode.replace(/\D/g, '');
        const cleanPhone = dialCode && values.mobileNumber.startsWith(dialCode)
            ? values.mobileNumber.slice(dialCode.length)
            : values.mobileNumber;
        formData.append('mobileNumber', cleanPhone);

        // Attachments
        if (values.attachments?.length > 0) {
            values.attachments.forEach(file => formData.append('attachments', file));
        }

        // Add OTP code if present
        if (otpValue) {
            formData.append('otp', otpValue);
        }

        return formData;
    };

    // handle OTP verification
    const handleOtpSubmit = async (otpValue: string) => {
        setIsOtpSubmitting(true);
        try {
            const formData = getSubmitFormData(formik.values, otpValue);
            const res = await createCustomOrder(formData);

            console.log("createCustomOrder OTP verification response======>>", res);

            if (res && (res.status === STATUS_CODE.OK || res.errorCode === STATUS_CODE.OK || res.success)) {
                successMsg(res?.message || 'Your bespoke jewelry inquiry has been submitted successfully!');
                // try {
                //     trackLeadSubmitted({
                //         name: `${formik.values.firstName} ${formik.values.lastName}`.trim(),
                //         email: formik.values.email,
                //         phone: formik.values.mobileNumber,
                //         firstName: formik.values.firstName,
                //         lastName: formik.values.lastName
                //     }, "Bespoke Enquiry", undefined, "Bespoke Jewelry Form Submission");
                // } catch (err) {
                //     console.error('[Tracking] Bespoke lead error:', err);
                // }
                setShowOtpModal(false);
                setShowSuccessModal(true);
            } else {
                errorMsg(res?.message || 'Invalid verification code. Please try again.');
            }
        } catch (error) {
            console.log('Failed to verify OTP:', error);
            errorMsg('Failed to verify OTP. Please try again.');
        } finally {
            setIsOtpSubmitting(false);
        }
    };

    // handle resending OTP
    const handleResendOtp = async () => {
        try {
            const formData = getSubmitFormData(formik.values);
            const res = await createCustomOrder(formData);

            console.log("createCustomOrder resend OTP response======>>", res);

            if (res && (res.status === STATUS_CODE.OK || res.errorCode === STATUS_CODE.OK || res.success || res.data?.otpRequired)) {
                successMsg(res?.message || 'Verification code sent/resent successfully.');
            } else {
                errorMsg(res?.message || 'Failed to resend verification code. Please try again.');
            }
        } catch (error) {
            console.log('Failed to resend OTP:', error);
            errorMsg('Failed to resend verification code. Please try again.');
        }
    };

    // handle form submission
    const formik = useFormik<BespokeFormValues>({
        initialValues: {
            categoryId: jewelleryTypes[0]?.value || '',
            otherProduct: '',
            metalId: metalOptions[0]?.value || '',
            approxMetalWeight: '',
            ringSizeId: '',
            braceletSize: '',
            stoneType: stoneOptions[0]?.value || '',
            approxStoneWeight: '',
            gemstonePreference: '',
            budget: '',
            engraving: '',
            remarks: '',
            firstName: userData?.firstName || (userData?.name ? userData.name.split(' ')[0] : ''),
            lastName: userData?.lastName || (userData?.name ? userData.name.split(' ').slice(1).join(' ') : ''),
            email: userData?.email || '',
            mobileNumber: userData ? (
                (() => {
                    const phone = userData.phone || userData.mobileNumber || '';
                    const code = (userData.countryCode || '+91').replace('+', '');
                    if (String(phone).startsWith(code)) return String(phone);
                    return `${code}${phone}`;
                })()
            ) : (isIndia ? '91' : ''),
            countryCode: userData?.countryCode || (isIndia ? '+91' : ''),
            referenceUrls: [''],
            attachments: [] as File[],
            country: country,
        },
        enableReinitialize: true,
        validationSchema: bespokeFormSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const formData = getSubmitFormData(values);

                // Log and submit
                Array.from(formData.entries()).forEach(([k, v]) => console.log(`${k}:`, v));
                const res = await createCustomOrder(formData);

                console.log("createCustomOrder response======>>", res);

                if (res && res.data?.otpRequired) {
                    successMsg(res?.message || 'Verification code sent to your mobile/email.');
                    setShowOtpModal(true);
                } else if (res && (res?.emailVerificationRequired || res?.data?.emailVerificationRequired)) {
                    successMsg(res?.message);
                    setShowSuccessModal(false);
                } else if (res && (res.status === STATUS_CODE.OK || res.errorCode === STATUS_CODE.OK || res.success)) {
                    successMsg(res?.message || 'Your bespoke jewelry inquiry has been submitted successfully!');
                    // try {
                    //     trackLeadSubmitted({
                    //         name: `${values.firstName} ${values.lastName}`.trim(),
                    //         email: values.email,
                    //         phone: values.mobileNumber,
                    //         firstName: values.firstName,
                    //         lastName: values.lastName
                    //     }, "Bespoke Enquiry", undefined, "Bespoke Jewelry Form Submission");
                    // } catch (err) {
                    //     console.error('[Tracking] Bespoke lead error:', err);
                    // }
                    setShowSuccessModal(true);
                } else {
                    errorMsg(res?.message || 'Failed to submit bespoke inquiry. Please try again.');
                }
            } catch (error) {
                console.log('Failed to submit bespoke request:', error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    // handle category id change
    const handleCategoryIdChange = (typeId: string) => {
        formik.setFieldValue('categoryId', typeId);

        if (typeId !== 'Other') {
            formik.setFieldValue('otherProduct', '');
        }
        // The size picker binds to `ringSizeId` for every sized category
        // (rings, bracelets/bangles, necklaces). A size id only belongs to one
        // category's list, so always clear the previous pick when switching —
        // MetalDetailsSection re-shows the picker (populated from the new
        // category's sizes) when the newly-selected category has hasSize=true.
        formik.setFieldValue('ringSizeId', '');
        formik.setFieldValue('braceletSize', '');
    };

    // reset form
    const resetForm = () => {
        formik.resetForm();
        setShowSuccessModal(false);
    };

    // Auto-scroll to the first validation error
    useEffect(() => {
        if (formik.submitCount > 0 && !formik.isValid) {
            const firstErrorKey = Object.keys(formik.errors)[0];
            if (firstErrorKey) {
                let errorElement = document.getElementsByName(firstErrorKey)[0];
                if (!errorElement) {
                    errorElement = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement;
                }
                if (!errorElement && firstErrorKey === 'mobileNumber') {
                    errorElement = document.querySelector('input[type="tel"]') as HTMLElement;
                }
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }, [formik.submitCount, formik.isValid, formik.errors]);

    const phoneNumber = formik.values.mobileNumber.replace(/^91/, "");

    return (
        <div className="bg-white border border-stone-200/80 p-6 md:p-10 shadow-lg rounded-sm">
            <form onSubmit={formik.handleSubmit} className="space-y-8 font-dm-sans">

                {/* 1. Product Type Selector */}
                <ProductDetailsSection
                    formik={formik}
                    jewelleryTypes={jewelleryTypes}
                    onJewelleryTypeChange={handleCategoryIdChange}
                />

                {/* 2. Upload Your Inspiration */}
                <InspirationSection formik={formik} />

                {/* 3. Metal Details */}
                <MetalDetailsSection
                    formik={formik}
                    metalOptions={metalOptions}
                    jewelleryTypes={jewelleryTypes}
                    ringSizes={ringSizes.filter((sz) => sz.category === formik.values.categoryId)}
                />

                {/* 4. Stone & Gemstone Preferences */}
                <StonePreferencesSection
                    formik={formik}
                    stoneOptions={stoneOptions}
                />

                {/* 5. Budget */}
                <BudgetSection formik={formik} />

                {/* 6. Personalisation */}
                <PersonalisationSection formik={formik} />

                {/* 7. Additional Remarks */}
                <RemarksSection formik={formik} />

                {/* 8. Contact Information */}
                <ContactInfoSection formik={formik} />

                {/* Submit action block */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-black hover:bg-[#B57A5A] text-white transition-colors duration-300 py-4 px-6 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1 rounded-sm cursor-pointer disabled:opacity-50"
                    >
                        {formik.isSubmitting ? 'Sending Request...' : 'CREATE MY BESPOKE JEWELLERY >'}
                    </button>
                    <p className="text-[11px] text-stone-400 font-light text-center leading-normal">
                        Our bespoke jewellery specialists will review your request and contact you within 24-48 business hours with the next steps.
                    </p>
                </div>

            </form>

            {/* Sizing charts now open as a standalone page in a new tab (see
                MetalDetailsSection), so an in-progress request isn't disturbed. */}

            {/* Submission confirmation modal overlay */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={resetForm}
                values={formik.values}
                jewelleryTypes={jewelleryTypes}
                metalOptions={metalOptions}
                ringSizes={ringSizes}
            />

            {/* OTP verification modal overlay */}
            <OtpModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onVerify={handleOtpSubmit}
                onResend={handleResendOtp}
                isSubmitting={isOtpSubmitting}
                contactInfo={
                    isIndia
                        ? `${formik.values.countryCode} ${phoneNumber}`
                        : formik.values.email
                }
            />
        </div>
    );
}
