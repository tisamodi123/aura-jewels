import { PREFIX } from "./constants";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:2110/';
export const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'IN';
export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY;
export const noImgFound = PREFIX ? `${PREFIX}/images/no-img.png` : '/images/no-img.png';
export const FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL;
export const ENABLE_SCRIPT = process.env.NEXT_PUBLIC_ENABLE_PRODUCTION_SCRIPTS === 'true';

const app = "app/";
// const APP_API_BASE_URL = API_BASE_URL;
const APP_API_BASE_URL = `${API_BASE_URL}${app}`

export const ENDPOINTS = {
    AUTH: {
        REGISTER: `${APP_API_BASE_URL}auth/register`,
        LOGIN: `${APP_API_BASE_URL}auth/login`,
        VERIFY_OTP: `${APP_API_BASE_URL}auth/verifyOtp`,
        RESEND_OTP: `${APP_API_BASE_URL}auth/resendOtp`,
        // Email + OTP auth (peer to phone) — used when the customer chooses to
        // sign up / log in with an email address instead of a mobile number.
        SEND_EMAIL_OTP: `${APP_API_BASE_URL}auth/sendEmailOtp`,
        VERIFY_EMAIL_OTP: `${APP_API_BASE_URL}auth/verifyEmailOtp`,
        RESEND_EMAIL_OTP: `${APP_API_BASE_URL}auth/resendEmailOtp`,
        VERIFY_EMAIL_TOKEN: `${APP_API_BASE_URL}auth/verifyEmailToken`,
        REFRESH: `${APP_API_BASE_URL}auth/refreshToken`,
        LOGOUT: `${APP_API_BASE_URL}auth/logout`,
        FORGOT_PASSWORD: `${APP_API_BASE_URL}auth/forgotPassword`,
        CHECK_RESET_TOKEN: `${APP_API_BASE_URL}auth/verifyResetPasswordToken`,
        RESET_PASSWORD: `${APP_API_BASE_URL}auth/resetPassword`,
    },
    HOME: {
        MENU: `${APP_API_BASE_URL}menu`,
        GET_HOME_SCREEN_DATA: `${APP_API_BASE_URL}home`,
        GET_CATEGORY_LANDING_PAGE_DATA: `${APP_API_BASE_URL}home/getCategoryLandingPageData`,
        OFFER_POPUP: `${APP_API_BASE_URL}home/offer-popup`,
    },
    PRODUCT: {
        GET_ALL_LIST: `${APP_API_BASE_URL}products/getAllList`,
        GET_DIAMONDS: `${APP_API_BASE_URL}diamond/getAllList`,
        GET_DIAMOND_DETAILS: (id: string) => `${APP_API_BASE_URL}diamond/getDiamondDetails/${id}`,
        GET_PRODUCTS_BY_TAGS: `${APP_API_BASE_URL}products/getProductsByTags`,
        GET_PRODUCT_DETAILS: (slug: string) => `${APP_API_BASE_URL}products/productDetails/${slug}`,
        GET_RECOMMENDATIONS: (id: string) => `${APP_API_BASE_URL}products/getRecommendations/${id}`,
        GET_CATEGORY: `${API_BASE_URL}products/getCategoryWithSubcategory`,
        GET_RINGSIZE: `${API_BASE_URL}products/getRingSizes`,
        GET_METALS: `${API_BASE_URL}products/getMetalList`,
        GET_COLLECTIONS: `${API_BASE_URL}products/getCollectionList`,
        GET_TAGS: `${API_BASE_URL}products/getTagsList`,
        GET_SHAPES: `${API_BASE_URL}products/getShapeList`,
    },
    OFFER: {
        GET_BY_SLUG: (slug: string) => `${APP_API_BASE_URL}offer/${slug}`,
    },
    CART: {
        GET_CART_LIST: `${APP_API_BASE_URL}cart/getCartlist`,
        ADD_TO_CART: `${APP_API_BASE_URL}cart/addToCart`,
        REMOVE_CART_ITEM: `${APP_API_BASE_URL}cart/removeCart`,
        MOVE_TO_WISHLIST: `${APP_API_BASE_URL}cart/moveToWishlist`,
        GET_CHECKOUT: `${APP_API_BASE_URL}cart/getCheckout`,
        UPDATE_CART_ITEM: `${APP_API_BASE_URL}cart/updateCartItem`,
        UPDATE_CART: `${APP_API_BASE_URL}cart/update`,
        // Public: prices a guest's SKU-only cookie server-side. Writes nothing.
        PREVIEW: `${APP_API_BASE_URL}cart/preview`,
        ORDER_MOVE_TO_CART: `${APP_API_BASE_URL}cart/moveFailedOrderToCart`,
    },
    WISHLIST: {
        GET_WISHLIST: `${APP_API_BASE_URL}wishlist/getWishlist`,
        ADD_TO_WISHLIST: `${APP_API_BASE_URL}wishlist/addToWishlist`,
        REMOVE_FROM_WISHLIST: `${APP_API_BASE_URL}wishlist/removeWishlist`,
        MOVE_TO_CART: `${APP_API_BASE_URL}wishlist/moveTocart`,
        // Public: prices a guest's SKU-only cookie server-side. Writes nothing.
        PREVIEW: `${APP_API_BASE_URL}wishlist/preview`,
    },
    ORDER: {
        MY_ORDERS: `${APP_API_BASE_URL}order/my-orders`,
        ORDER_BY_ID: (orderId: string) => `${APP_API_BASE_URL}order/${orderId}`,
        PLACE_ORDER: `${APP_API_BASE_URL}order/placeOrder`,
        VERIFY_PAYMENT: `${APP_API_BASE_URL}order/verify-payment`,
        RETRY_PAYMENT: (orderId: string) => `${APP_API_BASE_URL}order/${orderId}/retry-payment`,
        CANCEL_ORDER: (orderId: string) => `${APP_API_BASE_URL}order/cancel/${orderId}`,
        RETURN_ORDER: (orderId: string) => `${APP_API_BASE_URL}order/return/${orderId}`,
        CANCEL_ORDER_ITEM: (itemId: string) => `${APP_API_BASE_URL}order/cancel-item/${itemId}`,
        RETURN_ORDER_ITEM: (itemId: string) => `${APP_API_BASE_URL}order/return-item/${itemId}`,
        ORDER_DELETE: (itemId: string) => `${APP_API_BASE_URL}order/deleteOrder/${itemId}`,
    },
    WALLET: {
        GET_WALLET: `${APP_API_BASE_URL}wallet`,
        GET_TRANSACTIONS: `${APP_API_BASE_URL}wallet/transactions`,
    },
    PROFILE: {
        GET_PROFILE: `${APP_API_BASE_URL}auth/profile`,
        UPDATE_PROFILE: `${APP_API_BASE_URL}auth/profile`,
        EMAIL_SEND_OTP: `${APP_API_BASE_URL}auth/email/send-otp`,
        EMAIL_VERIFY: `${APP_API_BASE_URL}auth/email/verify`,
    },
    ADDRESS: {
        GET_ADDRESSES: `${APP_API_BASE_URL}addresses`,
        ADD_ADDRESS: `${APP_API_BASE_URL}addresses`,
        UPDATE_ADDRESS: (addressId: string) => `${APP_API_BASE_URL}addresses/${addressId}`,
        DELETE_ADDRESS: (addressId: string) => `${APP_API_BASE_URL}addresses/${addressId}`,
    },
    COUNTRY: {
        GET_COUNTRIES: `${APP_API_BASE_URL}country/getCountry`,
    },
    SETTING: {
        GET_CURRENCY_INFO: `${API_BASE_URL}setting/currency-info`,
        GET_CURRENCIES: `${API_BASE_URL}setting/currencies`,
        GET_SEO_VISIBILITY: `${API_BASE_URL}setting/seo-visibility`,
    },
    CUSTOM_ORDER: {
        CREATE_CUSTOM_ORDER: `${API_BASE_URL}custom/createCustomJewellery`,
        MY_CUSTOM_ORDERS: `${API_BASE_URL}custom/myCustomOrders`,
        MY_QUOTATIONS: (customOrderId: string) => `${API_BASE_URL}custom/myQuotations/${customOrderId}`,
        UPDATE_QUOTATION_STATUS: `${API_BASE_URL}custom/updateQuationStatus`,
        CANCEL_CUSTOM_ORDER: (id: string) => `${API_BASE_URL}custom/cancelCustomOrderRequest/${id}`,
        RETURN_CUSTOM_ORDER: (id: string) => `${API_BASE_URL}custom/returnCustomOrderRequest/${id}`,
    },
    INQUIRY: {
        CREATE_INQUIRY: `${APP_API_BASE_URL}orderInquiry/placeIntenationalOrderInquiry`,
        MY_INQUIRIES: `${APP_API_BASE_URL}orderInquiry/orderInquiryList`,
    },
    CONTACT: {
        // "Get in Touch" form. Public — no token required.
        SUBMIT: `${APP_API_BASE_URL}contactInquiry/submit`,
    },
    NEWSLETTER: {
        // Newsletter subscription. Public — no token required.
        SUBSCRIBE: `${APP_API_BASE_URL}subscription/subscribe`,
    },
    COUPON: {
        GET_APPLICABLE_COUPONS: `${APP_API_BASE_URL}coupon/getApplicableCoupons`,
    },
    TRACK: {
        GENERIC: `${APP_API_BASE_URL}track`,
        VIEW_CONTENT: `${APP_API_BASE_URL}track/view-content`,
        CONTACT: `${APP_API_BASE_URL}track/contact`,
        LEAD_SUBMITTED: `${APP_API_BASE_URL}track/lead-submitted`,
    }
};