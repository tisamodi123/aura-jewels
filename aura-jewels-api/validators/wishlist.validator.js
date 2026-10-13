import Joi from 'joi';

const objectId = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Must be a valid ObjectId'
});

export const addToWishlistSchema = Joi.object({
    jeweleryId: objectId.required(),
    // Mirror cart: non-sized categories submit empty sizeId.
    sizeId: objectId.allow('', null).optional(),
    engraving: Joi.number().integer().min(0).max(1).default(0),
    engravingText: Joi.string().allow('').max(100).default(''),
    // Selected center-stone quality/origin (else stripUnknown drops them).
    origin: Joi.string().allow('', null).optional(),
    color: Joi.string().allow('', null).optional(),
    clarity: Joi.string().allow('', null).optional(),
    checkoutCurrency: Joi.string().allow('', null).optional(),
});

// Remove exactly one line. `wishlistId` names it unambiguously; `jeweleryId`
// plus the selection is the fallback for older clients. validate.middleware runs
// with stripUnknown, so every field the client may send must be declared here.
export const removeFromWishlistSchema = Joi.object({
    wishlistId: objectId.optional(),
    jeweleryId: objectId.optional(),
    sizeId: objectId.allow('', null).optional(),
    origin: Joi.string().allow('', null).optional(),
    color: Joi.string().allow('', null).optional(),
    clarity: Joi.string().allow('', null).optional(),
}).or('wishlistId', 'jeweleryId');

export const moveToCartSchema = Joi.object({
    wishlistId: objectId.required()
});

// Guest wishlist preview. The cookie carries SKUs + selections only — never a
// price. Capped, because each line drives a 6-lookup aggregation.
export const previewWishlistSchema = Joi.object({
    items: Joi.array().max(50).items(
        Joi.object({
            sku: Joi.string().trim().max(100).allow('').optional(),
            // Legacy cookies carry a product id instead of a SKU.
            jeweleryId: objectId.allow('', null).optional(),
            origin: Joi.string().allow('', null).optional(),
            color: Joi.string().allow('', null).optional(),
            clarity: Joi.string().allow('', null).optional(),
            sizeId: objectId.allow('', null).optional(),
        }).or('sku', 'jeweleryId')
    ).default([])
});
