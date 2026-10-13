'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { errorMsg, successMsg } from '@/lib/toast';
import { getWishlist } from '@/lib/commonApi';
import { useGlobleStore } from '@/store/globleStore';
import { Heart } from 'lucide-react';
import { formatPrice, getOfferDiscountLabel } from '@/lib/priceUtils';
import { isIndiaCountry, withTax, taxInline } from '@/lib/taxUtils';
import { getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';
import M from '@/lib/messages';
import { STATUS_CODE } from '@/lib/constants';
import { getWishlist as getWishlistApi, addToWishlist as addToWishlistApi, removeFromWishlist as removeFromWishlistApi } from '@/services/wishlistService';
import { getToken } from '@/services/clientCookies';
import { isSameWishlistLine } from '@/lib/lineIdentity';

interface ProductCardProps {
  product: any;
  disableLink?: boolean;
  isRingBuilderMode?: boolean;
  searchParamsStr?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  disableLink = false,
  isRingBuilderMode = false,
  searchParamsStr = ''
}) => {
  const router = useRouter();
  const { wishlist, currency, currencySymbol, country, addToWishlist, removeFromWishlist } = useGlobleStore();
  const allVariants = product ? [product, ...(product.variants || [])].reduce((acc: any[], current: any) => {
    const uniqueId = current._id || current.id || current.slug;
    if (uniqueId && !acc.some(item => (item._id || item.id || item.slug) === uniqueId)) {
      acc.push(current);
    }
    return acc;
  }, []) : [];

  const isKaratEqual = (a: any, b: any) => {
    if (!a || !b) return false;
    return a.toString().trim().toLowerCase() === b.toString().trim().toLowerCase();
  };
  const isColorEqual = (a: any, b: any) => {
    if (!a || !b) return false;
    const nameA = typeof a === 'object' ? a.metalName : a;
    const nameB = typeof b === 'object' ? b.metalName : b;
    return (nameA || '').toString().trim().toLowerCase() === (nameB || '').toString().trim().toLowerCase();
  };
  const getUniqueBy = <T,>(arr: T[], getKey: (item: T) => string | undefined): T[] => {
    const map = new Map<string, T>();
    arr.forEach((item) => {
      const key = getKey(item);
      if (!key) return;
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  };
  const uniqueColors = getUniqueBy(
    allVariants,
    (v: any) => v.metalTypeDetail?.metalName?.trim().toLowerCase()
  ).map((v: any) => v.metalTypeDetail).filter(Boolean);

  const [selectedColor, setSelectedColor] = React.useState<any>(() => {
    return product.metalTypeDetail || uniqueColors[0] || null;
  });
  const getKaratValue = (k: string) => {
    const num = parseInt(k);
    return isNaN(num) ? 0 : num;
  };

  const uniqueKarats = getUniqueBy(
    allVariants.filter((v: any) => isColorEqual(v.metalTypeDetail, selectedColor)),
    (v: any) => v.metalStampDetail?.karat?.trim().toLowerCase()
  ).map((v: any) => v.metalStampDetail).filter(Boolean)
    .sort((a: any, b: any) => getKaratValue(a.karat) - getKaratValue(b.karat));

  const [selectedKarat, setSelectedKarat] = React.useState<any>(() => {
    return product.metalStampDetail || uniqueKarats[0] || null;
  });
  useEffect(() => {
    if (!selectedColor) return;
    const validKarats = getUniqueBy(
      allVariants.filter((v: any) => isColorEqual(v.metalTypeDetail, selectedColor)),
      (v: any) => v.metalStampDetail?.karat?.trim().toLowerCase()
    ).map((v: any) => v.metalStampDetail).filter(Boolean)
      .sort((a: any, b: any) => getKaratValue(a.karat) - getKaratValue(b.karat));

    const isValid = validKarats.some((k: any) => isKaratEqual(k.karat, selectedKarat?.karat));
    if (!isValid && validKarats.length > 0) {
      setSelectedKarat(validKarats[0]);
    }
  }, [selectedColor, allVariants]);
  const matchingVariants = allVariants.filter((v: any) =>
    isColorEqual(v.metalTypeDetail, selectedColor) &&
    isKaratEqual(v.metalStampDetail?.karat, selectedKarat?.karat)
  );
  let activeVariant = product;
  if (matchingVariants.length > 0) {
    activeVariant = matchingVariants.reduce((min: any, curr: any) => {
      const currPrice = curr?.discountedPrice ?? curr?.finalPrice;
      const minPrice = min?.discountedPrice ?? min?.finalPrice;
      return (currPrice < minPrice) ? curr : min;
    }, matchingVariants[0]);
  }
  const imageSrc = activeVariant.images && activeVariant.images.length > 0
    ? (activeVariant.images[0].MediaLocation || activeVariant.images[0].url || "")
    : "";
  const productLink = (() => {
    const baseLink = `/product/${activeVariant.slug || activeVariant._id}`;
    if (isRingBuilderMode && searchParamsStr) {
      return `${baseLink}?${searchParamsStr}`;
    }
    return baseLink;
  })();
  const displayTitle = activeVariant.productTitle || product.productTitle;
  const offerDetails = activeVariant.offerDetails || product.offerDetails || null;
  const rawDiscountedPrice = offerDetails?.discountedPrice ?? offerDetails?.discountedValue ?? activeVariant.discountedPrice ?? product.discountedPrice;
  const discountedPrice = rawDiscountedPrice !== undefined && rawDiscountedPrice !== null ? rawDiscountedPrice : (activeVariant.finalPrice || product.finalPrice || 0);
  const rawMRP = offerDetails?.mrp || offerDetails?.totalOriginalPrice || (offerDetails?.discountAmount && rawDiscountedPrice != null ? (rawDiscountedPrice + offerDetails.discountAmount) : (activeVariant.finalPrice || product.finalPrice || 0));
  const originalPrice = rawMRP;
  const displayPrice = originalPrice;

  const hasOffer = !!(offerDetails?.offer?._id || offerDetails?.offer?.code) || (rawDiscountedPrice !== undefined && rawDiscountedPrice !== null && rawDiscountedPrice < originalPrice);
  const displayCurrentPrice = (hasOffer && (discountedPrice <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= originalPrice))) ? 0 : discountedPrice;
  const displaySKU = activeVariant.itemCode || product.itemCode;

  const wishlistLinesForProduct = wishlist.filter(
    (item: any) => isSameWishlistLine(item, activeVariant)
  );
  const isInWishlist = wishlistLinesForProduct.length > 0;
  const offerDiscountLabel = getOfferDiscountLabel(offerDetails);

  const handleAddWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const defaultSize = (activeVariant.sizes || product.sizes || []).find((sz: any) => sz.isDefault) || (activeVariant.sizes || product.sizes || [])[0];
      const sizeDetailsId = typeof activeVariant?.sizeDetails === 'object'
        ? activeVariant?.sizeDetails?._id
        : (typeof product?.sizeDetails === 'object' ? product?.sizeDetails?._id : (activeVariant?.sizeDetails || product?.sizeDetails));
      const defaultSizeId = defaultSize?._id || activeVariant.selectedSize || activeVariant.sizeId || product.selectedSize || product.sizeId || sizeDetailsId || null;

      await addToWishlist({
        ...activeVariant,
        selectedOrigin: null,
        selectedColor: null,
        selectedClarity: null,
        selectedSize: defaultSizeId,
        sizeId: defaultSizeId,
      });
      toast.success('Product added to wishlist');
    } catch (error) {
      console.error("Error in handleAddWishlist:", error);
      toast.error(M.common.somethingWentWrong);
    }
  };

  const handleRemoveWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const lines = [...wishlistLinesForProduct];
      if (lines.length === 0) {
        await removeFromWishlist(activeVariant._id);
      } else {
        for (const line of lines) {
          await removeFromWishlist(line);
        }
      }
      toast.success('Product removed from wishlist');
    } catch (error) {
      console.error("Error in handleRemoveWishlist:", error);
      toast.error(M.common.somethingWentWrong);
    }
  };

  const getSwatchGradientClass = (colorName: string) => {
    const name = (colorName || '').trim().toLowerCase();
    if (name.includes('rose')) {
      return "bg-gradient-to-tr from-[#D19B82] via-[#E9B19D] to-[#C58066]";
    }
    if (name.includes('yellow')) {
      return "bg-gradient-to-tr from-[#D4AC54] via-[#F4DE9B] to-[#C5973A]";
    }
    return "bg-gradient-to-tr from-[#CCCCCC] via-[#F5F5F5] to-[#D5D5D5]";
  };

  const content = (
    <>
      {/* Image Container */}
      <div
        className="relative aspect-square w-full bg-[#F8F5F1] overflow-hidden mb-4 p-2"
      >
        {!disableLink ? (
          <Link href={productLink} className="block w-full h-full relative">
            <Image
              src={getImageUrl(imageSrc)}
              alt={displayTitle || ''}
              fill
              className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </Link>
        ) : (
          <div className="block w-full h-full relative">
            <Image
              src={getImageUrl(imageSrc)}
              alt={displayTitle || ''}
              fill
              className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        )}

        {/* Top Right Wishlist Badge */}
        <button
          onClick={(e) => isInWishlist ? handleRemoveWishlist(e) : handleAddWishlist(e)}
          className="absolute top-[12px] right-[12px] p-2 z-10 transition-transform hover:scale-110"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-[20px] h-[20px] transition-colors ${isInWishlist ? 'fill-[#B57A5A] text-[#B57A5A]' : 'fill-transparent text-[#1E1E1E] hover:text-[#B57A5A]'}`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1">
        {/* Price Row */}
        <div className="flex items-center gap-[8px] flex-wrap mb-1.5">
          <span className="text-[14px] md:text-[16px] font-bold text-[#B57A5A]">
            {formatPrice(withTax(displayCurrentPrice, country))}
          </span>
          {hasOffer && (
            <span className="text-[12px] md:text-[14px] text-[#666666] line-through">
              {formatPrice(withTax(displayPrice, country))}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[14px] md:text-[15px] min-h-[38px] font-serif font-medium text-[#1E1E1E] leading-[1.3] line-clamp-2 transition-colors ">
          {!disableLink ? (
            <Link href={productLink}>
              {displayTitle}
            </Link>
          ) : (
            displayTitle
          )}
        </h3>

        <div className="mt-auto pt-1 flex flex-col">
          <div className="flex flex-row flex-wrap items-center justify-between gap-y-1.5 gap-x-2 px-1 pb-0.5">
            {/* Color Swatches */}
            {uniqueColors.length > 0 && (
              <div className="flex items-center px-1.5 py-0.5">
                <div className="flex items-center gap-1">
                  {uniqueColors.map((colorObj: any, idx: number) => {
                    const isSelected = isColorEqual(colorObj, selectedColor);
                    const title = colorObj.metalName || 'Metal';
                    const gradientClass = getSwatchGradientClass(title);
                    return (
                      <button
                        key={idx}
                        title={title}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedColor(colorObj);
                        }}
                        className={`w-[20px] h-[20px] rounded-full transition-all cursor-pointer shadow-xs border ${isSelected
                          ? 'border-white ring-1 ring-[#B57A5A] ring-offset-1 scale-105'
                          : 'border-white hover:scale-105'
                          } ${gradientClass}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metal Selection */}
            {uniqueKarats?.length > 0 && (
              <div className="flex items-center px-1.5 py-0.5">
                <div className="flex items-center gap-1">
                  {uniqueKarats.map((karatObj: any, idx: number) => {
                    const isSelected = isKaratEqual(karatObj.karat, selectedKarat?.karat);
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedKarat(karatObj);
                        }}
                        className={`text-[11px] font-sans font-bold uppercase px-1.5 py-0.5 transition-all border ${isSelected
                          ? 'bg-[#B57A5A] text-white border-[#B57A5A]'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-[#B57A5A]'
                          }`}
                      >
                        {karatObj.karat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="group flex flex-col h-full bg-white transition-all duration-300">
      {content}
    </div>
  );
};

export default ProductCard;
