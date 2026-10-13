/**
 * A cart / wishlist line is NOT identified by its product alone.
 *
 * The same design bought as a Natural diamond and as a Lab Grown diamond is two
 * different things, at two different prices. So is the same ring in two ring
 * sizes. Keying a line on `jeweleryId` alone meant the second add either got
 * rejected as a duplicate (wishlist) or silently overwrote the first line's
 * selection (cart).
 *
 * The line identity is:  product + size + origin + colour + clarity
 *
 * `engraving` / `engravingText` are deliberately NOT part of it. They are
 * attributes of a line that get updated in place, which is the behaviour that
 * already exists; making them identity-bearing would split lines in ways nobody
 * has asked for.
 */

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "" / undefined / "null" all mean "not selected". */
export const normalizeSelectionValue = (value) => {
    if (value === undefined || value === null) return null;
    const s = String(value).trim();
    return s === "" ? null : s;
};

/**
 * The selection fields, normalised. Use this before WRITING a line so two rows
 * can never differ only by whitespace or by `""` vs `null`.
 */
export const normalizeSelection = (source = {}) => ({
    origin: normalizeSelectionValue(source.origin),
    color: normalizeSelectionValue(source.color),
    clarity: normalizeSelectionValue(source.clarity),
});

/**
 * A Mongo filter fragment matching one selection.
 *
 * `null` matches documents where the field is null AND where it is absent, so
 * rows written before these fields existed still resolve. Non-null values are
 * matched case-insensitively — "Lab Grown" and "lab grown" are one selection,
 * and without this the client's casing could silently create a second line.
 */
export const selectionFilter = (source = {}) => {
    const { origin, color, clarity } = normalizeSelection(source);
    const eq = (v) => (v === null ? null : new RegExp(`^${escapeRegex(v)}$`, "i"));
    return { origin: eq(origin), color: eq(color), clarity: eq(clarity) };
};

/** Same, plus size. Cart lines are also identified by the chosen ring size. */
export const cartLineFilter = (source = {}) => ({
    ...selectionFilter(source),
    sizeId: source.sizeId || null,
});

/** True when two lines are the same line. Used for in-memory de-duplication. */
export const sameSelection = (a = {}, b = {}) => {
    const x = normalizeSelection(a);
    const y = normalizeSelection(b);
    const eq = (p, q) =>
        (p === null && q === null) ||
        (p !== null && q !== null && p.toLowerCase() === q.toLowerCase());
    return eq(x.origin, y.origin) && eq(x.color, y.color) && eq(x.clarity, y.clarity);
};

/**
 * A stable, printable key for one line. Used to de-duplicate guest cookie rows
 * and to give each guest preview row a unique `_id` — two cookie entries for the
 * same SKU in different origins previously collided on the same id, so the
 * client could not tell them apart or remove just one.
 */
export const lineKey = (source = {}) => {
    const { origin, color, clarity } = normalizeSelection(source);
    const part = (v) => (v === null ? "" : v.toLowerCase());
    const product = String(source.sku || source.jeweleryId || source.productId || "").trim().toLowerCase();
    const size = String(source.sizeId || "").trim().toLowerCase();
    return [product, size, part(origin), part(color), part(clarity)].join("|");
};
