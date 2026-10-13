'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Check } from 'lucide-react';
import { useFormik } from 'formik';
import { profileSchema, sanitizeNameInput } from '@/lib/validation-schema';
import { getProfile, updateProfile, requestEmailVerify, confirmEmailVerify } from '@/services/profileService';
import { getToken, setUser } from '@/services/clientCookies';
import { successMsg, errorMsg } from '@/lib/toast';
import { useGlobleStore } from '@/store/globleStore';
import DatePicker from "react-datepicker";
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";

import OccasionDetails from './_components/OccasionDetails';
import OtpVerificationModal from './_components/OtpVerificationModal';
import AddMobileModal from './_components/AddMobileModal';

const customSelectStyles = {
    control: (provided: any, state: any) => ({
        ...provided,
        minHeight: '38px',
        height: '38px',
        width: '100%',
        borderRadius: '0.375rem',
        borderColor: state.isFocused ? '#B57A5A' : '#E5E7EB',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxShadow: 'none',
        backgroundColor: 'white',
        '&:hover': {
            borderColor: state.isFocused ? '#B57A5A' : '#D1D5DB'
        }
    }),
    valueContainer: (provided: any) => ({
        ...provided,
        padding: '0 12px',
        height: '36px',
    }),
    input: (provided: any) => ({
        ...provided,
        margin: '0',
        padding: '0',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    indicatorsContainer: (provided: any) => ({
        ...provided,
        height: '36px',
    }),
    dropdownIndicator: (provided: any) => ({
        ...provided,
        padding: '2px 6px',
        color: '#1A1A1A',
        '&:hover': {
            color: '#B57A5A'
        }
    }),
    menu: (provided: any) => ({
        ...provided,
        borderRadius: '0.375rem',
        marginTop: '4px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 50,
        border: '1px solid #E5E7EB',
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        fontSize: '14px',
        fontFamily: 'inherit',
        backgroundColor: state.isSelected ? '#B57A5A' : state.isFocused ? '#FAF6F3' : 'white',
        color: state.isSelected ? 'white' : '#1A1A1A',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#B57A5A',
            color: 'white'
        }
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: '#1A1A1A',
        fontFamily: 'inherit',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#D1D5DB',
        fontFamily: 'inherit',
    })
};

const toDate = (v: any): Date | null => (v ? new Date(v) : null);
const fmt = (v: any): string => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
};

type Occasion = { recipient: string; type: string; date: string | Date | null };

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { country } = useGlobleStore();
    const isIndia = country === 'IN';

    // Snapshot of the last loaded profile — CANCEL restores THIS, not blanks.
    const loadedRef = useRef<any>(null);

    // Occasions (recipient / important date / occasion type).
    const [occasions, setOccasions] = useState<Occasion[]>([]);

    // Email verification modal.
    const [emailOtpOpen, setEmailOtpOpen] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyType, setVerifyType] = useState<'email' | 'phone'>('email');

    // Mobile verification modal states.
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [tempMobileNumber, setTempMobileNumber] = useState('');
    const [tempCountryCode, setTempCountryCode] = useState('+91');

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            whatsappNumber: '',
            isWhatsAppSame: false,
            gender: '',
            birthday: null as Date | null,
            anniversary: null as Date | null,
            instagram: '',
            facebook: '',
            emailVerified: false,
            phoneVerified: false,
            phoneCountryCode: '',
        },
        validationSchema: profileSchema,
        onSubmit: async (values) => {
            setIsSaving(true);
            try {
                const payload: any = {
                    name: `${values.firstName} ${values.lastName}`.trim(),
                    email: values.email || '',
                    whatsappNumber: values.whatsappNumber ? Number(values.whatsappNumber) : null,
                    gender: values.gender || '',
                    dob: values.birthday || null,
                    anniversary: values.anniversary || null,
                    instagram: values.instagram || '',
                    facebook: values.facebook || '',
                    occasions,
                };
                const res = await updateProfile(payload);
                if (res?.errorCode === 200 || res?.status === 200 || res?.success) {
                    successMsg('Profile updated successfully');
                    if (res?.user) applyUser(res.user);
                } else {
                    errorMsg(res?.message || 'Failed to update profile');
                }
            } catch (error: any) {
                console.error("Update profile error:", error);
                errorMsg(error?.message || 'Something went wrong');
            } finally {
                setIsSaving(false);
            }
        },
    });

    // Maps an API user object into form state + snapshot.
    const applyUser = (user: any) => {
        const nameParts = (user.name || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const isWhatsAppSame = !!(user.phone && user.whatsappNumber && String(user.phone) === String(user.whatsappNumber));
        const values = {
            firstName,
            lastName,
            email: user.email || '',
            phone: user.phone ? String(user.phone) : '',
            whatsappNumber: user.whatsappNumber ? String(user.whatsappNumber) : '',
            isWhatsAppSame,
            gender: user.gender || '',
            birthday: toDate(user.dob),
            anniversary: toDate(user.anniversary),
            instagram: user.instagram || '',
            facebook: user.facebook || '',
            emailVerified: !!user.emailVerified,
            phoneVerified: !!user.phoneVerified,
            phoneCountryCode: user.phoneCountryCode || '+91',
        };
        formik.setValues(values);
        loadedRef.current = values;
        setOccasions(Array.isArray(user.occasions) ? user.occasions : []);
        setUser(user);
    };

    const loadProfileData = async (showLoadingSpinner = false) => {
        if (showLoadingSpinner) setLoading(true);
        try {
            const res = await getProfile();
            if (res?.user) {
                applyUser(res.user);
            } else if (res?.errorCode === 401 || res?.errorCode === 403) {
                router.replace('/sign-in');
                return;
            } else {
                errorMsg(res?.message || "Failed to load profile data");
            }
        } catch (error) {
            console.error("Fetch profile error:", error);
            errorMsg("Failed to load profile data");
        } finally {
            if (showLoadingSpinner) setLoading(false);
        }
    };

    useEffect(() => {
        if (!getToken()) {
            router.replace('/sign-in');
            return;
        }
        loadProfileData(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (formik.values.isWhatsAppSame) {
            formik.setFieldValue('whatsappNumber', formik.values.phone);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.phone, formik.values.isWhatsAppSame]);

    const handleCancel = () => {
        if (loadedRef.current) formik.setValues(loadedRef.current);
    };

    // ---- Verification (Email / Phone) --------------------------------------
    const openEmailVerify = async (type: 'email' | 'phone' = 'email') => {
        setVerifyType(type);
        const val = type === 'email' ? formik.values.email : formik.values.phone;
        if (type === 'email') {
            if (!val) { errorMsg('Enter your email first'); return; }
            if (formik.errors.email) { errorMsg('Enter a valid email'); return; }
        } else {
            if (!val) { errorMsg('Phone number is missing'); return; }
            setTempMobileNumber(formik.values.phone);
            setTempCountryCode(formik.values.phoneCountryCode || '+91');
        }
        setSendingOtp(true);
        try {
            const res = await requestEmailVerify(type, val, type === 'phone' ? formik.values.phoneCountryCode : undefined);
            if (res?.errorCode === 200) {
                successMsg(`Verification code sent to your ${type === 'email' ? 'email' : 'mobile number'}`);
                setEmailOtp('');
                setEmailOtpOpen(true);
            } else {
                errorMsg(res?.message || 'Could not send code');
            }
        } catch (error) {
            console.error(error);
            errorMsg('Could not send code');
        } finally {
            setSendingOtp(false);
        }
    };

    const openChangeMobile = () => {
        setTempMobileNumber(formik.values.phone || '');
        setTempCountryCode(formik.values.phoneCountryCode || '+91');
        setIsMobileModalOpen(true);
    };

    const submitMobileNumber = async () => {
        if (!tempMobileNumber.trim()) {
            errorMsg('Please enter your mobile number');
            return;
        }
        if (!/^[0-9]{10}$/.test(tempMobileNumber.trim())) {
            errorMsg('Mobile number must be exactly 10 digits');
            return;
        }
        if (!tempCountryCode.trim()) {
            errorMsg('Please enter a country code');
            return;
        }
        setSendingOtp(true);
        try {
            const res = await requestEmailVerify('phone', tempMobileNumber.trim(), tempCountryCode.trim());
            if (res?.errorCode === 200) {
                successMsg('Verification code sent to your mobile number');
                setEmailOtp('');
                setIsMobileModalOpen(false);
                setVerifyType('phone');
                setEmailOtpOpen(true);
            } else {
                errorMsg(res?.message || 'Could not send code');
            }
        } catch (error) {
            console.error(error);
            errorMsg('Could not send code');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        setSendingOtp(true);
        try {
            if (verifyType === 'email') {
                const res = await requestEmailVerify('email', formik.values.email);
                if (res?.errorCode === 200) {
                    successMsg('Verification code sent to your email');
                } else {
                    errorMsg(res?.message || 'Could not send code');
                }
            } else {
                const phoneVal = formik.values.phone || tempMobileNumber;
                const countryCodeVal = formik.values.phoneCountryCode || tempCountryCode;
                const res = await requestEmailVerify('phone', phoneVal, countryCodeVal);
                if (res?.errorCode === 200) {
                    successMsg('Verification code sent to your mobile number');
                } else {
                    errorMsg(res?.message || 'Could not send code');
                }
            }
        } catch (error) {
            console.error(error);
            errorMsg('Could not send code');
        } finally {
            setSendingOtp(false);
        }
    };

    const submitEmailOtp = async () => {
        if (!emailOtp.trim()) { errorMsg('Enter the code'); return; }
        setVerifying(true);
        try {
            const val = verifyType === 'email' ? formik.values.email : (formik.values.phone || tempMobileNumber);
            const countryCodeVal = verifyType === 'phone' ? (formik.values.phoneCountryCode || tempCountryCode) : undefined;
            const res = await confirmEmailVerify(verifyType, val, emailOtp.trim(), countryCodeVal);
            if (res?.errorCode === 200) {
                successMsg(`${verifyType === 'email' ? 'Email' : 'Mobile number'} verified`);
                if (verifyType === 'email') {
                    formik.setFieldValue('emailVerified', true);
                    if (loadedRef.current) loadedRef.current.emailVerified = true;
                } else {
                    formik.setFieldValue('phone', tempMobileNumber || formik.values.phone);
                    formik.setFieldValue('phoneCountryCode', tempCountryCode || formik.values.phoneCountryCode);
                    formik.setFieldValue('phoneVerified', true);
                    if (loadedRef.current) {
                        loadedRef.current.phone = tempMobileNumber || formik.values.phone;
                        loadedRef.current.phoneCountryCode = tempCountryCode || formik.values.phoneCountryCode;
                        loadedRef.current.phoneVerified = true;
                    }
                }
                await loadProfileData();
                setEmailOtpOpen(false);
            } else {
                errorMsg(res?.message || 'Invalid or expired code');
            }
        } catch (error) {
            console.error(error);
            errorMsg('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="bg-[#FAF6F3] border border-gray-100 p-8">
                    <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
                    </div>
                </div>
            </div>
        );
    }

    const inputCls = (err?: any, touched?: any) =>
        `w-full border py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] placeholder:text-gray-300 shadow-sm rounded-md transition-colors duration-200 hover:border-gray-300 ${touched && err ? 'border-red-500' : 'border-gray-200'}`;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Personal Information */}
            <div className="bg-[#FAF6F3] shadow-sm border border-gray-100">
                <div className="bg-[#F5EBE4] py-3 px-6">
                    <h3 className="text-xl serif text-gray-800">Personal Information</h3>
                </div>
                <form onSubmit={formik.handleSubmit} className="p-6 md:p-8 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">First Name <span className="text-red-500">*</span></label>
                            <input type="text" name="firstName" placeholder="Enter First Name" className={inputCls(formik.errors.firstName, formik.touched.firstName)}
                                value={formik.values.firstName} onChange={(e) => formik.setFieldValue('firstName', sanitizeNameInput(e.target.value))} onBlur={(e) => { formik.setFieldValue('firstName', e.target.value.trim()); formik.handleBlur(e); }} />
                            {formik.touched.firstName && formik.errors.firstName && <p className="text-[10px] text-red-500 font-jakarta">{formik.errors.firstName as string}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">Last Name <span className="text-red-500">*</span></label>
                            <input type="text" name="lastName" placeholder="Enter Last Name" className={inputCls(formik.errors.lastName, formik.touched.lastName)}
                                value={formik.values.lastName} onChange={(e) => formik.setFieldValue('lastName', sanitizeNameInput(e.target.value))} onBlur={(e) => { formik.setFieldValue('lastName', e.target.value.trim()); formik.handleBlur(e); }} />
                            {formik.touched.lastName && formik.errors.lastName && <p className="text-[10px] text-red-500 font-jakarta">{formik.errors.lastName as string}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta flex items-center gap-2 flex-wrap">
                                Email ID
                                {formik.values.emailVerified ? (
                                    <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-2 rounded border border-green-200 uppercase tracking-wider select-none">
                                        <Check className="w-3.5 h-3.5" /> Verified
                                    </span>
                                ) : formik.values.email && (
                                    <button type="button" onClick={() => openEmailVerify('email')} disabled={sendingOtp}
                                        className="inline-flex items-center gap-0.5 bg-[#B57A5A] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider disabled:opacity-50">
                                        {sendingOtp && verifyType === 'email' ? 'Sending…' : 'Verify'}
                                    </button>
                                )}
                            </label>
                            <input type="email" name="email" placeholder="Enter Your Email" disabled className={inputCls(formik.errors.email, formik.touched.email) + " disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"}
                                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {formik.touched.email && formik.errors.email && <p className="text-[10px] text-red-500 font-jakarta">{formik.errors.email}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta flex items-center gap-2 flex-wrap">
                                Mobile No
                                {formik.values.phoneVerified ? (
                                    <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-2 rounded border border-green-200 uppercase tracking-wider select-none">
                                        <Check className="w-3.5 h-3.5" /> Verified
                                    </span>
                                ) : (formik.values.phone && isIndia) ? (
                                    <button type="button" onClick={() => openEmailVerify('phone')} disabled={sendingOtp}
                                        className="inline-flex items-center gap-0.5 bg-[#B57A5A] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider disabled:opacity-50">
                                        {sendingOtp && verifyType === 'phone' ? 'Sending…' : 'Verify'}
                                    </button>
                                ) : null}
                            </label>
 
                            {(formik.values.phone || !isIndia) ? (
                                <div className="flex items-stretch shadow-sm">
                                    <div className="flex items-center justify-center bg-gray-50 px-3 border border-r-0 border-gray-200 text-gray-500 text-sm font-semibold select-none rounded-l-md">{formik.values.phoneCountryCode || '+91'}</div>
                                    <input type="tel" name="phone" readOnly title="Mobile number is your login"
                                        className={`flex-1 border py-2 px-4 text-sm font-jakarta outline-none border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed ${isIndia ? 'border-r-0' : 'rounded-r-md'}`}
                                        value={formik.values.phone} />
                                    {isIndia && (
                                        <button type="button" onClick={openChangeMobile}
                                            className="px-4 border border-gray-200 bg-white text-[#B57A5A] text-xs font-bold font-jakarta rounded-r-md hover:bg-gray-50 transition-colors">
                                            Change
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button type="button" onClick={() => setIsMobileModalOpen(true)}
                                    className="w-full border border-dashed border-[#B57A5A] text-[#B57A5A] py-2 px-4 text-sm font-bold font-jakarta rounded-md hover:bg-[#FAF6F3] transition-colors flex items-center justify-center gap-2">
                                    + Add Mobile Number
                                </button>
                            )}
                            <label className="flex items-center space-x-2 mt-1 cursor-pointer select-none">
                                <input type="checkbox" name="isWhatsAppSame" checked={formik.values.isWhatsAppSame}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        formik.setFieldValue('isWhatsAppSame', checked);
                                        if (checked) formik.setFieldValue('whatsappNumber', formik.values.phone);
                                    }}
                                    className="w-4 h-4 rounded text-[#B57A5A] focus:ring-[#B57A5A] border-gray-300 cursor-pointer" />
                                <span className="text-xs text-gray-500 font-jakarta">This is my WhatsApp number</span>
                            </label>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">WhatsApp No (Opt)</label>
                            <div className="flex items-stretch shadow-sm">
                                <div className="flex items-center justify-center bg-gray-50 px-3 border border-r-0 border-gray-200 text-gray-500 text-sm font-semibold select-none rounded-l-md">{formik.values.phoneCountryCode || '+91'}</div>
                                <input type="tel" name="whatsappNumber" placeholder="Enter WhatsApp Number" maxLength={10} disabled={formik.values.isWhatsAppSame}
                                    className={`flex-1 border py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] placeholder:text-gray-300 rounded-r-md border-gray-200 hover:border-gray-300 transition-colors ${formik.values.isWhatsAppSame ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${formik.touched.whatsappNumber && formik.errors.whatsappNumber ? 'border-red-500' : ''}`}
                                    value={formik.values.whatsappNumber}
                                    onChange={(e) => formik.setFieldValue('whatsappNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    onBlur={formik.handleBlur} />
                            </div>
                            {formik.touched.whatsappNumber && formik.errors.whatsappNumber && <p className="text-[10px] text-red-500 font-jakarta">{formik.errors.whatsappNumber as string}</p>}
                        </div>
                        <div className="space-y-1.5 w-full">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">Gender</label>
                            <Select
                                instanceId="gender-select"
                                options={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                value={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' }
                                ].find(opt => opt.value === formik.values.gender) || null}
                                onChange={(val: any) => formik.setFieldValue('gender', val?.value || '')}
                                placeholder="Select Gender"
                                styles={customSelectStyles}
                                isSearchable={false}
                                className="font-jakarta text-[14px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">Date Of Birth</label>
                            <div className="relative">
                                <DatePicker selected={formik.values.birthday} onChange={(date: Date | null) => formik.setFieldValue('birthday', date)}
                                    dateFormat="dd-MM-yyyy" placeholderText="Select Date Of Birth" maxDate={new Date()} showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                                    className="w-full border border-gray-200 py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] bg-white shadow-sm rounded-md hover:border-gray-300 transition-colors" wrapperClassName="w-full" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><Calendar className="w-4 h-4 text-gray-400" /></div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">Anniversary</label>
                            <div className="relative">
                                <DatePicker selected={formik.values.anniversary} onChange={(date: Date | null) => formik.setFieldValue('anniversary', date)}
                                    dateFormat="dd-MM-yyyy" placeholderText="Select Anniversary" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100}
                                    className="w-full border border-gray-200 py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] bg-white shadow-sm rounded-md hover:border-gray-300 transition-colors" wrapperClassName="w-full" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><Calendar className="w-4 h-4 text-gray-400" /></div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">Instagram ID (Opt)</label>
                            <input type="text" name="instagram" placeholder="Enter Your Instagram ID" className="w-full border border-gray-200 py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] placeholder:text-gray-300 shadow-sm rounded-md hover:border-gray-300 transition-colors"
                                value={formik.values.instagram} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 font-jakarta">Facebook ID (Opt)</label>
                            <input type="text" name="facebook" placeholder="Enter Your Facebook ID" className="w-full border border-gray-200 py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] placeholder:text-gray-300 shadow-sm rounded-md hover:border-gray-300 transition-colors"
                                value={formik.values.facebook} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={isSaving} className="bg-[#B57A5A] text-white py-2 font-jakarta tracking-widest hover:opacity-90 mt-2 disabled:opacity-50 cursor-pointer w-[150px] md:w-[200px]">
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </button>
                        <button type="button" onClick={handleCancel} className="bg-white text-[#B57A5A] border border-[#B57A5A] py-2 font-jakarta tracking-widest hover:bg-gray-50 mt-2 cursor-pointer w-[150px] md:w-[200px]">
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>

            {/* Occasion Details */}
            <OccasionDetails
                occasions={occasions}
                setOccasions={setOccasions}
                isSaving={isSaving}
                onSubmit={() => formik.submitForm()}
                errorMsg={errorMsg}
            />

            {/* OTP verification modal */}
            <OtpVerificationModal
                isOpen={emailOtpOpen}
                onClose={() => setEmailOtpOpen(false)}
                verifyType={verifyType}
                email={formik.values.email}
                phone={formik.values.phone}
                tempCountryCode={tempCountryCode}
                tempMobileNumber={tempMobileNumber}
                emailOtp={emailOtp}
                setEmailOtp={setEmailOtp}
                verifying={verifying}
                sendingOtp={sendingOtp}
                submitEmailOtp={submitEmailOtp}
                handleResendOtp={handleResendOtp}
                onChangeMobileNumber={() => {
                    setEmailOtpOpen(false);
                    setIsMobileModalOpen(true);
                }}
            />

            {/* Add Mobile Number Modal */}
            <AddMobileModal
                isOpen={isMobileModalOpen}
                onClose={() => setIsMobileModalOpen(false)}
                tempCountryCode={tempCountryCode}
                setTempCountryCode={setTempCountryCode}
                tempMobileNumber={tempMobileNumber}
                setTempMobileNumber={setTempMobileNumber}
                sendingOtp={sendingOtp}
                submitMobileNumber={submitMobileNumber}
                title={formik.values.phone ? 'Change Mobile Number' : 'Add Mobile Number'}
            />
        </div>
    );
}