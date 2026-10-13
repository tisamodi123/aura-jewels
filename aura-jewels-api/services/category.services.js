import Constant from "../constants/user.constant.js";
import Category from "../models/category.model.js";
import { createSlug } from "../utils/createSlug.js";
import { getUploadedOrCleanFilename, stripAssetHost } from "../utils/uploadPaths.js";

const cleanFilename = (str) => {
    if (!str || typeof str !== "string") return "";
    const stripped = stripAssetHost(str);
    return stripped.split("/").pop();
};

// Builds the pageBanner sub-document from the multipart form fields.
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

// JSON-encoded arrays come through FormData as plain strings. Banner +
// menu-side-card images are pre-uploaded via the CMS upload endpoint so
// each item already carries an `uploads/...` path string — no req.files
// handling needed here. Returns [] on missing or malformed input so a
// stale draft never wipes a previous save when something breaks.
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

// Walks an array of banner / side-card rows and rewrites any image fields
// down to relative paths. See parsePageBanner for the rationale — the
// admin edit modal seeds these from an absolutized detail response.
const normaliseCardArray = (rows) =>
    (Array.isArray(rows) ? rows : []).map((row) => {
        if (!row || typeof row !== "object") return row;
        const next = { ...row };
        if ("image" in next) next.image = cleanFilename(next.image);
        if ("imageMobile" in next) next.imageMobile = cleanFilename(next.imageMobile);
        return next;
    });

// Generic find — caller controls what's filtered (including isDeleted).
// Errors propagate so the controller's catch can surface them instead of
// silently returning `undefined` and pretending success downstream.
export const check_unique_category_db = async function (obj) {
    return await Category.findOne(obj);
}

// Looks for a soft-deleted row that would collide with a new create on
// either the unique-indexed slug or the (name + parent) pair. When found,
// the controller revives it (clears isDeleted, overwrites fields) instead
// of trying to insert and hitting MongoDB's duplicate-slug index — which
// used to throw silently and return a misleading success.
export const find_soft_deleted_clash_category_db = async function ({ slug, categoryName, parentCategoryId }) {
    const or = [];
    if (slug) or.push({ slug });
    if (categoryName) or.push({ categoryName, parentCategoryId: parentCategoryId || null });
    if (or.length === 0) return null;
    return await Category.findOne({ isDeleted: 1, $or: or });
}

// Revives a soft-deleted category — flips isDeleted back to 0 and writes
// the new edit-form fields on top of whatever was there. Used by the
// create flow when a slug/name clash is found on a soft-deleted row.
export const revive_category_db = async function (id, fields) {
    return await Category.findByIdAndUpdate(
        id,
        { $set: { ...fields, isDeleted: 0 } },
        { new: true },
    );
}

export const get_big_sort_category_number = async function (obj) {
    return await Category.aggregate([
        {
            $match: {
                parentCategoryId: obj?.parentCategoryId
            }
        },
        {
            $group: {
                _id: null,
                maxValue: { $max: "$sort" }
            }
        }
    ]);
}

export const create_category_db = async function (req) {
    return await Category.create({
            categoryName: req.body.categoryName,
            createdBy: req.user.userId,
            parentCategoryId: req.body.parentCategoryId ? req.body.parentCategoryId : undefined,
            slug: req.body.slug
                ? createSlug(req.body.slug)
                : createSlug(req.body.categoryName),
            image: getUploadedOrCleanFilename(req, "image", req.body.image),
            description: req.body.description ? req.body.description : undefined,
            featuredCategory: req.body.featuredCategory == 1 ? true : false,
            hasSize: req.body.hasSize == 1 ? true : false,
            sizeLabel: req.body?.sizeLabel && req.body?.sizeLabel,
            isMenu: req.body.isMenu == 1 ? true : false,
            sort: req.body.sort ? req.body.sort : undefined,
            metaTitle: req.body.metaTitle ? req.body.metaTitle : undefined,
            metaKeyword: req.body.metaKeyword ? req.body.metaKeyword : undefined,
            metaDescription: req.body.metaDescription ? req.body.metaDescription : undefined,
            pageBanner: parsePageBanner(req),
            interProductBanners: normaliseCardArray(parseJsonArray(req.body.interProductBanners)),
            menuSideCards: normaliseCardArray(parseJsonArray(req.body.menuSideCards)),
            // Featured tags — admin posts as JSON-encoded array of Tag _ids.
            tags: parseJsonArray(req.body.tags),
            // size: req.body.size ? req.body.size : null,
    });
};

export const update_category_db = async function (req) {
    return await Category.findOneAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                categoryName: req.body.categoryName ? req.body.categoryName : undefined,
                updatedBy: req.user.userId,
                parentCategoryId: req.body.parentCategoryId ? req.body.parentCategoryId : undefined,
                slug: req.body.slug
                    ? createSlug(req.body.slug)
                    : createSlug(req.body.categoryName),
                image: getUploadedOrCleanFilename(req, "image", req.body.image),
                featuredCategory: req.body.featuredCategory == 1 ? true : false,
                hasSize: req.body.hasSize == 1 ? true : false,
                sizeLabel: req.body?.sizeLabel && req.body?.sizeLabel,
                isMenu: req.body.isMenu == 1 ? true : false,
                pageBanner: parsePageBanner(req),
                interProductBanners: normaliseCardArray(parseJsonArray(req.body.interProductBanners)),
                menuSideCards: normaliseCardArray(parseJsonArray(req.body.menuSideCards)),
                tags: parseJsonArray(req.body.tags),
                sort: req.body.sort ? req.body.sort : undefined,
                metaTitle: req.body.metaTitle ? req.body.metaTitle : undefined,
                metaKeyword: req.body.metaKeyword ? req.body.metaKeyword : undefined,
                metaDescription: req.body.metaDescription ? req.body.metaDescription : undefined,
                // size: req.body.size ? req.body.size : null,
            }
        },
        { new: true },
    );
};

export const delete_category_db = async function (id) {
    return await Category.findOneAndUpdate(
        { _id: id },
        { $set: { isDeleted: 1 } },
    );
};

export const getCategory_list_db = async function (filter, skip, limit) {
    // List query is intentionally lean + slim:
    //  - `.lean()` returns plain JS objects, not Mongoose Documents. The
    //    earlier full-doc path blew up the response serializer with a
    //    "Maximum call stack size exceeded" because Mongoose subdocs
    //    carry circular `$__.parent` refs that decorateRedirects
    //    recursed into.
    //  - `.select()` only pulls the columns the admin table actually
    //    renders. Heavy fields (pageBanner, interProductBanners,
    //    menuSideCards, tags) are fetched on demand by the by-id detail
    //    endpoint when the edit modal opens.
    const data = await Category.find(filter)
        .select("categoryName slug image status sort featuredCategory hasSize sizeLabel isMenu parentCategoryId description")
        .populate("parentCategoryId", "categoryName slug")
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Category.countDocuments(filter);

    return { data, total };
};

// Single-row detail fetch used by the admin edit modal. Pulls the full
// document including all heavy CMS-style fields (pageBanner, banner
// arrays, menu side-cards, populated tags). `.lean()` strips Mongoose
// internals so downstream decorators can safely walk the tree.
export const get_category_full_by_id_db = async function (id) {
    return await Category.findOne({ _id: id, isDeleted: { $ne: 1 } })
        .populate("parentCategoryId", "categoryName slug")
        .populate({ path: "tags", select: "name status" })
        .lean();
};

export const update_category_status_db = async function (id, status) {
    return await Category.findOneAndUpdate({ _id: id }, { $set: { status: status } });
};

export const find_category_using_id_db = async function (id) {
    return await Category.findOne({ _id: id });
};

export const get_all_category_db = async function (obj) {
    return await Category.find(obj).sort({ 'sort': -1 });
};

export const getAllCategoryList = async function (where) {
    return await Category.aggregate([
        { $match: { status: Constant.STATUS.ACTIVE } },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: 'parentCategoryId',
                as: 'subCategory'
            }
        },
        { $sort: { sort: 1 } },
    ]);
};

export const get_categoy_list_aggregate = async function (match) {
    return await Category.aggregate(match);
};

export const addCategory = async function (correctCategory, UserId) {
    for (const value of correctCategory) {
        const categoryName = value.CategoryName || null;
        const slug = createSlug(categoryName);//value.Slug || null;
        const parentId = value.ParentCategoryId || null;

        // Check if category already exists (case-insensitive)
        let existingCategory = await Category.findOne({ categoryName: categoryName, parentCategoryId: parentId });

        let isOld = !!existingCategory;
        let category;

        if (isOld) {
            category = existingCategory;
            category.categoryName = categoryName;
            category.slug = slug;
            category.parentCategoryId = parentId;
            category.createdBy = UserId;

            await category.save();
        } else {
            let [sortNumber] = await get_big_sort_category_number({ parentCategoryId: parentId });
            let sort = sortNumber?.maxValue ? sortNumber?.maxValue + 1 : 1;

            category = await Category.create({
                categoryName: categoryName,
                slug: slug,
                parentCategoryId: parentId,
                sort: sort,
                createdBy: UserId,
            });
        }
    }
}