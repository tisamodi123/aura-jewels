'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { noImgFound } from '@/lib/Api_Url';
import { getImageUrl } from '@/lib/utils';
import { withTax } from '@/lib/taxUtils';
import { formatPrice } from '@/lib/priceUtils';

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categories: any[];
  collections: any[];
  products: any[];
  isProductsLoading: boolean;
  country: string;
}

export const HeaderSearchModal: React.FC<HeaderSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  categories,
  collections,
  products,
  isProductsLoading,
  country,
}) => {
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => modalInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderProductPrice = (prod: any) => {
    const dPrice = prod.finalPrice || 0;
    const rDisc = prod.discountedPrice;
    const offerDetails = prod.offerDetails;
    const hasOffer =
      !!(offerDetails?.offer?._id || offerDetails?.offer?.code) ||
      (rDisc !== undefined && rDisc !== null && rDisc < dPrice);
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
  };

  const hasCategoriesOrCollections = categories.length > 0 || collections.length > 0;

  return (
    <div className="fixed inset-0 z-[150] bg-white overflow-y-auto animate-in fade-in-95 duration-200">
      <div className="max-w-[1180px] mx-auto px-6 py-10">
        {/* Modal Header */}
        <div className="relative flex items-center justify-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-[0.45em] text-black">
            Search
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brown transition-colors"
            aria-label="Close search"
          >
            <X size={32} strokeWidth={1.5} />
          </button>
        </div>

        {/* Input Field */}
        <div className="max-w-3xl mx-auto relative mb-16">
          <Search size={24} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={modalInputRef}
            type="text"
            placeholder="Search rings, earrings, solitaire..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-16 md:h-20 border-b-2 border-gray-300 bg-white px-16 text-xl md:text-2xl text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
          />
        </div>

        {/* Results Grid */}
        <div
          className={`grid grid-cols-1 ${hasCategoriesOrCollections ? 'lg:grid-cols-[300px_1fr]' : 'lg:grid-cols-1'
            } gap-12`}
        >
          {/* Categories & Collections */}
          {hasCategoriesOrCollections && (
            <div className="space-y-12">
              {categories.length > 0 && (
                <div>
                  <h4 className="font-serif text-md font-semibold uppercase text-[#A96D56] mb-6">
                    Categories
                  </h4>
                  <div className="space-y-5">
                    {categories.slice(0, 6).map((cat) => (
                      <Link
                        key={cat._id}
                        href={cat.slug ? `/${cat.slug}?view=all` : '/jewellery'}
                        onClick={onClose}
                        className="block text-base font-medium text-black hover:text-[#A96D56] transition-colors"
                      >
                        {cat.categoryName?.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {collections.length > 0 && (
                <div>
                  <h4 className="font-serif text-md font-semibold uppercase text-[#A96D56] mb-6">
                    Collections
                  </h4>
                  <div className="space-y-5">
                    {collections.slice(0, 6).map((col) => (
                      <Link
                        key={col._id}
                        href={col.slug ? `/collection/${col.slug}` : '/jewellery'}
                        onClick={onClose}
                        className="block text-base font-medium text-black hover:text-[#A96D56] transition-colors"
                      >
                        {col.collectionName}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          <div>
            <h4 className="font-serif text-md font-semibold uppercase text-[#A96D56] mb-6">
              Featured Products
            </h4>

            {isProductsLoading ? (
              <div
                className={`grid ${hasCategoriesOrCollections
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                  } gap-7`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse max-w-[220px] w-full mx-auto">
                    <div className="aspect-square bg-[#A96D56]/5 rounded-md mb-4" />
                    <div className="h-4 bg-[#A96D56]/5 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-[#A96D56]/5 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={`grid ${hasCategoriesOrCollections
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                  } gap-7`}
              >
                {products.slice(0, 6).map((prod) => (
                  <Link
                    key={prod._id}
                    href={`/product/${prod.slug}`}
                    onClick={onClose}
                    className="group flex flex-col bg-white overflow-hidden max-w-[220px] w-full mx-auto"
                  >
                    <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center border border-gray-300 transition-colors duration-300 group-hover:border-[#A96D56]/40">
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
                      <h3
                        className="text-xs text-gray-500 group-hover:text-[#A96D56] transition-colors leading-relaxed font-semibold line-clamp-2"
                        title={prod.productTitle}
                      >
                        {prod.productTitle}
                      </h3>
                      {renderProductPrice(prod)}
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchQuery.trim().length > 0 ? (
              <div className="py-16 text-center border border-dashed border-[#A96D56]/20 rounded-lg">
                <p className="text-sm text-foreground/50">No search matches found.</p>
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-[#A96D56]/20 rounded-lg">
                <p className="text-sm text-foreground/50">Start typing to search products.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSearchModal;
