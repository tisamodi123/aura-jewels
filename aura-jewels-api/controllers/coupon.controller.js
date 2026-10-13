import * as couponService from "../services/coupon.services.js";
import { get_cartlist_db } from "../services/cart.services.js";
import jwt from "jsonwebtoken";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import mongoose from "mongoose";
import BaseURL from "../constants/baseUrl.js";
import { resolveAssetUrl } from "../utils/uploadPaths.js";

const formatCouponResponse = (coupon, baseUrl) => {
    if (!coupon) return coupon;
    const obj = coupon.toObject ? coupon.toObject() : coupon;
    return {
        ...obj,
        image: resolveAssetUrl(obj.image, baseUrl, "uploads/couponImage") || "",
        imageMobile: resolveAssetUrl(obj.imageMobile, baseUrl, "uploads/couponImage") || ""
    };
};

// Add a new coupon
export const addCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const existing = await couponService.check_unique_coupon_code(code);
        if (existing) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "A coupon with this code already exists"
            });
        }

        const Baseurl = BaseURL(req);
        const coupon = await couponService.create_coupon_db(req.body);
        return res.status(STATUS_CODE.CREATED).json({
            errorCode: STATUS_CODE.CREATED,
            message: "Coupon created successfully",
            data: formatCouponResponse(coupon, Baseurl)
        });
    } catch (error) {
        console.error("addCoupon controller error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Update an existing coupon
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const Baseurl = BaseURL(req);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid coupon ID"
            });
        }

        if (req.body.code) {
            const existing = await couponService.check_unique_coupon_code(req.body.code);
            if (existing && existing._id.toString() !== id) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: "A coupon with this code already exists"
                });
            }
        }

        const updated = await couponService.update_coupon_db(id, req.body);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Coupon not found"
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Coupon updated successfully",
            data: formatCouponResponse(updated, Baseurl)
        });
    } catch (error) {
        console.error("updateCoupon controller error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Get coupons (Admin view)
export const getCoupons = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);
        const skip = parseInt(req.body.skip) || 0;
        const limit = parseInt(req.body.limit) || 10;
        const filter = {};

        if (req.body.status) filter.status = req.body.status;
        if (req.body.couponType) filter.couponType = req.body.couponType;
        if (req.body.search) {
            filter.code = { $regex: req.body.search, $options: "i" };
        }

        const { total, list } = await couponService.get_coupons_db(filter, skip, limit);
        const formatted = list.map(item => formatCouponResponse(item, Baseurl));
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Coupons fetched successfully",
            total,
            data: formatted
        });
    } catch (error) {
        console.error("getCoupons controller error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Get single coupon details
export const getCouponDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const Baseurl = BaseURL(req);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid coupon ID"
            });
        }

        const coupon = await couponService.get_coupon_detail_db({ _id: id });
        if (!coupon) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Coupon not found"
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Coupon details fetched successfully",
            data: formatCouponResponse(coupon, Baseurl)
        });
    } catch (error) {
        console.error("getCouponDetail controller error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid coupon ID"
            });
        }

        const deleted = await couponService.delete_coupon_db(id);
        if (!deleted) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Coupon not found"
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Coupon deleted successfully"
        });
    } catch (error) {
        console.error("deleteCoupon controller error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Apply coupon endpoint (Front-end/App)
export const applyCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const userId = req.user?.userId || null;

        if (!code || orderAmount === undefined) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Coupon code and orderAmount are required"
            });
        }

        // Load the cart's making/diamond component totals so a diamond / making /
        // combined coupon computes its per-component discount here too (not just on
        // the cart/order paths). Without this, component coupons would validate to
        // a 0 discount through this endpoint. Total-type coupons don't need it.
        let components = null;
        if (userId) {
            try {
                const cart = await get_cartlist_db(userId);
                components = cart?.components || null;
            } catch (e) {
                console.error("applyCoupon: cart components lookup failed:", e?.message);
            }
        }

        const result = await couponService.validate_and_apply_coupon(code, userId, Number(orderAmount), components);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Coupon applied successfully",
            data: result
        });
    } catch (error) {
        console.error("applyCoupon controller error:", error);
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Fetch public banner coupons (Front-end/App banner list)
export const getPublicCouponBanners = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);
        const list = await couponService.get_public_coupon_banners_db();
        const formatted = list.map(item => formatCouponResponse(item, Baseurl));
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Coupon banners fetched successfully",
            data: formatted
        });
    } catch (error) {
        console.error("getPublicCouponBanners controller error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// GET /getApplicableCoupons — Storefront: return coupons grouped by type
// Works for guests (no token) and logged-in users.
// assigneeOnly coupons are returned only when the user is authenticated and assigned.
export const getApplicableCoupons = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);
        const user = req.user

        const { public: publicCoupons, assigneeOnly } =
            await couponService.get_applicable_coupons_db(user?.userId);

        const fmt = (list) => list.map(item => formatCouponResponse(item, Baseurl));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Applicable coupons fetched successfully",
            data: {
                public: fmt(publicCoupons),
                // private: fmt(privateCoupons),
                assigneeOnly: fmt(assigneeOnly)
            }
        });
    } catch (error) {
        console.error("getApplicableCoupons controller error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
