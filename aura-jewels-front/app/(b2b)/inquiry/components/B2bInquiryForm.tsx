"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { TextInput, TextArea, SelectInput } from '@/components/formElements/Input';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Button } from '@/components/formElements/Button';
import * as Yup from 'yup';

const b2bInquirySchema = Yup.object().shape({
  companyName: Yup.string().required('Company name is required'),
  contactPerson: Yup.string().required('Contact person is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
  businessType: Yup.string().required('Please select a business type'),
  message: Yup.string().required('Message is required')
});
import { Loader2, CheckCircle2 } from 'lucide-react';
import { trackLeadSubmitted } from '@/services/trackingService';

interface B2bInquiryFormProps {
  onSubmitSuccess?: () => void;
  className?: string;
  variant?: 'box' | 'underline';
}

export default function B2bInquiryForm({
  onSubmitSuccess,
  className = '',
  variant = 'underline'
}: B2bInquiryFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',
    message: ''
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const businessTypeOptions = [
    { value: 'retailer', label: 'Retail Jeweller' },
    { value: 'distributor', label: 'Wholesale Distributor' },
    { value: 'online_store', label: 'Online Jewelry Store' },
    { value: 'designer', label: 'Jewellery Designer / Independent Brand' },
    { value: 'franchise', label: 'Franchise Partner' },
    { value: 'other', label: 'Other Business Type' }
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'email') {
      processedValue = value.replace(/\s+/g, '');
    } else if (name === 'companyName' || name === 'contactPerson') {
      processedValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
    } else if (name === 'message') {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Form Data
    try {
      b2bInquirySchema.validateSync(formData, { abortEarly: false });
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
        toast.error('Please resolve the errors in the form.');
        return;
      }
    }

    setLoading(true);

    // Simulate API call for premium user experience
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here, you would typically make the network call:
      // const response = await callApi('/api/b2b/inquiry', 'POST', { ...formData, countryCode });

      setSubmitted(true);
      // try {
      //   trackLeadSubmitted({
      //       name: formData.contactPerson.trim(),
      //       email: formData.email.trim(),
      //       phone: `${countryCode}${formData.phone}`.replace('+', '')
      //   }, "B2B Inquiry", undefined, "B2B Form Submission");
      // } catch (trackErr) {
      //   console.error('[Tracking] B2B lead error:', trackErr);
      // }
      toast.success('Inquiry submitted successfully! Our team will contact you shortly.');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Reset form
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        businessType: '',
        message: ''
      });
      setCountryCode('+91');
      setErrors({});
    } catch (error) {
      console.error('Error submitting B2B inquiry:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-brand-light/50 border border-brand-light rounded-sm animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-[#B57A5A] mb-4 stroke-[1.25]" />
        <h3 className="font-el-messiri text-2xl text-black mb-3">Thank You for Your Inquiry</h3>
        <p className="text-gray-500 font-jakarta text-sm max-w-md mx-auto leading-relaxed mb-6 font-light">
          Your partnership request has been received. Our B2B relationship manager will review your details and get in touch with you within 24 to 48 business hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="border border-[#B57A5A] text-[#B57A5A] hover:bg-[#B57A5A] hover:text-white px-8 py-2.5 text-xs tracking-widest uppercase transition-all duration-300 font-medium"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 md:space-y-8 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-8">

        {/* Company Name */}
        <TextInput
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          error={errors.companyName}
          placeholder="Enter company name"
          showLabel={true}
          required={true}
          variant={variant}
        />

        {/* Contact Person */}
        <TextInput
          label="Contact Person"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          error={errors.contactPerson}
          placeholder="Enter full name"
          showLabel={true}
          required={true}
          variant={variant}
        />

        {/* Email Address */}
        <TextInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter email address"
          showLabel={true}
          required={true}
          variant={variant}
        />

        {/* Phone Number */}
        <div className="flex flex-col justify-end">
          <h6 className={`text-xs font-semibold uppercase mb-2 ${variant === 'underline' ? 'text-gray-500 font-jakarta tracking-wider text-[10px]' : 'text-black'}`}>
            Phone Number <span className="text-[#B57A5A] font-medium">*</span>
          </h6>
          <PhoneInput
            country={countryCode.replace('+', '').toLowerCase() || 'in'}
            value={formData.phone}
            onChange={(phone) => {
              setFormData((prev) => ({ ...prev, phone }));
              if (errors.phone) {
                setErrors((prev) => {
                  const { phone: _, ...rest } = prev;
                  return rest;
                });
              }
            }}
            inputStyle={{
              width: '100%',
              height: '46px',
              border: variant === 'underline' ? 'none' : '1px solid #E5E7EB',
              borderBottom: variant === 'underline' ? '1px solid #E5E7EB' : '1px solid #E5E7EB',
              borderRadius: '0px',
              fontFamily: 'var(--font-jakarta), sans-serif',
              fontSize: '13px',
              background: 'transparent'
            }}
            buttonStyle={{
              border: variant === 'underline' ? 'none' : '1px solid #E5E7EB',
              borderBottom: variant === 'underline' ? '1px solid #E5E7EB' : '1px solid #E5E7EB',
              borderRight: 'none',
              borderRadius: '0px',
              background: 'transparent',
            }}
            containerStyle={{
              width: '100%',
            }}
            placeholder="Enter Mobile No*"
          />
          {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Business Type */}
      <SelectInput
        label="Business Type"
        name="businessType"
        value={formData.businessType}
        onChange={handleChange}
        error={errors.businessType}
        placeholder="Select business type"
        options={businessTypeOptions}
        showLabel={true}
        required={true}
        variant={variant}
      />

      {/* Message or Inquiry Details */}
      <TextArea
        label="Message or Inquiry Details"
        name="message"
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
        placeholder="Tell us about your requirements.."
        showLabel={true}
        required={true}
        variant={variant}
        rows={3}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#B57A5A] text-white hover:bg-[#8B5E45] py-3.5 px-10 text-xs tracking-widest uppercase transition-all duration-300 font-semibold cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin text-white" />}
          {loading ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </div>
    </form>
  );
}
