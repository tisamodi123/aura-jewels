import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    addToWishlistSchema,
    removeFromWishlistSchema,
    moveToCartSchema,
    previewWishlistSchema
} from "../../validators/wishlist.validator.js";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    moveToCart,
    previewWishlist
} from "../../controllers/app/wishlist.controller.js";
import { verifyToken } from "../../utils/verifyToken.js";
import restrictNonIndianCustomer from "../../middlewares/checkIndianCustomer.middleware.js";

const route = express.Router();

// PUBLIC: guest wishlist pricing. Stateless — writes nothing.
route.post("/preview", [validate(previewWishlistSchema)], previewWishlist);

route.post("/addToWishlist", [verifyToken, validate(addToWishlistSchema)], addToWishlist);

route.post("/removeWishlist", [verifyToken, validate(removeFromWishlistSchema)], removeFromWishlist);

route.get("/getWishlist", [verifyToken], getWishlist);

route.post("/moveTocart", [verifyToken, restrictNonIndianCustomer("Ordering services are currently limited to Indian customers."), validate(moveToCartSchema)], moveToCart);

export default route;
