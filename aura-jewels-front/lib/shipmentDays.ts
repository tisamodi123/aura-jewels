// Shipping lead-time normalisation. Products carry `shipmentDays` in several
// shapes — 15, "15", "15 to 17", "15-17", "15 - 17" — and every surface (PDP,
// order) must render them ONE way: "15 Days" / "15 to 17 Days".
// Mirrors api/utils/shipmentDays.js — keep the two in step.

const extractDays = (raw: unknown): number[] => {
    if (raw === null || raw === undefined || raw === '') return [];
    const matches = String(raw).match(/\d+/g) || [];
    return matches.map(Number).filter((n) => n > 0);
};

// "15 to 17 Days" | "15 Days" | "" when the product has no usable value.
export const formatShipmentDays = (raw: unknown): string => {
    const days = extractDays(raw);
    if (!days.length) return '';
    if (days.length === 1) return `${days[0]} Days`;
    return `${Math.min(...days)} to ${Math.max(...days)} Days`;
};

// Upper bound of the range — the conservative figure for delivery estimates.
export const shipmentDaysUpperBound = (raw: unknown): number => {
    const days = extractDays(raw);
    return days.length ? Math.max(...days) : 0;
};
