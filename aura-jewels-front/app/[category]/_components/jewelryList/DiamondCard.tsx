'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/priceUtils';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobleStore } from '@/store/globleStore';

// Function to map shape names to public 3D render images
const getShapeImageUrl = (shapeName: string) => {
  const name = (shapeName || '').toLowerCase().trim();
  if (name.includes('round')) return '/images/aura-jewels/Diamonds/Round Diamond.png';
  if (name.includes('princess')) return '/images/aura-jewels/Diamonds/Princess Diamond.png';
  if (name.includes('pear')) return '/images/aura-jewels/Diamonds/Pear Diamond.png';
  if (name.includes('heart')) return '/images/aura-jewels/Diamonds/Heart Diamond.png';
  if (name.includes('asscher')) return '/images/aura-jewels/Diamonds/Asscher Dimaond.png';
  if (name.includes('cushion')) return '/images/aura-jewels/Diamonds/Cushion Diamond.png';
  if (name.includes('marquise')) return '/images/aura-jewels/Diamonds/Marquise Diamond.png';
  if (name.includes('oval')) return '/images/aura-jewels/Diamonds/Oval Diamond.png';
  if (name.includes('emerald')) return '/images/aura-jewels/Diamonds/Emerald Diamond.png';
  if (name.includes('radiant')) return '/images/aura-jewels/Diamonds/Radiant Diamond.png';
  return '/images/aura-jewels/Diamonds/Round Diamond.png';
};

interface DiamondCardProps {
  item: any;
  isRingBuilderMode?: boolean;
}

const DiamondCard: React.FC<DiamondCardProps> = ({ item, isRingBuilderMode = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist, addToWishlist, removeFromWishlist, country, currency, exchangeRate } = useGlobleStore();

  const itemId = item._id || item.id || item.stockId;
  const isInWishlist = wishlist?.some((wItem: any) => (wItem._id || wItem.id) === itemId);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist) {
        await removeFromWishlist(itemId);
        toast.success('Diamond removed from wishlist');
      } else {
        const polishVal = typeof item.polish === 'object' ? (item.polish?.name || item.polish?.parameterName || '') : (item.polish || '');
        const symmVal = typeof item.symmetry === 'object' ? (item.symmetry?.name || item.symmetry?.parameterName || '') : (item.symmetry || '');
        const fluorVal = typeof item.fluorescence === 'object' ? (item.fluorescence?.name || item.fluorescence?.parameterName || '') : (item.fluorescence || '');
        const labVal = typeof item.certLab === 'object' ? (item.certLab?.name || item.certLab?.parameterName || '') : (item.lab || item.certLab || '');

        await addToWishlist({
          id: itemId,
          _id: itemId,
          stockId: item.stockId || item.stock_id || itemId,
          title: diamondTitle,
          price: displayPrice,
          image: item.image1 || getShapeImageUrl(shapeName),
          shape: shapeName,
          carat: item.carat,
          color: colorName,
          clarity: clarityName,
          cut: cutName,
          polish: polishVal,
          symmetry: symmVal,
          fluorescence: fluorVal,
          lab: labVal,
          certNo: item.certNo || item.certificateNo || item.cert_no || '',
          depth: item.depth || item.depthPer || item.depth_percent || '',
          table: item.table || item.tablePer || item.table_percent || '',
          origin: item.origin || 'Natural',
          isDiamond: true,
        });
        toast.success('Diamond added to wishlist');
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const shapeName = typeof item.shape === 'object' ? (item.shape?.name || item.shape?.parameterName || 'Round') : (item.shape || 'Round');
  const colorName = typeof item.color === 'object' ? (item.color?.name || item.color?.parameterName || 'H') : (item.color || 'H');
  const clarityName = typeof item.clarity === 'object' ? (item.clarity?.name || item.clarity?.parameterName || 'SI1') : (item.clarity || 'SI1');
  const cutName = typeof item.cut === 'object' ? (item.cut?.name || item.cut?.parameterName || 'Excellent') : (item.cut || 'Excellent');

  // Title styled exactly like reference: "0.9 Carat F VS2 Cut Oval Diamond"
  const diamondTitle = `${item.carat ? item.carat.toFixed(2) : '1.00'} Carat ${colorName} ${clarityName} ${cutName ? `${cutName} ` : ''}${shapeName} Diamond`;

  const rawPrice = item.price || 0;
  let displayPrice = rawPrice;
  if (currency === 'INR') {
    if (rawPrice < 15000) {
      displayPrice = rawPrice * (exchangeRate || 84.5);
    }
  } else {
    if (rawPrice >= 15000) {
      displayPrice = rawPrice / (exchangeRate || 84.5);
    }
  }

  const handleSelectDiamond = () => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    
    const polishVal = typeof item.polish === 'object' ? (item.polish?.name || item.polish?.parameterName || '') : (item.polish || '');
    const symmVal = typeof item.symmetry === 'object' ? (item.symmetry?.name || item.symmetry?.parameterName || '') : (item.symmetry || '');
    const fluorVal = typeof item.fluorescence === 'object' ? (item.fluorescence?.name || item.fluorescence?.parameterName || '') : (item.fluorescence || '');
    const labVal = typeof item.certLab === 'object' ? (item.certLab?.name || item.certLab?.parameterName || '') : (item.lab || item.certLab || '');

    params.set('id', item._id || item.id || '');
    params.set('diamondStockId', item.stockId || item._id || '');
    params.set('diamondShape', shapeName);
    if (item.carat) params.set('diamondCarat', item.carat.toString());
    if (colorName) params.set('diamondColor', colorName);
    if (clarityName) params.set('diamondClarity', clarityName);
    if (cutName) params.set('diamondCut', cutName);
    if (polishVal) params.set('diamondPolish', polishVal);
    if (symmVal) params.set('diamondSymmetry', symmVal);
    if (fluorVal) params.set('diamondFluorescence', fluorVal);
    if (labVal) params.set('diamondLab', labVal);
    if (item.certNo) params.set('diamondCertNo', item.certNo);
    if (rawPrice) params.set('diamondPrice', rawPrice.toString());
    
    router.push(`/diamonds-detail?${params.toString()}`);
  };

  const formattedShape = shapeName.charAt(0).toUpperCase() + shapeName.slice(1).toLowerCase();

  return (
    <div
      onClick={handleSelectDiamond}
      className="group flex flex-col bg-transparent p-0 transition-all duration-300 relative cursor-pointer select-none"
    >
      {/* Type Badge: Lab Grown vs Natural */}
      <span className="absolute top-3 left-3 text-[9px] font-sans font-bold uppercase tracking-widest bg-white/95 text-stone-700 px-2.5 py-1 z-10 shadow-xs">
        {item.creation || 'Lab Grown'}
      </span>

      {/* Image Container with light cream background */}
      <div className="aspect-square w-full relative bg-[#FAF8F5] overflow-hidden flex items-center justify-center p-8 transition-colors duration-300 group-hover:bg-[#FAF6F0]">
        {/* Wishlist Heart Icon Badge */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-xs flex items-center justify-center transition-transform hover:scale-110 cursor-pointer border-0"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${isInWishlist ? 'fill-[#A96D56] text-[#A96D56]' : 'fill-transparent text-stone-600 hover:text-[#A96D56]'}`}
            strokeWidth={1.5}
          />
        </button>

        <Image
          src={item.image1 || getShapeImageUrl(shapeName)}
          alt={diamondTitle}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Content Area Left Aligned */}
      <div className="py-3.5 flex flex-col items-start text-left">
        {/* Price */}
        <div className="mb-1.5">
          <span className="text-[13px] font-semibold text-[#A96D56]">
            {formatPrice(displayPrice)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-sans font-medium text-[#1E1E1E] leading-[1.3] mb-1.5">
          {item.carat ? item.carat.toFixed(2) : '1.00'} Carat {formattedShape} Diamond
        </h3>

        {/* Specs */}
        <div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A96D56]">
          {colorName} | {clarityName} | {cutName || 'EX'} | {item.lab || 'IGI'}
        </div>
      </div>
    </div>
  );
};

export default DiamondCard;
