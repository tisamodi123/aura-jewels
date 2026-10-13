import React from 'react';
import { BespokeFormikProps } from './types';

interface ProductDetailsSectionProps {
    formik: BespokeFormikProps;
    jewelleryTypes: { value: string; label: string }[];
    onJewelleryTypeChange: (typeId: string) => void;
}

export default function ProductDetailsSection({
    formik,
    jewelleryTypes,
    onJewelleryTypeChange,
}: ProductDetailsSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Product Details
            </h3>
            <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                    Product Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {jewelleryTypes.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => onJewelleryTypeChange(type.value)}
                            className={`py-3 px-3 text-xs border transition-all duration-300 rounded-[2px] cursor-pointer text-center font-medium ${
                                formik.values.categoryId === type.value
                                    ? 'bg-transparent text-[#B57A5A] border-[#B57A5A] border-2 font-bold'
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#B57A5A] hover:text-[#B57A5A]'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                {formik.touched.categoryId && formik.errors.categoryId && (
                    <p className="text-[10px] text-red-500 mt-1">
                        {formik.errors.categoryId as string}
                    </p>
                )}
            </div>

            {/* Conditional other product name input */}
            {formik.values.categoryId === 'Other' && (
                <div className="space-y-2 animate-fadeIn">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="otherProduct"
                        value={formik.values.otherProduct}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Brooch, Waistbelt, Anklet, etc."
                        className={`w-full bg-transparent border-b text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors ${
                            formik.touched.otherProduct && formik.errors.otherProduct
                                ? 'border-red-500'
                                : 'border-stone-200'
                        }`}
                    />
                    {formik.touched.otherProduct && formik.errors.otherProduct && (
                        <p className="text-[10px] text-red-500">
                            {formik.errors.otherProduct as string}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
