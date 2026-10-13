import { get_menu_by_location_db, upsert_menu_db } from "../services/menu.services.js";
import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import Offer from "../models/offer.model.js";
import Tag from "../models/tag.model.js";
import Metal from "../models/metal.model.js";
import Parameter from "../models/parameter.model.js";
import Constant from "../constants/user.constant.js";
import baseUrl from "../constants/baseUrl.js";
import { absolutizeImages } from "../utils/homeRedirect.js";
import { PAGE_REGISTRY } from "../constants/menu.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

// Admin: full menu tree for the builder. Images are absolutized for preview;
// redirects are returned RAW (no resolved `href`) so the builder round-trips
// the stored shape without leaking a server-only field back into the DB.
export const get_menu = async function (req, res) {
    try {
        const url = baseUrl(req);
        const menu = await get_menu_by_location_db(req.params.location);
        const data = menu
            ? {
                _id: menu._id,
                location: menu.location,
                title: menu.title || "",
                status: menu.status,
                items: absolutizeImages(Array.isArray(menu.items) ? menu.items : [], url),
            }
            : { location: req.params.location, title: "", status: Constant.STATUS.ACTIVE, items: [] };

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data,
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

// Admin: create/replace the menu tree for a location.
export const save_menu = async function (req, res) {
    try {
        const saved = await upsert_menu_db(req);
        if (!saved) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: MESSAGES.COMMON.INTERNAL_ERROR,
            });
        }
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.UPDATED,
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

// Admin: everything the RedirectPicker needs to populate its selectors in one
// round trip — curated pages, plus dropdowns for category/collection/offer/
// tag and the filter facets (shape/metal).
export const get_redirect_options = async function (req, res) {
    try {
        const [categories, collections, offers, tags, shapes, metals] = await Promise.all([
            Category.find({ status: Constant.STATUS.ACTIVE, isDeleted: { $ne: 1 } })
                .select("_id categoryName slug parentCategoryId")
                .sort({ sort: 1, categoryName: 1 })
                .lean(),
            Collection.find({ status: Constant.STATUS.ACTIVE, isDeleted: { $ne: 1 } })
                .select("_id collectionName slug")
                .sort({ collectionName: 1 })
                .lean(),
            Offer.find({ isDeleted: { $ne: 1 } })
                .select("_id name code slug")
                .sort({ createdAt: -1 })
                .lean(),
            Tag.find({ status: Constant.STATUS.ACTIVE })
                .select("_id name")
                .sort({ sort: 1, name: 1 })
                .lean(),
            Parameter.find({ type: "shape", status: Constant.STATUS.ACTIVE, isDeleted: { $ne: 1 } })
                .select("_id name code")
                .sort({ sort: 1, name: 1 })
                .lean(),
            Metal.find({ status: Constant.STATUS.ACTIVE, isDeleted: { $ne: 1 } })
                .select("_id name type stamp")
                .sort({ type: 1, stamp: 1 })
                .lean(),
        ]);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data: {
                pages: PAGE_REGISTRY,
                categories,
                collections,
                offers,
                tags,
                shapes,
                metals,
            },
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
