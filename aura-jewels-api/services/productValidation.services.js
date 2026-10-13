import mongoose from "mongoose";
import Category from "../models/category.model.js";
import CollectionModel from "../models/collection.model.js";
import Tag from "../models/tag.model.js";
import Metal from "../models/metal.model.js";
import chargesModel from "../models/charges.model.js";
import StoneGroup from "../models/stoneGroup.model.js";
import StoneGroupDefault from "../models/stoneGroupDefault.model.js";
import Parameter from "../models/parameter.model.js";
import Constant from "../constants/user.constant.js";

export function safeString(v) {
    return (v ?? "").toString().trim();
}

export function normalize(v) {
    return safeString(v)
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "")
        .trim();
}

export function normalizeColor(v) {
    const x = safeString(v).toUpperCase().replace(/\s+/g, "");
    if (["EF", "E-F", "E/F"].includes(x)) return "EF";
    if (["GH", "G-H", "G/H"].includes(x)) return "GH";
    if (["IJ", "I-J", "I/J"].includes(x)) return "IJ";
    return x;
}

export function normalizeClarity(v) {
    const x = safeString(v).toUpperCase().replace(/\s+/g, "");
    if (["VVS", "VVS1VVS2", "VVS1-VVS2", "VVS1/VVS2"].includes(x)) return "VVS";
    if (["VS", "VS1VS2", "VS1-VS2", "VS1/VS2"].includes(x)) return "VS";
    if (["SI", "SI1SI2", "SI1-SI2", "SI1/SI2"].includes(x)) return "SI";
    return x;
}

export function toNumber(v, def = 0) {
    if (v === null || v === undefined || v === "") return def;
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : def;
}

export function extractCarat(size, weight, pieces) {
    if (size !== null && size !== undefined && size !== "") {
        const match = String(size).match(/[\d.]+/);
        if (match) {
            const n = Number(match[0]);
            if (Number.isFinite(n) && n > 0) return n;
        }
    }
    const w = toNumber(weight, null);
    const p = toNumber(pieces, null);
    if (w !== null && w > 0 && p !== null && p > 0) {
        return w / p;
    }
    return null;
}

export const parseObjectIdList = (raw) => {
    if (!raw) return [];
    const toObjectId = (id) => (id && mongoose.Types.ObjectId.isValid(id)) ? new mongoose.Types.ObjectId(id) : null;
    if (Array.isArray(raw)) return raw.map(toObjectId).filter(Boolean);
    return String(raw)
        .split(",")
        .map((x) => toObjectId(x.trim()))
        .filter(Boolean);
};

export async function loadValidationMasters() {
    const [
        categories,
        collections,
        tagsMaster,
        allMetals,
        allCharges,
        stoneGroups,
        parameters,
    ] = await Promise.all([
        Category.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        CollectionModel.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        Tag.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        Metal.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        chargesModel.find({ status: "ACTIVE", isDeleted: false }).lean(),
        StoneGroup.find({ status: "ACTIVE", isDeleted: { $ne: 1 } })
            .populate("shape")
            .lean(),
        Parameter.find({ status: "ACTIVE", isDeleted: 0 }).lean(),
    ]);

    // MAPS
    const categoryMap = new Map();
    for (const c of categories) {
        categoryMap.set(c._id.toString(), c);
        categoryMap.set(normalize(c.categoryName), c);
    }

    const metalMap = new Map();
    for (const m of allMetals) {
        metalMap.set(m._id.toString(), m);
        metalMap.set(normalize(`${m.type || ""} ${m.stamp || ""}`), m);
        metalMap.set(normalize(`${m.name || ""} ${m.stamp || ""}`), m);
        metalMap.set(normalize(m.name), m);
        metalMap.set(normalize(m.type), m);
    }

    const chargesMap = new Map();
    for (const c of allCharges) {
        chargesMap.set(c._id.toString(), c);
        chargesMap.set(normalize(c.code), c);
        chargesMap.set(normalize(c.name), c);
    }

    const collectionMap = new Map();
    for (const col of collections) {
        collectionMap.set(col._id.toString(), col);
        collectionMap.set(normalize(col.collectionName), col);
    }

    const tagMap = new Map();
    for (const t of tagsMaster) {
        tagMap.set(t._id.toString(), t);
        tagMap.set(normalize(t.name), t);
    }

    // PARAMETER MAPS
    const parameterResolver = {
        shape: new Map(),
        color: new Map(),
        clarity: new Map(),
    };

    for (const p of parameters) {
        if (!parameterResolver[p.type]) continue;
        parameterResolver[p.type].set(p._id.toString(), p);

        const keys = [
            p._id.toString(),
            p.code,
            p.name,
            ...(Array.isArray(p.synonyms) ? p.synonyms : []),
        ];

        for (const key of keys) {
            if (p.type === "color") {
                const k = normalizeColor(key);
                if (k) parameterResolver.color.set(k, p);
            } else if (p.type === "clarity") {
                const k = normalizeClarity(key);
                if (k) parameterResolver.clarity.set(k, p);
            } else {
                const k = normalize(key);
                if (k) parameterResolver.shape.set(k, p);
            }
        }
    }

    /* ORIGINAL stoneGroupMap construction:
    const stoneGroupMap = new Map();
    for (const sg of stoneGroups) {
        const key = [
            normalize(sg.stoneType || ""),
            sg.shape?._id?.toString() || sg.shape?.toString(),
            normalizeColor(sg.color),
            normalizeClarity(sg.clarity),
        ].join("|");

        if (!stoneGroupMap.has(key)) {
            stoneGroupMap.set(key, []);
        }
        stoneGroupMap.get(key).push(sg);
    }
    */

    function resolveParam(type, value) {
        if (!value) return null;
        if (type === "color") {
            return parameterResolver.color.get(normalizeColor(value)) || null;
        }
        if (type === "clarity") {
            return parameterResolver.clarity.get(normalizeClarity(value)) || null;
        }
        return parameterResolver.shape.get(normalize(value)) || null;
    }

    const resolveColorCode = (val) => {
        if (!val) return "";
        if (typeof val === "object" && val !== null && (val.code || val.name)) {
            return val.code || val.name;
        }
        const doc = resolveParam("color", val);
        if (doc && typeof doc === "object") {
            return doc.code || doc.name || val;
        }
        return String(val);
    };

    const resolveClarityCode = (val) => {
        if (!val) return "";
        if (typeof val === "object" && val !== null && (val.code || val.name)) {
            return val.code || val.name;
        }
        const doc = resolveParam("clarity", val);
        if (doc && typeof doc === "object") {
            return doc.code || doc.name || val;
        }
        return String(val);
    };

    const resolveShapeId = (val) => {
        if (!val) return "";
        if (typeof val === "object" && val !== null && val._id) {
            return val._id.toString();
        }
        const doc = resolveParam("shape", val);
        if (doc && typeof doc === "object" && doc._id) {
            return doc._id.toString();
        }
        return String(val);
    };

    const stoneGroupMap = new Map();
    for (const sg of stoneGroups) {
        let key = null;
        const normalizedType = normalizeStoneType(sg.stoneType);
        const shapeId = resolveShapeId(sg.shape);
        const colorCode = resolveColorCode(sg.color);
        const clarityCode = resolveClarityCode(sg.clarity);

        if (normalizedType === "colorstone") {
            key = [
                normalizedType,
                normalize(sg.type),
                shapeId,
                normalizeColor(colorCode),
                normalizeClarity(clarityCode)
            ].join("|");
        } else {
            key = [
                normalizedType,
                shapeId,
                normalizeColor(colorCode),
                normalizeClarity(clarityCode),
            ].join("|");
        }

        if (!stoneGroupMap.has(key)) {
            stoneGroupMap.set(key, []);
        }
        stoneGroupMap.get(key).push(sg);
    }

    return {
        categories,
        collections,
        tagsMaster,
        allMetals,
        allCharges,
        stoneGroups,
        parameters,
        categoryMap,
        metalMap,
        chargesMap,
        collectionMap,
        tagMap,
        parameterResolver,
        stoneGroupMap,
    };
}

export async function loadStonesValidationMasters() {
    const [stoneGroups, parameters, diamondDefaults] = await Promise.all([
        StoneGroup.find({ status: "ACTIVE", isDeleted: { $ne: 1 } })
            .populate("shape")
            .lean(),
        Parameter.find({ status: "ACTIVE", isDeleted: 0 }).lean(),
        StoneGroupDefault.find({ stoneType: "diamond", status: "ACTIVE", isDeleted: { $ne: true } })
            .sort({ isDefault: -1, sort: 1 })
            .lean(),
    ]);

    // Pick the default diamond quality (isDefault=true first, then first available)
    const defaultDiamond = diamondDefaults.find(d => d.isDefault) || diamondDefaults[0] || null;

    // PARAMETER MAPS
    const parameterResolver = {
        shape: new Map(),
        color: new Map(),
        clarity: new Map(),
    };

    for (const p of parameters) {
        if (!parameterResolver[p.type]) continue;
        parameterResolver[p.type].set(p._id.toString(), p);

        const keys = [
            p.code,
            p.name,
            ...(Array.isArray(p.synonyms) ? p.synonyms : []),
        ];

        for (const key of keys) {
            if (p.type === "color") {
                const k = normalizeColor(key);
                if (k) parameterResolver.color.set(k, p);
            } else if (p.type === "clarity") {
                const k = normalizeClarity(key);
                if (k) parameterResolver.clarity.set(k, p);
            } else {
                const k = normalize(key);
                if (k) parameterResolver.shape.set(k, p);
            }
        }
    }

    /* ORIGINAL stoneGroupMap construction:
    const stoneGroupMap = new Map();
    for (const sg of stoneGroups) {
        const key = [
            normalize(sg.stoneType || ""),
            sg.shape?._id?.toString() || sg.shape?.toString(),
            normalizeColor(sg.color),
            normalizeClarity(sg.clarity),
        ].join("|");

        if (!stoneGroupMap.has(key)) {
            stoneGroupMap.set(key, []);
        }
        stoneGroupMap.get(key).push(sg);
    }
    */

    const stoneGroupMap = new Map();
    for (const sg of stoneGroups) {
        let key = null;
        const normalizedType = normalizeStoneType(sg.stoneType);
        if (normalizedType === "colorstone") {
            key = [
                normalizedType,
                normalize(sg.type),
                sg.shape?._id?.toString() || sg.shape?.toString(),
                normalizeColor(sg.color),
                normalizeClarity(sg.clarity),
            ].join("|");
        } else {
            key = [
                normalizedType,
                sg.shape?._id?.toString() || sg.shape?.toString(),
                normalizeColor(sg.color),
                normalizeClarity(sg.clarity),
            ].join("|");
        }

        if (!stoneGroupMap.has(key)) {
            stoneGroupMap.set(key, []);
        }
        stoneGroupMap.get(key).push(sg);
    }

    return {
        parameterResolver,
        stoneGroupMap,
        defaultDiamond,
    };
}

const NORM_COLOR_STONE = "colorstone";
const NORM_DIAMOND = "diamond";

export function normalizeStoneType(value) {
    const v = normalize(value);

    if (
        v === "gemstone" ||
        v === "colorstone" ||
        v === "color stone" ||
        v === NORM_COLOR_STONE ||
        Constant.GEM_TYPES.ALL_TYPES.includes(v)
    ) {
        return NORM_COLOR_STONE;
    }

    return NORM_DIAMOND;
}

export function matchStoneGroupSize(groupSize, importSize) {
    const sg = safeString(groupSize).toUpperCase();
    const size = safeString(importSize).toUpperCase();

    if (sg.includes("MM")) {
        return sg.replace(/\s+/g, "") === size.replace(/\s+/g, "");
    }

    const match = sg.match(/([\d.]+)\s*-\s*([\d.]+)/);

    if (match) {
        const min = Number(match[1]);
        const max = Number(match[2]);
        const value = Number(size);

        return value >= min && value <= max;
    }

    const sgNum = Number(sg);
    const sizeNum = Number(size);
    if (Number.isFinite(sgNum) && Number.isFinite(sizeNum) && sgNum > 0) {
        return sgNum === sizeNum;
    }

    return false;
}

// export function findBestStoneGroupMatch(candidates, size) {
//     const matching = candidates.filter((g) => matchStoneGroupSize(g.carat, size));
//     if (!matching.length) return null;

//     let best = null;
//     let minWidth = Infinity;

//     for (const g of matching) {
//         const caratStr = String(g.carat || "").toUpperCase();
//         const match = caratStr.match(/([\d.]+)\s*(?:-|TO)\s*([\d.]+)/);
//         const width = match ? (Number(match[2]) - Number(match[1])) : 0;

//         if (width < minWidth) {
//             minWidth = width;
//             best = g;
//             if (width === 0) break;
//         }
//     }

//     return best || matching[0];
// }

export function validateProduct(context, body) {
    const {
        categories,
        categoryMap,
        metalMap,
        chargesMap,
        collectionMap,
        tagMap,
    } = context;

    // Validate Category
    const categoryIdStr = body.categoryId ? body.categoryId.toString() : "";
    const category = categoryMap.get(categoryIdStr);
    if (!category) {
        return { isValid: false, error: "Invalid category" };
    }

    // Validate Metal
    const metalIdStr = body.metalId ? body.metalId.toString() : "";
    const metal = metalMap.get(metalIdStr);
    if (!metal) {
        return { isValid: false, error: "Invalid metal type/stamp" };
    }

    // Validate Labour Charge
    const labourCodeStr = body.labourCode ? body.labourCode.toString() : "";
    const labourObj = chargesMap.get(labourCodeStr);
    if (!labourObj) {
        return { isValid: false, error: "Invalid labour charge" };
    }

    // Validate Other Charge
    const otherChargeCodeStr = body.otherChargeCode ? body.otherChargeCode.toString() : "";
    let otherObj = null;
    if (otherChargeCodeStr) {
        otherObj = chargesMap.get(otherChargeCodeStr);
        if (!otherObj) {
            return { isValid: false, error: "Invalid other charge" };
        }
    }

    const subCategoryId = parseObjectIdList(body.subCategoryId);
    const collectionId = parseObjectIdList(body.collectionId);
    const tags = parseObjectIdList(body.tags);

    // Validate Subcategories
    const subCategoryIds = [];
    for (const subId of subCategoryId) {
        const found = categories.find(
            (c) =>
                c._id.toString() === subId.toString() &&
                c.parentCategoryId &&
                c.parentCategoryId.toString() === category._id.toString()
        );
        if (found) {
            subCategoryIds.push(found._id);
        } else {
            return { isValid: false, error: `Invalid subcategory: ${subId}` };
        }
    }

    // Validate Collections
    const collectionIds = [];
    for (const colId of collectionId) {
        const doc = collectionMap.get(colId.toString());
        if (doc) {
            collectionIds.push(doc._id);
        } else {
            return { isValid: false, error: `Invalid collection: ${colId}` };
        }
    }

    // Validate Tags
    const tagIds = [];
    for (const tagId of tags) {
        const doc = tagMap.get(tagId.toString());
        if (doc) {
            tagIds.push(doc._id);
        } else {
            return { isValid: false, error: `Invalid tag: ${tagId}` };
        }
    }

    // Validate Chain Metal
    let cMetal = null;
    if (body.haveChain === "Yes") {
        const cMetalIdStr = body.cMetalId ? body.cMetalId.toString() : "";
        cMetal = metalMap.get(cMetalIdStr);
        if (!cMetal) {
            return { isValid: false, error: "Invalid chain metal type/stamp" };
        }
    }

    return {
        isValid: true,
        validatedData: {
            category,
            metal,
            labourObj,
            otherObj,
            subCategoryIds,
            collectionIds,
            tagIds,
            cMetal,
        },
    };
}

/* ORIGINAL validateStones:
export function validateStones(context, stones, userId = null) {
    const { parameterResolver, stoneGroupMap } = context;

    function resolveParam(type, value) {
        if (!value) return null;
        const strVal = value.toString().trim();
        if (parameterResolver[type].has(strVal)) {
            return parameterResolver[type].get(strVal);
        }
        if (type === "color") {
            return parameterResolver.color.get(normalizeColor(value)) || null;
        }
        if (type === "clarity") {
            return parameterResolver.clarity.get(normalizeClarity(value)) || null;
        }
        return parameterResolver.shape.get(normalize(value)) || null;
    }

    function findStoneGroup({
        stoneType,
        shapeDoc,
        colorDoc,
        clarityDoc,
        carat,
    }) {
        if (!shapeDoc || !colorDoc || !clarityDoc || carat === null) {
            return null;
        }

        const key = [
            normalize(stoneType || ""),
            shapeDoc._id.toString(),
            normalizeColor(colorDoc.code || colorDoc),
            normalizeClarity(clarityDoc.code || clarityDoc),
        ].join("|");

        const groups = stoneGroupMap.get(key) || [];

        return (
            groups.find(
                (sg) =>
                    Number(carat) >= Number(sg.minCarat) &&
                    Number(carat) <= Number(sg.maxCarat)
            ) || null
        );
    }

    const formattedStones = [];
    let calculatedStonePrice = 0;

    for (let idx = 0; idx < stones.length; idx++) {
        const stone = stones[idx];
        const allowedTypes = ["CENTER", "SIDE"];
        const type = stone.type?.toUpperCase();

        if (!allowedTypes.includes(type)) {
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Invalid stone type: ${stone.type}`,
            };
        }

        const shapeDoc = resolveParam("shape", stone.shape);
        const colorDoc = resolveParam("color", stone.color) || stone.color;
        const clarityDoc = resolveParam("clarity", stone.clarity) || stone.clarity;

        if (!shapeDoc) {
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Invalid or missing shape: ${stone.shape}`,
            };
        }

        if (!colorDoc) {
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Invalid or missing color: ${stone.color}`,
            };
        }

        if (stone.stoneType === "diamond" && !clarityDoc) {
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Invalid or missing clarity: ${stone.clarity}`,
            };
        }

        const pieces = toNumber(stone.pieces);
        const weightVal = toNumber(stone.weight || stone.wgt);
        const size = safeString(stone.size);
        const carat = extractCarat(size, weightVal, pieces);

        const sg = findStoneGroup({
            stoneType: stone.stoneType || "diamond",
            shapeDoc,
            colorDoc,
            clarityDoc,
            carat,
        });

        if (!sg) {
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Stone group not found for shape=${stone.shape}, color=${stone.color}, clarity=${stone.clarity}, size=${stone.size}`,
            };
        }

        const preferred = Constant.DEFAULT_PRICE_SOURCE;
        const rate = sg[preferred] > 0 ? sg[preferred] :
            (preferred === Constant.STONE_PRICE_SOURCE.NATURAL ? sg.lgd_price : sg.natural_price) || 0;
        const calculatedPrice = rate * weightVal;
        calculatedStonePrice += calculatedPrice;

        formattedStones.push({
            type,
            stoneGroup: sg._id,
            pieces,
            weight: weightVal,
            totalCarat: carat,
            shape: shapeDoc._id,

            color: colorDoc?.code || colorDoc || null,
            clarity: clarityDoc?.code || clarityDoc || null,
            size,
            price: calculatedPrice,
            lgdPrice: (sg.lgd_price || 0) * weightVal,
            naturalPrice: (sg.natural_price || 0) * weightVal,
            status: "ACTIVE",
            createdBy: userId
        });
    }

    return {
        isValid: true,
        formattedStones,
        calculatedStonePrice,
    };
}
*/

export function validateStones(context, stones, userId = null) {
    const { parameterResolver, stoneGroupMap, defaultDiamond } = context;

    function extractRaw(val) {
        if (!val) return "";
        if (typeof val === "string") return val.trim();
        if (typeof val === "object") {
            return (val.code || val.name || (val._id ? val._id.toString() : "")).trim();
        }
        return String(val).trim();
    }

    function resolveParam(type, value) {
        if (!value) return null;
        let strVal = value;
        if (typeof value === "object" && value !== null) {
            strVal = value._id || value.code || value.name || value;
        }
        strVal = strVal.toString().trim();

        if (parameterResolver[type].has(strVal)) {
            return parameterResolver[type].get(strVal);
        }
        if (type === "color") {
            return parameterResolver.color.get(normalizeColor(strVal)) || null;
        }
        if (type === "clarity") {
            return parameterResolver.clarity.get(normalizeClarity(strVal)) || null;
        }
        return parameterResolver.shape.get(normalize(strVal)) || null;
    }

    function findStoneGroup({
        stoneType,
        gemType,
        shapeDoc,
        colorDoc,
        clarityDoc,
        carat,
        size,
        gemColor,
        gemClarity,
    }) {
        const normalizedType = normalizeStoneType(stoneType);
        if (normalizedType === "colorstone") {
            if (!shapeDoc || !gemType) {
                return null;
            }
        } else {
            if (!shapeDoc || !colorDoc || !clarityDoc) {
                return null;
            }
        }
        let key;

        if (normalizedType === "colorstone") {
            const finalColor = colorDoc ? (colorDoc.code || colorDoc.name || colorDoc) : gemColor;
            const finalClarity = clarityDoc ? (clarityDoc.code || clarityDoc.name || clarityDoc) : (gemClarity || "");
            key = [
                normalizedType,
                normalize(gemType),
                shapeDoc._id.toString(),
                normalizeColor(finalColor),
                normalizeClarity(finalClarity)
            ].join("|");
        } else {
            key = [
                normalizedType,
                shapeDoc._id.toString(),
                normalizeColor(colorDoc?.code || colorDoc?.name || colorDoc),
                normalizeClarity(clarityDoc?.code || clarityDoc?.name || clarityDoc),
            ].join("|");
        }

        console.log("[validateStones] stoneGroup lookup key:", key);
        console.log("[validateStones] available keys in stoneGroupMap:", [...stoneGroupMap.keys()].filter(k => k.startsWith(normalizedType)).join(" | ") || "(none)");

        const groups = stoneGroupMap.get(key) || [];

        if (carat !== null) {
            const found = groups.find(
                (sg) =>
                    Number(carat) >= Number(sg.minCarat) &&
                    Number(carat) <= Number(sg.maxCarat)
            );
            if (found) return found;
        }

        if (size) {
            const found = groups.find(sg => matchStoneGroupSize(sg.carat, size));
             // const found = findBestStoneGroupMatch(groups, size);
            if (found) return found;
        }

        return groups.find(sg => !sg.carat || sg.carat.toString().trim() === "") || null;
    }

    const formattedStones = [];
    let calculatedStonePrice = 0;

    for (let idx = 0; idx < stones.length; idx++) {
        const stone = stones[idx];
        const allowedTypes = ["CENTER", "SIDE"];
        const type = stone.type?.toUpperCase();

        if (!allowedTypes.includes(type)) {
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Invalid stone type: ${stone.type}`,
            };
        }

        const stoneType = normalizeStoneType(stone.stoneType);

        const shapeDoc = resolveParam("shape", stone.shape);
        if (!shapeDoc) {
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Invalid or missing shape: ${stone.shape?.name || stone.shape}`,
            };
        }

        let colorDoc = null;
        let clarityDoc = null;
        let gemType = stone.gemType || null;
        let gemColor = "";
        let gemClarity = "";

        if (stoneType === "colorstone") {
            // Color stones require gemType, color, and clarity
            gemType = stone.gemType || stone.stoneGroupDetails?.type || stone.stoneGroup?.type || null;
            if (!gemType && Constant.GEM_TYPES.ALL_TYPES.includes(normalize(stone.stoneType))) {
                gemType = normalize(stone.stoneType);
            }
            if (!gemType) {
                return {
                    isValid: false,
                    error: `Stone ${idx + 1}: Gemstone type (gemType) is required for color stone`,
                };
            }

            gemColor = extractRaw(stone.gemColor || stone.color);
            gemClarity = extractRaw(stone.gemClarity || stone.clarity);

            if (!gemColor) {
                return {
                    isValid: false,
                    error: `Stone ${idx + 1}: Color is required for color stone`,
                };
            }

            colorDoc = resolveParam("color", gemColor) || gemColor;
            if (gemClarity) {
                clarityDoc = resolveParam("clarity", gemClarity) || gemClarity;
            }
        } else {
            // Diamonds: ALWAYS use the default diamond quality from Settings & Qualities.
            // Whatever color/clarity the frontend sends is ignored entirely.
            if (!defaultDiamond) {
                return {
                    isValid: false,
                    error: `Stone ${idx + 1}: No default diamond quality is configured in Settings & Qualities`,
                };
            }

            colorDoc = defaultDiamond.color
                ? (resolveParam("color", defaultDiamond.color) || defaultDiamond.color)
                : null;

            clarityDoc = defaultDiamond.clarity
                ? (resolveParam("clarity", defaultDiamond.clarity) || defaultDiamond.clarity)
                : null;

            if (!colorDoc) {
                return {
                    isValid: false,
                    error: `Stone ${idx + 1}: Default diamond quality has no Color set — please configure it in Settings & Qualities`,
                };
            }

            if (!clarityDoc) {
                return {
                    isValid: false,
                    error: `Stone ${idx + 1}: Default diamond quality has no Clarity set — please configure it in Settings & Qualities`,
                };
            }
        }

        const pieces = toNumber(stone.pieces);
        const weightVal = toNumber(stone.weight || stone.wgt);
        const size = safeString(stone.size);
        const carat = extractCarat(size, weightVal, pieces);

        const sg = findStoneGroup({
            stoneType,
            gemType,
            shapeDoc,
            colorDoc,
            clarityDoc,
            carat,
            size,
            gemColor,
            gemClarity,
        });

        if (!sg) {
            const resolvedColor = colorDoc?.code || colorDoc?.name || colorDoc || "(none)";
            const resolvedClarity = clarityDoc?.code || clarityDoc?.name || clarityDoc || "(none)";
            return {
                isValid: false,
                error: `Stone ${idx + 1}: Stone group not found for type=${stoneType}${gemType ? ` (${gemType})` : ""}, shape=${shapeDoc?.name || stone.shape?.name || stone.shape}, resolvedColor=${resolvedColor}, resolvedClarity=${resolvedClarity}, size=${size || stone.size}`,
            };
        }

        const preferred = Constant.DEFAULT_PRICE_SOURCE;
        const rate = sg[preferred] > 0 ? sg[preferred] :
            (preferred === Constant.STONE_PRICE_SOURCE.NATURAL ? sg.lgd_price : sg.natural_price) || 0;
        const calculatedPrice = rate * weightVal;
        calculatedStonePrice += calculatedPrice;

        formattedStones.push({
            type,
            stoneType: stoneType === "colorstone" ? "color stone" : "diamond",
            stoneGroup: sg._id,
            pieces,
            weight: weightVal,
            totalCarat: carat,
            shape: shapeDoc._id,
            color: colorDoc?.code || colorDoc || gemColor || null,
            clarity: clarityDoc?.code || clarityDoc || gemClarity || null,
            size,
            price: calculatedPrice,
            lgdPrice: (sg.lgd_price || 0) * weightVal,
            naturalPrice: (sg.natural_price || 0) * weightVal,
            status: "ACTIVE",
            createdBy: userId
        });
    }

    return {
        isValid: true,
        formattedStones,
        calculatedStonePrice,
    };
}

