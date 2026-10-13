import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    addToCartSchema,
    removeFromCartSchema,
    moveToWishlistSchema,
    updateCartItemSchema,
    previewCartSchema,
    moveFailedOrderToCartSchema
} from "../../validators/cart.validator.js";
import {
    addToCart,
    getCartList,
    removeFromCart,
    moveToWishlist,
    cartWishlistCount,
    getCheckout,
    updateCartItem,
    previewCart,
    moveFailedOrderToCart
} from "../../controllers/app/cart.controller.js";
import { verifyToken } from "../../utils/verifyToken.js";
import { restrictNonIndianCustomer } from "../../middlewares/checkIndianCustomer.middleware.js";

const route = express.Router();
const checkIndia = restrictNonIndianCustomer("Cart services are currently limited to Indian customers.");

// PUBLIC: guest cart pricing. Stateless — writes nothing. Deliberately without
// verifyToken/checkIndia (both require an authenticated user), because the
// guest cookie holds SKUs only and prices must come from the server.
route.post("/preview", [validate(previewCartSchema)], previewCart);

route.post("/addToCart", [verifyToken, checkIndia, validate(addToCartSchema)], addToCart);

route.post("/removeCart", [verifyToken, checkIndia, validate(removeFromCartSchema)], removeFromCart);

route.get("/getCartlist", [verifyToken, checkIndia], getCartList);

route.post("/moveToWishlist", [verifyToken, checkIndia, validate(moveToWishlistSchema)], moveToWishlist);

route.get("/cartWishlistCount", [verifyToken, checkIndia], cartWishlistCount);

route.get("/getCheckout", [verifyToken, checkIndia], getCheckout);

// Update ring size and/or quantity for an existing cart item
route.post("/updateCartItem", [verifyToken, checkIndia, validate(updateCartItemSchema)], updateCartItem);

// Move failed order to cart
route.post("/moveFailedOrderToCart", [verifyToken, checkIndia, validate(moveFailedOrderToCartSchema)], moveFailedOrderToCart);

export default route;
