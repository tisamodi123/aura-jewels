'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGlobleStore } from '@/store/globleStore';
import { CartItem } from '@/types';
import { ChevronRight, Check } from 'lucide-react';
import Select from 'react-select';
import { errorMsg, warningMsg } from '@/lib/toast';
import { formatPrice, getOfferDiscountLabel } from '@/lib/priceUtils';
import { getCheckout } from '@/services/cartService';
import { getProfile } from '@/services/profileService';
import { getCookie, getToken, deleteCookie, setCookie, getUserData } from '@/services/clientCookies';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { placeOrder, verifyPayment, getMyOrders } from '@/services/orderService';
import { loadRazorpayScript } from '@/lib/razorpay';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getCountries } from '@/services/countryService';
import { STATUS_CODE } from '@/lib/constants';
import { getCart } from '@/lib/commonApi';
import { computeTax, taxRowLabel, withTax, isIndiaCountry } from '@/lib/taxUtils';
import { resolveDiamondOrigin } from '@/lib/diamondOrigin';
import { getWallet } from '@/services/walletService';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';
import { sanitizeNameInput } from '@/lib/validation-schema';
import { IdentityConflictModal } from './IdentityConflictModal';
import { trackInitiateCheckout, trackPurchaseOnBrowser, trackAddPaymentInfo, getNormalizedUserData } from '@/services/trackingService';

type AddressData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    address: string;
};

const initialAddress: AddressData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'in',
    state: '',
    city: '',
    zipCode: '',
    address: '',
};

const customSelectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        borderRadius: '0',
        border: state.isFocused ? '1px solid #A96D56' : '1px solid #E5E7EB',
        minHeight: '46px',
        fontSize: '13px',
        fontFamily: 'var(--font-jakarta)',
        boxShadow: 'none',
        backgroundColor: state.isDisabled ? '#F3F4F6' : 'white',
        cursor: state.isDisabled ? 'not-allowed' : 'default',
        '&:hover': {
            borderColor: state.isDisabled ? '#E5E7EB' : '#A96D56'
        }
    }),
    valueContainer: (base: any) => ({
        ...base,
        padding: '2px 12px',
    }),
    option: (base: any, state: any) => ({
        ...base,
        fontSize: '13px',
        fontFamily: 'var(--font-jakarta)',
        backgroundColor: state.isSelected ? '#A96D56' : state.isFocused ? '#F3F4F6' : 'white',
        color: state.isSelected ? 'white' : 'black',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        padding: '10px 12px',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#A96D56'
        }
    }),
    placeholder: (base: any) => ({
        ...base,
        color: '#9CA3AF',
    }),
    singleValue: (base: any, state: any) => ({
        ...base,
        color: state.isDisabled ? '#9CA3AF' : '#111827',
        fontFamily: 'var(--font-jakarta)',
        fontSize: '13px',
    })
};

// Dummy items for the demo as requested

export const CheckoutCartItem: React.FC<any> = ({ item }) => {
    const router = useRouter();
    const { currencySymbol, country } = useGlobleStore()

    const availableSizes = item.RingSizes || [];

    const centerStones = item.stoneDetails?.filter((s: any) => s.type?.toUpperCase() === 'CENTER') || [];

    const CenterStones = centerStones.length > 0
        ? centerStones.map((s: any) => s.shape?.name || s.shape?.[0]?.name || s.shape || "").filter(Boolean).join(' - ')
        : (item.stoneDetails?.[0]?.shape?.name || item.stoneDetails?.[0]?.shape?.[0]?.name);

    const offerDetails = item.offerDetails || null;
    const rawDiscounted = offerDetails?.discountedPrice ?? offerDetails?.discountedValue ?? item.discountedPrice ?? item.price;
    const discountedPrice = rawDiscounted ?? 0;
    const rawMRP = offerDetails?.mrp || offerDetails?.totalOriginalPrice || (offerDetails?.discountAmount && rawDiscounted != null ? (rawDiscounted + offerDetails.discountAmount) : (item.originalPrice || item.price || 0));
    const originalPrice = rawMRP;
    const hasOffer = !!(offerDetails?.offer?._id || offerDetails?.offer?.code) || (originalPrice > discountedPrice);
    const displayCurrentPrice = (hasOffer && (discountedPrice <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= originalPrice))) ? 0 : discountedPrice;
    const offerDiscountLabel = getOfferDiscountLabel(offerDetails);
    const diamondOrigin = resolveDiamondOrigin(item);
    const engravingTxt = item.engravingText || item.engraving_text || item.productDetails?.engravingText || item.JeweleryDetail?.[0]?.engravingText;
    const isEngraved = item.engraving === 1 || item.engraving === '1' || item.engraving === true || item.isEngraving === 1 || Boolean(engravingTxt);

    return (
        <div className="flex flex-col sm:flex-row items-stretch bg-white overflow-hidden pb-4 border-b border-gray-100 last:border-0 last:pb-0">

            <div className="w-full sm:w-[200px] md:w-[240px] lg:w-[160px] bg-[#F9F9F9] border border-gray-200 relative flex items-center justify-center">
                <div className="relative w-full aspect-square sm:h-full">
                    <Image
                        className="object-cover grayscale-[5%] hover:grayscale-0 transition-all duration-700 hover:scale-105 cursor-pointer mix-blend-multiply"
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 150px"
                        onClick={() => router.push(`/product/${item.slug}`)}
                    />
                </div>
            </div>

            <div className="flex-1 py-2 md:px-6 flex flex-col justify-between bg-white min-w-0">
                <div className="space-y-2">
                    <h3
                        className="text-[15px] sm:text-[16px] text-gray-900 font-bold hover:text-[#A96D56] cursor-pointer transition-colors duration-300"
                        onClick={() => router.push(`/product/${item.slug}`)}
                    >
                        {item.name}
                    </h3>
                    <div className="flex items-center justify-between gap-4 pt-0.5 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-[#A96D56] font-bold text-normal">
                                {formatPrice(withTax(displayCurrentPrice, country))}
                            </span>
                            {hasOffer && (
                                <>
                                    <span className="text-xs text-gray-400 line-through">
                                        {formatPrice(withTax(originalPrice, country))}
                                    </span>
                                    {offerDiscountLabel && (
                                        <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1 py-0.5 rounded font-medium">
                                            {offerDiscountLabel}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-xs tracking-[0.2px]">
                        <div><span className="font-bold text-gray-900">SKU :</span> <span className="text-gray-500 font-medium">{item.ref}</span></div>
                        <div><span className="font-bold text-gray-900">Color :</span> <span className="text-gray-500 font-medium">{item.metal?.type}</span></div>
                        {item.hasSize && (item?.size || item?.sizeDetails?.name || availableSizes.length > 0) && (
                            <div><span className="font-bold text-gray-900">{item.sizeLabel || "Ring Size"} :</span> <span className="text-gray-500 font-medium">{item?.size || item?.sizeDetails?.name || '—'}</span></div>
                        )}
                        <div><span className="font-bold text-gray-900">Metal :</span> <span className="text-gray-500 font-medium">{item.metal?.stamp}</span></div>
                        <div><span className="font-bold text-gray-900">Shape :</span> <span className="text-gray-500 font-medium">{CenterStones}</span></div>
                        {diamondOrigin && <div><span className="font-bold text-gray-900">Diamond :</span> <span className="text-gray-500 font-medium">{diamondOrigin}</span></div>}
                        <div><span className="font-bold text-gray-900">Weight (apx) :</span> <span className="text-gray-500 font-medium">{item.metalWeight}</span></div>
                        <div><span className="font-bold text-gray-900">Qty :</span> <span className="text-gray-500 font-medium">{item.qty || item.quantity || 1}</span></div>
                        {isEngraved && engravingTxt && (
                            <div className="col-span-2 sm:col-span-3">
                                <span className="font-bold text-gray-900">Engraving :</span> <span className="text-[#A96D56] font-semibold italic">"{engravingTxt}"</span>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
};

const ENABLE_SAVED_ADDRESSES = true;

// Poll the customer's orders until THIS order flips to paid (i.e. the server
// webhook has confirmed the capture) or the attempts are exhausted. Returns the
// paid order, or null if it never confirmed / explicitly failed.
const pollOrderPaid = async (orderId: string, tok?: string, tries = 6, delayMs = 2500): Promise<any | null> => {
    for (let i = 0; i < tries; i++) {
        await new Promise((r) => setTimeout(r, delayMs));
        try {
            const res: any = await getMyOrders(tok);
            const list: any[] = res?.data || res?.orders || [];
            const ord = Array.isArray(list) ? list.find((o: any) => String(o._id) === String(orderId)) : null;
            if (ord?.paymentStatus === 'paid') return ord;
            if (ord?.paymentStatus === 'failed') return null;
        } catch {
            // transient — keep polling
        }
    }
    return null;
};

const CheckOut = () => {
    const router = useRouter();
    const { cart, checkout, currencySymbol, currency, exchangeRate, country, couponCode, setCouponCode } = useGlobleStore();
    const defaultUser = getUserData();
    const isIndiaOrigin = String(country || '').toUpperCase() === String(DEFAULT_COUNTRY || 'IN').toUpperCase();
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const clearCart = checkout;
    const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
    const [placedOrder, setPlacedOrder] = useState<any>(null);
    const [formData, setFormData] = useState({
        shipping: { ...initialAddress },
        billing: { ...initialAddress },
        message: '',
        sameAddress: true,
        isGst: false,
        gstNo: '',
        companyName: ''
    });
    const [isClient, setIsClient] = useState(false);
    const [isButtonsVisible, setIsButtonsVisible] = useState(false);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const [profile, setProfile] = useState<any>(null);
    const [useSavedAddress, setUseSavedAddress] = useState(true);
    const [couponInfo, setCouponInfo] = useState<{ code?: string; discountAmount: number } | null>(null);
    // Server's PRE-TAX, post-coupon net, and the GST it computed on that net.
    const [netTotal, setNetTotal] = useState<number | null>(null);
    const [serverTax, setServerTax] = useState<number | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [applyWallet, setApplyWallet] = useState<boolean>(false);
    const [selectedAddrIdx, setSelectedAddrIdx] = useState<number | null>(null);
    const [agreePolicies, setAgreePolicies] = useState<boolean>(false);
    const [identityConflict, setIdentityConflict] = useState<{
        show: boolean;
        title: string;
        message: string;
        emailAccount?: { email?: string; phone?: string } | null;
        phoneAccount?: { phone?: string; email?: string } | null;
    }>({ show: false, title: '', message: '', emailAccount: null, phoneAccount: null });

    console.log("defaultUser ------->", defaultUser)

    // Load the customer's store-wallet balance so it can be applied at checkout.
    useEffect(() => {
        (async () => {
            try {
                const w = await getWallet();
                if (w && (w.errorCode === STATUS_CODE.OK || w.status === STATUS_CODE.OK)) {
                    setWalletBalance(Number(w.data?.balance) || 0);
                }
            } catch (e) {
                console.error('wallet fetch (checkout) error:', e);
            }
        })();
    }, []);


    useEffect(() => {
        setIsClient(true);
        const u = getUserData();
        if (u) {
            setFormData(prev => {
                let defaultPhone = '';
                if (u.phone) {
                    const countryCodeStr = (u.phoneCountryCode || '').replace('+', '');
                    const phoneStr = u.phone.toString();
                    if (countryCodeStr && phoneStr.startsWith(countryCodeStr)) {
                        defaultPhone = phoneStr;
                    } else {
                        defaultPhone = `${countryCodeStr}${phoneStr}`;
                    }
                }
                return {
                    ...prev,
                    shipping: {
                        ...prev.shipping,
                        firstName: prev.shipping.firstName || u.name?.split(' ')[0] || '',
                        lastName: prev.shipping.lastName || u.name?.split(' ').slice(1).join(' ') || '',
                        email: prev.shipping.email || u.email || '',
                        phone: prev.shipping.phone || defaultPhone,
                    }
                };
            });
        }
    }, []);

    useEffect(() => {
        if (!ENABLE_SAVED_ADDRESSES) return;
        const fetchProfile = async () => {
            try {
                const token = getToken();
                if (token) {
                    const res = await getProfile(token);
                    if (res?.user) {
                        setProfile(res.user);
                        setFormData(prev => {
                            let profilePhone = '';
                            if (res.user.phone) {
                                const countryCodeStr = (res.user.phoneCountryCode || '').replace('+', '');
                                const phoneStr = res.user.phone.toString();
                                if (countryCodeStr && phoneStr.startsWith(countryCodeStr)) {
                                    profilePhone = phoneStr;
                                } else {
                                    profilePhone = `${countryCodeStr}${phoneStr}`;
                                }
                            }
                            return {
                                ...prev,
                                shipping: {
                                    ...prev.shipping,
                                    firstName: prev.shipping.firstName || res.user.name?.split(' ')[0] || '',
                                    lastName: prev.shipping.lastName || res.user.name?.split(' ').slice(1).join(' ') || '',
                                    email: prev.shipping.email || res.user.email || '',
                                    phone: prev.shipping.phone || profilePhone,
                                }
                            };
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching profile on checkout:", err);
            }
        };
        fetchProfile();
    }, []);

    const handleToggleSavedAddress = (val: boolean) => {
        setUseSavedAddress(val);
        if (!val) {
            setFormData(prev => ({
                ...prev,
                shipping: {
                    ...prev.shipping,
                    address: '',
                    country: 'in',
                    state: '',
                    city: '',
                    zipCode: '',
                }
            }));
        }
    };

    const handleSelectSavedAddress = (addr: any) => {
        const matchedCountry = countriesList.find(
            (c: any) =>
                c.name?.toLowerCase() === (addr.country || '').toLowerCase() ||
                c.code?.toLowerCase() === (addr.country || '').toLowerCase()
        );
        const countryCode = matchedCountry ? matchedCountry.code.toLowerCase() : (addr.country || 'in').toLowerCase();

        setFormData(prev => ({
            ...prev,
            shipping: {
                firstName: addr.firstName || '',
                lastName: addr.lastName || '',
                email: addr.email || '',
                phone: addr.phone || '',
                address: addr.address || '',
                country: isIndiaOrigin ? 'in' : countryCode,
                state: addr.state || '',
                city: addr.city || '',
                zipCode: addr.pincode || '',
            }
        }));
    };

    // Merge real cart with dummy items for this demo
    // const displayItems: CartItem[] = isClient && cart.length > 0 ? cart : [];

    // For demo fallback:
    const itemsToShow = isClient && cart.length > 0 ? cart : [];

    const [checkoutData, setCheckoutData] = useState<any>(null);
    const [countriesList, setCountriesList] = useState<any[]>([]);


    useEffect(() => {
        const fetchCountries = async () => {
            const res = await getCountries();
            if (res && res.data) {
                setCountriesList(res.data);
            }
        };
        fetchCountries();
    }, []);

    const countries = countriesList.map(c => ({
        value: c.code.toLowerCase(),
        label: <div className="flex items-center gap-2">{c.flag ? <img src={c.flag} alt={c.name} className="w-5 h-3 object-cover" /> : null}<span>{c.name}</span></div>,
        code: c.code.toLowerCase(),
        dialCode: c.faxNo || ''
    }));


    useEffect(() => {
        const activeCoupon = useGlobleStore.getState().couponCode;
        if (!activeCoupon) {
            deleteCookie('coupon_code');
            console.log("111111111111111111111")
        } else {
            setCookie('coupon_code', activeCoupon);
            console.log("222222222222222222222", activeCoupon)
        }

        const fetchCheckoutData = async () => {
            try {
                const token = getToken();

                // Fetch WITH the applied coupon so the summary + totals reflect it.
                const response = await getCart(activeCoupon || undefined);

                console.log("check out data========= : ", response);

                if (response) {
                    if (response?.data) {
                        setCheckoutData(response.data);
                    }
                    if (typeof response?.total === 'number') setNetTotal(response.total);
                    if (typeof response?.tax === 'number') setServerTax(response.tax);
                    setCouponInfo(response?.coupon
                        ? { code: response.coupon.code, discountAmount: response.coupon.discountAmount || 0 }
                        : null);
                }
            } catch (error) {
                console.error("Error fetching checkout data:", error);
            }
        };
        fetchCheckoutData();

        return () => {
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/checkout')) {
                deleteCookie('coupon_code');
                useGlobleStore.getState().setCouponCode('');
            }
        };
    }, []);

    const discount = couponInfo?.discountAmount || 0;
    const itemsSum = itemsToShow.reduce((sum, item) => sum + (item.totalItemPrice || (item.setting_price || item.settingprice || item.price || 0) * (item.quantity || item.qty || 1)), 0);
    // Pre-discount subtotal — reconstruct from the server net when a coupon applies.
    const subtotal = netTotal != null ? parseFloat((netTotal + discount).toFixed(2)) : itemsSum;
    const shipping = checkoutData?.shippingCharge ?? 0;

    // Post-coupon net, BEFORE tax.
    const net = netTotal != null ? netTotal : Math.max(0, subtotal + shipping - discount);
    // GST is ADDED on top of the net. Prefer the server's figure (authoritative);
    // compute locally only until it responds.
    const taxes = serverTax != null ? serverTax : computeTax(net, country);
    // Gross payable. The wallet is a payment method, so it is applied AFTER tax
    // against this gross — matching how the server derives amountDue.
    const total = parseFloat((net + taxes).toFixed(2));

    // Store-wallet applied at checkout — capped at the order total (server
    // re-clamps to the live balance). `payable` is what the customer owes after
    // wallet is applied.
    const walletApplied = applyWallet ? parseFloat(Math.min(walletBalance, total).toFixed(2)) : 0;
    const payable = parseFloat(Math.max(0, total - walletApplied).toFixed(2));

    // Fully-inclusive presentation (India): the summary rows are shown GROSSED-UP
    // so they visibly sum to the tax-inclusive Total. The discount row is DERIVED
    // (inclusive subtotal - total) so rounding can never leave the rows off by a
    // rupee. DISPLAY ONLY - the server's net/tax/amountDue stay authoritative.
    const isIndiaSummary = isIndiaCountry(country);
    const inclSubtotal = isIndiaSummary ? withTax(subtotal, country) : subtotal;
    const inclDiscount = isIndiaSummary
        ? Math.max(0, parseFloat((inclSubtotal + shipping - total).toFixed(2)))
        : discount;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    // Track InitiateCheckout event
    // useEffect(() => {
    //     if (isClient && itemsToShow && itemsToShow.length > 0 && total > 0) {
    //         trackInitiateCheckout(itemsToShow, total, country === 'IN' ? 'INR' : 'USD');
    //     }
    // }, [isClient, itemsToShow?.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsButtonsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (buttonsRef.current) {
            observer.observe(buttonsRef.current);
        }

        return () => observer.disconnect();
    }, [isClient]);

    useEffect(() => {
        const checkSticky = () => {
            const isMobile = window.innerWidth < 1024;
            const stickyVisible = isMobile && !isButtonsVisible && step !== 'success';
            if (stickyVisible) {
                document.body.classList.add('has-sticky-bar');
            } else {
                document.body.classList.remove('has-sticky-bar');
            }
        };

        checkSticky();
        window.addEventListener('resize', checkSticky);
        return () => {
            window.removeEventListener('resize', checkSticky);
            document.body.classList.remove('has-sticky-bar');
        };
    }, [isButtonsVisible, step]);

    useEffect(() => {
        if (isClient && itemsToShow.length === 0 && step !== 'success') {
            router.push('/cart');
        }
    }, [isClient, itemsToShow, step, router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        section?: 'shipping' | 'billing'
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        let val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        if (typeof val === 'string' && (name === 'firstName' || name === 'lastName')) {
            val = sanitizeNameInput(val);
        }

        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: val }
            }));
            if (section === 'shipping') {
                setSelectedAddrIdx(null);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleInputBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        section?: 'shipping' | 'billing'
    ) => {
        const { name, value } = e.target;
        if (typeof value === 'string' && (name === 'firstName' || name === 'lastName')) {
            const trimmed = value.trim();
            if (section) {
                setFormData(prev => ({
                    ...prev,
                    [section]: { ...prev[section], [name]: trimmed }
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: trimmed }));
            }
        }
    };

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreePolicies) {
            errorMsg("Please agree to the Terms & Conditions and Privacy Policy to place your order");
            return;
        }

        const validateSection = (section: 'shipping' | 'billing') => {
            const data = formData[section];
            const sectionName = section === 'shipping' ? 'Shipping' : 'Billing';

            if (!data.firstName.trim()) { errorMsg(`${sectionName}: First name is required`); return false; }
            if (!data.lastName.trim()) { errorMsg(`${sectionName}: Last name is required`); return false; }
            if (!data.email.trim()) { errorMsg(`${sectionName}: Email is required`); return false; }
            if (!data.phone.trim() || data.phone.length < 5) { errorMsg(`${sectionName}: Phone number is required`); return false; }
            if (!data.address.trim()) { errorMsg(`${sectionName}: Address is required`); return false; }
            if (!data.country) { errorMsg(`${sectionName}: Country is required`); return false; }
            if (!data.state.trim()) { errorMsg(`${sectionName}: State is required`); return false; }
            if (!data.city.trim()) { errorMsg(`${sectionName}: City is required`); return false; }
            if (!data.zipCode.trim()) { errorMsg(`${sectionName}: Zip code is required`); return false; }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errorMsg(`${sectionName}: Please enter a valid email address`);
                return false;
            }

            // Phone digits check (Expect exactly 10 digits as +91 is handled separately)
            const phoneDigits = data.phone.replace(/\D/g, '');
            if (phoneDigits.length < 7) {
                errorMsg(`${sectionName}: Please enter a valid mobile number`);
                return false;
            }

            return true;
        };

        if (!validateSection('shipping')) return;
        if (!formData.sameAddress && !validateSection('billing')) return;

        if (formData.isGst) {
            if (!formData.gstNo.trim()) {
                errorMsg("GST Details: GST Number is required");
                return;
            }
            if (!formData.companyName.trim()) {
                errorMsg("GST Details: Company Name is required");
                return;
            }
            if (formData.gstNo.trim().length < 5) {
                errorMsg("GST Details: Please enter a valid GST Number");
                return;
            }
        }

        handlePlaceOrder();
    };

    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const token = getToken();

            // Track AddPaymentInfo (fires when all form validations pass)
            // try {
            //     trackAddPaymentInfo({
            //         value: total,
            //         currency: country === 'IN' ? 'INR' : 'USD'
            //     });
            // } catch (trackErr) {
            //     console.error('[Tracking] AddPaymentInfo trigger error:', trackErr);
            // }

            const orderNotes = formData.message?.trim() || undefined;
            const payload = {
                items: itemsToShow,
                shippingAddress: {
                    ...formData.shipping,
                    ...(formData.isGst ? { gstNo: formData.gstNo.trim(), companyName: formData.companyName.trim() } : {})
                },
                billingAddress: formData.sameAddress
                    ? {
                        ...formData.shipping,
                        ...(formData.isGst ? { gstNo: formData.gstNo.trim(), companyName: formData.companyName.trim() } : {})
                    }
                    : {
                        ...formData.billing,
                        ...(formData.isGst ? { gstNo: formData.gstNo.trim(), companyName: formData.companyName.trim() } : {})
                    },
                hasBilling: !formData.sameAddress,
                // Server re-validates + applies this; displayCurrency/exchangeRate
                // are ignored server-side (derived from the session).
                couponCode: couponCode || undefined,
                // Wallet amount to apply (INR). Server re-clamps to live balance.
                walletAmount: walletApplied > 0 ? walletApplied : undefined,
                // orderComment: orderNotes,
                // orderNotes: orderNotes,
                notes: orderNotes,
                // message: orderNotes,
                gstNo: formData.isGst ? formData.gstNo.trim() : undefined,
                companyName: formData.isGst ? formData.companyName.trim() : undefined,
                isGst: formData.isGst,
            };
            console.log("Place Order Payload:", payload);

            const response = await placeOrder(payload, token);

            const ok = response?.status === 200 || response?.status === 201 || response?.success || response?.errorCode === STATUS_CODE.OK;
            if (!ok) {
                const identityStatus = response?.data?.identityStatus || response?.identityStatus;

                if (identityStatus) {
                    const emailAccount = response?.data?.emailAccount || response?.emailAccount || null;
                    const phoneAccount = response?.data?.phoneAccount || response?.phoneAccount || null;
                    if (identityStatus === 'EMAIL_EXISTS_PHONE_MISMATCH') {
                        setIdentityConflict({
                            show: true,
                            title: 'Details Mismatched',
                            message: 'The details you entered match existing accounts with different combinations. Please review:',
                            emailAccount,
                            phoneAccount
                        });
                        setLoading(false);
                        return;
                    } else if (identityStatus === 'PHONE_EXISTS_EMAIL_MISMATCH') {
                        setIdentityConflict({
                            show: true,
                            title: 'Details Mismatched',
                            message: 'The details you entered match existing accounts with different combinations. Please review:',
                            emailAccount,
                            phoneAccount
                        });
                        setLoading(false);
                        return;
                    } else if (identityStatus === 'EMAIL_PHONE_DIFFERENT_USERS') {
                        setIdentityConflict({
                            show: true,
                            title: 'Details Mismatched',
                            message: 'The details you entered match existing accounts with different combinations. Please review:',
                            emailAccount,
                            phoneAccount
                        });
                        setLoading(false);
                        return;
                    }
                }
                errorMsg(response?.message || "Unable to place order");
                setLoading(false);
                return;
            }
            console.log("response=>", response)
            const order = response?.data?.order || response?.data;
            const pd = response?.data?.paymentDetails || {};
            setPlacedOrder(order);

            const finishSuccess = (ord?: any) => {
                setStep("success");
                const targetOrder = ord || order;
                const targetId = targetOrder?._id || targetOrder?.orderId || order?._id || order?.orderId;
                if (targetOrder) {
                    setPlacedOrder(targetOrder);
                    if (typeof window !== 'undefined') {
                        try {
                            localStorage.setItem('last_placed_order', JSON.stringify(targetOrder));
                        } catch (err) {
                            console.error('Failed to cache last_placed_order:', err);
                        }
                    }
                    // trackPurchaseOnBrowser({
                    //     orderId: targetOrder.orderId || targetOrder._id,
                    //     items: targetOrder.items || itemsToShow,
                    //     total: targetOrder.total || total,
                    //     currency: targetOrder.displayCurrency || targetOrder.currency || (country === 'IN' ? 'INR' : 'USD')
                    // });
                }
                clearCart();
                deleteCookie('Aura Jewels-cart');
                deleteCookie('coupon_code');
                setCouponCode('');
                if (targetId) {
                    router.push(`/thank-you/${targetId}`);
                } else {
                    router.push('/my-account/my-order');
                }
            };

            // Fully covered by store wallet — already confirmed server-side.
            if (pd?.paid || pd?.paymentGateway === 'wallet') {
                finishSuccess(order);
                return;
            }

            // Staging dummy gateway — confirm with a success status.
            if (pd?.isDummy || pd?.paymentGateway === 'dummy') {
                const vr = await verifyPayment(order._id, { status: 'success', gateway: 'dummy', isDummy: true }, token);
                finishSuccess(vr?.data || order);
                return;
            }

            // Razorpay — open the checkout modal for the amount due.
            if (pd?.paymentGateway === 'razorpay' && pd?.gatewayOrderId) {
                const loaded = await loadRazorpayScript();
                if (!loaded || typeof window === 'undefined' || !window.Razorpay) {
                    errorMsg('Could not load the payment window. Please try again.');
                    return;
                }
                const ship: any = formData.shipping || {};
                const rzp = new window.Razorpay({
                    key: pd.keyId,
                    order_id: pd.gatewayOrderId,
                    amount: pd.amountPaise,
                    currency: pd.currency || 'INR',
                    name: 'Aura Jewels',
                    description: `Order ${order?.orderId || ''}`.trim(),
                    prefill: {
                        name: `${ship.firstName || ''} ${ship.lastName || ''}`.trim(),
                        email: ship.email || '',
                        contact: ship.mobileNumber || ship.phone || '',
                    },
                    theme: { color: '#A96D56' },
                    handler: async (resp: any) => {
                        // Razorpay reports success on the client, but the AUTHORITATIVE
                        // confirmation is the server webhook (payment.captured). The
                        // client verify is only a fast-path and can be inconclusive
                        // (esp. cards/3DS that race the webhook). So: try verify, and
                        // if it isn't conclusively 'paid', POLL the order a few times
                        // before deciding — never hard-fail a payment the webhook is
                        // about to confirm.
                        try {
                            const vr = await verifyPayment(order._id, {
                                razorpay_order_id: resp.razorpay_order_id,
                                razorpay_payment_id: resp.razorpay_payment_id,
                                razorpay_signature: resp.razorpay_signature,
                            }, token);
                            const vok = vr?.errorCode === STATUS_CODE.OK || vr?.status === 200 || vr?.success;
                            if (vok && vr?.data?.paymentStatus === 'paid') {
                                finishSuccess(vr?.data || order);
                                return;
                            }
                        } catch (e: any) {
                            // fall through to polling — the charge may still be good
                        }
                        warningMsg('Confirming your payment…');
                        const paid = await pollOrderPaid(order._id, token);
                        if (paid) {
                            finishSuccess(paid);
                        } else {
                            errorMsg('We could not confirm your payment yet. If money was debited it will be confirmed shortly — please check your orders in a few minutes.');
                            router.push('/my-account/my-order');
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            // deleteCookie('coupon_code');
                            // setCouponCode('');
                            errorMsg('Payment cancelled. Your order is saved as pending — you can retry from your account.');
                        },
                    },
                });
                rzp.on('payment.failed', async (resp: any) => {
                    // deleteCookie('coupon_code');
                    // setCouponCode('');
                    try {
                        await verifyPayment(order._id, { status: 'failed', razorpay_order_id: pd.gatewayOrderId }, token);
                    } catch { /* ignore */ }
                    errorMsg('Payment failed. Please try again.');
                });
                rzp.open();
                return;
            }

            // Unknown / no gateway — treat as placed.
            finishSuccess(order);
        } catch (error: any) {
            console.error("Place Order Error:", error);
            errorMsg(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = () => {
        setStep('success');
        clearCart();
        deleteCookie('Aura Jewels-cart');
        deleteCookie('coupon_code');
        setCouponCode('');
    };

    const renderAddressFields = (section: 'shipping' | 'billing', title: string) => {
        const data = formData[section];
        return (
            <div className="space-y-6 pt-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 font-jakarta border-b border-gray-50 pb-2">{title}</h3>

                {ENABLE_SAVED_ADDRESSES && section === 'shipping' && profile?.addresses?.length > 0 && (
                    <div className="space-y-2 pb-4 border-b border-gray-100 transition-all duration-300">
                        <label className="text-[11px] font-black uppercase tracking-[0.1em] text-gray-400 font-jakarta">Select from Saved Addresses</label>
                        <Select
                            instanceId="saved-address-select"
                            options={profile.addresses.map((addr: any, idx: number) => ({
                                value: idx,
                                label: `${addr.address}, ${addr.city}, ${addr.state}, ${addr.country.toUpperCase()} (${addr.pincode})`
                            }))}
                            value={
                                selectedAddrIdx !== null && profile.addresses[selectedAddrIdx]
                                    ? {
                                        value: selectedAddrIdx,
                                        label: `${profile.addresses[selectedAddrIdx].address}, ${profile.addresses[selectedAddrIdx].city}, ${profile.addresses[selectedAddrIdx].state}, ${profile.addresses[selectedAddrIdx].country.toUpperCase()} (${profile.addresses[selectedAddrIdx].pincode})`
                                    }
                                    : null
                            }
                            onChange={(option: any) => {
                                if (option) {
                                    const idx = option.value;
                                    setSelectedAddrIdx(idx);
                                    handleSelectSavedAddress(profile.addresses[idx]);
                                } else {
                                    setSelectedAddrIdx(null);
                                }
                            }}
                            styles={customSelectStyles}
                            placeholder="-- Choose a saved address --"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        required
                        name="firstName"
                        value={data.firstName}
                        onChange={(e) => handleInputChange(e, section)}
                        onBlur={(e) => handleInputBlur(e, section)}
                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                        placeholder="Enter First Name*"
                    />
                    <input
                        required
                        name="lastName"
                        value={data.lastName}
                        onChange={(e) => handleInputChange(e, section)}
                        onBlur={(e) => handleInputBlur(e, section)}
                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                        placeholder="Enter Last Name*"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        required
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => handleInputChange(e, section)}
                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                        placeholder="Enter Email Id*"
                    />
                    <PhoneInput
                        country={isIndiaOrigin ? 'in' : (data.country || 'in')}
                        value={data.phone}
                        onChange={(phone) => {
                            const event = {
                                target: {
                                    name: 'phone',
                                    value: phone,
                                    type: 'tel'
                                }
                            } as any;
                            handleInputChange(event, section);
                        }}
                        disableDropdown={isIndiaOrigin}
                        countryCodeEditable={!isIndiaOrigin}
                        inputStyle={{
                            width: '100%',
                            height: '46px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0px',
                            fontFamily: 'var(--font-jakarta), sans-serif',
                            fontSize: '13px',
                        }}
                        buttonStyle={{
                            border: '1px solid #E5E7EB',
                            borderRight: 'none',
                            borderRadius: '0px',
                            background: '#F9FAFB',
                        }}
                        containerStyle={{
                            width: '100%',
                        }}
                        placeholder="Enter Mobile No*"
                    />
                </div>

                {/* address textarea */}
                <div className="space-y-1.5">
                    {/* <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 font-jakarta mb-2">Address</h3> */}
                    <textarea
                        name="address"
                        value={data.address}
                        onChange={(e) => handleInputChange(e, section)}
                        rows={4}
                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors resize-none"
                        placeholder="Enter Address*"
                    />
                </div>

                {/* city state */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <Select
                            instanceId={`country-select-${section}`}
                            options={countries}
                            value={countries.find(c => c.value === (isIndiaOrigin ? 'in' : data.country))}
                            onChange={(option: any) => {
                                const e = {
                                    target: {
                                        name: 'country',
                                        value: option.value,
                                        type: 'select'
                                    }
                                } as any;
                                handleInputChange(e, section);

                                // Automatically sync PhoneInput dial code on country change
                                const cleanDialCode = (option.dialCode || '').replace(/\+/g, '');
                                const phoneEvent = {
                                    target: {
                                        name: 'phone',
                                        value: cleanDialCode,
                                        type: 'tel'
                                    }
                                } as any;
                                handleInputChange(phoneEvent, section);
                            }}
                            styles={customSelectStyles}
                            placeholder="Select Country*"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isDisabled={isIndiaOrigin}
                        />
                    </div>
                    <input
                        required
                        name="state"
                        value={data.state}
                        onChange={(e) => handleInputChange(e, section)}
                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                        placeholder="Enter State/Province"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        required
                        name="city"
                        value={data.city}
                        onChange={(e) => handleInputChange(e, section)}
                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                        placeholder="Enter City"
                    />
                    <input
                        required
                        name="zipCode"
                        value={data.zipCode}
                        onChange={(e) => handleInputChange(e, section)}
                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                        placeholder="Enter Zip Code*"
                    />
                </div>
            </div>
        );
    };

    if (step === 'success') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-6 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-[#A96D56] rounded-full flex items-center justify-center mb-8 text-white shadow-xl">
                    <Check className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-6xl serif text-gray-900 mb-4">Order Confirmed</h1>
                <p className="text-gray-500 font-jakarta max-w-md mx-auto leading-relaxed mb-10">
                    Thank you for choosing Aura Jewels. Your brilliance is being prepared for its new home. You'll receive a confirmation email shortly.
                </p>
                <div className="bg-[#FDFBF7] border border-[#F5ECE0] p-6 rounded-sm mb-10 w-full max-w-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 font-jakarta">Order Number</p>
                    <p className="text-xl font-bold text-gray-900 font-jakarta">
                        {placedOrder?.orderId || (isClient ? `#ARN-${Math.floor(1000000 + Math.random() * 9000000)}` : '-------')}
                    </p>
                </div>
                <Link
                    href="/my-account/my-order"
                    className="px-12 py-4 bg-[#1A1A1A] text-white font-black uppercase tracking-[0.3em] text-[11px] font-jakarta hover:bg-[#A96D56] transition-all"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#FFFFFF] min-h-screen pb-32 md:pb-20 pt-6">
            <div className=" mx-auto px-4 md:px-6">
                <nav className="flex items-center space-x-2 text-[11px] font-jakarta uppercase tracking-widest text-gray-400 mb-8">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/cart" className="hover:text-black transition-colors">Cart</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-black font-bold">Checkout</span>
                </nav>

                <h1 className="text-3xl md:text-4xl serif text-gray-900 mb-5">
                    Checkout <span className="text-xl font-normal text-gray-400 ml-2">({itemsToShow.length} Items)</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                    <div className="space-y-12 md:col-span-5  order-1 lg:order-1 ">
                        <div className="border border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 font-jakarta mb-6">Address Details</h2>

                            <form id="checkout-form" onSubmit={handleShippingSubmit} className="space-y-8">
                                {renderAddressFields('shipping', 'Shipping Address')}

                                <div className="flex items-center space-x-3 pt-4 border-t border-gray-50">
                                    <input
                                        type="checkbox"
                                        name="sameAddress"
                                        checked={formData.sameAddress}
                                        onChange={(e) => handleInputChange(e)}
                                        id="sameAddress"
                                        className="w-5 h-5 border-gray-300 rounded text-[#A96D56] focus:ring-[#A96D56] cursor-pointer accent-[#A96D56]"
                                    />
                                    <label htmlFor="sameAddress" className="text-[12px] text-gray-600 font-jakarta font-bold cursor-pointer">
                                        My delivery and billing addresses are the same.
                                    </label>
                                </div>

                                {!formData.sameAddress && renderAddressFields('billing', 'Billing Address')}

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="isGst"
                                            checked={formData.isGst}
                                            onChange={(e) => handleInputChange(e)}
                                            id="isGst"
                                            className="w-5 h-5 border-gray-300 rounded text-[#A96D56] focus:ring-[#A96D56] cursor-pointer accent-[#A96D56]"
                                        />
                                        <label htmlFor="isGst" className="text-[12px] text-gray-600 font-jakarta font-bold cursor-pointer">
                                            I have a GST number / Need GST Invoice
                                        </label>
                                    </div>

                                    {formData.isGst && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-fadeIn transition-all duration-300">
                                            <input
                                                required
                                                name="gstNo"
                                                value={formData.gstNo}
                                                onChange={(e) => handleInputChange(e)}
                                                className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                                                placeholder="Enter GST Number*"
                                            />
                                            <input
                                                required
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={(e) => handleInputChange(e)}
                                                className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors"
                                                placeholder="Enter Company Name*"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 font-jakarta mb-2">Order Notes</h3>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={(e) => handleInputChange(e)}
                                        rows={4}
                                        className="w-full border border-gray-200 px-4 py-3 text-[13px] font-jakarta outline-none focus:border-[#A96D56] transition-colors resize-none"
                                        placeholder="Any special instructions for your delivery?"
                                    />
                                </div>

                                <div className="flex items-start space-x-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="agreePolicies"
                                        checked={agreePolicies}
                                        onChange={(e) => setAgreePolicies(e.target.checked)}
                                        className="mt-1 w-4 h-4 border-gray-300 rounded text-[#A96D56] focus:ring-[#A96D56] cursor-pointer accent-[#A96D56]"
                                    // required
                                    />
                                    <label htmlFor="agreePolicies" className="text-[12px] leading-relaxed text-gray-600 font-jakarta cursor-pointer">
                                        I agree to the{' '}
                                        <Link
                                            href="/policies/terms-and-conditions"
                                            target="_blank"
                                            className="underline font-bold text-[#A96D56] hover:text-[#995e48] transition-colors"
                                        >
                                            Terms &amp; Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link
                                            href="/policies/privacy-policy"
                                            target="_blank"
                                            className="underline font-bold text-[#A96D56] hover:text-[#995e48] transition-colors"
                                        >
                                            Privacy Policy
                                        </Link>
                                        .*
                                    </label>
                                </div>
                            </form>
                            <div ref={buttonsRef} className="pt-4 flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <button
                                        type="submit"
                                        form="checkout-form"
                                        className="flex-[1] bg-[#A96D56] text-white font-black uppercase tracking-[0.2em] text-[12px] py-4 hover:bg-[#995e48] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <span>Place Order</span>
                                        {/* <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> */}
                                    </button>
                                    <Link
                                        href="/cart"
                                        className="flex-1 border border-gray-200 text-gray-500 font-bold uppercase tracking-[0.2em] text-[11px] py-4 text-center hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center"
                                    >
                                        Back to Cart
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8 md:col-span-7 order-2 lg:order-2">
                        <div className="border border-gray-200 lg:sticky lg:top-32 bg-white">
                            <div className="px-6 py-6">
                                <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-900 font-jakarta">Shopping Cart</h2>
                            </div>
                            <div className="px-6 space-y-6">
                                <div className="space-y-6">
                                    {itemsToShow.map((item: any, idx: number) => {
                                        const totalCarat = item.stoneDetails?.reduce((sum: number, s: any) => sum + (Number(s.totalCarat) || 0), 0);
                                        const mappedItem = {
                                            id: item.jewelleryId || item.jeweleryId || item.id || item._id,
                                            name: item.productTitle || item.name || '',
                                            ref: item.itemCode || item.sku || '',
                                            slug: item.slug || "",
                                            price: item.price !== undefined ? item.price : (item.setting_price !== undefined ? item.setting_price : (item.settingprice !== undefined ? item.settingprice : (item.finalPrice || 0))),
                                            originalPrice: item.originalPrice !== undefined ? item.originalPrice : (item.finalPrice !== undefined ? item.finalPrice : (item.price || 0)),
                                            offerDetails: item.offerDetails,
                                            image: item.image || item.default_image || (item.images?.[0]?.MediaLocation ? `${item.images[0].MediaLocation}` : ""),
                                            metal: item.metal,
                                            metalWeight: item.metalWeight || item.weight || item.appxMetalWgt || '',
                                            carat: item.carat || (totalCarat ? `${totalCarat.toFixed(3)} CT` : ''),
                                            cartId: item._id,
                                            size: item.size || item.ringSize || "",
                                            sizeId: item.sizeId || "",
                                            hasSize: item.hasSize !== undefined ? !!item.hasSize : true,
                                            sizeLabel: item.sizeLabel || "",
                                            RingSizes: item.RingSizes || [],
                                            stoneDetails: item.stoneDetails,
                                            diamondDetails: item.diamondDetails,
                                            origin: item.origin,
                                            sizeDetails: item?.sizeDetails,
                                            color: item.color,
                                            metal_type: item.metal_type,
                                            material: item.material,
                                            shape: item.shape,
                                            qty: item.qty || item.quantity || 1,
                                            quantity: item.quantity || item.qty || 1,
                                            engraving: item?.engraving,
                                            engravingText: item?.engravingText,
                                        };
                                        return (
                                            <CheckoutCartItem
                                                key={`${mappedItem.id}-${idx}`}
                                                item={mappedItem}
                                            />
                                        );
                                    })}
                                </div>

                                <div className="mt-8 space-y-4 pt-6 border-t border-gray-100 text-[13px] font-jakarta text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-900">{formatPrice(itemsSum)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-emerald-700">
                                            <span>Coupon Discount{couponInfo?.code ? ` (${couponInfo.code})` : ''}</span>
                                            <span className="font-bold">-{formatPrice(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pb-2">
                                        <span>Shipping Charges</span>
                                        <span className="font-bold text-[#A96D56] uppercase text-[11px] tracking-wider">Free</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span>{isIndiaSummary ? 'GST (3%)' : taxRowLabel(country)}</span>
                                        <span className="font-bold text-gray-900">{formatPrice(taxes)}</span>
                                    </div>

                                    {/* Store wallet */}
                                    {walletBalance > 0 && (
                                        <div className="my-3 p-3.5 bg-[#FBF7F4] border border-[#A96D56]/20 rounded-sm">
                                            <label className="flex items-center justify-between cursor-pointer gap-3 select-none">
                                                <span className="flex items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-[#A96D56]"
                                                        checked={applyWallet}
                                                        onChange={(e) => setApplyWallet(e.target.checked)}
                                                    />
                                                    <span className="text-xs sm:text-[13px] font-bold text-gray-900">Use wallet balance
                                                        <span className="text-emerald-700 font-bold ml-1">({formatPrice(walletBalance)} available)</span>
                                                    </span>
                                                </span>
                                                {applyWallet && walletApplied > 0 && (
                                                    <span className="font-bold text-emerald-700 text-xs sm:text-[13px] whitespace-nowrap">-{formatPrice(walletApplied)}</span>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-black px-6 py-4 flex items-center justify-between text-white font-bold uppercase tracking-wider font-jakarta text-[14px]">
                                <span>{walletApplied > 0 ? 'AMOUNT PAYABLE' : 'TOTAL COST'} <span className="text-[10px] font-normal normal-case text-white/60">({isIndiaSummary ? 'Inclusive 3% GST' : 'incl. taxes'})</span></span>
                                <span className="text-[20px] font-bold">{formatPrice(payable)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Mobile Bottom Bar */}
                <div className={`lg:hidden z-20 fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-6 md:pb-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ${!isButtonsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                    <div className="flex flex-col gap-3 max-w-lg mx-auto">
                        <div className="flex items-center justify-between mb-1 px-1">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 font-jakarta">{walletApplied > 0 ? 'Payable' : 'Total Amount'}</span>
                            <span className="text-[18px] font-black font-jakarta text-[#A96D56]">{formatPrice(payable)}</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                form="checkout-form"
                                className="flex-[1] bg-[#A96D56] text-white font-black uppercase tracking-[0.2em] text-[12px] py-3 rounded-sm flex items-center justify-center gap-2"
                            >
                                <span>Continue</span>
                                {/* <ChevronRight className="w-4 h-4" /> */}
                            </button>
                            <Link
                                href="/cart"
                                className="flex-1 border border-gray-200 text-gray-400 font-bold uppercase tracking-[0.15em] text-[10px] py-3 text-center rounded-sm flex items-center justify-center"
                            >
                                Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <IdentityConflictModal
                isOpen={identityConflict.show}
                title={identityConflict.title}
                message={identityConflict.message}
                emailAccount={identityConflict.emailAccount}
                phoneAccount={identityConflict.phoneAccount}
                enteredEmail={formData.shipping.email}
                enteredPhone={formData.shipping.phone}
                onClose={() => setIdentityConflict({ show: false, title: '', message: '', emailAccount: null, phoneAccount: null })}
            />
        </div>
    );
};

export default CheckOut;