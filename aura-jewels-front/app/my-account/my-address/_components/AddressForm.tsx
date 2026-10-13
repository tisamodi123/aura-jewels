'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { addressSchema } from '@/lib/validation-schema';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from '@/services/clientCookies';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { getCountries } from '@/services/countryService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface AddressFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    initialValues?: any;
}

const parsePhoneDetails = (rawPhone: any) => {
    if (!rawPhone) return { fullValue: '91', dialCode: '+91', localNum: '' };
    const str = String(rawPhone).trim();
    const digitsOnly = str.replace(/\D/g, '');
    let dialCode = '+91', localNum = digitsOnly;

    if (str.startsWith('+')) {
        const spaceIdx = str.indexOf(' ');
        if (spaceIdx > 0) {
            dialCode = str.slice(0, spaceIdx);
            localNum = str.slice(spaceIdx + 1).replace(/\D/g, '');
        } else if (digitsOnly.startsWith('91')) {
            localNum = digitsOnly.slice(2);
        } else {
            const match = str.match(/^(\+\d{1,4})(\d+)$/);
            if (match) [, dialCode, localNum] = match;
        }
    } else if (digitsOnly.length > 10 && digitsOnly.startsWith('91')) {
        localNum = digitsOnly.slice(2);
    }

    return {
        fullValue: `${dialCode.replace('+', '')}${localNum}`,
        dialCode,
        localNum
    };
};

const InputField: React.FC<{
    label: string;
    name: string;
    type?: string;
    placeholder: string;
    formik: any;
}> = ({ label, name, type = 'text', placeholder, formik }) => {
    const isError = formik.touched[name] && formik.errors[name];
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 font-jakarta">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className={`w-full border py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] placeholder:text-gray-300 rounded-md shadow-sm ${isError ? 'border-red-500' : 'border-gray-100'
                    }`}
                {...formik.getFieldProps(name)}
            />
            {isError && <p className="text-[10px] text-red-500 font-jakarta">{formik.errors[name] as string}</p>}
        </div>
    );
};

const AddressForm: React.FC<AddressFormProps> = ({ onClose, onSuccess, initialValues }) => {
    const getRawPhone = (vals: any) => vals?.phone || vals?.mobile || vals?.mobileNo || vals?.phoneNumber || '';
    const initialParsed = parsePhoneDetails(getRawPhone(initialValues));

    const [countries, setCountries] = useState<{ name: string; code: string; cca2: string }[]>([]);
    const [countryCode, setCountryCode] = useState(initialParsed.dialCode);
    const [phoneNumber, setPhoneNumber] = useState(initialParsed.localNum);
    const [phoneInputValue, setPhoneInputValue] = useState(initialParsed.fullValue);
    const [loadingCountries, setLoadingCountries] = useState(true);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: initialValues?.firstName || '',
            lastName: initialValues?.lastName || '',
            address: initialValues?.address || '',
            country: initialValues?.country || 'India',
            state: initialValues?.state || '',
            city: initialValues?.city || '',
            pincode: initialValues?.pincode || '',
            email: initialValues?.email || '',
            phone: initialParsed.localNum || '',
            isDefault: initialValues?.isDefault || false,
        },
        validationSchema: addressSchema,
        onSubmit: async (values) => {
            const token = getToken();
            if (!token) return;
            try {
                const addressId = initialValues?._id || initialValues?.id;
                const endpoint = addressId ? ENDPOINTS.ADDRESS.UPDATE_ADDRESS(addressId) : ENDPOINTS.ADDRESS.ADD_ADDRESS;
                const method = addressId ? 'PUT' : 'POST';
                const fullPhone = `${countryCode} ${phoneNumber || values.phone}`.trim();

                const response = await callApi(endpoint, method, { ...values, phone: fullPhone }, token);

                if (response && (response.status === 200 || response.errorCode === 200 || response.errorCode === 0)) {
                    toast.success(response.message || 'Address saved successfully');
                    onSuccess?.();
                    onClose();
                } else {
                    toast.error(response.message || 'Failed to save address');
                }
            } catch (err: any) {
                toast.error(err.message || 'Failed to save address');
            }
        },
    });

    useEffect(() => {
        getCountries()
            .then((res) => {
                if (res?.data) {
                    const seen = new Set();
                    const list: { name: string; code: string; cca2: string }[] = [];
                    res.data.forEach((c: any) => {
                        const dialCode = c.faxNo ? (c.faxNo.startsWith('+') ? c.faxNo : `+${c.faxNo}`) : '';
                        if (dialCode && !seen.has(dialCode)) {
                            seen.add(dialCode);
                            list.push({ name: c.name || '', code: dialCode, cca2: (c.code || '').toUpperCase() });
                        }
                    });
                    setCountries(list.sort((a, b) => a.name.localeCompare(b.name)));
                }
            })
            .catch((err) => {
                console.error('Failed to load countries in AddressForm:', err);
                setCountries([{ name: 'India', code: '+91', cca2: 'IN' }]);
            })
            .finally(() => setLoadingCountries(false));
    }, []);

    useEffect(() => {
        const rawPhone = getRawPhone(initialValues);
        if (rawPhone) {
            const parsed = parsePhoneDetails(rawPhone);
            setCountryCode(parsed.dialCode);
            setPhoneNumber(parsed.localNum);
            setPhoneInputValue(parsed.fullValue);
            formik.setFieldValue('phone', parsed.localNum);
        }
    }, [initialValues]);

    const handlePhoneChange = (value: string, countryData: any) => {
        setPhoneInputValue(value);
        const dial = countryData?.dialCode || '91';
        const localNum = value.startsWith(dial) ? value.slice(dial.length) : value;

        setPhoneNumber(localNum);
        formik.setFieldValue('phone', localNum);
        setCountryCode(`+${dial}`);

        const cca2 = countryData?.countryCode?.toUpperCase();
        if (cca2 && countries.length > 0) {
            const matched = countries.find((c) => c.cca2 === cca2);
            if (matched) formik.setFieldValue('country', matched.name);
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        formik.setFieldValue('country', selectedName);
        const matched = countries.find((c) => c.name === selectedName);
        if (matched) setCountryCode(matched.code);
    };

    const isPhoneError = formik.touched.phone && formik.errors.phone;
    const phoneBorder = isPhoneError ? '1px solid #EF4444' : '1px solid #F3F4F6';

    return (
        <div className="bg-white w-full mx-auto rounded-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#F5EBE4] px-6 py-3 flex items-center justify-between">
                <h3 className="text-xl serif text-gray-800">{initialValues ? 'Edit Address' : 'Add New Address'}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="p-6 md:p-8 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <InputField label="First Name" name="firstName" placeholder="First name. *" formik={formik} />
                    <InputField label="Last Name" name="lastName" placeholder="Last name. *" formik={formik} />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 font-jakarta">Address</label>
                    <textarea
                        placeholder="Address *"
                        rows={2}
                        className={`w-full border py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] placeholder:text-gray-300 rounded-md shadow-sm resize-none ${formik.touched.address && formik.errors.address ? 'border-red-500' : 'border-gray-100'
                            }`}
                        {...formik.getFieldProps('address')}
                    />
                    {formik.touched.address && formik.errors.address && (
                        <p className="text-[10px] text-red-500 font-jakarta">{formik.errors.address as string}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Country */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 font-jakarta">Country</label>
                        <select
                            className={`w-full border py-2 px-4 text-sm font-jakarta outline-none focus:border-[#B57A5A] rounded-md shadow-sm bg-white appearance-none ${formik.touched.country && formik.errors.country ? 'border-red-500' : 'border-gray-100'
                                }`}
                            value={formik.values.country}
                            onChange={handleCountryChange}
                            onBlur={formik.handleBlur}
                            disabled={loadingCountries}
                        >
                            {loadingCountries ? (
                                <option value={formik.values.country}>{formik.values.country}</option>
                            ) : (
                                countries.map((c) => (
                                    <option key={c.cca2} value={c.name}>{c.name}</option>
                                ))
                            )}
                        </select>
                        {formik.touched.country && formik.errors.country && (
                            <p className="text-[10px] text-red-500 font-jakarta">{formik.errors.country as string}</p>
                        )}
                    </div>

                    <InputField label="State" name="state" placeholder="Enter State" formik={formik} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <InputField label="City" name="city" placeholder="City. *" formik={formik} />
                    <InputField label="Pin Code" name="pincode" placeholder="Pin code. *" formik={formik} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <InputField label="Email Id" name="email" type="email" placeholder="Email Id. *" formik={formik} />

                    {/* Mobile No */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 font-jakarta">Mobile No</label>
                        <PhoneInput
                            country={'in'}
                            countryCodeEditable={false}
                            enableSearch={true}
                            value={phoneInputValue}
                            onChange={handlePhoneChange}
                            onBlur={() => formik.setFieldTouched('phone', true)}
                            inputStyle={{
                                width: '100%',
                                height: '38px',
                                border: phoneBorder,
                                borderRadius: '0.375rem',
                                fontFamily: 'var(--font-jakarta), sans-serif',
                                fontSize: '14px',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            }}
                            buttonStyle={{
                                borderTop: phoneBorder,
                                borderBottom: phoneBorder,
                                borderLeft: phoneBorder,
                                borderRight: 'none',
                                borderRadius: '0.375rem 0 0 0.375rem',
                                background: '#FFF',
                            }}
                            containerStyle={{ width: '100%' }}
                            placeholder="Phone number. *"
                        />
                        {isPhoneError && (
                            <p className="text-[10px] text-red-500 font-jakarta">{formik.errors.phone as string}</p>
                        )}
                    </div>
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center space-x-3 pt-2">
                    <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer accent-[#B57A5A]"
                        checked={formik.values.isDefault}
                        onChange={formik.handleChange}
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-600 font-jakarta cursor-pointer">
                        Use as my default address.
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full border border-[#B57A5A] text-[#B57A5A] py-2 font-jakarta tracking-widest hover:bg-gray-50 transition-all uppercase text-[12px]"
                    >
                        CLOSE
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-[#B57A5A] text-white py-2 font-jakarta tracking-widest hover:opacity-90 transition-all uppercase text-[12px]"
                    >
                        SAVE ADDRESS
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;