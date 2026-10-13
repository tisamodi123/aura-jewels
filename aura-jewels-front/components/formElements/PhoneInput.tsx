"use client";

import React, { useState, useEffect } from 'react';
import { getCountries } from '@/services/countryService';

export interface PhoneInputProps {
  countryCode: string;
  setCountryCode: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  required?: boolean;
  className?: string;
  variant?: 'box' | 'underline';
  error?: string;
}

export default function PhoneInput({
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  required = false,
  className = '',
  variant = 'box',
  error
}: PhoneInputProps) {
  const isUnderline = variant === 'underline';

  const [countries, setCountries] = useState<{ name: string, code: string, cca2: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCountries()
      .then((res) => {
        if (res && res.data) {
          const unique: { name: string, code: string, cca2: string }[] = [];
          const seen = new Set();

          res.data.forEach((c: any) => {
            const dialCode = c.faxNo ? (c.faxNo.startsWith('+') ? c.faxNo : `+${c.faxNo}`) : '';
            if (dialCode && !seen.has(dialCode)) {
              seen.add(dialCode);
              unique.push({
                name: c.name || '',
                code: dialCode,
                cca2: (c.code || '').toUpperCase()
              });
            }
          });

          unique.sort((a, b) => a.name.localeCompare(b.name));
          setCountries(unique);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch countries from backend API:', err);
        setCountries([{ name: 'India', code: '+91', cca2: 'IN' }, { name: 'United States', code: '+1', cca2: 'US' }]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div
        className={`flex transition-colors duration-300
          ${isUnderline
            ? `bg-transparent border-b border-stone-200 focus-within:border-brand ${error ? 'border-b-red-500' : ''}`
            : `bg-white border border-stone-200 focus-within:border-black ${error ? 'border-red-500' : ''}`
          } ${className}`}
      >
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          disabled={loading}
          className="bg-transparent pl-1 pr-6 border-r border-stone-200 text-stone-600 text-sm focus:outline-none appearance-none cursor-pointer"
          style={{
            backgroundSize: '10px',
            backgroundPosition: 'calc(100% - 2px) center',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`
          }}
        >
          {loading ? (
            <option value={countryCode}>{countryCode}</option>
          ) : (
            countries.map((c) => (
              <option key={c.cca2 + c.code} value={c.code} className="bg-white text-black">
                {c.cca2} {c.code}
              </option>
            ))
          )}
        </select>
        <input
          type="tel"
          required={required}
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="flex-1 min-w-0 bg-transparent px-4 py-3.5 focus:outline-none text-sm text-black font-light placeholder-stone-400"
        />
      </div>
      {error && <p className="text-[0.7rem] text-red-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
}
