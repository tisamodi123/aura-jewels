'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Truck, ShieldCheck, RefreshCw, MessageCircle, Check, Heart } from 'lucide-react';
import RingBuilderStepBar from '../[category]/_components/jewelryList/RingBuilderStepBar';
import { formatPrice } from '@/lib/priceUtils';
import { useGlobleStore } from '@/store/globleStore';
import { getProductDetails } from '@/services/productService';
import { addToCart as addToCartApi } from '@/services/cartService';
import { getCartCookie, setCartCookie, getWishlistCookie, setWishlistCookie, getToken } from '@/services/clientCookies';
import { lineKey } from '@/lib/lineIdentity';
import diamondsData from '@/lib/diamonds_dump.json';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
import ShopBySegment from '@/components/home/ShopBySegment';
import FromBlog from '@/components/home/FromBlog';
import NearbyStore from '@/components/home/NearbyStore';

const getShapeImageUrl = (shapeName: string) => {
  const name = (shapeName || '').toLowerCase().trim();
  if (name.includes('round')) return '/images/Aura Jewels/Diamonds/Round Diamond.png';
  if (name.includes('princess')) return '/images/Aura Jewels/Diamonds/Princess Diamond.png';
  if (name.includes('pear')) return '/images/Aura Jewels/Diamonds/Pear Diamond.png';
  if (name.includes('heart')) return '/images/Aura Jewels/Diamonds/Heart Diamond.png';
  if (name.includes('asscher')) return '/images/Aura Jewels/Diamonds/Asscher Dimaond.png';
  if (name.includes('cushion')) return '/images/Aura Jewels/Diamonds/Cushion Diamond.png';
  if (name.includes('marquise')) return '/images/Aura Jewels/Diamonds/Marquise Diamond.png';
  if (name.includes('oval')) return '/images/Aura Jewels/Diamonds/Oval Diamond.png';
  if (name.includes('emerald')) return '/images/Aura Jewels/Diamonds/Emerald Diamond.png';
  if (name.includes('radiant')) return '/images/Aura Jewels/Diamonds/Radiant Diamond.png';
  return '/images/Aura Jewels/Diamonds/Round Diamond.png';
};

function CompleteRingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency, exchangeRate } = useGlobleStore();

  const settingId = searchParams ? searchParams.get('settingId') : null;
  const diamondId = searchParams ? searchParams.get('diamondId') : null;

  const [setting, setSetting] = useState<any>(null);
  const [diamond, setDiamond] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Accordion toggle states
  const [productDetailsOpen, setProductDetailsOpen] = useState(true);
  const [centerDiamondOpen, setCenterDiamondOpen] = useState(false);
  const [sideDiamondOpen, setSideDiamondOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);

      // Load setting details from API or URL fallback
      if (settingId) {
        try {
          const res = await getProductDetails(settingId);
          if (isMounted && res && (res.errorCode === 200 || res.success) && res.data) {
            setSetting(res.data);
          }
        } catch (e) {
          console.error('Error loading setting product details:', e);
        }
      }

      // Load diamond details from dump or URL params
      if (diamondId) {
        const found = diamondsData.find((d: any) => d._id === diamondId || d.stockId === diamondId);
        if (found && isMounted) {
          setDiamond(found);
        }
      }

      if (isMounted) setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [settingId, diamondId]);

  const getParamName = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.name || val.code || val.title || '';
    return String(val);
  };

  // Setting details
  const settingName = setting?.productTitle || setting?.title || searchParams?.get('settingName') || 'Solitaire Engagement Ring Setting';
  const settingSku = setting?.itemCode || setting?.sku || searchParams?.get('settingSku') || settingId || '';
  const settingMetal = setting?.metal_type?.paraname || (typeof setting?.metal === 'object' ? setting.metal?.name : setting?.metal) || searchParams?.get('metal') || '';
  const settingWeight = setting?.appxMetalWgt ? `${setting.appxMetalWgt} g` : (setting?.weight ? `${setting.weight} g` : (searchParams?.get('settingWeight') || ''));
  const settingOrigin = setting?.origin || setting?.diamondType || searchParams?.get('settingOrigin') || '';

  const rawSettingPrice = setting?.finalPrice || (searchParams?.get('settingPrice') ? parseFloat(searchParams.get('settingPrice')!) : 0);

  let displaySettingPrice = rawSettingPrice;
  if (currency === 'INR') {
    if (rawSettingPrice < 15000) {
      displaySettingPrice = rawSettingPrice * (exchangeRate || 84.5);
    }
  } else {
    if (rawSettingPrice >= 15000) {
      displaySettingPrice = rawSettingPrice / (exchangeRate || 84.5);
    }
  }

  // Diamond details
  const shapeName = getParamName(diamond?.shape) || searchParams?.get('diamondShape') || searchParams?.get('diamondImage') || '';
  const colorName = getParamName(diamond?.color) || searchParams?.get('diamondColor') || '';
  const clarityName = getParamName(diamond?.clarity) || searchParams?.get('diamondClarity') || '';
  const cutName = getParamName(diamond?.cut) || searchParams?.get('diamondCut') || '';
  const polishName = getParamName(diamond?.polish) || searchParams?.get('diamondPolish') || '';
  const symmetryName = getParamName(diamond?.symmetry) || searchParams?.get('diamondSymmetry') || '';
  const fluorescenceName = getParamName(diamond?.fluorescence) || searchParams?.get('diamondFluorescence') || '';
  const caratVal = diamond?.carat ? Number(diamond.carat).toFixed(2) : (searchParams?.get('diamondCarat') || '');
  const certLabVal = getParamName(diamond?.certLab) || searchParams?.get('diamondLab') || '';
  const stockIdVal = diamond?.stockId || diamond?.certNo || searchParams?.get('diamondStockId') || searchParams?.get('diamondCertNo') || searchParams?.get('diamondSku') || '';

  // Side Diamond details
  const sideCarat = setting?.sideDiamondCarat ? `${setting.sideDiamondCarat} ct` : (setting?.sideCarat ? `${setting.sideCarat} ct` : (searchParams?.get('sideCarat') || ''));
  const sideCount = setting?.sideDiamondCount ? `${setting.sideDiamondCount} Stones` : (searchParams?.get('sideCount') || '');
  const sideType = setting?.sideDiamondType || searchParams?.get('sideType') || '';

  const titleParts = [certLabVal, caratVal ? `${caratVal} Carat` : '', colorName, clarityName, shapeName, 'Diamond'].filter(Boolean);
  const diamondTitle = searchParams?.get('diamondTitle') || titleParts.join(' ');

  const rawDiamondPrice = diamond?.price || (searchParams?.get('diamondPrice') ? parseFloat(searchParams.get('diamondPrice')!) : 0);

  let displayDiamondPrice = rawDiamondPrice;
  if (currency === 'INR') {
    if (rawDiamondPrice < 15000) {
      displayDiamondPrice = rawDiamondPrice * (exchangeRate || 84.5);
    }
  } else {
    if (rawDiamondPrice >= 15000) {
      displayDiamondPrice = rawDiamondPrice / (exchangeRate || 84.5);
    }
  }

  // Total combined price
  const totalPrice = displaySettingPrice + displayDiamondPrice;

  const rawSettingImg = (setting?.images?.length ? setting.images[0] : null) || setting?.default_image || setting?.image || searchParams?.get('settingImage') || '/images/Ring.png';
  const resolvedSettingImg = getImageUrl(rawSettingImg);
  const ringSettingImage = (typeof resolvedSettingImg === 'string' && resolvedSettingImg.trim() !== '') ? resolvedSettingImg : '/images/Ring.png';

  const rawRingImages = (setting?.images?.length ? setting.images : [rawSettingImg]);
  const ringImages = rawRingImages
    .map((img: any) => getImageUrl(img))
    .filter((img: any) => typeof img === 'string' && img.trim() !== '');

  const diamondShapeImg = getShapeImageUrl(shapeName);
  const ringDiamondImage = (typeof diamondShapeImg === 'string' && diamondShapeImg.trim() !== '') ? diamondShapeImg : '/images/Aura Jewels/Diamonds/Round Diamond.png';

  // Selected Ring Builder State values for Step Bar
  const selectedSettingVal = {
    name: settingName,
    price: displaySettingPrice,
    image: ringSettingImage,
  };

  const selectedDiamondVal = {
    title: diamondTitle,
    price: displayDiamondPrice,
    image: ringDiamondImage,
  };

  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const settingSkuVal = setting?.itemCode || setting?.sku || searchParams?.get('settingSku') || settingId || 'ODCLR57099-B';
  const diamondSkuVal = diamond?.stockId || diamond?.certNo || searchParams?.get('diamondSku') || diamondId || 'SX-VDIA0003-0050';

  const buildCustomRingItem = () => {
    return {
      cartId: `complete-ring-${settingId || 's'}-${diamondId || 'd'}-${Date.now()}`,
      id: `complete-ring-${settingId || 's'}-${diamondId || 'd'}`,
      _id: `complete-ring-${settingId || 's'}-${diamondId || 'd'}`,
      title: `${settingName} (${diamondTitle})`,
      name: `${settingName} (${diamondTitle})`,
      image: ringSettingImage,
      default_image: ringSettingImage,
      price: totalPrice,
      setting_price: totalPrice,
      totalItemPrice: totalPrice,
      qty: 1,
      quantity: 1,
      itemCode: settingSkuVal,
      sku: settingSkuVal,
      settingName,
      settingSku: settingSkuVal,
      settingPrice: displaySettingPrice,
      settingMetal: settingMetal || '18KT White Gold',
      settingWeight,
      settingOrigin,
      diamondTitle,
      diamondPrice: displayDiamondPrice,
      diamondShape: shapeName,
      diamondCarat: caratVal,
      diamondColor: colorName,
      diamondClarity: clarityName,
      diamondCut: cutName,
      diamondPolish: polishName,
      diamondSymmetry: symmetryName,
      diamondLab: certLabVal,
      diamondStockId: stockIdVal,
      sideCarat,
      sideCount,
      sideType,
      isCompleteRing: true,
    };
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const token = getToken();
    const customRingItem = buildCustomRingItem();

    try {
      // 1. Add complete custom ring to Zustand store
      useGlobleStore.getState().addToCart(customRingItem);

      // 2. Save in localStorage for custom ring persistence
      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('Aura Jewels_custom_rings') || '[]');
          const exists = existing.some((item: any) => (item.id || item._id || item.cartId) === customRingItem.id);
          if (!exists) {
            existing.push(customRingItem);
            localStorage.setItem('Aura Jewels_custom_rings', JSON.stringify(existing));
          }
        } catch (e) {
          console.error('Error saving custom ring to localStorage:', e);
        }
      }

      // 3. Clean up guest cart cookie if standalone setting or diamond SKU were in it
      if (!token) {
        const guestCart = getCartCookie();
        const cleanedCart = guestCart.filter((g: any) => g.sku !== settingSkuVal && g.sku !== diamondSkuVal);
        setCartCookie(cleanedCart);
      }

      toast.success('Complete Ring added to cart successfully!');
    } catch (err) {
      console.error('Error adding complete ring to cart:', err);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    setAddingToWishlist(true);
    const token = getToken();
    try {
      const customRingItem = buildCustomRingItem();
      useGlobleStore.getState().addToWishlist(customRingItem);

      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('Aura Jewels_custom_wishlist') || '[]');
          const exists = existing.some((item: any) => (item.id || item._id) === customRingItem.id);
          if (!exists) {
            existing.push(customRingItem);
            localStorage.setItem('Aura Jewels_custom_wishlist', JSON.stringify(existing));
          }
        } catch (e) {
          console.error('Error saving custom ring to wishlist:', e);
        }
      }

      // Clean up guest wishlist cookie if standalone setting or diamond SKU were in it
      if (!token) {
        const guestWishlist = getWishlistCookie();
        const cleanedWishlist = guestWishlist.filter((g: any) => g.sku !== settingSkuVal && g.sku !== diamondSkuVal);
        setWishlistCookie(cleanedWishlist);
      }

      toast.success('Complete Custom Ring added to wishlist!');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      toast.error('Failed to add to wishlist.');
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1E1E1E] font-sans pb-20">
      {/* Top Ring Builder Step Navigation Bar */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4">
        <RingBuilderStepBar
          currentStep={3}
          selectedSetting={selectedSettingVal}
          selectedDiamond={selectedDiamondVal}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Assembled Ring Images & Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Ring Setting View */}
            <div className="aspect-square bg-white border border-[#ECECEC] relative flex items-center justify-center p-8 group">
              <Image
                src={ringSettingImage}
                alt={settingName}
                fill
                unoptimized
                priority
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 bg-[#1E1E1E] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1">
                Setting View
              </span>
            </div>

            {/* Diamond View */}
            <div className="aspect-square bg-white border border-[#ECECEC] relative flex items-center justify-center p-8 group">
              <Image
                src={ringDiamondImage}
                alt={diamondTitle || 'Center Diamond'}
                fill
                unoptimized
                priority
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 bg-[#1E1E1E] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1">
                Center Diamond
              </span>
            </div>

            {/* Additional gallery renders */}
            {ringImages[1] && (
              <div className="aspect-square bg-white border border-[#ECECEC] relative flex items-center justify-center p-8 group">
                <Image
                  src={ringImages[1]}
                  alt={`${settingName} Side`}
                  fill
                  unoptimized
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            {ringImages[2] && (
              <div className="aspect-square bg-white border border-[#ECECEC] relative flex items-center justify-center p-8 group">
                <Image
                  src={ringImages[2]}
                  alt={`${settingName} Detail`}
                  fill
                  unoptimized
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Complete Summary & Purchase Controls */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Main Ring Title */}
          <div className="border-b border-[#ECECEC] pb-4 mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-medium text-[#1E1E1E] leading-snug mb-2">
                {settingName}
              </h1>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-[#A96D56]">
                Complete Custom Ring
              </p>
            </div>
            <button
              onClick={handleAddToWishlist}
              disabled={addingToWishlist}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#ECECEC] hover:border-[#A96D56] hover:bg-[#FAF8F5] transition-all text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#A96D56] cursor-pointer flex-shrink-0"
              title="Add to Wishlist"
            >
              <Heart size={16} className="text-[#A96D56]" />
              <span>{addingToWishlist ? 'Saving...' : 'Wishlist'}</span>
            </button>
          </div>

          {/* Combined Total Price */}
          <div className="mb-6">
            <span className="text-3xl md:text-4xl font-bold text-[#A96D56]">
              {formatPrice(totalPrice)}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">
              Includes selected setting and center diamond. Free insured worldwide shipping.
            </p>
          </div>

          {/* Itemized Selection Breakdown Box */}
          <div className="bg-[#FBF9F6] border border-[#ECECEC] p-4 md:p-5 rounded-none space-y-4 mb-6">
            {/* Setting Breakdown */}
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-stone-200/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 relative flex-shrink-0 bg-white border border-stone-200 p-1">
                  <Image
                    src={ringSettingImage}
                    alt="Setting"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-xs md:text-sm font-semibold text-[#1E1E1E] truncate">
                    {settingName}
                  </h4>
                  <span className="text-xs font-semibold text-[#A96D56]">
                    {formatPrice(displaySettingPrice)}
                  </span>
                </div>
              </div>
              <Link
                href={`/rings?mode=builder&diamondId=${diamondId || ''}`}
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-stone-600 hover:text-[#A96D56] underline flex-shrink-0"
              >
                Change
              </Link>
            </div>

            {/* Diamond Breakdown */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 relative flex-shrink-0 bg-white border border-stone-200 p-1">
                  <Image
                    src={getShapeImageUrl(shapeName)}
                    alt="Diamond"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-xs md:text-sm font-semibold text-[#1E1E1E] truncate">
                    {diamondTitle}
                  </h4>
                  <span className="text-xs font-semibold text-[#A96D56]">
                    {formatPrice(displayDiamondPrice)}
                  </span>
                </div>
              </div>
              <Link
                href={`/diamonds?mode=builder&settingId=${settingId || ''}`}
                className="text-[11px] font-sans font-bold uppercase tracking-wider text-stone-600 hover:text-[#A96D56] underline flex-shrink-0"
              >
                Change
              </Link>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 py-4 bg-[#1E1E1E] hover:bg-[#A96D56] text-white text-[12px] font-sans font-bold uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
            >
              {addingToCart ? 'Adding to Cart...' : 'Add To Cart'}
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={addingToWishlist}
              className="px-5 py-4 border border-[#1E1E1E] hover:border-[#A96D56] hover:text-[#A96D56] text-[#1E1E1E] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              title="Add to Wishlist"
            >
              <Heart size={18} className={addingToWishlist ? 'animate-pulse' : ''} />
            </button>
          </div>

          {/* Trust Guarantees Section ("We've Got You Covered") */}
          <div className="border-t border-b border-[#ECECEC] py-5 mb-8">
            <h4 className="text-xs font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-4">
              We&apos;ve Got You Covered
            </h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs text-stone-700">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#A96D56] flex-shrink-0" />
                <span>Free Insured Shipping</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#A96D56] flex-shrink-0" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#A96D56] flex-shrink-0" />
                <span>One Free Resizing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#A96D56] flex-shrink-0" />
                <span>Consult an Expert</span>
              </div>
            </div>
          </div>

          {/* Detailed Accordion Section */}
          <div className="space-y-4">
            {/* 1. Product Details */}
            <div className="border-b border-[#ECECEC] pb-4">
              <button
                onClick={() => setProductDetailsOpen(!productDetailsOpen)}
                className="w-full flex items-center justify-between text-left font-serif text-sm font-semibold text-[#1E1E1E] cursor-pointer bg-transparent border-0 outline-none p-0"
              >
                <span>Product Details</span>
                {productDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {productDetailsOpen && (
                <div className="mt-4 space-y-2.5 text-xs text-[#1E1E1E] font-sans">
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Style Code</span>
                    <span className="font-semibold">{setting?.itemCode || 'ODCLRS7099-B'}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Total Metal Weight</span>
                    <span className="font-semibold">{setting?.appxMetalWgt ? `${setting.appxMetalWgt} g` : '3.50 g'}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Metal Purity</span>
                    <span className="font-semibold">18KT White Gold</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Diamond Certification</span>
                    <span className="font-semibold">{certLabVal} Certified Lab Grown</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Center Diamond Details */}
            <div className="border-b border-[#ECECEC] pb-4">
              <button
                onClick={() => setCenterDiamondOpen(!centerDiamondOpen)}
                className="w-full flex items-center justify-between text-left font-serif text-sm font-semibold text-[#1E1E1E] cursor-pointer bg-transparent border-0 outline-none p-0"
              >
                <span>Center Diamond Details</span>
                {centerDiamondOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {centerDiamondOpen && (
                <div className="mt-4 space-y-2.5 text-xs text-[#1E1E1E] font-sans">
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Shape</span>
                    <span className="font-semibold">{shapeName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Carat Weight</span>
                    <span className="font-semibold">{caratVal} ct</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Color</span>
                    <span className="font-semibold">{colorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Clarity</span>
                    <span className="font-semibold">{clarityName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Cut</span>
                    <span className="font-semibold">{cutName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span className="text-stone-500">Certifying Lab</span>
                    <span className="font-semibold">{certLabVal}</span>
                  </div>
                  {diamond?.stockId && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                      <span className="text-stone-500">Stock ID</span>
                      <span className="font-semibold">{diamond.stockId}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Side Diamond Details */}
            <div className="border-b border-[#ECECEC] pb-4">
              <button
                onClick={() => setSideDiamondOpen(!sideDiamondOpen)}
                className="w-full flex items-center justify-between text-left font-serif text-sm font-semibold text-[#1E1E1E] cursor-pointer bg-transparent border-0 outline-none p-0"
              >
                <span>Side Diamond Details</span>
                {sideDiamondOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {sideDiamondOpen && (
                <div className="mt-4 space-y-2 text-xs text-stone-600 leading-relaxed">
                  <p>
                    Side diamonds are expertly matched EF/VS round brilliant lab grown diamonds embedded along the band.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extra Home Sections */}
      <div className="mt-16 space-y-12">
        <ShopBySegment />
        <FromBlog />
        <NearbyStore />
      </div>
    </div>
  );
}

export default function CompleteRingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="text-center">
            <h2 className="text-xl font-serif text-stone-800 mb-2">Assembling Your Ring...</h2>
          </div>
        </div>
      }
    >
      <CompleteRingContent />
    </Suspense>
  );
}
