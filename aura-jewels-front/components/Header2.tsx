'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Store, Menu, X, Sparkles, CrossIcon, ChevronDown, ArrowRight, MapPin } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from '@/services/clientCookies';
import { clearAuth } from '@/services/clientCookies';
import { toast } from 'sonner';
import Image from 'next/image';
import { API_BASE_URL as BASE_URL, noImgFound } from '@/lib/Api_Url';
import { getImageUrl } from '@/lib/utils';
const routes = { login: '/sign-in', register: '/sign-up', profile: '/my-account/profile' };
import { useGlobleStore } from '@/store/globleStore';
import { withTax } from '@/lib/taxUtils';
import { formatPrice } from '@/lib/priceUtils';
import { logout } from '@/lib/commonApi';


const M = { auth: { loggedOut: 'Logged out successfully' } };
import { STATUS_CODE } from '@/lib/constants';
import { BiCloset } from 'react-icons/bi';
import MegaMenu from './MegaMenu';
import { CiShop } from 'react-icons/ci';
import { CONTACT } from '@/lib/siteConfig';
import { FaWhatsapp } from 'react-icons/fa';

const Header2 = () => {
    const {
        cartCount,
        wishCount,
        country
    } = useGlobleStore();

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsMegaMenuOpen(false);
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    }, [pathname]);

    const [mounted, setMounted] = useState(false);
    // Auth state lives in the Zustand store so a successful login on
    // any other page rerenders the header in the same tick — no manual
    // refresh required. The store hydrates from the cookie below so
    // refreshing the page keeps the user logged in.
    const authUser: any = null;
    const token = getToken(); const isLoggedIn = !!token;
    const hydrateAuth = () => { };
    const logoutAuth = () => { clearAuth(); };
    const user = authUser;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('Rings & Bands');
    const [isSticky, setIsSticky] = useState(false);
    // Which mobile-drawer accordion section is currently expanded. One at
    // a time — opening another collapses the previous so the drawer
    // doesn't turn into an unmanageable wall of links.
    const [openDrawerNav, setOpenDrawerNav] = useState<string | null>(null);

    // Dynamic mega-menu payload from GET /app/menu. Populated once at mount
    // — admins toggle the `isMenu` flag on Category/Collection/Tag to add or
    // remove items here without redeploying.
    const [menuData, setMenuData] = useState<{
        categories: Array<{
            _id: string;
            name: string;
            slug: string;
            image: string;
            subcategories: Array<{ _id: string; name: string; slug: string; image?: string }>;
            featuredTags?: Array<{ _id: string; name: string }>;
            sideCards?: Array<{
                image?: string;
                imageMobile?: string;
                title?: string;
                subtitle?: string;
                redirect?: { type?: string; url?: string; href?: string };
            }>;
        }>;
        collections: Array<{ _id: string; name: string; slug: string; image: string; description?: string }>;
        tags: Array<{ _id: string; name: string; href?: string }>;
        metals: Array<{ _id: string; name: string; type: string; stamp: string }>;
    }>({ categories: [], collections: [], tags: [], metals: [] });

    // Tracks the initial menu fetch so the nav can render a skeleton
    // instead of a single misleading "Bespoke Design" placeholder while
    // the GET /app/menu call is in flight.
    const [menuLoading, setMenuLoading] = useState(true);

    useEffect(() => {
        const baseUrl = BASE_URL || '';
        fetch(`${baseUrl}app/menu`)
            .then((res) => res.json())
            .then((res) => {
                if (res?.errorCode === STATUS_CODE.OK && res.data) {
                    setMenuData(res.data);
                }
            })
            .catch((err) => console.error('mega menu fetch error:', err))
            .finally(() => setMenuLoading(false));
    }, []);

    // Public search state variables
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllCollections, setShowAllCollections] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const modalSearchInputRef = React.useRef<HTMLInputElement>(null);
    const mobileModalSearchInputRef = React.useRef<HTMLInputElement>(null);
    const NO_MEGA_MENU_ITEMS = ['Bespoke Design'];
    const isDirectNavLink = (link: { name: string; href: string; type?: string }) =>
        NO_MEGA_MENU_ITEMS.includes(link.name) || link.type === 'tag';
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setShowAllCategories(false);
        setShowAllCollections(false);
        if (value.trim().length === 0) {
            // Keep categories/collections (pre-fetched on modal open) but
            // clear product results since products only show when searching.
            setProducts([]);
            setIsProductsLoading(false);
            return;
        }

        setIsDropdownOpen(true);
        setIsCategoriesLoading(true);
        setIsProductsLoading(true);
    };

    useEffect(() => {
        if (isDropdownOpen) {
            setTimeout(() => {
                if (window.innerWidth < 1024) {
                    mobileModalSearchInputRef.current?.focus();
                    return;
                }
                modalSearchInputRef.current?.focus();
            }, 50);
        }
    }, [isDropdownOpen]);

    // Auto-fetch categories & collections whenever the modal opens, even
    // without a search query. Empty-query call returns the full active list
    // from /public-search/categories-collections. Wrapped in an
    // AbortController so closing the modal mid-flight (or reopening it
    // quickly) cancels the previous request — without this, a slow
    // response from a stale open could overwrite fresh results.
    useEffect(() => {
        if (!isDropdownOpen) return;
        const baseUrl = BASE_URL || '';
        const controller = new AbortController();
        setIsCategoriesLoading(true);
        fetch(`${baseUrl}/public-search/categories-collections`, { signal: controller.signal })
            .then(res => res.json())
            .then(res => {
                if (res.errorCode === STATUS_CODE.OK && res.data) {
                    setCategories(res.data.categories || []);
                    setCollections(res.data.collections || []);
                }
            })
            .catch(err => {
                if (err?.name !== 'AbortError') console.error('Error fetching categories:', err);
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsCategoriesLoading(false);
            });
        return () => controller.abort();
    }, [isDropdownOpen]);

    useEffect(() => {
        if (searchQuery.trim().length === 0) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            const term = searchQuery.trim();
            const baseUrl = BASE_URL || '';

            setIsCategoriesLoading(true);
            setIsProductsLoading(true);

            // Both calls share the same AbortController so a new keystroke
            // cancels the previous pair atomically. Without this guard a
            // slow "rin" response could overwrite the faster "ring"
            // response and customers would see stale results.
            fetch(`${baseUrl}/public-search/categories-collections?query=${encodeURIComponent(term)}`, {
                signal: controller.signal,
            })
                .then(res => res.json())
                .then(res => {
                    if (res.errorCode === STATUS_CODE.OK && res.data) {
                        setCategories(res.data.categories || []);
                        setCollections(res.data.collections || []);
                    }
                })
                .catch(err => {
                    if (err?.name !== 'AbortError') console.error('Error searching categories:', err);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setIsCategoriesLoading(false);
                });

            fetch(`${baseUrl}/public-search/products?query=${encodeURIComponent(term)}&limit=12`, {
                signal: controller.signal,
            })
                .then(res => res.json())
                .then(res => {
                    if (res.errorCode === STATUS_CODE.OK && res.data) {
                        setProducts(res.data || []);
                    }
                })
                .catch(err => {
                    if (err?.name !== 'AbortError') console.error('Error searching products:', err);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setIsProductsLoading(false);
                });
        }, 300);

        // Two-step cleanup — cancel the queued debounce AND abort any
        // in-flight requests it already kicked off.
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery]);

    // Click-outside handler removed. The search modal is a full-screen
    // overlay (`fixed inset-0`) with its own X close button, so there is
    // no meaningful "outside" surface to click. The previous handler
    // anchored on `dropdownRef` (which wraps only the desktop top-bar
    // Col 1, NOT the search trigger in Col 3 nor the mobile drawer
    // trigger) and was closing the modal at the wrong moment.

    useEffect(() => {
        setMounted(true);
        hydrateAuth();
    }, [hydrateAuth]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
    };



    // Top nav assembled from the dynamic menu payload:
    //   - one entry per top-level category flagged `isMenu`
    //   - a "Collections" entry when any collection is flagged
    //   - a "Shop By Tag" entry when any tag is flagged (panel below
    //     renders the tag chips, each linking to /jewellery?tags=<id>)
    //   - "Bespoke Design" stays static (no associated entity)
    // Falls back to an empty list while the API call is in flight so we
    // never render stale hardcoded labels.
    const navLinks = useMemo(() => {
        const links: { name: string; href: string; type?: string }[] = [];
        for (const cat of (menuData?.categories || [])) {
            if (!cat?.slug) continue;
            links.push({ name: cat.name, href: `/${cat.slug}` });
        }
        if ((menuData?.collections || []).length > 0) {
            links.push({ name: 'Collections', href: '#' });
        }
        // if (menuData.tags.length > 0) {
        //     links.push({ name: 'Shop By Tag', href: '#' });
        // }
        // {
        //     menuData.tags.map((t) => links.push({ name: t.name, href: t.href || `/jewellery?tags=${t._id}`, type: 'tag' }));
        // }
        // {
        //     menuData.tags.map((t) => (
        //         <Link
        //             key={t._id}
        //             href={t.href || `/jewellery?tags=${t._id}`}
        //             className="text-xs px-3 py-1.5 rounded-full border border-foreground/15 text-foreground hover:border-brown hover:text-brown transition-colors"
        //         >
        //             {t.name}
        //         </Link>
        //     ))
        // }
        links.push({ name: 'Bespoke Design', href: '/custom-jewellery' });
        return links;
    }, [menuData]);



    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const isLoggedIn = !!getToken();

        if (isLoggedIn) {
            router.push(routes.profile);
        } else {
            router.push(routes.login);
        }

        if (isMenuOpen) setIsMenuOpen(false);
    };

    const logoSrc = getImageUrl('images/aura-jewels/Logo_Png-removebg-preview.png');

    const visibleCategories = showAllCategories ? categories : categories.slice(0, 6);
    const hasMoreCategories = categories.length > 6;
    const visibleCollections = showAllCollections ? collections : collections.slice(0, 6);
    const hasMoreCollections = collections.length > 6;

    return (
        <header className="w-full">
            {/* ─── Top Announcement Bar ─── */}
            <div className="bg-accent-teal text-accent text-xs sm:text-sm">
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${false ? "max-h-0 opacity-0" : "max-h-[80px] opacity-100"}`} style={{ willChange: 'max-height, opacity' }}>
                    <div className="bg-[#013D3D] text-white text-[10px] sm:text-[11px] md:text-[12px] py-2 md:py-2.5 uppercase font-bold text-center px-3 sm:px-4 font-jakarta">
                        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 tracking-[0.1em] md:tracking-[0.2em]">
                            <span>IGI Certified</span>
                            <span className="opacity-30 hidden sm:inline">|</span>
                            <span>Lifetime Exchange</span>
                            <span className="opacity-30 hidden sm:inline">|</span>
                            <span>Handcrafted in India</span>
                        </div>
                    </div>
                </div>
                {/* <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-2 items-center hidden lg:grid">
                    <div className="text-center">
                        <p className="hidden md:block font-normal tracking-wide">
                            Elevate Your Style with Stunning, Unique Gemstone Jewelry
                        </p>
                    </div>
                </div> */}

            </div>

            {/* ─── Main Header Row ─── */}
            <div className="bg-white">
                <div className="px-4 sm:px-6 lg:px-10 py-3 lg:py-4">

                    {/* Mobile/Tablet View (below 1024px) */}
                    <div className="flex lg:hidden items-center justify-between">

                        {/* LEFT — Logo */}
                        <Link href="/" className="shrink-0">
                            <Image
                                src={logoSrc}
                                alt="Aura Jewels"
                                width={180}
                                height={45}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        </Link>

                        {/* RIGHT — Search + Menu buttons. The search
                            trigger here opens the same full-screen modal
                            the desktop trigger uses; placed alongside the
                            menu icon so customers don't need to open the
                            drawer first to reach search. */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsDropdownOpen(true)}
                                className="text-foreground p-1"
                                aria-label="Open search"
                            >
                                <Search size={22} />
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="text-foreground p-1"
                                aria-label="Open menu"
                            >
                                <Menu size={24} />
                            </button>
                        </div>

                    </div>

                    {/* Mobile Search Overlay */}
                    {isMobileSearchOpen && (
                        <div className="lg:hidden mt-3 relative">
                            <input
                                type="text"
                                placeholder="Find Your Perfect Jewellery...."
                                className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-lg py-2.5 px-5 pr-11 text-sm text-foreground focus:outline-none"
                                autoFocus
                            />
                            <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40" aria-label="Search">
                                <Search size={18} />
                            </button>
                        </div>
                    )}

                    <div className="hidden lg:grid grid-cols-3 items-center gap-2">
                        {/* Col 1: Search Bar */}
                        <div className="relative w-full max-w-sm" ref={dropdownRef}>

                            {/* phone and store */}
                            <div className='flex items-center gap-5'>
                                {/* <p className='text-sm font-medium text-gray-800'>Call : +919876543210</p> */}
                                {/* <button className="hidden lg:flex items-center gap-2 border border-gray-400 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-foreground/5 transition-all whitespace-nowrap">
                                </button> */}
                                {/* <Link href="#" className='relative group flex items-center gap-2 text-gray-800 text-sm font-medium hover:text-brown transition-all whitespace-nowrap py-1'>
                                    <Store size={16} />
                                    <span>Find Our Store</span>
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brown transition-all duration-300 group-hover:w-full" />
                                </Link> */}
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(true)}
                                    className="group relative w-full pl-9 border-b border-neutral-border py-2 px-3 text-sm text-neutral-muted text-left transition-all duration-300 hover:border-brand hover:text-neutral-dark cursor-pointer"
                                >
                                    <Search
                                        size={18}
                                        className="absolute left-1 top-1/2 -translate-y-1/2 text-neutral-muted group-hover:text-brand transition-colors duration-300"
                                    />
                                    <span>Search Curated</span>
                                </button>

                            </div>



                            {/* isDropdownOpen && (searchQuery.trim().length > 0) */}
                            {isDropdownOpen && (
                                <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in fade-in-95 duration-200">
                                    <div className="max-w-[1180px] mx-auto px-6 py-10">

                                        {/* Header */}
                                        <div className="relative flex items-center justify-center mb-10">
                                            <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-[0.45em] text-black">
                                                Search
                                            </h2>

                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brown transition-colors"
                                                aria-label="Close search"
                                            >
                                                <X size={32} strokeWidth={1.5} />
                                            </button>
                                        </div>

                                        {/* Big Search Input */}
                                        <div className="max-w-3xl mx-auto relative mb-16">
                                            <Search
                                                size={24}
                                                className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400"
                                            />

                                            <input
                                                ref={modalSearchInputRef}
                                                type="text"
                                                placeholder="Search rings, earrings, solitaire..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                className="w-full h-16 md:h-20 border-b-2 border-gray-300 bg-white px-16 text-xl md:text-2xl text-black placeholder:text-gray-400 focus:outline-none focus:border-black "
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className={`grid grid-cols-1 ${categories.length > 0 || collections.length > 0
                                            ? 'lg:grid-cols-[300px_1fr]'
                                            : 'lg:grid-cols-1'
                                            } gap-12`}>

                                            {/* Left Side */}
                                            {(categories.length > 0 || collections.length > 0) && (
                                                <div className="space-y-12">

                                                    {/* Categories */}
                                                    {categories.length > 0 && (
                                                        <div>
                                                            <h4 className="font-serif text-md font-semibold uppercase text-brown mb-6">
                                                                Categories
                                                            </h4>

                                                            <div className="space-y-5">
                                                                {categories.slice(0, 6).map((cat) => (
                                                                    <Link
                                                                        key={cat._id}
                                                                        href={cat.slug ? `/category/${cat.slug}` : '/jewellery'}
                                                                        onClick={() => {
                                                                            setIsDropdownOpen(false);
                                                                            setSearchQuery('');
                                                                        }}
                                                                        className="block text-base font-medium  text-black  transition-colors"
                                                                    >
                                                                        {cat.categoryName?.toUpperCase()}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Collections */}
                                                    {collections.length > 0 && (
                                                        <div>
                                                            <h4 className="font-serif text-md font-semibold uppercase text-brown mb-6">
                                                                Collections
                                                            </h4>

                                                            <div className="space-y-5">
                                                                {collections.slice(0, 6).map((col) => (
                                                                    <Link
                                                                        key={col._id}
                                                                        href={col.slug ? `/collection/${col.slug}` : '/jewellery'}
                                                                        onClick={() => {
                                                                            setIsDropdownOpen(false);
                                                                            setSearchQuery('');
                                                                        }}
                                                                        className="block text-base font-medium text-black transition-colors"
                                                                    >
                                                                        {col.collectionName}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Right Side Products */}
                                            <div>
                                                <h4 className="font-serif text-md font-semibold uppercase text-brown mb-6">
                                                    Featured Products
                                                </h4>

                                                {isProductsLoading ? (
                                                    <div className={`grid ${categories.length > 0 || collections.length > 0
                                                            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                                                            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                                        } gap-7`}>
                                                        {Array.from({ length: 6 }).map((_, i) => (
                                                            <div key={i} className="animate-pulse max-w-[220px] w-full mx-auto">
                                                                <div className="aspect-square bg-foreground/5 rounded-md mb-4" />
                                                                <div className="h-4 bg-foreground/5 rounded w-3/4 mb-2" />
                                                                <div className="h-4 bg-foreground/5 rounded w-1/3" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : products.length > 0 ? (
                                                    <div className={`grid ${categories.length > 0 || collections.length > 0
                                                            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                                                            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                                        } gap-7`}>
                                                        {products.slice(0, 6).map((prod) => (
                                                            <Link
                                                                key={prod._id}
                                                                href={`/product/${prod.slug}`}
                                                                onClick={() => {
                                                                    setIsDropdownOpen(false);
                                                                    setSearchQuery('');
                                                                }}
                                                                className="group flex flex-col bg-white overflow-hidden max-w-[220px] w-full mx-auto"
                                                            >
                                                                <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center border border-gray-300 transition-colors duration-300 group-hover:border-brand/40">
                                                                    <Image
                                                                        src={getImageUrl(prod.images?.[0]?.MediaLocation) || noImgFound}
                                                                        alt={prod.productTitle}
                                                                        fill
                                                                        sizes="(max-width: 768px) 50vw, 20vw"
                                                                        unoptimized
                                                                        className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                                                                    />
                                                                </div>

                                                                <div className="pb-1 pt-2 space-y-1 font-sans">
                                                                    <h3 className="text-xs text-gray-500 group-hover:text-brand transition-colors leading-relaxed font-semibold line-clamp-2" title={prod.productTitle}>
                                                                        {prod.productTitle}
                                                                    </h3>
                                                                    {(() => {
                                                                        const dPrice = prod.finalPrice || 0;
                                                                        const rDisc = prod.discountedPrice;
                                                                        const offerDetails = prod.offerDetails;
                                                                        const hasOffer = !!(offerDetails?.offer?._id || offerDetails?.offer?.code) || (rDisc !== undefined && rDisc !== null && rDisc < dPrice);
                                                                        const effDisc = offerDetails?.discountedPrice ?? offerDetails?.discountedValue ?? rDisc ?? dPrice;
                                                                        if (hasOffer) {
                                                                            const isZero = effDisc <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= dPrice);
                                                                            return (
                                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                                    <h6 className="font-bold text-sm text-accent-teal tracking-tight">
                                                                                        {formatPrice(withTax(isZero ? 0 : effDisc, country))}
                                                                                    </h6>
                                                                                    <span className="text-xs text-gray-400 line-through">
                                                                                        {formatPrice(withTax(dPrice, country))}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return prod.finalPrice != null ? (
                                                                            <h6 className="font-bold text-sm text-accent-teal tracking-tight">
                                                                                {formatPrice(withTax(Number(prod.finalPrice), country))}
                                                                            </h6>
                                                                        ) : null;
                                                                    })()}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : searchQuery.trim().length > 0 ? (
                                                    <div className="py-16 text-center border border-dashed border-brown/20 rounded-lg">
                                                        <p className="text-sm text-foreground/50">
                                                            No search matches found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="py-16 text-center border border-dashed border-brown/20 rounded-lg">
                                                        <p className="text-sm text-foreground/50">
                                                            Start typing to search products.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Col 2: Logo (Centered) */}
                        <div className="flex justify-center">
                            <Link href="/" className="shrink-0">
                                <Image
                                    src={logoSrc}
                                    alt="Aura Jewels - A World of Brilliance"
                                    width={320}
                                    height={80}
                                    quality={100}
                                    className="h-11 w-auto object-contain"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Col 3: Actions (Right) */}
                        <div className="flex items-center justify-end gap-3 xl:gap-6 font-sans">
                            {/* WhatsApp Chat link */}
                            <a
                                href={CONTACT.whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer group"
                            >
                                <span className="hidden lg:inline text-xs font-semibold tracking-wider uppercase whitespace-nowrap">Chat with us</span>
                                <FaWhatsapp size={20} className="text-[#25D366] hover:scale-110 transition-transform duration-300" />
                            </a>
                            {/* Stores link */}
                            <Link
                                href="/stores"
                                className="flex flex-col items-center gap-0.5 text-neutral-dark hover:text-brand transition-colors group cursor-pointer"
                            >
                                <MapPin size={22} className="stroke-[1.5] group-hover:scale-105 transition-all duration-300" />
                                <span className="text-[10px] xl:text-xs font-medium tracking-wide uppercase whitespace-nowrap">Stores</span>
                            </Link>

                            {/* Profile Dropdown Container */}
                            <div className="relative group py-1">
                                <button
                                    onClick={handleProfileClick}
                                    className="flex flex-col items-center gap-0.5 text-neutral-dark hover:text-brand transition-colors cursor-pointer"
                                >
                                    <User size={22} className="stroke-[1.5] group-hover:scale-105 transition-all duration-300" />
                                    <span className="text-[10px] xl:text-xs font-medium tracking-wide uppercase whitespace-nowrap">Account</span>
                                </button>

                                {/* Dropdown Card */}
                                <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl border border-foreground/10 p-6 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    {mounted && !isLoggedIn ? (
                                        <div className="text-left font-sans">
                                            <h3 className="font-serif text-2xl tracking-wide text-brown font-medium mb-1">Your Account</h3>
                                            <p className="text-xs text-foreground/70 mb-5 leading-relaxed">Access account & manage your orders.</p>
                                            <Link
                                                href={routes.login}
                                                className="block w-full bg-brown hover:bg-brown/90 text-white text-xs font-bold tracking-widest py-3 text-center transition-all uppercase rounded-sm"
                                            >
                                                LOG IN
                                            </Link>
                                            <div className="mt-4 pt-4 border-t border-foreground/10 text-center">
                                                <p className="text-xs text-foreground/60">
                                                    New to Aura Jewels?{' '}
                                                    <Link href={routes.register} className="text-brown hover:underline font-semibold ml-1">
                                                        Register
                                                    </Link>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        mounted && isLoggedIn && (
                                            <div className="text-left font-sans">
                                                <h3 className="font-serif text-xl tracking-wide text-brown font-medium mb-1 truncate">
                                                    Welcome Back!
                                                </h3>
                                                {user?.name && (
                                                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                                )}
                                                {user?.email && (
                                                    <p className="text-xs text-foreground/60 mb-4 truncate">{user.email}</p>
                                                )}

                                                {/* <div className="space-y-2.5 py-3 border-t border-b border-foreground/10">
                                                        <Link 
                                                            href={routes.profile} 
                                                            className="flex items-center text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-brown transition-colors"
                                                        >
                                                            My Profile
                                                        </Link>
                                                        <Link 
                                                            href="/orders" 
                                                            className="flex items-center text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-brown transition-colors"
                                                        >
                                                            My Orders
                                                        </Link>
                                                        <Link 
                                                            href="/wish-list" 
                                                            className="flex items-center text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-brown transition-colors"
                                                        >
                                                            My Wishlist
                                                        </Link>
                                                        <Link 
                                                            href="/cart" 
                                                            className="flex items-center text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-brown transition-colors"
                                                        >
                                                            My Cart
                                                        </Link>
                                                    </div> */}

                                                <button
                                                    onClick={handleLogout}
                                                    className="mt-4 w-full bg-transparent hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-widest py-3 text-center transition-all uppercase rounded-sm cursor-pointer"
                                                >
                                                    LOG OUT
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Wishlist link */}
                            <Link
                                href="/wish-list"
                                className="flex flex-col items-center gap-0.5 text-neutral-dark hover:text-brand transition-colors group cursor-pointer"
                            >
                                <div className="relative">
                                    <Heart size={22} className="stroke-[1.5] group-hover:scale-105 transition-all duration-300" />
                                    {(mounted && wishCount > 0) && (
                                        <span className="absolute -top-1 -right-1 bg-neutral-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">{wishCount}</span>
                                    )}
                                </div>
                                <span className="text-[10px] xl:text-xs font-medium tracking-wide uppercase whitespace-nowrap">Wishlist</span>
                            </Link>

                            {/* Bag link */}
                            <Link
                                href="/cart"
                                className="flex flex-col items-center gap-0.5 text-neutral-dark hover:text-brand transition-colors group cursor-pointer"
                            >
                                <div className="relative">
                                    <ShoppingBag size={22} className="stroke-[1.5] group-hover:scale-105 transition-all duration-300" />
                                    {(mounted && cartCount > 0) && (
                                        <span className="absolute -top-1 -right-1 bg-neutral-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">{cartCount}</span>
                                    )}
                                </div>
                                <span className="text-[10px] xl:text-xs font-medium tracking-wide uppercase whitespace-nowrap">Bag</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Navigation Row (desktop only) ─── */}
            {isDropdownOpen && (
                <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in fade-in-95 duration-200 lg:hidden">
                    <div className="max-w-[1180px] mx-auto px-6 py-10">
                        <div className="relative flex items-center justify-center mb-10">
                            <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-[0.45em] text-black">
                                Search
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(false)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brown transition-colors"
                                aria-label="Close search"
                            >
                                <X size={32} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="max-w-3xl mx-auto relative mb-16">
                            <Search
                                size={24}
                                className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                ref={mobileModalSearchInputRef}
                                type="text"
                                placeholder="Search rings, earrings, solitaire..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full h-16 md:h-20 border-b-2 border-gray-300 bg-white px-16 text-xl md:text-2xl text-black placeholder:text-gray-400 focus:outline-none focus:border-black "
                            />
                        </div>

                        <div className={`grid grid-cols-1 ${categories.length > 0 || collections.length > 0
                            ? 'lg:grid-cols-[300px_1fr]'
                            : 'lg:grid-cols-1'
                            } gap-12`}>
                            {(categories.length > 0 || collections.length > 0) && (
                                <div className="space-y-12">
                                    {categories.length > 0 && (
                                        <div>
                                            <h4 className="font-serif text-md font-semibold uppercase text-brown mb-6">
                                                Categories
                                            </h4>
                                            <div className="space-y-5">
                                                {categories.slice(0, 6).map((cat) => (
                                                    <Link
                                                        key={cat._id}
                                                        href={cat.slug ? `/${cat.slug}` : '/jewellery'}
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="block text-base font-medium text-black transition-colors"
                                                    >
                                                        {cat.categoryName?.toUpperCase()}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {collections.length > 0 && (
                                        <div>
                                            <h4 className="font-serif text-md font-semibold uppercase text-brown mb-6">
                                                Collections
                                            </h4>
                                            <div className="space-y-5">
                                                {collections.slice(0, 6).map((col) => (
                                                    <Link
                                                        key={col._id}
                                                        href={col.slug ? `/collection/${col.slug}` : '/jewellery'}
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="block text-base font-medium text-black transition-colors"
                                                    >
                                                        {col.collectionName}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <h4 className="font-serif text-md font-semibold uppercase text-brown mb-6">
                                    Featured Products
                                </h4>
                                {isProductsLoading ? (
                                    <div className={`grid ${categories.length > 0 || collections.length > 0
                                            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                                            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                        } gap-7`}>
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="animate-pulse max-w-[220px] w-full mx-auto">
                                                <div className="aspect-square bg-foreground/5 rounded-md mb-4" />
                                                <div className="h-4 bg-foreground/5 rounded w-3/4 mb-2" />
                                                <div className="h-4 bg-foreground/5 rounded w-1/3" />
                                            </div>
                                        ))}
                                    </div>
                                ) : products.length > 0 ? (
                                    <div className={`grid ${categories.length > 0 || collections.length > 0
                                            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                                            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                        } gap-7`}>
                                        {products.slice(0, 6).map((prod) => (
                                            <Link
                                                key={prod._id}
                                                href={`/product/${prod.slug}`}
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className="group flex flex-col bg-white overflow-hidden max-w-[220px] w-full mx-auto"
                                            >
                                                <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center border border-gray-300 transition-colors duration-300 group-hover:border-brand/40">
                                                    <Image
                                                        src={getImageUrl(prod.images?.[0]?.MediaLocation) || noImgFound}
                                                        alt={prod.productTitle}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 20vw"
                                                        unoptimized
                                                        className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="pb-1 pt-2 space-y-1 font-sans">
                                                    <h3 className="text-xs text-gray-500 group-hover:text-brand transition-colors leading-relaxed font-semibold line-clamp-2" title={prod.productTitle}>
                                                        {prod.productTitle}
                                                    </h3>
                                                    {(() => {
                                                        const dPrice = prod.finalPrice || 0;
                                                        const rDisc = prod.discountedPrice;
                                                        const offerDetails = prod.offerDetails;
                                                        const hasOffer = !!(offerDetails?.offer?._id || offerDetails?.offer?.code) || (rDisc !== undefined && rDisc !== null && rDisc < dPrice);
                                                        const effDisc = offerDetails?.discountedPrice ?? offerDetails?.discountedValue ?? rDisc ?? dPrice;
                                                        if (hasOffer) {
                                                            const isZero = effDisc <= 0 || (offerDetails?.discountAmount && offerDetails.discountAmount >= dPrice);
                                                            return (
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <h6 className="font-bold text-sm text-accent-teal tracking-tight">
                                                                        {formatPrice(withTax(isZero ? 0 : effDisc, country))}
                                                                    </h6>
                                                                    <span className="text-xs text-gray-400 line-through">
                                                                        {formatPrice(withTax(dPrice, country))}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                        return prod.finalPrice != null ? (
                                                            <h6 className="font-bold text-sm text-accent-teal tracking-tight">
                                                                {formatPrice(withTax(Number(prod.finalPrice), country))}
                                                            </h6>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : searchQuery.trim().length > 0 ? (
                                    <div className="py-16 text-center border border-dashed border-brown/20 rounded-lg">
                                        <p className="text-sm text-foreground/50">
                                            No search matches found.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="py-16 text-center border border-dashed border-brown/20 rounded-lg">
                                        <p className="text-sm text-foreground/50">
                                            Start typing to search products.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div
                className="hidden lg:block relative"
                onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
                <nav className="bg-white border-b border-foreground/5">
                    <div className="px-4 lg:px-10 py-3 grid grid-cols-3 items-center">
                        {/* Col 1: Empty */}
                        <div className="hidden lg:block"></div>

                        {/* Col 2: Nav Links (Centered under Logo). Renders
                            a skeleton row while the menu API is in flight
                            so customers don't see just "Bespoke Design" by
                            itself before the dynamic items arrive. */}
                        <div className="flex justify-center">
                            {menuLoading ? (
                                <ul className="flex items-center justify-center gap-x-6 xl:gap-x-8 py-2">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <li
                                            key={i}
                                            className="h-3.5 w-20 rounded bg-stone-200 animate-pulse"
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <ul className="flex items-center justify-center gap-x-6 xl:gap-x-8 py-2 text-sm font-semibold text-gray-800 font-sans uppercase">
                                    {navLinks.map((link: { name: string; href: string; type?: string }) => {
                                        return (
                                            <li
                                                key={link.name}
                                                onMouseEnter={() => {
                                                    setActiveNav(link.name);
                                                    if (!isDirectNavLink(link)) {
                                                        setIsMegaMenuOpen(true);
                                                    } else {
                                                        setIsMegaMenuOpen(false);
                                                    }
                                                }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    className="relative group py-1 hover:text-main transition-colors whitespace-nowrap"
                                                >
                                                    {link.name}
                                                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brown transition-all duration-300 group-hover:w-full" />
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Col 3: Empty */}
                        <div className="hidden lg:block"></div>
                    </div>
                </nav>

                {/* MegaMenu Dropdown */}
                {isMegaMenuOpen && !NO_MEGA_MENU_ITEMS.includes(activeNav) && (
                    <div className="absolute top-full left-0 w-full z-50">
                        <MegaMenu activeNav={activeNav} menuData={menuData} onClose={() => setIsMegaMenuOpen(false)} />
                    </div>
                )}
            </div>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* when scroll new header  */}
            {/* logo on left center with navitems(in center) sticky when scroll and right search icon */}
            <div
                className={`fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-[100] transition-transform duration-300 hidden lg:block ${isSticky ? 'translate-y-0' : '-translate-y-full'}`}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
                <div className="max-w-[1440px] mx-auto px-10 h-16 flex items-center justify-between">
                    {/* Left — Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="shrink-0">
                            <Image
                                src={logoSrc}
                                alt="Aura Jewels"
                                width={140}
                                height={35}
                                quality={100}
                                className="h-7 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Center — Nav Items */}
                    <div className="flex-[2] flex justify-center">
                        <ul className="flex items-center gap-x-5 text-xs font-medium text-gray-900 font-sans uppercase">
                            {navLinks.map((link: { name: string; href: string }) => (
                                <li
                                    key={link.name}
                                    onMouseEnter={() => {
                                        setActiveNav(link.name);
                                        if (!NO_MEGA_MENU_ITEMS.includes(link.name)) {
                                            setIsMegaMenuOpen(true);
                                        } else {
                                            setIsMegaMenuOpen(false);
                                        }
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className="relative group py-1 hover:text-brown transition-colors whitespace-nowrap"
                                    >
                                        {link.name}
                                        <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brown transition-all duration-300 group-hover:w-full" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Right — Actions */}
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(true)}
                            className="text-gray-800 hover:text-brown transition-colors p-1"
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                        <button
                            onClick={handleProfileClick}
                            className="text-gray-800 hover:scale-110 transition-transform p-1 cursor-pointer flex items-center justify-center"
                            aria-label="Profile"
                        >
                            <User size={20} />
                        </button>
                        <Link href="/wish-list" className="relative text-gray-800 hover:text-brown transition-colors p-1" aria-label="Wishlist">
                            <Heart size={20} />
                            {(mounted && wishCount > 0) && (
                                <span className="absolute -top-0.5 -right-0.5 bg-brown text-white text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border border-white">{wishCount}</span>
                            )}
                        </Link>
                        <Link href="/cart" className="relative text-gray-800 hover:text-brown transition-colors p-1" aria-label="Cart">
                            <ShoppingBag size={20} />
                            {(mounted && cartCount > 0) && (
                                <span className="absolute -top-0.5 -right-0.5 bg-brown text-white text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border border-white">{cartCount}</span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Sticky MegaMenu Dropdown */}
                {isMegaMenuOpen && isSticky && !NO_MEGA_MENU_ITEMS.includes(activeNav) && (
                    <div className="absolute top-full left-0 w-full z-50">
                        <MegaMenu activeNav={activeNav} menuData={menuData} onClose={() => setIsMegaMenuOpen(false)} />
                    </div>
                )}
            </div>
            {/* Slide-in panel */}
            <div
                className={`fixed top-0 right-0 bottom-0 z-50 w-screen bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-5 sm:p-6">
                    {/* Drawer header */}
                    <div className="flex items-center justify-between mb-7">
                        <Link href="/" className="block" onClick={() => setIsMenuOpen(false)}>
                            <Image
                                src={logoSrc}
                                alt="Aura Jewels"
                                width={180}
                                height={45}
                                quality={100}
                                className="h-8 w-auto object-contain"
                            />
                        </Link>
                        <button onClick={() => setIsMenuOpen(false)} className="text-foreground p-1" aria-label="Close menu">
                            <X size={22} />
                        </button>
                    </div>

                    {/* Drawer search — clicking opens the same full-screen
                        modal the desktop search trigger uses. Acts as a
                        button rather than a real input so we don't fork
                        the search experience into two parallel inputs. */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsMenuOpen(false);
                            setIsDropdownOpen(true);
                        }}
                        className="relative mb-5 w-full text-left border border-gray-300 rounded-lg py-2.5 px-4 pr-10 text-sm text-gray-500 hover:border-brown transition-colors cursor-text"
                        aria-label="Open search"
                    >
                        Search rings, earrings, solitaire...
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40">
                            <Search size={16} />
                        </span>
                    </button>

                    {/* Drawer nav — mobile mega menu. Mirrors the desktop
                        MegaMenu content as an accordion: each category
                        expands to reveal By Style (with thumbnails), By
                        Metal, By Budget, and Featured tags. Collections
                        and Shop By Tag get their own panels. Bespoke
                        Design stays a single link. Skeleton row while the
                        /app/menu API is in flight. */}
                    {menuLoading ? (
                        <ul className="space-y-2 mb-6">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <li
                                    key={i}
                                    className="h-9 rounded-lg bg-foreground/5 animate-pulse"
                                />
                            ))}
                        </ul>
                    ) : (
                        <ul className="space-y-0.5 mb-6 font-sans">
                            {navLinks.map((link: { name: string; href: string, type?: string }) => {
                                const closeAll = () => {
                                    setIsMenuOpen(false);
                                    setOpenDrawerNav(null);
                                };

                                // Bespoke Design has no panel — direct link.
                                if (isDirectNavLink(link)) {
                                    return (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="flex items-center justify-between py-2.5 px-3 text-base font-medium text-gray-600 rounded-lg hover:bg-foreground/5 transition-colors"
                                                onClick={closeAll}
                                            >
                                                <span>{link.name}</span>
                                            </Link>
                                        </li>
                                    );
                                }

                                const isOpen = openDrawerNav === link.name;

                                // Build the panel content for this entry.
                                // Collections / Shop By Tag have their own
                                // shapes; everything else is a category
                                // dropdown built from the API payload.
                                const renderPanel = () => {
                                    if (link.name === 'Collections') {
                                        const cols = menuData?.collections || [];
                                        if (cols.length === 0) {
                                            return (
                                                <p className="text-xs text-black py-2 px-3">
                                                    No collections yet.
                                                </p>
                                            );
                                        }
                                        return (
                                            <ul className="space-y-2 pt-1">
                                                {cols.map((c) => (
                                                    <li key={c._id}>
                                                        <Link
                                                            href={c.slug ? `/collection/${c.slug}` : '/jewellery'}
                                                            onClick={closeAll}
                                                            className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-foreground/5"
                                                        >
                                                            <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-foreground/5">
                                                                {c.image ? (
                                                                    <Image
                                                                        src={c.image}
                                                                        alt={c.name}
                                                                        fill
                                                                        unoptimized
                                                                        sizes="40px"
                                                                        className="object-cover"
                                                                    />
                                                                ) : null}
                                                            </span>
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-sm font-medium text-black truncate">
                                                                    {c.name}
                                                                </span>
                                                                {c.description && (
                                                                    <span className="block text-[11px] text-black line-clamp-1">
                                                                        {c.description}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <ArrowRight size={14} className="text-foreground/40" />
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }

                                    if (link.name === 'Shop By Tag') {
                                        const tags = menuData?.tags || [];
                                        if (tags.length === 0) {
                                            return (
                                                <p className="text-xs text-foreground/60 py-2 px-3">
                                                    No tags yet.
                                                </p>
                                            );
                                        }
                                        return (
                                            <div className="flex flex-wrap gap-2 pt-2 px-3">
                                                {tags.map((t) => (
                                                    <Link
                                                        key={t._id}
                                                        href={t.href || `/jewellery?tags=${t._id}`}
                                                        onClick={closeAll}
                                                        className="text-xs px-3 py-1.5 rounded-full border border-foreground/15 text-foreground hover:border-brown hover:text-brown transition-colors"
                                                    >
                                                        {t.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        );
                                    }

                                    // Category dropdown. Reproduces the same
                                    // sections the desktop MegaMenu builds
                                    // for this category — see MegaMenu's
                                    // `buildDynamicSections` for the canonical
                                    // version of this logic.
                                    const cat = menuData?.categories?.find((c) => c.name === link.name);
                                    if (!cat) return null;

                                    const seen = new Set<string>();
                                    const metals = (menuData?.metals || []).filter((m) => {
                                        const k = (m.type || '').toLowerCase();
                                        if (!k || seen.has(k)) return false;
                                        seen.add(k);
                                        return true;
                                    });

                                    const slug = cat.slug;
                                    const budget = [
                                        { label: 'Under ₹15,000', href: `/category/${slug}?maxPrice=15000` },
                                        { label: '₹15,000 - ₹50,000', href: `/category/${slug}?minPrice=15000&maxPrice=50000` },
                                        { label: '₹50,000 - ₹1 Lakh', href: `/category/${slug}?minPrice=50000&maxPrice=100000` },
                                        { label: 'Above ₹1 Lakh', href: `/category/${slug}?minPrice=100000` },
                                    ];

                                    return (
                                        <div className="pt-1 space-y-4  grid grid-cols-2 gap-1">
                                            {/* By Style — subcategory thumbnails */}
                                            {cat.subcategories.length > 0 && (
                                                <div className=''>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 px-3 mb-2">
                                                        By Style
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {cat.subcategories.map((sub) => (
                                                            <li key={sub._id}>
                                                                <Link
                                                                    href={sub.slug ? `/category/${sub.slug}` : `/category/${slug}`}
                                                                    onClick={closeAll}
                                                                    className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-foreground/5 text-sm text-gray-700"
                                                                >
                                                                    {sub.image ? (
                                                                        <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-foreground/5">
                                                                            <Image
                                                                                src={sub.image}
                                                                                alt={sub.name}
                                                                                fill
                                                                                unoptimized
                                                                                sizes="32px"
                                                                                className="object-cover"
                                                                            />
                                                                        </span>
                                                                    ) : null}
                                                                    <span className="truncate">{sub.name}</span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* By Metal */}
                                            {metals.length > 0 && (
                                                <div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 px-3 mb-2">
                                                        By Metal
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {metals.map((m) => (
                                                            <li key={m._id}>
                                                                <Link
                                                                    href={`/category/${slug}?metals=${m._id}`}
                                                                    onClick={closeAll}
                                                                    className="block py-1.5 px-3 rounded-lg hover:bg-foreground/5 text-sm text-gray-700"
                                                                >
                                                                    {m.type}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* By Budget */}
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 px-3 mb-2">
                                                    By Budget
                                                </div>
                                                <ul className="space-y-1">
                                                    {budget.map((b) => (
                                                        <li key={b.label}>
                                                            <Link
                                                                href={b.href}
                                                                onClick={closeAll}
                                                                className="block py-1.5 px-3 rounded-lg hover:bg-foreground/5 text-sm text-gray-700"
                                                            >
                                                                {b.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Featured tags */}
                                            {(cat.featuredTags || []).length > 0 && (
                                                <div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 px-3 mb-2">
                                                        Featured
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {cat.featuredTags!.map((t) => (
                                                            <li key={t._id}>
                                                                <Link
                                                                    href={`/category/${slug}?tags=${t._id}`}
                                                                    onClick={closeAll}
                                                                    className="block py-1.5 px-3 rounded-lg hover:bg-foreground/5 text-sm text-gray-700"
                                                                >
                                                                    {t.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* View All */}
                                            <div className="pt-1 border-t border-foreground/10">
                                                <Link
                                                    href={`/category/${slug}`}
                                                    onClick={closeAll}
                                                    className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-brown hover:bg-foreground/5"
                                                >
                                                    <span>View All</span>
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                };

                                return (
                                    <li key={link.name}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenDrawerNav(isOpen ? null : link.name)}
                                            className={`w-full flex items-center justify-between py-2.5 px-3 text-base font-normal rounded-lg transition-colors ${isOpen ? 'bg-foreground/5 text-foreground' : 'text-gray-600 hover:bg-foreground/5'
                                                }`}
                                            aria-expanded={isOpen}
                                        >
                                            <span>{link.name}</span>
                                            <ChevronDown
                                                size={16}
                                                className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                        {isOpen && (
                                            <div className="ml-1   my-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                {renderPanel()}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Drawer actions */}
                    <div className="border-t border-foreground/10 pt-5 space-y-4">
                        <Link
                            href="/stores"
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full flex items-center justify-center gap-2 border border-foreground/20 text-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-foreground/5 transition-all"
                        >
                            <Store size={16} />
                            Find Our Store
                        </Link>

                        <div className="flex items-center justify-around pt-2">
                            <button onClick={handleProfileClick} className="flex flex-col items-center gap-1.5 text-foreground">
                                <User size={20} />
                                <span className="text-xs sm:text-sm font-medium">Profile</span>
                            </button>
                            <Link href="/wish-list" className="flex flex-col items-center gap-1.5 text-foreground" onClick={() => setIsMenuOpen(false)}>
                                <div className="relative">
                                    <Heart size={20} />
                                    {(mounted && wishCount > 0) && (
                                        <span className="absolute -top-1 -right-1.5 bg-brown text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{wishCount}</span>
                                    )}
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Wishlist</span>
                            </Link>
                            <Link href="/cart" className="flex flex-col items-center gap-1.5 text-foreground" onClick={() => setIsMenuOpen(false)}>
                                <div className="relative">
                                    <ShoppingBag size={20} />
                                    {(mounted && cartCount > 0) && (
                                        <span className="absolute -top-1 -right-1.5 bg-brown text-white text-xs w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                                    )}
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Cart</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header2;
