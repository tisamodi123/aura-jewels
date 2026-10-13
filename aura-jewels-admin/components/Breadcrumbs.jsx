"use client";

//** Next imports */
import Link from "next/link";
import { usePathname } from "next/navigation";

//** Third party imports */
import { HomeIcon } from "lucide-react";

const breadcrumbMap = {
    "dashboard": "Dashboard",

    "products": "Products",
    "diamond": "Diamond",

    "settings": "Settings",

    "users": "Users",

    "price-discount": "Price & Discount",

    "diamond-margin": "Diamond Margin"
};

const Breadcrumbs = () => {
    const pathname = usePathname(); // Get the current route
    const pathSegments = pathname.split("/").filter(Boolean); // Remove empty segments

    return (
        <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm">
            <nav aria-label="Breadcrumb" className="flex items-center">
                <ol className="flex items-center space-x-2">
                    {/* Home Link */}
                    <li>
                        <Link href="/dashboard" className="flex items-center text-blue-900">
                            <HomeIcon size={18} className="mr-2" />
                            <span>Home</span>
                        </Link>
                    </li>

                    {/* Dynamic Breadcrumbs */}
                    {pathSegments.map((segment, index) => {
                        const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathSegments.length - 1;

                        return (
                            <li key={url} className="flex items-center">
                                <span className="mr-2">/</span>
                                {isLast ? (
                                    <span className="text-gray-500">{breadcrumbMap[segment] || segment}</span>
                                ) : (
                                    // <Link href={url} className="text-blue-900">
                                    //     {breadcrumbMap[segment] || segment}
                                    // </Link>
                                    <span className="text-gray-500">
                                        {breadcrumbMap[segment] || segment}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};

export default Breadcrumbs;
