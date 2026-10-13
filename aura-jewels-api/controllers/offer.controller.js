import { add_offer_db, check_unique_offer_code, update_offer_db, get_offers_db, delete_offer_db, get_offer_products, get_products_List_for_offer, sync_offers_db } from "../services/offer.services.js";
import Offer from "../models/offer.model.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import BaseURL from "../constants/baseUrl.js";
import { resolveAssetUrl } from "../utils/uploadPaths.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Constant from "../constants/user.constant.js";

const formatOfferResponse = (offer, baseUrl) => {
    if (!offer) return offer;
    const obj = offer.toObject ? offer.toObject() : offer;
    return {
        ...obj,
        image: resolveAssetUrl(obj.image, baseUrl, "uploads/offerImage") || "",
        imageMobile: resolveAssetUrl(obj.imageMobile, baseUrl, "uploads/offerImage") || ""
    };
};

export const addOffer = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);
        // Check if offer code already exists
        const existingOffer = await check_unique_offer_code(req.body.code);
        if (existingOffer) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "An offer with this code already exists"
            });
        }

        const offer = await add_offer_db(req);
        if (offer && offer._id) {
            await sync_offers_db(offer._id);
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Offer created successfully",
            data: formatOfferResponse(offer, Baseurl)
        });

    } catch (error) {
        console.error("addOffer error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateOffer = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);
        const { id } = req.params;
        if (req.body.code) {
            const existingOffer = await check_unique_offer_code(req.body.code);
            if (existingOffer && existingOffer._id.toString() !== id) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: "An offer with this code already exists"
                });
            }
        }

        const offer = await update_offer_db(id, req);
        if (offer && offer._id) {
            await sync_offers_db(offer._id);
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Offer updated successfully",
            data: formatOfferResponse(offer, Baseurl)
        });

    } catch (error) {
        console.error("updateOffer error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getOffers = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);
        const skip = parseInt(req.body.skip) || 0;
        const limit = parseInt(req.body.limit) || 10;
        const filter = {};

        if (req.body.status) filter.status = req.body.status;

        const offersList = await get_offers_db(filter, skip, limit);
        const formattedOffers = offersList.map(offer => formatOfferResponse(offer, Baseurl));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Offers fetched successfully",
            data: formattedOffers
        });

    } catch (error) {
        console.error("getOffers error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findOne({ _id: id, isDeleted: 0 });
        if (!offer) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Offer not found"
            });
        }
        if (offer.isActive == true && offer.status === Constant.OFFER_STATUS.ACTIVE) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Offer is active, cannot delete"
            });
        }

        const deletedOffer = await delete_offer_db(id);
        if (deletedOffer) {
            await sync_offers_db(id);
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: "Offer deleted successfully"
            });
        }
        return res.status(STATUS_CODE.NOT_FOUND).json({
            errorCode: STATUS_CODE.NOT_FOUND,
            message: "Offer not found"
        });
    } catch (error) {
        console.error("deleteOffer error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findOne({ _id: id, isDeleted: 0 });
        if (!offer) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Offer not found"
            });
        }

        let newIsActive = offer.isActive;
        let calculatedStatus;

        if (req.body.status !== undefined) {
            calculatedStatus = req.body.status;
            if (calculatedStatus === "active") newIsActive = true;
            if (calculatedStatus === "draft") newIsActive = false;
        } else {
            newIsActive = req.body.isActive !== undefined ? req.body.isActive : !offer.isActive;
            calculatedStatus = newIsActive ? "active" : "draft";
        }

        const updatedOffer = await Offer.findByIdAndUpdate(
            id,
            { $set: { isActive: newIsActive, status: calculatedStatus } },
            { new: true }
        );

        await sync_offers_db(id);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Offer status updated successfully",
            data: formatOfferResponse(updatedOffer, BaseURL(req))
        });
    } catch (error) {
        console.error("updateOfferStatus error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getOfferProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.body?.limit) || parseInt(req.query.limit) || 10;
        const page = parseInt(req.body?.page) || parseInt(req.query.page) || 1;
        const skip = req.body?.skip !== undefined
            ? parseInt(req.body?.skip)
            : (req.query.skip !== undefined ? parseInt(req.query.skip) : (page - 1) * limit);
        const search = req.body?.search || req.query.search || "";

        const data = await get_offer_products(req.params.id, skip, limit, search);
        const totalPages = Math.ceil(data.total / limit);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Offer products fetched successfully.",
            data: {
                offer: data.offer,
                products: data.products,
                pagination: {
                    total: data.total,
                    limit,
                    skip,
                    page,
                    totalPages
                }
            }
        });
    } catch (error) {
        console.error("getOfferProducts error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getProductListForOffer = async (req, res, next) => {
    try {
        const limit = parseInt(req.body.limit) || parseInt(req.query.limit) || 10;
        const page = parseInt(req.body.page) || parseInt(req.query.page) || 1;
        const skip = req.body.skip !== undefined
            ? parseInt(req.body.skip)
            : (req.query.skip !== undefined ? parseInt(req.query.skip) : (page - 1) * limit);
        const search = req.body.search || req.query.search || "";

        const data = await get_products_List_for_offer(req.body, skip, limit, search);
        const totalPages = Math.ceil(data.total / limit);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Products resolved successfully.",
            data: {
                products: data.products,
                pagination: {
                    total: data.total,
                    limit,
                    skip,
                    page,
                    totalPages
                }
            }
        });
    } catch (error) {
        console.error("getProductListForOffer error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const syncOffers = async (req, res) => {
    try {
        const { password } = req.body;

        // 1. Verify requester is admin or super admin
        if (!req.user || (!req.user.role.includes(Constant.ROLES.ADMIN) && !req.user.role.includes(Constant.ROLES.SUPER_ADMIN))) {
            return res.status(STATUS_CODE.FORBIDDEN).json({
                errorCode: STATUS_CODE.FORBIDDEN,
                message: "Access denied. Admins only."
            });
        }

        // 2. Validate password exists in request
        if (!password) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Admin password is required to perform offer sync."
            });
        }

        console.log("req.user", req.user);
        console.log("req.user.id", req.user.id);
        // 3. Fetch admin details and verify password
        const adminUser = await User.findOne({ _id: req.user.userId, isDeleted: 0 });
        if (!adminUser) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Admin user not found."
            });
        }

        const isMatch = await bcrypt.compare(password, adminUser.password);
        if (!isMatch) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid admin password."
            });
        }

        // 4. Run database sync
        const syncedCount = await sync_offers_db();

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: `Offers synced successfully. Updated ${syncedCount} products.`,
            data: { syncedCount }
        });
    } catch (error) {
        console.error("syncOffers error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};