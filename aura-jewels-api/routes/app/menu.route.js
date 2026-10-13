import express from "express";
import { get_storefront_menu } from "../../controllers/app/menu.controller.js";

const router = express.Router();

// Public — no auth, no validation. Storefront fetches this once per page
// load (or once at app boot) to render the mega menu.
router.get("/", get_storefront_menu);

export default router;
