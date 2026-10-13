import React from 'react';
import JewelryDynamic from '../_components/JewelryDynamic';

const formatSlugName = (slug: string) => {
    if (!slug) return '';
    return slug
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const page = async (props: {
    params: Promise<{ category: string; subcategory: string }>,
    searchParams: Promise<any>
}) => {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const categoryName = formatSlugName(params.category);
    const subcategoryName = formatSlugName(params.subcategory);

    const breadcrumbSchema = {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://aurajewels.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": categoryName,
                "item": `https://aurajewels.com/${params.category}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": subcategoryName,
                "item": `https://aurajewels.com/${params.category}/${params.subcategory}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema, null, 2),
                }}
            />
            <JewelryDynamic
                searchParams={searchParams}
                params={{ category: params.category, subcategory: params.subcategory }}
            />
        </>
    );
};

export default page;