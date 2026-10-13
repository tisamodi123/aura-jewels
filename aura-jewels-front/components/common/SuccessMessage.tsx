import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessMessageProps {
    name?: string;
    productName?: string;
    sku?: string;
    onClose: () => void;
    title?: string;
    message?: string;
    description?: string;
}

export default function SuccessMessage({
    name,
    productName,
    sku,
    onClose,
    title = 'Thank You!',
    message,
    description = 'Our international sales representative will review your request and reach out to you within 24-48 hours.'
}: SuccessMessageProps) {
    return (
        <div className="text-center py-6 space-y-6 font-dm-sans">
            <div className="w-16 h-16 bg-[#013D3D] rounded-full flex items-center justify-center mx-auto text-white">
                <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
                <h3 className="font-el-messiri text-2xl text-[#1A1A1A] font-normal">
                    {title}
                </h3>
                {message ? (
                    <p className="font-light text-stone-500 text-sm leading-relaxed">
                        {message}
                    </p>
                ) : (
                    <p className="font-light text-stone-500 text-sm leading-relaxed">
                        Dear <strong className="text-[#013D3D]">{name}</strong>, your inquiry for the product <strong className="text-stone-700">{productName}</strong> {sku ? `(SKU: ${sku})` : ''} has been successfully submitted.
                    </p>
                )}
            </div>
            {description && (
                <p className="text-xs text-stone-400 font-light max-w-sm mx-auto">
                    {description}
                </p>
            )}
            <button
                onClick={onClose}
                className="bg-black hover:bg-stone-850 text-white transition-colors py-3 px-8 text-xs font-semibold uppercase tracking-widest rounded-sm cursor-pointer w-full"
            >
                Close Window
            </button>
        </div>
    );
}
