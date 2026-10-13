'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Heart } from 'lucide-react';
import { useGlobleStore } from '@/store/globleStore';
import { getSelectStyles } from '@/lib/selectStyles';
import { getCart, getWishlist } from '@/lib/commonApi';
import { successMsg, errorMsg } from '@/lib/toast';
import { removeCartItem, moveToWishlist, getApplicableCoupons } from '@/services/cartService';
import { CartItem } from '@/components/CartItem';
import { getToken, getCartCookie, setCartCookie, getWishlistCookie, setWishlistCookie, setCookie, deleteCookie, setLastRoute } from '@/services/clientCookies';
import { lineKey } from '@/lib/lineIdentity';
import { formatPrice } from '@/lib/priceUtils';
import { isIndiaCountry, taxInline, taxRowLabel, computeTax, withTax } from '@/lib/taxUtils';
import EmptyState from '@/components/EmptyState';
import CartStickyBar from '@/components/cart/CartStickyBar';

export default function Cart() {
    const router = useRouter();
    const { cart, country, couponCode, setCouponCode } = useGlobleStore();
    const isIndia = isIndiaCountry(country);

    const [promoCode, setPromoCode] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [isPromoOpen, setIsPromoOpen] = useState(false);

    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState<string>('');

    const itemsToShow = cart;
    const itemsSubtotal = itemsToShow.reduce((sum, item) => sum + (item.totalItemPrice || ((item.setting_price || item.settingprice || item.price || 0) * (item.quantity || item.qty || 1))), 0);
    const shipping = 0;

    // `cartTotal` is the server's PRE-TAX, post-coupon net; `cartTax` is the GST
    // it computed on that net. `cartGrandTotal` is the final amount payable.
    const [cartTotal, setCartTotal] = useState<number | null>(null);
    const [cartTax, setCartTax] = useState<number | null>(null);
    const [cartGrandTotal, setCartGrandTotal] = useState<number | null>(null);
    const [cartTaxRate, setCartTaxRate] = useState<number | null>(null);
    const [discount, setDiscount] = useState<number>(0);

    const refreshCart = async (couponCodeToApply?: string) => {
        try {
            const response = await getCart(couponCodeToApply);

            if (response && (response.status === 200 || response.errorCode === 200 || response.success)) {
                if (response.coupon) {
                    setAppliedCoupon({
                        code: response.coupon.code,
                        discountValue: response.coupon.discountAmount,
                        discountType: 'absolute'
                    });
                    setPromoCode(response.coupon.code || '');
                    setDiscount(response.coupon.discountAmount || 0);
                } else {
                    setAppliedCoupon(null);
                    setPromoCode('');
                    setDiscount(0);
                }
                // Reset from response only if server returned positive values, otherwise use local calculation fallback
                if (response.total && response.total > 0) {
                    setCartTotal(response.total);
                    setCartTax(response.tax ?? null);
                    setCartGrandTotal(response.grandTotal ?? null);
                    setCartTaxRate(response.taxRate ?? null);
                } else {
                    setCartTotal(null);
                    setCartTax(null);
                    setCartGrandTotal(null);
                    setCartTaxRate(null);
                }
            }
            return response;
        } catch (error) {
            console.error("Error refreshing cart:", error);
            return null;
        }
    };

    // Post-coupon net, BEFORE tax.
    const netTotal = (cartTotal !== null && cartTotal > 0) ? cartTotal : Math.max(0, itemsSubtotal + shipping - discount);
    // GST added on top. Prefer the server's figure; compute locally as fallback.
    const tax = (cartTax !== null && cartTax > 0) ? cartTax : computeTax(netTotal, country);
    // Final payable total.
    const grandTotal = (cartGrandTotal !== null && cartGrandTotal > 0) ? cartGrandTotal : parseFloat((netTotal + tax).toFixed(2));

    useEffect(() => {
        const activeCoupon = useGlobleStore.getState().couponCode;
        if (!activeCoupon) {
            deleteCookie('coupon_code');
        } else {
            setCookie('coupon_code', activeCoupon);
        }

        refreshCart(activeCoupon || '');
        getWishlist();
        // Fetch applicable coupons
        const fetchCoupons = async () => {
            try {
                // Guests can see PUBLIC coupons too (the endpoint is optional-auth
                // now). Passing no token returns { public, assigneeOnly: [] }.
                const token = getToken();
                setIsLoadingCoupons(true);
                const response = await getApplicableCoupons(token || undefined);
                if (response && (response.errorCode === 200)) {
                    const dataObj = response.data || {};
                    let merged: any[] = [];
                    if (Array.isArray(dataObj)) {
                        merged = dataObj.filter((coupon: any) => coupon.couponType !== 'private');
                    } else {
                        const pub = dataObj.public || [];
                        const ass = dataObj.assigneeOnly || [];
                        merged = [...pub, ...ass];
                    }
                    setCoupons(merged);
                }
            } catch (error) {
                console.error("Error fetching applicable coupons:", error);
            } finally {
                setIsLoadingCoupons(false);
            }
        };
        fetchCoupons();
    }, []);

    const handleApplyCoupon = async (couponCodeToApply?: string) => {
        setCouponError('');
        const code = (couponCodeToApply || promoCode).trim();

        if (!code) {
            setCouponError('Please enter a coupon code.');
            return;
        }

        try {
            const response = await refreshCart(code);

            if (response?.coupon !== null && response?.coupon !== undefined) {
                setCookie('coupon_code', code);
                setCouponCode(code);
                successMsg(`Coupon "${code.toUpperCase()}" applied successfully!`);
            } else {
                const errMsg = response?.couponError || 'Invalid coupon code or not applicable.';
                setCouponError(errMsg);
                errorMsg(errMsg);
            }
        } catch (error) {
            console.log("Error applying coupon:", error);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            const response = await refreshCart('');
            if (response && (response.status === 200 || response.errorCode === 200 || response.success)) {
                setAppliedCoupon(null);
                setPromoCode('');
                setCouponError('');
                deleteCookie('coupon_code');
                setCouponCode('');
                successMsg('Coupon removed.');
            } else {
                errorMsg(response?.message || 'Failed to remove coupon.');
            }
        } catch (error) {
            console.log("Error removing coupon:", error);
        }
    };

    const handleCheckout = () => {
        router.push('/checkout');
    };

    // Remove from cart. Takes the LINE, not a product id: the same design can sit
    // in the cart twice (two origins, or two sizes) and only one is being removed.
    const handleRemoveFromCart = async (item: any) => {
        try {
            const line = typeof item === 'string' || typeof item === 'number'
                ? cart.find((i: any) => String(i.id || i._id) === String(item))
                : item;
            if (!line) return;

            if (line?.isCompleteRing || line?.isDiamond) {
                if (typeof window !== 'undefined') {
                    try {
                        if (line?.isCompleteRing) {
                            const existing = JSON.parse(localStorage.getItem('Aura Jewels_custom_rings') || '[]');
                            const next = existing.filter((c: any) => c.cartId !== line.cartId && c.id !== line.id);
                            localStorage.setItem('Aura Jewels_custom_rings', JSON.stringify(next));
                        } else if (line?.isDiamond) {
                            const existing = JSON.parse(localStorage.getItem('Aura Jewels_diamond_cart') || '[]');
                            const next = existing.filter((c: any) => (c.id || c._id) !== (line.id || line._id));
                            localStorage.setItem('Aura Jewels_diamond_cart', JSON.stringify(next));
                        }
                    } catch (e) { }
                }
                useGlobleStore.getState().removeFromCart(line.id || line._id || line);
                successMsg('Product removed from cart');
                return;
            }

            if (!getToken()) {
                // Guest cart lives in the cookie. Match the exact line, not every
                // line that happens to share the SKU. The decorated `line` carries
                // RESOLVED values, so lineKey(line) won't match the RAW cookie
                // line; `line.cartId` IS the server's lineKey of that cookie line,
                // so compare each cookie line's own key against it.
                const target = line.cartId;
                const next = target
                    ? getCartCookie().filter((g: any) => lineKey(g) !== target)
                    : getCartCookie().filter((g: any) => lineKey(g) !== lineKey(line));
                setCartCookie(next);
                await getCart();
                successMsg('Product removed from cart');
                return;
            }
            await removeCartItem({
                cartId: line.cartId,
                jeweleryId: line.id ?? line._id,
                sizeId: line.sizeId ?? null,
                origin: line.origin ?? null,
                color: line.color ?? null,
                clarity: line.clarity ?? null,
            });
            // Await so the summary (subtotal, coupon, GST, total) is recomputed
            // from the fresh server response before we tell the user it's done.
            await refreshCart();
            successMsg('Product removed from cart');
        } catch (error) {
            console.log("remove from cart error====", error)
        }
    };

    // Update cart quantity — now handled internally by CartItem via updateCartItem API
    const handleUpdateQuantity = (_id: string, _quantity: number) => {
        // No-op: quantity updates are now done inside CartItem component directly
    };

    // Move cart to wishlist. Takes the LINE: `cart.find(i => i.id === id)` would
    // pick an arbitrary line once a design sits in the cart twice.
    const handleMoveToWishlist = async (target: any) => {
        try {
            const token = getToken();
            const item = typeof target === 'string' || typeof target === 'number'
                ? cart.find((i: any) => String(i.id || i._id) === String(target))
                : target;

            if (!item) { errorMsg('Cart item not found'); return; }

            if (item?.isDiamond) {
                await useGlobleStore.getState().addToWishlist(item);
                useGlobleStore.getState().removeFromCart(item.id || item._id || item.cartId || item);
                successMsg('Moved to wishlist');
                return;
            }

            if (!token) {
                // Guests already have a cookie wishlist — there is no reason to
                // force a login just to move a bag item into it.
                if (!item) { errorMsg('Cart item not found'); return; }
                const sku = String(item.sku || item.itemCode || '').trim();
                if (!sku) { errorMsg('Cart item not found'); return; }

                const wishLine = {
                    sku,
                    origin: item.origin ?? null,
                    color: item.color ?? null,
                    clarity: item.clarity ?? null,
                    sizeId: item.sizeId || (typeof item.sizeDetails === 'object' ? item.sizeDetails?._id : item.sizeDetails) || null,
                };
                const wish = getWishlistCookie();
                // The same SKU in another origin is a different wishlist entry.
                if (!wish.some((w: any) => lineKey(w) === lineKey(wishLine))) {
                    wish.push(wishLine);
                    setWishlistCookie(wish);
                }

                const cartTarget = lineKey(item);
                setCartCookie(getCartCookie().filter((g: any) => lineKey(g) !== cartTarget));

                await getCart();
                await getWishlist();
                successMsg('Moved to wishlist');
                return;
            }

            if (item && item.cartId) {
                await moveToWishlist({ cartId: item.cartId });
                await refreshCart();
                getWishlist();
                successMsg('Moved to wishlist');
            } else {
                errorMsg('Cart item not found');
            }
        } catch (error) {
            console.log("move to wishlist error====", error)
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.querySelector('footer');
            const mainActions = document.getElementById('countinue-btn-block');
            const windowHeight = window.innerHeight;
            const isMobile = window.innerWidth < 768;

            let shouldBeVisible = true;

            if (footer) {
                const footerTop = footer.getBoundingClientRect().top;
                if (footerTop < windowHeight) {
                    shouldBeVisible = false;
                }
            }

            if (shouldBeVisible && isMobile && mainActions) {
                const rect = mainActions.getBoundingClientRect();
                if (rect.top < windowHeight && rect.bottom > 0) {
                    shouldBeVisible = false;
                }
            }

            setIsVisible(shouldBeVisible);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <div className="bg-[#FFFFFF] min-h-screen font-sans text-[#1A1A1A]">
            {/* Breadcrumbs */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 text-[12px] text-gray-500">
                <Link href="/" className="hover:text-black">Home</Link>
                <span className="mx-2 font-bold">{'>'}</span>
                <span className="text-black">Cart</span>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
                {itemsToShow.length > 0 ? (
                    <>
                        <h1 className="text-[28px] md:text-[20px] font-serif mb-8">
                            Shopping Bag <span className="text-gray-500 text-[18px] font-sans">({itemsToShow.length} Items)</span>
                        </h1>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* LEFT COLUMN: Items */}
                            <div className="lg:col-span-7 space-y-8">
                                {itemsToShow.map((item, index) => (
                                    <CartItem key={item.cartId || item.id || item._id || item.stockId || `${lineKey(item)}-${index}`} item={item} handleMoveToWishlist={handleMoveToWishlist} handleRemoveFromCart={handleRemoveFromCart} handleUpdateQuantity={handleUpdateQuantity} onUpdated={() => refreshCart()} />
                                ))}
                            </div>

                            {/* RIGHT COLUMN: Summary */}
                            <div className="lg:col-span-5">
                                <div className="lg:sticky lg:top-32 space-y-6">
                                    {/* Order Summary */}
                                    <div id="countinue-btn-block" className="bg-white p-6 md:p-8 border border-[#ECECEC] rounded-none">
                                        <h2 className="font-sans text-[18px] font-semibold uppercase mb-8">ORDER SUMMARY</h2>

                                        <div className="space-y-2 mb-8">
                                            <div className="flex justify-between text-base">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="font-medium text-gray-500">{formatPrice(itemsSubtotal)}</span>
                                            </div>
                                            {appliedCoupon && discount > 0 && (
                                                <div className="flex justify-between text-base text-emerald-700 font-medium">
                                                    <span>Coupon Discount ({appliedCoupon.code})</span>
                                                    <span>-{formatPrice(discount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-base">
                                                <span className="text-gray-500">Shipping Charges</span>
                                                <span className="text-gray-500">Free</span>
                                            </div>
                                            <div className="flex justify-between text-base">
                                                <span className="text-gray-500">{isIndia ? `GST (${cartTaxRate !== null ? (cartTaxRate * 100) : 3}%)` : taxRowLabel(country)}</span>
                                                <span className="font-medium text-gray-500">{formatPrice(tax)}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 mb-8 border-t border-gray-300">
                                            <span className="text-[16px] font-bold">Total <span className="text-[11px] font-normal text-gray-400">({isIndia ? `Inclusive ${cartTaxRate !== null ? (cartTaxRate * 100) : 3}% GST` : taxInline(country)})</span></span>
                                            <span className="text-[20px] font-bold">{formatPrice(grandTotal)}</span>
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={() => router.push('/all')}
                                                className="w-full py-3.5 border border-[#B57A5A] text-[#B57A5A] text-[12px] uppercase tracking-[2px] font-bold hover:bg-[#B57A5A]/5 transition-colors rounded-none"
                                            >
                                                CONTINUE SHOPPING
                                            </button>
                                            <button
                                                onClick={handleCheckout}
                                                className="w-full py-3.5 bg-[#B57A5A] text-white text-[12px] uppercase tracking-[2px] font-bold hover:bg-[#9D6A4B] transition-colors rounded-none"
                                            >
                                                PROCEED TO CHECKOUT
                                            </button>
                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div className="bg-white border border-[#ECECEC] rounded-none">
                                        <button
                                            onClick={() => setIsPromoOpen(!isPromoOpen)}
                                            className="w-full p-6 flex justify-between items-center text-[13px] font-bold uppercase "
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                                                    <path d="M20 12V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V12z" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="text-base dm-sans">ENTER A GIFT CARD OR PROMO CODE</span>
                                            </div>
                                            <svg
                                                className={`transition-transform duration-300 flex-shrink-0 ml-2 ${isPromoOpen ? 'rotate-180' : ''}`}
                                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            >
                                                <path d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isPromoOpen && (
                                            <div className="p-6 pt-0 space-y-6">
                                                {appliedCoupon ? (
                                                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Coupon Applied</span>
                                                            <span className="text-[15px] font-serif font-bold text-emerald-950">{appliedCoupon.code}</span>
                                                            {discount > 0 && (
                                                                <span className="text-[12px] text-emerald-700 mt-0.5 font-medium">
                                                                    Saving {formatPrice(discount)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={handleRemoveCoupon}
                                                            className="text-[11px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wider"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <input
                                                                type="text"
                                                                value={promoCode}
                                                                onChange={(e) => {
                                                                    setPromoCode(e.target.value);
                                                                    if (couponError) setCouponError('');
                                                                }}
                                                                placeholder="Promo Code"
                                                                className="w-full sm:flex-1 bg-white border border-gray-200 px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#B57A5A] rounded-none"
                                                            />
                                                            <button
                                                                onClick={() => handleApplyCoupon()}
                                                                className="w-full sm:w-auto bg-[#B57A5A] text-white px-8 py-2.5 text-[12px] font-bold uppercase tracking-widest hover:bg-[#9D6A4B] transition-colors rounded-none"
                                                            >
                                                                APPLY
                                                            </button>
                                                        </div>
                                                        {couponError && (
                                                            <p className="text-[12px] text-red-500 font-sans mt-1">{couponError}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {isLoadingCoupons ? (
                                                    <div className="flex items-center justify-center py-4 text-gray-500 text-[12px]">
                                                        Loading applicable coupons...
                                                    </div>
                                                ) : coupons.length > 0 ? (
                                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                                        <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Available Coupons</h3>
                                                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                                            {coupons.map((coupon) => {
                                                                const isAlreadyApplied = appliedCoupon?.code === coupon.code;
                                                                const minSpend = coupon.priceRange?.from || 0;
                                                                const isEligible = itemsSubtotal >= minSpend;

                                                                return (
                                                                    <div
                                                                        key={coupon._id || coupon.id}
                                                                        className={`p-4 border rounded bg-white transition-all flex flex-col justify-between sm:flex-row sm:items-center gap-4 ${isAlreadyApplied
                                                                            ? 'border-emerald-300 bg-emerald-50/30'
                                                                            : isEligible
                                                                                ? 'border-gray-200 hover:border-gray-300'
                                                                                : 'border-gray-100 opacity-60'
                                                                            }`}
                                                                    >
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="inline-block bg-gray-50 border border-dashed border-[#ECECEC] px-2.5 py-1 text-[12px] font-mono font-bold text-[#B57A5A] rounded-none uppercase tracking-wider">
                                                                                    {coupon.code}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[13px] font-bold text-gray-900 leading-tight">
                                                                                {coupon.name}
                                                                            </p>
                                                                            {coupon.description && (
                                                                                <p className="text-[12px] text-gray-500 leading-snug">
                                                                                    {coupon.description}
                                                                                </p>
                                                                            )}
                                                                            {minSpend > 0 && (
                                                                                <p className="text-[11px] text-gray-400 font-sans">
                                                                                    Min purchase: {formatPrice(minSpend)}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-shrink-0">
                                                                            {isAlreadyApplied ? (
                                                                                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                                                                                    Applied
                                                                                </span>
                                                                            ) : isEligible ? (
                                                                                <button
                                                                                    onClick={() => handleApplyCoupon(coupon.code)}
                                                                                    className="text-[11px] font-bold text-[#B57A5A] hover:text-[#9D6A4B] uppercase tracking-wider border border-[#B57A5A] hover:bg-[#B57A5A]/5 px-3 py-1.5 transition-all rounded-none"
                                                                                >
                                                                                    Apply
                                                                                </button>
                                                                            ) : (
                                                                                <span className="text-[11px] font-semibold text-gray-400 font-sans" title={`Requires minimum purchase of ${formatPrice(minSpend)}`}>
                                                                                    Locked
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="bg-white border border-[#ECECEC] p-6 md:p-8 space-y-6 rounded-none">
                                        <h2 className="text-[18px] dm-sans font-bold uppercase tracking-widest mb-4">SHIPPING INFO</h2>
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <rect x="1" y="3" width="15" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
                                                    <circle cx="5.5" cy="18.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <circle cx="18.5" cy="18.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="text-[13px] dm-sans  leading-relaxed">
                                                <p className="dm-sans text-base">Complimentary insured shipping on every order.</p>
                                                <p className="dm-sans text-base">Every piece is crafted with care, thoroughly inspected, and securely packaged before dispatch.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <p className="text-[13px] dm-sans text-base">
                                                Questions about your order?<br />
                                                Our customer care team is available to assist you with delivery timelines, shipping updates, and special requests.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState icon={ShoppingBag} />
                )}
            </div>
            {itemsToShow.length > 0 && (
                <CartStickyBar
                    total={grandTotal}
                    onCheckout={handleCheckout}
                    isVisible={isVisible}
                />
            )}
        </div>
    );
}