'use client';

import React from 'react';
import { createPortal } from 'react-dom';

interface CancelConfirmationModalProps {
    isOpen: boolean;
    isMounted: boolean;
    isSubmitting: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    submittingText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
    isOpen,
    isMounted,
    isSubmitting,
    title,
    description,
    confirmText = "Cancel Request",
    submittingText,
    cancelText = "Keep Request",
    onClose,
    onConfirm,
}) => {
    if (!isOpen || !isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-sm border border-gray-100 p-6 md:p-8 max-w-sm w-full mx-4 shadow-xl animate-scaleUp">
                <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">{title}</h3>
                <p className="text-sm text-gray-500 mb-6 font-jakarta">
                    {description}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-200 text-gray-700 text-[11px] font-bold tracking-widest px-4 py-2.5 rounded-sm uppercase hover:bg-gray-50 transition-colors font-jakarta"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold tracking-widest px-4 py-2.5 rounded-sm uppercase transition-colors disabled:opacity-50 font-jakarta"
                    >
                        {isSubmitting ? (submittingText || "Cancelling...") : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CancelConfirmationModal;
