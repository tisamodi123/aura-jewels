// --------------------
// CHNAGES BY SMIT_K86
// --------------------

import Parameter from "../models/parameter.model.js";
import { createSlug } from "../utils/createSlug.js";

// All helpers below let DB errors propagate so the controller can surface
// them. The earlier `console.log` + implicit `undefined` masked failures
// as silent OK responses from the controller layer.

export const check_unique_parameter_db = async function (obj) {
    return await Parameter.findOne(obj);
};

// Admin form posts `synonyms` as a comma-separated string; server-side
// callers may pass a real array. Normalize to a trimmed array either way
// so the Mongoose `[String]` field always sees the right shape.
const parseSynonyms = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    return String(value)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
};

export const create_parameter_db = async function (req) {
    return await Parameter.create({
        type: req.body.type,
        diamondType: req.body.diamondType || null,
        name: req.body.name,
        slug: req.body.slug ? createSlug(req.body.slug) : createSlug(req.body.name),
        code: req.body.code,
        synonyms: parseSynonyms(req.body.synonyms),
        createdBy: req.user.userId,
        sort: req.body.sort,
        description: req.body.description,
        image: req.body.image || null
    });
};

export const update_parameter_db = async function (req) {
    const $set = {
        type: req.body.type,
        diamondType: req.body.diamondType,
        name: req.body.name,
        code: req.body.code,
        synonyms: parseSynonyms(req.body.synonyms),
        updatedBy: req.user.userId,
        sort: req.body.sort,
        description: req.body.description,
    };
    // Only overwrite the image when a new one was uploaded — otherwise an
    // edit that leaves the picker untouched would wipe the existing image.
    if (req.body.image !== undefined && req.body.image !== "") {
        $set.image = req.body.image;
    }
    return await Parameter.findOneAndUpdate(
        { _id: req.params.id },
        { $set },
        { new: true }
    );
};

export const delete_parameter_db = async function (id) {
    return await Parameter.findOneAndUpdate(
        { _id: id },
        { $set: { isDeleted: 1 } },
        { new: true },
    );
};

export const get_parameter_list_db = async function (filter, skip, limit) {
    const data = await Parameter.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

    const total = await Parameter.countDocuments(filter);

    return { data, total };
};

export const find_parameter_using_id_db = async function (id) {
    return await Parameter.findOne({ _id: id, isDeleted: 0 });
};

export const update_parameter_status_db = async function (id, status) {
    return await Parameter.findOneAndUpdate(
        { _id: id },
        { $set: { status } },
        { new: true },
    );
};

// --------------------
// END OF LINE
// --------------------
