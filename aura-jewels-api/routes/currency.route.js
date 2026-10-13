import express from "express";
import {
  getCurrency,
  addCurrency,
  updateCurrency,
  updateCurrencyStatus,
  deleteCurrency,
  setDefaultCurrency
} from "../controllers/currency.controller.js";

const router = express.Router();

router.get("/getCurrency", getCurrency);
router.post("/addCurrency", addCurrency);
router.put("/updateCurrency/:id", updateCurrency);
router.delete("/deleteCurrency/:id", deleteCurrency);
router.put("/updateCurrencyStatus/:id", updateCurrencyStatus);
router.put("/setDefaultCurrency/:id", setDefaultCurrency);

export default router;
