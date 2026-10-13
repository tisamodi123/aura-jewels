import { PREFIX } from '@/lib/constants';

export interface StaticSubCategoryItem {
    id?: string;
    name: string;
    slug: string;
    image: string;
}

export const CATEGORY_STATIC_SUBCATEGORIES: Record<string, StaticSubCategoryItem[]> = {
    rings: [
        { name: 'Solitaire', slug: 'solitaire', image: `${PREFIX}/images/category-landing/Category/LR15252_render_1.png` },
        { name: 'Halo', slug: 'halo', image: `${PREFIX}/images/category-landing/Category/LR15287_render_2.png` },
        { name: 'Three-Stone', slug: 'three-stone', image: `${PREFIX}/images/category-landing/Category/LR15313_render_1.png` },
        { name: 'Pavé & Accents', slug: 'accents', image: `${PREFIX}/images/category-landing/Category/LR15477_render_1.png` },
        { name: 'Vintage Inspired', slug: 'vintage', image: `${PREFIX}/images/category-landing/Category/LR17586_render_2.png` },
        { name: 'Bands & Eternity', slug: 'bands', image: `${PREFIX}/images/category-landing/Category/LR15252_render_2.png` },
        { name: 'Toi et Moi', slug: 'toi-et-moi', image: `${PREFIX}/images/category-landing/Category/LR15313_render_2.png` },
    ],
    earrings: [
        { name: 'Studs', slug: 'studs', image: `${PREFIX}/images/category-landing/Category/ER15067_render_1.png` },
        { name: 'Hoops', slug: 'hoops', image: `${PREFIX}/images/category-landing/Category/ER15108_render_1.png` },
        { name: 'Drops', slug: 'drops', image: `${PREFIX}/images/category-landing/Category/ER15267_render_1.png` },
        { name: 'Danglers', slug: 'danglers', image: `${PREFIX}/images/category-landing/Category/ER15324_render_1.png` },
        { name: 'Solitaire Studs', slug: 'solitaire-studs', image: `${PREFIX}/images/category-landing/Category/ER15067_render_2.png` },
        { name: 'Huggies', slug: 'huggies', image: `${PREFIX}/images/category-landing/Category/ER15108_render_2.png` },
        { name: 'Chandbali & Traditional', slug: 'traditional', image: `${PREFIX}/images/category-landing/Category/ER15267_render_2.png` },
    ],
    pendants: [
        { name: 'Solitaire Pendants', slug: 'solitaire-pendants', image: `${PREFIX}/images/category-landing/Category/PN10232_render_1.png` },
        { name: 'Halo Pendants', slug: 'halo-pendants', image: `${PREFIX}/images/category-landing/Category/PN10239_render_1.png` },
        { name: 'Heart Pendants', slug: 'heart-pendants', image: `${PREFIX}/images/category-landing/Category/PN10397_render_1.png` },
        { name: 'Alphabet & Initial', slug: 'initial-pendants', image: `${PREFIX}/images/category-landing/Category/PN10408_render_1.png` },
        { name: 'Floral Pendants', slug: 'floral-pendants', image: `${PREFIX}/images/category-landing/Category/PN10417_render_1.png` },
        { name: 'Religious & Lucky', slug: 'spiritual-pendants', image: `${PREFIX}/images/category-landing/Category/PN10232_render_2.png` },
    ],
    necklace: [
        { name: 'Tennis Necklace', slug: 'tennis-necklace', image: `${PREFIX}/images/category-landing/Category/NK15008_render_1.png` },
        { name: 'Choker Necklace', slug: 'chokers', image: `${PREFIX}/images/category-landing/Category/NK15010_render_1.png` },
        { name: 'Layered Necklace', slug: 'layered-necklace', image: `${PREFIX}/images/category-landing/Category/NK15026_render_1.png` },
        { name: 'Statement Necklace', slug: 'statement-necklace', image: `${PREFIX}/images/category-landing/Category/NK15028_render_1.png` },
        { name: 'Pendant Necklace', slug: 'pendant-necklace', image: `${PREFIX}/images/category-landing/Category/NK15070_render_1.png` },
    ],
    bracelets: [
        { name: 'Tennis Bracelets', slug: 'tennis-bracelets', image: `${PREFIX}/images/category-landing/Category/BR15004_render_1.png` },
        { name: 'Chain Bracelets', slug: 'chain-bracelets', image: `${PREFIX}/images/category-landing/Category/BR15035_render_1.png` },
        { name: 'Charm Bracelets', slug: 'charm-bracelets', image: `${PREFIX}/images/category-landing/Category/BR15073_render_1.png` },
        { name: 'Diamond Bangles', slug: 'diamond-bangles', image: `${PREFIX}/images/category-landing/Category/BR15083_render_1.png` },
        { name: 'Cuff Bracelets', slug: 'cuff-bracelets', image: `${PREFIX}/images/category-landing/Category/BR15142_render_1.png` },
    ],
    'bracelets-bangles': [
        { name: 'Tennis Bracelets', slug: 'tennis-bracelets', image: `${PREFIX}/images/category-landing/Category/BR15004_render_1.png` },
        { name: 'Chain Bracelets', slug: 'chain-bracelets', image: `${PREFIX}/images/category-landing/Category/BR15035_render_1.png` },
        { name: 'Charm Bracelets', slug: 'charm-bracelets', image: `${PREFIX}/images/category-landing/Category/BR15073_render_1.png` },
        { name: 'Diamond Bangles', slug: 'diamond-bangles', image: `${PREFIX}/images/category-landing/Category/BR15083_render_1.png` },
        { name: 'Cuff Bangles', slug: 'cuff-bangles', image: `${PREFIX}/images/category-landing/Category/BR15142_render_1.png` },
    ],
    watches: [
        { name: 'Diamond Timepieces', slug: 'diamond-watches', image: `${PREFIX}/images/category-landing/Category/LR15477_render_1.png` },
        { name: 'Classic Steel', slug: 'steel-watches', image: `${PREFIX}/images/category-landing/Category/BR15004_render_1.png` },
        { name: 'Rose Gold Edition', slug: 'rose-gold-watches', image: `${PREFIX}/images/category-landing/Category/ER15067_render_1.png` },
        { name: 'Automatic Luxury', slug: 'automatic-watches', image: `${PREFIX}/images/category-landing/Category/NK15008_render_1.png` },
    ],
    collections: [
        { name: 'Contemporary', slug: 'contemporary', image: `${PREFIX}/images/category-landing/Category/LR15252_render_1.png` },
        { name: 'Engagement & Wedding', slug: 'engagement', image: `${PREFIX}/images/category-landing/Category/ER15067_render_1.png` },
        { name: 'Daily & Office Wear', slug: 'daily-wear', image: `${PREFIX}/images/category-landing/Category/PN10232_render_1.png` },
        { name: 'Royal Heritage', slug: 'heritage', image: `${PREFIX}/images/category-landing/Category/NK15008_render_1.png` },
    ],
};

const FALLBACK_RENDER_IMAGES = [
    `${PREFIX}/images/category-landing/Category/LR15252_render_1.png`,
    `${PREFIX}/images/category-landing/Category/ER15067_render_1.png`,
    `${PREFIX}/images/category-landing/Category/PN10232_render_1.png`,
    `${PREFIX}/images/category-landing/Category/NK15008_render_1.png`,
    `${PREFIX}/images/category-landing/Category/BR15004_render_1.png`,
    `${PREFIX}/images/category-landing/Category/LR15287_render_2.png`,
    `${PREFIX}/images/category-landing/Category/ER15108_render_1.png`,
];

export function getResolvedSubcategories(categorySlug?: string, cmsStyleList?: any[]): StaticSubCategoryItem[] {
    const catLower = (categorySlug || '').toLowerCase();

    // 1. For 'rings', if CMS returns items with images, use CMS items
    if (catLower === 'rings' && Array.isArray(cmsStyleList) && cmsStyleList.length > 0) {
        return cmsStyleList.map((item: any, idx: number) => ({
            id: item._id || item.id || '',
            name: item.categoryName || item.paraMtrName || item.name || '',
            slug: item.slug || (item.name || '').toLowerCase().replace(/\s+/g, '-'),
            image: item.image || item.image1 || FALLBACK_RENDER_IMAGES[idx % FALLBACK_RENDER_IMAGES.length],
        }));
    }

    // 2. For all other categories, use high-res transparent renders from category-landing/Category
    if (CATEGORY_STATIC_SUBCATEGORIES[catLower]) {
        return CATEGORY_STATIC_SUBCATEGORIES[catLower];
    }

    // Partial matching for category names
    for (const key of Object.keys(CATEGORY_STATIC_SUBCATEGORIES)) {
        if (catLower.includes(key) || key.includes(catLower)) {
            return CATEGORY_STATIC_SUBCATEGORIES[key];
        }
    }

    // 3. Fallback: If CMS has style items, use them with guaranteed distinct transparent render images
    if (Array.isArray(cmsStyleList) && cmsStyleList.length > 0) {
        return cmsStyleList.map((item: any, idx: number) => ({
            id: item._id || item.id || '',
            name: item.categoryName || item.paraMtrName || item.name || '',
            slug: item.slug || (item.name || '').toLowerCase().replace(/\s+/g, '-'),
            image: item.image || FALLBACK_RENDER_IMAGES[idx % FALLBACK_RENDER_IMAGES.length],
        }));
    }

    return CATEGORY_STATIC_SUBCATEGORIES.rings;
}
