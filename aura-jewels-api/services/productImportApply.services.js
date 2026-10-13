import { supportsTransactions } from "../utils/mongoTransaction.js";
import { computeFamilyItemCode } from "../models/product.model.js";

const PRODUCT_CHUNK_SIZE = 2000;
const STONE_INSERT_CHUNK_SIZE = 10000;

function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

function cleanProductForDb(product, userId) {
    const { diamond, _id, createdAt, updatedAt, createdBy, ...clean } = product;

    return {
        ...clean,
        // bulkWrite bypasses Mongoose hooks, so set the variant-family key here.
        familyItemCode: computeFamilyItemCode(clean.parentItemCode, clean.itemCode),
        updatedBy: userId || null,
    };
}

function buildStoneDocs({ productChunk, productIdMap, userId }) {
    const stoneDocs = [];

    for (const product of productChunk) {
        const productId = productIdMap.get(product.itemCode);

        if (!productId) {
            throw new Error(`Product _id missing after upsert for itemCode: ${product.itemCode}`);
        }

        for (const stone of product.diamond || []) {
            stoneDocs.push({
                itemCode: product.itemCode,
                productId,

                type: stone.type || "SIDE",
                stoneGroup: stone.stoneGroup || null,

                pieces: Number(stone.pieces || 0),
                weight: Number(stone.weight || stone.wgt || 0),
                totalCarat: Number(stone.totalCarat || 0),

                shape: stone.shape || null,
                color: stone.color || null,
                clarity: stone.clarity || null,
                size: stone.size || "",

                price: stone.price || 0,

                status: "ACTIVE",
                createdBy: userId || null,
                updatedBy: userId || null,
            });
        }
    }

    return stoneDocs;
}

async function applyChunk({ ProductMaster, ProductStone, productChunk, userId, session }) {
    const sessionOpt = session ? { session } : {};

    const itemCodes = productChunk.map((p) => p.itemCode);

    const productOps = productChunk.map((product) => {
        const productData = cleanProductForDb(product, userId);
        return {
            updateOne: {
                filter: { itemCode: product.itemCode },
                update: {
                    $set: productData,
                    $setOnInsert: {
                        createdBy: userId || null,
                        isDeleted: 0,
                    },
                },
                upsert: true,
            },
        };
    });

    const productResult = await ProductMaster.bulkWrite(productOps, {
        ordered: false,
        ...sessionOpt,
    });

    const savedProducts = await ProductMaster.find(
        { itemCode: { $in: itemCodes } },
        { _id: 1, itemCode: 1 },
        sessionOpt
    ).lean();

    const productIdMap = new Map(savedProducts.map((p) => [p.itemCode, p._id]));
    const productIds = savedProducts.map((p) => p._id);

    await ProductStone.deleteMany(
        { productId: { $in: productIds } },
        sessionOpt
    );

    const stoneDocs = buildStoneDocs({ productChunk, productIdMap, userId });
    const stoneChunks = chunkArray(stoneDocs, STONE_INSERT_CHUNK_SIZE);

    let stonesInserted = 0;
    for (const stoneChunk of stoneChunks) {
        await ProductStone.insertMany(stoneChunk, {
            ordered: false,
            ...sessionOpt,
        });
        stonesInserted += stoneChunk.length;
    }

    return {
        inserted: productResult.upsertedCount || 0,
        updated: productResult.modifiedCount || 0,
        matched: productResult.matchedCount || 0,
        stonesInserted,
    };
}

export async function applyProductImportToLive({
    mongoose,
    ProductMaster,
    ProductStone,
    validProducts,
    userId,
}) {
    const chunks = chunkArray(validProducts, PRODUCT_CHUNK_SIZE);

    const transactional = await supportsTransactions(mongoose);

    const summary = {
        inserted: 0,
        updated: 0,
        matched: 0,
        stonesInserted: 0,
        chunks: chunks.length,
        transactional,
    };

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const productChunk = chunks[chunkIndex];

        try {
            if (transactional) {
                const session = await mongoose.startSession();
                try {
                    let chunkResult;
                    await session.withTransaction(async () => {
                        chunkResult = await applyChunk({
                            ProductMaster,
                            ProductStone,
                            productChunk,
                            userId,
                            session,
                        });
                    });
                    summary.inserted += chunkResult.inserted;
                    summary.updated += chunkResult.updated;
                    summary.matched += chunkResult.matched;
                    summary.stonesInserted += chunkResult.stonesInserted;
                } finally {
                    await session.endSession();
                }
            } else {
                const chunkResult = await applyChunk({
                    ProductMaster,
                    ProductStone,
                    productChunk,
                    userId,
                    session: null,
                });
                summary.inserted += chunkResult.inserted;
                summary.updated += chunkResult.updated;
                summary.matched += chunkResult.matched;
                summary.stonesInserted += chunkResult.stonesInserted;
            }
        } catch (error) {
            throw new Error(`Import failed at chunk ${chunkIndex + 1}: ${error.message}`);
        }
    }

    return summary;
}
