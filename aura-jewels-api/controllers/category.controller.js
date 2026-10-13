import mongoose from "mongoose";
import {
    check_unique_category_db,
    create_category_db,
    delete_category_db,
    find_category_using_id_db,
    find_soft_deleted_clash_category_db,
    get_big_sort_category_number,
    get_category_full_by_id_db,
    getCategory_list_db,
    revive_category_db,
    update_category_db,
    update_category_status_db
} from "../services/category.services.js";
import Constant from "../constants/user.constant.js";
import BaseURL from "../constants/baseUrl.js";
import categoryModel from "../models/category.model.js";
import { createSlug } from "../utils/createSlug.js";
import { absolutizeAsset, absolutizeImages, decorateRedirects } from "../utils/homeRedirect.js";
import { buildRedirectMaps } from "../utils/redirectMaps.js";
import { resolveAssetUrl } from "../utils/uploadPaths.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const create_category = async function (req, res) {
    try {
        const parentCategoryId = req.body.parentCategoryId
            ? new mongoose.Types.ObjectId(req.body.parentCategoryId)
            : null;

        // Compute the slug we'd insert so we can also detect collisions on
        // the unique slug index — not just on (name + parent). Without
        // this, a same-slugged soft-deleted row used to slip past the name
        // check and trip MongoDB's duplicate-key error on insert, which
        // the swallowing service then masked as a fake success.
        const slug = req.body.slug
            ? createSlug(req.body.slug)
            : createSlug(req.body.categoryName);

        // Unique-name check ignores soft-deleted rows so admins can reuse
        // a name after deletion. The slug clash with a soft-deleted row
        // is handled separately below (revival).
        const checkCate = await check_unique_category_db({
            categoryName: req.body.categoryName || undefined,
            parentCategoryId,
            isDeleted: 0,
        });
        if (checkCate) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CATEGORY.UNIQUE_NAME
            });
        }

        const [sortNumber] = await get_big_sort_category_number({ parentCategoryId });

        if (!req.body.sort) {
            req.body.sort = sortNumber?.maxValue ? sortNumber.maxValue + 1 : 1;
        } else {
            const existingSort = await check_unique_category_db({
                sort: req.body.sort,
                parentCategoryId,
                isDeleted: 0,
            });

            if (existingSort) {
                existingSort.sort = sortNumber?.maxValue ? sortNumber.maxValue + 1 : 1;
                await existingSort.save();
            }
        }

        if (req.files && req.files.length) {
            const imageFile = req.files.find(f => f.fieldname === "image");
            if (imageFile) {
                req.body.image = imageFile.filename;
            }
        }

        // If a soft-deleted row already owns this slug (or name + parent),
        // revive it with the new form values instead of inserting a new
        // doc. Re-inserting would hit the unique slug index and previously
        // failed silently — admins saw "Created" while nothing landed.
        const clash = await find_soft_deleted_clash_category_db({
            slug,
            categoryName: req.body.categoryName,
            parentCategoryId,
        });
        if (clash) {
            const revived = await revive_category_db(clash._id, {
                categoryName: req.body.categoryName,
                slug,
                parentCategoryId: parentCategoryId || null,
                image: req.body.image || clash.image,
                description: req.body.description,
                // featuredCategory: req.body.featuredCategory == 1,
                hasSize: req.body.hasSize == 1,
                isMenu: req.body.isMenu == 1,
                sort: req.body.sort,
                metaTitle: req.body.metaTitle,
                metaKeyword: req.body.metaKeyword,
                metaDescription: req.body.metaDescription,
                updatedBy: req.user.userId,
            });
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CATEGORY.ADDED,
                data: revived,
            });
        }

        const response = await create_category_db(req);
        if (!response) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: MESSAGES.COMMON.INTERNAL_ERROR,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CATEGORY.ADDED,
            data: response
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_category = async function (req, res) {
    try {
        const parentCategoryId = req.body.parentCategoryId
            ? new mongoose.Types.ObjectId(req.body.parentCategoryId)
            : null;

        // Conflict with any OTHER live row only — soft-deleted rows are
        // ignored so admins can rename freely.
        const checkUnique = await check_unique_category_db({
            _id: { $ne: req.params.id },
            categoryName: req.body.categoryName || undefined,
            parentCategoryId,
            isDeleted: 0,
        });

        if (checkUnique) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CATEGORY.UNIQUE_NAME
            });
        }

        if (req.files && req.files.length) {
            const imageFile = req.files.find(f => f.fieldname === "image");
            if (imageFile) {
                req.body.image = imageFile.filename;
            }
        }

        const [sortNumber] = await get_big_sort_category_number({ parentCategoryId });

        if (!req.body.sort) {
            req.body.sort = sortNumber?.maxValue ? sortNumber.maxValue + 1 : 1;
        } else {
            const existingSort = await check_unique_category_db({
                sort: req.body.sort,
                parentCategoryId,
                _id: { $ne: req.params.id },
                isDeleted: 0,
            });

            if (existingSort) {
                existingSort.sort = sortNumber?.maxValue ? sortNumber.maxValue + 1 : 1;
                await existingSort.save();
            }
        }

        const cat = await update_category_db(req);

        if (cat) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CATEGORY.UPDATED,
                data: cat
            });
        }

        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: MESSAGES.CATEGORY.NOT_FOUND
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// LIST endpoint — minimal payload only. The admin table renders Name,
// Parent, Slug, Featured, Sort, Status, Action — that's all we ship. Heavy
// fields (pageBanner, interProductBanners, menuSideCards, tags) are now
// loaded on demand by `get_category_by_id` when the edit modal opens.
//
// Why: the prior "everything in the list" shape blew up with
// "Maximum call stack size exceeded" once data shapes got rich, because
// decorateRedirects recursed into Mongoose subdocs that hold circular
// `$__.parent` refs. Keeping the list lean dodges that whole class of
// bugs and the response is dramatically smaller too.
export const get_category = async function (req, res) {
    try {
        const Baseurl = BaseURL(req);

        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.body.search || "";

        // `$ne: 1` matches both isDeleted=0 and legacy rows with the
        // field absent — see the audit notes elsewhere in this file.
        const filter = { isDeleted: { $ne: 1 } };
        if (search) {
            filter.categoryName = { $regex: search, $options: "i" };
        }

        if (req.body.parentCategoryId && req.body.parentCategoryId.trim() !== "") {
            filter.parentCategoryId = req.body.parentCategoryId === "null" ? null : req.body.parentCategoryId;
        }

        if (req.body.subCategoryId && req.body.subCategoryId.trim() !== "") {
            filter._id = req.body.subCategoryId === "null" ? null : req.body.subCategoryId;
        }

        const { data, total } = await getCategory_list_db(filter, skip, limit);

        const arr = data.map((field) => ({
            _id: field._id,
            categoryName: field.categoryName,
            slug: field.slug,
            description: field.description,
            featuredCategory: field.featuredCategory,
            hasSize: field.hasSize,
            sizeLabel: field.sizeLabel,
            isMenu: field.isMenu,
            sort: field.sort,
            // resolveAssetUrl tolerates both legacy (basename like
            // "foo.jpg") and modern (relative "uploads/categoryImages/foo.jpg")
            // storage shapes, so admin-side host stripping doesn't double
            // the prefix on the way back out.
            image: resolveAssetUrl(field.image, Baseurl, "uploads/categoryImages"),
            status: field.status,
            // parentCategoryId arrives populated with just {_id, categoryName, slug}
            // thanks to the `.populate("parentCategoryId", "categoryName slug")`
            // projection in the service.
            parentCategoryId: field.parentCategoryId || null,
        }));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CATEGORY.LIST_FETCHED,
            data: arr,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Detail endpoint — full doc for the edit modal. Returns everything the
// list omits: pageBanner, interProductBanners, menuSideCards, populated
// tags, meta fields. All image paths are absolutized server-side so the
// client renders `src` directly.
export const get_category_by_id = async function (req, res) {
    try {
        const Baseurl = BaseURL(req);
        const cat = await get_category_full_by_id_db(req.params.id);
        if (!cat) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.CATEGORY.NOT_FOUND,
            });
        }

        const banners = Array.isArray(cat.interProductBanners) ? cat.interProductBanners : [];
        const sideCards = Array.isArray(cat.menuSideCards) ? cat.menuSideCards : [];
        const maps = await buildRedirectMaps([banners, sideCards]);

        const result = {
            _id: cat._id,
            categoryName: cat.categoryName,
            slug: cat.slug,
            description: cat.description,
            featuredCategory: cat.featuredCategory,
            hasSize: cat.hasSize,
            sizeLabel: cat.sizeLabel,
            isMenu: cat.isMenu,
            sort: cat.sort,
            image: resolveAssetUrl(cat.image, Baseurl, "uploads/categoryImages"),
            pageBanner: cat.pageBanner
                ? {
                    image: resolveAssetUrl(cat.pageBanner.image, Baseurl, "uploads/categoryImages") || "",
                    imageMobile: resolveAssetUrl(cat.pageBanner.imageMobile, Baseurl, "uploads/categoryImages") || "",
                    heading: cat.pageBanner.heading || "",
                    subText: cat.pageBanner.subText || "",
                }
                : undefined,
            interProductBanners: decorateRedirects(banners, maps, Baseurl),
            menuSideCards: decorateRedirects(sideCards, maps, Baseurl),
            tags: Array.isArray(cat.tags)
                ? cat.tags
                    .filter((t) => t && typeof t === "object")
                    .map((t) => ({ _id: t._id, name: t.name, status: t.status }))
                : [],
            status: cat.status,
            metaTitle: cat.metaTitle,
            metaKeyword: cat.metaKeyword,
            metaDescription: cat.metaDescription,
            parentCategoryId: cat.parentCategoryId || null,
        };

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CATEGORY.LIST_FETCHED,
            data: result,
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const delete_category = async function (req, res) {
    try {
        const deleteCate = await delete_category_db(req.params.id);
        if (deleteCate) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CATEGORY.DELETED
            });
        }
        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: MESSAGES.CATEGORY.NOT_FOUND
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_category_status = async function (req, res) {
    try {
        const findCate = await find_category_using_id_db(req.params.id);
        if (!findCate) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.CATEGORY.NOT_FOUND
            });
        }

        const status = findCate.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;
        const updateStatus = await update_category_status_db(req.params.id, status);

        if (updateStatus) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CATEGORY.STATUS_UPDATED
            });
        }
        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: MESSAGES.CATEGORY.NOT_FOUND
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_category_tree = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);

        // `$ne: 1` matches both isDeleted=0 and legacy rows missing the field.
        const categories = await categoryModel.find({ isDeleted: { $ne: 1 } }).sort({ sort: 1 }).lean();

        const map = {};
        const tree = [];

        categories.forEach(cat => {
            map[cat._id] = {
                _id: cat._id,
                categoryName: cat.categoryName,
                slug: cat.slug,
                sort: cat.sort,
                hasSize: cat.hasSize,
                parentCategoryId: cat.parentCategoryId,
                image: resolveAssetUrl(cat.image, Baseurl, "uploads/categoryImages"),
                children: []
            };
        });

        categories.forEach(cat => {
            if (cat.parentCategoryId) {
                map[cat.parentCategoryId]?.children.push(map[cat._id]);
            } else {
                tree.push(map[cat._id]);
            }
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CATEGORY.TREE_FETCHED,
            data: tree
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
