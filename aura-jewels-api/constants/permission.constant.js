import Constant from "../constants/user.constant.js"
import Action from "../constants/permissionAction.constant.js"

export const featuredList = {
    // STAFF MANAGEMENT (Admin Panel)
    [Action.STAFF_CREATE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.STAFF_LIST]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.STAFF_UPDATE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.STAFF_DELETE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.STAFF_UPDATE_STATUS]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],

    // CUSTOMER MANAGEMENT (Admin Panel)
    [Action.CUSTOMER_LIST]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES],
    [Action.CUSTOMER_CREATE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.CUSTOMER_DETAIL]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES],
    [Action.CUSTOMER_UPDATE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.CUSTOMER_DELETE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.CUSTOMER_UPDATE_STATUS]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],

    [Action.CUSTOMER_GROUP_CREATE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES],
    [Action.CUSTOMER_GROUP_LIST]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES],
    [Action.CUSTOMER_GROUP_DETAIL]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES],
    [Action.CUSTOMER_GROUP_UPDATE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.CUSTOMER_GROUP_DELETE]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],

    [Action.ACTIVITY_LOG_LIST]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],
    [Action.ACTIVITY_LOG_DETAIL]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN],

    // ORDER MANAGEMENT (Admin Panel) — customers are never allowed here.
    [Action.ORDER_LIST]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES, Constant.ROLES.INVENTORY],
    [Action.ORDER_DETAIL]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES, Constant.ROLES.INVENTORY],
    [Action.ORDER_UPDATE_STATUS]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES, Constant.ROLES.INVENTORY],
    [Action.ORDER_UPDATE_TRACKING]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES, Constant.ROLES.INVENTORY],
    // Marking an order paid is money-sensitive — admins only.
    [Action.ORDER_PAYMENT_STATUS]: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN]
};