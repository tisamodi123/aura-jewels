'use client';

import React from 'react';
import Link from 'next/link';

interface JewelryBreadcrumbProps {
  category?: string;
  subcategory?: string;
  collectionId?: string;
  scope?: string;
}

const JewelryBreadcrumb: React.FC<JewelryBreadcrumbProps> = ({
  category,
  subcategory,
  collectionId,
  scope = 'all',
}) => {
  return (
    <div className="bg-white py-4 px-6 md:px-12 border-b border-gray-50">
      <div className="flex items-center space-x-2 text-[11px] md:text-xs font-jakarta tracking-wide uppercase">
        <Link href="/" className="text-gray-400 hover:text-[#013D3D] transition-colors capitalize">
          Home
        </Link>
        <span className="text-gray-300 font-light">/</span>
        {subcategory && category ? (
          <>
            <Link
              href={`/${category}?view=all`}
              className="text-gray-400 hover:text-[#013D3D] transition-colors capitalize"
            >
              {category.replace(/-/g, ' ')}
            </Link>
            <span className="text-gray-300 font-light">/</span>
            <span className="text-gray-900 font-medium capitalize">
              {subcategory.replace(/-/g, ' ')}
            </span>
          </>
        ) : (
          <span className="text-gray-900 font-medium capitalize">
            {category
              ? category.replace(/-/g, ' ')
              : scope === 'collection' && collectionId
              ? collectionId.replace(/-/g, ' ')
              : 'All Jewelry'}
          </span>
        )}
      </div>
    </div>
  );
};

export default JewelryBreadcrumb;
