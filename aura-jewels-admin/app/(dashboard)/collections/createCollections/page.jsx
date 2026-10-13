"use client";
import QuillEditor from "@/components/textEditor";
import { Button } from "@/components/ui/button";
import { PREFIX } from "@/lib/APIUrl";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductTable from "../_components/productTable";
// import ProductCategoryTable from "./_components/productCategoryTable";

export default function CreateCollectionPage() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentCategory: "",
    description: "",
    image: null,
    sort: 1,
  });

  const [description, setDescription] = useState("");
  const router = useRouter();
  // Handle input changes
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-format slug: replace spaces with hyphens, lowercase, and remove special characters
    if (name === "slug") {
      value = value
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ""); // Remove special characters
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div>
      <div>
        <div className="w-[70%] mx-auto">
          {/* Collection Top Header */}
          <div
            className="flex items-center mb-6 justify-between"
            title="create-top-header"
          >
            <div className="flex items-center gap-3">
              <span
                className="cursor-pointer"
                onClick={() => router.push("/collections")}
              >
                <Image
                  src={`${PREFIX}/leftArrows.svg`}
                  height={20}
                  width={20}
                  alt="backArrow"
                />
              </span>
              <span className="font-semibold"> Collection New</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="border border-[#E4E8EE] text-[#656B7B] text-sm cursor-pointer bg-white px-3 py-1.5 rounded-lg">
                Active
              </span>
              <span className="border border-[#E4E8EE] text-[#656B7B] text-sm cursor-pointer bg-white px-3 py-1.5 rounded-lg">
                Inactive
              </span>
            </div>
          </div>
          {/* Collection Form Section */}
          <div title="category-form-section">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="font-semibold mb-4">Collection Details</div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Collection Name */}
                  <div>
                    <label
                      htmlFor="categoryName"
                      className="block text-[0.80rem] font-semibold  mb-2"
                    >
                      Collection Name
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      name="name"
                      placeholder="Enter Collection Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label
                      htmlFor="slug"
                      className="block  text-[0.80rem] font-semibold mb-2"
                    >
                      Slug
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      placeholder="Enter Slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label
                    htmlFor="description"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Description
                  </label>
                  <div>
                    <QuillEditor
                      value={description}
                      onChange={setDescription}
                    />
                  </div>
                </div>

                {/* Banner Image Upload */}
                <div className="mb-6 cursor-pointer">
                  <label
                    htmlFor="bannerImage"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Banner Image
                  </label>
                  <div className="border border-[#E4E8EE] px-3 py-2 rounded-md">
                    <div className="flex items-center gap-2 text-[0.80rem]">
                      <div className="bg-[#489E32] text-[#FFFFFF] px-2 py-1 rounded-lg cursor-pointer">
                        Attach File
                      </div>
                      <div className="text-[#61748F] font-semibold">
                        No File Chosen
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Image Upload */}
                <div className="mb-6 cursor-pointer">
                  <label
                    htmlFor="bannerImage"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Thumbnail Image
                  </label>
                  <div className="border border-[#E4E8EE] px-3 py-2 rounded-md">
                    <div className="flex items-center gap-2 text-[0.80rem]">
                      <div className="bg-[#489E32] text-[#FFFFFF] px-2 py-1 rounded-lg cursor-pointer">
                        Attach File
                      </div>
                      <div className="text-[#61748F] font-semibold">
                        No File Chosen
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display/Sort Order - Associate Products */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Display Order Name */}
                  <div>
                    <label
                      htmlFor="sortOrderNum"
                      className="block text-[0.80rem] font-semibold  mb-2"
                    >
                      Display Order/Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrderNum"
                      name="sort"
                      placeholder="Enter sort/order"
                      value={formData.sort}
                      onChange={handleChange}
                      className="w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label
                      htmlFor="associatedProject"
                      className="block  text-[0.80rem] font-semibold mb-2"
                    >
                      Assocaited Products
                    </label>
                    <input
                      type="text"
                      id="associatedProject"
                      name="associatedProject"
                      placeholder="Enter Product"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" />

                  <div className="text-[0.84rem] font-semibold">
                    Show on Homepage/Featured Section (Yes/No)
                  </div>
                </div>
              </form>
            </div>
          </div>
          {/* Collection Type Section */}
          <div title="feature-sort-section" className="mt-6">
            <div className=" bg-white rounded-lg shadow-md p-6">
              <div className="font-semibold mb-4">Collection Type</div>
              <div>
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      className={`border focus:border-black`}
                      value="default"
                      id="r1"
                    />
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="r1">Manual</Label>
                      <Label
                        className="text-[0.80rem] text-[#656B7B]"
                        htmlFor="r1"
                      >
                        Add Products to this collection one by one. Learn more
                        about manual collections.
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      className=" focus:border-black"
                      value=""
                      id="r2"
                    />
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="r2">Smart</Label>
                      <Label
                        className="text-[0.80rem] w-[90%] text-[#656B7B]"
                        htmlFor="r2"
                      >
                        Existing and future products that match the conditions
                        you set will automatically be added to this
                        collection.Learn more about smart collections.
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          {/* Product Table */}
          <div title="product-section" className="mt-6">
            <div className=" bg-white rounded-lg shadow-md p-6">
              <div className="font-semibold mb-4">Products</div>
              {/* Search and Sort */}
              <div className="mb-2">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex flex-1 items-center border border-[#E4E8EE] px-3 py-2 rounded-md ">
                    <input
                      className="border-none outline-none w-full text-[0.80rem] placeholder:text-[#656B7B]"
                      placeholder="Search Products"
                    />
                    <Search color="#656B7B" size={17} />
                  </div>
                  <div className="flex flex-1 gap-1 items-center">
                    <span className="text-[0.80rem] text-[#656B7B] font-semibold">
                      Sort:
                    </span>
                    <div className="flex-1">
                      <Select>
                        <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                          <SelectValue
                            placeholder="Select..."
                            className="text-[#656B7B]"
                          />
                          {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectGroup>
                            <SelectItem
                              className=" hover:bg-gray-100"
                              value="apple"
                            >
                              Best Selling
                            </SelectItem>
                            <SelectItem value="banana">Most Bought</SelectItem>
                            <SelectItem value="blueberry">
                              Best Ranked
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              {/* Table */}
              <div title="product-table">
                <ProductTable />
              </div>
            </div>
          </div>
          {/* Meta Section */}
          <div className="mt-6" title="meta-section">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="font-semibold mb-4">Additional Details</div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Meta Title */}
                  <div>
                    <label
                      htmlFor="metaTitle"
                      className="block text-[0.80rem] font-semibold  mb-2"
                    >
                      Meta Title
                    </label>
                    <input
                      type="text"
                      id="metaTitle"
                      name="metaTitle"
                      placeholder="Enter Meta Title..."
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div>
                    <label
                      htmlFor="metaKeywords"
                      className="block  text-[0.80rem] font-semibold mb-2"
                    >
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      id="metaKeywords"
                      name="metaKeywords"
                      placeholder="Enter Meta Keywords..."
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="mb-6">
                  <label
                    htmlFor="description"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Meta Description
                  </label>
                  <div>
                    <QuillEditor
                      value={description}
                      onChange={setDescription}
                    />
                  </div>
                </div>

                {/* Gender-Category */}
                <div className="flex gap-6 mb-6 items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="applicableGender"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Applicable Gender
                    </label>
                    <Select>
                      <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                        <SelectValue
                          placeholder="Select Gender"
                          className="text-[#656B7B]"
                        />
                        {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          <SelectItem
                            className=" hover:bg-gray-100"
                            value="apple"
                          >
                            Male
                          </SelectItem>
                          <SelectItem value="banana">Female</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="applicableGender"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Associated Category
                    </label>
                    <Select>
                      <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                        <SelectValue
                          placeholder="Select Category"
                          className="text-[#656B7B]"
                        />
                        {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          <SelectItem
                            className=" hover:bg-gray-100"
                            value="apple"
                          >
                            Category1
                          </SelectItem>
                          <SelectItem value="banana">Category2</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* CollectionType-Tag/Label */}
                <div className="flex gap-6 mb-6 items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="applicableGender"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Collection Type
                    </label>
                    <Select>
                      <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                        <SelectValue
                          placeholder="Select Type"
                          className="text-[#656B7B]"
                        />
                        {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          <SelectItem
                            className=" hover:bg-gray-100"
                            value="apple"
                          >
                            Collection1
                          </SelectItem>
                          <SelectItem value="banana">Colection2</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="applicableGender"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Promo Tag/Label
                    </label>
                    <input
                      type="text"
                      id="tag"
                      name="tag"
                      placeholder="Enter Tag/Label"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* HighLight-SEO */}
                <div className="flex gap-6 mb-6 items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="applicableGender"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Highlights/Features List
                    </label>

                    <textarea
                      className="border w-full p-2 text-[0.80rem] border-[#E4E8EE] outline-none rounded-md min-h-24"
                      placeholder="Enter Text..."
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="applicableGender"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      SEO Schema Markup JSON
                    </label>

                    <textarea
                      className="border w-full p-2 text-[0.80rem] border-[#E4E8EE] outline-none rounded-md min-h-24"
                      placeholder="Enter Text..."
                    />
                  </div>
                </div>

                {/* CTA Link */}
                <div>
                  <div>
                    <label
                      htmlFor="ctaLink"
                      className="block  text-[0.80rem] font-semibold mb-2"
                    >
                      Custom Button Text/CTA Link
                    </label>
                    <input
                      type="text"
                      id="ctaLink"
                      name="ctaLink"
                      placeholder="Enter Text/Link"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button className="bg-black text-white">Create Collection</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
