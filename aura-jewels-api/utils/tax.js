// Single source of truth for sales tax (GST).
//
// Policy (confirmed with the business):
//   * Listed prices are tax-EXCLUSIVE. The tax is ADDED ON TOP.
//   * The taxable value is the NET of any coupon:  subTotal - couponDiscount.
//   * The store wallet is a PAYMENT METHOD, not a discount, so it is applied
//     AFTER tax, against the gross (tax-inclusive) total.
//   * Domestic (India) orders only. Exports are shipped tax-exclusive and the
//     destination levies its own duties, so we must not bill Indian GST on them.
//
// The resulting money pipeline is:
//
//     subTotal
//   - couponDiscount
//   ------------------
//   = taxableAmount
//   + taxAmount           (taxableAmount x TAX_RATE)
//   ------------------
//   = grandTotal
//   - walletUsed
//   ------------------
//   = amountDue           (what the gateway charges)
//
// Every surface (PDP, cart, checkout, order, invoice) MUST derive tax from this
// module. Do not re-implement the rate anywhere else — a second copy is how the
// cart and the invoice end up disagreeing about what the customer owes.

export const TAX_RATE = 0.03; // 3%
export const TAX_LABEL = "GST";

const round2 = (n) => parseFloat((Number(n) || 0).toFixed(2));

// Accepts the several shapes a country arrives in across the codebase:
// "IN", "in", "IND", "India".
const TAXABLE_COUNTRIES = new Set(["IN", "IND", "INDIA"]);

export const isTaxableCountry = (country) =>
    TAXABLE_COUNTRIES.has(String(country || "").trim().toUpperCase());

// Resolve the country that decides taxability for a *browsing* request (PDP,
// cart) where no shipping address exists yet. Prefers an explicit `x-country`
// header from the storefront; falls back to the display currency, since INR
// implies a domestic session. Returns "" when it cannot tell (⇒ not taxed).
//
// NOTE: for an actual ORDER, always pass the shipping address country instead —
// that is the legally authoritative basis, not the browsing locale.
export const taxCountryFromRequest = (req, currency) => {
    const explicit = req?.headers?.["x-country"] || req?.query?.country;
    if (explicit) return String(explicit).trim().toUpperCase();
    if (String(currency || "").toUpperCase() === "INR") return "IN";
    return "";
};

// Compute the tax on an already-net (post-coupon) amount.
// Returns every component so callers never recompute a piece themselves.
export const computeTax = ({ taxableAmount, country }) => {
    const taxable = Math.max(0, round2(taxableAmount));

    if (!isTaxableCountry(country) || taxable <= 0) {
        return {
            taxRate: 0,
            taxAmount: 0,
            taxableAmount: taxable,
            grandTotal: taxable,
        };
    }

    const taxAmount = round2(taxable * TAX_RATE);
    return {
        taxRate: TAX_RATE,
        taxAmount,
        taxableAmount: taxable,
        grandTotal: round2(taxable + taxAmount),
    };
};
