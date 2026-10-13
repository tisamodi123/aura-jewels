import Collection from '../models/collection.model.js';
import { createSlug } from '../utils/createSlug.js';
import { getUploadedOrCleanFilename, stripAssetHost } from '../utils/uploadPaths.js';

const cleanFilename = (str) => {
    if (!str || typeof str !== "string") return "";
    const stripped = stripAssetHost(str);
    return stripped.split("/").pop();
};

// Parallels parsePageBanner in category.services.js
const parsePageBanner = (req) => {
    const img = getUploadedOrCleanFilename(req, "pageBannerImage", req.body["pageBanner.image"]);
    const imgMob = getUploadedOrCleanFilename(req, "pageBannerImageMobile", req.body["pageBanner.imageMobile"]);
    return {
        image: img !== undefined ? img : null,
        imageMobile: imgMob !== undefined ? imgMob : null,
        heading: req.body["pageBanner.heading"] || "",
        subText: req.body["pageBanner.subText"] || ""
    };
};

// Same contract as the helper in category.services.js — banner array
// JSON-encoded in the FormData, images pre-uploaded via the CMS endpoint.
const parseJsonArray = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

// Mirrors normaliseCardArray in category.services.js. Walks banner rows
// and strips any host prefix off image fields so the DB only ever stores
// `uploads/...` paths regardless of what the admin form posted.
const normaliseCardArray = (rows) =>
    (Array.isArray(rows) ? rows : []).map((row) => {
        if (!row || typeof row !== "object") return row;
        const next = { ...row };
        if ("image" in next) next.image = cleanFilename(next.image);
        if ("imageMobile" in next) next.imageMobile = cleanFilename(next.imageMobile);
        return next;
    });

export const add_collection_db = async function (req) {
    try {
        const cr = await Collection.create({
            collectionName: req.body.collectionName ? req.body.collectionName : undefined,
            image: getUploadedOrCleanFilename(req, 'image', req.body.image),
            slug: req.body.slug
                ? createSlug(req.body.slug)
                : createSlug(req.body.collectionName),
            description: req.body.description ? req.body.description : undefined,
            isMenu: req.body.isMenu == 1 || req.body.isMenu === true || req.body.isMenu === "true",
            pageBanner: parsePageBanner(req),
            interProductBanners: normaliseCardArray(parseJsonArray(req.body.interProductBanners)),
        })
        return cr;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const check_unique_collection_name = async function (obj) {
    try {
        return await Collection.findOne(obj)
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const get_collection_db = async function (filter, skip, limit) {
    // Lean + slim — list response carries only the columns the admin
    // table needs. Heavy fields (pageBanner, interProductBanners) are
    // fetched on demand by the by-id detail endpoint. `.lean()` is
    // critical because the prior path could blow the stack walking
    // Mongoose subdoc circular refs during decoration.
    const data = await Collection.find(filter)
        .select("collectionName slug image status isMenu createdAt")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

    const total = await Collection.countDocuments(filter);

    return { data, total };
};

// Detail fetch for the admin edit modal. Returns the full doc with all
// CMS-style fields; `.lean()` strips Mongoose internals so downstream
// decorators are safe.
export const get_collection_full_by_id_db = async function (id) {
    return await Collection.findById(id).lean();
};

export const update_collection_db = async function (req) {
    try {
        const updateData = {};

        //  only update if value exists
        if (req.body.collectionName) updateData.collectionName = req.body.collectionName;
        if (req.body.slug) updateData.slug = req.body.slug;
        if (req.body.description) updateData.description = req.body.description;
        // Always write isMenu — the form always sends it as 0/1 so the
        // boolean reflects the current toggle state, not a stale truthy
        // check.
        if (req.body.isMenu !== undefined) {
            updateData.isMenu = req.body.isMenu == 1 || req.body.isMenu === true || req.body.isMenu === "true";
        }
        updateData.pageBanner = parsePageBanner(req);
        updateData.interProductBanners = normaliseCardArray(parseJsonArray(req.body.interProductBanners));

        const image = getUploadedOrCleanFilename(req, 'image', req.body.image);
        if (image !== undefined) {
            updateData.image = image;
        }

        return await Collection.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
        );

    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const delete_collection_db = async function (id) {
    try {
        return await Collection.findOneAndDelete({ _id: id })
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const update_collection_status_db = async function (id, status) {
    try {
        return await Collection.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    status: status
                }
            },
        )
    } catch (error) {
        console.log(error);
        throw error;
    }
}