'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Select from 'react-select';
import { FaWhatsapp } from "react-icons/fa6";
import { getSelectStyles } from '@/lib/selectStyles';
import { DIAMOND_ORIGINS, PANDENTS_INCLUDE, PANDENTS_MESSAGE } from '@/lib/constants';

// Resolve the correct size-guide page for a product's category. Bracelets/
// bangles/kada → bracelet guide; necklaces/chains/pendants (length-sized) →
// necklace guide; everything else sized → ring guide.
const resolveSizeGuideHref = (categoryName = ''): string => {
    const l = categoryName.toLowerCase();
    if (l.includes('bracelet') || l.includes('bangle') || l.includes('kada')) return '/bracelet-size-guide';
    if (l.includes('necklace') || l.includes('chain') || l.includes('mangalsutra') || l.includes('pendant')) return '/necklace-size-guide';
    return '/ring-size-guide';
};
import MultiCenterStoneVariationLogic from './MultiCenterStoneVariationLogic';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';
import { whatsappLink } from '@/lib/siteConfig';
import { Sparkles, ShoppingBag, ShieldCheck, RotateCcw, Gem, X, Palette, Box, ChevronRight, Check } from 'lucide-react';
import { formatPrice } from '@/lib/priceUtils';
import { withTax } from '@/lib/taxUtils';


// ─── Feature Switch ────────────────────────────────────────────────────────────
const ENABLE_DIAMOND_ORIGIN_SELECTOR = true;
// ──────────────────────────────────────────────────────────────────────────────

interface ProductCustomizerProps {
    product: any;
    allVariants: any[];
    isPriceLoading: boolean;
    availableMetalColors: string[];
    availableMetalStamps: string[];
    selectedColor: string;
    selectedMetal: string;
    selectedSize: string;
    setSelectedSize: (size: string) => void;
    selectedDiamondOrigin: string;
    setSelectedDiamondOrigin: (origin: string) => void;
    selectedDiamondColor: string;
    setSelectedDiamondColor: (color: string) => void;
    selectedClarity: string;
    setSelectedClarity: (clarity: string) => void;
    hasCenterDiamond: boolean;
    centerStone: any;
    isSingleCenterDiamond: boolean;
    centerDiamondsSelectable?: boolean;
    mounted: boolean;
    displayTitle: string;
    handleAttributeSelect: (type: string, value: any) => void;
    handleAddToCart: (product?: any) => void;
    handleWishlistToggle: () => void;
    countryIN: string;
    handleOrderInquiry?: () => void;
    engravingEnabled?: boolean;
    setEngravingEnabled?: (val: boolean) => void;
    engravingText?: string;
    setEngravingText?: (val: string) => void;
    isRingBuilderMode?: boolean;
    isDiamondProduct?: boolean;
    hasOtherItem?: boolean;
    handleChooseSetting?: () => void;
    handleChooseDiamond?: () => void;
    handleCompleteRing?: () => void;
    isInCart?: boolean;
}

export default function ProductCustomizer({
    product,
    allVariants,
    isPriceLoading,
    availableMetalColors,
    availableMetalStamps,
    selectedColor,
    selectedMetal,
    selectedSize,
    setSelectedSize,
    selectedDiamondOrigin,
    setSelectedDiamondOrigin,
    selectedDiamondColor,
    setSelectedDiamondColor,
    selectedClarity,
    setSelectedClarity,
    hasCenterDiamond,
    centerStone,
    isSingleCenterDiamond,
    centerDiamondsSelectable = false,
    mounted,
    displayTitle,
    handleAttributeSelect,
    handleAddToCart,
    handleWishlistToggle,
    countryIN,
    handleOrderInquiry,
    engravingEnabled = false,
    setEngravingEnabled,
    engravingText = '',
    setEngravingText,
    isRingBuilderMode = false,
    isDiamondProduct = false,
    hasOtherItem = false,
    handleChooseSetting,
    handleChooseDiamond,
    handleCompleteRing,
    isInCart = false
}: ProductCustomizerProps) {
    const [activeDrawer, setActiveDrawer] = useState<'metal' | 'color' | 'origin' | 'quality' | null>(null);

    useEffect(() => {
        if (activeDrawer !== null) {
            document.body.classList.add('has-open-drawer');
        } else {
            document.body.classList.remove('has-open-drawer');
        }
        return () => {
            document.body.classList.remove('has-open-drawer');
        };
    }, [activeDrawer]);

    const getKaratPrice = (karat: string) => {
        const candidates = allVariants.filter((v: any) =>
            v.metalStampDetail?.karat?.toLowerCase() === karat.toLowerCase()
        );
        if (candidates.length === 0) return '';
        let bestCandidate = candidates[0];
        let maxScore = -1;
        candidates.forEach((v: any) => {
            let score = 0;
            const vColor = v.metalTypeDetail?.metalName || v.metalTypeDetail?.paraMtrName || v.metal_type?.paraname || v.metalTypeName || '';
            if (vColor.toLowerCase() === selectedColor.toLowerCase()) score += 10;

            const vOrigin = v.jewelry_diamonds?.[0]?.stoneorigin || 'Lab Grown';
            if (vOrigin.toLowerCase() === selectedDiamondOrigin.toLowerCase()) score += 5;

            if (score > maxScore) {
                maxScore = score;
                bestCandidate = v;
            }
        });
        const price = bestCandidate.finalPrice || 0;
        return formatPrice(withTax(price, countryIN));
    };

    const getColorPrice = (color: string) => {
        const candidates = allVariants.filter((v: any) => {
            const vColor = v.metalTypeDetail?.metalName || v.metalTypeDetail?.paraMtrName || v.metal_type?.paraname || v.metalTypeName || '';
            return vColor.toLowerCase() === color.toLowerCase();
        });
        if (candidates.length === 0) return '';
        let bestCandidate = candidates[0];
        let maxScore = -1;
        candidates.forEach((v: any) => {
            let score = 0;
            const vKarat = v.metalStampDetail?.karat || v.metalStempDetail?.paraMtrName || v.metal_stamp?.paraname || v.metalStempName || '';
            if (vKarat.toLowerCase() === selectedMetal.toLowerCase()) score += 10;

            const vOrigin = v.jewelry_diamonds?.[0]?.stoneorigin || 'Lab Grown';
            if (vOrigin.toLowerCase() === selectedDiamondOrigin.toLowerCase()) score += 5;

            if (score > maxScore) {
                maxScore = score;
                bestCandidate = v;
            }
        });
        const price = bestCandidate.finalPrice || 0;
        return formatPrice(withTax(price, countryIN));
    };

    const categoryName = product?.categoryDetails?.categoryName || '';

    // Case-insensitive match — the stored category is uppercase ("PENDANTS"),
    // so the previous startsWith against "Pendants" never matched.
    const hasPendants = PANDENTS_INCLUDE.some(item =>
        categoryName.toLowerCase().startsWith(item.toLowerCase())
    ) || product?.haveChain === 'Yes';

    const sizeGuideHref = resolveSizeGuideHref(categoryName);

    return (
        <div className="w-full lg:sticky lg:top-24 h-fit">
            <div className={`border border-gray-200/90 bg-white shadow-sm p-5 md:p-6 font-jakarta transition-opacity duration-200 ${isPriceLoading ? 'opacity-65 pointer-events-none' : ''}`}>
                <div className="space-y-4 md:space-y-6">
                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-4 flex-wrap pb-1.5 md:pb-4 md:border-b md:border-gray-100/80">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#B57A5A]/5 flex items-center justify-center text-[#B57A5A]">
                                    <Sparkles className="w-3.5 h-3.5 fill-current opacity-85" strokeWidth={1} />
                                </div>
                                <div>
                                    <h2 className="text-[13px] font-extrabold text-gray-800 tracking-wider uppercase font-jakarta">CUSTOMIZE YOUR RING</h2>
                                    <p className="text-[11px] text-gray-400 font-jakarta">Make it uniquely yours</p>
                                </div>
                            </div>

                            {/* Ring size dropdown inline next to/in header */}
                            {product?.sizes && product?.sizes.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-gray-700 whitespace-nowrap">{product?.categoryDetails?.sizeLabel || "Size"}:</span>
                                    {mounted ? (
                                        <Select
                                            instanceId="ring-size-select"
                                            options={((product as any)?.sizes || []).map((sz: any) => ({
                                                value: sz._id,
                                                label: sz.name || sz.code || `Size ${sz.name}`
                                            }))}
                                            value={((product as any)?.sizes || []).map((sz: any) => ({
                                                value: sz._id,
                                                label: sz.name || sz.code || `Size ${sz.name}`
                                            })).find((opt: any) => opt.value === selectedSize) || null}
                                            onChange={(val: any) => setSelectedSize(val?.value || '')}
                                            placeholder="Size"
                                            styles={getSelectStyles('90px')}
                                            isSearchable={false}
                                            className="font-jakarta font-bold text-[12px]"
                                        />
                                    ) : (
                                        <div className="w-[90px] h-8 bg-gray-200 rounded animate-pulse" />
                                    )}
                                    <Link
                                        href={sizeGuideHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11.5px] font-bold text-gray-900 underline underline-offset-4 whitespace-nowrap hover:text-[#013D3D] transition-colors ml-1"
                                    >
                                        Size Guide
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Options Grid */}
                        <div className="space-y-0">
                            {/* Mobile Specs List (Vertical Menu matching mockup) */}
                            <div className="md:hidden divide-y divide-gray-100 border-t border-b border-gray-100 mb-0">
                                {/* Metal Stamp */}
                                <div
                                    onClick={() => setActiveDrawer('metal')}
                                    className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[#013D3D]/5 flex items-center justify-center text-[#013D3D] border border-[#013D3D]/10">
                                            <Box className="w-4 h-4 stroke-[1.8]" />
                                        </div>
                                        <span className="text-[14px] font-bold text-gray-850 font-jakarta">Metal</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 font-jakarta tracking-wide">
                                        <span>{selectedMetal}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Metal Colour */}
                                {(() => {
                                    const colorMap: any = {
                                        'Yellow Gold': '#C9A354',
                                        'Rose Gold': '#ECAAA1',
                                        'White Gold': '#E3E4E6',
                                        'Platinum': '#D9D9D9'
                                    };
                                    return (
                                        <div
                                            onClick={() => setActiveDrawer('color')}
                                            className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#013D3D]/5 flex items-center justify-center text-[#013D3D] border border-[#013D3D]/10">
                                                    <Palette className="w-4 h-4 stroke-[1.8]" />
                                                </div>
                                                <span className="text-[14px] font-bold text-gray-850 font-jakarta">Metal Colour</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[13.5px] font-bold text-gray-550 font-jakarta tracking-wide animate-fade-in">
                                                <span className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: colorMap[selectedColor] || '#C9A354' }} />
                                                <span>{selectedColor}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Diamond Origin */}
                                {ENABLE_DIAMOND_ORIGIN_SELECTOR && centerStone && centerDiamondsSelectable && (
                                    <div
                                        onClick={() => setActiveDrawer('origin')}
                                        className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#013D3D]/5 flex items-center justify-center text-[#013D3D] border border-[#013D3D]/10">
                                                <Gem className="w-4 h-4 stroke-[1.8]" />
                                            </div>
                                            <span className="text-[14px] font-bold text-gray-850 font-jakarta">Diamond Origin</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-550 font-jakarta tracking-wide">
                                            <span>{selectedDiamondOrigin}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                {/* Diamond Quality */}
                                {product.stoneSelector?.length > 0 && (
                                    <div
                                        onClick={() => setActiveDrawer('quality')}
                                        className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#013D3D]/5 flex items-center justify-center text-[#013D3D] border border-[#013D3D]/10">
                                                <Gem className="w-4 h-4 stroke-[1.8]" />
                                            </div>
                                            <span className="text-[14px] font-bold text-gray-850 font-jakarta">Diamond Quality</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-550 font-jakarta tracking-wide">
                                            <span>
                                                {product.stoneSelector.find((opt: any) =>
                                                    opt.color?.toLowerCase() === selectedDiamondColor.toLowerCase() &&
                                                    opt.clarity?.toLowerCase() === selectedClarity.toLowerCase()
                                                )?.displayName || `${selectedDiamondColor}/${selectedClarity}`}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                {/* Diamond Shape */}
                                {hasCenterDiamond && (
                                    <MultiCenterStoneVariationLogic
                                        currentProduct={product}
                                        variants={allVariants}
                                        onAttributeSelect={handleAttributeSelect}
                                        renderType="shape"
                                    />
                                )}

                                {/* Carat Weight */}
                                {hasCenterDiamond && (
                                    <MultiCenterStoneVariationLogic
                                        currentProduct={product}
                                        variants={allVariants}
                                        onAttributeSelect={handleAttributeSelect}
                                        renderType="carat"
                                    />
                                )}
                            </div>

                            {/* Row 1: Metal & Metal Color */}
                            <div className="hidden md:grid grid-cols-2 gap-x-8 md:pb-5 md:border-b md:border-gray-200">
                                {/* Option 1: Metal stamp */}
                                <div className="space-y-2 sm:border-r sm:border-gray-200 sm:pr-8 sm:pb-0">
                                    <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">Metal</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {availableMetalStamps.map(m => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAttributeSelect('karat', m);
                                                }}
                                                className={`px-4 py-1 border rounded-none text-[12px] font-bold font-jakarta transition-all ${selectedMetal.toLowerCase() === m.toLowerCase() ? 'border-[#B57A5A] shadow-xs text-[#B57A5A]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Option 2: Metal Color */}
                                <div className="space-y-2 sm:pl-8 sm:pt-0">
                                    <span className="text-[12px] font-extrabold text-gray-805 uppercase tracking-widest font-jakarta">Metal Color</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {availableMetalColors.map(c => {
                                            const colorMap: any = {
                                                'Yellow Gold': '#C9A354',
                                                'Rose Gold': '#ECAAA1',
                                                'White Gold': '#E3E4E6',
                                                'Platinum': '#D9D9D9'
                                            };
                                            const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                                            return (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAttributeSelect('color', c);
                                                    }}
                                                    className={`w-[36px] h-[22px] rounded-none transition-all duration-300 ${isSelected ? 'ring-1 ring-[#B57A5A] ring-offset-2 border border-white' : 'border border-gray-200 hover:border-gray-400'}`}
                                                    style={{ backgroundColor: colorMap[c] || '#C9A354' }}
                                                    title={c}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Diamond Origin & Diamond Quality + Shape & Carat Weight */}
                            {(((ENABLE_DIAMOND_ORIGIN_SELECTOR && centerStone && centerDiamondsSelectable) || product.stoneSelector?.length > 0) || hasCenterDiamond) && (
                                <div className="hidden md:grid grid-cols-2 gap-x-8 md:pt-5">
                                    {/* Left Column: Diamond Origin & Shape */}
                                    <div className="space-y-5 sm:border-r sm:border-gray-200 sm:pr-8 sm:pb-0">
                                        {/* Option 3: Diamond Origin */}
                                        {ENABLE_DIAMOND_ORIGIN_SELECTOR && centerStone && centerDiamondsSelectable ? (
                                            <div className="hidden md:block space-y-2">
                                                <span className="text-[12px] font-extrabold text-gray-805 uppercase tracking-widest font-jakarta">Diamond Origin</span>
                                                <div className="flex gap-2 flex-wrap">
                                                    {DIAMOND_ORIGINS.map((origin) => {
                                                        const isSelected = selectedDiamondOrigin.toLowerCase() === origin.toLowerCase();
                                                        return (
                                                            <button
                                                                key={origin}
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedDiamondOrigin(origin);
                                                                }}
                                                                className={`px-4 py-1 border rounded-none text-[12px] font-bold font-jakarta transition-all ${isSelected ? 'border-[#B57A5A] text-[#B57A5A] shadow-xs' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                                                            >
                                                                {origin}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Option 5: Shape Selection */}
                                        {hasCenterDiamond ? (
                                            <MultiCenterStoneVariationLogic
                                                currentProduct={product}
                                                variants={allVariants}
                                                onAttributeSelect={handleAttributeSelect}
                                                renderType="shape"
                                            />
                                        ) : null}
                                    </div>

                                    {/* Right Column: Diamond Quality & Carat Weight */}
                                    <div className="space-y-5 sm:pl-8">

                                        {/* Option 4: Diamond Quality */}
                                        {product.stoneSelector?.length > 0 ? (
                                            <div className="hidden md:block space-y-2">
                                                <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">Diamond Quality</span>
                                                <div className="flex gap-2 flex-wrap">
                                                    {product.stoneSelector
                                                        .filter((opt: any) => opt.origin?.toLowerCase() === selectedDiamondOrigin.toLowerCase())
                                                        .map((opt: any, idx: number) => {
                                                            const isSelected = selectedDiamondColor.toLowerCase() === opt.color?.toLowerCase() && selectedClarity.toLowerCase() === opt.clarity?.toLowerCase();
                                                            const isUnavailable = opt.available === false;
                                                            return (
                                                                <button
                                                                    key={`${opt.color}-${opt.clarity}-${idx}`}
                                                                    type="button"
                                                                    disabled={isUnavailable}
                                                                    title={isUnavailable ? (opt.unavailableReason || 'Not available for this design') : undefined}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (isUnavailable) return;
                                                                        setSelectedDiamondColor(opt.color || '');
                                                                        setSelectedClarity(opt.clarity || '');
                                                                    }}
                                                                    className={`px-4 py-1 border rounded-none text-[12px] font-bold font-jakarta transition-all ${isUnavailable
                                                                        ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed bg-gray-50/40'
                                                                        : isSelected
                                                                            ? 'border-[#B57A5A] text-[#B57A5A] shadow-xs'
                                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                                        }`}
                                                                >
                                                                    {opt.displayName}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Option 6: Carat Selection */}
                                        {hasCenterDiamond ? (
                                            <MultiCenterStoneVariationLogic
                                                currentProduct={product}
                                                variants={allVariants}
                                                onAttributeSelect={handleAttributeSelect}
                                                renderType="carat"
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Read-only multi-center stone info if selector not active */}
                        {ENABLE_DIAMOND_ORIGIN_SELECTOR && centerStone && !isSingleCenterDiamond && (
                            <div className="md:border-t border-gray-100 pt-2 md:pt-4 space-y-2">
                                <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">Centre Diamonds</span>
                                <div className="flex gap-2 flex-wrap">
                                    {(product?.stoneDetails || [])
                                        .filter((s: any) => s.type?.toLowerCase() === 'center')
                                        .map((s: any, idx: number) => (
                                            <div key={idx} className="border border-gray-200 rounded-none py-1.5 px-3 text-[11.5px] font-medium text-gray-700 bg-gray-50/50 font-jakarta">
                                                {[s.shape, s.color && s.clarity ? `${s.color}/${s.clarity}` : null,
                                                Number(s.totalCarat ?? s.weight) > 0 ? `${Number(s.totalCarat ?? s.weight).toFixed(3)} ct` : null,
                                                s.pieces > 1 ? `${s.pieces} pcs` : null]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Engraving UI - shown only when product supports engraving */}
                        {Boolean(product?.isEngraving === true || product?.isEngraving === 'true' || product?.isEngraving === 1) && (
                            <div className="border border-gray-200 bg-gray-50/60 p-3.5 md:p-4 mt-4 font-jakarta space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={engravingEnabled}
                                            onChange={(e) => {
                                                setEngravingEnabled?.(e.target.checked);
                                                if (!e.target.checked) setEngravingText?.('');
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-[#013D3D] accent-[#013D3D] focus:ring-[#013D3D] cursor-pointer"
                                        />
                                        <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">
                                            Add Free Engraving
                                        </span>
                                    </label>
                                </div>
                                {engravingEnabled && (
                                    <div className="space-y-1.5 pt-1 animate-fade-in">
                                        <input
                                            type="text"
                                            value={engravingText}
                                            onChange={(e) => setEngravingText?.(e.target.value)}
                                            maxLength={12}
                                            placeholder="Enter engraving text (e.g. Forever)"
                                            className="w-full h-9 bg-white border border-gray-300 px-3 text-[12.5px] font-medium text-gray-800 placeholder-gray-400 placeholder:text-[12.5px] focus:outline-none focus:border-[#013D3D] transition-colors"
                                        />
                                        <div className="flex justify-between items-center text-[10.5px] text-gray-400 font-jakarta">
                                            <span>Personalise your piece with a custom message</span>
                                            <span>{engravingText.length}/12</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Disclaimers under options */}
                        {(hasPendants || product.productDesc) && (
                            <div className="space-y-2 text-[12px] text-gray-500 leading-relaxed md:border-t border-gray-200 mt-4 md:mt-5 md:pt-5">
                                {hasPendants && (
                                    <p className="font-jakarta"><strong className="font-bold text-gray-700">Note:</strong> {PANDENTS_MESSAGE}</p>
                                )}
                                {product.productDesc && (
                                    <p className="font-jakarta italic">"{product.productDesc}"</p>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isRingBuilderMode ? (
                            <div
                                id="main-product-actions"
                                className="grid grid-cols-1 gap-4 pt-4 mt-4 md:border-t border-[#ECECEC] md:pt-6 md:mt-6 font-jakarta"
                            >
                                {hasOtherItem ? (
                                    <button
                                        type="button"
                                        onClick={handleCompleteRing}
                                        disabled={isPriceLoading}
                                        className={`w-full h-11 bg-[#B57A5A] text-white hover:bg-[#9D6A4B] rounded-none text-[12px] font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${isPriceLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        COMPLETE RING
                                    </button>
                                ) : isDiamondProduct ? (
                                    <button
                                        type="button"
                                        onClick={handleChooseDiamond}
                                        disabled={isPriceLoading}
                                        className={`w-full h-11 bg-[#B57A5A] text-white hover:bg-[#9D6A4B] rounded-none text-[12px] font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${isPriceLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        CHOOSE THIS DIAMOND
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleChooseSetting}
                                        disabled={isPriceLoading}
                                        className={`w-full h-11 bg-[#B57A5A] text-white hover:bg-[#9D6A4B] rounded-none text-[12px] font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${isPriceLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        CHOOSE THIS SETTING
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div
                                id="main-product-actions"
                                className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-4 pt-4 mt-4 md:border-t border-[#ECECEC] md:pt-6 md:mt-6"
                            >
                                {countryIN === DEFAULT_COUNTRY ? (
                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isPriceLoading}
                                        className={`w-full h-10 bg-[#B57A5A] text-white hover:bg-[#9D6A4B] rounded-none text-[12px] font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${isPriceLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                        {isInCart ? 'ADDED IN CART' : 'ADD TO CART'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleOrderInquiry?.()}
                                        disabled={isPriceLoading}
                                        className={`w-full h-10 bg-[#B57A5A] text-white hover:bg-[#9D6A4B] rounded-none text-[12px] font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${isPriceLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        ORDER INQUIRY
                                    </button>
                                )}

                                <a
                                    href={whatsappLink(`Hi, I am interested in ordering ${displayTitle}`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-10 bg-[#059043] text-white hover:bg-[#047a38] rounded-none text-[12px] font-bold tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <FaWhatsapp className="w-4.5 h-4.5 text-white" />
                                    ORDER VIA WHATSAPP
                                </a>
                            </div>
                        )}

                        {/* Standard Trust / Promises horizontal boxes */}
                        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6 pt-5 border-t border-gray-150/70">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#013D3D]/5 flex-shrink-0 flex items-center justify-center text-[#013D3D]">
                                    <Gem className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11.5px] font-extrabold text-gray-805 font-jakarta leading-none uppercase">Custom Made for You</h4>
                                    <p className="text-[10px] text-gray-400 font-jakarta leading-none">Crafted to perfection</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#013D3D]/5 flex-shrink-0 flex items-center justify-center text-[#013D3D]">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11.5px] font-extrabold text-gray-805 font-jakarta leading-none uppercase">Secure & Insured</h4>
                                    <p className="text-[10px] text-gray-450 font-jakarta leading-none">Safe delivery worldwide</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#013D3D]/5 flex-shrink-0 flex items-center justify-center text-[#013D3D]">
                                    <RotateCcw className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[11.5px] font-extrabold text-gray-805 font-jakarta leading-none uppercase">Easy Returns</h4>
                                    <p className="text-[10px] text-gray-450 font-jakarta leading-none">Hassle-free returns</p>
                                </div>
                            </div>
                        </div> */}
                        {/* Mobile Drawer (Bottom Sheet) for Metal & Diamond Origin */}
                        {activeDrawer && (
                            <>
                                <div
                                    className="fixed inset-0 backdrop-blur-xs bg-black/60 z-[200] md:hidden cursor-pointer"
                                    onClick={() => setActiveDrawer(null)}
                                />
                                <div className="fixed bottom-0 left-0 right-0 bg-white z-[201] rounded-t-2xl px-6 pt-4 pb-6 shadow-2xl md:hidden max-h-[85vh] overflow-y-auto transform translate-y-0 transition-all duration-300 border-t border-gray-100">
                                    {/* Drag Indicator Bar */}
                                    <div className="w-14 h-1 bg-gray-200 rounded-full mx-auto mb-3" />

                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[13px] font-extrabold tracking-widest uppercase text-[#B57A5A] font-jakarta">
                                            {activeDrawer === 'metal' ? 'Select Metal' : activeDrawer === 'color' ? 'Select Metal Color' : activeDrawer === 'origin' ? 'Select Diamond Origin' : 'Select Diamond Quality'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setActiveDrawer(null)}
                                            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-650 hover:bg-gray-100 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {activeDrawer === 'metal' && (
                                        <div className="divide-y divide-gray-100">
                                            {availableMetalStamps.map(m => {
                                                const isSelected = selectedMetal.toLowerCase() === m.toLowerCase();
                                                const priceStr = getKaratPrice(m);
                                                return (
                                                    <div
                                                        key={m}
                                                        onClick={() => {
                                                            handleAttributeSelect('karat', m);
                                                            setActiveDrawer(null);
                                                        }}
                                                        className="flex items-center justify-between py-4 cursor-pointer active:bg-gray-50 transition-all duration-150"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#B57A5A]' : ''}`}>
                                                                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#B57A5A]" />}
                                                            </span>
                                                            <span className="text-[13.5px] font-bold text-gray-800 uppercase">
                                                                {m}
                                                            </span>
                                                        </div>
                                                        {priceStr && (
                                                            <span className="text-[13.5px] font-extrabold text-[#B57A5A] font-jakarta">
                                                                {priceStr}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {activeDrawer === 'color' && (
                                        <div className="divide-y divide-gray-100">
                                            {availableMetalColors.map(c => {
                                                const colorMap: any = {
                                                    'Yellow Gold': '#C9A354',
                                                    'Rose Gold': '#ECAAA1',
                                                    'White Gold': '#E3E4E6',
                                                    'Platinum': '#D9D9D9'
                                                };
                                                const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                                                const priceStr = getColorPrice(c);
                                                return (
                                                    <div
                                                        key={c}
                                                        onClick={() => {
                                                            handleAttributeSelect('color', c);
                                                            setActiveDrawer(null);
                                                        }}
                                                        className="flex items-center justify-between py-4 cursor-pointer active:bg-gray-50 transition-all duration-150"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#B57A5A]' : ''}`}>
                                                                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#B57A5A]" />}
                                                            </span>
                                                            <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: colorMap[c] || '#C9A354' }} />
                                                            <span className="text-[13.5px] font-bold text-gray-800 uppercase">
                                                                {c}
                                                            </span>
                                                        </div>
                                                        {priceStr && (
                                                            <span className="text-[13.5px] font-extrabold text-[#B57A5A] font-jakarta">
                                                                {priceStr}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {activeDrawer === 'origin' && (
                                        <div className="divide-y divide-gray-100">
                                            {DIAMOND_ORIGINS.map((origin) => {
                                                const isSelected = selectedDiamondOrigin.toLowerCase() === origin.toLowerCase();
                                                return (
                                                    <div
                                                        key={origin}
                                                        onClick={() => {
                                                            setSelectedDiamondOrigin(origin);
                                                            setActiveDrawer(null);
                                                        }}
                                                        className="flex items-center justify-between py-4 cursor-pointer active:bg-gray-50 transition-all duration-150"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#B57A5A]' : ''}`}>
                                                                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#B57A5A]" />}
                                                            </span>
                                                            <span className="text-[13.5px] font-bold text-gray-800 uppercase font-jakarta">
                                                                {origin}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {activeDrawer === 'quality' && product.stoneSelector && (
                                        <div className="divide-y divide-gray-100">
                                            {product.stoneSelector
                                                .filter((opt: any) => opt.origin?.toLowerCase() === selectedDiamondOrigin.toLowerCase())
                                                .map((opt: any, idx: number) => {
                                                    const isSelected = selectedDiamondColor.toLowerCase() === opt.color?.toLowerCase() && selectedClarity.toLowerCase() === opt.clarity?.toLowerCase();
                                                    const isUnavailable = opt.available === false;
                                                    return (
                                                        <div
                                                            key={`${opt.color}-${opt.clarity}-${idx}`}
                                                            onClick={() => {
                                                                if (isUnavailable) return;
                                                                setSelectedDiamondColor(opt.color || '');
                                                                setSelectedClarity(opt.clarity || '');
                                                                setActiveDrawer(null);
                                                            }}
                                                            className={`flex items-center justify-between py-4 ${isUnavailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:bg-gray-50 transition-all duration-150'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#B57A5A]' : ''}`}>
                                                                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#B57A5A]" />}
                                                                </span>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-[13.5px] font-bold text-gray-800 ${isUnavailable ? 'line-through text-gray-400' : ''}`}>
                                                                        {opt.displayName}
                                                                    </span>
                                                                    {isUnavailable && opt.unavailableReason && (
                                                                        <span className="text-[10px] text-gray-400 mt-0.5">{opt.unavailableReason}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
            </div>
        </div>
    );
}
