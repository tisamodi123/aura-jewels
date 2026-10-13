import express from "express";
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
} from "../../controllers/app/user.controller.js";
import { verifyToken } from "../../utils/verifyToken.js";

const route = express.Router();

// ---- Addresses (authenticated) --------------------------------------------
route.get("/", [verifyToken], getAddresses);
route.post("/", [verifyToken], addAddress);
route.put("/:addressId", [verifyToken], updateAddress);
route.delete("/:addressId", [verifyToken], deleteAddress);

export default route;
