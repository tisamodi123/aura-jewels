// Shipping lead-time normalisation. The import sheet stores `shipmentDays` in
// several shapes — 15, "15", "15 to 17", "15-17", "15 - 17" — and every surface
// (PDP, order, emails) must render them ONE way: "15 Days" / "15 to 17 Days".
// Mirrors web/lib/shipmentDays.ts — keep the two in step.

// Digits found in the value, in order. "15 - 17" -> [15, 17]; 15 -> [15].
const extractDays = (raw) => {
    if (raw === null || raw === undefined || raw === "") return [];
    const matches = String(raw).match(/\d+/g) || [];
    return matches.map(Number).filter((n) => n > 0);
};

// "15 to 17 Days" | "15 Days" | "" when the product has no usable value.
export const formatShipmentDays = (raw) => {
    const days = extractDays(raw);
    if (!days.length) return "";
    if (days.length === 1) return `${days[0]} Days`;
    return `${Math.min(...days)} to ${Math.max(...days)} Days`;
};

// Upper bound of the range (the CONSERVATIVE figure for delivery estimates).
// 0 when the product has no usable value — callers apply their own fallback.
export const shipmentDaysUpperBound = (raw) => {
    const days = extractDays(raw);
    return days.length ? Math.max(...days) : 0;
};
