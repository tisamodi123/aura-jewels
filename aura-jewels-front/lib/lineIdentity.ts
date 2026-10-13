/**
 * A cart / wishlist line is identified by the product PLUS the centre-stone
 * selection (and, for the cart, the size) — not by the product alone.
 *
 * Mirrors api/utils/lineIdentity.js. If the rules diverge, the client and the
 * server disagree about which line the customer just clicked, which is exactly
 * how wishlisting a design in Natural and then in Lab Grown used to delete the
 * first one.
 */

export interface Selection {
    origin?: string | null;
    color?: string | null;
    clarity?: string | null;
}

/** "" / undefined / null all mean "not selected". */
export const normalizeSelectionValue = (value: unknown): string | null => {
    if (value === undefined || value === null) return null;
    const s = String(value).trim();
    return s === '' ? null : s;
};

export const normalizeSelection = (source: Selection = {}) => ({
    origin: normalizeSelectionValue(source.origin),
    color: normalizeSelectionValue(source.color),
    clarity: normalizeSelectionValue(source.clarity),
});

/** Case-insensitive: "Lab Grown" and "lab grown" are one selection. */
export const sameSelection = (a: Selection = {}, b: Selection = {}): boolean => {
    const x = normalizeSelection(a);
    const y = normalizeSelection(b);
    const eq = (p: string | null, q: string | null) =>
        (p === null && q === null) ||
        (p !== null && q !== null && p.toLowerCase() === q.toLowerCase());
    return eq(x.origin, y.origin) && eq(x.color, y.color) && eq(x.clarity, y.clarity);
};

const productOf = (item: any): string =>
    String(item?.sku || item?.itemCode || item?.jeweleryId || item?.id || item?._id || '')
        .trim()
        .toLowerCase();

/**
 * A stable key for one line. Used to de-duplicate the guest cookie and to prune
 * exactly the line the server reported, rather than every line of that SKU.
 */
export const lineKey = (item: any = {}): string => {
    if (item?.cartId) return String(item.cartId);
    if (item?.isDiamond || item?.stockId) {
        return `diamond-${item.stockId || item.id || item._id || ''}`;
    }
    const { origin, color, clarity } = normalizeSelection(item);
    const part = (v: string | null) => (v === null ? '' : v.toLowerCase());
    const szId = item?.sizeId || (typeof item?.sizeDetails === 'object' ? item?.sizeDetails?._id : item?.sizeDetails) || item?.selectedSize || '';
    const size = String(szId).trim().toLowerCase();
    return [productOf(item), size, part(origin), part(color), part(clarity)].join('|');
};

/** True when `item` is the same wishlist line as `target`. */
export const isSameWishlistLine = (item: any, target: any): boolean => {
    // A row id, when both sides have one, is definitive.
    if (item?.wishlistId && target?.wishlistId) return item.wishlistId === target.wishlistId;

    const extractIds = (obj: any) => {
        if (!obj) return [];
        const jObj = typeof obj.jeweleryId === 'object' ? obj.jeweleryId : (typeof obj.jewelleryId === 'object' ? obj.jewelleryId : null);
        const ids = [
            obj.id,
            obj._id,
            obj.jeweleryId,
            obj.jewelleryId,
            jObj?._id,
            jObj?.id,
            obj.sku,
            obj.itemCode,
            jObj?.sku,
            jObj?.itemCode,
            obj.slug,
            jObj?.slug,
        ];
        return ids.map(v => {
            if (v === undefined || v === null) return '';
            if (typeof v === 'object') return (v?._id || v?.id || '');
            const s = String(v).trim();
            return (s === 'undefined' || s === 'null') ? '' : s;
        }).filter(Boolean);
    };

    const itemIds = extractIds(item);
    const targetIds = extractIds(target);
    const sameProduct = itemIds.some((id) => targetIds.includes(id));

    const extractSizes = (obj: any) => {
        if (!obj) return [];
        const szIdObj = typeof obj.sizeId === 'object' ? obj.sizeId : null;
        const szDetObj = typeof obj.sizeDetails === 'object' ? obj.sizeDetails : null;
        const sizes = [
            typeof obj.sizeId === 'string' ? obj.sizeId : null,
            szIdObj?._id,
            szIdObj?.id,
            szIdObj?.name,
            szIdObj?.code,
            obj.selectedSize,
            obj.size,
            typeof obj.sizeDetails === 'string' ? obj.sizeDetails : null,
            szDetObj?._id,
            szDetObj?.id,
            szDetObj?.name,
            szDetObj?.code,
        ];
        return sizes.filter(Boolean).map(String).map((s) => s.trim()).filter(Boolean);
    };

    const itemSizes = extractSizes(item);
    const targetSizes = extractSizes(target);
    const sameSize =
        itemSizes.length === 0 ||
        targetSizes.length === 0 ||
        itemSizes.some((s) => targetSizes.includes(s));

    return sameProduct && sameSize && sameSelection(item, target);
};

