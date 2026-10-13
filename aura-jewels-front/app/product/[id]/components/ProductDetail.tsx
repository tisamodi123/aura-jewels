'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, Tag, Share2, BadgeCheck } from 'lucide-react';
import { handleShareProduct } from '@/lib/utils';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import RingBuilderStepBar from '@/app/[category]/_components/jewelryList/RingBuilderStepBar';
import { STATUS_CODE } from '@/lib/constants';
import { toast } from 'sonner';
import { Product } from '@/types';
import { getCart, getWishlist } from '@/lib/commonApi';
import { getProductDetails, getRecommendations } from '@/services/productService';
import { errorMsg, successMsg } from '@/lib/toast';
import { addToCart as addToCartApi } from '@/services/cartService';
import { useGlobleStore } from '@/store/globleStore';
import { formatPrice, getOfferDiscountLabel } from '@/lib/priceUtils';
import { getToken, getCartCookie, setCartCookie } from '@/services/clientCookies';
import { isIndiaCountry, withTax } from '@/lib/taxUtils';
import M from '@/lib/messages';
import ShopBySegment from '@/components/home/ShopBySegment';
import { OurServices } from '@/components/home/OurServices';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { NearbyStore } from '@/components/home/NearbyStore';
import ProductMediaModal from '@/components/product/ProductMediaModal';
import OrderInquiryModal from '@/components/product/OrderInquiryModal';
import { isSameWishlistLine, sameSelection, lineKey } from '@/lib/lineIdentity';

import ProductGallery from './ProductGallery';
import { trackViewContent, trackAddToCart, trackAddToWishlist } from '@/services/trackingService';
import ProductCustomizer from './ProductCustomizer';
import ProductSidebar from './ProductSidebar';
import ProductRecommendations from './ProductRecommendations';
import ProductPromises from './ProductPromises';
import CustomerReviews from '@/components/product/CustomerReviews';

const getProductColor = (p: any): string => {
    return p?.metalTypeDetail?.metalName || p?.metalTypeDetail?.paraMtrName || p?.metal_type?.paraname || p?.metalTypeName || '';
};

const getProductStamp = (p: any): string => {
    return p?.metalStampDetail?.karat || p?.metalStempDetail?.paraMtrName || p?.metal_stamp?.paraname || p?.metalStempName || '';
};

const getProductShape = (p: any): string => {
    const vCenterStones = p?.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
    if (vCenterStones.length > 0) {
        return vCenterStones.map((s: any) => s.shape?.trim()).filter(Boolean).join(' / ');
    }
    return p?.shape?.trim() || '';
};

const getProductCarat = (p: any): string => {
    const vCenterStones = p?.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
    if (vCenterStones.length > 0) {
        return vCenterStones.map((s: any) => Number(s.totalCarat || s.weight || 0).toFixed(3)).join(' / ');
    }
    return p?.totalCarat ? Number(p.totalCarat).toFixed(3) : '';
};

// Make a selected family member (a different carat / metal / colour / shape) the
// active product. The variant is AUTHORITATIVE for its own price, stones and
// identity — we must NOT inherit the previous product's price or stoneDetails,
// or the headline price stays on the old carat while the stone breakup shows the
// new one (the exact "price doesn't change on carat select" bug). Only the
// descriptive parent-level fields the variant projection omits (variants[],
// stoneSelector, faqs, …) are kept from `base`.
const mergeVariant = (base: any, variant: any): any => {
    if (!variant) return base;
    const merged = { ...base, ...variant };
    // The variant's own stones win; fall back to the parent only if the variant
    // carries none (should not happen for diamond pieces, but stays safe).
    merged.stoneDetails = (Array.isArray(variant.stoneDetails) && variant.stoneDetails.length > 0)
        ? variant.stoneDetails
        : base?.stoneDetails;
    // Preserve the family list so every selector keeps all its options post-switch
    // (variant docs don't carry a nested `variants` array).
    merged.variants = base?.variants || variant?.variants || [];
    return merged;
};

interface ProductDetailProps {
    data: any;
    initialRingsize?: string;
    initialActiveId?: string;
    initialDiamondOrigin?: string;
    initialStoneQuality?: string;
}

export default function ProductDetail({
    data: rawData,
    initialRingsize,
    initialActiveId,
    initialDiamondOrigin,
    initialStoneQuality
}: ProductDetailProps) {

    // console.log("data --------->", rawData)

    const params = useParams();
    const router = useRouter();
    const { wishlist, cart, country, addToWishlist, removeFromWishlist } = useGlobleStore();
    const id = initialActiveId || (params?.id as string) || rawData?.slug || '';
    const [mounted, setMounted] = useState(false);
    const [shopBySegmentData, setShopBySegmentData] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch ShopBySegment data from home CMS
    useEffect(() => {
        callApi(ENDPOINTS?.HOME?.GET_HOME_SCREEN_DATA, 'GET')
            .then((res: any) => {
                const seg = res?.data?.sections?.shopBySegment;
                if (seg) {
                    setShopBySegmentData({
                        info: {
                            title: seg?.content?.heading || seg?.title || 'Discover More Stunning Jewellery Pieces',
                            description: seg?.content?.subText || 'MORE TO EXPLORE',
                            status: 'ACTIVE'
                        },
                        items: (seg?.content?.items || []).map((item: any) => ({
                            ...item,
                            buttonlink1: item.redirect?.href || item.redirect?.url || '',
                            buttontext1: item.ctaText || ''
                        }))
                    });
                }
            })
            .catch(() => { /* silent fail */ });
    }, []);

    const rawVariants = rawData?.variants || [];
    const rawAllVariants = rawData ? [rawData, ...rawVariants].reduce((acc: any[], current: any) => {
        const uniqueId = current._id || current.id || current.slug;
        if (uniqueId && !acc.some(item => (item._id || item.id || item.slug) === uniqueId)) {
            acc.push(current);
        }
        return acc;
    }, []) : [];

    const initialVariant = rawData ? (() => {
        const found = rawAllVariants.find((v: any) =>
            v.slug === id ||
            v.itemCode === id ||
            v._id === id
        );
        return found ? { ...rawData, ...found } : rawData;
    })() : null;

    const [product, setProduct] = useState<any | null>(initialVariant);
    const [currentParent, setCurrentParent] = useState<any>(rawData);

    const variants = product?.variants || [];
    const allVariants = product ? [product, ...variants].reduce((acc: any[], current: any) => {
        const uniqueId = current._id || current.id || current.slug;
        if (uniqueId && !acc.some(item => (item._id || item.id || item.slug) === uniqueId)) {
            acc.push(current);
        }
        return acc;
    }, []) : [];
    const initialSlugRef = useRef<string>('');

    const [zoomStyle, setZoomStyle] = useState<any>({});
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isSideModalOpen, setIsSideModalOpen] = useState(false);
    const [modalImg, setModalImg] = useState<string | null>(null);
    const [modalMediaType, setModalMediaType] = useState<'image' | 'video'>('image');
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    // Pre-calculate initial configurations to avoid mount-time state changes and duplicate API requests
    const initialCenterStone = initialVariant?.stoneDetails?.find((s: any) => s.type?.toLowerCase() === 'center');
    // Must mirror the API's `defaultOrigin` (product.services.js: applyCustomStoneOverrides).
    // The API reads ONLY stoneGroup.type and treats anything that is not "natural"
    // as lab grown. Deriving it any other way here — in particular defaulting to
    // 'Natural' when stoneGroup is absent — makes the client send an origin the
    // server considers a deliberate override, which it then fails to price.
    const initialOrigin = (() => {
        if (initialDiamondOrigin) {
            const lowerOrigin = initialDiamondOrigin.toLowerCase();
            if (lowerOrigin === 'natural') return 'Natural';
            if (lowerOrigin === 'lab grown' || lowerOrigin === 'labgrown' || lowerOrigin === 'lab_grown') return 'Lab Grown';
        }
        return (initialCenterStone?.stoneGroup?.type || '').toLowerCase() === 'natural'
            ? 'Natural'
            : 'Lab Grown';
    })();
    const initialColor = (() => {
        if (initialStoneQuality && initialStoneQuality.includes('/')) {
            return initialStoneQuality.split('/')[0].toUpperCase();
        }
        return initialCenterStone?.color || '';
    })();
    const initialClarity = (() => {
        if (initialStoneQuality && initialStoneQuality.includes('/')) {
            return initialStoneQuality.split('/')[1].toUpperCase();
        }
        return initialCenterStone?.clarity || '';
    })();

    const initialSize = (() => {
        const availableSizes = initialVariant?.sizes || [];
        if (availableSizes.length > 0) {
            let defaultSize = null;
            if (initialRingsize) {
                defaultSize = availableSizes.find((sz: any) =>
                    sz._id === initialRingsize ||
                    sz.name?.toString().trim().toLowerCase() === initialRingsize.toString().trim().toLowerCase() ||
                    sz.code?.toString().trim().toLowerCase() === initialRingsize.toString().trim().toLowerCase()
                );
            }
            if (!defaultSize) {
                defaultSize = availableSizes.find((sz: any) => sz.isDefault);
            }
            if (!defaultSize) {
                defaultSize = availableSizes[0];
            }
            return defaultSize?._id || '';
        }
        return '';
    })();

    const [selectedSize, setSelectedSize] = useState<string>(initialSize);
    const [selectedDiamondOrigin, setSelectedDiamondOrigin] = useState<string>(initialOrigin);
    const [selectedDiamondColor, setSelectedDiamondColor] = useState<string>(initialColor);
    const [selectedClarity, setSelectedClarity] = useState<string>(initialClarity);
    const [engravingEnabled, setEngravingEnabled] = useState(false);
    const [engravingText, setEngravingText] = useState('');

    // Ref to track last API fetch parameters and prevent duplicate calls or infinite loops
    const lastFetchedParamsRef = useRef({
        size: initialSize,
        color: initialColor,
        clarity: initialClarity,
        origin: initialOrigin
    });

    // Monotonic id for the price re-fetch. Exactly one request "owns" the loading
    // flag at a time; a superseded request must neither clear it nor write stale
    // data. The previous per-effect `isCurrent` boolean could leave the flag stuck
    // on: if the user changed a selection and changed it straight back, the
    // in-flight request was invalidated (so its `finally` skipped the reset) while
    // the new effect run short-circuited on the unchanged-params check and never
    // set it false — leaving the page on a skeleton forever.
    const priceRequestIdRef = useRef(0);

    const [isPriceLoading, setIsPriceLoading] = useState(false);

    // Derived product and parent selection references
    const activeProd = product || rawData;
    const selectedColor = activeProd ? getProductColor(activeProd) : '';
    const selectedMetal = activeProd ? getProductStamp(activeProd) : '';
    const selectedShape = activeProd ? getProductShape(activeProd) : '';
    const selectedCarat = activeProd ? getProductCarat(activeProd) : '';

    // --- Ring Builder Mode logic ---
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const isDiamondProduct =
        rawData?.categoryDetails?.categoryName?.toLowerCase() === 'diamonds' ||
        rawData?.categoryDetails?.slug?.toLowerCase() === 'diamonds' ||
        rawData?.subCategoryDetails?.some((s: any) =>
            s.slug?.toLowerCase()?.includes('diamond') ||
            s.categoryName?.toLowerCase()?.includes('diamond')
        ) ||
        false;

    const isRingBuilderMode =
        (searchParams?.get('builder') === 'setting' ||
        searchParams?.get('startWith') === 'setting' ||
        searchParams?.get('mode') === 'builder' ||
        searchParams?.get('design') === 'setting' ||
        searchParams?.get('builderStep') != null ||
        pathname?.includes('start-with-a-setting') ||
        pathname?.includes('build-your-own-ring')) &&
        !(searchParams?.get('builderStep') === '2' && !isDiamondProduct);

    const settingId = searchParams?.get('settingId');
    const diamondId = searchParams?.get('diamondId');

    const hasOtherItem = isDiamondProduct ? !!settingId : !!diamondId;
    const currentStepValue = hasOtherItem ? 2 : 1;

    // Get selected setting from URL or current product
    const selectedSettingVal = (() => {
        if (!isDiamondProduct) {
            const activeProductForDetails = product || rawData;
            const imageSrc = activeProductForDetails?.images && activeProductForDetails.images.length > 0
                ? (activeProductForDetails.images[0].MediaLocation || activeProductForDetails.images[0].url || "")
                : "";
            return {
                name: activeProductForDetails?.productTitle || activeProductForDetails?.title || activeProductForDetails?.name || '',
                price: activeProductForDetails?.finalPrice || 0,
                image: imageSrc,
            };
        }
        const name = searchParams?.get('settingName');
        const priceVal = searchParams?.get('settingPrice');
        const image = searchParams?.get('settingImage');
        if (name || priceVal || image) {
            return {
                name: name || undefined,
                price: priceVal ? parseFloat(priceVal) : undefined,
                image: image || undefined,
            };
        }
        return null;
    })();

    // Get selected diamond from URL or current product
    const selectedDiamondVal = (() => {
        if (isDiamondProduct) {
            const activeProductForDetails = product || rawData;
            const imageSrc = activeProductForDetails?.images && activeProductForDetails.images.length > 0
                ? (activeProductForDetails.images[0].MediaLocation || activeProductForDetails.images[0].url || "")
                : "";
            return {
                title: activeProductForDetails?.productTitle || activeProductForDetails?.title || activeProductForDetails?.name || '',
                price: activeProductForDetails?.finalPrice || 0,
                image: imageSrc,
            };
        }
        const title = searchParams?.get('diamondTitle');
        const priceVal = searchParams?.get('diamondPrice');
        const image = searchParams?.get('diamondImage');
        if (title || priceVal || image) {
            return {
                title: title || undefined,
                price: priceVal ? parseFloat(priceVal) : undefined,
                image: image || undefined,
            };
        }
        return null;
    })();

    const handleChooseSetting = () => {
        const activeProductForDetails = product || rawData;
        const imageSrc = activeProductForDetails?.images && activeProductForDetails.images.length > 0
            ? (activeProductForDetails.images[0].MediaLocation || activeProductForDetails.images[0].url || "")
            : "";
        const query = new URLSearchParams(searchParams?.toString() || '');
        query.set('mode', 'builder');
        query.set('builderStep', '2');
        query.set('settingId', activeProductForDetails?._id || activeProductForDetails?.id || '');
        query.set('settingSku', activeProductForDetails?.itemCode || activeProductForDetails?.sku || '');
        query.set('settingName', activeProductForDetails?.productTitle || activeProductForDetails?.title || '');
        query.set('settingPrice', (activeProductForDetails?.finalPrice || 0).toString());
        query.set('settingImage', imageSrc);
        if (selectedSize) query.set('ringsize', selectedSize);
        if (selectedMetal) query.set('metal', selectedMetal);
        if (selectedColor) query.set('color', selectedColor);

        router.push(`/diamonds?${query.toString()}`);
    };

    const handleChooseDiamond = () => {
        const activeProductForDetails = product || rawData;
        const imageSrc = activeProductForDetails?.images && activeProductForDetails.images.length > 0
            ? (activeProductForDetails.images[0].MediaLocation || activeProductForDetails.images[0].url || "")
            : "";
        const query = new URLSearchParams(searchParams?.toString() || '');
        query.set('mode', 'builder');
        query.set('builderStep', '2');
        query.set('diamondId', activeProductForDetails?._id || activeProductForDetails?.id || '');
        query.set('diamondSku', activeProductForDetails?.itemCode || activeProductForDetails?.sku || '');
        query.set('diamondTitle', activeProductForDetails?.productTitle || activeProductForDetails?.title || '');
        query.set('diamondPrice', (activeProductForDetails?.finalPrice || 0).toString());
        query.set('diamondImage', imageSrc);

        router.push(`/rings?${query.toString()}`);
    };

    const handleCompleteRing = async () => {
        if (isPriceLoading) return;
        const token = getToken();
        const activeProductForDetails = product || rawData;

        // Retrieve setting info
        const settingIdVal = isDiamondProduct ? searchParams?.get('settingId') : (activeProductForDetails?._id || activeProductForDetails?.id);
        const settingSkuVal = isDiamondProduct ? searchParams?.get('settingSku') : (activeProductForDetails?.itemCode || activeProductForDetails?.sku);
        const settingSizeVal = isDiamondProduct ? searchParams?.get('ringsize') : selectedSize;
        const settingMetalVal = isDiamondProduct ? searchParams?.get('metal') : selectedMetal;
        const settingColorVal = isDiamondProduct ? searchParams?.get('color') : selectedColor;

        // Retrieve diamond info
        const diamondIdVal = isDiamondProduct ? (activeProductForDetails?._id || activeProductForDetails?.id) : searchParams?.get('diamondId');
        const diamondSkuVal = isDiamondProduct ? (activeProductForDetails?.itemCode || activeProductForDetails?.sku) : searchParams?.get('diamondSku');

        try {
            if (!token) {
                // Guest cart
                const guestCart = getCartCookie();

                // Add setting
                if (settingSkuVal) {
                    const settingLine = {
                        sku: settingSkuVal,
                        sizeId: settingSizeVal || null,
                        qty: 1,
                        engraving: !isDiamondProduct && engravingEnabled ? 1 : 0,
                        engravingText: !isDiamondProduct && engravingEnabled ? engravingText : '',
                        origin: null,
                        color: null,
                        clarity: null
                    };
                    const targetS = lineKey(settingLine);
                    const idxS = guestCart.findIndex((g: any) => lineKey(g) === targetS);
                    if (idxS >= 0) {
                        guestCart[idxS].qty = (guestCart[idxS].qty || 1) + 1;
                    } else {
                        guestCart.push(settingLine);
                    }
                }

                // Add diamond
                if (diamondSkuVal) {
                    const diamondLine = {
                        sku: diamondSkuVal,
                        sizeId: isDiamondProduct ? (selectedSize || null) : null,
                        qty: 1,
                        engraving: isDiamondProduct && engravingEnabled ? 1 : 0,
                        engravingText: isDiamondProduct && engravingEnabled ? engravingText : '',
                        origin: isDiamondProduct ? selectedDiamondOrigin : null,
                        color: isDiamondProduct ? selectedDiamondColor : null,
                        clarity: isDiamondProduct ? selectedClarity : null
                    };
                    const targetD = lineKey(diamondLine);
                    const idxD = guestCart.findIndex((g: any) => lineKey(g) === targetD);
                    if (idxD >= 0) {
                        guestCart[idxD].qty = (guestCart[idxD].qty || 1) + 1;
                    } else {
                        guestCart.push(diamondLine);
                    }
                }

                setCartCookie(guestCart);
            } else {
                // Logged in cart
                // Add setting
                if (settingIdVal) {
                    await addToCartApi({
                        jeweleryId: settingIdVal,
                        qty: 1,
                        sizeId: settingSizeVal || undefined,
                        engraving: !isDiamondProduct && engravingEnabled ? 1 : 0,
                        engravingText: !isDiamondProduct && engravingEnabled ? engravingText : '',
                        origin: null,
                        color: null,
                        clarity: null
                    }, token);
                }

                // Add diamond
                if (diamondIdVal) {
                    await addToCartApi({
                        jeweleryId: diamondIdVal,
                        qty: 1,
                        sizeId: isDiamondProduct ? selectedSize : undefined,
                        engraving: isDiamondProduct && engravingEnabled ? 1 : 0,
                        engravingText: isDiamondProduct && engravingEnabled ? engravingText : '',
                        origin: isDiamondProduct ? selectedDiamondOrigin : undefined,
                        color: isDiamondProduct ? selectedDiamondColor : undefined,
                        clarity: isDiamondProduct ? selectedClarity : undefined
                    }, token);
                }
            }

            toast.success('Ring setting and diamond added to cart');
            await fetchCartStatus();
            router.push('/cart');
        } catch (error: any) {
            console.error("Error completing ring:", error);
            toast.error('Failed to add components to cart');
        }
    };

    // Sync from props
    useEffect(() => {
        if (!rawData) return;
        setCurrentParent(rawData);
        const matched = rawAllVariants.find((v: any) =>
            v.slug === id ||
            v.itemCode === id ||
            v._id === id
        );
        const activeProd = matched ? { ...rawData, ...matched } : rawData;
        setProduct(activeProd);
        if (!initialSlugRef.current) {
            initialSlugRef.current = rawData.slug || id;
        }

        // Initialize custom stone selections from the new product center stone
        const centerStone = activeProd.stoneDetails?.find((s: any) => s.type?.toLowerCase() === 'center');
        const defaultOrigin = (() => {
            if (initialDiamondOrigin) {
                const lowerOrigin = initialDiamondOrigin.toLowerCase();
                if (lowerOrigin === 'natural') return 'Natural';
                if (lowerOrigin === 'lab grown' || lowerOrigin === 'labgrown' || lowerOrigin === 'lab_grown') return 'Lab Grown';
            }
            return centerStone
                ? ((centerStone.stoneGroup?.stoneType?.toLowerCase() === 'diamond' || (centerStone.stoneGroup?.type || '').toLowerCase() === 'lab grown') ? 'Lab Grown' : 'Natural')
                : 'Lab Grown';
        })();
        const defaultColor = (() => {
            if (initialStoneQuality && initialStoneQuality.includes('/')) {
                return initialStoneQuality.split('/')[0].toUpperCase();
            }
            return centerStone?.color || '';
        })();
        const defaultClarity = (() => {
            if (initialStoneQuality && initialStoneQuality.includes('/')) {
                return initialStoneQuality.split('/')[1].toUpperCase();
            }
            return centerStone?.clarity || '';
        })();

        const availableSizes = activeProd.sizes || [];
        let defaultSizeId = '';
        if (availableSizes.length > 0) {
            let defaultSize = null;
            if (initialRingsize) {
                defaultSize = availableSizes.find((sz: any) =>
                    sz._id === initialRingsize ||
                    sz.name?.toString().trim().toLowerCase() === initialRingsize.toString().trim().toLowerCase() ||
                    sz.code?.toString().trim().toLowerCase() === initialRingsize.toString().trim().toLowerCase()
                );
            }
            if (!defaultSize) {
                defaultSize = availableSizes.find((sz: any) => sz.isDefault);
            }
            if (!defaultSize) {
                defaultSize = availableSizes[0];
            }
            defaultSizeId = defaultSize?._id || '';
        }

        // Update ref first to prevent triggering duplicate price calculations on prop change
        lastFetchedParamsRef.current = {
            size: defaultSizeId,
            color: defaultColor,
            clarity: defaultClarity,
            origin: defaultOrigin
        };

        setSelectedDiamondOrigin(defaultOrigin);
        setSelectedDiamondColor(defaultColor);
        setSelectedClarity(defaultClarity);
        setSelectedSize(defaultSizeId);
    }, [rawData, id, initialRingsize, initialDiamondOrigin, initialStoneQuality]);

    // Initial mount API calls
    useEffect(() => {
        getCart();
        getWishlist();
    }, []);

    const getTrackPrice = (pToUse?: any) => {
        const prod = pToUse || activeProd;
        if (!prod) return 0;
        const prodOffer = prod?.offerDetails;
        const prodHasOffer = !!(prodOffer?.offer?._id);
        const basePrice = prodHasOffer
            ? (prodOffer?.discountedPrice ?? prod?.discountedPrice ?? prod?.finalPrice ?? prod?.price ?? 0)
            : (prod?.finalPrice ?? prod?.price ?? 0);
        const totalPrice = isIndiaCountry(country) ? withTax(basePrice, country) : basePrice;
        return Math.round(totalPrice);
    };

    // Track ViewContent event (fire only ONCE per product page view)
    const trackedProductIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (activeProd) {
            const prodId = activeProd.itemCode || activeProd.sku || activeProd.productCode || activeProd._id || activeProd.id || activeProd.slug;
            if (prodId && trackedProductIdRef.current !== prodId) {
                trackedProductIdRef.current = prodId;
                const totalTrackPrice = getTrackPrice(activeProd);
                const prodCategory = activeProd?.category?.name || activeProd?.categoryName || activeProd?.category || activeProd?.productCategory || undefined;
                // trackViewContent({
                //     id: prodId,
                //     itemCode: activeProd.itemCode,
                //     sku: activeProd.sku,
                //     productCode: activeProd.productCode,
                //     title: activeProd.productTitle || activeProd.title || activeProd.name || "",
                //     price: totalTrackPrice,
                //     finalPrice: totalTrackPrice,
                //     currency: isIndiaCountry(country) ? 'INR' : 'USD',
                //     category: prodCategory
                // });
            }
        }
    }, [activeProd?._id, activeProd?.slug]);

    const productVideoUrl = activeProd ? (() => {
        if (activeProd.videos && Array.isArray(activeProd.videos) && activeProd.videos.length > 0) {
            const mainVideo = activeProd.videos.find((v: any) => v.IsMainMedia) || activeProd.videos[0];
            return mainVideo?.MediaLocation || mainVideo?.url || '';
        }
        return activeProd.video || '';
    })() : '';

    const handleZoomImg = (e: any, imgUrl: string) => {
        if (!imgUrl) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - window.scrollX - left) / width) * 100;
        const y = ((e.pageY - window.scrollY - top) / height) * 100;
        setZoomStyle({
            backgroundImage: `url(${imgUrl})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: `350% auto`,
            width,
            height
        });
    };

    // Automatically default color and clarity when origin changes
    useEffect(() => {
        if (!activeProd || !selectedDiamondOrigin) return;
        const filtered = activeProd.stoneSelector?.filter((opt: any) =>
            opt.origin?.toLowerCase() === selectedDiamondOrigin.toLowerCase()
        ) || [];

        if (filtered.length > 0) {
            // The server marks grades it cannot price for this piece. Never
            // auto-select one — the price would silently stay at the default.
            const selectable = filtered.filter((opt: any) => opt.available !== false);
            const current = filtered.find((opt: any) =>
                opt.color?.toLowerCase() === selectedDiamondColor.toLowerCase() &&
                opt.clarity?.toLowerCase() === selectedClarity.toLowerCase()
            );
            const exists = !!current && current.available !== false;
            if (!exists && selectable.length > 0) {
                setSelectedDiamondColor(selectable[0].color || '');
                setSelectedClarity(selectable[0].clarity || '');
            }
        }
    }, [selectedDiamondOrigin, activeProd]);

    const updateCustomizerUrl = (newSize: string, newOrigin: string, newColor: string, newClarity: string, newSlug?: string) => {
        const slug = newSlug || activeProd?.slug || id;
        if (!slug) return;

        const currentPath = window.location.pathname;
        const basePath = currentPath.split("/product/")[0] || "";

        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

        if (newSize) {
            const sizeObj = ((activeProd as any)?.sizes || []).find((sz: any) => sz._id === newSize);
            const sizeVal = sizeObj?.name || sizeObj?.code || newSize;
            if (sizeVal) {
                params.set("ringsize", sizeVal.toString());
            }
        }

        if (newOrigin) {
            params.set("diamond_origin", newOrigin);
        }

        if (newColor && newClarity) {
            params.set("stone_quality", `${newColor}/${newClarity}`);
        }

        const queryString = params.toString();
        const targetUrl = `${basePath}/product/${slug}${queryString ? `?${queryString}` : ""}`;

        setIsPriceLoading(true);
        router.replace(targetUrl, { scroll: false });
    };

    const handleSetSize = (size: string) => {
        setSelectedSize(size);
        updateCustomizerUrl(size, selectedDiamondOrigin, selectedDiamondColor, selectedClarity);
    };

    const handleSetOrigin = (origin: string) => {
        setSelectedDiamondOrigin(origin);
        
        // Find default color & clarity for the selected origin
        const filtered = activeProd?.stoneSelector?.filter((opt: any) =>
            opt.origin?.toLowerCase() === origin.toLowerCase()
        ) || [];

        let nextColor = selectedDiamondColor;
        let nextClarity = selectedClarity;

        if (filtered.length > 0) {
            const selectable = filtered.filter((opt: any) => opt.available !== false);
            const current = filtered.find((opt: any) =>
                opt.color?.toLowerCase() === selectedDiamondColor.toLowerCase() &&
                opt.clarity?.toLowerCase() === selectedClarity.toLowerCase()
            );
            const exists = !!current && current.available !== false;
            if (!exists && selectable.length > 0) {
                nextColor = selectable[0].color || '';
                nextClarity = selectable[0].clarity || '';
            }
        }

        setSelectedDiamondColor(nextColor);
        setSelectedClarity(nextClarity);
        updateCustomizerUrl(selectedSize, origin, nextColor, nextClarity);
    };

    const handleSetColor = (color: string) => {
        setSelectedDiamondColor(color);
        updateCustomizerUrl(selectedSize, selectedDiamondOrigin, color, selectedClarity);
    };

    const handleSetClarity = (clarity: string) => {
        setSelectedClarity(clarity);
        updateCustomizerUrl(selectedSize, selectedDiamondOrigin, selectedDiamondColor, clarity);
    };

    useEffect(() => {
        setIsPriceLoading(false);
    }, [rawData]);

    if (!activeProd) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
                    <Link href="/all" className="text-blue-600 underline">Return to Shop</Link>
                </div>
            </div>
        );
    }

    const pId = product._id || product.id;
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [recommendationsData, setRecommendationsData] = useState<any>(null);

    useEffect(() => {
        if (!pId) return;
        const fetchRecs = async () => {
            try {
                const res = await getRecommendations(pId);
                if (res && res.data) {
                    // console.log("get Recom", res.data);
                    setRecommendationsData(res.data);
                }
            } catch (error) {
                console.log("Error fetching product recommendations:", error);
            }
        };
        fetchRecs();
    }, [pId]);

    const recList = recommendationsData
        ? (Array.isArray(recommendationsData) ? recommendationsData : (recommendationsData.youMayAlsoLike || recommendationsData.similarProducts || []))
        : [];
    const combineWithList = recommendationsData?.combineWithProducts || [];

    // A stored selection means "an override of the product's default grade".
    // When the customer has changed nothing, we store nulls — otherwise the
    // detail page (which always carries an origin) and a listing card (which
    // carries none) would create two lines for the same design.
    const lineSelection = (() => {
        // MUST come from `defaultStoneSelection`, which the server snapshots
        // before it applies an override. Reading it back off `stoneDetails` is
        // wrong: once a grade is applied the server stamps it onto the stones,
        // so the "default" would always equal the selection, collapse to null,
        // and the line would be stored — and priced — at the product default.
        const none = { origin: null, color: null, clarity: null };
        const defaults = activeProd?.defaultStoneSelection ?? none;

        // No varyable centre diamond (no centre stone, or a colour stone): the
        // page still carries a default origin, but storing it would create a
        // "selection" the server cannot honour.
        if (!defaults.color && !defaults.clarity) return none;

        const current = { origin: selectedDiamondOrigin, color: selectedDiamondColor, clarity: selectedClarity };
        return sameSelection(current, defaults) ? none : current;
    })();

    // The heart reflects THIS variant, not "any line for this product". Keying it
    // on the product id alone meant that after wishlisting the Natural version
    // and switching to Lab Grown, the heart stayed lit — and clicking it deleted
    // the Natural entry instead of adding the Lab Grown one.
    const currentWishlistLine = wishlist.find((item: any) =>
        isSameWishlistLine(item, {
            id: pId,
            _id: pId,
            jeweleryId: pId,
            jewelleryId: pId,
            slug: activeProd?.slug || id,
            sku: activeProd?.sku || activeProd?.itemCode,
            ...lineSelection,
            sizeId: selectedSize,
        })
    );

    const currentCartLine = cart?.find((item: any) => {
        const sameProduct = [item.id, item._id, item.jeweleryId, item.jewelleryId, item.sku]
            .some((v) => v && String(v).toLowerCase() === String(product?.itemCode || product?.sku || product?._id || '').toLowerCase());
        const sameSize = String(item.sizeId || '') === String(selectedSize || '');
        const current = { origin: selectedDiamondOrigin, color: selectedDiamondColor, clarity: selectedClarity };
        return sameProduct && sameSize && sameSelection(item, current);
    });
    const isInCart = !!currentCartLine;

    // console.log("currentWishlistLine ------->", currentWishlistLine)

    useEffect(() => {
        setIsWishlisted(!!currentWishlistLine);
    }, [currentWishlistLine]);

    const getKaratValue = (k: string) => {
        const num = parseInt(k);
        return isNaN(num) ? 0 : num;
    };

    const isKaratEqual = (a: any, b: any) => {
        if (a === b) return true;
        if (!a || !b) return false;
        return a.toString().trim().toLowerCase() === b.toString().trim().toLowerCase();
    };

    const isColorEqual = (a: any, b: any) => {
        if (!a || !b) return false;
        const nameA = typeof a === 'object' ? a.metalName : a;
        const nameB = typeof b === 'object' ? b.metalName : b;
        return (nameA || '').toString().trim().toLowerCase() === (nameB || '').toString().trim().toLowerCase();
    };

    const getUniqueBy = <T,>(
        arr: T[],
        getKey: (item: T) => string | undefined
    ): T[] => {
        const map = new Map<string, T>();
        arr.forEach((item) => {
            const key = getKey(item);
            if (!key) return;
            if (!map.has(key)) {
                map.set(key, item);
            }
        });
        return Array.from(map.values());
    };

    const centerStones = product?.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
    const isCenterDiamond = (cs: any) =>
        cs?.stoneGroup?.stoneType?.toLowerCase() === 'diamond' ||
        cs?.stoneType?.toLowerCase() === 'diamond' ||
        (!cs?.stoneGroup?.stoneType && cs?.type?.toLowerCase() !== 'gem' && cs?.type?.toLowerCase() !== 'colorstone');
    const isSingleCenterDiamond = centerStones.length === 1 && isCenterDiamond(centerStones[0]);
    // Quality/origin is selectable when EVERY centre stone is a diamond — ONE or
    // MORE. Mirrors the backend gate (which builds the selector and reprices all
    // centre + side stones for the chosen grade). Without this, a multi-centre
    // ring built the selector server-side but the UI hid it.
    const centerDiamondsSelectable =
        centerStones.length >= 1 && centerStones.every(isCenterDiamond);

    const hasCenterDiamond = isSingleCenterDiamond && allVariants.some(v =>
        v.shape || v.stoneDetails?.some((s: any) => s.type?.toLowerCase() === 'center')
    );

    const uniqueColors = getUniqueBy(
        allVariants,
        (v: any) => v.metalTypeDetail?.metalName?.trim().toLowerCase()
    ).map((v: any) => v.metalTypeDetail)
        .filter(Boolean)
        .sort((a: any, b: any) => (a.metalName || '').localeCompare(b.metalName || ''));
    const availableMetalColors = uniqueColors.map((c: any) => c.metalName);

    const uniqueKarats = getUniqueBy(
        allVariants.filter((v: any) => isColorEqual(v.metalTypeDetail, product.metalTypeDetail)),
        (v: any) => v.metalStampDetail?.karat?.trim().toLowerCase()
    ).map((v: any) => v.metalStampDetail?.karat)
        .filter(Boolean)
        .sort((a: any, b: any) => getKaratValue(a) - getKaratValue(b));
    const availableMetalStamps = uniqueKarats;

    const handleAttributeSelect = (type: string, value: any) => {
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

        const currentShape = getCombinedShape(product);
        const isTogglingOff = type === 'shape' && currentShape.toLowerCase() === value.toLowerCase();

        const candidates = allVariants.filter((v: any) => {
            if (type === 'karat') return isKaratEqual(v.metalStampDetail?.karat, value);
            if (type === 'color') return isColorEqual(v.metalTypeDetail, value);
            if (type === 'shape') {
                if (isTogglingOff) {
                    const vCenterStones = v.stoneDetails?.filter((s: any) => s.type?.toLowerCase() === 'center') || [];
                    return vCenterStones.length === 0 && !v.shape;
                }
                return getCombinedShape(v).toLowerCase() === value.toLowerCase();
            }
            if (type === 'carat') return getCombinedCarat(v) === value;
            if (type === 'quality') return getCombinedQuality(v).toLowerCase() === value.toLowerCase();
            return false;
        });

        if (candidates.length === 0) return;

        let bestCandidate = candidates[0];
        let maxScore = -1;

        candidates.forEach((v: any) => {
            let score = 0;
            if (isKaratEqual(v.metalStampDetail?.karat, product.metalStampDetail?.karat)) score++;
            if (isColorEqual(v.metalTypeDetail, product.metalTypeDetail)) score++;
            if (!isTogglingOff && getCombinedShape(v).toLowerCase() === getCombinedShape(product).toLowerCase()) score++;
            if (getCombinedCarat(v) === getCombinedCarat(product)) score++;
            if (getCombinedQuality(v).toLowerCase() === getCombinedQuality(product).toLowerCase()) score++;

            if (score > maxScore) {
                maxScore = score;
                bestCandidate = v;
            }
        });

        if (bestCandidate) {
            const mergedProduct = mergeVariant(currentParent, bestCandidate);

            // Sync custom selectors with the new variant's center stone properties
            const centerStone = mergedProduct.stoneDetails?.find((s: any) => s.type?.toLowerCase() === 'center');
            let defaultOrigin = selectedDiamondOrigin;
            let defaultColor = selectedDiamondColor;
            let defaultClarity = selectedClarity;

            if (centerStone) {
                defaultOrigin = (centerStone.stoneGroup?.stoneType?.toLowerCase() === 'diamond' || (centerStone.stoneGroup?.type || '').toLowerCase() === 'lab grown') ? 'Lab Grown' : 'Natural';
                defaultColor = centerStone.color || '';
                defaultClarity = centerStone.clarity || '';

                setSelectedDiamondOrigin(defaultOrigin);
                setSelectedDiamondColor(defaultColor);
                setSelectedClarity(defaultClarity);
            }

            setProduct(mergedProduct);

            // Trigger SSR update for the new variant slug / itemCode / ID
            const targetSlug = bestCandidate.slug || bestCandidate.itemCode || bestCandidate._id || id;
            updateCustomizerUrl(selectedSize, defaultOrigin, defaultColor, defaultClarity, targetSlug);
        }
    };

    const displayPrice = product?.finalPrice || 0;
    const displayTitle = product?.productTitle || product?.title || product?.name;

    // Offer details derived from the active product
    const offerDetails = activeProd?.offerDetails || null;
    const hasOffer = !!(offerDetails?.offer?._id);
    const targetField = offerDetails?.targetField || 'finalPrice';

    // offerDetails.discountedPrice = finalPrice - discountAmount for ALL targetField cases
    // Always show it as the headline price when an offer applies
    const headerPrice = hasOffer
        ? (offerDetails?.discountedPrice ?? activeProd?.discountedPrice ?? displayPrice)
        : displayPrice;
    const rawMRP = offerDetails?.mrp || offerDetails?.totalOriginalPrice || (offerDetails?.discountAmount ? (headerPrice + offerDetails.discountAmount) : (displayPrice > headerPrice ? displayPrice : null));
    const headerMRP = hasOffer && rawMRP && rawMRP > headerPrice ? rawMRP : null;
    const isZeroOffer = hasOffer && (headerPrice <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= (headerMRP || displayPrice)));
    const offerDiscountLabel = getOfferDiscountLabel(offerDetails);
    const offerName = offerDetails?.offer?.name || null;

    const centerStone = product?.stoneDetails?.find((s: any) => s.type?.toLowerCase() === 'center');

    const fetchCartStatus = async () => {
        getCart();
    };

    const handleAddToCart = async (p?: Product) => {
        if (isInCart) {
            router.push('/cart');
            return;
        }
        const productToUse = p || activeProd;
        if (isPriceLoading) return;
        const token = getToken();
        if (!token) {
            // Guest cart — the cookie stores the SKU + the buyer's selections
            // ONLY. No price, title or image: those are hydrated by
            // /cart/preview, so they can never go stale and a deactivated
            // product disappears immediately. Merged into the account cart on
            // login (before checkout).
            const prod: any = productToUse;
            const sku = String(prod?.itemCode || prod?.sku || prod?.itemcode || '').trim();
            if (!sku) return;

            // The line is SKU + size + centre-stone selection. Matching on SKU +
            // size alone merged the Lab Grown add into the Natural line.
            const newLine = {
                sku,
                sizeId: selectedSize || null,
                qty: 1,
                engraving: engravingEnabled ? 1 : 0,
                engravingText: engravingEnabled ? engravingText : '',
                // Selected center-stone origin/quality — merged + repriced on login.
                ...lineSelection,
            };

            const guestCart = getCartCookie();
            const target = lineKey(newLine);
            const idx = guestCart.findIndex((g: any) => lineKey(g) === target);
            if (idx >= 0) {
                guestCart[idx].qty = (guestCart[idx].qty || 1) + 1;
                if (engravingEnabled) {
                    guestCart[idx].engraving = 1;
                    guestCart[idx].engravingText = engravingText;
                }
            } else {
                guestCart.push(newLine);
            }
            setCartCookie(guestCart);
            successMsg('Product added to cart');
            const totalTrackPrice = getTrackPrice(productToUse);
            const prodCategory = productToUse?.category?.name || productToUse?.categoryName || productToUse?.category || productToUse?.productCategory || undefined;
            // trackAddToCart({
            //     id: productToUse.itemCode || productToUse.sku || productToUse.productCode || productToUse._id || productToUse.id,
            //     itemCode: productToUse.itemCode,
            //     sku: productToUse.sku,
            //     productCode: productToUse.productCode,
            //     title: productToUse.productTitle || productToUse.title || productToUse.name || "",
            //     price: totalTrackPrice,
            //     finalPrice: totalTrackPrice,
            //     qty: 1,
            //     currency: isIndiaCountry(country) ? 'INR' : 'USD',
            //     category: prodCategory
            // });
            await fetchCartStatus();
            router.push('/cart');
            return;
        }
        try {
            const response = await addToCartApi({
                jeweleryId: pId || productToUse?._id || productToUse?.id,
                qty: 1,
                sizeId: selectedSize,
                engraving: engravingEnabled ? 1 : 0,
                engravingText: engravingEnabled ? engravingText : '',
                // Persist the selected center-stone origin/quality so the cart
                // reprices the exact variant shown here (natural vs lab, color/clarity).
                // Nulls when the customer kept the product's default grade, so a
                // default add never forks into a second line.
                ...lineSelection,
            }, token);
            if (response?.errorCode === STATUS_CODE.OK || response?.status === STATUS_CODE.OK) {
                successMsg(response.message || 'Product added to cart');
                const totalTrackPrice = getTrackPrice(productToUse);
                const prodCategory = productToUse?.category?.name || productToUse?.categoryName || productToUse?.category || productToUse?.productCategory || undefined;
                // trackAddToCart({
                //     id: productToUse.itemCode || productToUse.sku || productToUse.productCode || productToUse._id || productToUse.id,
                //     itemCode: productToUse.itemCode,
                //     sku: productToUse.sku,
                //     productCode: productToUse.productCode,
                //     title: productToUse.productTitle || productToUse.title || productToUse.name || "",
                //     price: totalTrackPrice,
                //     finalPrice: totalTrackPrice,
                //     qty: 1,
                //     currency: isIndiaCountry(country) ? 'INR' : 'USD',
                //     category: prodCategory
                // });
                await fetchCartStatus();
                router.push('/cart');
            } else {
                errorMsg(response.message || M.common.somethingWentWrong);
            }
        } catch (error: any) {
            errorMsg(error.message || M.common.somethingWentWrong);
        }
    };

    const handleWishlistToggle = async () => {
        try {
            if (isWishlisted) {
                // Remove exactly the variant the customer is looking at.
                await removeFromWishlist(currentWishlistLine ?? { id: pId || activeProd?._id || activeProd?.id, ...lineSelection, sizeId: selectedSize });
                successMsg('Product removed from wishlist');
            } else {
                await addToWishlist({
                    ...activeProd,
                    id: pId,
                    _id: pId,
                    jeweleryId: pId,
                    jewelleryId: pId,
                    selectedOrigin: lineSelection.origin,
                    selectedColor: lineSelection.color,
                    selectedClarity: lineSelection.clarity,
                    selectedSize: selectedSize,
                });
                successMsg('Product added to wishlist');
                const totalTrackPrice = getTrackPrice(activeProd);
                // trackAddToWishlist({
                //     id: activeProd?._id || activeProd?.id,
                //     title: activeProd?.productTitle || activeProd?.title || activeProd?.name || "",
                //     price: totalTrackPrice,
                //     finalPrice: totalTrackPrice,
                //     currency: isIndiaCountry(country) ? 'INR' : 'USD'
                // });
            }
        } catch (error: any) {
            errorMsg(error.message || M.common.somethingWentWrong);
        }
    };

    const handleOrderInquiryClick = () => {
        const token = getToken();
        if (!token) {
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/sign-in?next=${encodeURIComponent(currentPath)}`);
            return;
        }
        setShowInquiryModal(true);
    };

    return (
        <>
            <div className="bg-white min-h-screen">
                {/* 1. Breadcrumb Navigation */}
                <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-4 md:py-6">
                    <nav className="flex items-center space-x-2 text-[12px] font-bold font-jakarta text-gray-900 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2 md:pb-0">
                        <Link href="/" className="cursor-pointer hover:text-gray-600 flex-shrink-0">Home</Link>
                        <span className="text-gray-400 flex-shrink-0">{'>'}</span>
                        {activeProd?.categoryDetails?.slug ? (
                            <Link href={`/${activeProd.categoryDetails.slug}?view=all`} className="cursor-pointer hover:text-gray-600 flex-shrink-0 capitalize">
                                {activeProd.categoryDetails.categoryName?.toLowerCase()}
                            </Link>
                        ) : (
                            <Link href="/all" className="cursor-pointer hover:text-gray-600 flex-shrink-0">
                                {activeProd?.categoryDetails?.categoryName || 'All'}
                            </Link>
                        )}
                        {activeProd?.subCategoryDetails?.[0] && (
                            <>
                                <span className="text-gray-400 flex-shrink-0">{'>'}</span>
                                <Link
                                    href={`/${activeProd.categoryDetails?.slug || 'all'}/${activeProd.subCategoryDetails[0].slug}`}
                                    className="cursor-pointer hover:text-gray-600 flex-shrink-0 capitalize"
                                >
                                    {activeProd.subCategoryDetails[0].categoryName?.toLowerCase()}
                                </Link>
                            </>
                        )}
                        <span className="text-gray-400 flex-shrink-0">{'>'}</span>
                        <span className="text-gray-900 flex-shrink-0">{activeProd.productTitle || activeProd.title || activeProd.name}</span>
                    </nav>
                </div>

                {isRingBuilderMode && (
                    <RingBuilderStepBar
                        currentStep={currentStepValue as 1 | 2 | 3}
                        selectedSetting={selectedSettingVal}
                        selectedDiamond={selectedDiamondVal}
                    />
                )}

                <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6 lg:items-start">
                    {/* LEFT COLUMN: Gallery (60%) */}
                    <div className="w-full lg:w-[60%] lg:sticky lg:top-24 h-fit">
                        <ProductGallery
                            product={activeProd}
                            productVideoUrl={productVideoUrl}
                            isWishlisted={isWishlisted}
                            handleWishlistToggle={handleWishlistToggle}
                            setModalImg={setModalImg}
                            setModalMediaType={setModalMediaType}
                            setIsSideModalOpen={setIsSideModalOpen}
                            zoomStyle={zoomStyle}
                            handleZoomImg={handleZoomImg}
                            hoveredIndex={hoveredIndex}
                            setHoveredIndex={setHoveredIndex}
                            mounted={mounted}
                        />
                    </div>

                    {/* RIGHT COLUMN: Info & Customizer (40%) */}
                    <div className="w-full lg:w-[40%] flex flex-col space-y-8">
                        {/* Product Title & Price Details */}
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-[34px] font-serif text-[#1F1F1F] font-medium tracking-wide leading-tight">
                                {displayTitle}
                            </h1>
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-start flex-col gap-2 flex-wrap">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {/* Price Display */}
                                        <div className={`transition-opacity duration-200 ${isPriceLoading ? 'opacity-50' : ''}`}>
                                            {!mounted ? (
                                                <div className="h-9 w-32 bg-gray-150/80 rounded-none animate-pulse" />
                                            ) : (
                                                <div className="flex items-baseline gap-3">
                                                    {hasOffer && headerMRP != null ? (
                                                        <>
                                                            <span className="text-2xl md:text-[28px] font-bold text-[#B57A5A] tracking-tight font-sans">
                                                                {formatPrice(withTax(isZeroOffer ? 0 : headerPrice, country))}
                                                            </span>
                                                            <span className="text-lg md:text-xl text-gray-400 line-through font-sans">
                                                                {formatPrice(withTax(headerMRP, country))}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-2xl md:text-[28px] font-bold text-[#B57A5A] tracking-tight font-sans">
                                                                {formatPrice(withTax(displayPrice, country))}
                                                            </span>
                                                            {!hasOffer && activeProd?.originalPrice && (
                                                                <span className="text-lg md:text-xl text-gray-400 line-through font-sans">
                                                                    {formatPrice(withTax(activeProd.originalPrice, country))}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Offer Badge inside header */}
                                        {mounted && hasOffer && offerDiscountLabel && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#B57A5A] border border-[#ECECEC]">
                                                <Tag className="w-3 h-3 text-[#B57A5A]" /> {offerDiscountLabel}
                                            </div>
                                        )}

                                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF8F5] text-gray-700 border border-[#ECECEC]">
                                            <BadgeCheck className="w-3.5 h-3.5 text-gray-700" /> IGI/GSI Certified
                                        </span>
                                    </div>
                                    <span className="text-[12px] text-gray-500 font-medium translate-y-0.5 font-sans">
                                        {isIndiaCountry(country) ? 'Inclusive of GST' : 'Taxes as applicable'}
                                    </span>
                                </div>
                                {/* Wishlist & Share Buttons */}
                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                    <button
                                        disabled={isPriceLoading}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-250 ${isWishlisted
                                            ? 'bg-red-50 text-red-500 border-red-200 shadow-sm'
                                            : 'bg-white text-gray-800 hover:bg-gray-50 border-[#ECECEC] hover:shadow-md'
                                            }`}
                                        onClick={handleWishlistToggle}
                                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                    >
                                        <Heart
                                            className={`w-5 h-5 transition-transform duration-250 ${isWishlisted ? 'fill-current scale-110' : 'hover:scale-110'}`}
                                            strokeWidth={isWishlisted ? 0 : 1.5}
                                        />
                                    </button>
                                    <button
                                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-gray-800 hover:bg-gray-50 border border-[#ECECEC] transition-all duration-250 hover:shadow-md"
                                        title="Share product"
                                        onClick={() => handleShareProduct(activeProd)}
                                    >
                                        <Share2 className="w-5 h-5 hover:scale-110 transition-transform duration-250" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Customization & Actions */}
                        <div>
                            <ProductCustomizer
                                countryIN={country}
                                product={activeProd}
                                allVariants={allVariants}
                                isPriceLoading={isPriceLoading}
                                availableMetalColors={availableMetalColors}
                                availableMetalStamps={availableMetalStamps}
                                selectedColor={selectedColor}
                                selectedMetal={selectedMetal}
                                selectedSize={selectedSize}
                                setSelectedSize={handleSetSize}
                                selectedDiamondOrigin={selectedDiamondOrigin}
                                setSelectedDiamondOrigin={handleSetOrigin}
                                selectedDiamondColor={selectedDiamondColor}
                                setSelectedDiamondColor={handleSetColor}
                                selectedClarity={selectedClarity}
                                setSelectedClarity={handleSetClarity}
                                hasCenterDiamond={hasCenterDiamond}
                                centerStone={centerStone}
                                isSingleCenterDiamond={isSingleCenterDiamond}
                                centerDiamondsSelectable={centerDiamondsSelectable}
                                mounted={mounted}
                                displayTitle={displayTitle}
                                handleAttributeSelect={handleAttributeSelect}
                                handleAddToCart={handleAddToCart}
                                isInCart={isInCart}
                                handleWishlistToggle={handleWishlistToggle}
                                handleOrderInquiry={handleOrderInquiryClick}
                                engravingEnabled={engravingEnabled}
                                setEngravingEnabled={setEngravingEnabled}
                                engravingText={engravingText}
                                setEngravingText={setEngravingText}
                                isRingBuilderMode={isRingBuilderMode}
                                isDiamondProduct={isDiamondProduct}
                                hasOtherItem={hasOtherItem}
                                handleChooseSetting={handleChooseSetting}
                                handleChooseDiamond={handleChooseDiamond}
                                handleCompleteRing={handleCompleteRing}
                            />
                        </div>

                        {/* Disclaimer Block */}
                        <div className="pt-2 border-t border-[#ECECEC]">
                            <p className="text-[12px] text-[#707070] font-medium text-left font-sans select-none">
                                <span className="font-bold text-[#1F1F1F]">Disclaimer:</span> The images shown are for illustrative purposes only. The final product may vary slightly in color, finish, or other minor details.
                            </p>
                        </div>

                        {/* Info & Recommendations */}
                        <div>
                            {mounted ? (
                                <ProductSidebar
                                    product={activeProd}
                                    displayPrice={hasOffer ? headerPrice : displayPrice}
                                    offerDetails={offerDetails}
                                    combineWithList={combineWithList}
                                    handleAddToCart={handleAddToCart}
                                    selectedDiamondOrigin={selectedDiamondOrigin}
                                />
                            ) : (
                                <div className="space-y-6 flex flex-col pb-10 md:pb-12 border border-[#ECECEC] bg-white p-6 rounded-none">
                                    <div className="animate-pulse space-y-6">
                                        <div className="h-20 bg-gray-100 rounded-none"></div>
                                        <div className="h-20 bg-gray-100 rounded-none"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION: Customer Reviews */}
                {/* <CustomerReviews /> */}

                {/* SECTION: Matching Pieces */}
                <ProductRecommendations recList={recList} />

                <ShopBySegment shopBySegmentData={shopBySegmentData} />

                <OurServices />

                <NearbyStore />

                {/* Side Media Modal */}
                <ProductMediaModal
                    countryIN={country}
                    isOpen={isSideModalOpen}
                    onClose={() => setIsSideModalOpen(false)}
                    mediaUrl={modalImg}
                    mediaType={modalMediaType}
                    productName={activeProd.title || activeProd.name || ''}
                    onMouseMove={(e) => handleZoomImg(e, modalImg as string)}
                    onMouseEnter={() => setHoveredIndex(-1)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    zoomStyle={zoomStyle}
                    isHovered={hoveredIndex === -1}
                    onAddToCart={() => handleAddToCart()}
                    handleOrderInquiry={handleOrderInquiryClick}
                    isInCart={isInCart}
                />
            </div>



            {/* Product Order Inquiry Modal */}
            <OrderInquiryModal
                isOpen={showInquiryModal}
                onClose={() => setShowInquiryModal(false)}
                product={activeProd}
            />
        </>
    );
}