'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useGlobleStore } from '@/store/globleStore';
import { getWishlist, getCart } from '@/lib/commonApi';
import { successMsg, errorMsg } from '@/lib/toast';
import EmptyState from '@/components/EmptyState';
import { getWishlist as getWishlistApi, removeFromWishlist as removeFromWishlistApi, moveToCart as moveToCartApi } from '@/services/wishlistService';
import { toast } from 'sonner';
import { STATUS_CODE, PANDENTS_INCLUDE, PANDENTS_MESSAGE } from '@/lib/constants';
import { getToken, getCartCookie, setCartCookie } from '@/services/clientCookies';
import { lineKey, sameSelection } from '@/lib/lineIdentity';
import { formatPrice, getOfferDiscountLabel } from '@/lib/priceUtils';
import { withTax } from '@/lib/taxUtils';
import { getImageUrl } from '@/lib/utils';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';

export default function Wishlist() {
    const token = getToken();

    const { wishlist, removeFromWishlist, country, cart, addToCart } = useGlobleStore();
    const [mounted, setMounted] = useState(false);
    const isIndia = country === DEFAULT_COUNTRY;

    useEffect(() => {
        getWishlist();
        setMounted(true);
    }, []);

    // Remove wishlist. Takes the LINE, not a product id: the same design can be
    // wishlisted in Natural and in Lab Grown, and only one is being removed.
    const handleRemoveFromWishlist = async (item: any) => {
        try {
            await removeFromWishlist(item);
            successMsg('Product removed from wishlist');
        } catch (error) {
            console.log("remove from wishlist error====", error)
        }
    };

    // Move wishlist to cart. Takes the LINE so the right variant is moved.
    const handleMoveToCart = async (item: any) => {
        try {
            const token = getToken();
            const id = item.id || item._id;

            if (item.isDiamond) {
                addToCart(item);
                await removeFromWishlist(item);
                toast.success('Diamond added to cart successfully!');
                return;
            }

            if (!item) return;

            // Per LINE, not per product: the cart can hold this design in both
            // origins, so a Natural line already in the bag must not block the
            // Lab Grown one from being moved. Size is excluded because a wishlist
            // line carries none — this mirrors the server's own moveToCart check.
            const isInCart = cart.some((cartItem: any) => {
                const sameProduct = [cartItem.id, cartItem._id, cartItem.jeweleryId, cartItem.jewelleryId]
                    .some((v) => v && String(v) === String(id));
                return sameProduct && sameSelection(cartItem, item);
            });
            if (isInCart) {
                errorMsg('Product is already in your bag');
                return;
            }

            if (token) {
                // Logged in flow
                const response = await moveToCartApi({ wishlistId: item.wishlistId || id }, token);
                if (response?.status === STATUS_CODE.OK || response?.errorCode === STATUS_CODE.OK) {
                    getCart();
                    await handleRemoveFromWishlist(item);
                    successMsg('Product added to bag');
                } else {
                    errorMsg(response?.message || 'Failed to add product to bag');
                }
            } else {
                // Without login flow (Guest). The cart cookie is keyed on the
                // SKU and stores selections only — prices and titles come from
                // /cart/preview, never from the cookie.
                const sku = String(item.sku || item.itemCode || '').trim();
                if (!sku) {
                    errorMsg('Failed to add product to bag');
                    return;
                }
                const newLine = {
                    sku,
                    qty: 1,
                    sizeId: item.sizeId || (typeof item.sizeDetails === 'object' ? item.sizeDetails?._id : item.sizeDetails) || null,
                    origin: item.origin || null,
                    color: item.color || null,
                    clarity: item.clarity || null,
                };
                const guestCart = getCartCookie();
                // Match the whole line: the same SKU in another origin is a
                // different bag item, not a duplicate.
                const target = lineKey(newLine);
                if (!guestCart.some((i: any) => lineKey(i) === target)) {
                    guestCart.push(newLine);
                    setCartCookie(guestCart);
                }

                // Sync the global cart state and remove from wishlist
                getCart();
                await handleRemoveFromWishlist(item);
                successMsg('Product added to bag');
            }
        } catch (error) {
            console.log("move to bag error===", error)
        }
    };

    if (!mounted) {
        return (
            <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#1A1A1A] animate-pulse">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-20">
                    <div className="h-8 bg-gray-100 w-48 mb-8"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-[#F8F5F1] border border-[#ECECEC] rounded-none"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#1A1A1A]">
            {/* Breadcrumbs */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 text-[12px] text-gray-500">
                <Link href="/" className="hover:text-black">Home</Link>
                <span className="mx-2 font-bold">{'>'}</span>
                <span className="text-black">Wishlist</span>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
                {wishlist.length > 0 && (
                    <h1 className="text-[28px] md:text-[32px] font-serif mb-8">
                        My Wishlist <span className="text-gray-500 text-[18px] font-sans">({wishlist.length} Items)</span>
                    </h1>
                )}

                {wishlist.length === 0 ? (
                    <EmptyState
                        icon={Heart}
                        title="YOUR WISHLIST IS EMPTY"
                        subtitle="Browse our inventory to add jewelry to your wishlist for later."
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlist.map((item, index) => {

                            console.log("Wishlist items ======>", item)

                            const jewelObj = (item.jeweleryId && typeof item.jeweleryId === 'object') ? item.jeweleryId : ((item.jewelleryId && typeof item.jewelleryId === 'object') ? item.jewelleryId : null);

                            const centerStone = (item.stoneDetails?.find((s: any) => s.type?.toLowerCase() === 'center')) ||
                                                (jewelObj?.stoneDetails?.find((s: any) => s.type?.toLowerCase() === 'center')) ||
                                                (item.stoneDetails?.[0]) || (jewelObj?.stoneDetails?.[0]);

                            const itemSku = item.stockId || item.itemCode || item.sku || jewelObj?.itemCode || jewelObj?.sku || '';

                            const itemColor = (typeof item.color === 'object' ? item.color?.name : item.color) || item.selectedColor || (typeof centerStone?.color === 'object' ? centerStone?.color?.name : centerStone?.color) || '';

                            const itemClarity = (typeof item.clarity === 'object' ? item.clarity?.name : item.clarity) || item.selectedClarity || (typeof centerStone?.clarity === 'object' ? centerStone?.clarity?.name : centerStone?.clarity) || '';

                            const itemOrigin = item.origin || item.selectedOrigin ||
                                (centerStone ? ((centerStone.stoneGroup?.stoneType?.toLowerCase() === 'diamond' || (centerStone.stoneGroup?.type || '').toLowerCase() === 'lab grown' || (centerStone.stoneGroup?.type || '').toLowerCase() === 'lab_grown') ? 'Lab Grown' : 'Natural') : '');

                            const productLink = item.isDiamond
                                ? `/diamonds-detail?id=${item.id || item._id}&diamondShape=${item.shape || ''}&diamondCarat=${item.carat || ''}&diamondColor=${item.color || ''}&diamondClarity=${item.clarity || ''}&diamondPrice=${item.price || ''}`
                                : `/product/${item.slug || item.id || item._id}`;

                            const itemMetal = item.metal_type?.paraname ||
                                (typeof item.metal === 'object' ? item.metal?.name : item.metal) ||
                                (typeof item.material === 'object' ? item.material?.name : item.material) ||
                                item.metalTypeDetail?.metalName || jewelObj?.metalTypeDetail?.metalName ||
                                (item.metalStempName ? `${item.metalStempName} ${item.metalTypeName || ''}` : '');

                            const itemShape = (typeof item.shape === 'object' ? item.shape?.name : item.shape) || 
                                              (typeof centerStone?.shape === 'object' ? centerStone?.shape?.name : centerStone?.shape) || 
                                              (typeof jewelObj?.shape === 'object' ? jewelObj?.shape?.name : jewelObj?.shape) || '';

                            const rawWeight = item.weight || item.metalWeight || item.appxMetalWgt || jewelObj?.weight || jewelObj?.metalWeight || '';
                            const itemWeight = typeof rawWeight === 'number' ? rawWeight : (rawWeight && !isNaN(parseFloat(rawWeight)) ? parseFloat(rawWeight) : rawWeight);

                            const offerDetails = item.offerDetails || null;
                            const rawDiscountedPrice = offerDetails?.discountedPrice ?? offerDetails?.discountedValue ?? item.discountedPrice ?? item.price ?? item.setting_price ?? item.settingprice;
                            const discountedPrice = rawDiscountedPrice ?? 0;
                            const rawMRP = offerDetails?.mrp || offerDetails?.totalOriginalPrice || (offerDetails?.discountAmount && rawDiscountedPrice != null ? (rawDiscountedPrice + offerDetails.discountAmount) : (item.originalPrice || item.price || item.setting_price || item.settingprice || 0));
                            const originalPrice = rawMRP;
                            const hasOffer = !item.isDiamond && (!!(offerDetails?.offer?._id || offerDetails?.offer?.code) || (originalPrice > discountedPrice));
                            const displayCurrentPrice = item.isDiamond ? (item.price || 0) : ((hasOffer && (discountedPrice <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= originalPrice))) ? 0 : discountedPrice);

                            // Ring size & label
                            const ringSize = item.size || item.sizeDetails?.name || (typeof item.sizeDetails === 'string' ? item.sizeDetails : null) || item.selectedSizeName || null;
                            const sizeLabel = item.sizeLabel || jewelObj?.sizeLabel || "Size";

                            // Quantity
                            const itemQty = item.qty || item.quantity;

                            // Pendant chain disclaimer
                            const categoryName = item.categoryName || item.category?.categoryName || '';
                            const isPendant = PANDENTS_INCLUDE.some((c) =>
                                String(categoryName).toLowerCase().startsWith(c.toLowerCase())
                            );

                            const itemKey = item.wishlistId || `${lineKey(item)}-${index}`;

                            // Custom rendering for Diamond Items (matching Image 1 / Veer spec layout)
                            if (item.isDiamond) {
                                const isMongoId = (val: any) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
                                const rawStock = item.stockId || item.stock_id || item.sku;
                                const stockIdDisplay = (rawStock && !isMongoId(rawStock)) ? rawStock : '-';
                                const caratDisplay = item.carat ? (typeof item.carat === 'number' ? item.carat.toFixed(2) : item.carat) : '-';
                                const shapeDisplay = (typeof item.shape === 'object' ? item.shape?.name : item.shape) || '-';
                                const colorDisplay = (typeof item.color === 'object' ? item.color?.name : item.color) || '-';
                                const clarityDisplay = (typeof item.clarity === 'object' ? item.clarity?.name : item.clarity) || '-';
                                const cutDisplay = (typeof item.cut === 'object' ? item.cut?.name : item.cut) || '-';
                                const polishDisplay = (typeof item.polish === 'object' ? item.polish?.name : item.polish) || '-';
                                const symmDisplay = (typeof item.symmetry === 'object' ? item.symmetry?.name : item.symmetry) || '-';
                                const fluorDisplay = (typeof item.fluorescence === 'object' ? item.fluorescence?.name : item.fluorescence) || '-';
                                const labDisplay = (typeof item.certLab === 'object' ? item.certLab?.name : (item.lab || item.certLab)) || '-';
                                const certNoDisplay = item.certNo || item.certificateNo || item.cert_no || '-';
                                const depthDisplay = item.depth || item.depthPer || item.depth_percent ? `${item.depth || item.depthPer || item.depth_percent}%` : '-';
                                const tableDisplay = item.table || item.tablePer || item.table_percent ? `${item.table || item.tablePer || item.table_percent}%` : '-';

                                return (
                                    <div key={itemKey} className="group flex flex-col border border-[#ECECEC] p-4 bg-white hover:shadow-lg transition-all duration-300 rounded-none relative">
                                        {/* Image Container with Trash Remove Button */}
                                        <div className="aspect-[5/4] relative overflow-hidden bg-[#F8F5F1] border border-[#ECECEC] mb-3 block rounded-none">
                                            <Link href={productLink} className="w-full h-full block relative cursor-pointer">
                                                <Image
                                                    src={getImageUrl(item.default_image || item.image || '')}
                                                    alt={item.title || item.name || ''}
                                                    fill
                                                    className="object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </Link>
                                            <button
                                                onClick={() => handleRemoveFromWishlist(item)}
                                                title="Remove from wishlist"
                                                className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 p-1.5 rounded-full shadow-xs transition-colors z-10"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            {/* Stock ID Header (Only shown if real stockId exists) */}
                                            {stockIdDisplay !== '-' && (
                                                <p className="text-[11px] text-gray-500 font-mono tracking-wider mb-0.5">{stockIdDisplay}</p>
                                            )}

                                            {/* Title */}
                                            <Link href={productLink} className="block hover:text-[#B57A5A] transition-colors mb-1">
                                                <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
                                                    {item.title || `${caratDisplay !== '-' ? `${caratDisplay} Ct.` : ''} ${shapeDisplay !== '-' ? shapeDisplay : ''} ${item.origin || 'NATURAL'} Diamond`}
                                                </h3>
                                            </Link>

                                            {/* Price */}
                                            <div className="mb-3">
                                                <span className="text-base md:text-lg font-bold text-[#B57A5A] font-sans">
                                                    {formatPrice(withTax(displayCurrentPrice, country))}
                                                </span>
                                            </div>

                                            {/* Detailed Specs Table (Matching Image 1 format) */}
                                            <div className="bg-[#FAF9F6] border border-[#EBE8E2] p-2.5 text-[11px] font-sans space-y-1.5 mb-4 text-gray-700">
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">CARAT:</span>
                                                    <span className="font-bold text-gray-900">{caratDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">SHAPE:</span>
                                                    <span className="font-bold text-gray-900">{shapeDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">COLOR:</span>
                                                    <span className="font-bold text-gray-900">{colorDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">CLARITY:</span>
                                                    <span className="font-bold text-gray-900">{clarityDisplay}</span>
                                                </div>
                                                {cutDisplay && cutDisplay !== '-' && (
                                                    <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                        <span className="uppercase text-gray-500 font-semibold tracking-wider">CUT:</span>
                                                        <span className="font-bold text-gray-900">{cutDisplay}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">POLISH:</span>
                                                    <span className="font-bold text-gray-900">{polishDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">SYMMETRY:</span>
                                                    <span className="font-bold text-gray-900">{symmDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">FLUORESCENCE:</span>
                                                    <span className="font-bold text-gray-900">{fluorDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">LAB:</span>
                                                    <span className="font-bold text-gray-900">{labDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">CERT NO:</span>
                                                    <span className="font-bold text-gray-900">{certNoDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">DEPTH %:</span>
                                                    <span className="font-bold text-gray-900">{depthDisplay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200/60 pb-1">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">TABLE %:</span>
                                                    <span className="font-bold text-gray-900">{tableDisplay}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="uppercase text-gray-500 font-semibold tracking-wider">STOCK ID:</span>
                                                    <span className="font-bold text-gray-900">{stockIdDisplay}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="mt-auto">
                                            <button
                                                onClick={() => handleMoveToCart(item)}
                                                className="w-full bg-[#B57A5A] hover:bg-[#9D6A4B] text-white py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors rounded-none shadow-xs"
                                            >
                                                <ShoppingBag size={14} /> ADD TO CART
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={itemKey} className="group flex flex-col border border-[#ECECEC] p-4 bg-white hover:shadow-lg transition-all duration-300 rounded-none">
                                    <div className="aspect-[5/4] relative overflow-hidden bg-[#F8F5F1] border border-[#ECECEC] mb-3 block cursor-pointer rounded-none">
                                        <Link href={productLink} className="block w-full h-full relative">
                                            <Image
                                                src={getImageUrl(item.default_image || item.image || '')}
                                                alt={item.title || item.name || ''}
                                                fill
                                                className="object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveFromWishlist(item)}
                                            title="Remove from wishlist"
                                            className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 p-1.5 rounded-full shadow-xs transition-colors z-10"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    <div className="flex-1">
                                        <Link href={productLink} className="block hover:text-[#B57A5A] transition-colors">
                                            <h3 className="text-[15px] font-bold text-gray-900 mb-1 h-10 line-clamp-2 leading-tight">{item.title || item.name}</h3>
                                        </Link>
                                        {/* SKU */}
                                        {itemSku && (
                                            <p className="text-[11px] text-gray-600 font-medium mb-2.5 uppercase tracking-wider">
                                                <span className="font-bold text-gray-900">SKU :</span> <span className="text-gray-500 font-medium">{itemSku}</span>
                                            </p>
                                        )}

                                        {/* Specifications Grid */}
                                        {item.isCompleteRing ? (
                                            <div className="bg-[#FAF8F5] border border-[#ECECEC] p-3 text-[11px] font-sans space-y-2 mb-4 text-gray-700">
                                                <div className="flex justify-between border-b border-stone-200/80 pb-1">
                                                    <span className="font-bold text-gray-900 uppercase">STYLE CODE:</span>
                                                    <span className="font-medium text-stone-600">{item.settingSku || item.sku || '-'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-stone-200/80 pb-1">
                                                    <span className="font-bold text-gray-900 uppercase">METAL:</span>
                                                    <span className="font-medium text-stone-600">{item.settingMetal || itemMetal || '-'}</span>
                                                </div>
                                                {item.diamondCarat && (
                                                    <div className="flex justify-between border-b border-stone-200/80 pb-1">
                                                        <span className="font-bold text-gray-900 uppercase">TOTAL CARAT:</span>
                                                        <span className="font-medium text-stone-600">{item.diamondCarat} Ct</span>
                                                    </div>
                                                )}
                                                <div className="pt-1">
                                                    <span className="font-bold text-gray-900 uppercase block mb-1">Center Diamond:</span>
                                                    <span className="text-stone-700 font-medium">{item.diamondShape || 'Round'} | {item.diamondColor || 'E'} | {item.diamondClarity || 'VS1'} | {item.diamondCarat || ''} Ct {item.diamondLab ? `(${item.diamondLab})` : ''}</span>
                                                </div>
                                                {(item.sideCarat || item.sideCount) && (
                                                    <div className="pt-1 border-t border-stone-200/60">
                                                        <span className="font-bold text-gray-900 uppercase block mb-0.5">Side Diamonds:</span>
                                                        <span className="text-stone-700 font-medium">{item.sideCarat ? `${item.sideCarat} ` : ''}{item.sideCount ? `(${item.sideCount})` : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-gray-600 mb-4 border-t border-b border-[#ECECEC] py-2">
                                                {itemMetal && (
                                                    <div>
                                                        <span className="font-bold text-gray-900">Metal :</span> <span className="text-gray-500 font-medium">{itemMetal}</span>
                                                    </div>
                                                )}
                                                {itemColor && (
                                                    <div>
                                                        <span className="font-bold text-gray-900">Color :</span> <span className="text-gray-500 font-medium">{itemColor}</span>
                                                    </div>
                                                )}
                                                {itemClarity && (
                                                    <div>
                                                        <span className="font-bold text-gray-900">Clarity :</span> <span className="text-gray-500 font-medium">{itemClarity}</span>
                                                    </div>
                                                )}
                                            
                                                {itemShape && (
                                                    <div>
                                                        <span className="font-bold text-gray-900">Shape :</span> <span className="text-gray-500 font-medium">{itemShape}</span>
                                                    </div>
                                                )}
                                                {itemWeight && (
                                                    <div>
                                                        <span className="font-bold text-gray-900">Weight (apx) :</span> <span className="text-gray-500 font-medium">{typeof itemWeight === 'number' ? itemWeight.toFixed(3) : itemWeight}</span>
                                                    </div>
                                                )}
                                                {ringSize && (
                                                    <div>
                                                        <span className="font-bold text-gray-900">{sizeLabel} :</span> <span className="text-gray-500 font-medium">{ringSize}</span>
                                                    </div>
                                                )}
                                                {(item.engraving === 1 || item.engraving === true || Boolean(item.engravingText)) && item.engravingText && (
                                                    <div className="col-span-2">
                                                        <span className="font-bold text-gray-900">Engraving :</span> <span className="text-[#B57A5A] font-semibold italic">"{item.engravingText}"</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 flex-wrap mb-4">
                                            {/* All-in (incl. GST), consistent with listings/PDP/cart. */}
                                            <span className="text-base md:text-lg font-bold text-[#B57A5A] font-sans">
                                                {formatPrice(withTax(displayCurrentPrice, country))}
                                            </span>
                                            {hasOffer && (
                                                <>
                                                    <span className="text-[11px] text-gray-400 line-through">
                                                        {formatPrice(withTax(originalPrice, country))}
                                                    </span>
                                                    {getOfferDiscountLabel(item.offerDetails) && (
                                                        <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1 py-0.5 rounded font-medium">
                                                            {getOfferDiscountLabel(item.offerDetails)}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {isIndia && !item.isDiamond && (
                                            <button
                                                onClick={() => handleMoveToCart(item)}
                                                className="w-full bg-[#B57A5A] text-white py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-[#9D6A4B] transition-colors rounded-none"
                                            >
                                                ADD TO CART
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRemoveFromWishlist(item)}
                                            className="w-full border border-gray-200 py-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:bg-[#B57A5A] hover:text-white hover:border-[#B57A5A] transition-all duration-200 rounded-none"
                                        >
                                            REMOVE FROM WISHLIST
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
