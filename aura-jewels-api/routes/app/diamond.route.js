import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { diamondListSchema } from "../../validators/diamond.validator.js";
import { diamondList } from "../../controllers/app/diamond.controller.js";

const route = express.Router();

route.post("/getAllList", [validate(diamondListSchema)], diamondList);

export default route;
 