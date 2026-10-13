"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Formik, Form } from "formik";
import { Loader2, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import Select from "react-select";

// Components
import FormikErrorFocus from "@/components/FormikErrorFocus";
import OfferDetailsTab from "./OfferDetailsTab";
import ProductSelectionTable from "./ProductSelectionTable";
import OfferedProductsTable from "./OfferedProductsTable";

// API & Libs
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { OFFER_FILTER_TYPE, STATUS_CODE } from "@/lib/Constant";
import { getToken } from "@/lib/auth";
import { showError, showSuccess } from "@/lib/toast";
import { offerValidationSchema } from "@/lib/validationSchemas";
import { customSelectStyles } from "@/lib/utils";

// Helpers
import { getOfferInitialValues } from "./offerHelpers";
import { useOfferStore } from "@/lib/stores/offerStore";
import { useFilterStore } from "@/lib/stores/filterStore";

export default function CreateOfferForm({ rowData, onCancel, onSuccess }) {
    const token = getToken();

    const { filterType, customeMode, setFilterType, setCustomeMode } = useOfferStore();
    const { catagoryIds, subCatagoryIds, collectionIds, tagsIds, setCatagoryIds, setSubCatagoryIds, setCollectionIds, setTagsIds } = useFilterStore();

    const [step, setStep] = useState(1);
    const [activeSubTab, setActiveSubTab] = useState("select");
    const [isSaving, setIsSaving] = useState(false);

    // Lifted filter selection states
    const [selectedCats, setSelectedCats] = useState([]);
    const [selectedSubs, setSelectedSubs] = useState([]);
    const [selectedColls, setSelectedColls] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    // Option lists for Step 2
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [allSubCategoriesList, setAllSubCategoriesList] = useState([]);
    const [collections, setCollections] = useState([]);
    const [tags, setTags] = useState([]);

    const [applicableProducts, setApplicableProducts] = useState(
        (rowData?.applicableProducts || []).map(p => typeof p === "object" ? p._id : p)
    );

    const initialValues = useMemo(() => getOfferInitialValues(rowData), [rowData]);

    // Initialize stores based on rowData or defaults
    useEffect(() => {
        if (rowData) {
            setFilterType(rowData.applicableType || "all");
            setCustomeMode(rowData.customMode || "design");
        } else {
            setFilterType("all");
            setCustomeMode("design");
            setCatagoryIds([]);
            setSubCatagoryIds([]);
            setCollectionIds([]);
            setTagsIds([]);
        }

        return () => {
            setFilterType("all");
            setCustomeMode("design");
            setCatagoryIds([]);
            setSubCatagoryIds([]);
            setCollectionIds([]);
            setTagsIds([]);
        };
    }, [rowData, setFilterType, setCustomeMode, setCatagoryIds, setSubCatagoryIds, setCollectionIds, setTagsIds]);

    // Keep Zustand Filter Store synchronized with lifted selection states
    useEffect(() => {
        setCatagoryIds(selectedCats.map(c => c.value));
        setSubCatagoryIds(selectedSubs.map(s => s.value));
        setCollectionIds(selectedColls.map(c => c.value));
        setTagsIds(selectedTags.map(t => t.value));
    }, [selectedCats, selectedSubs, selectedColls, selectedTags, setCatagoryIds, setSubCatagoryIds, setCollectionIds, setTagsIds]);

    // Fetch Target Criteria Options (Categories, Collections, Tags)
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                let parentCatsFormatted = [];
                let formattedSubs = [];
                // Fetch categories
                const catRes = await callApi(API_URL.PARENT_CATEGORY_LIST, "GET", null, token);
                if (catRes?.errorCode === STATUS_CODE.OK) {
                    const allCats = catRes.data || [];
                    const parentCats = allCats.filter(c => !c.parentCategoryId && !c.parentCategory);
                    parentCatsFormatted = parentCats.map(c => ({ label: c.categoryName, value: c._id }));
                    setCategories(parentCatsFormatted);

                    const subs = allCats.filter(c => c.parentCategoryId || c.parentCategory);
                    formattedSubs = subs.map(s => ({ label: s.categoryName, value: s._id }));
                    setAllSubCategoriesList(formattedSubs);
                    setSubCategories(formattedSubs);
                }

                // Fetch collections
                let collectionsFormatted = [];
                const colRes = await callApi(API_URL.GET_COLLECTIONS_LIST, "GET", null, token);
                if (colRes?.errorCode === STATUS_CODE.OK) {
                    collectionsFormatted = (colRes.data || []).map(c => ({ label: c.name || c.collectionName, value: c._id }));
                    setCollections(collectionsFormatted);
                }

                // Fetch tags
                let tagsFormatted = [];
                const tagRes = await callApi(API_URL.GET_TAGS, "GET", null, token);
                if (tagRes?.errorCode === STATUS_CODE.OK) {
                    tagsFormatted = (tagRes.data || []).map(t => ({ label: t.name, value: t._id }));
                    setTags(tagsFormatted);
                }

                // Pre-populate selection states when editing
                const applicableTo = rowData?.applicableTo || rowData;
                if (applicableTo) {
                    const categoryIds = applicableTo.category || [];
                    const collectionIds = applicableTo.collection || applicableTo.collections || [];
                    const tagIds = applicableTo.tags || [];

                    if (categoryIds.length > 0) {
                        const selectedCatsFromData = parentCatsFormatted.filter(cat => categoryIds.includes(cat.value));
                        setSelectedCats(selectedCatsFromData);
                    }

                    if (collectionIds.length > 0) {
                        const selectedCollsFromData = collectionsFormatted.filter(coll => collectionIds.includes(coll.value));
                        setSelectedColls(selectedCollsFromData);
                    }

                    if (tagIds.length > 0) {
                        const selectedTagsFromData = tagsFormatted.filter(tag => tagIds.includes(tag.value));
                        setSelectedTags(selectedTagsFromData);
                    }
                }
            } catch (err) {
                console.log("Error loading filter options:", err);
            }
        };

        loadFilterOptions();
    }, [token, rowData]);

    // Fetch Subcategories Dynamically
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!selectedCats || selectedCats.length === 0) {
                setSubCategories(allSubCategoriesList);
                if (rowData && allSubCategoriesList.length > 0) {
                    const applicableTo = rowData?.applicableTo || rowData;
                    const subCategoryIds = applicableTo?.subCategory || applicableTo?.subCategories || [];
                    if (subCategoryIds.length > 0) {
                        const selectedSubsFromData = allSubCategoriesList.filter(sub => subCategoryIds.includes(sub.value));
                        setSelectedSubs(selectedSubsFromData);
                    }
                } else {
                    setSelectedSubs([]);
                }
                return;
            }

            try {
                const categoryIds = selectedCats.map(c => c.value);
                const results = await Promise.all(
                    categoryIds.map((id) =>
                        callApi(`${API_URL?.SUB_CATEGORY_LIST}/${id}`, "GET", null, token)
                    )
                );

                const merged = results.reduce((acc, result) => {
                    if (result?.errorCode === STATUS_CODE.OK && result?.data) {
                        return [...acc, ...result.data];
                    }
                    return acc;
                }, []);

                const unique = merged.filter((item, index, self) =>
                    self.findIndex((t) => t._id === item._id) === index
                );

                const formattedSubs = unique.map(s => ({ label: s.categoryName, value: s._id }));
                setSubCategories(formattedSubs);

                if (rowData) {
                    const applicableTo = rowData?.applicableTo || rowData;
                    const subCategoryIds = applicableTo?.subCategory || applicableTo?.subCategories || [];
                    if (subCategoryIds.length > 0) {
                        const selectedSubsFromData = formattedSubs.filter(sub => subCategoryIds.includes(sub.value));
                        setSelectedSubs(selectedSubsFromData);
                    }
                }
            } catch (error) {
                console.log("Error fetching subcategories:", error);
            }
        };

        fetchSubcategories();
    }, [selectedCats, allSubCategoriesList, token, rowData]);

    // Step navigation validation and handling
    const handleNext = async (validateForm, setFieldTouched, values) => {
        if (step === 1) {
            const errors = await validateForm();
            const step1Fields = [
                "code",
                "name",
                "startDate",
                "endDate",
                "priceRange.from",
                "priceRange.to",
                "discountType",
                "discountValue",
                "maxDiscountAmount",
                "appliedOn",
                "status"
            ];

            const hasStep1Errors = Object.keys(errors).some(key => {
                if (key === "priceRange") return true;
                return step1Fields.includes(key);
            });

            const activeSlots = values.images.filter(img => img.MediaLocation);
            if (activeSlots.length === 0) {
                showError("At least one offer image (Desktop or Mobile) is required.");
                return;
            }

            if (hasStep1Errors) {
                step1Fields.forEach(field => {
                    if (field.includes(".")) {
                        const [parent, child] = field.split(".");
                        setFieldTouched(`${parent}.${child}`, true);
                    } else {
                        setFieldTouched(field, true);
                    }
                });
                showError("Please fix the validation errors before moving to the next step.");
                return;
            }

            setStep(2);
        } else if (step === 2 && filterType === "all") {
            const hasSelection = selectedCats.length > 0 || selectedSubs.length > 0 || selectedColls.length > 0 || selectedTags.length > 0;
            if (!hasSelection) {
                showError("Please select at least one category, collection, subcategory, or tag to proceed.");
                return;
            }
            setStep(3);
        }
    };

    const isLastStep = filterType === "all" ? step === 3 : step === 2;

    // Form Submission Handler
    const handleFormSubmit = async (values) => {
        setIsSaving(true);
        try {
            const activeSlots = values.images.filter(img => img.MediaLocation);
            if (activeSlots.length === 0) {
                showError("At least one offer image (Desktop or Mobile) is required.");
                setIsSaving(false);
                return;
            }

            // Enforce targeting at the SUBMIT choke point (not only on step
            // navigation), so an early "Update Offer" button in edit mode cannot
            // save an offer that matches nothing / everything.
            if (filterType === "all") {
                const hasSelection = catagoryIds.length > 0 || subCatagoryIds.length > 0
                    || collectionIds.length > 0 || tagsIds.length > 0;
                if (!hasSelection) {
                    showError("Select at least one category, subcategory, collection, or tag for this offer.");
                    setIsSaving(false);
                    return;
                }
            } else if (!applicableProducts || applicableProducts.length === 0) {
                showError("Select at least one product for this offer.");
                setIsSaving(false);
                return;
            }

            const formdata = new FormData();
            formdata.append("code", values.code);
            formdata.append("name", values.name);
            formdata.append("description", values.description || "");
            formdata.append("startDate", values.startDate);
            formdata.append("endDate", values.endDate);
            formdata.append("priceRange", JSON.stringify({
                from: Number(values.priceRange.from),
                to: Number(values.priceRange.to)
            }));
            formdata.append("discountType", values.discountType);
            formdata.append("discountValue", Number(values.discountValue) || 0);
            formdata.append("maxDiscountAmount", Number(values.maxDiscountAmount));
            formdata.append("appliedOn", values.appliedOn);
            // Combined-offer component %s (0 when not a combined offer).
            formdata.append("makingChargePercent", Number(values.makingChargePercent) || 0);
            formdata.append("diamondPercent", Number(values.diamondPercent) || 0);
            formdata.append("status", values.status);
            formdata.append("isActive", values.isActive ? "true" : "false");

            if (filterType) {
                formdata.append("applicableType", filterType);
            }

            if (filterType === OFFER_FILTER_TYPE[1]?.value) {
                formdata.append("customMode", customeMode);
            }

            if (filterType === OFFER_FILTER_TYPE[1]?.value) {
                formdata.append("applicableProducts", JSON.stringify(applicableProducts));
            } else {
                formdata.append("applicableTo", JSON.stringify({
                    category: [...catagoryIds],
                    subCategory: [...subCatagoryIds],
                    collections: [...collectionIds],
                    tags: [...tagsIds]
                }));
            }

            formdata.append("image", values.images[0]?.MediaLocation || "");
            formdata.append("imageMobile", values.images[1]?.MediaLocation || "");

            // Call backend API
            const isEditMode = !!rowData?._id;
            const url = isEditMode ? `${API_URL.UPDATE_OFFER}/${rowData._id}` : API_URL.CREATE_OFFER;
            const method = isEditMode ? "PUT" : "POST";

            const res = await callApi(url, method, formdata, token);

            if (res?.errorCode === STATUS_CODE.OK) {
                showSuccess(res?.message || `Offer successfully ${isEditMode ? "updated" : "created"}`);
                onSuccess();
            } else {
                showError(res?.message || "Failed to save the offer");
            }
        } catch (err) {
            console.log("Save offer error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm transition-opacity" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto bg-[#F8F9FC] z-[9999] p-6 rounded-xl shadow-2xl border border-[#E4E8EE] focus:outline-none flex flex-col">
                    <Dialog.Title className="sr-only">
                        {rowData?._id ? "Edit Offer" : "Create Offer"}
                    </Dialog.Title>
                    <Dialog.Description className="sr-only">
                        Wizard form to create or edit marketing offers.
                    </Dialog.Description>

                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-5 border border-[#E4E8EE] rounded-xl shadow-sm mb-6">
                        <div>
                            <h1 className="text-lg font-bold text-zinc-950">
                                {rowData?._id ? `Edit Offer: ${rowData.code}` : "Create New Master Offer"}
                            </h1>
                            <p className="text-xs text-zinc-400 mt-1">
                                Step {step} of {filterType === "all" ? 3 : 2}: {
                                    step === 1 ? "Offer Details & Configuration" :
                                        step === 2 && filterType === "all" ? "Target Filters Selection" :
                                            "Product Selection"
                                }
                            </p>
                        </div>
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X size={20} className="text-zinc-500" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={offerValidationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({ values, errors, setFieldValue, setFieldTouched, validateForm, submitCount }) => (
                            <Form className="flex-1 flex flex-col justify-between">
                                <FormikErrorFocus errors={errors} submitCount={submitCount} />

                                {/* Step Content */}
                                <div className="flex-1 min-h-[400px]">
                                    {step === 1 && (
                                        <OfferDetailsTab
                                            values={values}
                                            setFieldValue={setFieldValue}
                                        />
                                    )}

                                    {step === 2 && filterType === "all" && (
                                        <div className="space-y-6 bg-white p-6 rounded-xl border border-[#E4E8EE]">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3 mb-5">
                                                Select Target Criteria (Select at least one)
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-1">
                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Category</label>
                                                    <Select
                                                        isMulti
                                                        value={selectedCats}
                                                        onChange={(options) => setSelectedCats(options || [])}
                                                        options={categories}
                                                        styles={customSelectStyles}
                                                        placeholder="Select Categories"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Subcategory</label>
                                                    <Select
                                                        isMulti
                                                        value={selectedSubs}
                                                        onChange={(options) => setSelectedSubs(options || [])}
                                                        options={subCategories}
                                                        styles={customSelectStyles}
                                                        placeholder="Select Subcategories"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Collection</label>
                                                    <Select
                                                        isMulti
                                                        value={selectedColls}
                                                        onChange={(options) => setSelectedColls(options || [])}
                                                        options={collections}
                                                        styles={customSelectStyles}
                                                        placeholder="Select Collections"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Tags</label>
                                                    <Select
                                                        isMulti
                                                        value={selectedTags}
                                                        onChange={(options) => setSelectedTags(options || [])}
                                                        options={tags}
                                                        styles={customSelectStyles}
                                                        placeholder="Select Tags"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {((step === 3 && filterType === "all") || (step === 2 && filterType === "custom")) && (
                                        <div className="space-y-4">
                                            {rowData?._id && (
                                                <div className="flex border-b border-[#E4E8EE] bg-white px-4 rounded-t-xl gap-6 mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveSubTab("select")}
                                                        className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeSubTab === "select"
                                                            ? "border-black text-black"
                                                            : "border-transparent text-zinc-400 hover:text-zinc-600"
                                                            }`}
                                                    >
                                                        Product Selection
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveSubTab("offered")}
                                                        className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === "offered"
                                                            ? "border-black text-black"
                                                            : "border-transparent text-zinc-400 hover:text-zinc-600"
                                                            }`}
                                                    >
                                                        Offered Products
                                                        <span className="bg-zinc-50 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-200/60">
                                                            {applicableProducts.length} Selected
                                                        </span>
                                                    </button>
                                                </div>
                                            )}

                                            {activeSubTab === "select" ? (
                                                <ProductSelectionTable
                                                    priceRange={{
                                                        from: Number(values.priceRange.from),
                                                        to: Number(values.priceRange.to)
                                                    }}
                                                    selectedProducts={applicableProducts}
                                                    onChange={setApplicableProducts}
                                                    editRowData={rowData}
                                                    selectedCats={selectedCats}
                                                    setSelectedCats={setSelectedCats}
                                                    selectedSubs={selectedSubs}
                                                    setSelectedSubs={setSelectedSubs}
                                                    selectedColls={selectedColls}
                                                    setSelectedColls={setSelectedColls}
                                                    selectedTags={selectedTags}
                                                    setSelectedTags={setSelectedTags}
                                                    categories={categories}
                                                    subCategories={subCategories}
                                                    collections={collections}
                                                    tags={tags}
                                                />
                                            ) : (
                                                <OfferedProductsTable
                                                    offerId={rowData?._id}
                                                    selectedProducts={applicableProducts}
                                                    onChange={setApplicableProducts}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Wizard Footer */}
                                <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-[#E4E8EE]">
                                    <div>
                                        {step > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setStep(step - 1)}
                                                className="px-5 py-2 border border-[#E4E8EE] rounded-lg text-xs font-semibold hover:bg-zinc-50 text-[#656B7B] transition-colors cursor-pointer"
                                            >
                                                Back
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            key="cancel-btn"
                                            type="button"
                                            onClick={onCancel}
                                            className="px-5 py-2 border border-[#E4E8EE] rounded-lg text-xs font-semibold hover:bg-zinc-50 text-[#656B7B] transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>

                                        {isLastStep ? (
                                            <button
                                                key="submit-btn"
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-6 py-2 bg-black hover:bg-zinc-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" /> Saving...
                                                    </>
                                                ) : (
                                                    rowData?._id ? "Update Offer" : "Save Offer"
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                key="next-btn"
                                                type="button"
                                                onClick={() => handleNext(validateForm, setFieldTouched, values)}
                                                className="px-6 py-2 bg-black hover:bg-zinc-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                                            >
                                                Next Step
                                            </button>

                                        )}
                                        {
                                            rowData?._id && !isLastStep && (
                                                <button
                                                    key="submit-btn"
                                                    type="submit"
                                                    disabled={isSaving}
                                                    className="px-6 py-2 bg-black hover:bg-zinc-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" /> Saving...
                                                        </>
                                                    ) : (
                                                        rowData?._id ? "Update Offer" : "Save Offer"
                                                    )}
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}