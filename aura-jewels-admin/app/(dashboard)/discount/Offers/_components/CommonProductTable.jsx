// components/CommonProductTable.jsx

import { OFFER_FILTER_TYPE } from "@/lib/Constant";
import { useOfferStore } from "@/lib/stores/offerStore";
import { Image as ImageIcon } from "lucide-react";

export default function CommonProductTable({
    products = [],
    selectedProducts = [],
    onToggleSelect,
    onSelectAll,
    isAllSelected = false,
    loading = false,
}) {

    const { filterType, customeMode } = useOfferStore();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-sm text-gray-500">
                    Loading products...
                </span>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-600">

                        {filterType === "custom" && (
                            <th className="w-12 px-4 py-3 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) =>
                                        onSelectAll?.(e.target.checked)
                                    }
                                    className="h-4 w-4 cursor-pointer rounded border-gray-300"
                                />
                            </th>
                        )}

                        {/* <th className="px-3 py-3 text-left">Preview</th> */}
                        <th className="px-3 py-3 text-left">Product Name</th>
                        <th className="px-3 py-3 text-left">SKU</th>
                        <th className="px-3 py-3 text-left">Category</th>
                        <th className="px-3 py-3 text-left">Price</th>
                        <th className="px-3 py-3 text-center">Status</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={7}>
                                <div className="flex flex-col items-center justify-center py-16">
                                    <ImageIcon
                                        size={32}
                                        className="text-gray-300"
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        No products found
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => {
                            const isSelected =
                                selectedProducts.includes(product._id);

                            const image =
                                product.image ||
                                product.images?.[0]?.MediaLocation;

                            return (
                                <tr
                                    key={product._id}
                                    onClick={() =>
                                        filterType === "custom" ? onToggleSelect?.(product._id) : null
                                    }
                                    className={`
                                        cursor-pointer transition-colors
                                        hover:bg-gray-50
                                        ${isSelected
                                            ? "bg-gray-50"
                                            : "bg-white"
                                        }
                                    `}
                                >
                                    {filterType === "custom" && (
                                        <td
                                            className="px-4 py-3 text-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    onToggleSelect?.(product._id)
                                                }
                                                className="h-4 w-4 cursor-pointer rounded border-gray-300"
                                            />
                                        </td>
                                    )}

                                    {/* <td className="px-3 py-3">
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-gray-50">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={
                                                        product.productTitle
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon
                                                    size={16}
                                                    className="text-gray-300"
                                                />
                                            )}
                                        </div>
                                    </td> */}

                                    <td className="px-3 py-3 font-medium text-gray-900">
                                        {product.productTitle || "Untitled"}
                                    </td>

                                    <td className="px-3 py-3 font-mono text-gray-500">
                                        {product.itemCode || "-"}
                                    </td>

                                    <td className="px-3 py-3 text-gray-600">
                                        {product.category?.categoryName ||
                                            "Uncategorized"}
                                    </td>

                                    <td className="px-3 py-3 font-semibold text-gray-900">
                                        ₹
                                        {(
                                            product.finalPrice ||
                                            product.overallPrice ||
                                            product.sellingPrice ||
                                            0
                                        ).toLocaleString()}
                                    </td>

                                    <td className="px-3 py-3 text-center">
                                        <span
                                            className={`
                                                inline-flex rounded-full px-2.5 py-1
                                                text-[10px] font-semibold uppercase
                                                ${product.status ===
                                                    "available"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }
                                            `}
                                        >
                                            {product.status || "available"}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}