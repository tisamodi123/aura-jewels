import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { getStatesSchema, getCitiesSchema } from "../validators/country.validator.js";
import { getCountries, getStates, getCities } from "../controllers/country.controller.js";

const route = express.Router();

route.get("/getCountry", getCountries);
route.post("/getState", [validate(getStatesSchema)], getStates);
route.post("/getCity", [validate(getCitiesSchema)], getCities);

export default route;
