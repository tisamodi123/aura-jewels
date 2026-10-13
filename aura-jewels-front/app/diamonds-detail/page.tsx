'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, FileText, Heart } from 'lucide-react';
import RingBuilderStepBar from '../[category]/_components/jewelryList/RingBuilderStepBar';
import { formatPrice } from '@/lib/priceUtils';
import { useGlobleStore } from '@/store/globleStore';
import { toast } from 'sonner';
import ShopBySegment from '@/components/home/ShopBySegment';
import FromBlog from '@/components/home/FromBlog';
import NearbyStore from '@/components/home/NearbyStore';

import { getDiamondDetails } from '@/services/productService';

// Helper to safely extract parameter names whether string or object
const getParamName = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.name || val.parameterName || val.code || val.title || val.value || '';
  return String(val);
};

// Helper to map shape names to public 3D renders
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

function DiamondDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist, addToWishlist, removeFromWishlist, addToCart, currency, exchangeRate } = useGlobleStore();

  const id = searchParams ? searchParams.get('id') : null;
  const [diamond, setDiamond] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Accordion state
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [additionalOpen, setAdditionalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Helper to build object from URL params if API doesn't return direct result
    const buildFromUrlParams = () => {
      const shape = searchParams?.get('diamondShape') || searchParams?.get('diamondImage') || searchParams?.get('shape') || searchParams?.get('view');
      const price = searchParams?.get('diamondPrice') || searchParams?.get('price');
      if (shape || price || id) {
        return {
          _id: id || '',
          stockId: searchParams?.get('diamondStockId') || id || '',
          certNo: searchParams?.get('certNo') || searchParams?.get('cert'),
          shape: shape !== 'all' ? shape : 'Round',
          carat: searchParams?.get('diamondCarat') ? parseFloat(searchParams.get('diamondCarat')!) : null,
          color: searchParams?.get('diamondColor'),
          clarity: searchParams?.get('diamondClarity'),
          cut: searchParams?.get('diamondCut'),
          polish: searchParams?.get('diamondPolish'),
          symmetry: searchParams?.get('diamondSymmetry'),
          fluorescence: searchParams?.get('diamondFluorescence'),
          certLab: searchParams?.get('diamondLab'),
          price: price ? parseFloat(price) : 0,
        };
      }
      return null;
    };

    if (id) {
      setLoading(true);
      getDiamondDetails(id)
        .then((res: any) => {
          if (!isMounted) return;
          const detailData = res?.data || res?.result || res?.diamond;
          if (detailData && (detailData._id || detailData.stockId || detailData.id)) {
            setDiamond(detailData);
          } else {
            const fallback = buildFromUrlParams();
            setDiamond(fallback);
          }
        })
        .catch((err) => {
          console.error('Error fetching diamond details from API:', err);
          if (isMounted) {
            const fallback = buildFromUrlParams();
            setDiamond(fallback);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      const fallback = buildFromUrlParams();
      setDiamond(fallback);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <h2 className="text-xl font-serif text-stone-800 mb-2">Loading Diamond Details...</h2>
          <p className="text-sm text-stone-500">Please wait while we retrieve the product.</p>
        </div>
      </div>
    );
  }

  if (!diamond) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center">
          <h2 className="text-xl font-serif text-stone-800 mb-2">Diamond Not Found</h2>
          <p className="text-sm text-stone-500 mb-4">The requested diamond could not be retrieved from the server.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#1E1E1E] text-white text-xs uppercase tracking-widest font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Price conversion matching DiamondCard
  const rawPrice = diamond.price || 0;
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

  const shapeName = getParamName(diamond.shape) || searchParams?.get('diamondShape') || searchParams?.get('shape') || '';
  const colorName = getParamName(diamond.color) || searchParams?.get('diamondColor') || searchParams?.get('color') || '';
  const clarityName = getParamName(diamond.clarity) || searchParams?.get('diamondClarity') || searchParams?.get('clarity') || '';
  const cutName = getParamName(diamond.cut) || searchParams?.get('diamondCut') || searchParams?.get('cut') || '';
  const polishName = getParamName(diamond.polish) || searchParams?.get('diamondPolish') || searchParams?.get('polish') || '';
  const symmetryName = getParamName(diamond.symmetry) || searchParams?.get('diamondSymmetry') || searchParams?.get('symmetry') || '';
  const fluorescenceName = getParamName(diamond.fluorescence) || searchParams?.get('diamondFluorescence') || searchParams?.get('fluorescence') || '';
  const labName = getParamName(diamond.certLab) || searchParams?.get('diamondLab') || searchParams?.get('lab') || searchParams?.get('certLab') || '';
  const caratVal = diamond.carat ? Number(diamond.carat).toFixed(2) : (searchParams?.get('diamondCarat') || searchParams?.get('carat') || '');
  const stockIdVal = diamond.stockId || searchParams?.get('diamondStockId') || diamond._id || '';
  const certNoVal = diamond.certNo || searchParams?.get('diamondCertNo') || searchParams?.get('certNo') || '';
  const depthVal = diamond.depth || diamond.depthPer || diamond.depth_percent || searchParams?.get('diamondDepth') || searchParams?.get('depth') || '';
  const tableVal = diamond.table || diamond.tablePer || diamond.table_percent || searchParams?.get('diamondTable') || searchParams?.get('table') || '';

  // Format title
  const titleParts = [labName, caratVal ? `${caratVal} Carat` : '', colorName, clarityName, shapeName, 'Diamond'].filter(Boolean);
  const diamondTitle = titleParts.join(' ');

  // Build references for step progress bar
  const settingId = searchParams ? searchParams.get('settingId') : null;
  const settingName = searchParams ? searchParams.get('settingName') : null;
  const settingPrice = searchParams ? searchParams.get('settingPrice') : null;
  const settingImage = searchParams ? searchParams.get('settingImage') : null;

  const selectedSettingVal = settingId
    ? {
      name: settingName || 'Selected Setting',
      price: settingPrice ? parseFloat(settingPrice) : undefined,
      image: settingImage || '',
    }
    : null;

  const handleChooseDiamond = () => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');

    // Set builder parameters
    params.set('diamondId', diamond._id || diamond.id || diamond.stockId || '');
    params.set('diamondTitle', diamondTitle);
    params.set('diamondPrice', displayPrice.toString());
    params.set('diamondImage', shapeName);
    params.set('diamondShape', shapeName);
    params.set('diamondCarat', caratVal);
    params.set('diamondColor', colorName);
    params.set('diamondClarity', clarityName);
    params.set('diamondCut', cutName);
    params.set('diamondPolish', polishName);
    params.set('diamondSymmetry', symmetryName);
    params.set('diamondFluorescence', fluorescenceName);
    params.set('diamondLab', labName);
    params.set('diamondStockId', stockIdVal);
    params.set('builderStep', '3');
    params.set('mode', 'builder');

    // Direct redirect to /complete page
    router.push(`/complete?${params.toString()}`);
  };

  const handleAddToCart = () => {
    addToCart({
      id: itemId,
      _id: itemId,
      stockId: stockIdVal || itemId,
      sku: stockIdVal || itemId,
      title: diamondTitle,
      price: displayPrice,
      image: getShapeImageUrl(shapeName),
      shape: shapeName,
      carat: caratVal,
      color: colorName,
      clarity: clarityName,
      cut: cutName,
      polish: polishName,
      symmetry: symmetryName,
      fluorescence: fluorescenceName,
      lab: labName,
      certNo: certNoVal,
      depth: depthVal,
      table: tableVal,
      origin: diamond?.origin || 'Natural',
      isDiamond: true,
      quantity: 1,
      qty: 1,
    });
    toast.success('Diamond added to cart successfully!');
  };

  const itemId = diamond?._id || diamond?.id || diamond?.stockId || id;
  const isInWishlist = wishlist?.some((wItem: any) => (wItem._id || wItem.id) === itemId);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist) {
        await removeFromWishlist(itemId);
        toast.success('Diamond removed from wishlist');
      } else {
        await addToWishlist({
          id: itemId,
          _id: itemId,
          stockId: stockIdVal || itemId,
          title: diamondTitle,
          price: displayPrice,
          image: getShapeImageUrl(shapeName),
          shape: shapeName,
          carat: caratVal,
          color: colorName,
          clarity: clarityName,
          cut: cutName,
          polish: polishName,
          symmetry: symmetryName,
          fluorescence: fluorescenceName,
          lab: labName,
          certNo: certNoVal,
          depth: depthVal,
          table: tableVal,
          origin: diamond?.origin || 'Natural',
          isDiamond: true,
        });
        toast.success('Diamond added to wishlist');
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const specsSubtitle = [colorName ? `${colorName} COLOR` : '', clarityName ? `${clarityName} CLARITY` : '', cutName ? `${cutName} CUT` : ''].filter(Boolean).join(' • ');

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1E1E1E] font-sans pb-16">
      {/* Ring Builder Progress Bar */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4">
        <RingBuilderStepBar
          currentStep={2}
          selectedSetting={selectedSettingVal}
          selectedDiamond={null}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Side: Media Gallery & Certificate */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="aspect-square w-full relative bg-white border border-[#ECECEC] flex items-center justify-center p-12 transition-all">
            {diamond?.creation && (
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest bg-[#1E1E1E] text-white px-3 py-1.5 shadow-xs">
                  {diamond.creation}
                </span>
              </div>
            )}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={getShapeImageUrl(shapeName)}
                alt={diamondTitle || 'Diamond'}
                fill
                priority
                unoptimized
                className="object-contain p-4 transition-transform duration-500 hover:scale-102"
              />
            </div>
          </div>

          {/* Certificate Download Section */}
          {certNoVal && (
            <div className="bg-white border border-[#ECECEC] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FBF9F6] border border-[#ECECEC] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#A96D56]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#1E1E1E]">
                    {labName ? `${labName} ` : ''}Grading Report
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Report Number: {certNoVal}
                  </p>
                </div>
              </div>
              {diamond?.certLink ? (
                <a
                  href={diamond.certLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-[#1E1E1E] hover:bg-[#1E1E1E] hover:text-white text-[11px] font-sans font-bold uppercase tracking-widest text-center transition-all duration-300 cursor-pointer"
                >
                  View Certificate PDF
                </a>
              ) : (
                <span className="text-[11px] font-sans font-semibold text-stone-400 uppercase tracking-widest">
                  Official Verification
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Actions */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Main Title & Specs with Wishlist button */}
          <div className="border-b border-[#ECECEC] pb-6 mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-medium leading-[1.2] text-[#1E1E1E] mb-2">
                {diamondTitle || 'Diamond'}
              </h1>
              {specsSubtitle && (
                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-[#A96D56]">
                  {specsSubtitle}
                </p>
              )}
            </div>
            <button
              onClick={handleWishlistToggle}
              className="p-3 border border-[#ECECEC] bg-white hover:border-[#1E1E1E] transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isInWishlist ? 'fill-[#A96D56] text-[#A96D56]' : 'fill-transparent text-[#1E1E1E] hover:text-[#A96D56]'}`}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <span className="text-2xl md:text-3xl font-bold text-[#A96D56]">
              {formatPrice(displayPrice)}
            </span>
            <p className="text-[11px] text-stone-500 mt-1 font-sans">
              Prices are inclusive of all taxes. Free secure shipping worldwide.
            </p>
          </div>

          {/* Call-to-Actions (CTAs) */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleChooseDiamond}
              className="flex-1 py-3.5 bg-[#1E1E1E] hover:bg-[#A96D56] text-white text-[12px] font-sans font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-xs border-0"
            >
              Choose This Diamond
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 bg-transparent border border-[#1E1E1E] hover:bg-stone-50 text-[#1E1E1E] text-[12px] font-sans font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
            >
              Add To Cart
            </button>
          </div>

          {/* Specifications and Details Accordion */}
          <div className="space-y-0 border-t border-[#E5E5E5]">
            {/* Accordion 1: Diamond Details */}
            <div className="border-b border-[#E5E5E5] py-4">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between text-left font-serif text-sm font-normal text-[#1E1E1E] cursor-pointer bg-transparent border-0 outline-none p-0"
              >
                <span>Diamond Details</span>
                <span className="text-stone-600 text-lg font-light leading-none">{detailsOpen ? '−' : '+'}</span>
              </button>

              {detailsOpen && (
                <div className="mt-3 divide-y divide-[#F2F2F2] text-xs text-[#1E1E1E] font-sans">
                  {shapeName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Shape</span>
                      <span className="font-medium text-[#1E1E1E]">{shapeName}</span>
                    </div>
                  )}
                  {caratVal && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Carat</span>
                      <span className="font-medium text-[#1E1E1E]">{caratVal}</span>
                    </div>
                  )}
                  {colorName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Color</span>
                      <span className="font-medium text-[#1E1E1E]">{colorName}</span>
                    </div>
                  )}
                  {clarityName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Clarity</span>
                      <span className="font-medium text-[#1E1E1E]">{clarityName}</span>
                    </div>
                  )}
                  {cutName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Cut</span>
                      <span className="font-medium text-[#1E1E1E]">{cutName}</span>
                    </div>
                  )}
                  {polishName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Polish</span>
                      <span className="font-medium text-[#1E1E1E]">{polishName}</span>
                    </div>
                  )}
                  {symmetryName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Symmetry</span>
                      <span className="font-medium text-[#1E1E1E]">{symmetryName}</span>
                    </div>
                  )}
                  {fluorescenceName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Fluorescence</span>
                      <span className="font-medium text-[#1E1E1E]">{fluorescenceName}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: Additional Detail */}
            <div className="border-b border-[#E5E5E5] py-4">
              <button
                onClick={() => setAdditionalOpen(!additionalOpen)}
                className="w-full flex items-center justify-between text-left font-serif text-sm font-normal text-[#1E1E1E] cursor-pointer bg-transparent border-0 outline-none p-0"
              >
                <span>Additional Detail</span>
                <span className="text-stone-600 text-lg font-light leading-none">{additionalOpen ? '−' : '+'}</span>
              </button>

              {additionalOpen && (
                <div className="mt-3 divide-y divide-[#F2F2F2] text-xs text-[#1E1E1E] font-sans">
                  {stockIdVal && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Stock Number</span>
                      <span className="font-medium text-[#1E1E1E]">{stockIdVal}</span>
                    </div>
                  )}
                  {certNoVal && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Certificate Number</span>
                      {diamond?.certLink ? (
                        <a
                          href={diamond.certLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#73A5C6] flex items-center gap-1 hover:underline"
                        >
                          {certNoVal}
                          <span className="text-[10px]">↗</span>
                        </a>
                      ) : (
                        <span className="font-medium text-[#1E1E1E]">{certNoVal}</span>
                      )}
                    </div>
                  )}
                  {labName && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Certifying Lab</span>
                      <span className="font-medium text-[#1E1E1E]">{labName}</span>
                    </div>
                  )}
                  {diamond?.sizeMM && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Measurement</span>
                      <span className="font-medium text-[#1E1E1E]">{diamond.sizeMM}</span>
                    </div>
                  )}
                  {diamond?.creation && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Creation</span>
                      <span className="font-medium text-[#1E1E1E]">{diamond.creation}</span>
                    </div>
                  )}
                  {(diamond?.country || diamond?.gemstoneOrigin) && (
                    <div className="flex justify-between py-2.5">
                      <span className="text-stone-500">Origin</span>
                      <span className="font-medium text-[#1E1E1E]">{diamond.country || diamond.gemstoneOrigin}</span>
                    </div>
                  )}
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

export default function DiamondDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="text-center">
            <h2 className="text-xl font-serif text-stone-800 mb-2">Loading...</h2>
          </div>
        </div>
      }
    >
      <DiamondDetailContent />
    </Suspense>
  );
}
