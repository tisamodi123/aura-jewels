'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PREFIX } from '@/lib/constants';
import { getImageUrl, formatTitle } from '@/lib/utils';
import CommonSlider from '@/components/common/CommonSlider';

interface BlogItem {
  id: number | string;
  image: string;
  title: string;
  description: string;
  link: string;
}

const DEFAULT_BLOGS: BlogItem[] = [
  {
    id: 1,
    image: `${PREFIX || ''}/images/Journal-1.jpg`,
    title: 'Our Story In Motion',
    description: 'Our Story in Motion captures the journey behind our craft and the inspiration that drives every creation.',
    link: '/journal'
  },
  {
    id: 2,
    image: `${PREFIX || ''}/images/Journal-2.jpg`,
    title: 'Our Story In Motion',
    description: 'Our Story in Motion captures the journey behind our craft and the inspiration that drives every creation.',
    link: '/journal'
  },
  {
    id: 3,
    image: `${PREFIX || ''}/images/Journal-3.jpg`,
    title: 'Our Story In Motion',
    description: 'Our Story in Motion captures the journey behind our craft and the inspiration that drives every creation.',
    link: '/journal'
  }
];

interface FromBlogProps {
  data?: any;
}

export const FromBlog: React.FC<FromBlogProps> = ({ data }) => {
  const contentObj = data?.content || data || {};

  const subTitle = formatTitle(contentObj?.subTitle || contentObj?.subtitle || contentObj?.subText || contentObj?.label || contentObj?.info?.subTitle || "FROM THE BLOG");
  const heading = formatTitle(contentObj?.heading || contentObj?.title || contentObj?.info?.heading || "Insights, Inspirations & Stories From The World Of Fine Jewellery");

  // Extract raw items array from ALL possible CMS data properties (blogCards, items, cards, blogs, etc.)
  const rawItems =
    contentObj?.blogCards ||
    contentObj?.items ||
    contentObj?.cards ||
    contentObj?.blogs ||
    contentObj?.articles ||
    contentObj?.list ||
    contentObj?.blog_cards ||
    contentObj?.data ||
    (Array.isArray(contentObj) ? contentObj : []) ||
    (Array.isArray(data?.items) ? data.items : []) ||
    (Array.isArray(data?.blogCards) ? data.blogCards : []);

  const cmsBlogs = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems.map((item: any, index: number) => {
    // Check all possible image fields from CMS upload (thumbnailImage, thumbnail, image, media, etc.):
    const rawImg = item?.thumbnailImage || item?.thumbnail_image || item?.thumbnail || item?.image || item?.thumb || item?.media || item?.file || item?.img || item?.photo || item?.desktopImage || item?.imageMobile || item?.src || item?.coverImage || item?.url || item?.cardImage;

    // Check all possible title fields:
    const titleText = item?.title || item?.heading || item?.name || item?.label || "Our Story In Motion";

    // Check all possible description fields:
    const descText = item?.description || item?.desc || item?.summary || item?.subText || item?.content || item?.text || "";

    // Check all possible link fields:
    const rawLink = item?.redirect?.href || item?.redirect?.url || item?.link || item?.ctaLink || item?.url || item?.href || item?.redirect;
    const linkUrl = typeof rawLink === 'string' ? rawLink : (rawLink?.href || rawLink?.url || '/journal');

    return {
      id: item?.id || item?._id || index + 1,
      image: rawImg ? getImageUrl(rawImg) : getImageUrl(DEFAULT_BLOGS[index % 3].image),
      title: titleText,
      description: descText,
      link: linkUrl
    };
  }) : null;

  // Use dynamic CMS blogs if available; otherwise use default fallback so section never disappears
  const blogsToDisplay: BlogItem[] = cmsBlogs && cmsBlogs.length > 0 ? cmsBlogs : DEFAULT_BLOGS;

  const renderBlogCard = (blog: BlogItem) => (
    <div key={blog.id} className="flex flex-col items-center text-center group w-full h-full pb-8">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 mb-6 rounded-xs">
        <Image
          src={blog.image}
          alt={blog.title || 'Blog Image'}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
      </div>

      {/* Title */}
      {blog.title && (
        <h3 className="text-lg md:text-[19px] text-[#1A1A1A] font-cormorant-garamond font-semibold mb-2 px-2">
          {blog.title}
        </h3>
      )}

      {/* Description */}
      {blog.description && (
        <p className="text-xs md:text-[13.5px] leading-relaxed text-gray-700 font-instrument-sans font-medium max-w-sm mb-5 px-3">
          {blog.description}
        </p>
      )}

      {/* Link */}
      {blog.link && (
        <Link
          href={blog.link}
          className="text-xs font-bold font-instrument-sans uppercase tracking-[0.15em] text-[#A96D56] hover:text-[#975843] transition-colors underline underline-offset-4 mt-auto"
        >
          Read More
        </Link>
      )}
    </div>
  );

  return (
    <section className="bg-white py-12 md:py-20 px-4 sm:px-6 md:px-8 border-t border-gray-100 overflow-hidden select-none">
      <div className="max-w-[1700px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-14">
          {subTitle && (
            <p className="text-[11px] md:text-[12px] uppercase tracking-[0.45em] text-stone-500 font-bold mb-4 font-instrument-sans">
              {subTitle}
            </p>
          )}
          {heading && (
            <h2 className="text-2xl md:text-3xl lg:text-[36px] xl:text-[38px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light max-w-3xl mx-auto px-2">
              {heading}
            </h2>
          )}
        </div>

        {/* Mobile/Tablet View: Swiper Slider (< md) */}
        <div className="md:hidden">
          <CommonSlider
            items={blogsToDisplay}
            renderItem={(blog) => renderBlogCard(blog)}
            spaceBetween={24}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2 },
            }}
            speed={800}
            className="pb-4"
          />
        </div>

        {/* Desktop View: Grid (>= md) */}
        <div className="hidden md:grid grid-cols-3 gap-8 md:gap-10">
          {blogsToDisplay.map((blog: BlogItem) => renderBlogCard(blog))}
        </div>
      </div>
    </section>
  );
};

export default FromBlog;
