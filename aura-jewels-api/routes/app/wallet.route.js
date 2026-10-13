import express from "express";
import { getWallet, getWalletTransactions } from "../../controllers/app/wallet.controller.js";
import { verifyToken } from "../../utils/verifyToken.js";

const route = express.Router();

route.get("/", [verifyToken], getWallet);
route.get("/transactions", [verifyToken], getWalletTransactions);

export default route;
