import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BespokeFormValues } from './types';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    values: BespokeFormValues;
    jewelleryTypes: { value: string; label: string; hasSize?: boolean }[];
    metalOptions: { value: string; label: string }[];
    ringSizes: { value: string; label: string }[];
}

export default function SuccessModal({
    isOpen,
    onClose,
    values,
    jewelleryTypes,
    metalOptions,
    ringSizes,
}: SuccessModalProps) {
    if (!isOpen) return null;

    const selectedCategory = jewelleryTypes.find((t) => t.value === values.categoryId);
    const categoryName = selectedCategory ? selectedCategory.label : values.categoryId;
    const hasSize = selectedCategory?.hasSize === true;

    const selectedMetal = metalOptions.find((m) => m.value === values.metalId);
    const metalName = selectedMetal ? selectedMetal.label : values.metalId;

    const isRing = categoryName.toLowerCase().includes('ring') || (hasSize && !categoryName.toLowerCase().includes('bracelet') && !categoryName.toLowerCase().includes('bangle'));
    const isBracelet = categoryName.toLowerCase().includes('bracelet') || categoryName.toLowerCase().includes('bangle');

    const selectedRingSize = ringSizes.find((sz) => sz.value === values.ringSizeId);
    const ringSizeLabel = selectedRingSize ? selectedRingSize.label : values.ringSizeId;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-stone-200 shadow-2xl p-8 max-w-md w-full rounded-sm text-center space-y-6 animate-scaleIn">
                <div className="w-16 h-16 bg-[#B57A5A] rounded-full flex items-center justify-center mx-auto text-white">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-el-messiri text-2xl text-[#1A1A1A] font-normal">
                    Thank You! Request Submitted Successfully
                </h3>
                <p className="font-dm-sans font-light text-stone-500 leading-relaxed text-sm">
                    Dear <strong className="text-[#B57A5A]">{values.firstName}</strong>, your bespoke
                    design inquiry for a{' '}
                    <span className="lowercase font-semibold">
                        {values.categoryId === 'Other'
                            ? values.otherProduct
                            : categoryName}
                    </span>{' '}
                    has been registered.
                </p>
                <div className="p-4 bg-stone-50 border border-stone-150 rounded-sm text-left text-xs text-stone-600 font-dm-sans space-y-2">
                    <p>
                        <strong>Metal Selection:</strong> {metalName}{' '}
                        {values.approxMetalWeight ? `(${values.approxMetalWeight}g)` : ''}
                    </p>
                    <p>
                        <strong>Diamond Type:</strong> {values.stoneType}
                    </p>
                    {hasSize && values.ringSizeId && (
                        <p>
                            <strong>{isBracelet ? 'Bracelet Size' : isRing ? 'Ring Size' : 'Size'}:</strong> {ringSizeLabel}
                        </p>
                    )}
                </div>
                {values.email && (
                    <p className="text-xs text-stone-500 font-dm-sans font-normal leading-relaxed">
                        A copy of your inquiry details has been sent to your email: <br />
                        <strong className="text-[#B57A5A]">{values.email}</strong>
                    </p>
                )}
                <p className="text-[11px] text-stone-400 font-dm-sans leading-relaxed">
                    Our creative team will review your specifications and reach out to you within
                    24-48 business hours to begin your journey.
                </p>
                <button
                    onClick={onClose}
                    className="bg-black hover:bg-stone-800 text-white transition-colors py-3 px-8 text-xs font-semibold uppercase tracking-widest rounded-sm cursor-pointer w-full"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
