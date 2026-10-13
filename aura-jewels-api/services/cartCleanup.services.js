import Cart from "../models/cart.model.js";

/**
 * Purges stale cart rows by soft-deleting them (isDeleted = 1).
 *
 * Removes:
 *  1. Carts with no jeweleryId (null / missing reference)
 *  2. Carts whose product no longer exists in the DB (hard-deleted)
 *  3. Carts whose product has been soft-deleted (isDeleted !== 0)
 *
 * Returns a summary { removed, details } so callers / cron logs can
 * report what was cleaned up without having to re-query.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.dryRun=false]  When true, reports what WOULD
 *   be removed without writing anything — useful for audit scripts.
 * @returns {Promise<{ removed: number, details: object[] }>}
 */
export const purgeStaleCartItems = async ({ dryRun = false } = {}) => {
    const details = [];
    const idsToRemove = new Set();

    // ── 1. Carts with no jeweleryId ────────────────────────────────────────────
    const emptyCarts = await Cart.find({
        isDeleted: 0,
        $or: [
            { jeweleryId: null },
            { jeweleryId: { $exists: false } },
        ],
    }, { _id: 1 }).lean();

    for (const c of emptyCarts) {
        idsToRemove.add(String(c._id));
        details.push({ cartId: c._id, reason: "NO_PRODUCT_REFERENCE" });
    }

    // ── 2 & 3. Carts whose product was hard- or soft-deleted ──────────────────
    // Use aggregation: $lookup on products, filter where the join result is
    // empty (hard-deleted / never existed) or the product is soft-deleted.
    const orphaned = await Cart.aggregate([
        {
            $match: {
                isDeleted: 0,
                jeweleryId: { $exists: true, $ne: null },
            },
        },
        {
            $lookup: {
                from: "productmasters",
                localField: "jeweleryId",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $match: {
                $or: [
                    // Hard-deleted — product document not found at all
                    { product: { $size: 0 } },
                    // Soft-deleted — found but flagged
                    { "product.0.isDeleted": { $ne: 0 } },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                jeweleryId: 1,
                "product.isDeleted": 1,
                "product.itemCode": 1,
            },
        },
    ]);

    for (const c of orphaned) {
        if (idsToRemove.has(String(c._id))) continue; // already counted
        idsToRemove.add(String(c._id));
        const prod = c.product?.[0];
        details.push({
            cartId: c._id,
            jeweleryId: c.jeweleryId,
            productItemCode: prod?.itemCode || null,
            reason: prod ? "PRODUCT_SOFT_DELETED" : "PRODUCT_HARD_DELETED",
        });
    }

    if (idsToRemove.size === 0) {
        return { removed: 0, details: [] };
    }

    if (!dryRun) {
        await Cart.updateMany(
            { _id: { $in: [...idsToRemove] } },
            { $set: { isDeleted: 1 } },
        );
    }

    return {
        removed: dryRun ? 0 : idsToRemove.size,
        wouldRemove: dryRun ? idsToRemove.size : undefined,
        details,
    };
};
