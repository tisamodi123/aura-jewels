
import Link from 'next/link';
import CategoryHero from './CategoryHero';
import SubCategoryGrid from './SubCategoryGrid';
import FeaturedGrid from './FeaturedGrid';
import FeaturedCollection from './FeaturedCollection';
import BadgeBar from './BadgeBar';
import PopularDesigns from './PopularDesigns';
import BespokeSection from './BespokeSection';
import CategoryReviews from './CategoryReviews';
import JewelleryListFaq from '@/components/home/JewelleryListFaq';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';

interface CategoryProps {
    category: string;
}

export default async function Category({ category }: CategoryProps) {
    let landingData: any = null;
    try {
        const landingRes = await callApi(ENDPOINTS.HOME.GET_CATEGORY_LANDING_PAGE_DATA, "POST", { categorySlug: category });
        if (landingRes?.errorCode === 200 && landingRes.data) {
            landingData = landingRes.data;
        }
    } catch (error) {
        console.error("Error fetching category landing data:", error);
    }

    if (!landingData) {
        return (
            <div className="w-full bg-white min-h-screen flex items-center justify-center">
                <p className="text-gray-500 font-medium">Failed to load category data.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full bg-white">
            {/* 0. Breadcrumb */}
            <div className="bg-white py-4 px-6 md:px-12 border-b border-gray-50">
                <div className="flex items-center space-x-2 text-[11px] md:text-xs font-jakarta tracking-wide uppercase">
                    <Link href="/" className="text-gray-400 hover:text-[#013D3D] transition-colors">Home</Link>
                    <span className="text-gray-300 font-light">/</span>
                    <span className="text-gray-900 font-medium capitalize">{category.replace(/-/g, ' ')}</span>
                </div>
            </div>

            {/* 1. Hero Section */}
            <CategoryHero category={category} heroBanner={landingData?.heroBanner} />

            {/* 2. Sub-Category Selector */}
            <SubCategoryGrid category={category} exploreByStyle={landingData?.exploreByStyle} />

            {/* 3. Featured Banners */}
            <FeaturedGrid promoGrid={landingData?.promoGrid} promoGridTitle={landingData?.promoGridTitle} />

            {/* 3b. Featured Collection banner */}
            <FeaturedCollection featured={landingData?.featured} />

            {/* 4. Trust Badges */}
            <BadgeBar />

            {/* 5. Most Popular Products */}
            <PopularDesigns popularDesigns={landingData?.popularDesigns} info={landingData?.popularDesignsInfo} />

            {/* 6. Bespoke / Custom Section */}
            <BespokeSection customCTA={landingData?.customCTA} />

            {/* 7. Reviews Section */}
            <CategoryReviews wordsOfTrust={landingData?.wordsOfTrust} />

            {/* 8. FAQ Section */}
            <JewelleryListFaq />
        </div>
    );
}