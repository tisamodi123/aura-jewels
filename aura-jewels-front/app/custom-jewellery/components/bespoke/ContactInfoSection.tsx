import { BespokeFormikProps } from './types';
import { useGlobleStore } from '@/store/globleStore';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { sanitizeNameInput } from '@/lib/validation-schema';

interface ContactInfoSectionProps {
    formik: BespokeFormikProps;
}

export default function ContactInfoSection({ formik }: ContactInfoSectionProps) {
    const { country } = useGlobleStore();
    const isIndia = country === 'IN';
    return (
        <div className="space-y-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Contact Information
            </h3>
            <p className="text-[11px] text-stone-400 leading-normal font-light -mt-2">
                Your details are fully protected under our private customer policies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={formik.values.firstName}
                        onChange={(e) => formik.setFieldValue('firstName', sanitizeNameInput(e.target.value))}
                        onBlur={(e) => {
                            formik.setFieldValue('firstName', e.target.value.trim());
                            formik.handleBlur(e);
                        }}
                        placeholder="Your First Name"
                        className={`w-full bg-transparent border-b text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors ${formik.touched.firstName && formik.errors.firstName
                            ? 'border-red-500'
                            : 'border-stone-200'
                            }`}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                        <p className="text-[10px] text-red-500">{formik.errors.firstName as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={formik.values.lastName}
                        onChange={(e) => formik.setFieldValue('lastName', sanitizeNameInput(e.target.value))}
                        onBlur={(e) => {
                            formik.setFieldValue('lastName', e.target.value.trim());
                            formik.handleBlur(e);
                        }}
                        placeholder="Your Last Name"
                        className={`w-full bg-transparent border-b text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors ${formik.touched.lastName && formik.errors.lastName
                            ? 'border-red-500'
                            : 'border-stone-200'
                            }`}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                        <p className="text-[10px] text-red-500">{formik.errors.lastName as string}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                        country={
                            formik.values.countryCode
                                ? formik.values.countryCode.replace('+', '').toLowerCase()
                                : (country ? country.toLowerCase() : 'in')
                        }
                        value={formik.values.mobileNumber}
                        onChange={(phone, countryData: any) => {
                            formik.setFieldValue('mobileNumber', phone);
                            if (countryData?.dialCode) {
                                formik.setFieldValue('countryCode', `+${countryData.dialCode}`);
                            }
                        }}
                        onBlur={() => formik.setFieldTouched('mobileNumber', true)}
                        enableSearch={true}
                        countryCodeEditable={false}
                        disableDropdown={true}
                        inputClass={`!w-full !bg-transparent !border-0 !border-b !text-stone-700 placeholder:!text-stone-300 !py-2.5 !text-sm focus:!outline-none focus:!border-[#B57A5A] !transition-colors !rounded-none !pl-[48px] ${formik.touched.mobileNumber && formik.errors.mobileNumber
                            ? '!border-red-500'
                            : '!border-stone-200'
                            }`}
                        buttonClass={`!border-0 !border-b !bg-transparent !rounded-none !pl-1 ${formik.touched.mobileNumber && formik.errors.mobileNumber
                            ? '!border-red-500'
                            : '!border-stone-200'
                            }`}
                        containerClass="!w-full"
                        placeholder="Phone Number"
                    />
                    {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                        <p className="text-[10px] text-red-500">{formik.errors.mobileNumber as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        Email Address {formik.values.countryCode !== '+91' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. name@example.com"
                        className={`w-full bg-transparent border-b text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors ${formik.touched.email && formik.errors.email
                            ? 'border-red-500'
                            : 'border-stone-200'
                            }`}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <p className="text-[10px] text-red-500">{formik.errors.email as string}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
