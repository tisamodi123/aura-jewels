export const MESSAGES = {
    COMMON: {
        SUCCESS: 'Success',
        FETCHED: 'Fetched successfully',
        CREATED: 'Created successfully',
        UPDATED: 'Updated successfully',
        DELETED: 'Deleted successfully',
        STATUS_UPDATED: 'Status updated successfully',

        INVALID_REQUEST: 'Invalid request',
        EMPTY_BODY: 'Empty request body',
        UNAUTHORIZED: 'Unauthorized',
        FORBIDDEN: 'Forbidden',
        NOT_FOUND: 'Resource not found',
        ALREADY_EXISTS: 'Resource already exists',
        INTERNAL_ERROR: 'Something went wrong',
        INVALID_ID: 'Invalid ID..!',
        TOO_MANY_REQUESTS: 'Too many requests. Please try again after some time.'
    },

    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'User logout successfully',
        REGISTERED: 'Account created. Please verify OTP sent to email',
        EMAIL_VERIFIED: 'Email verified successfully',
        EMAIL_ALREADY_VERIFIED: 'Email already verified',
        EMAIL_NOT_VERIFIED: 'Email not verified',
        OTP_RESENT: 'OTP resent successfully',
        OTP_INVALID: 'Invalid OTP',
        OTP_EXPIRED: 'OTP expired',
        OTP_ALREADY_SENT: 'Email not verified. OTP already sent to your email.',
        OTP_NEW_SENT: 'Email not verified. New OTP sent to your email.',

        INVALID_CREDENTIALS: 'Invalid credentials',
        INVALID_PASSWORD: 'Invalid password',
        NOT_ADMIN_USER: 'Not an admin user',
        ACCOUNT_SUSPENDED: 'Account suspended',
        USER_NOT_FOUND: 'User not found',
        USER_ALREADY_EXISTS: 'User already exists',
        PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
        PASSWORD_REQUIRED: 'Password is required',
        PASSWORD_WEAK: 'Password must be at least 8 characters and include uppercase, lowercase, number and a symbol (@, #, $, %, *, &).',

        TOKEN_REQUIRED: 'Token not provided',
        REFRESH_TOKEN_REQUIRED: 'Refresh token required',
        REFRESH_TOKEN_INVALID: 'Invalid refresh token',
        TOKEN_INVALID: 'Invalid or expired token',

        RESET_LINK_SENT: 'Reset link sent to email',
        PASSWORD_RESET_SUCCESS: 'Password reset successful'
    },

    CART: {
        ADDED: 'Cart added successfully',
        UPDATED: 'Cart updated successfully',
        REMOVED: 'Item removed from cart successfully',
        EMPTY: 'Cart Empty',
        EMPTY_ON_CHECKOUT: 'Your cart is empty. Cannot place an order.',
        FETCHED: 'Cart fetched successfully',
        NOT_FOUND: 'Item not found in cart',
        NOT_ADDED: 'Not Added...!',
        JEWELERY_ID_REQUIRED: 'Jewelery id is required',
        ITEM_NOT_AVAILABLE: 'Item not available',
        ALREADY_IN_WISHLIST: 'Item already exists in Wishlist',
        MOVED_TO_WISHLIST: 'Cart item moved to wishlist successfully.',
        COUNT_FETCHED: 'Counts fetched successfully'
    },

    WISHLIST: {
        ADDED: 'Added to wishlist successfully',
        REMOVED: 'Removed from wishlist successfully',
        FETCHED: 'Wishlist fetched successfully',
        ALREADY_IN_CART: 'Item already exists in Cart',
        MOVED_TO_CART: 'Wishlist item moved to cart successfully.',
        NOT_FOUND: 'Item not found in wishlist'
    },

    PRODUCT: {
        FETCHED: 'Products fetched successfully',
        DETAIL_FETCHED: 'Product details fetched successfully',
        NOT_FOUND: 'Product not found',
        SLUG_REQUIRED: 'Please provide product slug',
        SIZE_NOT_FOUND: 'Size not found..!',
        MISSING_PARAMS: 'Missing required parameters..!',
        PRICE_CALCULATED: 'Price calculated successfully',
        PRICE_CALC_FAILED: 'Failed to calculate price'
    },

    ORDER: {
        PLACED: 'Order placed successfully!',
        FETCHED: 'Orders fetched successfully',
        DETAIL_FETCHED: 'Order details fetched successfully',
        LIST_FETCHED: 'Orders list fetched successfully',
        NOT_FOUND: 'Order not found.',
        ITEM_NOT_FOUND: 'Order item not found.',
        STATUS_UPDATED: 'Order status updated successfully',
        ITEM_STATUS_UPDATED: 'Order item status updated successfully',
        STATUS_REQUIRED: 'Status field is required.',
        STATUS_INVALID: 'Invalid status.'
    },

    STAFF: {
        LIST_FETCHED: 'Staff list fetched successfully',
        DETAIL_FETCHED: 'Staff detail fetched successfully',
        CREATED: 'Staff created successfully and credentials sent via email',
        UPDATED: 'Staff updated successfully',
        NOT_FOUND: 'Staff not found',
        ID_REQUIRED: 'Please provide staff id',
        ACTIVATED: 'Staff ACTIVE successfully',
        SUSPENDED: 'Staff SUSPENDED successfully'
    },

    CUSTOMER: {
        LIST_FETCHED: 'Customers fetched successfully',
        DETAIL_FETCHED: 'Customer fetched successfully',
        CREATED: 'Customer created successfully',
        UPDATED: 'Customer updated successfully',
        DELETED: 'Customer deleted successfully',
        STATUS_UPDATED: 'Customer status updated',
        ASSIGNEES_FETCHED: 'Assignees fetched successfully',
        NOT_FOUND: 'Customer not found'
    },

    CUSTOMER_GROUP: {
        CREATED: 'Group created successfully',
        LIST_FETCHED: 'Groups fetched successfully',
        DETAIL_FETCHED: 'Group fetched successfully',
        UPDATED: 'Group updated successfully',
        DELETED: 'Group deleted successfully',
        DROPDOWN_FETCHED: 'Customer groups fetched successfully'
    },

    ACTIVITY_LOG: {
        NOT_FOUND: 'Activity log not found'
    },

    CATEGORY: {
        ADDED: 'Category added successfully..!',
        UPDATED: 'Category updated successfully..!',
        DELETED: 'Category deleted successfully..!',
        STATUS_UPDATED: 'Status update successfully..!',
        LIST_FETCHED: 'Category list fetched successfully..!',
        TREE_FETCHED: 'Category tree fetched successfully',
        NOT_FOUND: 'Category not found..!',
        UNIQUE_NAME: 'Please provide unique category name..!',
        ID_REQUIRED: 'Please provide categoryId..!'
    },

    COLLECTION: {
        ADDED: 'Collection added successfully..!',
        UPDATED: 'Collection update successfully..!',
        DELETED: 'Collection delete successfully..!',
        STATUS_UPDATED: 'Status update successfully..!',
        LIST_FETCHED: 'Collection list get successfully..!',
        LIST_EMPTY: 'No any collection exist..!',
        NOT_FOUND: 'Collection not found..!',
        SLUG_EXISTS: 'Slug already exists..!',
        NAME_EXISTS: 'Name already exists..!'
    },

    METAL: {
        ADDED: 'Metal added successfully..!',
        UPDATED: 'Metal updated successfully..!',
        DELETED: 'Metal deleted successfully..!',
        STATUS_UPDATED: 'Status updated successfully..!',
        LIST_FETCHED: 'Metal list fetched successfully..!',
        NOT_FOUND: 'Metal not found..!',
        EXISTS: 'Metal already exists..!',
        PRICE_SYNCED: 'Metal prices synced successfully'
    },

    METAL_PRICE: {
        CREATED: 'Metal price created & activated',
        UPDATED: 'New price version created',
        DELETED: 'Deleted successfully',
        STATUS_UPDATED: 'Status updated safely',
        NOT_FOUND: 'Metal price not found',
        CANNOT_DELETE_ACTIVE: 'Cannot delete ACTIVE metal price',
        ACTIVE_REQUIRED: 'At least one ACTIVE price required'
    },

    CHARGES: {
        ADDED: 'Charge added successfully..!',
        UPDATED: 'Charge updated successfully..!',
        DELETED: 'Charge deleted successfully',
        STATUS_UPDATED: 'Status updated successfully',
        LIST_FETCHED: 'Charges fetched successfully',
        NOT_FOUND: 'Charge not found..!',
        EXISTS_CODE_TYPE: 'Charge already exists for this code & type..!',
        DUPLICATE_CODE_TYPE: 'Duplicate charge for code & type..!',
        UPDATE_FAILED: 'Charge Update Fail..!',
        STATUS_UPDATE_FAILED: 'Failed to Update'
    },

    TAG: {
        ADDED: 'Tag added successfully..!',
        UPDATED: 'Tag updated successfully..!',
        DELETED: 'Tag deleted successfully..!',
        STATUS_UPDATED: 'Status updated successfully..!',
        LIST_FETCHED: 'Tag list fetched successfully..!',
        NOT_FOUND: 'Tag not found..!',
        EXISTS: 'Tag already exists..!'
    },

    PARAMETER: {
        CREATED: 'Parameter created successfully..!',
        UPDATED: 'Parameter updated successfully..!',
        DELETED: 'Parameter deleted successfully..!',
        STATUS_UPDATED: 'Status updated successfully..!',
        LIST_FETCHED: 'Parameter list fetched successfully..!',
        NOT_FOUND: 'Parameter not found..!',
        UNIQUE_CODE: 'Parameter code must be unique for this type',
        UNIQUE_SORT: 'Sort must be unique for this type',
        CREATE_FAILED: 'Failed to create Parameter..!',
        DELETE_FAILED: 'Failed to delete parameter..!',
        ID_REQUIRED: 'Please provide parameterId..!'
    },

    LABEL: {
        CREATED: 'Label created successfully..!',
        UPDATED: 'Label updated successfully..!',
        DELETED: 'Label deleted successfully..!',
        STATUS_UPDATED: 'Status updated successfully..!',
        LIST_FETCHED: 'Label list fetched successfully..!',
        NOT_FOUND: 'Label not found..!',
        UNIQUE: 'Label combination already exists',
        CREATE_FAILED: 'Failed to create Label..!',
        DELETE_FAILED: 'Failed to delete label..!'
    },

    DIAMOND_QUALITY_MASTER: {
        CREATED: 'Diamond quality entry created successfully',
        UPDATED: 'Diamond quality entry updated successfully',
        DELETED: 'Diamond quality entry deleted successfully',
        STATUS_UPDATED: 'Status updated successfully',
        LIST_FETCHED: 'Diamond quality master list fetched successfully',
        NOT_FOUND: 'Diamond quality entry not found',
        UNIQUE: 'An entry with this color, clarity and origin already exists',
        CREATE_FAILED: 'Failed to create diamond quality entry',
        DELETE_FAILED: 'Failed to delete diamond quality entry'
    },

    SIZE: {
        CREATED: 'Size created successfully',
        UPDATED: 'Size updated successfully',
        DELETED: 'Size deleted successfully',
        STATUS_UPDATED: 'Size status updated successfully',
        LIST_FETCHED: 'Sizes list fetched successfully',
        DETAIL_FETCHED: 'Size detail fetched successfully',
        NOT_FOUND: 'Size not found'
    },

    COUNTRY: {
        COUNTRIES_FETCHED: 'Countries fetched successfully',
        STATES_FETCHED: 'States fetched successfully',
        CITIES_FETCHED: 'Cities fetched successfully'
    },

    IMPORT: {
        HISTORY_FETCHED: 'Import history fetched successfully'
    },

    VALIDATION: {
        EMAIL_REQUIRED: 'Please Provide Email',
        NAME_REQUIRED: 'Please Provide Name',
        PHONE_REQUIRED: 'Please Provide Phone Number',
        PASSWORD_REQUIRED: 'Please Provide Password'
    },

    HOME_SECTION: {
        LIST_FETCHED: 'Home sections fetched successfully',
        DETAIL_FETCHED: 'Home section fetched successfully',
        UPDATED: 'Home section updated successfully',
        NOT_FOUND: 'Home section not found',
        IMAGE_UPLOADED: 'Image uploaded successfully',
        IMAGE_REQUIRED: 'Image file required'
    },

    SUBSCRIPTION: {
        SUBSCRIBED: "You have been subscribed successfully.",
        UNSUBSCRIBED: "You have been unsubscribed successfully.",
        ALREADY_SUBSCRIBED: "You are already subscribed.",
        ALREADY_UNSUBSCRIBED: "You are already unsubscribed.",
        NOT_FOUND: "You are not subscribed yet.",
        DELETED: "Subscription deleted successfully.",
        FAILED: "Failed to subscribe.",
        FAILED_TO_GET_LIST: "Failed to get subscription list.",
        FAILED_TO_UNSUBSCRIBE: "Failed to unsubscribe.",
        FAILED_TO_DELETE: "Failed to delete subscription."
    }
};

export default MESSAGES;
