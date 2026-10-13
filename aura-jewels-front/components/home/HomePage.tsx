'use client';

import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { getCart, getWishlist } from '@/lib/commonApi';

// Dynamically import all home page sections for optimal performance
const HeroSlider = dynamic(() => import('@/components/HeroSlider'));
const ChaptersOfLight = dynamic(() => import('@/components/home/ChaptersOfLight'));
const SignatureShowcase = dynamic(() => import('@/components/home/SignatureShowcase'));
const TrendingBrilliance = dynamic(() => import('@/components/home/TrendingBrilliance'));
const CollectionsOfNote = dynamic(() => import('@/components/home/CollectionsOfNote'));
const BespokeExperience = dynamic(() => import('@/components/home/BespokeExperience'));
const ShopByBudget = dynamic(() => import('@/components/home/ShopByBudget'));
const ShopBySegment = dynamic(() => import('@/components/home/ShopBySegment'));
const GiftsOccasion = dynamic(() => import('@/components/home/GiftsOccasion'));
const EndlessMemories = dynamic(() => import('@/components/home/EndlessMemories'));
const InstagramSocial = dynamic(() => import('@/components/home/InstagramSocial'));
const DiamondShapes = dynamic(() => import('@/components/home/DiamondShapes'));
const HeritageHeirlooms = dynamic(() => import('@/components/home/HeritageHeirlooms'));
const NearbyStore = dynamic(() => import('@/components/home/NearbyStore'));

import FromBlog from '@/components/home/FromBlog';
import HomeSkeleton from '@/components/home/HomeSkeleton';

export default function HomeComponents({ homeOrder, homeSections }: { homeOrder?: string[], homeSections?: any }) {
    useEffect(() => {
        getCart();
        getWishlist();
    }, []);

    const renderSection = (key: string, data: any) => {
        // If explicitly disabled in CMS data, do not render
        if (data && data.enabled === false) return null;

        switch (key) {
            case "heroSlider":
                const mappedSlides = (data?.content?.slides || []).map((slide: any) => ({
                    ...slide,
                    title: slide.headingLine1 || slide.headingLine2 ? `${slide.headingLine1 || ""} ${slide.headingLine2 || ""}`.trim() : "",
                    subTitle: slide.desc || "",
                    subdescription: slide.label || "",
                    buttontext1: slide.ctaText || "",
                    buttonlink1: slide.redirect?.href || slide.redirect?.url || "",
                    status: "ACTIVE"
                }));
                return <HeroSlider key={key} banners={mappedSlides} disableLink={false} />;
            case "chaptersOfLight":
                const shopByCategoryData = {
                    info: { title: data?.content?.heading || data?.title, description: data?.content?.subText, status: "ACTIVE" },
                    categories: (data?.content?.items || []).map((item: any) => ({ ...item, link: (item.redirect?.href || item.redirect?.url || "") }))
                };
                return <ChaptersOfLight key={key} shopByCategoryData={shopByCategoryData} />;

            case "signatureShowcase":
                const eleganceData = {
                    title: data?.content?.heading || data?.title,
                    subTitle: data?.content?.subText,
                    description: data?.content?.description,
                    image: data?.content?.image || "",
                    imageMobile: data?.content?.imageMobile || "",
                    buttontext1: data?.content?.ctaText || "",
                    buttonlink1: data?.content?.redirect?.href || data?.content?.redirect?.url || ""
                };
                return <SignatureShowcase key={key} eleganceInEveryStyleData={eleganceData} productIds={data?.content?.productIds || []} productData={data?.content} />;
            case "trendingBrilliance":
                return <TrendingBrilliance key={key} data={data} />;
            case "collectionsOfNote":
                const collectionsData = (data?.content?.items || []).map((item: any) => ({
                    ...item,
                    link: (item.redirect?.href || item.redirect?.url || ""),
                    buttonlink1: (item.redirect?.href || item.redirect?.url || ""),
                    buttontext1: item.ctaText || ""
                }));
                return <CollectionsOfNote key={key} collectionsOfNoteData={collectionsData} info={{ heading: data?.content?.heading || "", subText: data?.content?.subText || "", buttontext: data?.content?.ctaText || "", buttonlink: data?.content?.redirect?.href || data?.content?.redirect?.url || "" }} />;
            case "bespokeExperience":
                const bespokeData = {
                    title: data?.content?.heading || data?.title,
                    subTitle: data?.content?.subText,
                    description: data?.content?.description,
                    image: data?.content?.image || "",
                    buttontext1: data?.content?.ctaText || "",
                    buttonlink1: data?.content?.redirect?.href || data?.content?.redirect?.url || "",
                    buttontext2: data?.content?.ctaText2 || "",
                    buttonlink2: data?.content?.redirect2?.href || data?.content?.redirect2?.url || ""
                };
                return <BespokeExperience key={key} bespokeExperienceData={bespokeData} />;
            case "shopByBudget":
                const budgetData = {
                    title: data?.content?.heading || data?.title,
                    subTitle: data?.content?.subText,
                    description: data?.content?.description,
                    buttontext1: data?.content?.ctaText || "",
                    buttonlink1: data?.content?.redirect?.href || data?.content?.redirect?.url || "",
                    status: "ACTIVE",
                    info: { title: data?.content?.heading || data?.title, description: data?.content?.subText, status: "ACTIVE" },
                    items: (data?.content?.items || []).map((item: any) => ({ ...item, link: (item.redirect?.href || item.redirect?.url || ""), buttonlink1: (item.redirect?.href || item.redirect?.url || ""), buttontext1: item.ctaText || "" }))
                };
                return <ShopByBudget key={key} shopByBudgetData={budgetData} productIds={data?.content?.productIds || []} productData={data?.content} />;
            case "shopBySegment":
                const segmentData = {
                    info: { title: data?.content?.heading || data?.title, description: data?.content?.subText, status: "ACTIVE" },
                    items: (data?.content?.items || []).map((item: any) => ({ ...item, link: (item.redirect?.href || item.redirect?.url || ""), buttonlink1: (item.redirect?.href || item.redirect?.url || ""), buttontext1: item.ctaText || "" }))
                };
                return <ShopBySegment key={key} shopBySegmentData={segmentData} />;
            case "giftsOccasion":
                const giftsData = {
                    info: {
                        title: data?.content?.heading || data?.title,
                        description: data?.content?.subText,
                        marqueeItems: data?.content?.marqueeItems || (data?.content?.marqueeText ? data.content.marqueeText.split('✦').map((s: any) => s.trim()) : []),
                        status: "ACTIVE"
                    },
                    items: (data?.content?.items || []).map((item: any) => ({ ...item, link: (item.redirect?.href || item.redirect?.url || ""), buttonlink1: (item.redirect?.href || item.redirect?.url || ""), buttontext1: item.ctaText || "" }))
                };
                return <GiftsOccasion key={key} giftsOccasionData={giftsData} />;
            case "endlessMemories":
                return <EndlessMemories key={key} data={data?.content} />;
            case "instagramSocial":
                const instaData = {
                    info: {
                        title: data?.content?.heading || data?.title,
                        description: data?.content?.subText,
                        buttontext1: data?.content?.ctaText,
                        buttonlink1: data?.content?.ctaLink,
                        status: "ACTIVE"
                    },
                    items: data?.content?.items || []
                };
                return <InstagramSocial key={key} instagramSocialData={instaData} />;
            case "diamondShapes":
                return <DiamondShapes key={key} diamondShapesData={data} />;
            case "heritageHeirlooms":
            case "customerReflections":
            case "heritage":
            case "heirlooms":
                return <HeritageHeirlooms key={key} data={data?.content || data} />;
            case "fromTheBlog":
            case "fromBlog":
            case "blog":
                return <FromBlog key={key} data={data?.content || data} />;
            case "preciousForever":
            case "nearbyStore":
            case "storeLocator":
            case "nearby":
                return <NearbyStore key={key} data={data?.content || data} />;
            default:
                return null;
        }
    };

    if (!homeOrder || homeOrder.length === 0 || !homeSections) {
        return <HomeSkeleton />;
    }

    const hasEndlessMemories = homeOrder.includes("endlessMemories");
    const hasHeritageHeirlooms = homeOrder.includes("heritageHeirlooms") || homeOrder.includes("customerReflections") || homeOrder.includes("heritage") || homeOrder.includes("heirlooms");

    let blogRendered = false;
    let storeRendered = false;
    let heritageRendered = false;

    const renderedOrder = homeOrder.map(key => {
        const data = homeSections[key];
        const rendered = renderSection(key, data);
        if ((key === "fromTheBlog" || key === "fromBlog" || key === "blog") && rendered !== null) {
            blogRendered = true;
        }
        if ((key === "preciousForever" || key === "nearbyStore" || key === "storeLocator" || key === "nearby") && rendered !== null) {
            storeRendered = true;
        }
        if ((key === "heritageHeirlooms" || key === "customerReflections" || key === "heritage" || key === "heirlooms") && rendered !== null) {
            heritageRendered = true;
        }
        return rendered;
    });

    const blogData = homeSections?.fromTheBlog?.content || homeSections?.fromTheBlog || homeSections?.fromBlog?.content || homeSections?.blog?.content;
    const storeData = homeSections?.preciousForever?.content || homeSections?.preciousForever || homeSections?.nearbyStore?.content || homeSections?.storeLocator?.content;
    const heritageData = homeSections?.heritageHeirlooms?.content || homeSections?.customerReflections?.content || homeSections?.heritage?.content;

    return (
        <div className="animate-fadeIn  overflow-x-hidden bg-white">
            {renderedOrder}
            {!hasEndlessMemories && (
                <EndlessMemories />
            )}
            {!heritageRendered && !hasHeritageHeirlooms && (
                <HeritageHeirlooms data={heritageData} />
            )}
            {!blogRendered && (
                <FromBlog data={blogData} />
            )}
            {!storeRendered && (
                <NearbyStore data={storeData} />
            )}
        </div>
    );
}