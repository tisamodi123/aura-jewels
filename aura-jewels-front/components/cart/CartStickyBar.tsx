'use client';

import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/priceUtils';

interface CartStickyBarProps {
    total: number;
    onCheckout: () => void;
    isVisible?: boolean;
}

const CartStickyBar: React.FC<CartStickyBarProps> = ({ total, onCheckout, isVisible = true }) => {
    useEffect(() => {
        if (isVisible) {
            document.body.classList.add('has-sticky-bar');
        } else {
            document.body.classList.remove('has-sticky-bar');
        }
        return () => {
            document.body.classList.remove('has-sticky-bar');
        };
    }, [isVisible]);
    return (
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 p-4 pb-6 md:pb-0 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4 transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Total Amount</span>
                <span className="text-[18px] font-bold text-gray-900 font-jakarta leading-none">{formatPrice(total)}</span>
            </div>
            <button
                onClick={onCheckout}
                className="bg-[#013D3D] text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all rounded-sm shadow-sm active:scale-95 whitespace-nowrap flex items-center justify-between min-w-[160px]"
            >
                <span>Proceed to CHECKOUT</span>
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default CartStickyBar;
