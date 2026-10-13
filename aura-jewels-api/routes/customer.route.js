import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
    addCustomerSchema,
    updateCustomerSchema,
    listCustomerSchema,
    customerGroupSchema,
    listCustomerGroupSchema
} from "../validators/customer.validator.js";
import {
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    updateCustomerStatus,
    addCustomer,
    getAssigneeList,
    verifyCustomer
} from "../controllers/customer.controller.js";
import {
    createCustomerGroup,
    getCustomerGroup,
    getCustomerGroupById,
    updateCustomerGroup,
    deleteCustomerGroup,
    getCustomerGroupDropdown
} from "../controllers/customerGroup.controller.js";

const route = express.Router();

// Customers
route.post(
    "/getCustomer",
    [verifyToken, authorize(Action.CUSTOMER_LIST), validate(listCustomerSchema)],
    getCustomers
);
route.post(
    "/createCustomer",
    [verifyToken, authorize(Action.CUSTOMER_CREATE), validate(addCustomerSchema), activityLogger("customer", "CREATE")],
    addCustomer
);
route.get(
    "/getCustomerById/:id",
    [verifyToken, authorize(Action.CUSTOMER_DETAIL), validate(idParamSchema, "params")],
    getCustomerById
);
route.put(
    "/updateCustomer/:id",
    [verifyToken, authorize(Action.CUSTOMER_UPDATE), validate(idParamSchema, "params"), validate(updateCustomerSchema), activityLogger("customer", "UPDATE")],
    updateCustomer
);
route.delete(
    "/deleteCustomer/:id",
    [verifyToken, authorize(Action.CUSTOMER_DELETE), validate(idParamSchema, "params"), activityLogger("customer", "DELETE")],
    deleteCustomer
);
route.patch(
    "/updateCustomerStatus/:id",
    [verifyToken, authorize(Action.CUSTOMER_UPDATE_STATUS), validate(idParamSchema, "params"), activityLogger("customer", "UPDATE_STATUS")],
    updateCustomerStatus
);

// Verify a customer (email + phone), promoting PENDING -> ACTIVE. The admin
// list's "Verify" action used to call this path against a route that never
// existed here (404).
route.put(
    "/verifyCustomer/:id",
    [verifyToken, authorize(Action.CUSTOMER_UPDATE_STATUS), validate(idParamSchema, "params"), activityLogger("customer", "UPDATE_STATUS")],
    verifyCustomer
);

route.get("/getAssigneeList", [verifyToken, authorize(Action.CUSTOMER_LIST)], getAssigneeList);

// Groups
route.post(
    "/createCustomerGroup",
    [verifyToken, authorize(Action.CUSTOMER_GROUP_CREATE), validate(customerGroupSchema), activityLogger("customerGroup", "CREATE")],
    createCustomerGroup
);
route.post(
    "/getCustomerGroup",
    [verifyToken, authorize(Action.CUSTOMER_GROUP_LIST), validate(listCustomerGroupSchema)],
    getCustomerGroup
);
route.get(
    "/getCustomerGroupById/:id",
    [verifyToken, authorize(Action.CUSTOMER_GROUP_DETAIL), validate(idParamSchema, "params")],
    getCustomerGroupById
);
route.put(
    "/updateCustomerGroup/:id",
    [verifyToken, authorize(Action.CUSTOMER_GROUP_UPDATE), validate(idParamSchema, "params"), validate(customerGroupSchema), activityLogger("customerGroup", "UPDATE")],
    updateCustomerGroup
);
route.delete(
    "/deleteCustomerGroup/:id",
    [verifyToken, authorize(Action.CUSTOMER_GROUP_DELETE), validate(idParamSchema, "params"), activityLogger("customerGroup", "DELETE")],
    deleteCustomerGroup
);
// Admin-only dropdown (used by the add/update customer forms). This previously
// had no auth middleware at all, exposing customer groups publicly.
route.get("/getCustomerGroupDropdown", [verifyToken, authorize(Action.CUSTOMER_GROUP_LIST)], getCustomerGroupDropdown);

export default route;
