
import chargesModel from "../models/charges.model.js";
import metalModel from "../models/metal.model.js";
import metalPriceModel from "../models/metalPrice.model.js";
import ProductMaster from "../models/product.model.js"
import productStoneModel from "../models/productStone.model.js";
import stoneGroupModel from "../models/stoneGroup.model.js";
import stoneGroupDefaultModel from "../models/stoneGroupDefault.model.js";
import parameterModel from "../models/parameter.model.js";
import Constant from "../constants/user.constant.js";
import { buildStoneGroupIndex, resolveStoneGroup } from "../utils/stoneMatch.js";

export const calculateProductsPriceService = async ({
    productIds = []
    // checkOnly = false,
}) => {

    if (!productIds.length) {
        return;
    }

    const products = await ProductMaster.find({
        _id: { $in: productIds },
        isDeleted: 0,
        status: Constant.PRODUCT_STATUS.AVAILABLE
    })
        .select(`
            _id
            itemCode
            parentItemCode
            productTitle
            appxMetalWgt
            haveChain
            cWgt
            metalId
            labourCode
            otherChargeCode
            metalPrice
            labourPrice
            otherChargePrice
            SideDiamondPrice
            CenterDiamondPrice
            TotalDiamondPrice
            finalPrice
        `)
        .lean();

    if (!products.length) {
        return;
    }

    const targetedProductIds =
        products.map(p => p._id);

    // --------------------------------------------------
    // FETCHES
    // --------------------------------------------------

    const [
        stones,
        allMetals,
        metalPriceDoc,
        allCharges,
        // activeDefaults, // for mutliple stone default
        activeDefault,
        allParameters
    ] = await Promise.all([

        productStoneModel.find({
            productId: {
                $in: targetedProductIds
            },
            status: "ACTIVE"
        })
            .select(`
                productId
                itemCode
                type
                totalCarat
                weight
                stoneGroup
                shape
                color
                clarity
                size
                price
                lgdPrice
                naturalPrice
            `)
            .lean(),
        // add origin in select for multiple stone default
        metalModel.find({
            status: "ACTIVE",
            isDeleted: 0
        })
            .select(`
                _id
                price_type
                purity
                price_per_gram
            `)
            .lean(),

        metalPriceModel.findOne({
            status: "ACTIVE",
            isDeleted: 0
        }).lean(),

        chargesModel.find({
            status: Constant.STATUS.ACTIVE,
            isDeleted: false
        }).lean(),

        stoneGroupDefaultModel.findOne({
            // stoneGroupDefaultModel.find({  // for multiple stone default
            stoneType: "diamond",
            isDefault: true,
            isDeleted: false,
            status: Constant.STATUS.ACTIVE
        }).lean(),

        parameterModel.find({
            status: "ACTIVE",
            isDeleted: 0
        }).select("_id name code").lean()
    ]);

    // --------------------------------------------------
    // MAPS
    // --------------------------------------------------

    const chargesMap = new Map(
        allCharges.map(c => [
            c._id.toString(),
            c
        ])
    );

    const parameterMap = new Map(
        allParameters.map(p => [
            p._id.toString(),
            p.name || p.code
        ])
    );

    const combinedMetalMap = new Map();

    if (metalPriceDoc) {

        for (const m of allMetals) {

            const basePrice =
                metalPriceDoc[
                m.price_type?.toLowerCase()
                ] || 0;

            const price_per_gram =
                parseFloat(
                    (
                        (basePrice / 10)
                        * (m.purity || 1)
                    ).toFixed(2)
                );

            m.price_per_gram =
                price_per_gram;

            combinedMetalMap.set(
                m._id.toString(),
                m
            );
        }

    } else {

        for (const m of allMetals) {

            combinedMetalMap.set(
                m._id.toString(),
                m
            );
        }
    }

    // --------------------------------------------------
    // STONE GROUP MAP
    // --------------------------------------------------

    // Load the ENTIRE current stone-group master, not just the groups the stones
    // happen to point at. Pricing resolves each stone by its natural key
    // (shape + colour + clarity + carat bucket), so a re-imported stone-group
    // sheet — which assigns brand new _ids — is picked up without touching a
    // single product. The stored `stoneGroup` id is a fallback, not the source
    // of truth.
    const stoneGroups =
        await stoneGroupModel.find({})
            .select("_id stoneType type shape color clarity carat lgd_price natural_price")
            .lean();

    // let activeDefaultGlobal = activeDefaults.find(d => d.origin === "Both") || activeDefaults[0]; // from multiple stone default
    let preferred = Constant.DEFAULT_PRICE_SOURCE;
    // if (activeDefaultGlobal && activeDefaultGlobal.origin) { // for multiple stone default
    if (activeDefault && activeDefault.origin) {
        const defaultOrigin = String(activeDefault.origin).toLowerCase();
        // const defaultOrigin = String(activeDefaultGlobal.origin).toLowerCase(); // for multiple stone default
        if (defaultOrigin === "natural") {
            preferred = Constant.STONE_PRICE_SOURCE.NATURAL;
        } else if (defaultOrigin === "lab grown") {
            preferred = Constant.STONE_PRICE_SOURCE.LGD;
        }
    }

    // for multi-stone-default
    // const getStonePrice = (sg, stoneOrigin) => {
    //     let stonePreferred = preferred;
    //     if (stoneOrigin) {
    //         const originLower = String(stoneOrigin).toLowerCase();
    //         if (originLower === "natural") {
    //             stonePreferred = Constant.STONE_PRICE_SOURCE.NATURAL;
    //         } else if (originLower === "lab grown" || originLower === "labgrown") {
    //             stonePreferred = Constant.STONE_PRICE_SOURCE.LGD;
    //         }
    //     }
    //     if (sg?.[stonePreferred] > 0) return sg[stonePreferred];
    //     const fallback = stonePreferred === Constant.STONE_PRICE_SOURCE.NATURAL
    //  ? Constant.STONE_PRICE_SOURCE.LGD
    //         : Constant.STONE_PRICE_SOURCE.NATURAL;
    //     return sg?.[fallback] > 0 ? sg[fallback] : 0;
    // };
    const getStonePrice = (sg) => {
        if (sg?.[preferred] > 0) return sg[preferred];
        const fallback = preferred === Constant.STONE_PRICE_SOURCE.NATURAL
            ? Constant.STONE_PRICE_SOURCE.LGD
            : Constant.STONE_PRICE_SOURCE.NATURAL;
        return sg?.[fallback] > 0 ? sg[fallback] : 0;
    };

    const stoneGroupsById =
        new Map(
            stoneGroups.map(sg => [
                sg._id.toString(),
                sg
            ])
        );

    const stoneGroupIndex = buildStoneGroupIndex(stoneGroups);

    // Stones whose resolved group differs from the stored id get their reference
    // repaired as a side effect of the sync, so the drift heals itself over time.
    const refRepairs = [];

    // --------------------------------------------------
    // STONES BY PRODUCT
    // --------------------------------------------------

    const stonesByProductMap =
        new Map();

    for (const stone of stones) {

        const pid =
            stone.productId.toString();

        if (!stonesByProductMap.has(pid)) {

            stonesByProductMap.set(
                pid,
                []
            );
        }

        stonesByProductMap
            .get(pid)
            .push(stone);
    }

    // --------------------------------------------------
    // PRODUCT LOOP
    // --------------------------------------------------

    const productUpdates = [];
    const stoneUpdates = [];

    // A ProductStone whose `stoneGroup` no longer resolves to a StoneGroup is an
    // ORPHAN. It used to be priced at 0 silently: the stone's stored price was
    // overwritten with 0 and the product's finalPrice was recomputed as if the
    // stone were free. Re-running the sync therefore deepened the damage every
    // time. We now refuse to price such products at all and report them, so the
    // last known-good prices survive until scripts/relinkProductStones.mjs has
    // repaired the foreign keys.
    const orphanReport = {
        stoneCount: 0,
        productCount: 0,
        samples: [],
    };

    for (const product of products) {

        const currentProductStones =
            stonesByProductMap.get(
                product._id.toString()
            ) || [];

        const combinedMetal =
            combinedMetalMap.get(
                product.metalId?.toString()
            );

        let metalWeight =
            product.appxMetalWgt || 0;

        if (
            product.haveChain
                ?.toLowerCase() === "yes"
        ) {

            metalWeight +=
                (product.cWgt || 0);
        }

        let metalPrice = 0;
        let labourPrice = 0;
        let otherPrice = 0;

        // --------------------------------------------------
        // METAL
        // --------------------------------------------------

        if (combinedMetal) {

            metalPrice =
                (combinedMetal.price_per_gram || 0)
                * metalWeight;

            const makingCharge =
                chargesMap.get(
                    product.labourCode?.toString()
                );

            const otherChargeItem =
                chargesMap.get(
                    product.otherChargeCode?.toString()
                );

            // LABOUR

            if (makingCharge) {

                if (
                    makingCharge.charge_mode
                    === "fixed"
                ) {

                    labourPrice =
                        makingCharge.amount_per_gm || 0;

                } else {

                    labourPrice =
                        (makingCharge.amount_per_gm || 0)
                        * metalWeight;

                    if (
                        makingCharge.min_amount
                        && labourPrice < makingCharge.min_amount
                    ) {

                        labourPrice =
                            makingCharge.min_amount;
                    }
                }
            }

            // OTHER CHARGE

            if (otherChargeItem) {

                if (
                    otherChargeItem.charge_mode
                    === "fixed"
                ) {

                    otherPrice =
                        otherChargeItem.amount_per_gm || 0;

                } else {

                    otherPrice =
                        (otherChargeItem.amount_per_gm || 0)
                        * metalWeight;

                    if (
                        otherChargeItem.min_amount
                        && otherPrice < otherChargeItem.min_amount
                    ) {

                        otherPrice =
                            otherChargeItem.min_amount;
                    }
                }
            }
        }

        // --------------------------------------------------
        // DIAMONDS
        // --------------------------------------------------

        let totalDiamondPrice = 0;
        let sideDiamondPrice = 0;
        let centerDiamondPrice = 0;
        let hasOrphanStone = false;
        for (const stone of currentProductStones) {
            const originalSg = stone.stoneGroup ? stoneGroupsById.get(stone.stoneGroup.toString()) : null;
            // A stone is a gem if its resolved group says so, OR if its stored
            // type is "GEM" (covers orphaned refs where the group no longer exists).

            // const isGem = (originalSg && (originalSg.stoneType === "color stone" || originalSg.stoneType === "gemstone")) || (String(stone.type || "").toUpperCase() === "GEM");  // for multiple stone default

            const isGem = (originalSg && (originalSg.stoneType === "color stone" || originalSg.stoneType === "gemstone"));
            let stoneToResolve = stone;
            let targetColor = stone.color;
            let targetClarity = stone.clarity;

            // for multiple stone default 
            // if (!isGem) {
            //     const stoneOrigin = stone.origin || "Both";
            //     let activeDefault = activeDefaults.find(d => d.origin === stoneOrigin);
            //     if (!activeDefault) {
            //         activeDefault = activeDefaults.find(d => d.origin === "Both");
            //     }
            //     if (!activeDefault && activeDefaults.length > 0) {
            //         activeDefault = activeDefaults[0];
            //     }

            //     if (activeDefault && activeDefault.color && activeDefault.clarity) {
            //         targetColor = activeDefault.color;
            //         targetClarity = activeDefault.clarity;
            //         stoneToResolve = {
            //             ...stone,
            //             color: targetColor,
            //             clarity: targetClarity
            //         };
            //     }
            // }

            if (!isGem && activeDefault && activeDefault.color && activeDefault.clarity) {
                targetColor = activeDefault.color;
                targetClarity = activeDefault.clarity;
                stoneToResolve = {
                    ...stone,
                    color: targetColor,
                    clarity: targetClarity
                };
            }

            // Resolve against the CURRENT master by natural key; the stored id is
            // only consulted for rows that cannot be keyed (GEM rows).
            const { group: sg, source, ambiguous, noRateForGrade } = resolveStoneGroup(
                stoneToResolve,
                stoneGroupIndex,
                stoneGroupsById
            );

            // Unresolvable: bail out BEFORE the write-back below, otherwise we
            // persist price: 0 onto a stone that merely lost its stone group.
            if (!sg) {
                hasOrphanStone = true;
                orphanReport.stoneCount += 1;
                const reason = ambiguous
                    ? `${ambiguous} stone groups match the same key`
                    : noRateForGrade
                        ? `no rate published for ${stoneToResolve.color}/${stoneToResolve.clarity} at ${stoneToResolve.size} ct`
                        : "no stone group matches";
                if (orphanReport.samples.length < 10) {
                    orphanReport.samples.push({
                        itemCode: product.itemCode,
                        productId: product._id?.toString(),
                        stoneId: stone._id?.toString(),
                        stoneGroup: stone.stoneGroup?.toString() || null,
                        reason,
                    });
                }
                if (!orphanReport.allOrphans) {
                    orphanReport.allOrphans = [];
                }
                orphanReport.allOrphans.push({
                    "Issue": reason,
                    "Item Code": product.itemCode,
                    "ParentItem Code": product.parentItemCode || "",
                    "Product Title": product.productTitle || "",
                    "Shape": stoneToResolve.shape ? (parameterMap.get(stoneToResolve.shape.toString()) || stoneToResolve.shape.toString()) : null,
                    "Color": stoneToResolve.color || null,
                    "Clarity": stoneToResolve.clarity || null,
                    "Size": stoneToResolve.size || null,
                    "Stone Group": stone.stoneGroup?.toString() || null,
                });
                continue;
            }

            // Self-heal the stored reference when the natural key found a
            // different (or a newly imported) group.
            if (source === "key" && stone.stoneGroup?.toString() !== sg._id.toString()) {
                refRepairs.push({
                    updateOne: {
                        filter: { _id: stone._id },
                        update: { $set: { stoneGroup: sg._id } },
                    },
                });
            }

            const matchedAmount = getStonePrice(sg);
            // const matchedAmount = getStonePrice(sg, stone.origin);  // for multiple stone defaults
            const lgdPrice = sg?.lgd_price || 0;
            const naturalPrice = sg?.natural_price || 0;
            const stoneWeight = stone.weight || 0;

            const totalMatchedAmount = matchedAmount * stoneWeight;
            const totalLgdPrice = lgdPrice * stoneWeight;
            const totalNaturalPrice = naturalPrice * stoneWeight;

            if (
                stone.price !== totalMatchedAmount ||
                stone.lgdPrice !== totalLgdPrice ||
                stone.naturalPrice !== totalNaturalPrice ||
                stone.color !== targetColor ||
                stone.clarity !== targetClarity
            ) {
                stoneUpdates.push({
                    updateOne: {
                        filter: { _id: stone._id },
                        update: {
                            $set: {
                                price: totalMatchedAmount,
                                lgdPrice: totalLgdPrice,
                                naturalPrice: totalNaturalPrice,
                                color: targetColor,
                                clarity: targetClarity
                            }
                        }
                    }
                });
            }

            if (!matchedAmount) {
                continue;
            }

            const stoneCost =
                matchedAmount
                * (stone.weight || 0);

            const type =
                String(stone.type || "")
                    .toUpperCase();

            if (type === "SIDE") {

                sideDiamondPrice +=
                    stoneCost;

                totalDiamondPrice +=
                    stoneCost;
            }

            if (type === "CENTER") {

                centerDiamondPrice +=
                    stoneCost;

                totalDiamondPrice +=
                    stoneCost;
            }
        }

        // --------------------------------------------------
        // FINALS
        // --------------------------------------------------

        // Any orphaned stone means totalDiamondPrice is missing that stone's
        // value. Writing finalPrice now would publish a price that silently
        // excludes real diamonds. Leave the product untouched and report it.
        if (hasOrphanStone) {
            orphanReport.productCount += 1;
            continue;
        }

        const newMetalPrice =
            Number(metalPrice.toFixed(2));

        const newLabourPrice =
            Number(labourPrice.toFixed(2));

        const newOtherPrice =
            Number(otherPrice.toFixed(2));

        const newSideDiamondPrice =
            Number(sideDiamondPrice.toFixed(2));

        const newCenterDiamondPrice =
            Number(centerDiamondPrice.toFixed(2));

        const newTotalDiamondPrice =
            Number(totalDiamondPrice.toFixed(2));

        const newFinalPrice =
            parseFloat(
                (
                    metalPrice
                    + labourPrice
                    + otherPrice
                    + totalDiamondPrice
                ).toFixed(2)
            );

        const isProductChanged =

            product.metalPrice !== newMetalPrice ||

            product.labourPrice !== newLabourPrice ||

            product.otherChargePrice !== newOtherPrice ||

            product.SideDiamondPrice !== newSideDiamondPrice ||

            product.CenterDiamondPrice !== newCenterDiamondPrice ||

            product.TotalDiamondPrice !== newTotalDiamondPrice ||

            product.finalPrice !== newFinalPrice;

        if (isProductChanged) {

            productUpdates.push({

                updateOne: {

                    filter: {
                        _id: product._id
                    },
                    update: {
                        $set: {
                            metalPrice:
                                newMetalPrice,
                            labourPrice:
                                newLabourPrice,
                            otherChargePrice:
                                newOtherPrice,
                            SideDiamondPrice:
                                newSideDiamondPrice,
                            CenterDiamondPrice:
                                newCenterDiamondPrice,
                            TotalDiamondPrice:
                                newTotalDiamondPrice,
                            finalPrice:
                                newFinalPrice
                        }
                    }
                }
            });
        }
    }

    // --------------------------------------------------
    // ORPHAN REPORT
    // --------------------------------------------------

    if (orphanReport.stoneCount) {
        console.warn(
            `[calcProductPrice] SKIPPED ${orphanReport.productCount} product(s): ` +
            `${orphanReport.stoneCount} stone(s) could not be resolved to any current StoneGroup ` +
            `(no shape+colour+clarity+carat match, and no usable stored reference). ` +
            `Their prices were left unchanged. Run "node scripts/relinkProductStones.mjs --explain" ` +
            `to see which carat buckets are missing from the stone-group master.`
        );
        console.warn("[calcProductPrice] first unresolved:", JSON.stringify(orphanReport.samples, null, 2));
    }

    if (refRepairs.length) {
        console.log(`[calcProductPrice] repairing ${refRepairs.length} stale stoneGroup reference(s) resolved by natural key.`);
    }

    // --------------------------------------------------
    // BULK UPDATE
    // --------------------------------------------------

    const writePromises = [];

    // if (!checkOnly) {
    if (refRepairs.length) {
        writePromises.push(
            productStoneModel.bulkWrite(refRepairs, { ordered: false })
        );
    }

    if (productUpdates.length) {
        writePromises.push(
            ProductMaster.bulkWrite(productUpdates, { ordered: false })
        );
    }

    if (stoneUpdates.length) {
        writePromises.push(
            productStoneModel.bulkWrite(stoneUpdates, { ordered: false })
        );
    }

    if (writePromises.length) {
        await Promise.all(writePromises);
    }
    // }

    return {
        scannedCount: products.length,
        skippedCount: orphanReport.productCount,
        orphanCount: orphanReport.stoneCount,
        orphans: orphanReport.allOrphans || [],
        updatesCount: productUpdates.length,
        updates: productUpdates.map(u => ({
            productId: u.updateOne.filter._id,
            updates: u.updateOne.update.$set,
        })),
    };
};