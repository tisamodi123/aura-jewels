"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { useRouter, useSearchParams } from "next/navigation";
import SectionTable from "./component/SectionTable";
import AddNewModal from "./component/AddNewModal";
import UpdateSection from "./component/UpdateSection";

import { toast } from "sonner";

export default function page() {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sectionData, setSectionData] = useState([]);
    const [mostLovedProducts, setMostLovedProducts] = useState([]);
    const [isLovedLoading, setIsLovedLoading] = useState(false);


    console.log('sectionData ->', sectionData)
    const [categories, setCategories] = useState([]);
    console.log('categories ->>', categories)
    const [selectedCategory, setSelectedCategory] = useState("");

    const token = getToken();
    const searchParams = useSearchParams();
    const queryCategoryId = searchParams.get("categoryId");

    const getCategoryList = async () => {
        try {
            const data = await fetch(`${API_URL.GET_CATEGORY_LIST}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res = await data.json();
            if (res?.errorCode === 200) {
                setCategories(res?.data || []);
            }
        } catch (error) {
            console.error('Error get From category list:', error);
        }
    };

    useEffect(() => {
        if (categories?.length > 0 && !selectedCategory) {
            if (queryCategoryId) {
                setSelectedCategory(queryCategoryId);
            } else {
                const engagementCat = categories.find(cat =>
                    cat.categoryName.toLowerCase().includes("engagement")
                );
                if (engagementCat) {
                    setSelectedCategory(String(engagementCat.id || engagementCat._id));
                } else {
                    setSelectedCategory(String(categories[0].id || categories[0]._id));
                }
            }
        }
    }, [categories, queryCategoryId]);
    //   Fetch Table Data
    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            const formdata = new FormData();
            formdata.append("sectionName", "popular-designs");
            formdata.append("CategoryId", selectedCategory);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: formdata,
            };

            const response = await fetch(API_URL?.GET_LANDING_BANNER, requestOptions);

            const result = await response.json();
            console.log("API result:", result);

            if (result?.errorCode == 200) {
                setSectionData(result.data);
            } else {
                toast.error(result?.message)
                setSectionData([]);
            }
        } catch (error) {
            console.log("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, token]);

    const fetchMostLoved = async (catId) => {
        if (!catId) {
            setMostLovedProducts([]);
            return;
        }
        try {
            setIsLovedLoading(true);
            const headers = new Headers();
            headers.append("Authorization", `Bearer ${token}`);
            const response = await fetch(`${API_URL.GET_CATEGORY_MOST_ENGAGEMENT_RING}${catId}`, {
                method: "GET",
                headers,
            });
            const result = await response.json();
            if (result?.errorCode === 200) {
                setMostLovedProducts(result.data || []);
            } else {
                setMostLovedProducts([]);
            }
        } catch (error) {
            console.error("Error fetching most loved products:", error);
            setMostLovedProducts([]);
        } finally {
            setIsLovedLoading(false);
        }
    };


    useEffect(() => {
        getCategoryList();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchData();
            fetchMostLoved(selectedCategory);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (!isEditOpen) {
            setEditData(null);
        }
    }, [isEditOpen]);


    return (

        <>
            <div>
                {" "}
                <div className=" p-2 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/cms/landing"
                            className="text-zinc-600 hover:text-black flex items-center gap-1 text-[0.8rem]"
                        >
                            <ChevronLeft size={16} /> Back
                        </Link>
                        <div className="font-semibold text-xl">Popular Designs (Sub Banner)</div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[200px] h-[36px] bg-white border border-[#E4E8EE] focus:outline-none focus:ring-0">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white z-[10000]">
                                    <SelectGroup>
                                        {categories?.length > 0 ? (
                                            categories.map((item) => (
                                                <SelectItem key={item.id || item._id} value={String(item.id || item._id)}>
                                                    {item.categoryName}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-gray-500">No categories found</div>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="hand h-[36px] px-5 flex items-center rounded-md justify-center font-normal bg-black text-[0.80rem] text-white"
                        >
                            + Add New
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
                    <SectionTable
                        tableData={sectionData}
                        fetchData={fetchData}
                        isLoading={isLoading}
                        categories={categories}
                        setEditData={setEditData}
                        setIsEditOpen={setIsEditOpen}
                    />
                </div>

                {/* Most Loved Products Table (Outside) */}
                <div className="mt-10">
                    <div className=" p-2 mb-3 flex items-center justify-between">
                        <div className="font-semibold text-xl">Most Engaged Products</div>
                        {isLovedLoading && <div className="text-sm text-gray-400 animate-pulse">Updating...</div>}
                    </div>
                    <div className="bg-white border border-zinc-200 shadow-md rounded-md overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#F8FAFC]">
                                <tr>
                                    <th className="px-6 py-4 text-[0.80rem] font-bold text-gray-600 border-b border-r border-[#E4E8EE] w-20">Sr.No</th>
                                    <th className="px-6 py-4 text-[0.80rem] font-bold text-gray-600 border-b border-r border-[#E4E8EE]">Item Code</th>
                                    <th className="px-6 py-4 text-[0.80rem] font-bold text-gray-600 border-b border-[#E4E8EE]">Category</th>
                                </tr>
                            </thead>
                            <tbody className="text-[0.85rem]">
                                {mostLovedProducts.length > 0 ? (
                                    mostLovedProducts.map((product, idx) => {
                                        let currentCodes = [];
                                        if (editData && editData.itemcode) {
                                            if (Array.isArray(editData.itemcode)) {
                                                currentCodes = editData.itemcode;
                                            } else if (typeof editData.itemcode === 'string') {
                                                currentCodes = editData.itemcode.split(",").map(c => c.trim());
                                            }
                                        }
                                        const isActive = currentCodes.includes(product.itemCode);

                                        return (
                                            <tr key={product._id || idx} className={`${isActive ? "bg-blue-50/50" : "hover:bg-gray-50"} transition-colors`}>
                                                <td className="px-6 py-4 border-b border-r border-[#E4E8EE] text-gray-500">
                                                    {idx + 1}
                                                </td>
                                                <td className={`px-6 py-4 border-b border-r font-medium select-all cursor-pointer `}>
                                                    {product.itemCode}

                                                </td>
                                                <td className="px-6 py-4 border-b border-[#E4E8EE] text-gray-400 uppercase font-medium">{product.category}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-400 bg-gray-50/30">
                                            {isLovedLoading ? "Fetching most engaged products..." : "No data available for the selected category"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddNewModal open={isOpen} setOpen={setIsOpen} fetchData={fetchData} selectedCategory={selectedCategory} categories={categories} />

            {isEditOpen && editData && (
                <UpdateSection
                    open={isEditOpen}
                    setOpen={setIsEditOpen}
                    data={editData}
                    refetchFn={fetchData}
                    categories={categories}
                />
            )}
        </>
    );

}
