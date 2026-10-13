import * as Yup from "yup";
import { OFFER_DISCOUNT_TYPE, OFFER_APPLIED_ON } from "./Constant";

export const offerValidationSchema = Yup.object({
    code: Yup.string()
        .required("Offer Code is required")
        .max(50, "Code must be 50 characters or less")
        .trim(),
    name: Yup.string()
        .required("Offer Name is required")
        .max(200, "Name must be 200 characters or less")
        .trim(),
    description: Yup.string()
        .max(1000, "Description must be 1000 characters or less")
        .nullable(),
    startDate: Yup.date()
        .required("Start Date is required")
        .typeError("Invalid Start Date"),
    endDate: Yup.date()
        .required("End Date is required")
        .typeError("Invalid End Date")
        .test(
            "greaterThanStartDate",
            "endDate must be greater than or equal to startDate",
            function (value) {
                const { startDate } = this.parent;
                if (!startDate || !value) return true;
                return new Date(value) >= new Date(startDate);
            }
        ),
    priceRange: Yup.object({
        from: Yup.number()
            .required("From Price is required")
            .min(0, "From Price must be greater than or equal to 0")
            .default(0),
        to: Yup.number()
            .required("To Price is required")
            .min(Yup.ref("from"), "priceRange.to must be greater than or equal to priceRange.from")
    }),
    discountType: Yup.string()
        .required("Discount Type is required")
        .oneOf(OFFER_DISCOUNT_TYPE.ALL_TYPES),
    discountValue: Yup.number()
        // Combined offers ignore discountValue (they use the component %s), so it
        // isn't required for them; otherwise it is.
        .when("appliedOn", {
            is: "combined",
            then: (schema) => schema.transform((v, o) => (o === "" ? 0 : v)).min(0).default(0),
            otherwise: (schema) => schema
                .required("Discount Value is required")
                .min(0, "Discount must be positive")
                .when("discountType", {
                    is: "percentage",
                    then: (s) => s.max(99.99, "Percentage discount cannot exceed 99.99%"),
                    otherwise: (s) => s
                })
        }),
    maxDiscountAmount: Yup.number()
        .nullable()
        .min(0, "Amount must be positive"),
    appliedOn: Yup.string()
        .required("Applied On target is required")
        .oneOf(OFFER_APPLIED_ON.ALL_TYPES),
    // Combined-offer component %s. At least one must be > 0, each ≤ 99.99.
    makingChargePercent: Yup.number()
        .transform((v, o) => (o === "" ? 0 : v)).nullable()
        .min(0, "Cannot be negative").max(99.99, "Cannot exceed 99.99%"),
    diamondPercent: Yup.number()
        .transform((v, o) => (o === "" ? 0 : v)).nullable()
        .min(0, "Cannot be negative").max(99.99, "Cannot exceed 99.99%")
        .when("appliedOn", {
            is: "combined",
            then: (schema) => schema.test(
                "at-least-one-combined",
                "Enter a making-charge % or a diamond % (at least one > 0)",
                function (val) {
                    const making = Number(this.parent.makingChargePercent) || 0;
                    return (Number(val) || 0) > 0 || making > 0;
                }
            ),
            otherwise: (schema) => schema
        }),
    status: Yup.string()
        .required("Status is required")
        .oneOf(["active", "inactive"]),
    isActive: Yup.boolean().default(true)
});

export const validateCouponForm = (formData) => {
    const newErrors = {};

    if (!formData.code || formData.code.trim() === '') {
        newErrors.code = 'Coupon Code is required';
    } else if (formData.code.length > 50) {
        newErrors.code = 'Coupon Code cannot exceed 50 characters';
    }

    if (!formData.name || formData.name.trim() === '') {
        newErrors.name = 'Coupon Name is required';
    } else if (formData.name.length > 200) {
        newErrors.name = 'Coupon Name cannot exceed 200 characters';
    }

    if (!formData.startDate) {
        newErrors.startDate = 'Start Date is required';
    }

    if (!formData.endDate) {
        newErrors.endDate = 'End Date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End Date must be greater than or equal to Start Date';
    }

    if (formData.priceRange.from === undefined || formData.priceRange.from === null || formData.priceRange.from === '') {
        newErrors.priceRangeFrom = 'Spend From amount is required';
    } else if (Number(formData.priceRange.from) < 0) {
        newErrors.priceRangeFrom = 'Spend From cannot be negative';
    }

    // "Spend To" is OPTIONAL — blank means "no upper limit" (min-spend-only
    // coupon), which the API supports. Only validate it when a value is given.
    const toBlank = formData.priceRange.to === undefined || formData.priceRange.to === null || formData.priceRange.to === '';
    if (!toBlank) {
        if (Number(formData.priceRange.to) < 0) {
            newErrors.priceRangeTo = 'Spend To cannot be negative';
        } else if (Number(formData.priceRange.to) < Number(formData.priceRange.from)) {
            newErrors.priceRangeTo = 'Spend To must be greater than or equal to Spend From';
        }
    }

    // "combined" is now expressed via appliedOn (legacy discountType === 'combined'
    // still recognised). It uses the two component %s instead of a single value.
    const isCombinedCoupon = formData.appliedOn === 'combined' || formData.discountType === 'combined';

    if (!isCombinedCoupon && !formData.discountType) {
        newErrors.discountType = 'Discount Type is required';
    }

    if (isCombinedCoupon) {
        // Combined uses the two component %s, not a single discountValue.
        const making = Number(formData.makingChargePercent) || 0;
        const diamond = Number(formData.diamondPercent) || 0;
        if (making <= 0 && diamond <= 0) {
            newErrors.diamondPercent = 'Enter a making-charge % or a diamond % (at least one > 0)';
        }
        if (making < 0 || making > 99.99) newErrors.makingChargePercent = 'Making Charge % must be between 0 and 99.99%';
        if (diamond < 0 || diamond > 99.99) newErrors.diamondPercent = 'Diamond % must be between 0 and 99.99%';
    } else {
        if (formData.discountValue === undefined || formData.discountValue === null || formData.discountValue === '') {
            newErrors.discountValue = 'Discount Value is required';
        } else if (Number(formData.discountValue) < 0) {
            newErrors.discountValue = 'Discount Value must be positive';
        } else if (formData.discountType === 'percentage' && Number(formData.discountValue) > 99.99) {
            newErrors.discountValue = 'Percentage discount cannot exceed 99.99%';
        }
    }

    if (formData.discountType === 'percentage' && formData.maxDiscountAmount !== undefined && formData.maxDiscountAmount !== null && formData.maxDiscountAmount !== '') {
        if (Number(formData.maxDiscountAmount) < 0) {
            newErrors.maxDiscountAmount = 'Max Discount Amount must be positive';
        }
    }

    if (!formData.couponType) {
        newErrors.couponType = 'Coupon Type is required';
    }

    if (formData.couponType === 'assigneeOnly' && (!formData.assignees || formData.assignees.length === 0)) {
        newErrors.assignees = 'At least one assignee is required for Assignee Only coupon';
    }

    return newErrors;
};

