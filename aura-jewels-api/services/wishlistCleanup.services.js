import Wishlist from "../models/wishlist.model.js";

/**
 * Purges stale wishlist rows by soft-deleting them (isDeleted = 1).
 *
 * Removes:
 *  1. Wishlist entries with no jeweleryId (null / missing reference)
 *  2. Entries whose product no longer exists in the DB (hard-deleted)
 *  3. Entries whose product has been soft-deleted (isDeleted !== 0)
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.dryRun=false]  When true, reports what WOULD
 *   be removed without writing anything — useful for audit scripts.
 * @returns {Promise<{ removed: number, details: object[] }>}
 */
export const purgeStaleWishlistItems = async ({ dryRun = false } = {}) => {
    const details = [];
    const idsToRemove = new Set();

    // ── 1. Entries with no jeweleryId ─────────────────────────────────────────
    const emptyEntries = await Wishlist.find({
        isDeleted: 0,
        $or: [
            { jeweleryId: null },
            { jeweleryId: { $exists: false } },
        ],
    }, { _id: 1 }).lean();

    for (const w of emptyEntries) {
        idsToRemove.add(String(w._id));
        details.push({ wishlistId: w._id, reason: "NO_PRODUCT_REFERENCE" });
    }

    // ── 2 & 3. Entries whose product was hard- or soft-deleted ────────────────
    const orphaned = await Wishlist.aggregate([
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

    for (const w of orphaned) {
        if (idsToRemove.has(String(w._id))) continue;
        idsToRemove.add(String(w._id));
        const prod = w.product?.[0];
        details.push({
            wishlistId: w._id,
            jeweleryId: w.jeweleryId,
            productItemCode: prod?.itemCode || null,
            reason: prod ? "PRODUCT_SOFT_DELETED" : "PRODUCT_HARD_DELETED",
        });
    }

    if (idsToRemove.size === 0) {
        return { removed: 0, details: [] };
    }

    if (!dryRun) {
        await Wishlist.updateMany(
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
