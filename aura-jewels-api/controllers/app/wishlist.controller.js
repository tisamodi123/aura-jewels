import {
    check_wishlist_exists,
    add_wishlist_db,
    update_wishlist_db,
    get_wishlist_db,
    preview_wishlist_db,
    resolve_wishlist_sku_lines
} from "../../services/wishlist.services.js";
import { add_cart_db, check_cart_exists } from "../../services/cart.services.js";
import Product from "../../models/product.model.js";
import {
    normalizeSelection,
    normalizeSelectionValue,
    selectionFilter,
    cartLineFilter
} from "../../utils/lineIdentity.js";

import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";

export const addToWishlist = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { jeweleryId, engraving = 0, engravingText = "", sizeId, checkoutCurrency } = req.body;

        const selection = normalizeSelection(req.body);

        // A line is the product PLUS the centre-stone selection. The same design
        // in Natural and in Lab Grown are two wishlist entries, not one.
        const exist = await check_wishlist_exists({
            jeweleryId,
            userId,
            isDeleted: 0,
            sizeId: sizeId || null,
            ...selectionFilter(req.body)
        });

        if (exist?.length > 0) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.WISHLIST.ALREADY_IN_CART,
                data: { wishlistId: exist[0]._id }
            });
        }

        const param = {
            jeweleryId,
            userId,
            isDeleted: 0,
            engraving,
            engravingText,
            sizeId: sizeId || undefined,
            checkoutCurrency: checkoutCurrency || "INR",
            ...selection
        };

        const result = await add_wishlist_db(param);

        if (result) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.WISHLIST.ADDED,
                // The client needs the row id so it can later remove exactly this
                // variant rather than "some line for this product".
                data: { wishlistId: result._id }
            });
        }

        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: MESSAGES.CART.NOT_ADDED
        });
    } catch (error) {
        console.error("addToWishlist error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const removeFromWishlist = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { wishlistId, jeweleryId } = req.body;

        // Prefer the row id: it names exactly one line. Falling back to
        // jeweleryId + selection keeps older clients working, but a bare
        // jeweleryId is ambiguous once a product is wishlisted in two origins —
        // it would remove whichever row happened to sort first.
        let lookup;
        if (wishlistId) {
            lookup = { _id: wishlistId, userId, isDeleted: 0 };
        } else {
            lookup = { userId, jeweleryId, isDeleted: 0 };
            const hasSelection = ["origin", "color", "clarity"].some(
                (k) => normalizeSelectionValue(req.body[k]) !== null
            );
            if (hasSelection) Object.assign(lookup, selectionFilter(req.body));
        }

        const exist = await check_wishlist_exists(lookup);

        if (!exist || exist.length === 0) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.WISHLIST.NOT_FOUND
            });
        }

        await update_wishlist_db(exist[0]._id, { isDeleted: 1 });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.WISHLIST.REMOVED
        });
    } catch (error) {
        console.error("removeFromWishlist error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        // get_wishlist_db returns { list, removed, adjusted } — unavailable
        // products are pruned; a dead centre-stone selection is reset, not pruned.
        const { list, removed, adjusted } = await get_wishlist_db(userId);

        if (!list.length) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.WISHLIST.NOT_FOUND,
                data: [],
                removed,
                adjusted: adjusted || []
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.WISHLIST.FETCHED,
            data: list,
            removed,
            adjusted: adjusted || []
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Guest wishlist pricing. Cookie stores SKUs + selections only. Writes nothing.
 */
export const previewWishlist = async (req, res) => {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items : [];

        if (!items.length) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.WISHLIST.NOT_FOUND,
                data: [],
                removed: []
            });
        }

        const { lines, removed: unresolved } = await resolve_wishlist_sku_lines(items);
        const { list, removed: pruned, adjusted } = await preview_wishlist_db(lines);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: list.length ? MESSAGES.WISHLIST.FETCHED : MESSAGES.WISHLIST.NOT_FOUND,
            data: list,
            removed: [...unresolved, ...pruned],
            adjusted: adjusted || []
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const moveToCart = async function (req, res) {
    try {
        const { wishlistId } = req.body;
        const userId = req.user.userId;

        const exist = await check_wishlist_exists({
            _id: wishlistId,
            userId,
            isDeleted: 0
        });

        const wishlistData = exist.length > 0 ? exist[0] : null;

        if (!wishlistData) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.ITEM_NOT_AVAILABLE,
                data: []
            });
        }

        // Same line identity, so moving the Lab Grown entry is not blocked by a
        // Natural line already sitting in the cart.
        const cartexist = await check_cart_exists({
            jeweleryId: wishlistData.jeweleryId,
            userId,
            isDeleted: 0,
            ...cartLineFilter({ ...wishlistData, sizeId: wishlistData.sizeId })
        });

        if (cartexist?.length > 0) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.WISHLIST.ALREADY_IN_CART,
                data: []
            });
        }

        const product = await Product.findById(wishlistData.jeweleryId);

        if (!product) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PRODUCT.NOT_FOUND
            });
        }

        const param = {
            jeweleryId: wishlistData.jeweleryId,
            qty: 1,
            engraving: wishlistData?.engraving || 0,
            engravingText: wishlistData?.engravingText || "",
            price: product.finalPrice,
            totalPrice: product.finalPrice * 1,
            sizeId: wishlistData.sizeId || undefined,
            // Carry the centre-stone selection into the cart. It was being
            // dropped, so a wishlisted Natural ring landed in the cart at the
            // product's default grade — and at the default price.
            ...normalizeSelection(wishlistData),
            userId,
            isDeleted: 0
        };

        const result = await add_cart_db(param);

        if (result) {
            await update_wishlist_db(wishlistId, { isDeleted: 1 });
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.WISHLIST.MOVED_TO_CART
            });
        }

        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: MESSAGES.CART.NOT_ADDED
        });
    } catch (error) {
        console.error("moveToCart error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
