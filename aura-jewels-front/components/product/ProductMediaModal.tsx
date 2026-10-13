import React from 'react';
import Image from 'next/image';
import { FaWhatsapp } from "react-icons/fa6";
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';
import { whatsappLink } from '@/lib/siteConfig';

interface ProductMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string | null;
    mediaType: 'image' | 'video';
    productName: string;
    onMouseMove?: (e: React.MouseEvent, imgUrl: string) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    zoomStyle?: any;
    isHovered?: boolean;
    onAddToCart?: () => void;
    countryIN: string;
    handleOrderInquiry?: () => void;
    isInCart?: boolean;
}

const ProductMediaModal: React.FC<ProductMediaModalProps> = ({
    isOpen,
    onClose,
    mediaUrl,
    mediaType,
    productName,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    zoomStyle,
    isHovered,
    onAddToCart,
    countryIN,
    handleOrderInquiry,
    isInCart = false
}) => {
    return (
        <div className={`fixed inset-0 z-[1000] transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div className={`absolute top-0 right-0 h-full w-full md:w-[650px] bg-white shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100">
                    <div>
                        <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A]">{productName}</h3>
                        <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mt-1">Product Visualizer</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all text-xl"
                    >
                        &times;
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-6 md:p-12 flex items-center justify-center bg-[#FDFDFD]">
                    <div
                        className="relative w-full h-full min-h-[400px] flex items-center justify-center cursor-crosshair group/modal-zoom overflow-hidden"
                        onMouseMove={(e) => mediaType === 'image' && onMouseMove && onMouseMove(e, mediaUrl as string)}
                        onMouseEnter={() => mediaType === 'image' && onMouseEnter && onMouseEnter()}
                        onMouseLeave={() => onMouseLeave && onMouseLeave()}
                        style={isHovered && zoomStyle && mediaType === 'image' ? {
                            backgroundImage: zoomStyle.backgroundImage,
                            backgroundPosition: zoomStyle.backgroundPosition,
                            backgroundSize: '200% auto',
                            backgroundRepeat: 'no-repeat'
                        } : {}}
                    >
                        {mediaUrl && (
                            /* Render Image if mediaType is 'image' */
                            mediaType === 'image' ? (
                                <Image
                                    src={mediaUrl}
                                    alt="Zoomed product view"
                                    fill
                                    className={`object-contain mix-blend-multiply transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                                    sizes="650px"
                                    priority
                                />
                            ) : (
                                /* Render Video if mediaType is 'video' - No controls for pure visual view */
                                <video
                                    src={mediaUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="max-w-full max-h-full object-contain mix-blend-multiply pointer-events-none"
                                />
                            )
                        )}
                    </div>
                </div>
                <div className="p-8 bg-gray-50 border-t border-gray-100">
                    <div className="space-y-1 mb-2">
                        <p className="text-[13px] font-bold text-gray-900 font-jakarta">Explore the details</p>
                        <p className="text-[12px] text-gray-500 font-jakarta">Crafted with precision and ethically sourced diamonds.</p>
                    </div>
                    <div className="flex items-start flex-col justify-between w-full">
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button
                                onClick={onClose}
                                className="col-span-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 h-10 text-[11px] font-extrabold tracking-wider transition-all uppercase rounded-none flex items-center justify-center shadow-xs whitespace-nowrap"
                            >
                                BACK TO PRODUCT
                            </button>
                            {
                                countryIN === DEFAULT_COUNTRY ? (
                                    <button
                                        onClick={() => onAddToCart?.()}
                                        className="col-span-1 bg-[#B57A5A] hover:bg-[#9D6A4B] text-white h-10 text-[11px] font-extrabold tracking-wider transition-all uppercase rounded-none flex items-center justify-center gap-2 shadow-xs whitespace-nowrap"
                                    >
                                        {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                        <span>{isInCart ? 'ADDED IN CART' : 'ADD TO CART'}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            onClose();
                                            handleOrderInquiry?.();
                                        }}
                                        className="col-span-1 bg-[#B57A5A] hover:bg-[#9D6A4B] text-white h-10 text-[11px] font-extrabold tracking-wider transition-all uppercase rounded-none flex items-center justify-center gap-2 shadow-xs whitespace-nowrap"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>ORDER INQUIRY</span>
                                    </button>
                                )
                            }
                            <button
                                onClick={() => {
                                    const message = `Hi, I'm interested in ordering the ${productName}. Could you please provide more details?`;
                                    window.open(whatsappLink(message), '_blank');
                                }}
                                className="col-span-2 flex items-center justify-center gap-2 bg-[#04883B] hover:bg-[#037030] h-10 text-[11px] font-extrabold tracking-wider transition-all uppercase rounded-none shadow-xs whitespace-nowrap text-white w-full"
                            >
                                <FaWhatsapp className="w-4 h-4 text-white" />
                                <span>ORDER VIA WHATSAPP</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductMediaModal;
