"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SmallSpinner from "@/components/SmallSpinner";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function CategoryLandingCmsListPage() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const token = getToken();

    const getCategoryList = async () => {
        try {
            setLoading(true);
            const data = await fetch(`${API_URL.GET_CATEGORY_LIST}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res = await data.json();
            if (res?.errorCode === 200) {
                const list = res?.data || [];
                setCategories(list);
                if (list.length > 0) {
                    // Default to engagement category if available
                    const earringCat = list.find(cat => 
                        cat.categoryName.toLowerCase().includes("earrings")
                    );
                    setSelectedCategory(String(earringCat ? (earringCat.id || earringCat._id) : (list[0].id || list[0]._id)));
                }
            }
        } catch (error) {
            console.error('Error fetching category list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategoryList();
    }, []);

    const landingSections = [
        { key: "hero-banner", label: "Hero Banner" },
        { key: "explore-by-style", label: "Explore By Style" },
        { key: "double-promo-grid-title", label: "Double Promo Grid Title" },
        { key: "double-promo-grid", label: "Double Promo Grid" },
        { key: "popular-designs", label: "Popular Designs" },
        { key: "custom-cta", label: "Custom CTA" },
        { key: "featured-collection", label: "Featured Collection" },
        { key: "words-of-trust", label: "Words of Trust (Reviews)" },
    ];

    return (
        <div>
            <div className="p-2 mb-3 flex items-center justify-between">
                <div className="font-semibold text-xl">Category Landing CMS</div>
                <div className="flex gap-2 items-center">
                    {!loading && categories.length > 0 && (
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[200px] h-[36px] bg-white border border-[#E4E8EE] focus:outline-none focus:ring-0">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-[10000]">
                                <SelectGroup>
                                    {categories.map((item) => (
                                        <SelectItem key={item.id || item._id} value={String(item.id || item._id)}>
                                            {item.categoryName}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <SmallSpinner />
                </div>
            ) : (
                <div className="bg-white border border-zinc-200 shadow-sm rounded-md divide-y">
                    {landingSections.map((sec) => (
                        <Link
                            key={sec.key}
                            href={`/cms/landing/${sec.key}?categoryId=${selectedCategory}`}
                            className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition"
                        >
                            <div>
                                <div className="text-[0.95rem] font-medium text-zinc-800">
                                    {sec.label}
                                </div>
                                <div className="text-[0.75rem] text-zinc-500">
                                    Manage category landing block for {categories.find(c => String(c.id || c._id) === selectedCategory)?.categoryName || "selected category"}
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-zinc-400" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
