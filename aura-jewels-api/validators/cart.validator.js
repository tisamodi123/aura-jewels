import Joi from 'joi';

const objectId = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Must be a valid ObjectId'
});

// Categories with `hasSize=false` skip the size picker entirely, so the
// storefront submits `sizeId: ""`. Joi's default `string` rule rejects an
// empty string with `"sizeId" is not allowed to be empty` — accept it
// here and let the cart controller treat it as "no size" via
// `resolveSizeIdForProduct`.
const optionalObjectIdOrEmpty = objectId.allow('', null).optional();

export const addToCartSchema = Joi.object({
    jeweleryId: objectId.required(),
    sizeId: optionalObjectIdOrEmpty,
    engraving: Joi.number().integer().min(0).max(1).default(0),
    engravingText: Joi.string().allow('').max(100).default(''),
    isReturnData: Joi.boolean().optional(),
    qty: Joi.number().integer().min(1).max(99).default(1),
    // Selected center-stone quality/origin — must be declared or stripUnknown
    // drops them before the controller can persist them (H3).
    origin: Joi.string().allow('', null).optional(),
    color: Joi.string().allow('', null).optional(),
    clarity: Joi.string().allow('', null).optional(),
});

// Used by the dedicated "update cart item" endpoint (ring size + quantity + engraving)
export const updateCartItemSchema = Joi.object({
    cartId: objectId.required(),
    sizeId: optionalObjectIdOrEmpty,
    qty: Joi.number().integer().min(1).max(99).optional(),
    engraving: Joi.number().integer().min(0).max(1).optional(),
    engravingText: Joi.string().allow('', null).max(100).optional(),
});

// Remove exactly one line. `cartId` names it unambiguously; `jeweleryId` plus
// the size/selection is the fallback for older clients. validate.middleware runs
// with stripUnknown, so every field the client may send must be declared here.
export const removeFromCartSchema = Joi.object({
    cartId: objectId.optional(),
    jeweleryId: objectId.optional(),
    sizeId: objectId.allow('', null).optional(),
    origin: Joi.string().allow('', null).optional(),
    color: Joi.string().allow('', null).optional(),
    clarity: Joi.string().allow('', null).optional(),
}).or('cartId', 'jeweleryId');

export const moveToWishlistSchema = Joi.object({
    cartId: objectId.required()
});

// Guest cart preview. The cookie carries SKUs + the buyer's selections only —
// never a price. Capped, because each line drives an 11-lookup aggregation.
// NOTE: `validate` runs with stripUnknown:true, so every field a client may
// send must be declared here or it is silently dropped.
export const previewCartSchema = Joi.object({
    items: Joi.array().max(50).items(
        Joi.object({
            sku: Joi.string().trim().max(100).allow('').optional(),
            // Cookies written before the SKU-only change carry a product id
            // instead. Accept either, so a returning guest's cart survives.
            jeweleryId: optionalObjectIdOrEmpty,
            qty: Joi.number().integer().min(1).max(99).optional(),
            sizeId: optionalObjectIdOrEmpty,
            origin: Joi.string().allow('', null).optional(),
            color: Joi.string().allow('', null).optional(),
            clarity: Joi.string().allow('', null).optional(),
            engraving: Joi.number().integer().min(0).max(1).optional(),
            engravingText: Joi.string().allow('', null).max(100).optional(),
        }).or('sku', 'jeweleryId')
    ).default([]),
    // Optional promo code so a guest cart can preview a PUBLIC coupon's discount.
    // Final redemption (per-user / assignee limits) is still enforced at order
    // placement, which requires login.
    coupon: Joi.string().trim().max(100).allow('', null).optional(),
});

export const moveFailedOrderToCartSchema = Joi.object({
    orderId: objectId.required()
});
