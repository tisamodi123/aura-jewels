import express from "express";
import { get_offer_by_slug } from "../../controllers/app/offer.controller.js";

const router = express.Router();

// Public — storefront offer landing page. slug | code | id all accepted.
router.get("/:slug", get_offer_by_slug);

export default router;
