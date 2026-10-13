"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, COUPON_TYPE_OPTIONS, COUPON_STATUS_OPTIONS, COUPON_DISCOUNT_TYPE_OPTIONS } from "@/lib/Constant";
import { showError, showSuccess } from "@/lib/toast";
import { validateCouponForm } from "@/lib/validationSchemas";

export default function CouponModal({ open, setOpen, mode = "create", data, onSuccess }) {
    const token = getToken();

    const initialFormData = {
        id: "",
        code: "",
        name: "",
        description: "",
        image: null,
        imageMobile: null,
        startDate: "",
        endDate: "",
        priceRange: {
            from: 0,
            to: 0
        },
        discountType: "percentage",
        appliedOn: "total",
        discountValue: "",
        makingChargePercent: "",
        diamondPercent: "",
        maxDiscountAmount: "",
        usageLimit: "",
        perUserLimit: "",
        firstOrderOnly: false,
        couponType: "public",
        assignees: [],
        status: "inactive",
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [assigneeList, setAssigneeList] = useState([]);
    const [isLoadingAssignees, setIsLoadingAssignees] = useState(false);
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    // Hydrate form data if in edit mode, reset to initial if opening create mode
    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && data) {
            const formatDate = (isoDate) => {
                if (!isoDate) return "";
                const d = new Date(isoDate);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
            };

            setFormData({
                id: data?._id || "",
                code: data?.code || "",
                name: data?.name || "",
                description: data?.description || "",
                image: data?.image || null,
                imageMobile: data?.imageMobile || null,
                startDate: formatDate(data?.startDate),
                endDate: formatDate(data?.endDate),
                priceRange: {
                    from: data?.priceRange?.from !== undefined ? data.priceRange.from : 0,
                    // null/undefined "to" = no cap → keep the input empty.
                    to: data?.priceRange?.to != null ? data.priceRange.to : ""
                },
                // Legacy coupons stored "combined" in discountType. Map it onto the
                // new appliedOn, and keep discountType as the KIND (percentage/flat).
                appliedOn: data?.appliedOn || (data?.discountType === "combined" ? "combined" : "total"),
                discountType: (data?.discountType && data.discountType !== "combined") ? data.discountType : "percentage",
                discountValue: data?.discountValue !== undefined ? data.discountValue.toString() : "",
                makingChargePercent: data?.makingChargePercent ? data.makingChargePercent.toString() : "",
                diamondPercent: data?.diamondPercent ? data.diamondPercent.toString() : "",
                maxDiscountAmount: data?.maxDiscountAmount !== undefined && data?.maxDiscountAmount !== null ? data.maxDiscountAmount.toString() : "",
                usageLimit: data?.usageLimit !== undefined && data?.usageLimit !== null ? data.usageLimit.toString() : "",
                perUserLimit: data?.perUserLimit !== undefined && data?.perUserLimit !== null ? data.perUserLimit.toString() : "",
                firstOrderOnly: data?.firstOrderOnly !== undefined ? !!data.firstOrderOnly : false,
                couponType: data?.couponType || "public",
                assignees: data?.assignees?.map(a => typeof a === 'object' ? a._id : a) || [],
                status: data?.status || "inactive",
                isActive: data?.isActive !== undefined ? data.isActive : true
            });
        } else {
            setFormData({
                ...initialFormData,
                startDate: getTodayDate()
            });
        }
        setErrors({});
        setAssigneeSearch("");
    }, [open, mode, data]);

    // Fetch customer list on open for assignees selection
    useEffect(() => {
        const getAssignees = async () => {
            setIsLoadingAssignees(true);
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("page", 1);
                // formDataToSend.append("limit", 1000); // Fetch a large list of customers

                const res = await callApi(`${API_URL.GET_CUSTOMER_LIST}`, "POST", formDataToSend, token);

                console.log("res ======>", res)

                if (res?.errorCode === STATUS_CODE.OK) {
                    setAssigneeList(res?.data || []);
                } else {
                    showError(res?.message || "Failed to fetch customers");
                }
            } catch (error) {
                console.log("Error fetching customers:", error);
            } finally {
                setIsLoadingAssignees(false);
            }
        };

        if (open) {
            getAssignees();
        }
    }, [open, token]);

    const updateFormData = (field, value) => {
        setFormData(prev => {
            const nextData = {
                ...prev,
                [field]: value
            };
            if (field === "discountType" && value !== "percentage") {
                nextData.maxDiscountAmount = "";
            }
            // Combined ignores the single value + cap; clear them to avoid stale input.
            if (field === "appliedOn" && value === "combined") {
                nextData.maxDiscountAmount = "";
            }
            return nextData;
        });
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const updatePriceRange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            priceRange: {
                ...prev.priceRange,
                [field]: value
            }
        }));
        const errKey = field === 'from' ? 'priceRangeFrom' : 'priceRangeTo';
        if (errors[errKey]) {
            setErrors(prev => ({
                ...prev,
                [errKey]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = validateCouponForm(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        const fData = new FormData();

        if (mode === "edit") {
            fData.append('id', formData.id);
            fData.append('_id', formData.id);
        }

        fData.append('code', formData.code.trim().toUpperCase());
        fData.append('name', formData.name.trim());
        fData.append('description', formData.description || '');
        fData.append('startDate', formData.startDate);
        fData.append('endDate', formData.endDate);
        fData.append('priceRange', JSON.stringify({
            from: Number(formData.priceRange.from) || 0,
            // Empty / 0 upper bound = no maximum.
            to: formData.priceRange.to ? Number(formData.priceRange.to) : null
        }));
        const isCombined = formData.appliedOn === 'combined';
        // discountType is the KIND (percentage/absolute). For a combined coupon it
        // is irrelevant — send 'percentage' to satisfy the required enum.
        fData.append('discountType', isCombined ? 'percentage' : formData.discountType);
        fData.append('appliedOn', formData.appliedOn);
        // Combined uses the two component %s; send discountValue 0 to satisfy the
        // required field.
        fData.append('discountValue', isCombined ? 0 : (Number(formData.discountValue) || 0));
        fData.append('makingChargePercent', Number(formData.makingChargePercent) || 0);
        fData.append('diamondPercent', Number(formData.diamondPercent) || 0);

        if (!isCombined && formData.discountType === 'percentage' && formData.maxDiscountAmount) {
            fData.append('maxDiscountAmount', Number(formData.maxDiscountAmount));
        }
        // else {
        //     fData.append('maxDiscountAmount', '');
        // }

        // Usage limits — blank means unlimited (send empty).
        fData.append('usageLimit', formData.usageLimit ? Number(formData.usageLimit) : '');
        fData.append('perUserLimit', formData.perUserLimit ? Number(formData.perUserLimit) : '');
        fData.append('firstOrderOnly', formData.firstOrderOnly ? 'true' : 'false');

        fData.append('couponType', formData.couponType);
        fData.append('assignees', JSON.stringify(formData.assignees));
        fData.append('status', formData.status);
        fData.append('isActive', formData.isActive ? 'true' : 'false');

        // Append images if present/valid
        if (formData.image instanceof File || typeof formData.image === 'string') {
            fData.append('image', formData.image);
        } else {
            fData.append('image', '');
        }

        if (formData.imageMobile instanceof File || typeof formData.imageMobile === 'string') {
            fData.append('imageMobile', formData.imageMobile);
        } else {
            fData.append('imageMobile', '');
        }

        try {
            const apiUrl = mode === "edit" ? API_URL.EDIT_COUPON(formData.id) : API_URL.CREATE_COUPON;
            const successCode = mode === "edit" ? STATUS_CODE.OK : STATUS_CODE.CREATED;
            const successMsg = mode === "edit" ? 'Coupon updated successfully' : 'Coupon created successfully';

            const res = await callApi(apiUrl, "POST", fData, token);
            if (res?.errorCode === successCode) {
                showSuccess(res?.message || successMsg);
                setOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                showError(res?.message || `Failed to ${mode} coupon`);
            }
        } catch (error) {
            console.log(`Error during coupon ${mode}`, error);
            showError(`An error occurred while ${mode}ing coupon.`);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredAssignees = assigneeList.filter(user => {
        const search = assigneeSearch.toLowerCase().trim();
        if (!search) return true;

        const nameMatch = user.name && user.name.toLowerCase().includes(search);
        const emailMatch = user.email && user.email.toLowerCase().includes(search);

        const phoneStr = user.phone ? String(user.phone) : "";
        const countryCode = user.phoneCountryCode || user.countryCode || "";
        const fullPhone = `${countryCode}${phoneStr}`.toLowerCase();
        const phoneMatch = phoneStr.includes(search) || fullPhone.includes(search);

        return nameMatch || emailMatch || phoneMatch;
    });

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-[#00000066] opacity-100 z-[9998]" />
                <Dialog.Close asChild>
                    <button type="button" className="fixed top-4 right-[75%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer border border-[#E4E8EE]">
                        <X size={20} />
                    </button>
                </Dialog.Close>
                <Dialog.Content className="fixed top-0 right-0 w-[75%] custom-scrollbar h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center border-b pb-4">
                            <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                                {mode === "edit" ? `Edit Coupon: ${formData.code}` : "Create Coupon"}
                            </Dialog.Title>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={handleSave}
                                    className="bg-[#087B5D] text-white rounded-md px-4 py-2 text-[0.8rem] hover:bg-[#07654a] flex items-center gap-1.5"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" /> {mode === "edit" ? "Saving..." : "Creating..."}
                                        </>
                                    ) : (
                                        mode === "edit" ? "Save Changes" : "Create Coupon"
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-6 mt-6">
                            <div>
                                <label htmlFor="code" className="block text-[0.80rem] font-semibold mb-2">
                                    Coupon Code<span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    placeholder="e.g. SUMMER50"
                                    value={formData.code}
                                    onChange={(e) => updateFormData('code', e.target.value.toUpperCase())}
                                    className={`w-full px-3 py-2 border text-[0.80rem] ${errors.code ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-[0.80rem] font-semibold mb-2">
                                    Coupon Name<span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Summer Special Offer"
                                    value={formData.name}
                                    onChange={(e) => updateFormData('name', e.target.value)}
                                    className={`w-full px-3 py-2 border text-[0.80rem] ${errors.name ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="couponType" className="block text-[0.80rem] font-semibold mb-2">
                                    Coupon Type<span className="text-red-400">*</span>
                                </label>
                                <Select value={formData.couponType} onValueChange={(value) => updateFormData('couponType', value)}>
                                    <SelectTrigger className={`w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0`}>
                                        <SelectValue placeholder="Select Coupon Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-[10000]">
                                        <SelectGroup>
                                            {COUPON_TYPE_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-[0.80rem] font-semibold mb-2">
                                    Applied On<span className="text-red-400">*</span>
                                </label>
                                <Select value={formData.appliedOn} onValueChange={(value) => updateFormData('appliedOn', value)}>
                                    <SelectTrigger className={`w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0`}>
                                        <SelectValue placeholder="Select what the discount applies to" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-[10000]">
                                        <SelectGroup>
                                            <SelectItem value="total">Final Price (order total)</SelectItem>
                                            <SelectItem value="diamond">Diamond Price</SelectItem>
                                            <SelectItem value="making charge">Making Charge</SelectItem>
                                            <SelectItem value="combined">Diamond &amp; Making (Combined)</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* For combined the KIND is fixed (two %s); otherwise choose % or flat. */}
                            {formData.appliedOn !== 'combined' && (
                                <div>
                                    <label htmlFor="discountType" className="block text-[0.80rem] font-semibold mb-2">
                                        Discount Type<span className="text-red-400">*</span>
                                    </label>
                                    <Select value={formData.discountType} onValueChange={(value) => updateFormData('discountType', value)}>
                                        <SelectTrigger className={`w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0`}>
                                            <SelectValue placeholder="Select Discount Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white z-[10000]">
                                            <SelectGroup>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="absolute">Flat (₹)</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Combined uses the two component %s instead of a single value/cap. */}
                            {formData.appliedOn === 'combined' ? (
                                <>
                                    <div>
                                        <label htmlFor="makingChargePercent" className="block text-[0.80rem] font-semibold mb-2">
                                            Making Charge %<span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="makingChargePercent"
                                            name="makingChargePercent"
                                            min="0"
                                            max="99.99"
                                            step="0.01"
                                            placeholder="e.g. 5"
                                            value={formData.makingChargePercent}
                                            onChange={(e) => updateFormData('makingChargePercent', e.target.value)}
                                            className={`w-full px-3 py-2 border text-[0.80rem] ${errors.makingChargePercent ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                        />
                                        {errors.makingChargePercent && <p className="text-red-500 text-xs mt-1">{errors.makingChargePercent}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="diamondPercent" className="block text-[0.80rem] font-semibold mb-2">
                                            Diamond %<span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="diamondPercent"
                                            name="diamondPercent"
                                            min="0"
                                            max="99.99"
                                            step="0.01"
                                            placeholder="e.g. 10"
                                            value={formData.diamondPercent}
                                            onChange={(e) => updateFormData('diamondPercent', e.target.value)}
                                            className={`w-full px-3 py-2 border text-[0.80rem] ${errors.diamondPercent ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                        />
                                        {errors.diamondPercent && <p className="text-red-500 text-xs mt-1">{errors.diamondPercent}</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="discountValue" className="block text-[0.80rem] font-semibold mb-2">
                                            Discount Value<span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="discountValue"
                                            name="discountValue"
                                            min="0"
                                            max={formData.discountType === 'percentage' ? "99.99" : undefined}
                                            step="0.01"
                                            placeholder={formData.discountType === 'percentage' ? "Rate in %" : "Amount in ₹"}
                                            value={formData.discountValue}
                                            onChange={(e) => updateFormData('discountValue', e.target.value)}
                                            className={`w-full px-3 py-2 border text-[0.80rem] ${errors.discountValue ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                        />
                                        {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="maxDiscountAmount" className="block text-[0.80rem] font-semibold mb-2">
                                            Max Discount Amount {formData.discountType === 'percentage' && <span className="text-zinc-400 font-normal">(Optional)</span>}
                                        </label>
                                        <input
                                            type="number"
                                            id="maxDiscountAmount"
                                            name="maxDiscountAmount"
                                            min="0"
                                            disabled={formData.discountType !== 'percentage'}
                                            placeholder={formData.discountType !== 'percentage' ? "N/A (Fixed Discount)" : "Max discount cap amount"}
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => updateFormData('maxDiscountAmount', e.target.value)}
                                            className={`w-full px-3 py-2 border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                        />
                                        {errors.maxDiscountAmount && <p className="text-red-500 text-xs mt-1">{errors.maxDiscountAmount}</p>}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[0.80rem] font-semibold">
                                        Start Date<span className="text-red-400">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData('startDate', getTodayDate())}
                                        className="text-[0.72rem] text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                                    >
                                        Set Today
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.startDate || ""}
                                        onChange={(e) => updateFormData('startDate', e.target.value)}
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                        className={`w-full pl-10 pr-3 py-2 border text-[0.80rem] ${errors.startDate ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer`}
                                    />
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#656B7B] pointer-events-none" />
                                </div>
                                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[0.80rem] font-semibold">
                                        End Date<span className="text-red-400">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData('endDate', getTodayDate())}
                                        className="text-[0.72rem] text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                                    >
                                        Set Today
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.endDate || ""}
                                        min={formData.startDate || getTodayDate()}
                                        onChange={(e) => updateFormData('endDate', e.target.value)}
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                        className={`w-full pl-10 pr-3 py-2 border text-[0.80rem] ${errors.endDate ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer`}
                                    />
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#656B7B] pointer-events-none" />
                                </div>
                                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-[0.80rem] font-semibold mb-2">
                                    Status
                                </label>
                                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                                    <SelectTrigger className={`w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0`}>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-[10000]">
                                        <SelectGroup>
                                            {COUPON_STATUS_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="priceRangeFrom" className="block text-[0.80rem] font-semibold mb-2">
                                    Spend From Amount<span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="priceRangeFrom"
                                    min="0"
                                    placeholder="Minimum spend limit"
                                    value={formData.priceRange.from}
                                    onChange={(e) => updatePriceRange('from', e.target.value)}
                                    className={`w-full px-3 py-2 border text-[0.80rem] ${errors.priceRangeFrom ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                {errors.priceRangeFrom && <p className="text-red-500 text-xs mt-1">{errors.priceRangeFrom}</p>}
                            </div>

                            <div>
                                <label htmlFor="priceRangeTo" className="block text-[0.80rem] font-semibold mb-2">
                                    Spend To Amount <span className="text-gray-400 font-normal">(blank = no cap)</span>
                                </label>
                                <input
                                    type="number"
                                    id="priceRangeTo"
                                    min="0"
                                    placeholder="No maximum"
                                    value={formData.priceRange.to}
                                    onChange={(e) => updatePriceRange('to', e.target.value)}
                                    className={`w-full px-3 py-2 border text-[0.80rem] ${errors.priceRangeTo ? 'border-red-500' : 'border-[#E4E8EE]'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                {errors.priceRangeTo && <p className="text-red-500 text-xs mt-1">{errors.priceRangeTo}</p>}
                            </div>
                        </div>

                        {/* Usage limits */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="usageLimit" className="block text-[0.80rem] font-semibold mb-2">
                                    Total Usage Limit <span className="text-gray-400 font-normal">(blank = unlimited)</span>
                                </label>
                                <input
                                    type="number"
                                    id="usageLimit"
                                    min="0"
                                    placeholder="e.g. 100"
                                    value={formData.usageLimit}
                                    onChange={(e) => updateFormData('usageLimit', e.target.value)}
                                    className="w-full px-3 py-2 border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="perUserLimit" className="block text-[0.80rem] font-semibold mb-2">
                                    Per-User Limit <span className="text-gray-400 font-normal">(blank = unlimited)</span>
                                </label>
                                <input
                                    type="number"
                                    id="perUserLimit"
                                    min="0"
                                    placeholder="e.g. 1"
                                    value={formData.perUserLimit}
                                    onChange={(e) => updateFormData('perUserLimit', e.target.value)}
                                    className="w-full px-3 py-2 border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-[0.85rem] font-semibold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!formData.firstOrderOnly}
                                    onChange={(e) => updateFormData('firstOrderOnly', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                First order only
                                <span className="text-gray-400 font-normal">(valid only on a customer's first order)</span>
                            </label>
                        </div>

                        {formData.couponType === 'assigneeOnly' && (
                            <div className="mb-6 border border-[#E4E8EE] rounded-xl p-4 bg-gray-50/50">
                                <label className="block text-[0.80rem] font-semibold mb-2">
                                    Assignees (Target Users)<span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search users by name, email, or phone..."
                                    value={assigneeSearch}
                                    onChange={(e) => setAssigneeSearch(e.target.value)}
                                    className="w-full mb-3 px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                />
                                {isLoadingAssignees ? (
                                    <div className="flex justify-center items-center py-4">
                                        <Loader2 className="animate-spin text-[#087B5D]" size={20} />
                                    </div>
                                ) : (
                                    <div className="max-h-48 overflow-y-auto border border-[#E4E8EE] rounded-md p-3 space-y-2.5 bg-white custom-scrollbar">
                                        {filteredAssignees.length === 0 ? (
                                            <p className="text-[0.80rem] text-[#656B7B] text-center py-2">No users found</p>
                                        ) : (
                                            filteredAssignees.map((user) => {
                                                const userId = user._id || user.id;
                                                const isSelected = formData.assignees.includes(userId);

                                                // Format phone number with country code if available
                                                const phoneStr = user.phone ? String(user.phone) : "";
                                                const countryCode = user.phoneCountryCode || user.countryCode || "";
                                                const formattedPhone = phoneStr ? `${countryCode} ${phoneStr}`.trim() : "";

                                                // Determine displayName and subText
                                                let displayName = user.name || "";
                                                let subText = "";

                                                if (displayName) {
                                                    // Name exists. Show email or phone as subtext. If both exist, show both.
                                                    if (user.email && formattedPhone) {
                                                        subText = `${user.email} | ${formattedPhone}`;
                                                    } else {
                                                        subText = user.email || formattedPhone || "No contact info";
                                                    }
                                                } else {
                                                    // Name is missing. Try to use email or phone as display name.
                                                    if (user.email) {
                                                        displayName = user.email;
                                                        subText = formattedPhone;
                                                    } else if (formattedPhone) {
                                                        displayName = formattedPhone;
                                                        subText = "";
                                                    } else {
                                                        displayName = "Unnamed User";
                                                        subText = "";
                                                    }
                                                }

                                                return (
                                                    <label key={userId} className="flex items-center gap-3 text-[0.80rem] cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    updateFormData('assignees', [...formData.assignees, userId]);
                                                                } else {
                                                                    updateFormData('assignees', formData.assignees.filter(id => id !== userId));
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-zinc-950">{displayName}</span>
                                                            {subText && <span className="text-[0.70rem] text-zinc-400">{subText}</span>}
                                                        </div>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                                {errors.assignees && <p className="text-red-500 text-xs mt-1">{errors.assignees}</p>}
                            </div>
                        )}

                        <div className="mb-6">
                            <label htmlFor="description" className="block text-[0.80rem] font-semibold mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="Enter description"
                                value={formData.description}
                                onChange={(e) => updateFormData('description', e.target.value)}
                                className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}