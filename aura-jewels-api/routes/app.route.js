import { Router } from "express";
import userRoute from "./app/user.route.js"
import addressRoute from "./app/address.route.js"
import productRoute from "./app/product.route.js"
import cartRoute from "./app/cart.route.js"
import wishlistRoute from "./app/wishlist.route.js"
import orderRoute from "./app/order.route.js"
import homeRoute from "./app/home.route.js"
import menuRoute from "./app/menu.route.js"
import offerRoute from "./app/offer.route.js"
import couponRoute from "./app/coupon.route.js"
import inquiryRoute from "./app/orderInquiry.route.js"
import contactInquiryRoute from "./app/contactInquiry.route.js"
import walletRoute from "./app/wallet.route.js"
import paymentRoute from "./app/payment.route.js"
import countryRoute from "./country.route.js"
import subscriptionRoute from "./app/subscription.route.js"
import diamondRoute from "./app/diamond.route.js"
import trackRoute from "./app/track.route.js"

class adminRoute {
  router = Router;
  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.use("/auth", userRoute);
    this.router.use("/addresses", addressRoute);
    this.router.use("/products", productRoute);
    this.router.use("/cart", cartRoute);
    this.router.use("/wishlist", wishlistRoute);
    this.router.use("/order", orderRoute);
    this.router.use("/home", homeRoute);
    this.router.use("/menu", menuRoute);
    this.router.use("/offer", offerRoute);
    this.router.use("/coupon", couponRoute);
    this.router.use("/orderInquiry", inquiryRoute);
    this.router.use("/contactInquiry", contactInquiryRoute);
    this.router.use("/wallet", walletRoute);
    this.router.use("/payment", paymentRoute);
    this.router.use("/country", countryRoute);
    this.router.use("/state", countryRoute);
    this.router.use("/city", countryRoute);
    this.router.use("/subscription", subscriptionRoute);
    this.router.use("/diamond", diamondRoute);
    // this.router.use("/track", trackRoute);
  }
}

export default new adminRoute().router;