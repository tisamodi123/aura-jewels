import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createCategorySchema,
    updateCategorySchema,
    listCategorySchema
} from "../validators/category.validator.js";
import {
    create_category,
    delete_category,
    get_category,
    get_category_by_id,
    update_category,
    update_category_status,
    get_category_tree
} from "../controllers/category.controller.js";

const route = express.Router();

route.post(
    "/createCategory",
    [verifyToken, authorize(Action.CATEGORY_CREATE), validate(createCategorySchema), activityLogger("category", "CREATE")],
    create_category
);

route.post(
    "/getCategoryList",
    [verifyToken, authorize(Action.CATEGORY_LIST), validate(listCategorySchema)],
    get_category
);

route.put(
    "/updateCategory/:id",
    [verifyToken, authorize(Action.CATEGORY_UPDATE), validate(idParamSchema, "params"), validate(updateCategorySchema), activityLogger("category", "UPDATE")],
    update_category
);

route.delete(
    "/deleteCategory/:id",
    [verifyToken, authorize(Action.CATEGORY_DELETE), validate(idParamSchema, "params"), activityLogger("category", "DELETE")],
    delete_category
);

route.patch(
    "/updateCategoryStatus/:id",
    [verifyToken, authorize(Action.CATEGORY_UPDATE_STATUS), validate(idParamSchema, "params"), activityLogger("category", "UPDATE_STATUS")],
    update_category_status
);

route.get("/getCategoryTree", [verifyToken, authorize(Action.CATEGORY_LIST)], get_category_tree);

// Detail endpoint — full doc with pageBanner, banners, side cards, tags.
// Called by the admin edit modal so the list endpoint can stay slim.
route.get(
    "/getCategoryById/:id",
    [verifyToken, authorize(Action.CATEGORY_LIST), validate(idParamSchema, "params")],
    get_category_by_id
);

export default route;
