import express from "express";
import { get_home_payload, getCategoryLandingPageData, get_home_section_payload, get_home_sections_order } from "../../controllers/homeSection.controller.js";
import { getPublicOfferPopup } from "../../controllers/offerPopup.controller.js";

const route = express.Router();

route.get("/", get_home_payload);
route.get("/order", get_home_sections_order);
// Progressive: fetch exactly one section by its CMS key. Used by the storefront
// to load sections independently so the page can render above-the-fold content
// immediately while below-the-fold sections stream in.
route.get("/section/:key", get_home_section_payload);
route.post("/getCategoryLandingPageData", getCategoryLandingPageData);
// Public: first-visit "Today's Offer" popup config for the storefront.
route.get("/offer-popup", getPublicOfferPopup);

export default route;
