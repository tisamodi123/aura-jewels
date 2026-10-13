'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Share2, Heart } from 'lucide-react';
import CommonSlider, { SwiperType } from '@/components/common/CommonSlider';
import ProductZoomPreview from '@/components/product/ProductZoomPreview';
import { getImageUrl, handleShareProduct } from '@/lib/utils';
import { noImgFound } from '@/lib/Api_Url';
import { IMAGE_GALLERY_MESSAGE } from '@/lib/constants';

interface ProductGalleryProps {
    product: any;
    productVideoUrl: string;
    isWishlisted: boolean;
    handleWishlistToggle: () => void;
    setModalImg: (img: string | null) => void;
    setModalMediaType: (type: 'image' | 'video') => void;
    setIsSideModalOpen: (isOpen: boolean) => void;
    zoomStyle: any;
    handleZoomImg: (e: any, imgUrl: string) => void;
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
    mounted: boolean;
}

export default function ProductGallery({
    product,
    productVideoUrl,
    isWishlisted,
    handleWishlistToggle,
    setModalImg,
    setModalMediaType,
    setIsSideModalOpen,
    zoomStyle,
    handleZoomImg,
    hoveredIndex,
    setHoveredIndex,
    mounted
}: ProductGalleryProps) {
    const swiperRef = useRef<SwiperType | null>(null);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (thumbnailContainerRef.current) {
            const container = thumbnailContainerRef.current;
            const targetScrollLeft = Math.max(0, (activeMediaIndex - 1) * 92);
            container.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        }
    }, [activeMediaIndex]);

    const hasVideo = !!(
        productVideoUrl &&
        productVideoUrl.trim() !== "" &&
        productVideoUrl !== "null" &&
        productVideoUrl !== "undefined" &&
        productVideoUrl !== "none"
    );

    const handleImageError = (imgUrl: string) => {
        setImageErrors(prev => ({ ...prev, [imgUrl]: true }));
    };

    // console.log("hasvideo------>", hasVideo, productVideoUrl)

    const getProductImageSrc = (imgUrl: string) => {
        if (!imgUrl || imageErrors[imgUrl]) {
            return getImageUrl(noImgFound);
        }
        return getImageUrl(imgUrl);
    };

    const getMediaUrl = (imgItem: any): string => {
        if (imgItem && typeof imgItem === 'object') {
            return imgItem.MediaLocation || '';
        }
        return imgItem || '';
    };

    let imagesList = (product.galleryImages || product.images || [product.default_image || product.image]).filter(Boolean).slice(0, 5);
    if (imagesList.length === 0) {
        imagesList = [noImgFound];
    }

    const totalItems = imagesList.length + (hasVideo ? 1 : 0);

    return (
        <div className="md:mb-5">
            {/* Desktop Grid */}
            <div
                className="hidden md:grid gap-4 md:grid-cols-2"
            >
                {imagesList.map((imgItem: any, i: number) => {
                    const img = getMediaUrl(imgItem);
                    if (!img) return null;
                    const isFallback = !img || imageErrors[img];
                    return (
                        <div
                            key={i}
                            className={`aspect-square bg-[#F9F9F9] border border-gray-150/80 overflow-hidden relative group/item w-full ${isFallback ? 'cursor-default' : 'cursor-pointer'}`}
                            onMouseEnter={() => {
                                if (!isFallback) setHoveredIndex(i);
                            }}
                            onMouseLeave={() => {
                                if (!isFallback) setHoveredIndex(null);
                            }}
                            onMouseMove={(e) => {
                                if (!isFallback) handleZoomImg(e, img);
                            }}
                            onClick={() => {
                                if (isFallback) return;
                                setModalImg(img);
                                setModalMediaType('image');
                                setIsSideModalOpen(true);
                            }}
                        >
                            <Image
                                src={getProductImageSrc(img)}
                                alt={`${product.productTitle || product.title || product.name} view ${i + 1}`}
                                fill
                                priority={i === 0}
                                className="object-contain mix-blend-multiply transition-transform duration-500 group-hover/item:scale-110 opacity-100"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                onError={() => handleImageError(img)}
                            />
                            <div className={`absolute inset-0 bg-black/0 ${isFallback ? '' : 'group-hover/item:bg-black/5'} transition-colors duration-300 pointer-events-none`} />
                        </div>
                    );
                })}
                {hasVideo && (
                    <div
                        className="aspect-square bg-[#F9F9F9] border border-gray-150/80 overflow-hidden relative group/item cursor-pointer w-full"
                        onClick={() => {
                            setModalImg(productVideoUrl);
                            setModalMediaType('video');
                            setIsSideModalOpen(true);
                        }}
                    >
                        <video
                            src={productVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/item:scale-110"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] text-[#014242] shadow-sm border border-gray-100">
                                360° VIEW
                            </div>
                        </div>
                        <div className="absolute top-2 right-2 pointer-events-none">
                            <div className="bg-[#014242] text-white text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider">
                                360°
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {(() => {
                    const mediaItems = [
                        ...(imagesList.map((imgItem: any) => ({ type: 'image', url: getMediaUrl(imgItem) })).filter((item: any) => item.url)),
                        ...(hasVideo ? [{ type: 'video', url: productVideoUrl }] : [])
                    ];

                    return (
                        <>
                            {/* Main Media Slider */}
                            <div className="relative group">
                                {mounted && (
                                    <CommonSlider
                                        items={mediaItems}
                                        loop={true}
                                        slidesPerView={1}
                                        spaceBetween={0}
                                        autoplay={false}
                                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                                        onSlideChange={(index) => setActiveMediaIndex(index)}
                                        renderItem={(item: any) => {
                                            const isMobileFallback = item.type === 'image' && (!item.url || imageErrors[item.url as string]);
                                            return (
                                                <div
                                                    className={`aspect-square bg-[#F8F6F2] p-5 overflow-hidden relative w-full rounded-none shadow-sm border-b border-gray-100 ${isMobileFallback ? 'cursor-default' : 'cursor-pointer'}`}
                                                    onClick={() => {
                                                        if (isMobileFallback) return;
                                                        setModalImg(item.url as string);
                                                        setModalMediaType(item.type as 'image' | 'video');
                                                        setIsSideModalOpen(true);
                                                    }}
                                                >
                                                    {item.type === 'image' ? (
                                                        <Image
                                                            src={getProductImageSrc(item.url as string)}
                                                            alt={product?.title || product?.name || ""}
                                                            fill
                                                            className="object-contain mix-blend-multiply"
                                                            priority
                                                            sizes="(max-width: 768px) calc(100vw - 3rem)"
                                                            onError={() => handleImageError(item.url as string)}
                                                        />
                                                    ) : (
                                                        <video
                                                            src={item.url as string}
                                                            autoPlay
                                                            loop
                                                            muted
                                                            playsInline
                                                            className="w-full h-full object-contain mix-blend-multiply"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    />
                                )}
                                {/* Mobile Quick Actions Over Slider */}
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between z-10 pointer-events-none">
                                    <button
                                        type="button"
                                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700 active:scale-90 transition-all border border-gray-100 pointer-events-auto"
                                        title="Share product"
                                        onClick={() => handleShareProduct(product)}
                                    >
                                        <Share2 className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                        type="button"
                                        className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center active:scale-90 transition-all border border-gray-100 pointer-events-auto ${isWishlisted ? 'text-[#013D3D]' : 'text-gray-700'}`}
                                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                        onClick={handleWishlistToggle}
                                    >
                                        <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            <div
                                ref={thumbnailContainerRef}
                                className="flex overflow-x-auto justify-start gap-3 px-0 pb-4 scrollbar-hide"
                            >
                                {mediaItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => swiperRef.current?.slideTo(idx)}
                                        className={`relative w-20 h-20 flex-shrink-0 bg-[#F9F9F9] rounded-none overflow-hidden border-2 transition-all duration-300 ${activeMediaIndex === idx ? 'border-[#e0e0e0]' : 'border-transparent'}`}
                                    >
                                        {item.type === 'image' ? (
                                            <Image
                                                src={getProductImageSrc(item.url as string)}
                                                alt="Thumbnail"
                                                fill
                                                className="object-contain mix-blend-multiply p-1"
                                                sizes="80px"
                                                onError={() => handleImageError(item.url as string)}
                                            />
                                        ) : (
                                            <div className="relative w-full h-full">
                                                <video
                                                    src={item.url as string}
                                                    className="w-full h-full object-contain mix-blend-multiply p-1"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                    <div className="bg-white/80 rounded-full p-1">
                                                        <svg className="w-4 h-4 text-[#014242]" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    );
                })()}
            </div>
            {/* Product Image Disclaimer */}
            {/* <div className="mt-4 rounded-md border border-[#E5E7EB] bg-[#F9F9F9] px-4 py-3"> */}
            {/* <p className="mt-4 text-xs md:text-[10px] text-gray-600 leading-relaxed text-end">
                <span className="font-semibold text-[#014242]">Disclaimer:</span>{" "}
                {IMAGE_GALLERY_MESSAGE}
            </p> */}
            {/* </div> */}
        </div>
    );
}
