'use client';

import React from 'react';
import Select, { StylesConfig } from 'react-select';

export const TextInput = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    showLabel = false,
    required = false,
    type = "text",
    variant = "box"
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder: string;
    showLabel?: boolean;
    required?: boolean;
    type?: string;
    variant?: "box" | "underline";
}) => {
    const isUnderline = variant === "underline";
    return (
        <div>
            {showLabel && (
                <h6 className={`text-xs font-semibold uppercase mb-2 ${isUnderline ? 'text-neutral-muted tracking-wider text-xs' : 'text-neutral-dark'}`}>
                    {label} {required && <span className="text-brand font-medium">*</span>}
                </h6>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                required={required}
                className={`w-full text-neutral-dark placeholder:text-neutral-muted/75 focus:outline-none
                    ${isUnderline
                        ? `px-0 py-2.5 border-b border-neutral-border bg-transparent focus:border-brand ${error ? 'border-b-red-500' : ''}`
                        : `px-6 py-2.5 border border-neutral-border bg-neutral-white focus:border-neutral-dark ${error ? 'border-red-500' : ''}`
                    }`}
                placeholder={placeholder}
            />
            {error && <p className="text-[0.7rem] text-red-500 mt-1 ml-1 font-medium">{error}</p>}
        </div>
    );
}


export const TextArea = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    showLabel = false,
    required = false,
    variant = "box",
    rows = 4
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: string;
    placeholder: string;
    showLabel?: boolean;
    required?: boolean;
    variant?: "box" | "underline";
    rows?: number;
}) => {
    const isUnderline = variant === "underline";
    return (
        <div>
            {showLabel && (
                <h6 className={`text-xs font-semibold uppercase mb-2 ${isUnderline ? 'text-neutral-muted tracking-wider text-xs' : 'text-neutral-dark'}`}>
                    {label} {required && <span className="text-brand font-medium">*</span>}
                </h6>
            )}
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                rows={rows}
                className={`w-full text-neutral-dark placeholder:text-neutral-muted/75 focus:outline-none resize-none
                    ${isUnderline
                        ? `px-0 py-2.5 border-b border-neutral-border bg-transparent focus:border-brand ${error ? 'border-b-red-500' : ''}`
                        : `px-6 py-2.5 border border-neutral-border bg-neutral-white focus:border-neutral-dark ${error ? 'border-red-500' : ''}`
                    }`}
                placeholder={placeholder}
            />
            {error && <p className="text-[0.7rem] text-red-500 mt-1 ml-1 font-medium">{error}</p>}
        </div>
    );
}


export const SelectInput = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    options,
    showLabel = false,
    required = false,
    variant = "box"
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    error?: string;
    placeholder?: string;
    options: { value: string; label: string }[];
    showLabel?: boolean;
    required?: boolean;
    variant?: "box" | "underline";
}) => {
    const isUnderline = variant === "underline";
    const selectedOption = options.find((opt) => opt.value === value) || null;

    const selectStyles: StylesConfig<any, false> = {
        control: (provided, state) => ({
            ...provided,
            minHeight: isUnderline ? '40px' : '46px',
            height: isUnderline ? '40px' : '46px',
            width: '100%',
            borderRadius: '0',
            border: isUnderline ? 'none' : error ? '1px solid #EF4444' : state.isFocused ? '1px solid #1A1A1A' : '1px solid #E5E7EB',
            borderBottom: isUnderline ? (error ? '1px solid #EF4444' : state.isFocused ? '1px solid #013D3D' : '1px solid #E5E7EB') : undefined,
            backgroundColor: isUnderline ? 'transparent' : '#FFFFFF',
            boxShadow: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            '&:hover': {
                borderColor: '#1A1A1A'
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: isUnderline ? '0' : '0 16px',
            height: isUnderline ? '38px' : '44px',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1A1A1A',
            fontSize: '14px',
            fontFamily: 'var(--font-dm-sans), sans-serif',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF',
            fontSize: '14px',
        }),
        input: (provided) => ({
            ...provided,
            margin: '0',
            padding: '0',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: isUnderline ? '38px' : '44px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '0 8px',
            color: '#6B7280',
            '&:hover': {
                color: '#1A1A1A'
            }
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0',
            marginTop: '2px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 50,
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #F3F4F6'
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '4px 0',
            maxHeight: '220px'
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: '14px',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            padding: '10px 16px',
            backgroundColor: state.isSelected ? '#013D3D' : state.isFocused ? '#F3F4F6' : 'white',
            color: state.isSelected ? 'white' : '#1A1A1A',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#013D3D',
                color: 'white'
            }
        })
    };

    return (
        <div>
            {showLabel && (
                <h6 className={`text-xs font-semibold uppercase mb-2 ${isUnderline ? 'text-neutral-muted tracking-wider text-xs' : 'text-neutral-dark'}`}>
                    {label} {required && <span className="text-brand font-medium">*</span>}
                </h6>
            )}
            <div className="relative w-full">
                <Select
                    name={name}
                    value={selectedOption}
                    onChange={(selected: any) => {
                        const fakeEvent = {
                            target: {
                                name,
                                value: selected ? selected.value : ''
                            }
                        } as React.ChangeEvent<HTMLSelectElement>;
                        onChange(fakeEvent);
                    }}
                    options={options}
                    placeholder={placeholder || 'Select...'}
                    isSearchable={false}
                    styles={selectStyles}
                    className="react-select-container w-full"
                    classNamePrefix="react-select"
                />
            </div>
            {error && <p className="text-[0.7rem] text-red-500 mt-1 ml-1 font-medium">{error}</p>}
        </div>
    );
};