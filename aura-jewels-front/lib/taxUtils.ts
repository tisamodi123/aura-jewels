import { DEFAULT_COUNTRY } from '@/lib/Api_Url';

// Sales tax (GST). Mirrors api/utils/tax.js — keep the two in step.
//
// Listed prices are tax-EXCLUSIVE: the tax is ADDED on top of the post-coupon
// net, and the store wallet is applied afterwards against the gross. India only;
// exports ship tax-exclusive and the destination levies its own duties.
//
// The SERVER is authoritative for every amount actually charged. These helpers
// exist for display and for the guest/offline fallback path only — never send a
// client-computed total to the API.
export const TAX_RATE = 0.03; // 3%
export const TAX_PERCENT_LABEL = '3% GST';

export const isIndiaCountry = (country?: string | null): boolean =>
    String(country || '').toUpperCase() === String(DEFAULT_COUNTRY).toUpperCase();

// Tax on an already-net (post-coupon) amount. Returns 0 for non-taxable
// destinations so callers can add it unconditionally.
export const computeTax = (netAmount: number, country?: string | null): number => {
    if (!isIndiaCountry(country)) return 0;
    const net = Number(netAmount) || 0;
    if (net <= 0) return 0;
    return parseFloat((net * TAX_RATE).toFixed(2));
};

// Adds GST on top of a net amount. Used on the PDP, where the price shown to the
// customer is the ALL-IN figure (net + GST) rather than the pre-tax net.
//
// Scope note: this is a PDP-only display convention. Listing cards, the wishlist
// and cart LINE ITEMS deliberately still show the pre-tax net — the cart itemises
// GST as its own row, so folding it into the line price there would double-count
// it visually. Never feed this value back into the cart/checkout payload: the
// server re-derives tax from the net and would tax it twice.
export const withTax = (netAmount: number, country?: string | null): number => {
    const net = Number(netAmount) || 0;
    return parseFloat((net + computeTax(net, country)).toFixed(2));
};

// Long-form note shown under a PDP price. That price is now GST-INCLUSIVE, so
// this says so rather than promising the tax is added later.
export const taxNote = (country?: string | null): string =>
    isIndiaCountry(country)
        ? `incl. ${TAX_PERCENT_LABEL}`
        : 'Duties & taxes may apply at delivery';

// Short parenthetical used next to a GRAND TOTAL, which IS tax-inclusive.
export const taxInline = (country?: string | null): string =>
    isIndiaCountry(country) ? 'incl. GST' : 'excl. duties & taxes';

// Row label for the tax line in a cart/checkout summary.
export const taxRowLabel = (country?: string | null): string =>
    isIndiaCountry(country) ? `GST (${(TAX_RATE * 100).toFixed(0)}%)` : 'Duties & Taxes';
