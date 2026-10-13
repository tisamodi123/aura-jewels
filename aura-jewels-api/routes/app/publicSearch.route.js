import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { publicSearchQuerySchema } from "../../validators/search.validator.js";
import {
    searchCategoriesAndCollections,
    searchProducts
} from "../../controllers/app/search.controller.js";

const router = express.Router();

router.get("/categories-collections", [validate(publicSearchQuerySchema, "query")], searchCategoriesAndCollections);
router.get("/products", [validate(publicSearchQuerySchema, "query")], searchProducts);

export default router;
