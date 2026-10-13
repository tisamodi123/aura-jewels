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
import { toast } from "sonner";

export default function page() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sectionData, setSectionData] = useState([]);
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
            formdata.append("sectionName", "featured-collection");
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

    useEffect(() => {
        getCategoryList();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchData();
        }
    }, [selectedCategory]);

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
                        <div className="font-semibold text-xl">Featured Collection</div>
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
                    />
                </div>
            </div>
            <AddNewModal open={isOpen} setOpen={setIsOpen} fetchData={fetchData} selectedCategory={selectedCategory} categories={categories} />
        </>
    );
}
