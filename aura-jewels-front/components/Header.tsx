'use client';

// 1. React & Next.js Core
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 2. Icons
import { Heart, ShoppingBag, Search, X, Phone } from 'lucide-react';

// 3. Sub-Components
import MegaMenu from './MegaMenu';
import { HeaderLogo } from './header/HeaderLogo';
import { HeaderHelpMenu } from './header/HeaderHelpMenu';
import { HeaderUserMenu } from './header/HeaderUserMenu';
import { HeaderSearchModal } from './header/HeaderSearchModal';
import { HeaderMobileDrawer } from './header/HeaderMobileDrawer';
import { HeaderAnnouncementBar } from './header/HeaderAnnouncementBar';

// 4. Stores & Services
import { useGlobleStore } from '@/store/globleStore';
import { getToken, getUser } from '@/services/clientCookies';
import { getCart, getWishlist, logout } from '@/lib/commonApi';

// 5. Constants & Config
import { STATUS_CODE } from '@/lib/constants';
import { API_BASE_URL, DEFAULT_COUNTRY } from '@/lib/Api_Url';

// 6. Utilities & Toast
import { successMsg } from '@/lib/toast';

// ── TYPES ──
interface HeaderProps {
  menuData?: {
    items?: any[];
  };
}

interface NavItem {
  label: string;
  href: string;
  isDirectLink: boolean;
  hasMegaMenu: boolean;
  raw: any;
}

// ── MAIN HEADER COMPONENT ──
const Header: React.FC<HeaderProps> = ({ menuData: initialMenuData }) => {
  const { wishCount, cartCount, country } = useGlobleStore();
  const isIndia = country === DEFAULT_COUNTRY;
  const token = getToken();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setUserData(getUser());

    const handleCookieChange = () => {
      setUserData(getUser());
    };
    window.addEventListener('cookie-user-change', handleCookieChange);
    return () => {
      window.removeEventListener('cookie-user-change', handleCookieChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      successMsg('Logged out successfully');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // State Management
  const [menuData, setMenuData] = useState<any>(initialMenuData || { items: [] });
  const [menuLoading, setMenuLoading] = useState<boolean>(!initialMenuData || !initialMenuData?.items?.length);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Layout & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const timeoutRef = useRef<number | null>(null);
  const helpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Sync menuData on prop change
  useEffect(() => {
    if (initialMenuData) {
      setMenuData(initialMenuData);
      setMenuLoading(false);
    }
  }, [initialMenuData]);

  // Initial cart/wishlist hydration
  useEffect(() => {
    getCart();
    getWishlist();
  }, []);

  // Reset dropdowns on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsDropdownOpen(false);
    setIsHelpOpen(false);
    setActiveNav('');
  }, [pathname]);

  // Lock scroll on mobile menu toggle
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Debounced search for Categories & Collections
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setCategories([]);
      setCollections([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}public-search/categories-collections?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        if (data.status === STATUS_CODE.OK || data.errorCode === STATUS_CODE.OK) {
          setCategories(data.data.categories || []);
          setCollections(data.data.collections || []);
        } else {
          setCategories([]);
          setCollections([]);
        }
      } catch (error) {
        console.log('Error fetching categories and collections:', error);
        setCategories([]);
        setCollections([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounced search for Products
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setProducts([]);
      setIsProductsLoading(false);
      return;
    }

    setIsProductsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}public-search/products?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        if (data.status === STATUS_CODE.OK || data.errorCode === STATUS_CODE.OK) {
          setProducts(data.data || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.log('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsProductsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Measure dynamic header height for content spacer
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let rafId: number;
    const ro = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (header) setHeaderHeight(header.offsetHeight);
      });
    });

    ro.observe(header);
    setHeaderHeight(header.offsetHeight);
    return () => {
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Optimized Scroll Handler
  useEffect(() => {
    const SCROLL_ON = 100;
    const SCROLL_OFF = 20;
    let ticking = false;
    const scrolledRef = { current: false };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!scrolledRef.current && y > SCROLL_ON) {
          scrolledRef.current = true;
          setIsScrolled(true);
        } else if (scrolledRef.current && y < SCROLL_OFF) {
          scrolledRef.current = false;
          setIsScrolled(false);
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mouse Handlers for Navigation & Help Dropdown
  const handleHelpMouseEnter = () => {
    if (helpTimeoutRef.current) clearTimeout(helpTimeoutRef.current);
    setIsHelpOpen(true);
  };

  const handleHelpMouseLeave = () => {
    helpTimeoutRef.current = setTimeout(() => {
      setIsHelpOpen(false);
    }, 200);
  };

  const handleMouseEnter = (label: string) => {
    if (window.innerWidth < 1024) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setActiveNav(label);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    timeoutRef.current = window.setTimeout(() => {
      setIsMegaMenuOpen(false);
      setActiveNav('');
    }, 150);
  };

  const toggleMobileSubMenu = (label: string) => {
    setExpandedMobileItem((prev) => (prev === label ? null : label));
  };

  // Nav Items Builder
  const navItems: NavItem[] = useMemo(() => {
    const items = Array.isArray(menuData?.items) ? menuData.items : [];
    return items.map((it: any) => ({
      label: it.label,
      href: it.redirect?.href || it.redirect?.url || '#',
      isDirectLink: it.hasMegaMenu === false,
      hasMegaMenu: it.hasMegaMenu !== false,
      raw: it,
    }));
  }, [menuData]);

  const activeItem = useMemo(
    () => navItems.find((i) => i.label === activeNav)?.raw || null,
    [navItems, activeNav]
  );

  // Desktop Navigation Link Item Renderer
  const renderNavItem = (item: NavItem, idx: number, extraClass = '') => (
    <Link
      key={idx}
      href={item.href || '#'}
      onMouseEnter={() => handleMouseEnter(item.label)}
      className={`group font-jakarta relative flex items-center text-[9.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-normal lg:tracking-wider transition-colors py-2 uppercase ${activeNav === item.label ? 'text-[#A96D56]' : 'text-[#1A1A1A] hover:text-[#A96D56]'
        } ${extraClass}`}
    >
      {item.label}
      <span
        className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-[#A96D56] transform origin-left transition-transform duration-300 ${activeNav === item.label ? 'scale-x-100' : 'scale-x-0'
          }`}
      />
    </Link>
  );

  return (
    <>
      {/* Dynamic Spacer compensating for fixed header */}
      <div
        style={{ height: headerHeight }}
        className="transition-[height] duration-300 ease-in-out"
        aria-hidden="true"
      />

      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 w-full bg-[#F5EFEB] border-b border-stone-200/40 transition-all duration-300 ${isMobileMenuOpen || isDropdownOpen ? 'z-[10000]' : 'z-[1000]'
          }`}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top Announcement Bar */}
        <HeaderAnnouncementBar isScrolled={isScrolled} />

        {/* Desktop Header */}
        <div className="hidden lg:block bg-[#F5EFEB] relative z-[110]">
          {/* Top Main Row */}
          <div className="w-full px-4 lg:px-6 xl:px-12">
            <div className={`transition-all duration-500 ease-in-out flex items-center justify-between ${isScrolled ? 'h-16' : 'h-20 md:h-24'}`}>

              {/* Left Section: Search Input (when top) or Small Logo (when scrolled) */}
              <div className={`flex items-center relative h-full justify-start transition-all duration-500 ease-in-out ${isScrolled ? 'shrink-0 w-[95px] lg:w-[115px]' : 'flex-1'}`}>
                {/* Small Logo on far left when scrolled */}
                <div className={`absolute inset-y-0 left-0 flex items-center transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-6 pointer-events-none'}`}>
                  <HeaderLogo logoSize="w-[95px] h-[28px] lg:w-[115px] lg:h-[34px]" />
                </div>
                {/* Search Bar on left when at top */}
                <div className={`absolute inset-y-0 left-0 flex items-center transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-0 translate-x-6 pointer-events-none' : 'opacity-100 translate-x-0 pointer-events-auto'}`}>
                  <div
                    className="relative group w-full max-w-[200px] cursor-pointer flex items-center py-1"
                    onClick={() => setIsDropdownOpen(true)}
                  >
                    <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0 stroke-[1.5]" />
                    <span className="text-[12px] text-stone-500 font-jakarta tracking-wide group-hover:text-[#A96D56] transition-colors whitespace-nowrap">
                      Search curated...
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Section: Large Logo (when top) or Nav Items (when scrolled) */}
              <div className={`flex items-center justify-center relative h-full transition-all duration-500 ease-in-out ${isScrolled ? 'flex-1 min-w-0 px-1 lg:px-2' : 'flex-none min-w-[200px] lg:min-w-[320px]'}`}>
                {/* Big Centered Logo when at top */}
                <div className={`transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-0 scale-90 translate-y-3 pointer-events-none absolute' : 'opacity-100 scale-100 translate-y-0 pointer-events-auto relative'}`}>
                  <HeaderLogo logoSize="w-[150px] h-[44px] md:w-[180px] md:h-[54px] lg:w-[210px] lg:h-[62px]" />
                </div>
                {/* Nav links centered when scrolled */}
                <div className={`w-full flex items-center justify-center transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-100 translate-y-0 pointer-events-auto relative' : 'opacity-0 -translate-y-3 pointer-events-none absolute'}`}>
                  <div className="flex items-center justify-center space-x-1 sm:space-x-1.5 lg:space-x-2.5 xl:space-x-5 2xl:space-x-7 whitespace-nowrap max-w-full">
                    {menuLoading
                      ? Array.from({ length: 7 }).map((_, idx) => (
                        <div key={idx} className="w-16 h-4 bg-stone-300/40 animate-pulse rounded" />
                      ))
                      : navItems.map((item, idx) => renderNavItem(item, idx))}
                  </div>
                </div>
              </div>

              {/* Right Section: Icons */}
              <div className={`flex items-center justify-end space-x-1 sm:space-x-2 transition-all duration-500 ease-in-out ${isScrolled ? 'shrink-0' : 'flex-1'}`}>
                {/* Search Icon button - visible when scrolled */}
                <button
                  className={`text-[#1A1A1A] hover:text-[#A96D56] transition-all duration-300 flex items-center justify-center p-2 ${isScrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  aria-label="Search"
                  onClick={() => setIsDropdownOpen(true)}
                >
                  <Search className="w-[18px] h-[18px] stroke-[1.5]" />
                </button>

                {/* Help Menu Icon */}
                <div
                  className="relative"
                  onMouseEnter={handleHelpMouseEnter}
                  onMouseLeave={handleHelpMouseLeave}
                >
                  <button
                    className="text-[#1A1A1A] hover:text-[#A96D56] transition-colors flex items-center justify-center p-2"
                    aria-label="Need Help"
                  >
                    <Phone className="w-[18px] h-[18px] stroke-[1.5]" />
                  </button>
                  {isHelpOpen && (
                    <HeaderHelpMenu
                      onMouseEnter={handleHelpMouseEnter}
                      onMouseLeave={handleHelpMouseLeave}
                    />
                  )}
                </div>

                {/* User Profile Menu */}
                <HeaderUserMenu
                  isMounted={isMounted}
                  token={token}
                  userData={userData}
                  onLogout={handleLogout}
                />

                {/* Wishlist Link */}
                <Link
                  href="/wishlist"
                  className="group relative text-[#1A1A1A] hover:text-[#A96D56] transition-colors flex items-center justify-center p-2"
                  aria-label="Wishlist"
                >
                  <div className="relative">
                    <Heart className="w-[18px] h-[18px] stroke-[1.5]" />
                    <span className="absolute -top-1.5 -right-2 bg-[#1A1A1A] text-white text-[9px] font-bold min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center font-sans">
                      {wishCount || 0}
                    </span>
                  </div>
                  <span className="absolute top-[100%] mt-1 left-1/2 -translate-x-1/2 bg-[#A96D56] text-white text-[10px] font-jakarta px-2.5 py-1 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-md z-[110] pointer-events-none">
                    Wishlist
                  </span>
                </Link>

                {/* Cart Link (India Only) */}
                {isIndia && (
                  <Link
                    href="/cart"
                    className="relative group text-[#1A1A1A] hover:text-[#A96D56] transition-colors flex items-center p-2"
                  >
                    <div className="relative flex items-center justify-center">
                      <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="absolute -top-1.5 -right-2 bg-[#1A1A1A] text-white text-[9px] font-bold min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center font-sans">
                        {cartCount || 0}
                      </span>
                    </div>
                    <span className="absolute top-[100%] mt-1 left-1/2 -translate-x-1/2 bg-[#A96D56] text-white text-[10px] font-jakarta px-2.5 py-1 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-md z-[110] pointer-events-none">
                      Cart
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row Navigation Bar (visible when NOT scrolled) */}
          <div className={`border-t border-stone-200/40 bg-[#F5EFEB] transition-all duration-500 ease-in-out overflow-hidden ${isScrolled ? 'max-h-0 opacity-0 invisible' : 'max-h-16 opacity-100 visible'}`}>
            <div className="w-full px-4 lg:px-6 xl:px-12 py-2.5 flex items-center justify-center space-x-2.5 sm:space-x-3.5 lg:space-x-4 xl:space-x-6 2xl:space-x-8 whitespace-nowrap overflow-x-auto scrollbar-hide">
              {menuLoading
                ? Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className="w-16 h-4 bg-stone-300/40 animate-pulse rounded" />
                ))
                : navItems.map((item, idx) => renderNavItem(item, idx))}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-2 flex items-center justify-between bg-[#F5EFEB] relative z-[110] border-b border-stone-200/40">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-gray-700"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsDropdownOpen(true)}
              className="text-[#1A1A1A] hover:text-[#A96D56] transition-colors flex items-center justify-center p-2"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <HeaderLogo logoSize="w-40 h-10" textStyle="text-[7px]" tracking="tracking-[0.3em]" disableHover />
          </div>

          <div className="flex items-center">
            <Link
              href="/wishlist"
              className="relative group text-[#1A1A1A] hover:text-[#A96D56] transition-colors flex items-center p-2"
            >
              <Heart className="w-[18px] h-[18px] stroke-[1.5]" />
              <span className="absolute -top-1.5 -right-2 bg-[#1A1A1A] text-white text-[9px] font-bold min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center font-sans">
                {wishCount || 0}
              </span>
            </Link>

            {isIndia && (
              <Link
                href="/cart"
                className="relative group text-[#1A1A1A] hover:text-[#A96D56] transition-colors flex items-center p-2"
              >
                <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                <span className="absolute -top-1.5 -right-2 bg-[#1A1A1A] text-white text-[9px] font-bold min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center font-sans">
                  {cartCount || 0}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* MegaMenu Dropdown Panel */}
        <div
          className={`absolute left-0 w-full transition-all duration-300 ease-in-out border-t border-neutral-border bg-white shadow-[0_10px_20px_rgba(0,0,0,0.03)] z-50 overflow-hidden origin-top ${isMegaMenuOpen && activeItem && activeItem.hasMegaMenu !== false
            ? 'opacity-100 translate-y-0 scale-y-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-y-95 pointer-events-none'
            }`}
          style={{ top: '100%' }}
          onMouseEnter={() => {
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            setIsMegaMenuOpen(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <MegaMenu
            item={activeItem}
            onClose={() => {
              setIsMegaMenuOpen(false);
              setActiveNav('');
            }}
          />
        </div>

        {/* Search Modal */}
        <HeaderSearchModal
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          collections={collections}
          products={products}
          isProductsLoading={isProductsLoading}
          country={country}
        />

        {/* Mobile Navigation Drawer */}
        <HeaderMobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navItems={navItems}
          expandedMobileItem={expandedMobileItem}
          onToggleSubMenu={toggleMobileSubMenu}
          isMounted={isMounted}
          token={token}
          wishCount={wishCount}
          cartCount={cartCount}
          isIndia={isIndia}
          onLogout={handleLogout}
        />
      </header>
    </>
  );
};

export default Header;