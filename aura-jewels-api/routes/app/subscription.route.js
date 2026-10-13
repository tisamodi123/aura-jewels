import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { subscribeSchema } from "../../validators/subscription.validator.js";
import { subscribeEmail, unsubscribeEmail } from "../../controllers/subscription.controller.js";

const route = express.Router();

route.post("/subscribe", [validate(subscribeSchema)], subscribeEmail);
route.post("/unsubscribe", [validate(subscribeSchema)], unsubscribeEmail);

export default route;
