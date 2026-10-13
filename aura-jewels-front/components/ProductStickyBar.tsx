import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { FaWhatsapp } from 'react-icons/fa6';
import { Heart, Tag, ShoppingBag } from 'lucide-react';
import { formatPrice, getOfferDiscountLabel } from '@/lib/priceUtils';
import { DEFAULT_COUNTRY, noImgFound } from '@/lib/Api_Url';
import { isIndiaCountry, withTax } from '@/lib/taxUtils';
import { whatsappLink } from '@/lib/siteConfig';
import { getImageUrl } from '@/lib/utils';

interface ProductStickyBarProps {
    product: any;
    displayPrice: number;
    addTocart: () => void;
    isWishlisted: boolean;
    addToWishlist: () => void;
    isPriceLoading?: boolean;
    countryIN: any;
    handleOrderInquiry?: () => void;
    selectedColorName?: string;
    selectedMetalKarat?: string;
    selectedSizeName?: string;
    selectedDiamondOrigin?: string;
    selectedDiamondColor?: string;
    selectedClarity?: string;
    selectedCarats?: string;
}

const ProductStickyBar: React.FC<ProductStickyBarProps> = ({
    product,
    displayPrice,
    addTocart,
    isWishlisted,
    addToWishlist,
    isPriceLoading = false,
    countryIN,
    handleOrderInquiry,
    selectedColorName,
    selectedMetalKarat,
    selectedSizeName,
    selectedDiamondOrigin,
    selectedDiamondColor,
    selectedClarity,
    selectedCarats
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);

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

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            const footer = document.querySelector('footer');
            const mainActions = document.getElementById('main-product-actions');
            const windowHeight = window.innerHeight;
            const isMobile = window.innerWidth < 768;

            let shouldBeVisible = true;

            if (footer) {
                const footerTop = footer.getBoundingClientRect().top;
                if (footerTop < windowHeight) {
                    shouldBeVisible = false;
                }
            }

            if (shouldBeVisible && mainActions) {
                const rect = mainActions.getBoundingClientRect();
                if (rect.top < windowHeight && rect.bottom > 0) {
                    shouldBeVisible = false;
                }
            }

            setIsVisible(shouldBeVisible);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    if (!mounted) return null;

    const metalPrice = Number(product?.metalPrice || 0);
    const otherChargePrice = Number(product?.otherChargePrice || 0);
    const diamondPrice = Number(product?.TotalDiamondPrice || 0) + otherChargePrice;

    const offerDetails = product?.offerDetails || null;
    const hasOffer = !!(offerDetails?.offer?._id);
    const targetField = offerDetails?.targetField || '';
    const discountAmount = hasOffer ? (offerDetails?.discountAmount || 0) : 0;

    const discountedPrice = hasOffer
        ? (offerDetails?.discountedPrice ?? product?.discountedPrice ?? displayPrice)
        : displayPrice;
    const isZeroOffer = hasOffer && (discountedPrice <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= displayPrice));
    const offerDiscountLabel = getOfferDiscountLabel(offerDetails);

    const isDiamondDiscounted = hasOffer && targetField === 'TotalDiamondPrice';
    const originalDiamondPrice = diamondPrice;
    const discountedDiamondPrice = isDiamondDiscounted
        ? (offerDetails?.discountedValue != null ? (Number(offerDetails.discountedValue) + otherChargePrice) : (diamondPrice - discountAmount))
        : diamondPrice;

    const settingDesc = `${product?.productTitle || product?.title || product?.name || ''}, ${product?.metalTypeDetail?.metalName || ''} (${product?.metalStampDetail?.karat || ''})`;

    const diamondDesc = product.jewelry_diamonds?.[0]
        ? `Default (${product.jewelry_diamonds[0].shape_name?.paraname || 'Round'}, ${product.total_carat || '0.35'}, ${product.jewelry_diamonds[0].stonecolor || 'K'}, ${product.jewelry_diamonds[0].stoneclarity || 'SI1'})`
        : "Standard Selection";

    // Extract Product Main Image URL
    const imagesList = (product?.galleryImages || product?.images || [product?.default_image || product?.image]).filter(Boolean);
    const mainImage = imagesList[0] ? (typeof imagesList[0] === 'object' ? imagesList[0].MediaLocation : imagesList[0]) : '';
    const imageUrl = getImageUrl(mainImage || noImgFound);

    // Build Subtitle Details dynamically
    const color = selectedColorName || product?.metalTypeDetail?.metalName || product?.metalTypeDetail?.paraMtrName || product?.metal_type?.paraname || product?.metalTypeName || '';
    const stamp = selectedMetalKarat || product?.metalStampDetail?.karat || product?.metalStempDetail?.paraMtrName || product?.metal_stamp?.paraname || product?.metalStempName || '';
    const stampColor = [stamp, color].filter(Boolean).join(' ');

    const origin = selectedDiamondOrigin || (product?.jewelry_diamonds?.[0]?.stoneorigin || 'Lab Grown');
    const dColor = selectedDiamondColor || product?.jewelry_diamonds?.[0]?.stonecolor || '';
    const dClarity = selectedClarity || product?.jewelry_diamonds?.[0]?.stoneclarity || '';
    const qual = [dColor, dClarity].filter(Boolean).join('/');

    const carats = selectedCarats || (product?.totalCarat ? Number(product.totalCarat).toFixed(3) : '');
    const size = selectedSizeName || '';

    const parts1 = [];
    if (stampColor) parts1.push(stampColor);
    if (origin) parts1.push(origin);
    if (qual) parts1.push(qual);
    const detailsSubtitleLine1 = parts1.join(' • ');

    const parts2 = [];
    if (carats) parts2.push(`${carats} Ct`);
    if (size) parts2.push(`Size ${size}`);
    const detailsSubtitleLine2 = parts2.join(' • ');

    return (
        <div className={`fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-150/80 z-[50] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="max-w-[1440px] mx-auto py-3 px-4 md:px-6 lg:px-8">
                {/* Mobile-only Grand Total */}
                <div className="flex md:hidden items-center justify-between mb-2">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-800 leading-tight">Grand Total</span>
                        <span className="text-[9px] text-gray-400 font-jakarta">{isIndiaCountry(countryIN) ? 'Inclusive of GST' : 'Taxes as applicable'}</span>
                    </div>
                    {isPriceLoading ? (
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {hasOffer ? (
                                <>
                                    <span className="text-[18px] font-bold text-green-700 whitespace-nowrap">{formatPrice(withTax(isZeroOffer ? 0 : discountedPrice, countryIN))}</span>
                                    <span className="text-[12px] text-gray-400 line-through whitespace-nowrap">{formatPrice(withTax(displayPrice, countryIN))}</span>
                                </>
                            ) : (
                                <span className="text-[18px] font-bold text-gray-900 whitespace-nowrap">{formatPrice(withTax(displayPrice, countryIN))}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-10">
                    {/* Column 1: Image & Details */}
                    <div className="hidden md:flex items-center gap-3.5 min-w-0 self-center">
                        {/* Square Image Container */}
                        <div className="w-[50px] h-[50px] relative rounded-md overflow-hidden border border-gray-200/80 bg-white flex-shrink-0 flex items-center justify-center shadow-xs">
                            <img
                                src={imageUrl}
                                alt={product.productTitle || product.title || product.name}
                                className="w-full h-full object-contain p-1"
                            />
                        </div>
                        {/* Text Details */}
                        <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-bold text-gray-900 truncate tracking-wide leading-tight font-jakarta">
                                {product.productTitle || product.title || product.name}
                            </span>
                            {detailsSubtitleLine1 && (
                                <span className="text-[10px] text-gray-500 mt-0.5 truncate font-jakarta">
                                    {detailsSubtitleLine1}
                                </span>
                            )}
                            {detailsSubtitleLine2 && (
                                <span className="text-[10px] text-gray-400 mt-0.5 truncate font-jakarta font-medium">
                                    {detailsSubtitleLine2}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-12 bg-gray-200 self-center" />
                    {/* <div className="hidden md:flex flex-col flex-shrink-0 min-w-[100px] max-w-[160px] lg:max-w-[200px] self-start">
                        <span className="text-[11px] lg:text-[12px] font-bold text-gray-800 leading-tight whitespace-nowrap">Setting Selection</span>
                        <span className="text-[10px] lg:text-[11.5px] text-gray-400 mt-1 line-clamp-1">{settingDesc}</span>
                        {isPriceLoading ? (
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mt-2"></div>
                        ) : (
                            <span className="text-[13px] lg:text-[15px] font-bold text-gray-900 mt-2 whitespace-nowrap">
                                {formatPrice(metalPrice)}
                            </span>
                        )}
                    </div>
                    <div className="hidden md:block w-px h-12 bg-gray-200" />
                    <div className="hidden md:flex flex-col flex-shrink-0 min-w-[100px] max-w-[160px] lg:max-w-[200px] self-start">
                        <span className="text-[11px] lg:text-[12px] font-bold text-gray-800 leading-tight whitespace-nowrap">Selected Diamond</span>
                        <span className="text-[10px] lg:text-[11.5px] text-gray-400 mt-1 line-clamp-1">{diamondDesc}</span>
                        {isPriceLoading ? (
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mt-2"></div>
                        ) : (
                            <div className="flex items-center gap-2 mt-2">
                                {isDiamondDiscounted ? (
                                    <>
                                        <span className="text-[13px] lg:text-[15px] font-bold text-green-700 whitespace-nowrap">
                                            {formatPrice(discountedDiamondPrice)}
                                        </span>
                                        <span className="text-[11px] lg:text-[12px] text-gray-400 line-through whitespace-nowrap">
                                            {formatPrice(originalDiamondPrice)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[13px] lg:text-[15px] font-bold text-gray-900 whitespace-nowrap">
                                        {formatPrice(diamondPrice)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block w-px h-12 bg-gray-200" /> */}

                    {/* Column 4: Grand Total */}
                    <div className="hidden md:flex flex-col flex-shrink-0 self-center">
                        <span className="text-[11px] lg:text-[12px] font-bold text-gray-800 leading-tight whitespace-nowrap">Grand Total</span>
                        <span className="text-[10px] lg:text-[11.5px] text-gray-400 mt-0.5">{isIndiaCountry(countryIN) ? 'Inclusive of GST' : 'Taxes as applicable'}</span>
                        {isPriceLoading ? (
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-28 mt-1.5"></div>
                        ) : (
                            <div className="flex flex-col mt-1">
                                <div className="flex items-center gap-2">
                                    {hasOffer ? (
                                        <>
                                            <span className="text-[15px] lg:text-[18px] font-bold text-green-700 whitespace-nowrap">
                                                {formatPrice(withTax(isZeroOffer ? 0 : discountedPrice, countryIN))}
                                            </span>
                                            <span className="text-[11px] lg:text-[13px] text-gray-400 line-through whitespace-nowrap">
                                                {formatPrice(withTax(displayPrice, countryIN))}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-[15px] lg:text-[18px] font-bold text-gray-900 whitespace-nowrap">
                                            {formatPrice(withTax(displayPrice, countryIN))}
                                        </span>
                                    )}
                                </div>
                                {hasOffer && offerDiscountLabel && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                                            <Tag className="w-2.5 h-2.5" /> {offerDiscountLabel}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Separator */}
                    <div className="hidden md:block w-px h-12 bg-gray-200 self-center" />

                    {/* Column 5: Actions */}
                    <div className="flex flex-row items-center gap-2 w-full md:w-auto flex-shrink-0 self-center">
                        {/* Mobile-only Wishlist Button */}
                        <button
                            className="md:hidden w-10 h-10 flex-shrink-0 bg-white border border-gray-200 rounded-none flex items-center justify-center text-gray-500 shadow-sm active:scale-95 transition-all"
                            onClick={() => addToWishlist()}
                            disabled={isPriceLoading}
                        >
                            <Heart className={`w-5.5 h-5.5 ${isWishlisted ? 'fill-[#013D3D] text-[#013D3D]' : 'text-gray-400'}`} />
                        </button>

                        <a
                            href={whatsappLink(`Hi, I am interested in ordering ${product.productTitle || product.name}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 md:flex-initial h-10 bg-[#04883B] text-white hover:bg-[#037030] px-4 lg:px-6 py-2 md:py-3 text-[11px] font-extrabold tracking-wider transition-all uppercase rounded-none flex items-center justify-center gap-2 shadow-sm whitespace-nowrap ${isPriceLoading ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <FaWhatsapp className="w-4 h-4 lg:w-4.5 h-4.5" />
                            <span>WHATSAPP</span>
                        </a>

                        {countryIN === DEFAULT_COUNTRY ? (
                            <button
                                onClick={() => addTocart()}
                                disabled={isPriceLoading}
                                className={`flex-1 md:flex-initial h-10 bg-[#013D3D] text-white hover:bg-[#002B2B] px-4 lg:px-6 py-2 md:py-3 text-[11px] font-extrabold tracking-wider transition-all uppercase rounded-none flex items-center justify-center gap-2 shadow-sm whitespace-nowrap ${isPriceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                ADD TO CART
                            </button>
                        ) : (
                            <button
                                onClick={() => handleOrderInquiry?.()}
                                disabled={isPriceLoading}
                                className={`flex-1 md:flex-initial h-10 bg-[#013D3D] text-white hover:bg-[#002B2B] px-4 lg:px-6 py-2 md:py-3 text-[11px] font-extrabold tracking-wider transition-all uppercase rounded-none flex items-center justify-center gap-2 shadow-sm whitespace-nowrap ${isPriceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                ORDER INQUIRY
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductStickyBar;
