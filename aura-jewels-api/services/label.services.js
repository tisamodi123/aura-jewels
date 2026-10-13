import Label from "../models/label.model.js";

const escapeRegex = (value) => String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A rule is identified by stoneType + colour + clarity. Colour and clarity are
 * free text now, so compare them case-insensitively — otherwise "gh"/"vvs" and
 * "GH"/"VVS" could both exist and buildLabelMap would silently keep only one.
 */
export const check_unique_label_db = async function (query) {
    const { color, clarity, ...rest } = query;
    const q = { ...rest, isDeleted: 0 };
    if (color !== undefined) q.color = new RegExp(`^${escapeRegex(color)}$`, "i");
    if (clarity !== undefined) q.clarity = new RegExp(`^${escapeRegex(clarity)}$`, "i");
    return await Label.findOne(q);
};

export const create_label_db = async function (req) {
    return await Label.create({
        stoneType: req.body.stoneType,
        color: req.body.color,
        clarity: req.body.clarity,
        labelName: req.body.labelName,
        createdBy: req.user.userId
    });
};

export const update_label_db = async function (req) {
    return await Label.findOneAndUpdate(
        { _id: req.params.id, isDeleted: 0 },
        {
            $set: {
                stoneType: req.body.stoneType,
                color: req.body.color,
                clarity: req.body.clarity,
                labelName: req.body.labelName,
                updatedBy: req.user.userId
            }
        },
        { new: true }
    );
};

export const delete_label_db = async function (id) {
    return await Label.findOneAndUpdate(
        { _id: id },
        { $set: { isDeleted: 1 } },
        { new: true }
    );
};

export const get_label_list_db = async function (filter, skip, limit) {
    // colour/clarity are plain strings now — nothing to populate.
    const data = await Label.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Label.countDocuments(filter);

    return { data, total };
};

export const find_label_using_id_db = async function (id) {
    return await Label.findOne({ _id: id, isDeleted: 0 });
};

export const update_label_status_db = async function (id, status) {
    return await Label.findOneAndUpdate(
        { _id: id, isDeleted: 0 },
        { $set: { status } },
        { new: true }
    );
};
