import ProductDetail from "./components/ProductDetail";
import { getProductDetails } from "@/services/productService";
import { getImageUrl } from "@/lib/utils";

export default async function ProductPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{
        ringsize?: string;
        diamond_origin?: string;
        stone_quality?: string;
    }>;
}) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const ringsize = resolvedSearchParams.ringsize;
    const diamond_origin = resolvedSearchParams.diamond_origin;
    const stone_quality = resolvedSearchParams.stone_quality;

    let color: string | undefined = undefined;
    let clarity: string | undefined = undefined;
    if (stone_quality && typeof stone_quality === "string") {
        const parts = stone_quality.split("/");
        if (parts.length === 2) {
            color = parts[0];
            clarity = parts[1];
        }
    }

    let product = null;
    try {
        let result = await getProductDetails(id, ringsize, color, clarity, diamond_origin);
        if ((!result || result.errorCode !== 200 || !result.data) && (ringsize || color || clarity || diamond_origin)) {
            console.log(`Failed to fetch product details with configurations, retrying with id...`);
            result = await getProductDetails(id);
        }

        console.log("result product detail page -------->", result)

        if (result?.errorCode === 200 && result?.data) {
            const fetchedProduct = result.data;
            const parentCode = fetchedProduct.parentItemCode;
            const currentCode = fetchedProduct.itemCode;

            if (parentCode && parentCode !== currentCode) {
                let parentResult = await getProductDetails(parentCode, ringsize, color, clarity, diamond_origin);
                if ((!parentResult || parentResult.errorCode !== 200 || !parentResult.data) && (ringsize || color || clarity || diamond_origin)) {
                    console.log(`Failed to fetch parent product details with configurations, retrying without...`);
                    parentResult = await getProductDetails(parentCode);
                }

                if (parentResult?.errorCode === 200 && parentResult?.data) {
                    product = parentResult.data;
                } else {
                    product = fetchedProduct;
                }
            } else {
                product = fetchedProduct;
            }
        }
    } catch (error) {
        console.error("Error loading product", error);
    }

    // console.log("product", product)

    // Generate dynamic JSON-LD Product structured data
    let productSchema = null;
    if (product) {
        let productImageRaw = getImageUrl(product);
        let productImage = productImageRaw;

        // Make the image URL fully qualified if it's relative
        if (productImageRaw && !productImageRaw.startsWith('http')) {
            productImage = `https://aurajewels.com${productImageRaw.startsWith('/') ? '' : '/'}${productImageRaw}`;
        }

        const productTitle = product.productTitle || product.title || product.name || "Celestial Grace Band";
        const productSku = product.sku || product.itemCode || product.itemcode || "WR-AA05552-9KT-Y";
        const productSlug = product.slug || product.urlKey || product.itemCode || id;

        // Normalize description by stripping possible HTML tags
        const descriptionRaw = product.description || product.sdescription || "";
        const productDescription = (typeof descriptionRaw === 'string' && descriptionRaw.trim())
            ? descriptionRaw.replace(/<[^>]*>/g, '')
            : "A sleek shared-prong band featuring brilliant round diamonds, offering graceful sparkle, refined craftsmanship, and a timeless silhouette designed for effortless elegance and everyday sophistication.";

        const ratingValue = product.rating || "4.5";
        const ratingCount = product.reviewCount || "35";

        productSchema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": productTitle,
            "image": productImage || "",
            "description": productDescription,
            "brand": {
                "@type": "Brand",
                "name": "Aura Jewels"
            },
            "sku": productSku,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": String(ratingValue),
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": String(ratingCount)
            },
            "offers": {
                "@type": "Offer",
                "price": String(product.finalPrice || product.price || 0),
                "priceCurrency": product.currency || "INR",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock",
                "url": `https://aurajewels.com/product/${productSlug}`
            }
        };
    }

    const categoryName = product?.categoryDetails?.categoryName || product?.categoryName || "Jewellery";
    const categorySlug = product?.categoryDetails?.slug || product?.categorySlug || "all";
    const productTitle = product?.productTitle || product?.title || product?.name || "";
    const productSlug = product?.slug || product?.urlKey || product?.itemCode || id;

    const breadcrumbSchema = product ? {
        "@context": "https://schema.org",
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
                "item": `https://aurajewels.com/${categorySlug}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": productTitle,
                "item": `https://aurajewels.com/product/${productSlug}`
            }
        ]
    } : null;

    return (
        <>
            {productSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(productSchema, null, 2)
                    }}
                />
            )}

            {breadcrumbSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbSchema, null, 2),
                    }}
                />
            )}

            {!product ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
                    </div>
                </div>
            ) : (
                <ProductDetail
                    data={product}
                    initialRingsize={ringsize}
                    initialActiveId={id}
                    initialDiamondOrigin={diamond_origin}
                    initialStoneQuality={stone_quality}
                />
            )}
        </>
    );
}