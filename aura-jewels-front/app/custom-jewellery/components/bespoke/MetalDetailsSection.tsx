import React from 'react';
import Link from 'next/link';
import { BespokeFormikProps } from './types';
import type { SizeGuideType } from '@/components/common/SizeGuideModal';

interface MetalDetailsSectionProps {
    formik: BespokeFormikProps;
    metalOptions: { value: string; label: string }[];
    jewelleryTypes: { value: string; label: string; hasSize?: boolean }[];
    ringSizes: { value: string; label: string }[];
}

// Map a category label to the correct size-guide/label vocabulary. Necklaces
// (and neck-worn chains/mangalsutra) are sized by length; bracelets/bangles by
// wrist fit; everything else sized falls back to ring vocabulary.
const resolveSizeType = (label = ''): SizeGuideType => {
    const l = label.toLowerCase();
    if (l.includes('bracelet') || l.includes('bangle') || l.includes('kada')) return 'bracelet';
    if (l.includes('necklace') || l.includes('chain') || l.includes('mangalsutra')) return 'necklace';
    return 'ring';
};

const SIZE_LABELS: Record<SizeGuideType, { field: string; guide: string }> = {
    ring: { field: 'Ring Size', guide: 'Ring Size Guide' },
    bracelet: { field: 'Bracelet Size', guide: 'Bracelet Size Guide' },
    necklace: { field: 'Necklace Length', guide: 'Necklace Length Guide' },
};

// The guide opens as a standalone page in a new tab (same pages the footer and
// the product page link to), so the customer never loses their in-progress
// bespoke form.
const SIZE_GUIDE_HREF: Record<SizeGuideType, string> = {
    ring: '/ring-size-guide',
    bracelet: '/bracelet-size-guide',
    necklace: '/necklace-size-guide',
};

export default function MetalDetailsSection({
    formik,
    metalOptions,
    jewelleryTypes,
    ringSizes,
}: MetalDetailsSectionProps) {
    const selectedCategory = jewelleryTypes.find((type) => type.value === formik.values.categoryId);
    const hasSize = selectedCategory?.hasSize === true;
    const sizeGuideType = resolveSizeType(selectedCategory?.label);
    const { field: fieldLabel, guide: guideLabel } = SIZE_LABELS[sizeGuideType];
    const sizeGuideHref = SIZE_GUIDE_HREF[sizeGuideType];

    return (
        <div className="space-y-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Metal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        Metal Type
                    </label>
                    <div className="relative">
                        <select
                            name="metalId"
                            value={formik.values.metalId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full bg-[#FAF9F6] border border-stone-200 text-stone-700 px-4 py-3 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors appearance-none cursor-pointer"
                        >
                            {metalOptions.map((opt) => (
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
                        Approximate Metal Weight (G)
                    </label>
                    <input
                        type="text"
                        name="approxMetalWeight"
                        value={formik.values.approxMetalWeight}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. 5.5, 12.0"
                        className="w-full bg-transparent border-b border-stone-200 text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors"
                    />
                </div>
            </div>

            {/* Dynamic Size Dropdown if Category has size enabled */}
            {hasSize && (
                <div className="space-y-2 animate-fadeIn pt-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                            {fieldLabel}
                        </label>
                        <Link
                            href={sizeGuideHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#B57A5A] hover:text-[#8B5E45] underline font-bold"
                        >
                            View {guideLabel}
                        </Link>
                    </div>
                    <div className="relative">
                        <select
                            name="ringSizeId"
                            value={formik.values.ringSizeId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full bg-[#FAF9F6] border border-stone-200 text-stone-700 px-4 py-3 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors appearance-none cursor-pointer"
                        >
                            <option value="">Select {fieldLabel}</option>
                            {ringSizes.map((sz) => (
                                <option key={sz.value} value={sz.value}>
                                    {sz.label}
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
            )}
        </div>
    );
}
