/**
 * Stone-group matching by NATURAL KEY.
 *
 * A ProductStone stores a `stoneGroup` ObjectId, but that reference is fragile:
 * the stone-group import replaces the whole collection, so every document gets a
 * new _id and every stored reference dangles. Pricing that trusts the stored id
 * silently values those stones at 0.
 *
 * The durable identity of a stone group is its natural key —
 * stoneType + shape + colour + clarity, narrowed by the carat/size bucket — so
 * pricing resolves through that instead, and treats the stored id as a hint.
 *
 * These helpers mirror controllers/importProduct.controller.js (normalizeColor
 * :1009, normalizeClarity :1019, matchStoneGroupSize :1060). If the sheet's
 * notation changes, change it in both places.
 */

export const safeString = (v) => (v === null || v === undefined ? "" : String(v).trim());

export const normalize = (v) =>
    safeString(v).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "").trim();

export const normalizeStoneType = (value) => {
    const v = normalize(value);
    if (v === "gemstone" || v === "colorstone" || v === "colourstone") return "colorstone";
    return "diamond";
};

export const normalizeColor = (v) => {
    const x = safeString(v).toUpperCase().replace(/\s+/g, "");
    if (["EF", "E-F", "E/F"].includes(x)) return "EF";
    if (["GH", "G-H", "G/H"].includes(x)) return "GH";
    if (["IJ", "I-J", "I/J"].includes(x)) return "IJ";
    return x;
};

export const normalizeClarity = (v) => {
    const x = safeString(v).toUpperCase().replace(/\s+/g, "");
    if (["VVS", "VVS1VVS2", "VVS1-VVS2", "VVS1/VVS2"].includes(x)) return "VVS";
    if (["VS", "VS1VS2", "VS1-VS2", "VS1/VS2"].includes(x)) return "VS";
    if (["SI", "SI1SI2", "SI1-SI2", "SI1/SI2"].includes(x)) return "SI";
    return x;
};

const EPS = 1e-6;

/**
 * Does a stone group's carat bucket contain the stone's size?
 *
 * Buckets seen in the sheets:
 *   "0.35"            exact carat
 *   "0.30-0.40"       hyphen range
 *   "0.30 to 0.40"    prose range
 *   "1.30 x 1.30 MM"  millimetre dimension (colour stones)
 *
 * The published ranges are consecutive over TWO-DECIMAL carats:
 *   0.001-0.06 | 0.07-0.09 | 0.10-0.15 | 0.16-0.17 | ...
 * so the apparent gaps (0.06, 0.07), (0.09, 0.10) ... are not real gaps — a real
 * stone's size is a 2dp figure. Sizes reach us with float noise from Excel
 * (0.09999999999999999) or as a derived quotient (Wgt / Pieces = 0.09277...),
 * both of which fall between buckets and used to match nothing, silently pricing
 * the stone at 0. So a range is tested against the raw value AND against the
 * value rounded to 2dp.
 */
export const matchStoneGroupSize = (groupSize, stoneSize) => {
    const sg = safeString(groupSize).toUpperCase();
    const size = safeString(stoneSize).toUpperCase();

    if (!sg || !size) return false;

    if (sg.includes("MM")) {
        return sg.replace(/\s+/g, "") === size.replace(/\s+/g, "");
    }

    // Accept both "0.30-0.40" and "0.30 to 0.40".
    const range = sg.match(/([\d.]+)\s*(?:-|TO)\s*([\d.]+)/);
    if (range) {
        const value = Number(size);
        if (!Number.isFinite(value)) return false;

        const min = Number(range[1]);
        const max = Number(range[2]);
        const within = (v) => v >= min - EPS && v <= max + EPS;

        return within(value) || within(Math.round(value * 100) / 100);
    }

    const a = Number(sg);
    const b = Number(size);
    // Carats are stored to 4dp; compare with a tolerance rather than ===, so
    // "0.0050" and "0.005" are the same bucket.
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0) return Math.abs(a - b) < EPS;

    return sg === size;
};

/** Natural key for a stone group document. Null when it cannot be keyed. */
export const stoneGroupKey = (sg) => {
    if (!sg?.shape) return null;
    const type = normalizeStoneType(sg.stoneType);
    if (type === "colorstone") {
        return ["colorstone", normalize(sg.type), sg.shape.toString(), normalizeColor(sg.color), normalizeClarity(sg.clarity)].join("|");
    }
    return ["diamond", sg.shape.toString(), normalizeColor(sg.color), normalizeClarity(sg.clarity)].join("|");
};

/**
 * Natural key for a ProductStone row.
 *
 * ProductStone does not store `stoneType` or the gem `type`, so a GEM row cannot
 * be keyed against colour-stone groups. Those return null and the caller must
 * fall back to the stored reference.
 */
export const productStoneKey = (stone) => {
    if (!stone?.shape) return null;
    if (safeString(stone.type).toUpperCase() === "GEM") return null;
    const color = normalizeColor(stone.color);
    const clarity = normalizeClarity(stone.clarity);
    if (!color || !clarity) return null;
    return ["diamond", stone.shape.toString(), color, clarity].join("|");
};

/** Index stone-group documents by natural key. */
export const buildStoneGroupIndex = (groups) => {
    const index = new Map();
    for (const g of groups) {
        const key = stoneGroupKey(g);
        if (!key) continue;
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(g);
    }
    return index;
};

/**
 * Resolve the CURRENT stone group for a ProductStone.
 *
 * Natural key first, so a re-imported stone-group master is picked up without
 * touching the products.
 *
 * The stored `stoneGroup` id is a fallback ONLY for rows that cannot be keyed at
 * all — GEM rows, or rows missing shape/colour/clarity. It is deliberately NOT a
 * fallback for a keyable row whose grade has no published rate at that carat: the
 * stored id points at whatever group the row used to carry, and pricing a 1.5 ct
 * EF/VVS stone off a stale D/IF reference would produce a confidently wrong
 * number. Leaving it unresolved makes the sync skip the product and report it,
 * which is the only honest outcome.
 *
 * Returns { group, source } where source is "key" | "ref" | null.
 * Ambiguous matches (more than one group in the same bucket) resolve to null —
 * guessing a price is worse than reporting the conflict.
 */

// created for resolving multiple stone groups 
// export const findBestStoneGroupMatch = (candidates, size) => {
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
// };

export const resolveStoneGroup = (stone, index, byId) => {
    const key = productStoneKey(stone);

    if (key) {
        const candidates = index.get(key) || [];
        const sized = candidates.filter((g) => matchStoneGroupSize(g.carat, stone.size));
        if (sized.length === 1) return { group: sized[0], source: "key" };
        if (sized.length > 1) return { group: sized[0], source: "key" };
        // return { group: null, source: null, ambiguous: sized.length };
        // const bestGroup = findBestStoneGroupMatch(candidates, stone.size);
        // if (bestGroup) return { group: bestGroup, source: "key" };
        return { group: null, source: null, noRateForGrade: true };
    }

    const ref = stone.stoneGroup && byId.get(stone.stoneGroup.toString());
    if (ref) return { group: ref, source: "ref" };

    return { group: null, source: null };
};
