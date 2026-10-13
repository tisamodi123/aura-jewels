import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { X } from 'lucide-react';

export interface MultiCenterStoneVariationProps {
    currentProduct: any;
    variants: any[];
    onAttributeSelect: (type: string, value: any) => void;
    renderType?: 'shape' | 'carat';
}

const MultiCenterStoneVariationLogic: React.FC<MultiCenterStoneVariationProps> = ({
    currentProduct,
    variants,
    onAttributeSelect,
    renderType
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        if (isDrawerOpen) {
            document.body.classList.add('has-open-drawer');
        } else {
            document.body.classList.remove('has-open-drawer');
        }
        return () => {
            document.body.classList.remove('has-open-drawer');
        };
    }, [isDrawerOpen]);

    const getCombinedShape = (v: any) => {
        const vCenterStones = v.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
        if (vCenterStones.length > 0) {
            return vCenterStones.map((s: any) => s.shape?.trim()).filter(Boolean).join(' / ');
        }
        return v.shape?.trim() || '';
    };

    const getCombinedCarat = (v: any) => {
        const vCenterStones = v.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
        if (vCenterStones.length > 0) {
            return vCenterStones.map((s: any) => Number(s.totalCarat || s.weight || 0).toFixed(3)).join(' / ');
        }
        return v.totalCarat ? Number(v.totalCarat).toFixed(3) : '';
    };

    const getCombinedQuality = (v: any) => {
        const vCenterStones = v.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
        if (vCenterStones.length > 0) {
            return vCenterStones.map((s: any) => {
                const color = s.color?.trim().toUpperCase();
                const clarity = s.clarity?.trim().toUpperCase();
                return color && clarity ? `${color}/${clarity}` : null;
            }).filter(Boolean).join(' | ');
        }
        const color = v.color?.trim().toUpperCase();
        const clarity = v.clarity?.trim().toUpperCase();
        return color && clarity ? `${color}/${clarity}` : '';
    };

    const isColorEqual = (a: any, b: any) => {
        if (!a || !b) return false;
        const nameA = typeof a === 'object' ? a.metalName : a;
        const nameB = typeof b === 'object' ? b.metalName : b;
        return (nameA || '').toString().trim().toLowerCase() === (nameB || '').toString().trim().toLowerCase();
    };

    const isKaratEqual = (a: any, b: any) => {
        if (a === b) return true;
        if (!a || !b) return false;
        return a.toString().trim().toLowerCase() === b.toString().trim().toLowerCase();
    };

    const currentProductShape = getCombinedShape(currentProduct);
    const currentProductCarat = getCombinedCarat(currentProduct);
    const currentProductQuality = getCombinedQuality(currentProduct);

    const getBaseUrl = (vars: any[]) => {
        for (const v of vars) {
            if (v.shapeImage && typeof v.shapeImage === 'string' && v.shapeImage.includes('/')) {
                return v.shapeImage.substring(0, v.shapeImage.lastIndexOf('/') + 1);
            }
        }
        return '';
    };

    const shapeToImageMap = new Map<string, string>();
    variants.forEach(v => {
        const baseUrl = getBaseUrl(variants);
        if (v.shape && v.shapeImage) {
            shapeToImageMap.set(v.shape.trim().toLowerCase(), v.shapeImage);
        }
        const vCenterStones = v.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
        vCenterStones.forEach((s: any) => {
            if (s.shape && s.shapeImage) {
                const fullUrl = s.shapeImage.startsWith('http') ? s.shapeImage : (baseUrl + s.shapeImage);
                shapeToImageMap.set(s.shape.trim().toLowerCase(), fullUrl);
            }
        });
    });

    // 3. Diamond Shape (Filtered by Color & Karat)
    const uniqueShapes = Array.from(
        variants
            .filter((v: any) =>
                isColorEqual(v.metalTypeDetail, currentProduct.metalTypeDetail) &&
                isKaratEqual(v.metalStampDetail?.karat, currentProduct.metalStampDetail?.karat)
            )
            .reduce((acc: Map<string, { shape: string; images: string[] }>, v: any) => {
                const shapeStr = getCombinedShape(v);
                if (!shapeStr || acc.has(shapeStr)) return acc;

                const vCenterStones = v.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
                let uniqueShapeNames: string[] = [];
                if (vCenterStones.length > 0) {
                    uniqueShapeNames = Array.from(new Set(vCenterStones.map((s: any) => s.shape?.trim()).filter(Boolean)));
                }

                const baseUrl = getBaseUrl(variants);
                let images = uniqueShapeNames.map((name) => {
                    const matchingStone = vCenterStones.find((s: any) => s.shape?.trim().toLowerCase() === name.toLowerCase());
                    if (matchingStone && matchingStone.shapeImage) {
                        return matchingStone.shapeImage.startsWith('http') ? matchingStone.shapeImage : (baseUrl + matchingStone.shapeImage);
                    }
                    return shapeToImageMap.get(name.toLowerCase()) || "";
                });

                acc.set(shapeStr, { shape: shapeStr, images: images });
                return acc;
            }, new Map())
            .values()
    ).sort((a: any, b: any) => (a.shape || '').localeCompare(b.shape || ''));

    // 4. Diamond Quality (Filtered by Color & Karat & Shape)
    const uniqueQualities = Array.from(
        new Set(
            variants
                .filter((v: any) =>
                    isColorEqual(v.metalTypeDetail, currentProduct.metalTypeDetail) &&
                    isKaratEqual(v.metalStampDetail?.karat, currentProduct.metalStampDetail?.karat) &&
                    (!currentProductShape || getCombinedShape(v).toLowerCase() === currentProductShape.toLowerCase())
                )
                .map((v: any) => getCombinedQuality(v))
        )
    ).filter(Boolean).sort((a: any, b: any) => (a || '').toString().localeCompare((b || '').toString()));

    // 5. Diamond Carat Weight (Filtered by Color & Karat & Shape & Quality)
    const getCaratsWeightSum = (cStr: string) => {
        return cStr.split('/').reduce((acc, p) => acc + (parseFloat(p) || 0), 0);
    };

    const uniqueCarats = Array.from(
        new Set(
            variants
                .filter((v: any) =>
                    isColorEqual(v.metalTypeDetail, currentProduct.metalTypeDetail) &&
                    isKaratEqual(v.metalStampDetail?.karat, currentProduct.metalStampDetail?.karat) &&
                    (!currentProductShape || getCombinedShape(v).toLowerCase() === currentProductShape.toLowerCase()) &&
                    (!currentProductQuality || getCombinedQuality(v).toLowerCase() === currentProductQuality.toLowerCase())
                )
                .map((v: any) => getCombinedCarat(v))
        )
    ).filter(Boolean).sort((a: any, b: any) => getCaratsWeightSum(a) - getCaratsWeightSum(b));

    const centerStones = currentProduct?.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
    if (centerStones.length !== 1) return null;

    const centerStone = centerStones[0];
    const isColorStone = centerStone.stoneGroup?.stoneType?.toLowerCase() === "color stone" ||
        centerStone.stoneGroup?.stoneType?.toLowerCase() === "gemstone" ||
        centerStone.type?.toLowerCase() === "gem";
    if (isColorStone) return null;

    if (renderType === 'shape') {
        return uniqueShapes.length > 0 ? (
            <div>
                {/* Mobile Trigger Row */}
                <div
                    onClick={() => setIsDrawerOpen(true)}
                    className="md:hidden flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#B57A5A]/5 flex items-center justify-center text-[#B57A5A] border border-[#B57A5A]/10">
                            {/* Shape Icon */}
                            <svg className="w-4 h-4 text-[#B57A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L4 12l8 9 8-9-8-9z" />
                            </svg>
                        </div>
                        <span className="text-[14px] font-bold text-gray-855 font-jakarta">Diamond Shape</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 font-jakarta tracking-wide">
                        <span>{currentProductShape}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block space-y-2">
                    <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">
                        Shape{currentProductShape ? `: ${currentProductShape}` : ''}
                    </span>
                    <div className="flex gap-2.5 flex-wrap">
                        {uniqueShapes.map((shape: any) => {
                            const isSelected = currentProductShape.toLowerCase() === shape.shape.toLowerCase();
                            const validImages = shape.images.filter(Boolean);

                            return (
                                <button
                                    key={shape.shape}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onAttributeSelect('shape', shape.shape);
                                    }}
                                    className={`w-[36px] h-[36px] border rounded-none flex items-center justify-center p-1.5 transition-all ${isSelected ? 'border-[#B57A5A] ring-2 ring-[#B57A5A]/10 bg-[#B57A5A]/5' : 'border-gray-200 hover:border-gray-400 bg-white'}`}
                                    title={shape.shape}
                                >
                                    {validImages.length > 0 ? (
                                        <div className="flex items-center justify-center">
                                            {validImages.map((img: string, idx: number) => (
                                                <div key={idx} className="relative w-7 h-7 overflow-hidden flex items-center justify-center">
                                                    <img src={getImageUrl(img)} alt={shape.shape} className="w-full h-full object-contain" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className={`text-[12px] font-bold font-jakarta text-center ${isSelected ? 'text-[#B57A5A]' : 'text-gray-700'}`}>
                                            {shape.shape.charAt(0)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Drawer (Bottom Sheet) */}
                {isDrawerOpen && (
                    <>
                        <div
                            className="fixed inset-0 backdrop-blur-xs bg-black/60 z-[200] md:hidden cursor-pointer"
                            onClick={() => setIsDrawerOpen(false)}
                        />
                        <div className="fixed bottom-0 left-0 right-0 bg-white z-[201] rounded-t-2xl px-6 pt-4 pb-6 shadow-2xl md:hidden max-h-[85vh] overflow-y-auto transform translate-y-0 transition-all duration-300 border-t border-gray-100">
                            {/* Drag Indicator Bar */}
                            <div className="w-14 h-1 bg-gray-200 rounded-full mx-auto mb-3" />

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[13px] font-extrabold tracking-widest uppercase text-[#B57A5A] font-jakarta">Select Shape</span>
                                <button
                                    type="button"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-650 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {uniqueShapes.map((shape: any) => {
                                    const isSelected = currentProductShape.toLowerCase() === shape.shape.toLowerCase();
                                    const validImages = shape.images.filter(Boolean);

                                    return (
                                        <button
                                            key={shape.shape}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onAttributeSelect('shape', shape.shape);
                                                setIsDrawerOpen(false);
                                            }}
                                            className={`w-20 h-22 p-2 rounded-xl border flex flex-col items-center justify-center transition-all shadow-xs cursor-pointer group ${isSelected ? 'border-[#B57A5A] bg-[#B57A5A]/5 text-[#B57A5A] ring-1 ring-[#B57A5A]/30 scale-102 font-bold' : 'border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'}`}
                                        >
                                            {validImages.length > 0 ? (
                                                <div className="w-11 h-11 relative flex items-center justify-center">
                                                    {validImages.map((img: string, idx: number) => (
                                                        <img key={idx} src={getImageUrl(img)} alt={shape.shape} className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="w-11 h-11 flex items-center justify-center text-[18px] font-bold text-gray-700">
                                                    {shape.shape.charAt(0)}
                                                </span>
                                            )}
                                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-gray-600 font-jakarta text-center mt-1">
                                                {shape.shape}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        ) : null;
    }

    if (renderType === 'carat') {
        return uniqueCarats.length > 0 ? (
            <div>
                {/* Mobile Trigger Row */}
                <div
                    onClick={() => setIsDrawerOpen(true)}
                    className="md:hidden flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#B57A5A]/5 flex items-center justify-center text-[#B57A5A] border border-[#B57A5A]/10">
                            {/* Carat / Scale Icon */}
                            <svg className="w-4 h-4 text-[#B57A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                                <circle cx="12" cy="12" r="9" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                            </svg>
                        </div>
                        <span className="text-[14px] font-bold text-gray-855 font-jakarta">Carat Weight</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 font-jakarta tracking-wide">
                        <span>{currentProductCarat}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block space-y-2">
                    <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">Carat Weight</span>
                    <div className="flex gap-2.5 flex-wrap">
                        {uniqueCarats.map((carat: any) => {
                            const isSelected = currentProductCarat === carat;
                            return (
                                <button
                                    key={carat}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onAttributeSelect('carat', carat);
                                    }}
                                    className={`px-4 py-1 border rounded-none text-[12px] font-bold font-jakarta transition-all ${isSelected ? 'border-[#B57A5A] text-[#B57A5A] shadow-xs' : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'}`}
                                >
                                    {carat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Drawer (Bottom Sheet) */}
                {isDrawerOpen && (
                    <>
                        <div
                            className="fixed inset-0 backdrop-blur-xs bg-black/60 z-[200] md:hidden cursor-pointer"
                            onClick={() => setIsDrawerOpen(false)}
                        />
                        <div className="fixed bottom-0 left-0 right-0 bg-white z-[201] rounded-t-2xl px-6 pt-4 pb-6 shadow-2xl md:hidden max-h-[85vh] overflow-y-auto transform translate-y-0 transition-all duration-300 border-t border-gray-100">
                            {/* Drag Indicator Bar */}
                            <div className="w-14 h-1 bg-gray-200 rounded-full mx-auto mb-3" />

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[13px] font-extrabold tracking-widest uppercase text-[#B57A5A] font-jakarta">Select Carat Weight</span>
                                <button
                                    type="button"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-650 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {uniqueCarats.map((carat: any) => {
                                    const isSelected = currentProductCarat === carat;
                                    return (
                                        <div
                                            key={carat}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onAttributeSelect('carat', carat);
                                                setIsDrawerOpen(false);
                                            }}
                                            className="flex items-center justify-between py-4 cursor-pointer active:bg-gray-50 transition-all duration-150"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#B57A5A]' : ''}`}>
                                                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#B57A5A]" />}
                                                </span>
                                                <span className="text-[13.5px] font-bold text-gray-800 uppercase font-jakarta">
                                                    {carat}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        ) : null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 pt-5">
            {/* Shape Selection */}
            <div className="space-y-2 sm:border-r sm:border-gray-200 sm:pr-8 pb-4 sm:pb-0">
                {uniqueShapes.length > 0 ? (
                    <>
                        <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">
                            Shape{currentProductShape ? `: ${currentProductShape}` : ''}
                        </span>
                        <div className="flex gap-2.5 flex-wrap">
                            {uniqueShapes.map((shape: any) => {
                                const isSelected = currentProductShape.toLowerCase() === shape.shape.toLowerCase();
                                const validImages = shape.images.filter(Boolean);

                                return (
                                    <button
                                        key={shape.shape}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onAttributeSelect('shape', shape.shape);
                                        }}
                                        className={`w-[36px] h-[36px] border rounded-none flex items-center justify-center p-1.5 transition-all ${isSelected ? 'border-[#B57A5A] ring-2 ring-[#B57A5A]/10 bg-[#B57A5A]/5' : 'border-gray-200 hover:border-gray-400 bg-white'}`}
                                        title={shape.shape}
                                    >
                                        {validImages.length > 0 ? (
                                            <div className="flex items-center justify-center">
                                                {validImages.map((img: string, idx: number) => (
                                                    <div key={idx} className="relative w-7 h-7 overflow-hidden flex items-center justify-center">
                                                        <img src={getImageUrl(img)} alt={shape.shape} className="w-full h-full object-contain" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`text-[12px] font-bold font-jakarta text-center ${isSelected ? 'text-[#B57A5A]' : 'text-gray-700'}`}>
                                                {shape.shape.charAt(0)}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                ) : null}
            </div>

            {/* Carat Selection */}
            <div className="space-y-2 sm:pl-8 pt-4 sm:pt-0">
                {uniqueCarats.length > 0 ? (
                    <>
                        <span className="text-[12px] font-extrabold text-gray-800 uppercase tracking-widest font-jakarta">Carat Weight</span>
                        <div className="flex gap-2.5 flex-wrap">
                            {uniqueCarats.map((carat: any) => {
                                const isSelected = currentProductCarat === carat;
                                return (
                                    <button
                                        key={carat}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onAttributeSelect('carat', carat);
                                        }}
                                        className={`px-4 py-2 border rounded-none text-[12px] font-bold font-jakarta transition-all ${isSelected ? 'bg-[#B57A5A] text-white border-[#B57A5A] shadow-xs' : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'}`}
                                    >
                                        {carat}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default MultiCenterStoneVariationLogic;
