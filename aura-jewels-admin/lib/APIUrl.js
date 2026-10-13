export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const ASSET_URL = process.env.NEXT_PUBLIC_BACK_END_ASSET_URL;
export const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;
export const PREFIX = process.env.NEXT_PUBLIC_ASSET_PREFIX;
export const JEWELLERY_IMAGE_PATH = process.env.NEXT_PUBLIC_JEWELLERY_IMAGE_PATH;
export const JEWELLERY_VIDEO_PATH = process.env.NEXT_PUBLIC_JEWELLERY_VIDEO_PATH;

const API_ADMIN_BASE_URL = `${API_BASE_URL}custom/admin/`

export const noImgFound = PREFIX
  ? `${PREFIX}/noImage2.jpg`
  : "/noImage2.jpg";

export const API_URL = {
  LOGIN: `${API_BASE_URL}auth/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}auth/forgotPassword`,
  RESET_PASSWORD: `${API_BASE_URL}auth/resetPassword`,

  // SMS gateway (OTP) configuration — admin only (GET + PUT)
  SMS_CONFIG: `${API_BASE_URL}setting/sms-config`,
  // "Today's Offer" first-visit popup config — admin only (GET + PUT)
  OFFER_POPUP: `${API_BASE_URL}setting/offer-popup`,
  // SEO visibility & meta configuration — admin (GET + PUT)
  SEO_SETTING: `${API_BASE_URL}setting/seo`,
  SEO_VISIBILITY: `${API_BASE_URL}setting/seo-visibility`,

  // Payment gateway configuration — admin only (secrets stored encrypted)
  PAYMENT_GATEWAYS: `${API_BASE_URL}setting/payment-gateways`,
  SAVE_PAYMENT_GATEWAY: `${API_BASE_URL}setting/payment-gateway`,

  // Razorpay payment links (request payment for an order / bespoke order)
  ORDER_PAYMENT_LINK: (id) => `${API_BASE_URL}order/${id}/payment-link`,
  ORDER_RECONCILE_PAYMENT: (id) => `${API_BASE_URL}order/${id}/reconcile-payment`,
  ORDER_INVOICE: (id) => `${API_BASE_URL}order/${id}/invoice`,
  CUSTOM_PAYMENT_LINK: (id) => `${API_ADMIN_BASE_URL}${id}/payment-link`,

  // Dashboard API
  DASHBOARD_DATA: `${API_BASE_URL}dashboard/getDashboardData`,
  USER_CART_DATA: `${API_BASE_URL}dashboard/cartlist`,
  USER_WISHLIST_DATA: `${API_BASE_URL}dashboard/wishlist`,
  USER_DETAILS: `${API_BASE_URL}app/myAccount/get_personal_deatils`,

  //Paratype API
  PARA_TYPE_LIST: `${API_BASE_URL}paratype/getParatype`,
  PARA_TYPE_LIST_WITHOUT_TOKEN: `${API_BASE_URL}paratype/getParatypewithoutToken`,
  CREATE_PARA_TYPE: `${API_BASE_URL}paratype/createParatype`,
  UPDATE_PARA_TYPE: `${API_BASE_URL}paratype/updateParatype`,
  DELETE_PARA_TYPE: `${API_BASE_URL}paratype/deleteParatype`,
  UPDATE_PARA_TYPE_STATUS: `${API_BASE_URL}paratype/updateParatypeStatus`,

  //Parameter API
  PARAMETER_LIST: `${API_BASE_URL}parameter/getParameterList`,
  CREATE_PARAMETER: `${API_BASE_URL}parameter/createParameter`,
  UPDATE_PARAMETER: `${API_BASE_URL}parameter/updateParameter`,
  DELETE_PARAMETER: `${API_BASE_URL}parameter/deleteParameter`,
  UPDATE_PARAMETER_STATUS: `${API_BASE_URL}parameter/updateParameterStatus`,

  //Vendor API
  VENDOR_LIST: `${API_BASE_URL}vendor/getVendorList`,
  CREATE_VENDOR: `${API_BASE_URL}vendor/createVendor`,
  UPDATE_VENDOR: `${API_BASE_URL}vendor/updateVendor`,
  DELETE_VENDOR: `${API_BASE_URL}vendor/deleteVendor`,
  UPDATE_VENDOR_STATUS: `${API_BASE_URL}vendor/updateStatus`,
  EXPORT_VENDOR: `${API_BASE_URL}vendor/exportVendorExcelSheet`,

  //Selling price [ Diamond-margin ] API
  GET_SELLING_PRICE_LIST: `${API_BASE_URL}sellingPrice/getSellingPrice`,
  UPLOAD_SELLING_PRICE_FILE: `${API_BASE_URL}sellingPrice/importSellingPrice`,
  IMPORT_SELLING_PRICE_HISTORY: `${API_BASE_URL}sellingPrice/getSellingPriceHistory`,

  //Diamond API
  GET_DIAMOND_LIST: `${API_BASE_URL}diamondImport/get_diamonds_list_admin`,
  UPLOAD_DIAMOND_IMPORT_FILE: `${API_BASE_URL}diamondImport/importDiamond`,
  IMPORT_DIAMOND_HISTORY: `${API_BASE_URL}diamondImport/getDiamondImportHistory`,
  ADD_DIAMOND: `${API_BASE_URL}diamondImport/addDiamond`,
  GET_DIAMOND_DETAILS: `${API_BASE_URL}diamondImport/getDiamondDetails`,
  UPDATE_DIAMOND: `${API_BASE_URL}diamondImport/updateDiamond`,
  DELETE_DIAMOND: `${API_BASE_URL}diamondImport/deleteDiamond`,
  UPDATE_DIAMOND_STATUS: `${API_BASE_URL}diamondImport/updateDiamondStatus`,
  EXPORT_DIAMOND_FILE: `${API_BASE_URL}diamondsapi/export_diamond_sheet`,

  //Mapping API
  GET_EXCEL_HEADER: `${API_BASE_URL}mapping/getExcelFieldName`,
  SET_MAPPING: `${API_BASE_URL}mapping/setVendorMapping`,
  GET_MAPPING: `${API_BASE_URL}mapping/getVendorMapping`,

  //Category API
  CATEGORY_LIST: `${API_BASE_URL}category/getCategoryList`,
  CREATE_CATEGORY: `${API_BASE_URL}category/createCategory`,
  UPDATE_CATEGORY: `${API_BASE_URL}category/updateCategory`,
  DELETE_CATEGORY: `${API_BASE_URL}category/deleteCategory`,
  UPDATE_CATEGORY_STATUS: `${API_BASE_URL}category/updateCategoryStatus`,
  // SYNC_CATEGORY removed — pointed at category/CategorySync (404); it was a legacy "Classic" ERP sync that was never ported.

  //Collections API
  COLLECTIONS_LIST: `${API_BASE_URL}collection/getCollection`,
  CREATE_COLLECTIONS: `${API_BASE_URL}collection/addCollection`,
  UPDATE_COLLECTIONS: `${API_BASE_URL}collection/updateCollection`,
  DELETE_COLLECTIONS: `${API_BASE_URL}collection/deleteCollection`,
  UPDATE_COLLECTIONS_STATUS: `${API_BASE_URL}collection/updateCollectionStatus`,
  ADD_COLLECTION_IN_JEWELRY: `${API_BASE_URL}products/updateCollectionInJewelry`,

  //Charges API
  CHARGE_LIST: `${API_BASE_URL}charges/getCharges`,
  CREATE_CHARGE: `${API_BASE_URL}charges/addCharges`,
  UPDATE_CHARGE: `${API_BASE_URL}charges/updateCharges`,
  DELETE_CHARGE: `${API_BASE_URL}charges/deleteCharges`,
  UPDATE_CHARGE_STATUS: `${API_BASE_URL}charges/updateChargesStatus`,

  //Labour Charge API
  LABOUR_CHARGE_LIST: `${API_BASE_URL}labourCharges/getLabour`,
  CREATE_LABOUR_CHARGE: `${API_BASE_URL}labourCharges/addLabour`,
  UPDATE_LABOUR_CHARGE: `${API_BASE_URL}labourCharges/updateLabour`,
  DELETE_LABOUR_CHARGE: `${API_BASE_URL}labourCharges/deleteLabour`,
  UPDATE_LABOUR_CHARGE_STATUS: `${API_BASE_URL}labourCharges/updateLabourStatus`,

  //Other Charge API
  OTHER_CHARGE_LIST: `${API_BASE_URL}otherCharges/getOtherCharge`,
  CREATE_OTHER_CHARGE: `${API_BASE_URL}otherCharges/addOtherCharge`,
  UPDATE_OTHER_CHARGE: `${API_BASE_URL}otherCharges/updateOtherCharge`,
  DELETE_OTHER_CHARGE: `${API_BASE_URL}otherCharges/deleteOtherCharge`,
  UPDATE_OTHER_CHARGE_STATUS: `${API_BASE_URL}otherCharges/updateOtherChargeStatus`,

  //Karat Purity API
  KARAT_PURITY_LIST: `${API_BASE_URL}karat/getKaratPurity`,
  CREATE_KARAT_PURITY: `${API_BASE_URL}karat/addKaratPurity`,
  UPDATE_KARAT_PURITY: `${API_BASE_URL}karat/updateKaratPurity`,
  DELETE_KARAT_PURITY: `${API_BASE_URL}karat/deleteKaratPurity`,
  UPDATE_KARAT_PURITY_STATUS: `${API_BASE_URL}karat/updateKaratPurityStatus`,

  //Currency API
  CURRENCY_LIST: `${API_BASE_URL}currency/getCurrency`,
  CREATE_CURRENCY: `${API_BASE_URL}currency/addCurrency`,
  UPDATE_CURRENCY: `${API_BASE_URL}currency/updateCurrency`,
  DELETE_CURRENCY: `${API_BASE_URL}currency/deleteCurrency`,
  UPDATE_CURRENCY_STATUS: `${API_BASE_URL}currency/updateCurrencyStatus`,
  UPDATE_DEFAULT_STATUS: `${API_BASE_URL}currency/setDefaultCurrency`,

  //Metal Price API
  METAL_PRICE_LIST: `${API_BASE_URL}metalPrice/getMetalPriceList`,
  GET_ACTIVE_METAL_PRICE: `${API_BASE_URL}metalPrice/getActive`,
  CREATE_METAL_PRICE: `${API_BASE_URL}metalPrice/addMetalPrice`,
  UPDATE_METAL_PRICE: `${API_BASE_URL}metalPrice/updateMetalPrice`,
  DELETE_METAL_PRICE: `${API_BASE_URL}metalPrice/deleteMetalPrice`,
  UPDATE_METAL_PRICE_STATUS: `${API_BASE_URL}metalPrice/updateMetalPriceStatus`,

  //Volume Discount API
  VOLUME_DISC_LIST: `${API_BASE_URL}valumnDiscount/getValumnDiscount`,
  CREATE_VOLUME_DISC: `${API_BASE_URL}valumnDiscount/addValumnDiscount`,
  UPDATE_VOLUME_DISC: `${API_BASE_URL}valumnDiscount/updateValumnDiscount`,
  DELETE_VOLUME_DISC: `${API_BASE_URL}valumnDiscount/deleteValumnDiscount`,
  UPDATE_VOLUME_DISC_STATUS: `${API_BASE_URL}valumnDiscount/updateValumnDiscountStatus`,

  //Stone Group API
  STONE_GROUP_LIST: `${API_BASE_URL}stoneGroup/getStoneGroup`,
  // Adds ONE group in place. IMPORT_STONE_GROUP replaces the whole collection.
  ADD_STONE_GROUP: `${API_BASE_URL}stoneGroup/addStoneGroup`,
  IMPORT_STONE_GROUP: `${API_BASE_URL}stoneGroup/importStoneGroup`,
  UPDATE_STONE_GROUP: `${API_BASE_URL}stoneGroup/updateStoneGroup`,
  UPDATE_STONE_GROUP_STATUS: `${API_BASE_URL}stoneGroup/updateStoneGroupStatus`,
  DELETE_STONE_GROUP: `${API_BASE_URL}stoneGroup/deleteStoneGroup`,
  EXPORT_STONE_GROUP: `${API_BASE_URL}stoneGroup/exportStoneGroup`,
  GET_STONE_GROUP_HISTORY: `${API_BASE_URL}stoneGroup/getStoneGroupHistory`,
  STONE_GROUP_DISTINCT_ATTRIBUTES: `${API_BASE_URL}stoneGroup/getDistinctStoneAttributes`,
  STONE_GROUP_COMBINATIONS: `${API_BASE_URL}stoneGroup/getStoneGroupCombinations`,
  STONE_GROUP_DEFAULT_ADD: `${API_BASE_URL}stoneGroupDefault/add`,
  STONE_GROUP_DEFAULT_LIST: `${API_BASE_URL}stoneGroupDefault/getStoneGroupDefaults`,
  STONE_GROUP_DEFAULT_ACTIVE: `${API_BASE_URL}stoneGroupDefault/getActive`,
  STONE_GROUP_DEFAULT_DELETE: `${API_BASE_URL}stoneGroupDefault/delete`,

  //Jewellery API
  GET_JEWELLERY_LIST: `${API_BASE_URL}products/getProductList`,
  GENERATE_PRODUCT_REPORT: `${API_BASE_URL}products/generateReport`,
  // Admin product detail — backed by `get_product_detail` at
  // /products/getProductDetails/:id. The legacy `jewellery/...`
  // mount no longer exists; the URL was 404-ing and the edit form
  // never hydrated.
  GET_JEWELLERY_DETAIL: `${API_BASE_URL}products/getProductDetails`,
  // Top-level categories (parentCategoryId=null) — used by the product
  // edit form. The legacy `jewellery/*` mount is gone, so route through
  // the unified products controller.
  GET_JEWELLERY_CATEGORY: `${API_BASE_URL}products/getCategoryList`,
  GET_JEWELLERY_SUBCATEGORY: `${API_BASE_URL}products/getSubCategoryList`,
  UPLOAD_JEWELLERY_FILE: `${API_BASE_URL}productImport/importProduct`,
  GET_IMPORT_JEWELLEY_HISTORY: `${API_BASE_URL}productImport/getImportHistory`,
  DELETE_JEWELLERY: `${API_BASE_URL}products/deleteProduct`,
  UPDATE_JEWELLERY_STATUS: `${API_BASE_URL}products/updateProductStatus`,
  // GET_SYNC removed — pointed at jewellery/calcutationProduct (404).
  // Price sync is SYNC_PRODUCT_PRICE (products/syncPrice) via <SyncPriceModal>.
  EXPORT_JEWELLERY: `${API_BASE_URL}products/exportProduct`,
  // JEWELLERY_PARENT_ITEM_CODE removed — pointed at jewellery/get_itemcode_list (404); the filter UI it fed no longer exists.
  // SYNC_JEWELLERY removed — pointed at products/classic_jewelerysync (404), caller was dead.
  CREATE_JEWELLERY: `${API_BASE_URL}products/addProduct`,
  UPDATE_JEWELLERY: `${API_BASE_URL}products/updateProduct`,



  // Section API
  GET_SECTION_LIST: `${API_BASE_URL}home/sesstion/getList`,
  CREATE_SESSION: `${API_BASE_URL}home/sesstion/create`,
  UPDATE_SESSION: `${API_BASE_URL}home/sesstion/update`,
  DELETE_SESSION: `${API_BASE_URL}home/sesstion/delete`,
  UPDATE_SESSION_STATUS: `${API_BASE_URL}home/sesstion/updateStatus`,
  MOST_LOVED_SESSION: `${API_BASE_URL}home/getMostEngagementRing`,
  // Customer Master API
  GET_CUSTOMER_LIST: `${API_BASE_URL}customer/getCustomer`,
  UPDATE_CUSTOMER_STATUS: `${API_BASE_URL}customer/updateCustomerStatus`,
  DELETE_CUSTOMER: `${API_BASE_URL}customer/deleteCustomer`,
  ADD_CUSTOMER: `${API_BASE_URL}customer/createCustomer`,
  UPDATE_CUSTOMER: `${API_BASE_URL}customer/updateCustomer`,
  GET_CUSTOMER_BY_ID: `${API_BASE_URL}customer/getCustomerById`,
  GET_ASSIGNEE_LIST: `${API_BASE_URL}customer/getAssigneeList`,

  GET_COUNTRY_LIST: `${API_BASE_URL}country/getCountry`,
  GET_STATE_LIST: `${API_BASE_URL}state/getState`,
  GET_CITY_LIST: `${API_BASE_URL}city/getCity`,
  VERIFY_CUSTOMER: `${API_BASE_URL}customer/verifyCustomer`,

  // Customer Group API
  GET_CUSTOMER_GROUP_LIST: `${API_BASE_URL}customer/getCustomerGroup`,
  CREATE_CUSTOMER_GROUP: `${API_BASE_URL}customer/createCustomerGroup`,
  UPDATE_CUSTOMER_GROUP: `${API_BASE_URL}customer/updateCustomerGroup`,
  DELETE_CUSTOMER_GROUP: `${API_BASE_URL}customer/deleteCustomerGroup`,
  // UPDATE_CUSTOMER_GROUP_STATUS: `${API_BASE_URL}customerGroup/updateCustomerGroupStatus`,

  // Staff API
  GET_STAFF_LIST: `${API_BASE_URL}staff/getStaff`,
  ADD_STAFF: `${API_BASE_URL}staff/createStaff`,
  UPDATE_STAFF: `${API_BASE_URL}staff/updateStaff`,
  DELETE_STAFF: `${API_BASE_URL}staff/deleteStaff`,
  UPDATE_STAFF_STATUS: `${API_BASE_URL}staff/updateStaffStatus`,

  // Logged-in staff profile + permissions, and the RBAC management API
  STAFF_ME: `${API_BASE_URL}staff/me`,
  PERMISSION_CONFIG: `${API_BASE_URL}permission/config`,
  SAVE_ROLE_PERMISSION: `${API_BASE_URL}permission/role`,

  // Role API
  GET_ROLE: `${API_BASE_URL}role/getRoleList`,

  // Order
  GET_ORDER_LIST: `${API_BASE_URL}order/orderList`,
  RECENT_ORDER_LIST: `${API_BASE_URL}order/recent-orders`,
  GET_ORDER_DETAIL: `${API_BASE_URL}order/orderDetail`,
  GET_ORDER_STATUS_CAPTION: `${API_BASE_URL}order/orderstatusCaption`,
  ORDER_STATUS_CHANGE: `${API_BASE_URL}order/changeOrderItemStatus`,
  UPDATE_ORDER_STATUS: (id) => `${API_BASE_URL}order/updateStatus/${id}`,
  UPDATE_ORDER_ITEM_STATUS: (id) => `${API_BASE_URL}order/updateItemStatus/${id}`,
  UPDATE_ORDER_TRACKING: (id) => `${API_BASE_URL}order/update-tracking/${id}`,

  // globle list
  GET_GLOBLE_LIST: `${API_BASE_URL}globalsettings/getlist`,
  UPDATE_GLOBLE_LIST: `${API_BASE_URL}globalsettings/changesetting`,


  //COUPEN LIST
  GET_CATEGORY_LIST: `${API_BASE_URL}products/getCategoryList`,
  GET_JEWELLERY_LIST_FOR_COUPON: `${API_BASE_URL}jewellery/getJewelleryList`,
  CREATE_COUPON: `${API_BASE_URL}coupon/createCoupon`,
  GET_COUPON_LIST: `${API_BASE_URL}coupon/getCouponList`,
  DELETE_COUPON: (id) => `${API_BASE_URL}coupon/deleteCoupon/${id}`,
  EDIT_COUPON: (id) => `${API_BASE_URL}coupon/updateCoupon/${id}`,
  GET_COUPON_DETAIL: (id) => `${API_BASE_URL}coupon/getCouponDetail/${id}`,
  CHANGE_COUPON_STATUS: `${API_BASE_URL}coupon/coupon_status_change/`,
  // SYNC_PRICE removed — pointed at coupon/coupon_sync (404). Product price
  // syncing is SYNC_PRODUCT_PRICE (products/syncPrice) via <SyncPriceModal>.

  CHANGE_ORDER_STATUS: `${API_BASE_URL}order/ChangeOrderPaymentStatus`,
  GET_TAGS: `${API_BASE_URL}products/getTagsList`,
  // Unified Metal list — single source of truth. The legacy
  // GET_METAL_TYPE / GET_METAL_STAMP endpoints (jewellery/getMetal*) are
  // pre-unification and no longer mounted. Use this for any Metal
  // dropdown in product forms.
  GET_METAL_LIST: `${API_BASE_URL}products/getMetalList`,
  // Unified Charges list — POST with body `{ type: "making" | "other" }`.
  // Replaces the old labourCharges/* and otherCharges/* mounts (gone).
  GET_CHARGES_LIST: `${API_BASE_URL}charges/getCharges`,

  // Tag Master API — full CRUD for the admin Tags page. Backend routes
  // live under /tags (see api/routes/tag.route.js).
  TAG_LIST: `${API_BASE_URL}tags/getTag`,
  CREATE_TAG: `${API_BASE_URL}tags/addTag`,
  UPDATE_TAG: `${API_BASE_URL}tags/updateTag`,
  DELETE_TAG: `${API_BASE_URL}tags/deleteTag`,
  UPDATE_TAG_STATUS: `${API_BASE_URL}tags/updateTagStatus`,
  GET_METAL_TYPE: `${API_BASE_URL}jewellery/getMetalType`,
  GET_METAL_STAMP: `${API_BASE_URL}jewellery/getMetalStamp`,
  GET_SETTING_TYPE: `${API_BASE_URL}jewellery/getSettingTypeList`,
  GET_COLLECTIONS_LIST: `${API_BASE_URL}products/getCollectionList`,
  // GET_STONE_GROUP removed — pointed at stoneGroup/getStoneGroupcolorclarity (404), unused.

  GET_HOME_REVIEW_SECTION: `${API_BASE_URL}customerReview/getCustReview`,
  ADD_HOME_REVIEW_SECTION: `${API_BASE_URL}customerReview/addCustReview`,
  DELETE_HOME_REVIEW_SECTION: `${API_BASE_URL}customerReview/deleteCustReview/`,
  UPDATE_REVIEW_STATUS: `${API_BASE_URL}customerReview/updateCustReviewStatus/`,

  //DROPDOWN
  MERGE_CATEGORY_LIST: `${API_BASE_URL}products/getCategoryWithSubcategory`,
  PARENT_CATEGORY_LIST: `${API_BASE_URL}products/getCategoryList`,
  // Detail fetch for the admin edit modal — the list endpoint is slim,
  // so we load the full row (pageBanner, banners, side cards, tags) only
  // when the user opens edit.
  GET_CATEGORY_BY_ID: `${API_BASE_URL}category/getCategoryById`,
  GET_COLLECTION_BY_ID: `${API_BASE_URL}collection/getCollectionById`,
  SUB_CATEGORY_LIST: `${API_BASE_URL}products/getSubCategoryList`,
  CUSTOMER_GROUP_LIST: `${API_BASE_URL}customer/getCustomerGroupDropdown`,
  GET_CUSTOMER_GROUP_DROPDOWN: `${API_BASE_URL}customer/getCustomerGroupDropdown`,

  // Size Master API
  SIZE_LIST: `${API_BASE_URL}sizes/list`,
  CREATE_SIZE: `${API_BASE_URL}sizes/create`,
  UPDATE_SIZE: `${API_BASE_URL}sizes/update`,
  DELETE_SIZE: `${API_BASE_URL}sizes/delete`,
  UPDATE_SIZE_STATUS: `${API_BASE_URL}sizes/status`,
  GET_SIZE_BY_ID: `${API_BASE_URL}sizes/detail`,

  // Metal Master API
  METAL_LIST: `${API_BASE_URL}metal/listMetal`,
  CREATE_METAL: `${API_BASE_URL}metal/addMetal`,
  UPDATE_METAL: `${API_BASE_URL}metal/updateMetal`,
  DELETE_METAL: `${API_BASE_URL}metal/deleteMetal`,
  UPDATE_METAL_STATUS: `${API_BASE_URL}metal/updateMetalStatus`,
  SYNC_METAL_PRICE: `${API_BASE_URL}metal/syncMetalPrice`,
  SYNC_PRODUCT_PRICE: `${API_BASE_URL}products/syncPrice`,

  // Home Section CMS API
  HOME_SECTION_LIST: `${API_BASE_URL}homeSection/list`,
  GET_HOME_SECTION: `${API_BASE_URL}homeSection/`,
  UPDATE_HOME_SECTION: `${API_BASE_URL}homeSection/`,
  UPLOAD_CMS_IMAGE: `${API_BASE_URL}homeSection/uploadImage`,
  HOME_SECTION_CATEGORY_DROPDOWN: `${API_BASE_URL}products/getCategoryList`,
  HOME_SECTION_COLLECTION_DROPDOWN: `${API_BASE_URL}products/getCollectionList`,
  HOME_SECTION_PRODUCT_SEARCH: `${API_BASE_URL}products/getProductList`,

  // Category Landing CMS API
  CREATE_LANDING_BANNER: `${API_BASE_URL}categoryLanding/section/create`,
  GET_LANDING_BANNER: `${API_BASE_URL}categoryLanding/section/getList`,
  UPDATE_LANDING_BANNER: `${API_BASE_URL}categoryLanding/section/update/`,
  UPDATE_LANDING_BANNER_STATUS: `${API_BASE_URL}categoryLanding/section/updateStatus/`,
  DELETE_LANDING_BANNER: `${API_BASE_URL}categoryLanding/section/delete/`,
  GET_CATEGORY_MOST_ENGAGEMENT_RING: `${API_BASE_URL}categoryLanding/section/getcategoryMostEngagementRing/`,

  // Label Master API
  LABEL_LIST: `${API_BASE_URL}label/getLabelList`,
  CREATE_LABEL: `${API_BASE_URL}label/createLabel`,
  UPDATE_LABEL: `${API_BASE_URL}label/updateLabel`,
  DELETE_LABEL: `${API_BASE_URL}label/deleteLabel`,
  UPDATE_LABEL_STATUS: `${API_BASE_URL}label/updateLabelStatus`,

  // Stone Group Default API additions
  STONE_GROUP_DEFAULT_UPDATE: `${API_BASE_URL}stoneGroupDefault/update`,
  STONE_GROUP_DEFAULT_TOGGLE_DEFAULT: `${API_BASE_URL}stoneGroupDefault/toggleDefault`,
  STONE_GROUP_DEFAULT_UPDATE_STATUS: `${API_BASE_URL}stoneGroupDefault/updateStatus`,

  // Custom Order API
  GET_CUSTOM_ORDER_LIST: `${API_ADMIN_BASE_URL}getAllCustomOrders`,
  UPDATE_CUSTOM_ORDER_STATUS: `${API_ADMIN_BASE_URL}updateCustomOrderStatus`,
  ADD_QUOTATION: `${API_ADMIN_BASE_URL}addQuotations`,
  GET_QUOTATION_LIST: `${API_ADMIN_BASE_URL}getQuotation/`,
  UPDATE_QUOTATION_STATUS: `${API_ADMIN_BASE_URL}updateQuotationStatus`,

  // Offer Master API
  CREATE_OFFER: `${API_BASE_URL}offer/addOffer`,
  GET_OFFER_LIST: `${API_BASE_URL}offer/getOfferList`,
  GET_ALL_PRODUCTS_LIST: `${API_BASE_URL}offer/getProductList`,
  UPDATE_OFFER: `${API_BASE_URL}offer/updateOffer`,
  DELETE_OFFER: `${API_BASE_URL}offer/deleteOffer`,
  UPDATE_OFFER_STATUS: `${API_BASE_URL}offer/updateOfferStatus`,
  GET_OFFER_APPLIED_PRODUCTS: (id) => `${API_BASE_URL}offer/getOfferAppliedProducts/${id}`,
  SYNC_OFFER_APPLIED_PRODUCTS: `${API_BASE_URL}offer/syncOffers`,

  // Mega Menu (Shopify-style admin-authored navigation)
  MENU_REDIRECT_OPTIONS: `${API_BASE_URL}menu/options`,
  GET_MENU: (location = "header") => `${API_BASE_URL}menu/detail/${location}`,
  SAVE_MENU: (location = "header") => `${API_BASE_URL}menu/save/${location}`,

  // Order Inquiry API
  GET_ORDER_INQUIRY_LIST: `${API_BASE_URL}orderinquiry/getOrderInquiryList`,
  GET_ORDER_INQUIRY_DETAIL: (id) => `${API_BASE_URL}orderinquiry/getOrderInquiryDetail/${id}`,
  UPDATE_ORDER_INQUIRY_STATUS: (id) => `${API_BASE_URL}orderinquiry/updateOrderInquiryStatus/${id}`,
  DELETE_ORDER_INQUIRY: (id) => `${API_BASE_URL}orderinquiry/deleteOrderInquiry/${id}`,

  // Contact Inquiry API (storefront "Get in Touch" form)
  GET_CONTACT_INQUIRY_LIST: `${API_BASE_URL}contactInquiry/getContactInquiryList`,
  GET_CONTACT_INQUIRY_DETAIL: (id) => `${API_BASE_URL}contactInquiry/getContactInquiryDetail/${id}`,
  UPDATE_CONTACT_INQUIRY_STATUS: (id) => `${API_BASE_URL}contactInquiry/updateContactInquiryStatus/${id}`,
  DELETE_CONTACT_INQUIRY: (id) => `${API_BASE_URL}contactInquiry/deleteContactInquiry/${id}`,

  // Subscribers API
  GET_SUBSCRIBER_LIST: `${API_BASE_URL}subscription/getSubscriptionList`,
  DELETE_SUBSCRIBER: (id) => `${API_BASE_URL}subscription/deleteSubscription/${id}`,
};

