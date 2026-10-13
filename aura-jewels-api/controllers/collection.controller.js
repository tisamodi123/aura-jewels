import {
    add_collection_db,
    check_unique_collection_name,
    delete_collection_db,
    get_collection_db,
    get_collection_full_by_id_db,
    update_collection_db,
    update_collection_status_db
} from "../services/collection.services.js";
import baseUrl from "../constants/baseUrl.js";
import Constant from "../constants/user.constant.js";
import { absolutizeImages, decorateRedirects } from "../utils/homeRedirect.js";
import { buildRedirectMaps } from "../utils/redirectMaps.js";
import { resolveAssetUrl } from "../utils/uploadPaths.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const add_collection = async function (req, res) {
    try {
        const checkName = await check_unique_collection_name({ collectionName: req.body.collectionName });
        if (checkName) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.COLLECTION.NAME_EXISTS
            });
        }
        const checkSlug = await check_unique_collection_name({slug: req.body.slug });
        if (checkSlug) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.COLLECTION.SLUG_EXISTS
            });
        }
        const created = await add_collection_db(req);
        if (!created) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: MESSAGES.COMMON.INTERNAL_ERROR,
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COLLECTION.ADDED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// LIST endpoint — minimal payload. The admin table renders Name, Slug,
// Image, Status, Show-in-Menu, Action — that's all we ship. Heavy fields
// (pageBanner, interProductBanners) are loaded on demand by the
// `get_collection_by_id` detail endpoint when the edit modal opens.
//
// Mirrors the slim-list pattern in category to dodge the
// "Maximum call stack size exceeded" failure that hit when
// decorateRedirects recursed into Mongoose subdoc circular refs.
export const get_collection = async function (req, res) {
    try {
        const url = baseUrl(req);

        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.body.search || "";

        const filter = {};
        if (search) {
            filter.collectionName = { $regex: search, $options: "i" };
        }

        const { data, total } = await get_collection_db(filter, skip, limit);

        const finalData = (data || []).map((col) => ({
            _id: col._id,
            collectionName: col.collectionName || undefined,
            image: resolveAssetUrl(col.image, url, "uploads/collectionImages"),
            slug: col.slug || undefined,
            isMenu: col.isMenu || false,
            status: col.status || undefined,
        }));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COLLECTION.LIST_FETCHED,
            data: finalData,
            pagination: {
                total: total || 0,
                page,
                limit,
                totalPages: Math.ceil((total || 0) / limit),
            },
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Detail endpoint — full doc for the edit modal. All image paths are
// absolutized server-side; the storefront and admin render `src`
// directly with no client-side host resolution.
export const get_collection_by_id = async function (req, res) {
    try {
        const url = baseUrl(req);
        const col = await get_collection_full_by_id_db(req.params.id);
        if (!col) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COLLECTION.NOT_FOUND,
            });
        }

        const banners = Array.isArray(col.interProductBanners) ? col.interProductBanners : [];
        const maps = await buildRedirectMaps([banners]);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COLLECTION.LIST_FETCHED,
            data: {
                _id: col._id,
                collectionName: col.collectionName || undefined,
                image: resolveAssetUrl(col.image, url, "uploads/collectionImages"),
                slug: col.slug || undefined,
                description: col.description || undefined,
                isMenu: col.isMenu || false,
                pageBanner: col.pageBanner
                    ? {
                        image: resolveAssetUrl(col.pageBanner.image, url, "uploads/collectionImages") || "",
                        imageMobile: resolveAssetUrl(col.pageBanner.imageMobile, url, "uploads/collectionImages") || "",
                        heading: col.pageBanner.heading || "",
                        subText: col.pageBanner.subText || "",
                    }
                    : undefined,
                interProductBanners: decorateRedirects(banners, maps, url),
                status: col.status || undefined,
            },
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const update_collection = async function (req, res) {
    try {
        const checkName = await check_unique_collection_name({
            collectionName: req.body.collectionName,
            _id: { $ne: req.params.id }
        });
        if (checkName) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.COLLECTION.NAME_EXISTS
            });
        }
        const checkSlug = await check_unique_collection_name({
            slug: req.body.slug,
            _id: { $ne: req.params.id }
        });
        if (checkSlug) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.COLLECTION.SLUG_EXISTS
            });
        }
        const updated = await update_collection_db(req);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COLLECTION.NOT_FOUND,
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COLLECTION.UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const delete_collection = async function (req, res) {
    try {
        const deleteCall = await delete_collection_db(req.params.id);
        if (deleteCall) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.COLLECTION.DELETED
            });
        }
        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: MESSAGES.COLLECTION.NOT_FOUND
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_collection_status = async function (req, res) {
    try {
        const checkCol = await check_unique_collection_name({ _id: req.params.id });
        if (!checkCol) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COLLECTION.NOT_FOUND
            });
        }

        const status = checkCol.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;
        const updateStatus = await update_collection_status_db(req.params.id, status);

        if (updateStatus) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.COLLECTION.STATUS_UPDATED
            });
        }
        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: MESSAGES.COLLECTION.NOT_FOUND
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
