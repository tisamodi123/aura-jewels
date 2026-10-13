import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../validators/auth.validator.js";
import {
    adminLogin,
    adminForgotPassword,
    adminResetPassword
} from "../controllers/auth.controller.js";

const route = express.Router();

route.post("/login", [validate(loginSchema)], adminLogin);

route.post("/forgotPassword", [validate(forgotPasswordSchema)], adminForgotPassword);

route.post("/resetPassword", [validate(resetPasswordSchema)], adminResetPassword);

export default route;
