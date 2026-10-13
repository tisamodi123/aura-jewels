import JewelryDynamic from './_components/JewelryDynamic';
import Category from './_components/Category';
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

    // Skip landing page if category slug is a generic/non-specific category name
    const nonSpecificCategories = ["all", "all-products", "shop", "jewelry", "jewellery", "all-jewelry"];
    const isGeneric = params.category && nonSpecificCategories.includes(params.category.toLowerCase());

    const categoryName = formatSlugName(params.category);
    const subcategoryName = params.subcategory ? formatSlugName(params.subcategory) : null;

    const breadcrumbItems: any[] = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://aurajewels.com/"
        }
    ];

    if (categoryName) {
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": `https://aurajewels.com/${params.category}`
        });
    }

    if (subcategoryName) {
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 3,
            "name": subcategoryName,
            "item": `https://aurajewels.com/${params.category}/${params.subcategory}`
        });
    }

    const breadcrumbSchema = {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema, null, 2),
                }}
            />
            {params.category && !params.subcategory && Object.keys(searchParams).length === 0 && !isGeneric && params.category.toLowerCase() !== 'diamonds' ? (
                <Category category={params.category} />
            ) : (
                <JewelryDynamic
                    searchParams={searchParams}
                    params={{ category: params.category, subcategory: params.subcategory }}
                />
            )}
        </>
    );
}

export default page;