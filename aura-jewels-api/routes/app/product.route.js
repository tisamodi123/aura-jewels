import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    productListSchema,
    productSlugParamSchema,
    calculatePriceSchema,
    productIdParamSchema
} from "../../validators/product.validator.js";
import {
    productDetails,
    productDetailsV2,
    productList,
    productListV2,
    get_product_price_for_size,
    getRecommendations,
    getProductsByTags
} from "../../controllers/app/product.controller.js";

const route = express.Router();

route.post("/getAllList", [validate(productListSchema)], productList);
route.post("/getAllListV2", [validate(productListSchema)], productListV2);

route.post("/getProductsByTags", getProductsByTags);

route.get("/productDetails/:slug", [validate(productSlugParamSchema, "params")], productDetails);
route.get("/productDetailsV2/:slug", [validate(productSlugParamSchema, "params")], productDetailsV2);

route.post("/calculatePrice", [validate(calculatePriceSchema)], get_product_price_for_size);

route.get("/getRecommendations/:id", [validate(productIdParamSchema, "params")], getRecommendations);

export default route;
