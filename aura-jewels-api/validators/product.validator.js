import Joi from 'joi';
import { objectId, objectIdArray } from './common.validator.js';

export const productListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),

    metalType: objectIdArray.optional(),
    metalStamp: objectIdArray.optional(),
    metals: objectIdArray.optional(),

    shape: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    shapes: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    category: Joi.array().items(Joi.string()).optional(),
    // Path-derived slugs sent by the scoped pages — `/category/<slug>`
    // and `/collection/<slug>`. Both were missing before and Joi's
    // `stripUnknown` was silently dropping `collectionSlug`, which made
    // empty collections render the whole catalog.
    categorySlug: Joi.string().trim().allow('').optional(),
    collectionSlug: Joi.string().trim().allow('').optional(),
    subCategorySlug: Joi.string().trim().allow('').optional(),

    // Style filter — array of subcategory _ids or slugs. Applied by both the
    // subcategory-as-filter route (`/category/<sub-slug>`) and the
    // Style group in the sidebar.
    subCategory: Joi.array().items(Joi.string()).optional(),

    // Free-text search box (top nav search submits to the list page).
    search: Joi.string().trim().allow('').optional(),

    minWeight: Joi.number().min(0).optional(),
    maxWeight: Joi.number().min(0).optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),

    // Gender chips (canonical keys women/men/couple/unisex) — the service maps
    // these onto the stored enum values. Was being stripped by stripUnknown.
    gender: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),

    sortPrice: Joi.string().valid('lowToHigh', 'highToLow').optional(),

    collectionId: Joi.array().items(Joi.string()).optional(),
    tags: objectIdArray.optional(),

    // Explicit product ids — used by CMS-curated sections (e.g. Signature
    // Showcase) to fetch exactly the admin-picked products. Declared so
    // stripUnknown keeps it.
    ids: objectIdArray.optional(),
    lastNDays: Joi.number().integer().min(0).optional()
});

export const productSlugParamSchema = Joi.object({
    slug: Joi.string().trim().min(1).required()
});
export const productIdParamSchema = Joi.object({
    id: Joi.string().trim().min(1).required()
});
export const calculatePriceSchema = Joi.object({
    productId: objectId.required(),
    size: objectId.required()
});
