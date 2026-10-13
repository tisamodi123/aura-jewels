'use client';

// 1. React & Next.js Core
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 2. UI Libraries & Icons
import Select from 'react-select';
import { SlidersHorizontal, ShieldCheck, RefreshCw, Award, Truck, Lock } from 'lucide-react';
import { getSelectStyles } from '@/lib/selectStyles';

// 3. Main & Shared Components
import AllFilter from './AllFilter';
import ProductCard from '@/components/ProductCard';
import BespokeCTA from '@/components/home/BespokeCTA';
import JewelleryListFaq from '@/components/home/JewelleryListFaq';
import ProductPromises from '@/app/product/[id]/components/ProductPromises';
import ShopBySegment from '@/components/home/ShopBySegment';
import FromBlog from '@/components/home/FromBlog';
import NearbyStore from '@/components/home/NearbyStore';
import OurServices from '@/components/home/OurServices';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';

// 4. Modular Sub-components
import JewelryBreadcrumb from './jewelryList/JewelryBreadcrumb';
import JewelryHeroBanner from './jewelryList/JewelryHeroBanner';
import JewelryCategoryHeaderWidgets from './jewelryList/JewelryCategoryHeaderWidgets';
import ActiveFilters from './jewelryList/ActiveFilters';
import JewelryMobileSortModal from './jewelryList/JewelryMobileSortModal';
import JewelryMobileFilterDrawer from './jewelryList/JewelryMobileFilterDrawer';
import JewelryMobileStickyBar from './jewelryList/JewelryMobileStickyBar';
import RingBuilderStepBar from './jewelryList/RingBuilderStepBar';
import DiamondFilterBar from './jewelryList/DiamondFilterBar';
import DiamondCard from './jewelryList/DiamondCard';

// 5. Server Actions & Utilities
import { fetchMoreProductsAction, fetchMoreDiamondsAction } from '@/app/actions/productActions';
import { PREFIX } from '@/lib/constants';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';

// ── TYPES & CONSTANTS ──
const sortOptions = [
  { value: "What's New", label: "What's New" },
  { value: 'Price: Low to High', label: 'Price: Low to High' },
  { value: 'Price: High to Low', label: 'Price: High to Low' },
];

type ListScope = 'all' | 'category' | 'collection';

interface JewelryListProps {
  scope?: ListScope;
  category?: string;
  subcategory?: string;
  collectionId?: string;
  searchParams?: any;
  initialProducts?: any[];
  initialTotalCount?: number;
  initialAllParams?: any;
  initialStyleList?: any[];
  homeSections?: any;
}

const JewelryList: React.FC<JewelryListProps> = ({
  scope = 'all',
  category,
  subcategory,
  collectionId,
  searchParams,
  initialProducts = [],
  initialTotalCount = 0,
  initialAllParams = null,
  initialStyleList = [],
  homeSections = null,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Home Sections State (from SSR or client fetch fallback)
  const [sections, setSections] = useState<any>(homeSections);

  // Ring Builder mode check: Only active when explicitly navigating via "Start with a Setting" or builder params
  const isRingBuilderMode =
    searchParams?.builder === 'setting' ||
    searchParams?.builderStep != null ||
    searchParams?.startWith === 'setting' ||
    searchParams?.mode === 'builder' ||
    searchParams?.design === 'setting' ||
    urlSearchParams?.get('builder') === 'setting' ||
    urlSearchParams?.get('startWith') === 'setting' ||
    urlSearchParams?.get('mode') === 'builder' ||
    urlSearchParams?.get('design') === 'setting' ||
    urlSearchParams?.get('builderStep') != null ||
    pathname?.includes('start-with-a-setting') ||
    pathname?.includes('build-your-own-ring');

  useEffect(() => {
    if (!sections) {
      callApi(ENDPOINTS?.HOME?.GET_HOME_SCREEN_DATA, 'GET')
        .then((res) => {
          if (res?.data?.sections) {
            setSections(res.data.sections);
          }
        })
        .catch((err) => console.error('Error fetching home sections:', err));
    }
  }, [sections]);

  // Products state initialized from Server Side Data (SSR)
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetchingNextPage = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const totalCount = initialTotalCount;
  const totalPages = Math.ceil(totalCount / 20);
  const allParams = initialAllParams;
  const styleList = initialStyleList;

  const productListRef = useRef<HTMLDivElement>(null);

  const scrollToProductTop = () => {
    if (productListRef.current) {
      const headerOffset = 110;
      const elementPosition = productListRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'auto',
      });
    }
  };

  const isFirstRender = useRef(true);

  // Update products state when server-side initialProducts change (e.g. filter/sort update)
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    isFetchingNextPage.current = false;

    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      scrollToProductTop();
    }
  }, [initialProducts]);

  // Handle mobile sticky bar styling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        document.body.classList.add('has-sticky-bar');
      } else {
        document.body.classList.remove('has-sticky-bar');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('has-sticky-bar');
    };
  }, []);

  // Filter State Initialization from URL
  const [filters, setFilters] = useState<any>(() => ({
    category:
      scope === 'category'
        ? []
        : urlSearchParams.get('category')
          ? urlSearchParams.get('category')?.split(',')
          : [],
    subCategory: urlSearchParams.get('subCategory')
      ? urlSearchParams.get('subCategory')?.split(',')
      : [],
    shapes: urlSearchParams.get('shapes')
      ? urlSearchParams.get('shapes')?.split(',')
      : [],
    metals: urlSearchParams.get('metals')
      ? urlSearchParams.get('metals')?.split(',')
      : [],
    shape: urlSearchParams.get('shape')
      ? urlSearchParams.get('shape')?.split(',')
      : [],
    minWeight: urlSearchParams.get('minWeight')
      ? parseFloat(urlSearchParams.get('minWeight')!)
      : undefined,
    maxWeight: urlSearchParams.get('maxWeight')
      ? parseFloat(urlSearchParams.get('maxWeight')!)
      : undefined,
    minPrice: urlSearchParams.get('minPrice')
      ? parseFloat(urlSearchParams.get('minPrice')!)
      : undefined,
    maxPrice: urlSearchParams.get('maxPrice')
      ? parseFloat(urlSearchParams.get('maxPrice')!)
      : undefined,
    collectionId:
      scope === 'collection'
        ? []
        : urlSearchParams.get('collectionId')
          ? urlSearchParams.get('collectionId')?.split(',')
          : [],
    tags: urlSearchParams.get('tags')
      ? urlSearchParams.get('tags')?.split(',')
      : [],
    gender: urlSearchParams.get('gender')
      ? urlSearchParams.get('gender')?.split(',')
      : [],
    sortPrice: urlSearchParams.get('sortPrice') || '',
    color: urlSearchParams.get('color') ? urlSearchParams.get('color')?.split(',') : [],
    clarity: urlSearchParams.get('clarity') ? urlSearchParams.get('clarity')?.split(',') : [],
    cut: urlSearchParams.get('cut') ? urlSearchParams.get('cut')?.split(',') : [],
    polish: urlSearchParams.get('polish') ? urlSearchParams.get('polish')?.split(',') : [],
    symmetry: urlSearchParams.get('symmetry') ? urlSearchParams.get('symmetry')?.split(',') : [],
    fluorescence: urlSearchParams.get('fluorescence') ? urlSearchParams.get('fluorescence')?.split(',') : [],
    diamondType: category === 'diamonds' ? (urlSearchParams.get('diamondType') || urlSearchParams.get('type') || 'Lab Grown') : '',
  }));

  const handleSetFilters = (val: any) => {
    scrollToProductTop();

    // Resolve the next filters object (val could be a callback function or an object)
    const nextFilters = typeof val === 'function' ? val(filters) : val;

    const params = new URLSearchParams();

    Object.entries(nextFilters).forEach(([key, value]: [string, any]) => {
      if (scope === 'category' && key === 'category') return;
      if (scope === 'collection' && key === 'collectionId') return;

      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (!Array.isArray(value) && value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });

    if (scope === 'category') {
      params.set('view', 'all');
    } else {
      const viewParam = urlSearchParams.get('view');
      if (viewParam) params.set('view', viewParam);
    }

    // Preserve builder and other workflow-specific params
    const builderParams = ['builder', 'builderStep', 'startWith', 'mode', 'design', 'type'];
    builderParams.forEach((param) => {
      const valParam = urlSearchParams.get(param);
      if (valParam) {
        params.set(param, valParam);
      }
    });

    const newSearch = params.toString();
    const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;

    router.replace(newUrl, { scroll: false });
  };

  // Sync URL parameters back to state when URL changes
  const searchParamsKey = urlSearchParams.toString();
  useEffect(() => {
    const nextFilters = {
      category:
        scope === 'category'
          ? []
          : urlSearchParams.get('category')?.split(',').filter(Boolean) || [],
      subCategory: urlSearchParams.get('subCategory')?.split(',').filter(Boolean) || [],
      shapes: urlSearchParams.get('shapes')?.split(',').filter(Boolean) || [],
      metals: urlSearchParams.get('metals')?.split(',').filter(Boolean) || [],
      shape: urlSearchParams.get('shape')?.split(',').filter(Boolean) || [],
      minWeight: urlSearchParams.get('minWeight')
        ? parseFloat(urlSearchParams.get('minWeight')!)
        : undefined,
      maxWeight: urlSearchParams.get('maxWeight')
        ? parseFloat(urlSearchParams.get('maxWeight')!)
        : undefined,
      minPrice: urlSearchParams.get('minPrice')
        ? parseFloat(urlSearchParams.get('minPrice')!)
        : undefined,
      maxPrice: urlSearchParams.get('maxPrice')
        ? parseFloat(urlSearchParams.get('maxPrice')!)
        : undefined,
      collectionId:
        scope === 'collection'
          ? []
          : urlSearchParams.get('collectionId')?.split(',').filter(Boolean) || [],
      tags: urlSearchParams.get('tags')?.split(',').filter(Boolean) || [],
      gender: urlSearchParams.get('gender')?.split(',').filter(Boolean) || [],
      sortPrice: urlSearchParams.get('sortPrice') || '',
      color: urlSearchParams.get('color')?.split(',').filter(Boolean) || [],
      clarity: urlSearchParams.get('clarity')?.split(',').filter(Boolean) || [],
      cut: urlSearchParams.get('cut')?.split(',').filter(Boolean) || [],
      polish: urlSearchParams.get('polish')?.split(',').filter(Boolean) || [],
      symmetry: urlSearchParams.get('symmetry')?.split(',').filter(Boolean) || [],
      fluorescence: urlSearchParams.get('fluorescence')?.split(',').filter(Boolean) || [],
      diamondType: urlSearchParams.get('diamondType') || 'Lab Grown',
    };

    setFilters((prev: any) => {
      if (JSON.stringify(prev) === JSON.stringify(nextFilters)) return prev;
      return nextFilters;
    });
  }, [searchParamsKey, scope, urlSearchParams]);

  // Load next page when scrolling down via Server Action
  const loadNextPage = async (nextPage: number) => {
    setLoadingMore(true);
    try {
      const payload: any = {
        page: nextPage,
        limit: 20,
        search: searchParams?.search || '',
        category: filters.category || [],
        subCategory: filters.subCategory || [],
        metals: filters.metals || [],
        shape: filters.shape || [],
        shapes: filters.shapes || [],
        collectionId: filters.collectionId || [],
        tags: filters.tags || [],
        gender: filters.gender || [],
        sortPrice:
          filters.sortPrice === 'Price: High to Low' || filters.sortPrice === 'highToLow'
            ? 'highToLow'
            : 'lowToHigh',
      };

      if (scope === 'category' && category) {
        payload.categorySlug = category;
        delete payload.category;
      }
      if (scope === 'collection' && collectionId) {
        payload.collectionSlug = collectionId;
        delete payload.collectionId;
      }
      if (subcategory) {
        payload.subCategorySlug = subcategory;
      }

      if (filters.minPrice !== undefined) payload.minPrice = Number(filters.minPrice);
      if (filters.maxPrice !== undefined) payload.maxPrice = Number(filters.maxPrice);
      if (filters.minWeight !== undefined) payload.minWeight = Number(filters.minWeight);
      if (filters.maxWeight !== undefined) payload.maxWeight = Number(filters.maxWeight);

      // Call Next.js Server Action (runs 100% on the server side)
      const isDiamonds = category === 'diamonds';
      let response;
      if (isDiamonds) {
        const diamondPayload = {
          page: nextPage,
          limit: 20,
          search: filters.search || '',
          shape: filters.shape || [],
          color: filters.color || [],
          clarity: filters.clarity || [],
          cut: filters.cut || [],
          polish: filters.polish || [],
          symmetry: filters.symmetry || [],
          fluorescence: filters.fluorescence || [],
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minWeight: filters.minWeight,
          maxWeight: filters.maxWeight,
          diamondType: filters.diamondType || 'Lab Grown',
        };
        response = await fetchMoreDiamondsAction(diamondPayload);
      } else {
        response = await fetchMoreProductsAction(payload);
      }

      if (response?.success) {
        const newData = response.data || [];
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const unique = newData.filter((p: any) => !existingIds.has(p._id));
          return [...prev, ...unique];
        });
      }
    } catch (error) {
      console.log('Error loading next page via Server Action:', error);
    } finally {
      setLoadingMore(false);
      isFetchingNextPage.current = false;
    }
  };

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          !loadingMore &&
          !isFetchingNextPage.current &&
          page < totalPages
        ) {
          isFetchingNextPage.current = true;
          const nextPage = page + 1;
          setPage(nextPage);
          loadNextPage(nextPage);
        }
      },
      { rootMargin: '300px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadingMore, page, totalPages]);

  const getSelectedSortOption = () => {
    if (filters.sortPrice === 'lowToHigh') return sortOptions[1];
    if (filters.sortPrice === 'highToLow') return sortOptions[2];
    return sortOptions[0];
  };

  // Resolve dynamic page banner and inter-product banners from server data
  let activeBanner: any = null;
  let activeInterBanners: any[] = [];
  let fallbackTitle = 'All Jewelry';
  let fallbackDesc = 'Crafted by our jewelers with care and precision.';

  if (scope === 'category' && category) {
    let parentCategory = allParams?.category?.find((c: any) => c.slug === category);
    let subCat: any = null;

    if (!parentCategory && allParams?.category) {
      for (const cat of allParams.category) {
        const foundSub = cat.subcategories?.find((sc: any) => sc.slug === category);
        if (foundSub) {
          parentCategory = cat;
          subCat = foundSub;
          break;
        }
      }
    }

    if (subcategory) {
      fallbackTitle = subcategory.replace(/-/g, ' ');
      const foundSub = parentCategory?.subcategories?.find((sc: any) => sc.slug === subcategory);

      if (foundSub?.pageBanner?.image) {
        activeBanner = foundSub.pageBanner;
      } else if (parentCategory?.pageBanner?.image) {
        activeBanner = parentCategory.pageBanner;
      }
      if (foundSub?.interProductBanners) {
        activeInterBanners = foundSub.interProductBanners;
      } else if (parentCategory?.interProductBanners) {
        activeInterBanners = parentCategory.interProductBanners;
      }
    } else {
      fallbackTitle = category.replace(/-/g, ' ');
      const activeCat = subCat || parentCategory;
      if (activeCat?.pageBanner?.image) {
        activeBanner = activeCat.pageBanner;
      }
      if (activeCat?.interProductBanners) {
        activeInterBanners = activeCat.interProductBanners;
      } else if (parentCategory?.interProductBanners) {
        activeInterBanners = parentCategory.interProductBanners;
      }
    }
  } else if (scope === 'collection' && collectionId) {
    const collectionObj = allParams?.collection?.find((c: any) => c.slug === collectionId);
    fallbackTitle =
      collectionObj?.collectionName || collectionObj?.name || collectionId.replace(/-/g, ' ');
    fallbackDesc = collectionObj?.description || fallbackDesc;
    if (collectionObj?.pageBanner?.image) {
      activeBanner = collectionObj.pageBanner;
    }
    if (collectionObj?.interProductBanners) {
      activeInterBanners = collectionObj.interProductBanners;
    }
  }

  const bannerImage = activeBanner?.image
    ? getImageUrl(activeBanner.image)
    : `${PREFIX}/images/categoryImage/Banner-2.jpg`;

  const bannerImageMobile = activeBanner?.imageMobile
    ? getImageUrl(activeBanner.imageMobile)
    : undefined;

  const bannerHeading = activeBanner?.heading || fallbackTitle;
  const bannerDescription = activeBanner?.subText || fallbackDesc;

  // Insert active inter-product banners into the products list
  let mixedContent: any[] = [];
  if (activeInterBanners && activeInterBanners.length > 0) {
    const sortedBanners = [...activeInterBanners]
      .filter((b: any) => b.image)
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

    let bannersUsed = 0;
    for (let i = 0; i <= products.length; i++) {
      const bannerToInsert = sortedBanners.find((b: any) => b.position === (i + 1));
      if (bannerToInsert) {
        mixedContent.push({
          type: 'banner',
          id: `api-banner-${i}-${bannersUsed++}`,
          image: bannerToInsert.image,
          imageMobile: bannerToInsert.imageMobile || undefined,
          href: bannerToInsert.redirect?.href || '',
          alt: bannerToInsert.alt || 'Promo Banner',
        });
      }
      if (i < products.length) {
        mixedContent.push(products[i]);
      }
    }
  } else {
    if (isSidebarOpen) {
      // 4 columns grid layout
      mixedContent = [
        ...products.slice(0, 6),
        { type: 'banner', id: 'banner-1', image: `${PREFIX}/images/categoryImage/P1.jpg` },
        ...products.slice(6, 10),
        { type: 'banner', id: 'banner-2', image: `${PREFIX}/images/categoryImage/P2.jpg` },
        ...products.slice(10),
      ];
    } else {
      // 5 columns grid layout
      mixedContent = [
        ...products.slice(0, 8),
        { type: 'banner', id: 'banner-1', image: `${PREFIX}/images/categoryImage/P1.jpg` },
        ...products.slice(8, 13),
        { type: 'banner', id: 'banner-2', image: `${PREFIX}/images/categoryImage/P2.jpg` },
        ...products.slice(13),
      ];
    }
  }

  return (
    <>
      <section className="bg-white min-h-screen">
        {/* Breadcrumb Bar */}
        <JewelryBreadcrumb
          category={category}
          subcategory={subcategory}
          collectionId={collectionId}
          scope={scope}
        />

        {/* Hero Banner Section */}
        <JewelryHeroBanner
          allParams={allParams}
          bannerImage={bannerImage}
          bannerImageMobile={bannerImageMobile}
          bannerHeading={bannerHeading}
          bannerDescription={bannerDescription}
        />

        {/* Ring Builder 3-Step Process Bar (Only shown during Start With Setting / Ring Builder flow) */}
        {isRingBuilderMode && (
          <RingBuilderStepBar
            currentStep={category?.toLowerCase() === 'diamonds' ? 2 : 1}
            selectedSetting={(() => {
              const name = urlSearchParams?.get('settingName');
              const priceVal = urlSearchParams?.get('settingPrice');
              const image = urlSearchParams?.get('settingImage');
              if (name || priceVal || image) {
                return {
                  name: name || undefined,
                  price: priceVal ? parseFloat(priceVal) : undefined,
                  image: image || undefined,
                };
              }
              return null;
            })()}
            selectedDiamond={(() => {
              const title = urlSearchParams?.get('diamondTitle');
              const priceVal = urlSearchParams?.get('diamondPrice');
              const image = urlSearchParams?.get('diamondImage');
              if (title || priceVal || image) {
                return {
                  title: title || undefined,
                  price: priceVal ? parseFloat(priceVal) : undefined,
                  image: image || undefined,
                };
              }
              return null;
            })()}
          />
        )}

        {/* Process Bar & Style Cards Widgets */}
        {category !== 'diamonds' && (
          <JewelryCategoryHeaderWidgets
            category={category}
            subcategory={subcategory}
            allParams={allParams}
            styleList={styleList}
            filters={filters}
            setFilters={handleSetFilters}
          />
        )}

        {/* Main Product Listing Container */}
        <div ref={productListRef} className="px-4 pb-6 md:px-8 lg:px-12 mx-auto">
          {category === 'diamonds' && (
            <DiamondFilterBar
              activeFilters={filters}
              onFilterChange={(newFilters) => {
                handleSetFilters((prev: any) => ({
                  ...prev,
                  ...newFilters,
                }));
              }}
              resultsCount={totalCount || products.length}
            />
          )}

          {/* Modern Sticky Filter Bar */}
          {category === 'diamonds' ? (
            <div className="flex sticky top-0 z-30 bg-[#A86A4C] py-4 mb-8 flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 transition-all">
              <div className="flex items-center gap-2.5 text-[14px] font-semibold text-white tracking-[1px] uppercase">
                <SlidersHorizontal size={16} className="text-white" />
                <span>Filters</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <span suppressHydrationWarning className="text-[13px] text-white font-medium whitespace-nowrap">
                  ({totalCount || products.length} {(totalCount || products.length) === 1 ? 'Product' : 'Products'})
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-white font-medium whitespace-nowrap">Sort By :</span>
                  <Select
                    instanceId="diamond-sort-select"
                    value={getSelectedSortOption()}
                    onChange={(option: any) => {
                      handleSetFilters((prev: any) => ({
                        ...prev,
                        sortPrice:
                          option.value === 'Price: High to Low' || option.value === 'highToLow'
                            ? 'highToLow'
                            : 'lowToHigh',
                      }));
                    }}
                    options={sortOptions}
                    styles={{
                      control: (base: any) => ({
                        ...base,
                        width: '120px',
                        height: '32px',
                        minHeight: '32px',
                        borderRadius: '0px',
                        border: 'none',
                        boxShadow: 'none',
                        background: 'white',
                        cursor: 'pointer',
                        padding: '0 2px',
                      }),
                      valueContainer: (base: any) => ({
                        ...base,
                        padding: '0 6px',
                      }),
                      singleValue: (base: any) => ({
                        ...base,
                        color: '#1E1E1E',
                        fontSize: '13px',
                        fontWeight: '600',
                      }),
                      dropdownIndicator: (base: any) => ({
                        ...base,
                        color: '#1E1E1E',
                        padding: '4px',
                        '&:hover': {
                          color: '#000'
                        }
                      }),
                      indicatorSeparator: () => ({
                        display: 'none',
                      }),
                      menu: (base: any) => ({
                        ...base,
                        borderRadius: '0px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #ECECEC',
                        overflow: 'hidden',
                        zIndex: 50,
                        marginTop: '2px',
                      }),
                      option: (base: any, state: any) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#F8F5F1' : state.isFocused ? '#FAFAFA' : 'white',
                        color: '#1E1E1E',
                        fontSize: '13px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        '&:active': {
                          backgroundColor: '#F2E5DB',
                        }
                      }),
                    }}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex sticky top-0 z-30 bg-[#A86A4C] py-4 mb-8 flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 transition-all">
              <div className="flex items-center gap-6 flex-wrap flex-1">
                {/* Desktop Filters Button */}
                <button
                  className="flex items-center gap-2 text-[14px] font-medium text-white hover:text-gray-200 transition-colors"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>

                {/* Active Filter Chips */}
                <div className="flex-1 min-w-0">
                  <ActiveFilters
                    filters={filters}
                    setFilters={handleSetFilters}
                    allParams={allParams}
                    styleList={styleList}
                    scope={scope}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-8 w-full lg:w-auto mt-2 lg:mt-0">
                <span className="text-[13px] text-white font-medium whitespace-nowrap">
                  ({totalCount} {totalCount === 1 ? 'Product' : 'Products'})
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-white font-medium whitespace-nowrap">Sort By :</span>
                  <Select
                    instanceId="sort-by-select"
                    value={getSelectedSortOption()}
                    onChange={(option: any) => {
                      handleSetFilters((prev: any) => ({
                        ...prev,
                        sortPrice:
                          option.value === 'Price: High to Low' || option.value === 'highToLow'
                            ? 'highToLow'
                            : 'lowToHigh',
                      }));
                    }}
                    options={sortOptions}
                    styles={{
                      control: (base: any) => ({
                        ...base,
                        width: '170px',
                        height: '32px',
                        minHeight: '32px',
                        borderRadius: '0px',
                        border: 'none',
                        boxShadow: 'none',
                        background: 'white',
                        cursor: 'pointer',
                        padding: '0 2px',
                      }),
                      valueContainer: (base: any) => ({
                        ...base,
                        padding: '0 6px',
                      }),
                      singleValue: (base: any) => ({
                        ...base,
                        color: '#1E1E1E',
                        fontSize: '13px',
                        fontWeight: '600',
                      }),
                      dropdownIndicator: (base: any) => ({
                        ...base,
                        color: '#1E1E1E',
                        padding: '4px',
                        '&:hover': {
                          color: '#000'
                        }
                      }),
                      indicatorSeparator: () => ({
                        display: 'none',
                      }),
                      menu: (base: any) => ({
                        ...base,
                        borderRadius: '0px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #ECECEC',
                        overflow: 'hidden',
                        zIndex: 50,
                        marginTop: '2px',
                      }),
                      option: (base: any, state: any) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#F8F5F1' : state.isFocused ? '#FAFAFA' : 'white',
                        color: '#1E1E1E',
                        fontSize: '13px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        '&:active': {
                          backgroundColor: '#F2E5DB',
                        }
                      }),
                    }}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sidebar & Product Grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {isSidebarOpen && category !== 'diamonds' && (
              <aside className="hidden lg:block w-[220px] flex-shrink-0 sticky top-32 self-start animate-in slide-in-from-left-5 duration-300">
                <AllFilter
                  filters={filters}
                  setFilters={handleSetFilters}
                  category={category === 'diamonds' ? 'rings' : category}
                  subcategory={subcategory}
                  allParams={allParams}
                  styleList={styleList}
                  scope={scope}
                  hideHeader={true}
                />
              </aside>
            )}

            <div className="hidden mb-6">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full py-3 border border-gray-200 rounded-md text-sm font-jakarta font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Show Filters
              </button>
            </div>

            <div className="flex-grow min-h-[600px]">
              {/* Mobile Product Count Header */}
              <div className="lg:hidden mb-6 pb-4 border-b border-gray-100 flex items-center">
                <span className="text-[12px] font-sans font-bold text-gray-600 uppercase tracking-widest">
                  {totalCount} Designs
                </span>
              </div>

              {!products?.length ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-sans">
                  <p className="text-[16px] font-medium mb-2">No products found matching your filters.</p>
                  <button
                    onClick={() => handleSetFilters({})}
                    className="text-[14px] font-bold text-[#B57A5A] hover:text-[#9C684B] underline cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 lg:gap-8 grid-flow-dense transition-all duration-300 ${isSidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5'}`}>
                  {mixedContent.map((item: any, index) => {
                    if (item.type === 'banner') {
                      const bannerContent = (
                        <>
                          {item.imageMobile ? (
                            <>
                              <Image
                                src={getImageUrl(item.image)}
                                alt={item.alt || "Marketing Banner"}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110 hidden md:block"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                              <Image
                                src={getImageUrl(item.imageMobile)}
                                alt={item.alt || "Marketing Banner"}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110 md:hidden"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            </>
                          ) : (
                            <Image
                              src={getImageUrl(item.image)}
                              alt={item.alt || "Marketing Banner"}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-10 p-4">
                            <button className="bg-white px-8 py-3 text-[11px] md:text-[12px] font-jakarta font-bold tracking-widest hover:bg-[#B57A5A] hover:text-white transition-all duration-300 uppercase shadow-lg rounded-none">
                              Shop The Look
                            </button>
                          </div>
                        </>
                      );

                      if (item.href) {
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="relative col-span-2 h-full min-h-[250px] md:min-h-[350px] overflow-hidden rounded-none group shadow-none border border-[#ECECEC] block cursor-pointer"
                          >
                            {bannerContent}
                          </Link>
                        );
                      }

                      return (
                        <div key={item.id} className="relative col-span-2 h-full min-h-[250px] md:min-h-[350px] overflow-hidden rounded-none group shadow-none border border-[#ECECEC]">
                          {bannerContent}
                        </div>
                      );
                    }
                    if (category === 'diamonds') {
                      return (
                        <DiamondCard
                          key={item.id || item._id || index}
                          item={item}
                          isRingBuilderMode={isRingBuilderMode}
                        />
                      );
                    }
                    return (
                      <ProductCard
                        key={item.id || item._id || index}
                        product={item}
                        isRingBuilderMode={isRingBuilderMode}
                        searchParamsStr={urlSearchParams?.toString()}
                      />
                    );
                  })}
                </div>
              )}

              {/* Infinite Scroll Trigger & Spinner */}
              <div ref={loadMoreRef} className="flex justify-center items-center w-full mt-12 py-8">
                {loadingMore && (
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#013D3D] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs uppercase tracking-widest font-semibold font-sans">
                      Loading more...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA Sections */}
      {/* 
      <section>
        <BespokeCTA />
      </section>
      */}

      {/* Dynamic Homepage Our Services Component */}
      <OurServices />

      {/* 
      <section className="py-12 md:py-7">
        <JewelleryListFaq />
      </section>
      */}

      {/* ─── 3 Dynamic Home Sections in Exact Sequence ─── */}
      {/* 1. More To Explore (ShopBySegment) */}
      <ShopBySegment
        shopBySegmentData={{
          info: {
            title: sections?.shopBySegment?.content?.heading || sections?.shopBySegment?.title || "Discover More Stunning Jewellery Pieces Crafted With Elegance And Precision.",
            description: sections?.shopBySegment?.content?.subText || sections?.shopBySegment?.content?.description || "MORE TO EXPLORE",
            status: "ACTIVE",
          },
          items: (sections?.shopBySegment?.content?.items || []).map((item: any) => ({
            ...item,
            link: item.redirect?.href || item.redirect?.url || "",
            buttonlink1: item.redirect?.href || item.redirect?.url || "",
            buttontext1: item.ctaText || "",
          })),
        }}
      />

      {/* 2. From The Blog */}
      <FromBlog data={sections?.fromTheBlog?.content || sections?.fromBlog?.content || sections?.blog?.content || sections?.fromTheBlog || sections?.fromBlog} />

      {/* 3. Near By Store */}
      <NearbyStore data={sections?.nearbyStore?.content || sections?.preciousForever?.content || sections?.storeLocator?.content || sections?.nearbyStore} />

      {/* Mobile Sort Modal */}
      <JewelryMobileSortModal
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        sortOptions={sortOptions}
        selectedSortValue={getSelectedSortOption().value}
        onSelectSort={(value) => {
          handleSetFilters((prev: any) => ({
            ...prev,
            sortPrice:
              value === 'Price: High to Low' || value === 'highToLow' ? 'highToLow' : 'lowToHigh',
          }));
        }}
      />

      {/* Mobile Filter Drawer */}
      <JewelryMobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={handleSetFilters}
        totalCount={totalCount}
        category={category === 'diamonds' ? 'rings' : category}
        subcategory={subcategory}
        allParams={allParams}
        styleList={styleList}
        scope={scope}
      />

      {/* Mobile Sticky Bottom Bar */}
      {category !== 'diamonds' && (
        <JewelryMobileStickyBar
          onOpenSort={() => setIsSortOpen(true)}
          onOpenFilter={() => setIsFilterOpen(true)}
        />
      )}
    </>
  );
};

export default JewelryList;
