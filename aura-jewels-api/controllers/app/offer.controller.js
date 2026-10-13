import mongoose from "mongoose";
import Offer from "../../models/offer.model.js";
import { get_offer_products } from "../../services/offer.services.js";
import { resolveAssetUrl } from "../../utils/uploadPaths.js";
import baseUrl from "../../constants/baseUrl.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";

// Public storefront offer landing page (/offer/<slug>). Matches the route
// param against slug OR code OR _id so links built from any of those resolve.
// Returns the offer meta (banner, name, description, validity) plus the
// paginated list of products the offer applies to.
export const get_offer_by_slug = async function (req, res) {
    try {
        const url = baseUrl(req);
        const raw = String(req.params.slug || "").trim();

        const or = [{ slug: raw }, { code: raw.toUpperCase() }];
        if (mongoose.Types.ObjectId.isValid(raw)) or.push({ _id: raw });

        const offer = await Offer.findOne({ isDeleted: 0, $or: or }).lean();
        if (!offer) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND,
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        const { total, products } = await get_offer_products(offer._id, skip, limit, search);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.SUCCESS,
            data: {
                offer: {
                    _id: offer._id,
                    name: offer.name,
                    code: offer.code,
                    slug: offer.slug || "",
                    description: offer.description || "",
                    image: resolveAssetUrl(offer.image, url, "uploads/offerImage") || "",
                    imageMobile: resolveAssetUrl(offer.imageMobile, url, "uploads/offerImage") || "",
                    startDate: offer.startDate,
                    endDate: offer.endDate,
                    discountType: offer.discountType,
                    discountValue: offer.discountValue,
                },
                products,
                pagination: {
                    total: total || 0,
                    page,
                    limit,
                    totalPages: Math.ceil((total || 0) / limit),
                },
            },
        });
    } catch (error) {
        console.error("get_offer_by_slug error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
