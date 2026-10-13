import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createOfferSchema, parseMultipartJson, updateOfferSchema } from "../validators/offer.validator.js";
import { idParamSchema } from "../validators/common.validator.js";
import { addOffer, updateOffer, getOffers, deleteOffer, updateOfferStatus, getOfferProducts, getProductListForOffer, syncOffers } from "../controllers/offer.controller.js";

const route = express.Router();

route.post("/getOfferList", [verifyToken, authorize(Action.COUPON_LIST)], getOffers);
route.post("/addOffer", [verifyToken, authorize(Action.COUPON_CREATE), parseMultipartJson, validate(createOfferSchema)], addOffer);
route.put("/updateOffer/:id", [verifyToken, authorize(Action.COUPON_UPDATE), parseMultipartJson, validate(idParamSchema, "params"), validate(updateOfferSchema)], updateOffer);
route.get("/deleteOffer/:id", [verifyToken, authorize(Action.COUPON_DELETE), validate(idParamSchema, "params")], deleteOffer);
route.post("/updateOfferStatus/:id", [verifyToken, authorize(Action.COUPON_UPDATE), validate(idParamSchema, "params")], updateOfferStatus);
route.get("/getOfferAppliedProducts/:id", [verifyToken, authorize(Action.COUPON_LIST), validate(idParamSchema, "params")], getOfferProducts);
route.post("/getProductList", [verifyToken, authorize(Action.COUPON_LIST)], getProductListForOffer);
route.post("/syncOffers", [verifyToken, authorize(Action.COUPON_UPDATE)], syncOffers);
export default route;