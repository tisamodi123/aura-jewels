"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronDown, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getToken } from "@/lib/auth";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { DefaultCurrency } from "@/lib/utils";
import { callApi } from "@/lib/callApi";

export default function CollectionProductListDrawer({
    open,
    setOpen,
    collectionData,
}) {
    const token = getToken();
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [subcategoryList, setSubCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [sercheText, setSerchText] = useState("");
    const [debouncedSearch] = useDebounce(sercheText, 500);

    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalRows, setTotalRows] = useState(0);

    // Fetch Categories
    const GetCategoryList = async () => {
        try {
            const result = await callApi(`${API_URL?.GET_JEWELLERY_CATEGORY}`, "GET", null, token);
            console.log("Category List Response:", result);
            if (result?.errorCode === STATUS_CODE.OK) {
                setCategoryList(result?.data || []);
            }
        } catch (error) {
            console.log("Error fetching category data.", error);
        }
    };

    // Fetch Subcategories
    const GetSubCategoryList = async (id) => {
        try {
            const result = await callApi(`${API_URL?.GET_JEWELLERY_SUBCATEGORY}/${id}`, "GET", null, token);
            console.log("Subcategory List Response:", result);
            if (result?.errorCode === STATUS_CODE.OK) {
                setSubCategoryList(result?.data || []);
            } else {
                setSubCategoryList([]);
            }
        } catch (error) {
            console.log("Error fetching subcategory data.", error);
        }
    };


    // Fetch Products (POST request matching jewelleryComp.jsx)
    const GetJewelleryData = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("page", pagination.pageIndex + 1);
            formData.append("limit", pagination.pageSize);
            formData.append("search", debouncedSearch);
            formData.append("category", selectedCategory);
            formData.append("subcategory", selectedSubCategory);

            const result = await callApi(`${API_URL?.GET_JEWELLERY_LIST}`, "POST", formData, token);
            console.log('result in jewellry list  ->>>', result)
            if (result?.errorCode === STATUS_CODE.OK) {
                setProductList(result.data || []);
                setTotalRows(result.totalCount || 0);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error(M.common.fetchFailed);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            console.log("Drawer opened, resetting state and fetching categories...");
            // Reset all filters and pagination to default
            setPagination({ pageIndex: 0, pageSize: 10 });
            setSelectedCategory("");
            setSelectedSubCategory("");
            setSerchText("");
            setRowSelection({});

            GetCategoryList();
        }
    }, [open]);

    useEffect(() => {
        if (selectedCategory) {
            console.log("Category selected:", selectedCategory);
            GetSubCategoryList(selectedCategory);
        } else {
            setSubCategoryList([]);
            setSelectedSubCategory("");
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (open) {
            GetJewelleryData();
        }
    }, [open, pagination.pageIndex, pagination.pageSize, selectedCategory, selectedSubCategory, debouncedSearch]);


    // Auto-select products that are already in the current collection
    useEffect(() => {
        if (productList.length > 0 && collectionData) {
            const currentCollectionId = collectionData._id || collectionData.id;

            setRowSelection(prev => {
                const next = { ...prev };
                productList.forEach(product => {
                    const productId = product._id;
                    // Check if current collection ID exists in product's collections
                    const inCollection = product.productCollection?.some(
                        cid => String(cid) === String(currentCollectionId)
                    );

                    if (inCollection) {
                        next[productId] = true;
                    } else {
                        // If it's in the current product list but NOT in this collection, 
                        // remove it from selection (handles refresh after deselection)
                        delete next[productId];
                    }
                });
                return next;
            });
        }
    }, [productList, collectionData]);

    const handleClearCategory = () => {
        setSelectedCategory("");
        setSubCategoryList([]);
        setSelectedSubCategory("");
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleClearSubCategory = () => {
        setSelectedSubCategory("");
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleClearSearch = () => {
        setSerchText("");
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleAddProduct = async (jewelryId, flag) => {
        try {
            const formData = new FormData();
            formData.append("jewelryId", jewelryId);
            formData.append("collectionId", collectionData._id || collectionData.id);
            formData.append("flag", flag);

            const result = await callApi(`${API_URL?.ADD_COLLECTION_IN_JEWELRY}`, "POST", formData, token);
            if (result?.errorCode === STATUS_CODE.OK) {
                toast.success(result?.message || M.collection.updated);
                // Refresh data to ensure productCollections are updated correctly
                GetJewelleryData();
            } else {
                toast.error(result?.message || M.common.updateFailed);
            }
        } catch (error) {
            console.log("Error adding product to collection:", error);
            toast.error(M.common.updateFailed);
        }
    };

    const columns = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <div className="flex justify-center">
                        {/* <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer"
                            checked={table.getIsAllPageRowsSelected()}
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                table.toggleAllPageRowsSelected(isChecked);
                                const rows = table.getRowModel().rows;
                                rows.forEach(row => {
                                    handleAddProduct(row.original._id, isChecked ? 1 : 0);
                                });
                            }}
                        /> */}
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer"
                            checked={row.getIsSelected()}
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                row.toggleSelected(isChecked);
                                handleAddProduct(row.original._id, isChecked ? 1 : 0);
                            }}
                        />
                    </div>
                ),
            },
            {
                header: "#",
                cell: (info) => info.row.index + 1 + pagination.pageIndex * pagination.pageSize,
            },
            {
                header: "Collection",
                accessorKey: "collection",
                cell: () => collectionData?.collectionName || "-",
            },
            { header: "ICode", accessorKey: "itemCode" },
            { header: "PCode", accessorKey: "parentItem", cell: (info) => info.getValue() || "-" },
            { header: "Title", accessorKey: "productTitle" },
            { header: "Category", accessorKey: "category" },
            {
                header: "Subcategory",
                accessorKey: "subCategories",
                cell: (info) => {
                    const subs = info.getValue();
                    return Array.isArray(subs) ? subs.join(", ") : subs || "-";
                },
            },
            { header: "Metal Type", accessorKey: "metalType" },
            {
                header: "Price",
                accessorKey: "price",
                cell: (info) => info.getValue() ? `${DefaultCurrency}${info.getValue()}` : "-",
            },
        ],
        [pagination.pageIndex, pagination.pageSize, collectionData]
    );

    const table = useReactTable({
        data: productList,
        columns,
        state: {
            rowSelection,
            pagination,
        },
        getRowId: (row) => row._id,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(totalRows / pagination.pageSize),
    });

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[10000]" />
                <Dialog.Content className="fixed top-0 right-0 w-[80%] h-full bg-[#F8F9FA] z-[10000] shadow-2xl flex flex-col focus:outline-none">
                    {/* Top Header */}
                    <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200">
                        <div>
                            <Dialog.Title className="text-xl font-bold text-gray-800">
                                Collection Product List
                            </Dialog.Title>
                            <Dialog.Description className="sr-only">
                                List of products in the selected collection
                            </Dialog.Description>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>Dashboard</span>
                                <span>&gt;</span>
                                <span>Collection</span>
                                <span>&gt;</span>
                                <span className="text-gray-400">Collection Product List</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-black text-white px-4 py-2 rounded text-sm font-semibold">
                                Selected Products {selectedCount}
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="bg-white border border-gray-300 p-2 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Filters Area (Styled like jewelleryComp.jsx) */}
                    <div className="px-6 py-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            {/* <button
                                onClick={() => setOpen(false)}
                                className="bg-black text-white px-6 py-2 rounded text-sm font-medium cursor-pointer"
                            >
                                Back
                            </button> */}

                            <div className="flex-1 flex gap-4">
                                {/* Search */}
                                <div className="w-48 relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B]" />
                                        <Input
                                            type="text"
                                            placeholder="Search...."
                                            value={sercheText}
                                            onChange={(e) => setSerchText(e.target.value)}
                                            className="w-full bg-white pl-10 pr-10 text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0"
                                        />
                                        {sercheText && (
                                            <X
                                                onClick={handleClearSearch}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Category Select */}
                                <div className="w-48 relative">
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-full bg-white border-[#E4E8EE] text-[0.80rem] text-[#656B7B] flex justify-between items-center">
                                            <SelectValue placeholder="Category" />
                                            {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                                        </SelectTrigger>
                                        <SelectContent className="bg-white z-[10001]">
                                            <SelectGroup>
                                                {categoryList && categoryList.length > 0 ? (
                                                    categoryList.map((cat) => {
                                                        const id = cat.id ?? cat._id ?? cat.ID;
                                                        const name = cat.categoryName ?? cat.name ?? cat.category;
                                                        return (
                                                            <SelectItem
                                                                key={id}
                                                                value={String(id)}
                                                            >
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-2 text-xs text-gray-500 text-center">No categories found</div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {selectedCategory && (
                                        <X
                                            onClick={handleClearCategory}
                                            className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer z-10"
                                        />
                                    )}
                                </div>

                                {/* Sub Category Select */}
                                <div className="w-48 relative">
                                    <Select
                                        value={selectedSubCategory}
                                        onValueChange={setSelectedSubCategory}
                                        disabled={!selectedCategory}
                                    >
                                        <SelectTrigger className="w-full bg-white border-[#E4E8EE] text-[0.80rem] text-[#656B7B] flex justify-between items-center">
                                            <SelectValue placeholder="Sub Category" />
                                            {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                                        </SelectTrigger>
                                        <SelectContent className="bg-white max-h-[200px] overflow-y-auto z-[10001]">
                                            <SelectGroup>
                                                {subcategoryList && subcategoryList.length > 0 ? (
                                                    subcategoryList.map((sub) => {
                                                        const id = sub.id ?? sub._id ?? sub.ID;
                                                        const name = sub.categoryName ?? sub.name ?? sub.category;
                                                        return (
                                                            <SelectItem
                                                                key={id}
                                                                value={String(id)}
                                                            >
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-2 text-xs text-gray-500 text-center">No subcategories found</div>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {selectedSubCategory && (
                                        <X
                                            onClick={handleClearSubCategory}
                                            className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer z-10"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="flex-1 overflow-hidden px-6 pb-6">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">


                            {/* The Table */}
                            <div className="flex-1 overflow-auto jewelleryTable">
                                <table className="w-full border-collapse text-sm">
                                    <thead className="bg-[#F8F9FA] sticky top-0 z-10 border-b border-gray-200">
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(header => (
                                                    <th key={header.id} className="text-left px-4 py-3 font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                                                    Loading products...
                                                </td>
                                            </tr>
                                        ) : productList.length > 0 ? (
                                            table.getRowModel().rows.map(row => (
                                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id} className="px-4 py-3 text-gray-600 border-r border-gray-200 last:border-r-0">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                                                    No products found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span>Show</span>
                                        <select
                                            value={pagination.pageSize}
                                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none bg-white cursor-pointer"
                                        >
                                            {[10, 25, 50, 100].map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        <span>entries</span>
                                    </div>
                                    <div className="hidden sm:block">
                                        Showing {pagination.pageIndex * pagination.pageSize + 1} to {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)} of {totalRows} entries
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer font-medium"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center">
                                        {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => table.setPageIndex(pageNum - 1)}
                                                    className={`w-10 h-10 text-sm border border-gray-300 -ml-[1px] first:rounded-l last:rounded-r transition-colors cursor-pointer ${pagination.pageIndex === pageNum - 1 ? 'bg-black text-white font-bold' : 'bg-white hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer font-medium"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
