import mongoose from "mongoose";
import StoneGroup from "../models/stoneGroup.model.js";
import Constant from "../constants/user.constant.js";
import Parameter from "../models/parameter.model.js";

// Helpers let DB errors propagate so callers can surface them — the
// earlier `console.log` + implicit `undefined` returned a "success-looking"
// shape from the service while the underlying write actually failed.

// The search term is interpolated into a RegExp. Unescaped, a term like "a("
// throws and "(a+)+$" is a ReDoS against the admin panel.
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Admin stone-group list.
 *
 * @param {object} filters - stoneType, type, shape (ObjectId), color, clarity,
 *                           status, caratMin, caratMax.
 *
 * Note on carat: StoneGroup.carat is a STRING bucket copied verbatim from the
 * import sheet ("0.0050"), so a numeric range needs an explicit conversion.
 * $convert with onError/onNull: null makes non-numeric buckets sort out of the
 * range instead of blowing up the whole query.
 */
function makeParameterLookup(field) {
    return [
        {
            $lookup: {
                from: "parameters",
                localField: field,
                foreignField: "_id",
                as: field
            }
        },
        { $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: true } }
    ];
}

export const get_stone_group_list_db = async function (page, limit, search, filters = {}) {
    const { stoneType, type, shape, color, clarity, status, caratMin, caratMax } = filters;

    const match = {};

    if (stoneType) match.stoneType = stoneType;
    if (type) match.type = type;
    if (status) match.status = status;
    if (shape && mongoose.Types.ObjectId.isValid(shape)) {
        match.shape = new mongoose.Types.ObjectId(shape);
    }
    if (color && mongoose.Types.ObjectId.isValid(color)) match.color = new mongoose.Types.ObjectId(color);
    if (clarity && mongoose.Types.ObjectId.isValid(clarity)) match.clarity = new mongoose.Types.ObjectId(clarity);

    if (search) {
        const safe = escapeRegex(search);
        const searchRegex = new RegExp(safe, "i");

        // Shape lives on Parameter, so resolve matching shapes to ids first.
        const matchedParams = await Parameter.find({
            $or: [{ name: searchRegex }, { code: searchRegex }],
            status: "ACTIVE",
            isDeleted: 0
        }).select("_id");
        const paramIds = matchedParams.map(p => p._id);

        match.$or = [
            { shape: { $in: paramIds } },
            { color: { $in: paramIds } },
            { clarity: { $in: paramIds } },
            { stoneType: searchRegex },
            { type: searchRegex },
            { carat: searchRegex }
        ];
    }

    const hasCaratRange =
        (caratMin !== undefined && caratMin !== null && caratMin !== "") ||
        (caratMax !== undefined && caratMax !== null && caratMax !== "");

    const pipeline = [{ $match: match }];

    if (hasCaratRange) {
        // `carat` is a BUCKET, stored as a string: "0.16-0.17", "1.00-1.49", or
        // occasionally a bare "0.35" or a millimetre label ("4.40 x 2.70 MM").
        // Converting it straight to a double yields null for every range, which
        // is why the filter used to return nothing at all. Split on "-" instead
        // and treat the row as the interval [caratLow, caratHigh]; a bare number
        // collapses to a zero-width interval. Non-numeric labels stay null and
        // fall out of the filter rather than breaking the query.
        pipeline.push({
            $addFields: {
                caratLow: {
                    $convert: {
                        input: { $trim: { input: { $arrayElemAt: [{ $split: ["$carat", "-"] }, 0] } } },
                        to: "double", onError: null, onNull: null
                    }
                },
                caratHigh: {
                    $convert: {
                        input: { $trim: { input: { $arrayElemAt: [{ $split: ["$carat", "-"] }, -1] } } },
                        to: "double", onError: null, onNull: null
                    }
                }
            }
        });

        // Keep a bucket when it OVERLAPS the requested window, so asking for
        // 0.5-0.6 still surfaces the "0.50-0.69" bucket that a 0.55 ct stone
        // would actually price against.
        const conditions = [{ caratLow: { $ne: null } }, { caratHigh: { $ne: null } }];
        if (caratMin !== undefined && caratMin !== null && caratMin !== "") {
            conditions.push({ caratHigh: { $gte: Number(caratMin) } });
        }
        if (caratMax !== undefined && caratMax !== null && caratMax !== "") {
            conditions.push({ caratLow: { $lte: Number(caratMax) } });
        }
        pipeline.push({ $match: { $and: conditions } });
    }

    // Count total matched records
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await StoneGroup.aggregate(countPipeline);
    const total = countResult?.[0]?.total || 0;

    // Fetch only the requested page slice, then perform parameter lookups
    const dataPipeline = [
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        ...makeParameterLookup("shape"),
        ...makeParameterLookup("color"),
        ...makeParameterLookup("clarity"),
        ...makeParameterLookup("cut"),
        ...makeParameterLookup("polish"),
        ...makeParameterLookup("fluorescence"),
        ...makeParameterLookup("symmetry"),
        ...makeParameterLookup("lab"),
        { $project: { caratLow: 0, caratHigh: 0 } }
    ];

    const data = await StoneGroup.aggregate(dataPipeline);

    return {
        data,
        total
    };
};

/**
 * A stone group's identity is stoneType + type + shape + colour + clarity + carat.
 * Two rows sharing it would make pricing ambiguous — resolveStoneGroup refuses to
 * guess between them — so both create and update must guard against it.
 *
 * `excludeId` lets an update ignore the row being edited.
 */
export const find_duplicate_stone_group_db = async function (data, excludeId = null) {
    const query = {
        stoneType: data.stoneType,
        shape: data.shape,
        carat: data.carat,
        color: data.color,
    };

    if (data.stoneType === Constant.DIAMOND_TYPES.DIAMOND) {
        query.clarity = data.clarity;
    } else {
        query.type = data.type;
    }

    if (excludeId) query._id = { $ne: excludeId };

    return await StoneGroup.findOne(query).lean();
};

export const create_stone_group_db = async function (data) {
    return await StoneGroup.create(data);
};

export const get_stone_group_by_id_db = async function (id) {
    return await StoneGroup.findById(id).lean();
};

export const update_stone_group_db = async function (id, data) {
    const updateData = {};

    // if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.lgd_price !== undefined) updateData.lgd_price = data.lgd_price;
    if (data.natural_price !== undefined) updateData.natural_price = data.natural_price;
    if (data.status !== undefined) updateData.status = data.status;

    // Identity fields. Editing these repoints which stones price off this row, so
    // the controller re-checks for duplicates before calling us.
    if (data.stoneType !== undefined) updateData.stoneType = data.stoneType;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.shape !== undefined) updateData.shape = data.shape;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.clarity !== undefined) updateData.clarity = data.clarity;
    if (data.carat !== undefined) updateData.carat = data.carat;

    updateData.updatedBy = data.updatedBy;

    return await StoneGroup.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
    );
};

export const insert_update_stone_group_db = async function (data) {
    return await StoneGroup.bulkWrite(
        data.map((value) => ({
            updateOne: {
                filter: {
                    stoneType: value.stoneType,
                    type: value.type,
                    shape: value.shape,
                    color: value.color,
                    carat: value.carat,
                    ...(value.stoneType === Constant.DIAMOND_TYPES.DIAMOND && {
                        clarity: value.clarity
                    })
                },
                update: {
                    $set: value
                },
                upsert: true
            }
        }))
    );
};
