import React from 'react';
import { BespokeFormikProps } from './types';

interface StonePreferencesSectionProps {
    formik: BespokeFormikProps;
    stoneOptions: { value: string; label: string }[];
}

export default function StonePreferencesSection({
    formik,
    stoneOptions,
}: StonePreferencesSectionProps) {
    return (
        <div className="space-y-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Diamond & Gemstone Preferences{' '}
                <span className="text-[10px] lowercase text-stone-400 font-light font-dm-sans">
                    (Optional)
                </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        Diamond Type
                    </label>
                    <div className="relative">
                        <select
                            name="stoneType"
                            value={formik.values.stoneType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full bg-[#FAF9F6] border border-stone-200 text-stone-700 px-4 py-3 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors appearance-none cursor-pointer"
                        >
                            {stoneOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-500">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        Approximate Diamond Weight (Carat)
                    </label>
                    <input
                        type="text"
                        name="approxStoneWeight"
                        value={formik.values.approxStoneWeight}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. 0.5, 1.0, 2.5"
                        className="w-full bg-transparent border-b border-stone-200 text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                    Gemstone Preference{' '}
                    <span className="text-[10px] lowercase text-stone-400 font-light font-dm-sans">
                        (Optional)
                    </span>
                </label>
                <input
                    type="text"
                    name="gemstonePreference"
                    value={formik.values.gemstonePreference}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. Blue Sapphire, Ruby, Emerald, Pearl, Pink Tourmaline"
                    className="w-full bg-transparent border-b border-stone-200 text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors"
                />
            </div>
        </div>
    );
}
