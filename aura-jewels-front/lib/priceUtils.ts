import { useGlobleStore } from "@/store/globleStore";

// Money is ALWAYS rendered without decimals across the customer site.
//
// This is DISPLAY ONLY. The underlying values keep full precision: the amounts
// sent to the API, the amount the gateway charges, and everything persisted on
// the order are still exact to 2dp. Never feed a formatted string back into a
// calculation.
//
// Consequence worth knowing: because each figure is rounded independently, a
// column of rounded line items can differ from the rounded total by ~1 unit.
// The TOTAL is always the authoritative server figure, rounded once — it is not
// the sum of the rounded lines.
export const formatPrice = (price: number) => {
    const { currency, currencySymbol } = useGlobleStore.getState();
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';

    return `${currencySymbol}${Math.round(Number(price) || 0).toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

export const getOfferDiscountLabel = (offerDetails: any) => {
    if (!offerDetails || !offerDetails.offer) return null;
    const { offer, targetField, discountAmount, components } = offerDetails;
    // Combined offer: a separate % on making charge and on diamond value.
    if (targetField === 'combined') {
        const parts = (components || [])
            .map((c: any) => c?.field === 'labourPrice'
                ? `${c.percent}% Making`
                : c?.field === 'TotalDiamondPrice'
                    ? `${c.percent}% Diamond`
                    : null)
            .filter(Boolean);
        return parts.length ? `${parts.join(' + ')} OFF` : `Save ${formatPrice(discountAmount)}`;
    }
    if (offer.discountType === 'percentage') {
        const suffix = targetField === 'labourPrice'
            ? ' on Making Charges'
            : targetField === 'TotalDiamondPrice'
                ? ' on Total Diamond Price'
                : '';
        return `${offer.discountValue}% OFF${suffix}`;
    }
    return `Save ${formatPrice(discountAmount)}`;
};

export const formatBudgetLabel = (label: string, isIndiaInput?: boolean): string => {
    if (!label || typeof label !== 'string') return label;
    const isIndia = isIndiaInput !== undefined ? isIndiaInput : (useGlobleStore.getState().country || 'IN') === 'IN';
    if (isIndia) return label;

    let updated = label;

    // Known INR budget string mappings to USD equivalents
    updated = updated.replace(/Less than ₹15K/gi, 'Under $200');
    updated = updated.replace(/Less than ₹15,000/gi, 'Under $200');
    updated = updated.replace(/Under ₹15K/gi, 'Under $200');
    updated = updated.replace(/Under ₹15,000/gi, 'Under $200');

    updated = updated.replace(/₹15K to ₹30K/gi, '$200 to $400');
    updated = updated.replace(/₹15,000 to ₹30,000/gi, '$200 to $400');

    updated = updated.replace(/₹30K to ₹50K/gi, '$400 to $700');
    updated = updated.replace(/₹30,000 to ₹50,000/gi, '$400 to $700');

    updated = updated.replace(/₹50K to ₹1 Lakh/gi, '$700 to $1,200');
    updated = updated.replace(/₹50K to ₹1L/gi, '$700 to $1,200');
    updated = updated.replace(/₹50,000 to ₹1,00,000/gi, '$700 to $1,200');

    updated = updated.replace(/Above ₹1 Lakh/gi, 'Above $1,200');
    updated = updated.replace(/Above ₹1L/gi, 'Above $1,200');
    updated = updated.replace(/Above ₹1,00,000/gi, 'Above $1,200');

    // Replace any remaining ₹ symbol with $
    updated = updated.replace(/₹/g, '$');

    return updated;
};