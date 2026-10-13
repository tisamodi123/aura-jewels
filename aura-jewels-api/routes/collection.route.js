import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateUploadedMimeTypes } from "../middlewares/uploadValidation.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    createCollectionSchema,
    updateCollectionSchema,
    listCollectionSchema
} from "../validators/collection.validator.js";
import {
    add_collection,
    delete_collection,
    get_collection,
    get_collection_by_id,
    update_collection,
    update_collection_status
} from "../controllers/collection.controller.js";

const route = express.Router();

route.post(
    "/addCollection",
    [verifyToken, authorize(Action.COLLECTION_CREATE), validateUploadedMimeTypes(), validate(createCollectionSchema), activityLogger("collection", "CREATE")],
    add_collection
);

route.post(
    "/getCollection",
    [verifyToken, authorize(Action.COLLECTION_LIST), validate(listCollectionSchema)],
    get_collection
);

// Detail endpoint — full doc with pageBanner + interProductBanners.
// Called by the admin edit modal so the list endpoint can stay slim.
route.get(
    "/getCollectionById/:id",
    [verifyToken, authorize(Action.COLLECTION_LIST), validate(idParamSchema, "params")],
    get_collection_by_id
);

route.put(
    "/updateCollection/:id",
    [verifyToken, authorize(Action.COLLECTION_UPDATE), validate(idParamSchema, "params"), validateUploadedMimeTypes(), validate(updateCollectionSchema), activityLogger("collection", "UPDATE")],
    update_collection
);

route.delete(
    "/deleteCollection/:id",
    [verifyToken, authorize(Action.COLLECTION_DELETE), validate(idParamSchema, "params"), activityLogger("collection", "DELETE")],
    delete_collection
);

route.patch(
    "/updateCollectionStatus/:id",
    [verifyToken, authorize(Action.COLLECTION_UPDATE_STATUS), validate(idParamSchema, "params"), activityLogger("collection", "UPDATE_STATUS")],
    update_collection_status
);

export default route;
