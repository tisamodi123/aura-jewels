'use client';

import React, { useState } from 'react';
import { TextInput, TextArea, SelectInput } from '@/components/formElements/Input';
import { submitContactInquiry } from '@/services/contactService';
import { sanitizeNameInput } from '@/lib/validation-schema';
import { trackLeadSubmitted } from '@/services/trackingService';

interface ContactFormProps {
  onSuccess?: () => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Bespoke Consultation',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'firstName' || name === 'lastName') {
      val = sanitizeNameInput(val);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'firstName' || name === 'lastName') {
      setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple client side validation
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await submitContactInquiry({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });

      // The API answers 201 on create; anything else means the message was not
      // stored, so we must not show the "Message Received" screen.
      // if (res?.errorCode === 201 || res?.errorCode === 200) {
      //   trackLeadSubmitted({
      //       email: formData.email.trim(),
      //       name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      //       firstName: formData.firstName.trim(),
      //       lastName: formData.lastName.trim()
      //   }, "Contact Form", undefined, "Contact Form Submission");
      //   onSuccess?.();
      //   return;
      // }

      setSubmitError(
        res?.message || 'We could not send your message. Please try again, or email us directly.'
      );
    } catch (err) {
      console.error('contact submit failed:', err);
      setSubmitError('We could not send your message. Please try again, or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = [
    { value: 'Bespoke Consultation', label: 'Bespoke Consultation' },
    { value: 'Order Inquiry', label: 'Order Inquiry' },
    { value: 'Aftercare Service', label: 'Aftercare Service' },
    { value: 'General Question', label: 'General Question' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.firstName}
          placeholder="First Name *"
          required
          showLabel
          variant="box"
        />
        <TextInput
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.lastName}
          placeholder="Last Name *"
          required
          showLabel
          variant="box"
        />
      </div>

      <TextInput
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Email Address *"
        required
        showLabel
        variant="box"
      />

      <SelectInput
        label="Subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        options={subjectOptions}
        showLabel
        variant="box"
      />

      <TextArea
        label="Message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
        placeholder="Message *"
        required
        showLabel
        variant="box"
        rows={5}
      />

      {submitError && (
        <p role="alert" className="text-sm text-red-600 font-jakarta font-light">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#013D3D] text-white cursor-pointer px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-[#013D3D]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
