import Constant from "../constants/user.constant.js";
import chargesModel from "../models/charges.model.js";

// Re-prices a product for a non-default size. Handles missing charge codes,
// zero base weight, and missing diamond price without crashing — falls back
// to the product's stored values when a piece can't be recomputed.
export const calculateRingValue = async ({ product, size }) => {
    try {
        const currentMetalWgt = Number(product?.appxMetalWgt) || 0;
        const multiplier = Number(size?.weight_multipler) || 1;
        const newSizeMetalWeight = multiplier * currentMetalWgt;

        // If we have no base weight to scale, return the product's stored
        // values verbatim — there's nothing to recalculate.
        if (!currentMetalWgt) {
            return {
                metalPrice: parseFloat(Number(product?.metalPrice || 0).toFixed(2)),
                labourPrice: parseFloat(Number(product?.labourPrice || 0).toFixed(2)),
                otherPrice: parseFloat(Number(product?.otherChargePrice || 0).toFixed(2)),
                finalPrice: parseFloat(Number(product?.finalPrice || 0).toFixed(2)),
                metalWeight: 0,
            };
        }

        const metalPricePerGm = (Number(product?.metalPrice) || 0) / currentMetalWgt;
        const newMetalPrice = metalPricePerGm * newSizeMetalWeight;

        // Batch-fetch only the codes that are present. Some products have
        // neither code wired up; skipping the query keeps the math sound.
        const chargeIds = [product?.labourCode, product?.otherChargeCode].filter(Boolean);
        const charges = chargeIds.length
            ? await chargesModel.find({
                _id: { $in: chargeIds },
                status: Constant.STATUS.ACTIVE,
                isDeleted: false
            })
            : [];

        const findCharge = (id) =>
            id ? charges.find((c) => c._id.toString() === id.toString()) : null;

        const computeChargePrice = (doc, weight) => {
            if (!doc) return 0;
            if (doc.charge_mode === "fixed") {
                return Number(doc.amount_per_gm) || 0;
            }
            const rate = Number(doc.amount_per_gm) || 0;
            let value = rate * weight;
            const min = Number(doc.min_amount) || 0;
            if (min && value < min) value = min;
            return value;
        };

        const labourChargeDoc = findCharge(product?.labourCode);
        const otherChargeDoc = findCharge(product?.otherChargeCode);

        const newLabourPrice = computeChargePrice(labourChargeDoc, newSizeMetalWeight);
        const newOtherChargePrice = computeChargePrice(otherChargeDoc, newSizeMetalWeight);
        const stonePrice = Number(product?.TotalDiamondPrice) || 0;

        const newfinalPrice = newMetalPrice + newLabourPrice + newOtherChargePrice + stonePrice;

        return {
            metalPrice: parseFloat(newMetalPrice.toFixed(2)),
            labourPrice: parseFloat(newLabourPrice.toFixed(2)),
            otherPrice: parseFloat(newOtherChargePrice.toFixed(2)),
            finalPrice: parseFloat(newfinalPrice.toFixed(2)),
            metalWeight: parseFloat(newSizeMetalWeight.toFixed(3)),
        };

    } catch (error) {
        console.error("calculateRingValue error:", error);
        return false;
    }
};