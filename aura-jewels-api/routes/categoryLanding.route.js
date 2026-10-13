import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { validate } from '../middlewares/validate.middleware.js';
import { activityLogger } from '../middlewares/activityLog.middleware.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
    createCategoryLandingSection,
    CategoryLandingdeleteSection,
    getCategoryLandingSection,
    updateCategoryLandingSection,
    updateStatusSection,
    getcategoryMostEngagementRing,
} from '../controllers/categoryLanding.controller.js';
import {
    createCategoryLandingSchema,
    updateCategoryLandingSchema,
    getCategoryLandingListSchema,
} from '../validators/categoryLanding.validator.js';

const route = express.Router();

route.post(
    '/section/create',
    [verifyToken, authorize(Action.CMS_UPDATE), validate(createCategoryLandingSchema), activityLogger('categoryLanding', 'CREATE')],
    createCategoryLandingSection
);

route.post(
    '/section/getList',
    [verifyToken, authorize(Action.CMS_VIEW), validate(getCategoryLandingListSchema)],
    getCategoryLandingSection
);

route.put(
    '/section/update/:id',
    [verifyToken, authorize(Action.CMS_UPDATE), validate(idParamSchema, 'params'), validate(updateCategoryLandingSchema), activityLogger('categoryLanding', 'UPDATE')],
    updateCategoryLandingSection
);

route.put(
    '/section/updateStatus/:id',
    [verifyToken, authorize(Action.CMS_UPDATE), validate(idParamSchema, 'params'), activityLogger('categoryLanding', 'UPDATE_STATUS')],
    updateStatusSection
);

route.delete(
    '/section/delete/:id',
    [verifyToken, authorize(Action.CMS_UPDATE), validate(idParamSchema, 'params'), activityLogger('categoryLanding', 'DELETE')],
    CategoryLandingdeleteSection
);

route.get(
    '/section/getcategoryMostEngagementRing/:categoryId',
    [verifyToken, authorize(Action.CMS_VIEW), validate(idParamSchema, 'params')],
    getcategoryMostEngagementRing
);

export default route;
