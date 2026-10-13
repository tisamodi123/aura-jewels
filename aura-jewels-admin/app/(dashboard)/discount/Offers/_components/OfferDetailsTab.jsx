"use client";

import React from "react";
import { Field, ErrorMessage } from "formik";
import { useOfferStore } from "@/lib/stores/offerStore";
import { customSelectStyles } from "@/lib/utils";
import FilePicker from "@/components/FilePicker";
import Select from "react-select";

import {
    OFFER_FILTER_TYPE_OPTIONS,
    OFFER_CUSTOM_MODE_OPTIONS,
    OFFER_DISCOUNT_TYPE_OPTIONS,
    OFFER_APPLIED_ON_OPTIONS,
    OFFER_STATUS_OPTIONS
} from "@/lib/Constant";

export default function OfferDetailsTab({ values, setFieldValue }) {
    const { filterType, setFilterType, customeMode, setCustomeMode } = useOfferStore();
    const inputClassName = "w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-zinc-950 transition-all duration-200";
    const labelClassName = "block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Configuration Card */}
                <div className="bg-white border border-[#E4E8EE] rounded-xl shadow-sm p-6 space-y-5 lg:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3 mb-5">Offer Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClassName}>
                                Offer Code <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="code"
                                type="text"
                                placeholder="e.g. SUMMER50"
                                onChange={(e) => setFieldValue("code", e.target.value.toUpperCase())}
                                className={inputClassName}
                            />
                            <ErrorMessage name="code" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                        </div>

                        <div className="space-y-1">
                            <label className={labelClassName}>
                                Offer Name <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="name"
                                type="text"
                                placeholder="Enter campaign title"
                                className={inputClassName}
                            />
                            <ErrorMessage name="name" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClassName}>Description</label>
                        <Field
                            name="description"
                            as="textarea"
                            rows={3}
                            placeholder="Enter descriptive copy for this offer..."
                            className={inputClassName}
                        />
                        <ErrorMessage name="description" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClassName}>
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="startDate"
                                type="date"
                                className={inputClassName}
                            />
                            <ErrorMessage name="startDate" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                        </div>

                        <div className="space-y-1">
                            <label className={labelClassName}>
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="endDate"
                                type="date"
                                className={inputClassName}
                            />
                            <ErrorMessage name="endDate" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-zinc-100 pt-5">
                        <div className="space-y-1">
                            <label className={labelClassName}>
                                Minimum Price Threshold <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="priceRange.from"
                                type="number"
                                min="0"
                                placeholder="Min product price"
                                className={inputClassName}
                            />
                            <ErrorMessage name="priceRange.from" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                        </div>

                        <div className="space-y-1">
                            <label className={labelClassName}>
                                Maximum Price Threshold <span className="text-red-500">*</span>
                            </label>
                            <Field
                                name="priceRange.to"
                                type="number"
                                min="0"
                                placeholder="Max product price"
                                className={inputClassName}
                            />
                            <ErrorMessage name="priceRange.to" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-zinc-100 pt-5">
                        <div className="space-y-1">
                            <label className={labelClassName}>Offer Filter Type</label>
                            <Select
                                value={OFFER_FILTER_TYPE_OPTIONS.find(opt => opt.value === filterType)}
                                onChange={(option) => setFilterType(option?.value || "all")}
                                options={OFFER_FILTER_TYPE_OPTIONS}
                                styles={customSelectStyles}
                                isSearchable={false}
                            />
                        </div>

                        {filterType === "custom" ? (
                            <div className="space-y-1">
                                <label className={labelClassName}>Custom Mode</label>
                                <Select
                                    value={OFFER_CUSTOM_MODE_OPTIONS.find(opt => opt.value === customeMode)}
                                    onChange={(option) => setCustomeMode(option?.value || "design")}
                                    options={OFFER_CUSTOM_MODE_OPTIONS}
                                    styles={customSelectStyles}
                                    isSearchable={false}
                                />
                            </div>
                        ) : (
                            <div className="space-y-1 invisible md:block" />
                        )}
                    </div>
                </div>

                {/* Status & Discount Configuration Card */}
                <div className="bg-white border border-[#E4E8EE] rounded-xl shadow-sm p-6 space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3 mb-5">Pricing Rules</h3>

                    {/* Discount Type / Value are hidden for a COMBINED offer, which
                        uses the per-component percentages below instead. */}
                    {values.appliedOn !== 'combined' && (
                        <>
                            <div className="space-y-1">
                                <label className={labelClassName}>
                                    Discount Type <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={OFFER_DISCOUNT_TYPE_OPTIONS.find(opt => opt.value === values.discountType)}
                                    onChange={(option) => setFieldValue("discountType", option?.value)}
                                    options={OFFER_DISCOUNT_TYPE_OPTIONS}
                                    styles={customSelectStyles}
                                    isSearchable={false}
                                />
                                <ErrorMessage name="discountType" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                            </div>

                            <div className="space-y-1">
                                 <label className={labelClassName}>
                                     Discount Value <span className="text-red-500">*</span>
                                 </label>
                                 <Field
                                     name="discountValue"
                                     type="number"
                                     min="0"
                                     max={values.discountType === 'percentage' ? "99.99" : undefined}
                                     step="0.01"
                                     placeholder="Enter discount amount"
                                     className={inputClassName}
                                 />
                                 <ErrorMessage name="discountValue" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                            </div>
                        </>
                    )}

                    {values.appliedOn === 'combined' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                                <label className={labelClassName}>
                                    Making Charge Off (%)
                                </label>
                                <Field
                                    name="makingChargePercent"
                                    type="number"
                                    min="0"
                                    max="99.99"
                                    step="0.01"
                                    placeholder="e.g. 5"
                                    className={inputClassName}
                                />
                                <ErrorMessage name="makingChargePercent" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                            </div>

                            <div className="space-y-1">
                                <label className={labelClassName}>
                                    Diamond Off (%)
                                </label>
                                <Field
                                    name="diamondPercent"
                                    type="number"
                                    min="0"
                                    max="99.99"
                                    step="0.01"
                                    placeholder="e.g. 10"
                                    className={inputClassName}
                                />
                                <ErrorMessage name="diamondPercent" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                            </div>
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className={labelClassName}>Max Discount Amount</label>
                        <Field
                            name="maxDiscountAmount"
                            type="number"
                            min="0"
                            placeholder="Unlimited if empty"
                            className={inputClassName}
                        />
                        <ErrorMessage name="maxDiscountAmount" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                    </div>

                    <div className="space-y-1 border-t border-zinc-100 pt-5">
                        <label className={labelClassName}>
                            Applied On <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={OFFER_APPLIED_ON_OPTIONS.find(opt => opt.value === values.appliedOn)}
                            onChange={(option) => {
                                const v = option?.value;
                                setFieldValue("appliedOn", v);
                                // Combined ignores discountType/discountValue — stamp safe
                                // defaults so the required validation passes.
                                if (v === 'combined') {
                                    setFieldValue("discountType", "percentage");
                                    setFieldValue("discountValue", 0);
                                }
                            }}
                            options={OFFER_APPLIED_ON_OPTIONS}
                            styles={customSelectStyles}
                            isSearchable={false}
                        />
                        <ErrorMessage name="appliedOn" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                    </div>

                    {/* Combined-offer component percentages */}
                    {values.appliedOn === 'combined' && (
                        <div className="grid grid-cols-2 gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                            <div className="space-y-1">
                                <label className={labelClassName}>Making Charge %</label>
                                <Field
                                    name="makingChargePercent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="e.g. 5"
                                    className={inputClassName}
                                />
                                <ErrorMessage name="makingChargePercent" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClassName}>Diamond %</label>
                                <Field
                                    name="diamondPercent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="e.g. 10"
                                    className={inputClassName}
                                />
                                <ErrorMessage name="diamondPercent" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                            </div>
                            <p className="col-span-2 text-[10px] text-emerald-700 font-medium">
                                A separate % off the making charge and the diamond value. Leave one at 0 to discount only the other.
                            </p>
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className={labelClassName}>
                            Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={OFFER_STATUS_OPTIONS.find(opt => opt.value === values.status)}
                            onChange={(option) => setFieldValue("status", option?.value)}
                            options={OFFER_STATUS_OPTIONS}
                            styles={customSelectStyles}
                            isSearchable={false}
                        />
                        <ErrorMessage name="status" component="p" className="text-[10px] text-red-500 mt-1 font-medium" />
                    </div>

                    {/* <div className="flex items-center gap-2.5 pt-2 select-none">
                        <Field
                            id="isActive"
                            name="isActive"
                            type="checkbox"
                            className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-xs font-semibold text-zinc-700 cursor-pointer hover:text-zinc-900 transition-colors">
                            Is Active and Searchable
                        </label>
                    </div> */}
                </div>
            </div>

            {/* Media Upload & Manager Section */}
            <div className="bg-white border border-[#E4E8EE] rounded-xl shadow-sm p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Offer Banners</h3>
                    <span className="text-[10px] bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200/80 font-bold text-zinc-500">
                        {values.images.filter(img => img.MediaLocation).length} / 2 Staged
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Desktop Image Slot */}
                    <div className="p-5 border border-zinc-100 rounded-xl bg-zinc-50/40 hover:bg-zinc-50/80 transition-colors duration-200">
                        <FilePicker
                            label="Desktop Banner"
                            hint="Landscape banner for desktop views (e.g. 1200x400px)"
                            value={values.images[0]?.MediaLocation || ""}
                            onChange={(file) => {
                                const nextImages = [...values.images];
                                nextImages[0] = {
                                    ...nextImages[0],
                                    MediaLocation: file
                                };
                                setFieldValue("images", nextImages);
                            }}
                            accept="image/*"
                        />
                    </div>

                    {/* Mobile Image Slot */}
                    <div className="p-5 border border-zinc-100 rounded-xl bg-zinc-50/40 hover:bg-zinc-50/80 transition-colors duration-200">
                        <FilePicker
                            label="Mobile Banner"
                            hint="Square or portrait banner for mobile screens (e.g. 600x600px)"
                            value={values.images[1]?.MediaLocation || ""}
                            onChange={(file) => {
                                const nextImages = [...values.images];
                                nextImages[1] = {
                                    ...nextImages[1],
                                    MediaLocation: file
                                };
                                setFieldValue("images", nextImages);
                            }}
                            accept="image/*"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}