import Action from "./permissionAction.constant.js";
import Constant from "./user.constant.js";

// The single source of truth for the admin RBAC. Each module groups the raw
// action strings by capability (view / create / update / delete / other). The
// admin "Roles & Permissions" matrix, the default-seed, and the frontend
// sidebar gating are all derived from this — so a role can be granted VIEW
// (read for reference / filters) WITHOUT create/update/delete, exactly as
// required.
//
// `view` actions decide whether the module's menu item is visible.

const R = Constant.ROLES;

export const PERMISSION_MODULES = [
    {
        key: "dashboard", label: "Dashboard",
        view: [Action.DASHBOARD_VIEW],
    },
    {
        key: "products", label: "Products (Jewellery)",
        view: [Action.PRODUCT_LIST, Action.PRODUCT_DETAIL],
        create: [Action.PRODUCT_CREATE],
        update: [Action.PRODUCT_UPDATE, Action.PRODUCT_UPDATE_STATUS],
        delete: [Action.PRODUCT_DELETE],
        other: [{ action: Action.PRODUCT_IMPORT, label: "Import" }, { action: Action.PRODUCT_EXPORT, label: "Export" }, { action: Action.PRODUCT_REPORT, label: "Generate Report" }],
    },
    {
        key: "categories", label: "Categories",
        view: [Action.CATEGORY_LIST], create: [Action.CATEGORY_CREATE],
        update: [Action.CATEGORY_UPDATE, Action.CATEGORY_UPDATE_STATUS], delete: [Action.CATEGORY_DELETE],
    },
    {
        key: "collections", label: "Collections",
        view: [Action.COLLECTION_LIST], create: [Action.COLLECTION_CREATE],
        update: [Action.COLLECTION_UPDATE, Action.COLLECTION_UPDATE_STATUS], delete: [Action.COLLECTION_DELETE],
    },
    {
        key: "tags", label: "Tags",
        view: [Action.TAG_LIST], create: [Action.TAG_CREATE],
        update: [Action.TAG_UPDATE, Action.TAG_UPDATE_STATUS], delete: [Action.TAG_DELETE],
    },
    {
        key: "pricing", label: "Metal / Charges / Stone Groups",
        view: [Action.METAL_TYPE_LIST, Action.METAL_STAMP_LIST, Action.LABOUR_CHARGE_LIST, Action.OTHER_CHARGE_LIST, Action.STONE_GROUP_LIST],
        create: [Action.METAL_TYPE_CREATE, Action.METAL_STAMP_CREATE, Action.LABOUR_CHARGE_CREATE, Action.OTHER_CHARGE_CREATE, Action.STONE_GROUP_CREATE],
        update: [
            Action.METAL_TYPE_UPDATE, Action.METAL_STAMP_UPDATE, Action.LABOUR_CHARGE_UPDATE,
            Action.OTHER_CHARGE_UPDATE, Action.STONE_GROUP_UPDATE,
            // status toggles are enforced by their own actions on the routes
            Action.METAL_TYPE_UPDATE_STATUS, Action.LABOUR_CHARGE_UPDATE_STATUS, Action.STONE_GROUP_UPDATE_STATUS,
        ],
        delete: [Action.METAL_TYPE_DELETE, Action.METAL_STAMP_DELETE, Action.LABOUR_CHARGE_DELETE, Action.OTHER_CHARGE_DELETE],
        other: [{ action: Action.STONE_GROUP_IMPORT, label: "Import Stone Groups" }],
    },
    {
        key: "sizes", label: "Size Master",
        view: [Action.SIZE_LIST], create: [Action.SIZE_CREATE],
        update: [Action.SIZE_UPDATE, Action.SIZE_UPDATE_STATUS], delete: [Action.SIZE_DELETE],
    },
    {
        key: "orders", label: "Orders",
        view: [Action.ORDER_LIST, Action.ORDER_DETAIL],
        update: [Action.ORDER_UPDATE_STATUS, Action.ORDER_UPDATE_TRACKING],
        other: [{ action: Action.ORDER_PAYMENT_STATUS, label: "Mark Paid / Payment link" }],
    },
    {
        key: "customOrders", label: "Custom Orders",
        view: [Action.CUSTOM_ORDER_LIST], update: [Action.CUSTOM_ORDER_UPDATE],
        other: [{ action: Action.CUSTOM_ORDER_PAYMENT, label: "Quote / Payment link" }],
    },
    {
        key: "inquiries", label: "Order Inquiries",
        view: [Action.ORDER_INQUIRY_LIST], update: [Action.ORDER_INQUIRY_UPDATE],
    },
    {
        key: "contactInquiries", label: "Contact Inquiries",
        view: [Action.CONTACT_INQUIRY_LIST], update: [Action.CONTACT_INQUIRY_UPDATE],
    },
    {
        key: "coupons", label: "Coupons & Offers",
        view: [Action.COUPON_LIST], create: [Action.COUPON_CREATE],
        update: [Action.COUPON_UPDATE], delete: [Action.COUPON_DELETE],
    },
    {
        key: "customers", label: "Customers",
        view: [Action.CUSTOMER_LIST, Action.CUSTOMER_DETAIL], create: [Action.CUSTOMER_CREATE],
        update: [Action.CUSTOMER_UPDATE, Action.CUSTOMER_UPDATE_STATUS], delete: [Action.CUSTOMER_DELETE],
    },
    {
        key: "customerGroups", label: "Customer Groups",
        view: [Action.CUSTOMER_GROUP_LIST, Action.CUSTOMER_GROUP_DETAIL],
        create: [Action.CUSTOMER_GROUP_CREATE],
        update: [Action.CUSTOMER_GROUP_UPDATE],
        delete: [Action.CUSTOMER_GROUP_DELETE],
    },
    {
        key: "cms", label: "CMS (Home / Menu / Pages)",
        view: [Action.CMS_VIEW], update: [Action.CMS_UPDATE],
    },
    {
        key: "activityLog", label: "Activity Log",
        view: [Action.ACTIVITY_LOG_LIST, Action.ACTIVITY_LOG_DETAIL],
    },
    {
        key: "settings", label: "Settings & Payment Gateway",
        view: [Action.SETTINGS_VIEW], update: [Action.SETTINGS_UPDATE],
    },
    {
        key: "staff", label: "Staff",
        view: [Action.STAFF_LIST], create: [Action.STAFF_CREATE],
        update: [Action.STAFF_UPDATE, Action.STAFF_UPDATE_STATUS], delete: [Action.STAFF_DELETE],
    },
    {
        key: "permissions", label: "Roles & Permissions",
        view: [Action.PERMISSION_VIEW], update: [Action.PERMISSION_UPDATE],
    },
];

// Flatten every action string in the catalog (for validation + "grant all").
export const ALL_ACTIONS = [...new Set(
    PERMISSION_MODULES.flatMap((m) => [
        ...(m.view || []), ...(m.create || []), ...(m.update || []), ...(m.delete || []),
        ...((m.other || []).map((o) => o.action)),
    ])
)];

// Sensible defaults seeded on first run (admins can then edit in the UI).
// Super Admin is implicit — it bypasses all checks and is never stored/edited.
export const DEFAULT_ROLE_PERMISSIONS = {
    [R.ADMIN]: ALL_ACTIONS.filter((a) => a !== Action.PERMISSION_UPDATE), // everything except editing RBAC itself
    [R.SALES]: [
        Action.DASHBOARD_VIEW,
        Action.ORDER_LIST, Action.ORDER_DETAIL, Action.ORDER_UPDATE_STATUS, Action.ORDER_UPDATE_TRACKING,
        Action.CUSTOM_ORDER_LIST, Action.CUSTOM_ORDER_UPDATE,
        Action.ORDER_INQUIRY_LIST, Action.ORDER_INQUIRY_UPDATE,
        Action.CONTACT_INQUIRY_LIST, Action.CONTACT_INQUIRY_UPDATE,
        Action.CUSTOMER_LIST, Action.CUSTOMER_DETAIL,
        Action.CUSTOMER_GROUP_LIST, Action.CUSTOMER_GROUP_DETAIL,
        Action.COUPON_LIST,
        // read-for-reference so filters/lookups work, but no editing:
        Action.PRODUCT_LIST, Action.PRODUCT_DETAIL, Action.CATEGORY_LIST, Action.COLLECTION_LIST, Action.TAG_LIST,
    ],
    [R.INVENTORY]: [
        Action.DASHBOARD_VIEW,
        Action.PRODUCT_LIST, Action.PRODUCT_DETAIL, Action.PRODUCT_CREATE, Action.PRODUCT_UPDATE, Action.PRODUCT_UPDATE_STATUS, Action.PRODUCT_IMPORT, Action.PRODUCT_EXPORT,
        Action.CATEGORY_LIST, Action.COLLECTION_LIST, Action.TAG_LIST,
        Action.METAL_TYPE_LIST, Action.METAL_STAMP_LIST, Action.LABOUR_CHARGE_LIST, Action.OTHER_CHARGE_LIST, Action.STONE_GROUP_LIST,
        Action.ORDER_LIST, Action.ORDER_DETAIL,
    ],
};
