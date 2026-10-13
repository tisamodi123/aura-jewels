'use client';

import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { useGlobleStore } from "@/store/globleStore";
import { formatPrice, getOfferDiscountLabel } from '@/lib/priceUtils';
import { withTax } from '@/lib/taxUtils';
import { updateCartItem } from '@/services/cartService';
import { getCart } from '@/lib/commonApi';
import { getToken, getCartCookie, setCartCookie, deleteCookie } from '@/services/clientCookies';
import { lineKey } from '@/lib/lineIdentity';
import { errorMsg, successMsg } from '@/lib/toast';
import { ALLOW_QUANTITY, PANDENTS_INCLUDE, PANDENTS_MESSAGE } from '@/lib/constants';

interface CartItemProps {
    item: any;
    // Receives the cart line, not a product id.
    handleMoveToWishlist?: (item: any) => void;
    // Receives the cart line, not a product id.
    handleRemoveFromCart?: (item: any) => void;
    handleUpdateQuantity?: (id: any, quantity: any) => void;
    // Called after a successful qty/size change so the page can refresh the
    // server-computed Total (incl. GST). Falls back to a plain store refresh.
    onUpdated?: () => Promise<any> | void;
}

export const CartItem: React.FC<CartItemProps> = ({
    item,
    handleMoveToWishlist,
    handleRemoveFromCart,
    onUpdated,
}) => {
    const { currencySymbol, country } = useGlobleStore();

    const [updatingSize, setUpdatingSize] = useState(false);
    const [updatingQty, setUpdatingQty] = useState(false);
    const [isEditingEngraving, setIsEditingEngraving] = useState(false);
    const [editEngravingEnabled, setEditEngravingEnabled] = useState<boolean>(
        Boolean(item.engraving === 1 || item.engraving === '1' || item.engraving === true || item.engravingText)
    );
    const [editEngravingText, setEditEngravingText] = useState<string>(item.engravingText || '');
    const [updatingEngraving, setUpdatingEngraving] = useState(false);

    // Safely parse attributes
    const itemSku = item.itemCode || item.sku;
    const itemColor = typeof item.color === 'object' ? item.color?.name : item.color;
    const itemClarity = typeof item.clarity === 'object' ? item.clarity?.name : item.clarity;
    const itemOrigin = item.origin || '';
    const productLink = `/product/${item.slug || item.id || item._id}`;
    const itemMetal = item.metal_type?.paraname ||
        (typeof item.metal === 'object' ? item.metal?.name : item.metal) ||
        (typeof item.material === 'object' ? item.material?.name : item.material);
    const itemShape = typeof item.shape === 'object' ? item.shape?.name : item.shape;
    const itemWeight = item.weight || item.metalWeight || item.appxMetalWgt || '';
    const imageSrc = item.image || item.default_image || (item.images?.[0]);

    // Ring size
    const hasSize = item.hasSize === true;
    const ringSizes: any[] = item.RingSizes || [];
    const selectedSizeId = item.sizeId ? String(item.sizeId) : '';
    const currentQty: number = item.quantity || item.qty || 1;

    const offerDetails = item.offerDetails || null;
    const rawDiscounted = offerDetails?.discountedPrice ?? offerDetails?.discountedValue ?? item.discountedPrice ?? item.price;
    const discountedPrice = rawDiscounted ?? 0;
    const rawMRP = offerDetails?.mrp || offerDetails?.totalOriginalPrice || (offerDetails?.discountAmount && rawDiscounted != null ? (rawDiscounted + offerDetails.discountAmount) : (item.originalPrice || item.price || 0));
    const originalPrice = rawMRP;
    const hasOffer = !!(offerDetails?.offer?._id || offerDetails?.offer?.code) || (originalPrice > discountedPrice);
    const displayCurrentPrice = (hasOffer && (discountedPrice <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= originalPrice))) ? 0 : discountedPrice;

    // Pendant "chain not included" disclaimer (case-insensitive category match).
    const categoryName = item.categoryName || item.category?.categoryName || '';
    const isPendant = PANDENTS_INCLUDE.some((c) =>
        String(categoryName).toLowerCase().startsWith(c.toLowerCase())
    );

    // Refresh the cart after a change: prefer the page callback (also refreshes
    // the server Total), otherwise just re-map the store.
    // const refresh = () => (onUpdated ? onUpdated() : getCart());

    const refresh = async () => {
        const cart = onUpdated ? await onUpdated() : await getCart();
        console.log('refresh cart', cart);
        return cart;
    };

    // Patch this line in the guest cookie-cart (guests have no server cart).
    // Keyed on the full line identity — SKU + size + centre-stone selection —
    // the same key the add-to-cart path uses, so the two never drift apart.
    // Keying on SKU + size alone would patch every origin of this design.
    const patchGuestCookie = (patch: Record<string, any>) => {
        const c = getCartCookie();
        const arr = Array.isArray(c) ? c : [];
        // Match on item.cartId, NOT lineKey(item). The server stamps every guest
        // preview line with _id = lineKey(RAW cookie line); mapCartItems carries it
        // as item.cartId. The cart DISPLAYS size/origin/colour/clarity RESOLVED to
        // concrete values (a line added at the default size shows the default id,
        // etc.), so lineKey(displayedItem) never equals the cookie's raw key and
        // the patch silently no-op'd. item.cartId === lineKey(cookie line).
        const target = item.cartId;
        if (!target) return;
        setCartCookie(arr.map((g: any) => (lineKey(g) === target ? { ...g, ...patch } : g)));
    };

    // ---------- Ring size change ----------
    const handleSizeChange = async (newSizeId: string) => {
        setUpdatingSize(true);
        try {
            if (!getToken()) {
                // Guest cart lives in the cookie.
                patchGuestCookie({ sizeId: newSizeId || null });
                await refresh();
                successMsg('Ring size updated');
                return;
            }
            if (!item.cartId) {
                errorMsg('Cannot update size: cart item ID missing');
                return;
            }
            const res = await updateCartItem({
                cartId: item.cartId,
                sizeId: newSizeId || '',
            });
            if (res && (res.errorCode === 200 || res.status === 200)) {
                await refresh();
                successMsg('Ring size updated');
            } else {
                errorMsg(res?.message || 'Failed to update ring size');
            }
        } catch (err) {
            errorMsg('Failed to update ring size');
        } finally {
            setUpdatingSize(false);
        }
    };

    // ---------- Quantity change ----------
    const handleQtyChange = async (newQty: number) => {
        if (newQty < 1 || newQty > 99) return;
        setUpdatingQty(true);
        try {
            if (!getToken()) {
                // Guest cart lives in the cookie — update qty client-side.
                patchGuestCookie({ qty: newQty, quantity: newQty });
                await refresh();
                return;
            }
            if (!item.cartId) {
                errorMsg('Cannot update quantity: cart item ID missing');
                return;
            }
            const res = await updateCartItem({
                cartId: item.cartId,
                qty: newQty,
            });
            if (res && (res.errorCode === 200 || res.status === 200)) {
                const getCouponError = await refresh()
                if (getCouponError?.couponError) {
                    deleteCookie('coupon_code');
                    errorMsg(getCouponError?.couponError)
                }
            } else {
                errorMsg(res?.message || 'Failed to update quantity');
            }
        } catch (err) {
            errorMsg('Failed to update quantity');
        } finally {
            setUpdatingQty(false);
        }
    };

    // ---------- Engraving change ----------
    const handleSaveEngraving = async () => {
        setUpdatingEngraving(true);
        try {
            const engravingVal = editEngravingEnabled ? 1 : 0;
            const engravingTextVal = editEngravingEnabled ? editEngravingText : '';

            if (!getToken()) {
                patchGuestCookie({
                    engraving: engravingVal,
                    engravingText: engravingTextVal,
                });
                await refresh();
                setIsEditingEngraving(false);
                successMsg('Engraving updated');
                return;
            }

            if (!item.cartId) {
                errorMsg('Cannot update engraving: cart item ID missing');
                return;
            }

            const res = await updateCartItem({
                cartId: item.cartId,
                engraving: engravingVal,
                engravingText: engravingTextVal,
            });

            if (res && (res.errorCode === 200 || res.status === 200 || res.statusCode === 200 || res.success)) {
                await refresh();
                setIsEditingEngraving(false);
                successMsg('Engraving updated');
            } else {
                errorMsg(res?.message || 'Failed to update engraving');
            }
        } catch (err) {
            errorMsg('Failed to update engraving');
        } finally {
            setUpdatingEngraving(false);
        }
    };

    return (
        <div className="bg-white flex flex-col md:flex-row gap-6 md:gap-8 font-jakarta">
            {/* Left: Product Image Box */}
            <Link href={productLink} className="w-full md:w-[220px] lg:w-[240px] aspect-square bg-[#F8F5F1] border border-[#ECECEC] relative flex items-center justify-center block cursor-pointer rounded-none">
                {imageSrc ? (
                    <Image
                        src={getImageUrl(imageSrc)}
                        alt={item.title || item.name || 'Product Image'}
                        fill
                        className="object-contain mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, 240px"
                    />
                ) : (
                    <div className="w-8 h-8 border-2 border-gray-200 rotate-45"></div>
                )}
            </Link>

            {/* Right: Info Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    {/* Title */}
                    <Link href={productLink} className="hover:text-[#013D3D] transition-colors">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug mb-1">
                            {item.title || item.name}
                        </h3>
                    </Link>
                    {/* SKU */}
                    <p className="text-xs text-gray-600 font-medium mb-4 uppercase tracking-wider">
                        <span className="font-bold text-gray-900">SKU :</span> <span className="text-gray-500 font-medium">{itemSku}</span>
                    </p>

                    {/* Price & Selectors Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                             {/* All-in line price (incl. GST) — matches the PDP promise; the
                                 summary's server totals already include the same GST. */}
                            <span className="text-2xl font-bold text-[#B57A5A]">
                                {formatPrice(withTax(displayCurrentPrice, country))}
                            </span>
                            {hasOffer && (
                                <>
                                    <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(withTax(originalPrice, country))}
                                    </span>
                                    {getOfferDiscountLabel(item.offerDetails) && (
                                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1 py-0.5 rounded font-medium">
                                            {getOfferDiscountLabel(item.offerDetails)}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            {/* Ring Size Selector — shows dropdown if sizes available */}
                            {hasSize && ringSizes.length > 0 ? (
                                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                    <span className="font-bold text-gray-900">{item.sizeLabel || "Size"} :</span>
                                    <select
                                        value={selectedSizeId}
                                        onChange={(e) => handleSizeChange(e.target.value)}
                                        disabled={updatingSize}
                                        className="border border-gray-300 px-2 py-0.5 bg-white text-gray-800 font-semibold text-xs rounded-none focus:outline-none focus:border-[#B57A5A] disabled:opacity-50 cursor-pointer"
                                        title="Change ring size"
                                    >
                                        {!selectedSizeId && (
                                            <option value="" className="text-xs font-medium text-gray-800 py-0.5">Select size</option>
                                        )}
                                        {[...ringSizes]
                                            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                                            .map((s) => (
                                                <option key={s._id} value={s._id} className="text-xs font-medium text-gray-800 py-0.5">
                                                    {s.name}{s.isDefault ? ' (default)' : ''}
                                                </option>
                                            ))}
                                    </select>
                                    {updatingSize && (
                                        <span className="text-[10px] text-[#B57A5A] animate-pulse">Updating...</span>
                                    )}
                                </div>
                            ) : item.size ? (
                                /* Static size display if category has size but no list returned */
                                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                    <span className="font-bold text-gray-900">Ring Size :</span>
                                    <span className="border border-gray-300 px-2.5 py-0.5 bg-white text-gray-800 font-semibold text-xs rounded-none">
                                        {item.size}
                                    </span>
                                </div>
                            ) : null}

                            {/* Quantity Controls — visible only when ALLOW_QUANTITY=true */}
                            {ALLOW_QUANTITY && (
                                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                    <span className="font-bold text-gray-900">Qty :</span>
                                    <div className={`flex items-center border border-gray-200 bg-white rounded-none ${updatingQty ? 'opacity-50' : ''}`}>
                                        <button
                                            onClick={() => handleQtyChange(currentQty - 1)}
                                            disabled={updatingQty || currentQty <= 1}
                                            className="px-2.5 py-1 hover:bg-gray-50 text-xs font-bold border-r border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            −
                                        </button>
                                        <span className="px-3.5 py-1 text-xs font-bold text-gray-800 min-w-[24px] text-center">
                                            {currentQty}
                                        </span>
                                        <button
                                            onClick={() => handleQtyChange(currentQty + 1)}
                                            disabled={updatingQty || currentQty >= 99}
                                            className="px-2.5 py-1 hover:bg-gray-50 text-xs font-bold border-l border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {updatingQty && (
                                        <span className="text-[10px] text-[#B57A5A] animate-pulse">Updating...</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#ECECEC] w-full my-4"></div>

                    {/* Specifications Grid */}
                    <div className="text-xs md:text-[13px] mb-6">
                        {item.isCompleteRing ? (
                            <div className="bg-[#FAF8F5] border border-[#ECECEC] p-3.5 space-y-2.5 rounded-none font-sans">
                                {/* Top Header Info: Style Code & Metal */}
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs border-b border-stone-200/80 pb-2">
                                    {(item.settingSku || item.sku || item.itemCode) && (
                                        <div><span className="font-bold text-gray-900">Style Code:</span> <span className="text-stone-600 font-medium">{item.settingSku || item.sku || item.itemCode}</span></div>
                                    )}
                                    {(item.settingMetal || itemMetal) && (
                                        <div><span className="font-bold text-gray-900">Metal:</span> <span className="text-stone-600 font-medium">{item.settingMetal || itemMetal}</span></div>
                                    )}
                                    {item.diamondCarat && (
                                        <div><span className="font-bold text-gray-900">Total Diamond Weight:</span> <span className="text-stone-600 font-medium">{item.diamondCarat} Ct</span></div>
                                    )}
                                    {item.size && (
                                        <div><span className="font-bold text-gray-900">Size:</span> <span className="text-stone-600 font-medium">{item.size}</span></div>
                                    )}
                                </div>

                                {/* Diamond Details Box */}
                                <div className="space-y-1.5 pt-0.5">
                                    <p className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">Diamond Details:</p>
                                    
                                    {/* Center Diamond Specs */}
                                    <div className="text-xs text-stone-700 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="font-bold text-gray-900">Center:</span>
                                        {item.diamondShape && <span>Shape: <strong className="text-gray-900">{item.diamondShape}</strong></span>}
                                        {item.diamondColor && <span>Color: <strong className="text-gray-900">{item.diamondColor}</strong></span>}
                                        {item.diamondClarity && <span>Clarity: <strong className="text-gray-900">{item.diamondClarity}</strong></span>}
                                        {item.diamondCarat && <span>Carat: <strong className="text-gray-900">{item.diamondCarat} Ct</strong></span>}
                                        {item.diamondLab && <span>Lab: <strong className="text-gray-900">{item.diamondLab}</strong></span>}
                                    </div>

                                    {/* Side Diamond Specs (if applicable) */}
                                    {(item.sideCarat || item.sideCount || item.sideType) && (
                                        <div className="text-xs text-stone-700 flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="font-bold text-gray-900">Side:</span>
                                            {item.sideCarat && <span>Carat: <strong className="text-gray-900">{item.sideCarat}</strong></span>}
                                            {item.sideCount && <span>Stones: <strong className="text-gray-900">{item.sideCount}</strong></span>}
                                            {item.sideType && <span>Type: <strong className="text-gray-900">{item.sideType}</strong></span>}
                                        </div>
                                    )}

                                    {/* Diamond Type / Origin */}
                                    {(item.diamondOrigin || item.settingOrigin || itemOrigin) && (
                                        <div className="text-xs text-stone-600 pt-1 border-t border-stone-100">
                                            <span className="font-bold text-gray-900">Diamond Type:</span> <span className="font-semibold text-[#B57A5A]">{item.diamondOrigin || item.settingOrigin || itemOrigin}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : item.isDiamond ? (
                            <div className="grid grid-cols-2 gap-y-2 text-xs md:text-[13px]">
                                {item.carat && <div><span className="font-bold text-gray-900">Carat :</span> <span className="text-gray-500 font-medium">{item.carat}</span></div>}
                                {itemShape && <div><span className="font-bold text-gray-900">Shape :</span> <span className="text-gray-500 font-medium">{itemShape}</span></div>}
                                {itemColor && <div><span className="font-bold text-gray-900">Color :</span> <span className="text-gray-500 font-medium">{itemColor}</span></div>}
                                {itemClarity && <div><span className="font-bold text-gray-900">Clarity :</span> <span className="text-gray-500 font-medium">{itemClarity}</span></div>}
                                {item.cut && <div><span className="font-bold text-gray-900">Cut :</span> <span className="text-gray-500 font-medium">{typeof item.cut === 'object' ? item.cut?.name : item.cut}</span></div>}
                                {item.polish && <div><span className="font-bold text-gray-900">Polish :</span> <span className="text-gray-500 font-medium">{typeof item.polish === 'object' ? item.polish?.name : item.polish}</span></div>}
                                {item.symmetry && <div><span className="font-bold text-gray-900">Symmetry :</span> <span className="text-gray-500 font-medium">{typeof item.symmetry === 'object' ? item.symmetry?.name : item.symmetry}</span></div>}
                                {(item.lab || item.certLab) && <div><span className="font-bold text-gray-900">Lab :</span> <span className="text-gray-500 font-medium">{typeof (item.lab || item.certLab) === 'object' ? (item.lab || item.certLab)?.name : (item.lab || item.certLab)}</span></div>}
                                {(item.stockId || item.stock_id) && <div><span className="font-bold text-gray-900">Stock ID :</span> <span className="text-gray-500 font-medium">{item.stockId || item.stock_id}</span></div>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-y-2 text-xs md:text-[13px]">
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
                            </div>
                        )}
                    </div>

                    {/* Engraving Info & Edit */}
                    {((item.engraving === 1 || item.engraving === '1' || item.engraving === true || item.engravingText || item.isEngraving || item.jeweleryId?.isEngraving) || isEditingEngraving) && (
                        <div className="bg-[#FAF8F5] border border-[#ECECEC] p-4 mb-6 font-jakarta text-xs space-y-2 rounded-none">
                            {!isEditingEngraving ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-bold text-gray-900 flex-shrink-0">Engraving:</span>
                                        <span className="font-medium text-gray-700 truncate italic">
                                            {item.engravingText ? `"${item.engravingText}"` : ((item.engraving === 1 || item.engraving === '1' || item.engraving === true) ? 'Yes' : 'None')}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditEngravingEnabled(Boolean(item.engraving === 1 || item.engraving === '1' || item.engraving === true || item.engravingText));
                                            setEditEngravingText(item.engravingText || '');
                                            setIsEditingEngraving(true);
                                        }}
                                        className="text-[11px] font-extrabold text-[#B57A5A] hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer uppercase tracking-wider"
                                    >
                                        Edit
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-900">Edit Engraving</span>
                                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={editEngravingEnabled}
                                                onChange={(e) => {
                                                    setEditEngravingEnabled(e.target.checked);
                                                    if (!e.target.checked) setEditEngravingText('');
                                                }}
                                                className="w-3.5 h-3.5 rounded-none border-gray-300 text-[#B57A5A] accent-[#B57A5A] focus:ring-[#B57A5A]"
                                            />
                                            <span className="text-[11px] font-semibold text-gray-700">Add Engraving</span>
                                        </label>
                                    </div>
                                    {editEngravingEnabled && (
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={editEngravingText}
                                                onChange={(e) => setEditEngravingText(e.target.value)}
                                                maxLength={12}
                                                placeholder="e.g. Forever"
                                                className="w-full text-xs bg-white border border-gray-300 px-2.5 py-1.5 focus:outline-none focus:border-[#B57A5A] rounded-none"
                                            />
                                            <div className="flex justify-end text-[10px] text-gray-400">
                                                {editEngravingText.length}/12
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingEngraving(false)}
                                            className="px-3 py-1 text-[11px] font-bold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-none"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveEngraving}
                                            disabled={updatingEngraving}
                                            className="px-3 py-1 text-[11px] font-bold text-white bg-[#B57A5A] hover:bg-[#9D6A4B] disabled:opacity-50 rounded-none"
                                        >
                                            {updatingEngraving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pendant chain disclaimer */}
                    {isPendant && (
                        <p className="text-[11px] md:text-[12px] text-gray-600 leading-relaxed bg-amber-50/60 border border-amber-100 rounded-none px-3 py-2 mb-6">
                            <strong className="font-bold text-gray-800">Disclaimer:</strong> {PANDENTS_MESSAGE}
                        </p>
                    )}
                </div>

                {/* Bottom Actions Outlined Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            // Pass the LINE, not an id: two cart lines can share a
                            // product id (different origin, or different size).
                            handleRemoveFromCart && handleRemoveFromCart(item);
                        }}
                        className="flex-1 py-3 border border-[#ECECEC] text-gray-700 hover:text-red-600 hover:border-red-600 hover:bg-red-50/10 transition-all duration-300 text-[11px] font-bold uppercase tracking-[0.2em] text-center rounded-none"
                    >
                        Remove From Cart
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleMoveToWishlist && handleMoveToWishlist(item);
                        }}
                        className="flex-1 py-3 border border-[#B57A5A] text-[#B57A5A] hover:bg-[#B57A5A]/5 transition-all duration-300 text-[11px] font-bold uppercase tracking-[0.2em] text-center rounded-none"
                    >
                        Move To Wishlist
                    </button>
                </div>
            </div>
        </div>
    );
};