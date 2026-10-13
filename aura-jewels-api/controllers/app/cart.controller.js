import {
    add_cart_db,
    check_cart_exists,
    update_cart_db,
    get_cartlist_db,
    find_cart_by_id,
    preview_cartlist_db,
    resolve_sku_lines,
    move_failed_order_to_cart_db
} from "../../services/cart.services.js";
import {
    add_wishlist_db,
    check_wishlist_exists
} from "../../services/wishlist.services.js";
import ProductMaster from "../../models/product.model.js";
import {
    normalizeSelection,
    normalizeSelectionValue,
    selectionFilter,
    cartLineFilter
} from "../../utils/lineIdentity.js";
import Category from "../../models/category.model.js";
import Sizes from "../../models/sizes.model.js";
import mongoose from "mongoose";
import Cart from "../../models/cart.model.js";
import Wishlist from "../../models/wishlist.model.js";

import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";
import { getExchangeRateFromRequest, adjustPricesForCurrency } from "../../utils/currencyConvertor.js";
import { applyCouponOnCart } from "../../services/coupon.services.js";
import { computeTax, taxCountryFromRequest } from "../../utils/tax.js";

// Resolves the sizeId to store on the cart for a given product.
// - Non-sized category → always null (size doesn't apply).
// - Sized category    → use the provided sizeId if it belongs to this
//                       category; otherwise null and let the cart re-pricing
//                       fall back to the default size.
const resolveSizeIdForProduct = async (product, sizeId) => {
    if (!product?.categoryId) return null;
    const category = await Category.findById(product.categoryId).lean();
    if (!category?.hasSize) return null;
    if (!sizeId) return null;
    const size = await Sizes.findOne({
        _id: sizeId,
        category: new mongoose.Types.ObjectId(category._id),
        isDeleted: 0,
    }).lean();
    return size ? size._id : null;
};

export const addToCart = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {
            jeweleryId,
            sizeId,
            engraving = 0,
            engravingText = "",
            qty = 1,
            origin = null,
            color = null,
            clarity = null
        } = req.body;

        // console.log("origin", req.body)
        const isReturnData = req.body.isReturnData ?? true;

        // SECURITY: clamp qty server-side [1,99]. update_cart_db uses
        // findByIdAndUpdate without runValidators, so a negative/zero qty would
        // otherwise persist and produce a negative line total at checkout.
        const safeQty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));

        // The product must be resolved BEFORE we can identify the line: the size
        // is part of the identity, and an unspecified size resolves to the
        // category default.
        const product = await ProductMaster.findById(jeweleryId);
        if (!product) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PRODUCT.NOT_FOUND
            });
        }

        const resolvedSizeId = await resolveSizeIdForProduct(product, sizeId);
        const selection = normalizeSelection(req.body);

        // A cart line is product + size + centre-stone selection. Keyed on the
        // product alone, adding the Lab Grown version of a design silently
        // rewrote the Natural line's origin, and two ring sizes could not
        // coexist.
        const lookup = {
            jeweleryId,
            userId,
            isDeleted: 0,
            ...cartLineFilter({ ...req.body, sizeId: resolvedSizeId })
        };

        const exist = await check_cart_exists(lookup);

        if (exist?.length > 0) {
            // Same line: only the mutable attributes change. Size and selection
            // are identity here, so they are not re-written.
            const updateData = { engraving, engravingText, qty: Math.min(99, (exist[0].qty || 0) + safeQty) };

            await update_cart_db(exist[0]._id, updateData);

            const response = {
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.UPDATED
            };

            if (isReturnData) {
                response.data = await get_cartlist_db(userId);
            }

            return res.status(STATUS_CODE.OK).json(response);
        }

        const obj = {
            jeweleryId,
            userId,
            isDeleted: 0,
            engraving,
            engravingText,
            qty: safeQty,
            sizeId: resolvedSizeId,
            ...selection
        };

        const result = await add_cart_db(obj);

        if (result) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.ADDED
            });
        }

        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: MESSAGES.CART.NOT_ADDED
        });
    } catch (error) {
        console.error("addToCart error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Update ring size, quantity, or engraving for an existing cart item (called from cart page)
export const updateCartItem = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { cartId, sizeId, qty, engraving, engravingText } = req.body;

        // Verify the cart item belongs to this user
        const cartExist = await find_cart_by_id(cartId);
        if (!cartExist || String(cartExist.userId) !== String(userId) || cartExist.isDeleted === 1) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CART.NOT_FOUND
            });
        }

        const updateData = {};

        // Handle quantity update
        if (qty !== undefined) {
            updateData.qty = Math.max(1, Math.min(99, parseInt(qty) || 1));
        }

        // Handle ring size update
        if (sizeId !== undefined) {
            const product = await ProductMaster.findById(cartExist.jeweleryId);
            if (product) {
                const resolvedSizeId = await resolveSizeIdForProduct(product, sizeId || null);
                updateData.sizeId = resolvedSizeId;
            }
        }

        // Handle engraving update
        if (engraving !== undefined) {
            updateData.engraving = Number(engraving) || 0;
        }

        if (engravingText !== undefined) {
            updateData.engravingText = String(engravingText || "").trim();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: 'No update fields provided'
            });
        }

        await update_cart_db(cartId, updateData);

        const updatedCart = await get_cartlist_db(userId);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CART.UPDATED,
            data: updatedCart.list
        });
    } catch (error) {
        console.error("updateCartItem error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const removeFromCart = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { cartId, jeweleryId } = req.body;

        // Prefer the row id: it names exactly one line. A bare jeweleryId is
        // ambiguous now that a design can sit in the cart twice (two origins, or
        // two sizes) — it would delete whichever row sorted first.
        let lookup;
        if (cartId) {
            lookup = { _id: cartId, userId, isDeleted: 0 };
        } else {
            lookup = { userId, jeweleryId, isDeleted: 0 };
            const narrowing = ["origin", "color", "clarity"].some(
                (k) => normalizeSelectionValue(req.body[k]) !== null
            ) || !!req.body.sizeId;
            if (narrowing) Object.assign(lookup, cartLineFilter(req.body));
        }

        const exist = await check_cart_exists(lookup);

        if (!exist || exist.length === 0) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CART.NOT_FOUND
            });
        }

        await update_cart_db(exist[0]._id, { isDeleted: 1 });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CART.REMOVED
        });
    } catch (error) {
        console.error("removeFromCart error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

/**
 * Guest cart pricing. The cookie stores only SKUs + the buyer's selections, so
 * prices, titles and availability always come from the server and can never go
 * stale. Writes nothing.
 *
 * `removed` lists every line dropped (product gone/deactivated, or the chosen
 * size / centre-stone variant no longer exists) so the client can rewrite its
 * cookie instead of re-sending dead SKUs forever.
 */
export const previewCart = async (req, res) => {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items : [];

        if (!items.length) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.EMPTY,
                data: [],
                total: 0,
                taxRate: 0,
                tax: 0,
                grandTotal: 0,
                coupon: null,
                removed: [],
                adjusted: []
            });
        }

        const { lines, removed: unresolved } = await resolve_sku_lines(items);
        const data = await preview_cartlist_db(lines);
        const removed = [...unresolved, ...data.removed];

        // Guest coupon preview: only PUBLIC coupons resolve without a userId
        // (validate_and_apply_coupon rejects assigneeOnly when userId is null).
        // Per-user / assignee limits are still enforced at order placement, which
        // requires login — so this is a safe "what you'd save" preview. Mirrors
        // the logged-in getCartList path; a bad coupon must not break the cart.
        const couponCode = typeof req.body?.coupon === "string" ? req.body.coupon.trim() : "";
        let total = data.total;
        let couponDetails = null;
        let couponError = null;
        if (couponCode) {
            try {
                couponDetails = await applyCouponOnCart({
                    code: couponCode,
                    userId: null,
                    orderAmount: total,
                    components: data.components,   // INR making/diamond totals for a combined coupon
                    cartItems: data.list,
                    preview: true                  // estimate only; real caps enforced at checkout (login)
                });
                total = couponDetails.finalAmount;
            } catch (couponErr) {
                couponDetails = null;
                couponError = couponErr?.message || "Coupon could not be applied";
            }
        }

        const { rate, currency } = await getExchangeRateFromRequest(req);
        const adjustedDataList = adjustPricesForCurrency(data.list, rate, currency);
        const adjustedTotal = parseFloat((total / rate).toFixed(2)); // pre-tax, post-coupon net

        // Guests see the same tax treatment as signed-in customers — otherwise
        // the total would jump the moment they log in. GST is added on top of the
        // post-coupon net.
        const taxCountry = taxCountryFromRequest(req, currency);
        const { taxRate, taxAmount, grandTotal } = computeTax({
            taxableAmount: adjustedTotal,
            country: taxCountry,
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: adjustedDataList.length ? MESSAGES.CART.FETCHED : MESSAGES.CART.EMPTY,
            data: adjustedDataList,
            coupon: couponDetails
                ? {
                    code: couponDetails.code,
                    discountAmount: parseFloat((couponDetails.discountAmount / rate).toFixed(2)),
                    finalAmount: parseFloat((couponDetails.finalAmount / rate).toFixed(2))
                }
                : null,
            couponError,
            total: adjustedTotal,       // pre-tax
            taxRate,
            tax: taxAmount,
            grandTotal,
            removed,
            // Lines kept but whose centre-stone selection could not be priced and
            // was reset to the product default. Distinct from `removed`.
            adjusted: data.adjusted || []
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCartList = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { coupon } = req.query;
        const data = await get_cartlist_db(userId);

        if (!data.list.length) {
            // Full money shape so the client resets its summary cleanly instead
            // of leaving a stale GST/coupon behind after the last item is removed.
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.EMPTY,
                data: [],
                total: 0,
                taxRate: 0,
                tax: 0,
                grandTotal: 0,
                coupon: null,
                removed: [],
                adjusted: []
            });
        }
        let total = data.total;
        let couponDetails = null;
        let couponError = null;

        if (coupon) {
            // Isolate coupon failures — an expired/exhausted/below-min coupon must
            // NOT break the whole cart fetch (previously threw a 500).
            try {
                couponDetails = await applyCouponOnCart({
                    code: coupon,
                    userId,
                    orderAmount: total,
                    components: data.components,   // INR making/diamond totals for a combined coupon
                    cartItems: data.list
                });
                total = couponDetails.finalAmount;
            } catch (couponErr) {
                couponDetails = null;
                couponError = couponErr?.message || "Coupon could not be applied";
            }
        }

        const { rate, currency } = await getExchangeRateFromRequest(req);
        const adjustedDataList = adjustPricesForCurrency(data.list, rate, currency);
        const adjustedTotal = parseFloat((total / rate).toFixed(2));

        // Sales tax (GST), ADDED on top of the post-coupon net. `total` is left
        // as the PRE-TAX net on purpose: placeOrder derives its own subTotal from
        // get_cartlist_db and re-computes tax server-side, so folding tax into
        // `total` here would double-tax at checkout. The client shows `tax` as a
        // separate line and `grandTotal` as the amount payable.
        //
        // At cart stage there is no shipping address yet, so taxability is an
        // ESTIMATE from the browsing locale (x-country header, else INR ⇒ India).
        // The order re-decides it authoritatively from the shipping country.
        const taxCountry = taxCountryFromRequest(req, currency);
        const { taxRate, taxAmount, grandTotal } = computeTax({
            taxableAmount: adjustedTotal,
            country: taxCountry,
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CART.FETCHED,
            data: adjustedDataList,
            total: adjustedTotal,       // pre-tax, post-coupon net
            taxRate,                    // e.g. 0.03 (0 for exports)
            tax: taxAmount,
            grandTotal,                 // total + tax — what the customer pays
            coupon: couponDetails
                ? {
                    code: couponDetails.code,
                    discountAmount: parseFloat(
                        (couponDetails.discountAmount / rate).toFixed(2)
                    ),
                    finalAmount: parseFloat(
                        (couponDetails.finalAmount / rate).toFixed(2)
                    )
                }
                : null,
            couponError,
            // Lines dropped because the product or the chosen variant is gone.
            removed: data.removed || [],
            // Lines kept, but re-priced at the product default because their
            // centre-stone selection could not be honoured.
            adjusted: data.adjusted || []
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const moveToWishlist = async function (req, res) {
    try {
        const { cartId } = req.body;
        const userId = req.user.userId;

        const cartexist = await check_cart_exists({ _id: cartId, isDeleted: 0 });
        const cartData = cartexist.length > 0 ? cartexist[0] : null;

        if (!cartData) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.ITEM_NOT_AVAILABLE,
                data: []
            });
        }

        // Match the wishlist on the same line identity, so moving the Lab Grown
        // line does not report "already in wishlist" because the Natural one is
        // there.
        const wishlistexist = await check_wishlist_exists({
            jeweleryId: cartData.jeweleryId,
            userId,
            isDeleted: 0,
            sizeId: cartData.sizeId || null,
            ...selectionFilter(cartData)
        });

        if (wishlistexist?.length > 0) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.ALREADY_IN_WISHLIST,
                data: []
            });
        }

        const param = {
            jeweleryId: cartData.jeweleryId,
            qty: cartData.qty,
            engraving: cartData?.engraving || 0,
            engravingText: cartData?.engravingText || "",
            sizeId: cartData.sizeId || undefined,
            // Carry the centre-stone selection across. It was being dropped, so a
            // Natural line moved to the wishlist came back as the default grade.
            ...normalizeSelection(cartData),
            userId,
            isDeleted: 0
        };

        const result = await add_wishlist_db(param);

        if (result) {
            await update_cart_db(cartId, { isDeleted: 1 });
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.MOVED_TO_WISHLIST
            });
        }

        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: MESSAGES.CART.NOT_ADDED
        });
    } catch (error) {
        console.error("moveToWishlist error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const cartWishlistCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(STATUS_CODE.UNAUTHORIZED).json({
                errorCode: STATUS_CODE.UNAUTHORIZED,
                message: MESSAGES.COMMON.UNAUTHORIZED
            });
        }

        const cartCount = await Cart.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: 0
        });

        const wishlistCount = await Wishlist.countDocuments({
            userId,
            isDeleted: 0
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CART.COUNT_FETCHED,
            data: { cartCount, wishlistCount }
        });
    } catch (error) {
        console.error("cartWishlistCount error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getCheckout = async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = await get_cartlist_db(userId);

        if (!data.list.length) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.CART.EMPTY,
                data: [],
                total: 0
            });
        }

        data.shippingCharge = 0;
        data.taxes = 0;
        data.grandTotal = data.total + data.shippingCharge + data.taxes;
        const { rate, currency } = await getExchangeRateFromRequest(req);
        const adjustedCheckoutData = adjustPricesForCurrency(data, rate, currency);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.CART.FETCHED,
            data: adjustedCheckoutData
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const moveFailedOrderToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.body;

        const result = await move_failed_order_to_cart_db(orderId, userId);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Failed order items successfully moved to cart",
            data: result
        });
    } catch (error) {
        console.error("moveFailedOrderToCart error:", error);
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
