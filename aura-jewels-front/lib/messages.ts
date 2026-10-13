export const M = {
    common: {
        loading: 'Loading...',
        somethingWentWrong: 'An unexpected error occurred. Please try again.',
        sessionExpired: 'Session expired. Please login again.',
        networkError: 'Network error. Please try again.',
        noData: 'No data found',
        success: 'Success',
        save: 'Save',
        cancel: 'Cancel',
        continue: 'Continue',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        search: 'Search',
        actions: 'Actions',
        viewAll: 'View all',
        close: 'Close',
        apply: 'Apply',
        remove: 'Remove'
    },

    auth: {
        loggedIn: 'Welcome back!',
        loggedOut: 'Logged out',
        registered: 'Account created. Check your email for OTP.',
        verifyingOtp: 'Verifying...',
        otpVerified: 'Email verified successfully',
        otpResent: 'OTP resent to your email',
        otpInvalid: 'Invalid OTP',
        otpExpired: 'OTP expired. Request a new one.',
        resetLinkSent: 'Reset link sent to your email',
        passwordResetSuccess: 'Password reset successful',
        passwordsDoNotMatch: 'Passwords do not match',
        invalidCredentials: 'Invalid credentials',
        loginFailed: 'Login failed. Please check your credentials.',
        authFailed: 'Authentication failed. No access token received.',
        verifyEmailHint: 'Please verify your email to continue.',
        emailNotVerified: 'Email not verified',

        labels: {
            email: 'Email',
            emailOrMobile: 'Email or Mobile Number',
            password: 'Password',
            confirmPassword: 'Confirm password',
            newPassword: 'New password',
            confirmNewPassword: 'Confirm new password',
            name: 'Name',
            phone: 'Phone',
            otp: 'OTP',
            login: 'Log In',
            signingIn: 'Signing In...',
            register: 'Create Account',
            registering: 'Creating Account...',
            forgotPassword: 'Forgot password?',
            forgotShort: 'Forgot?',
            resetPassword: 'Reset password',
            resending: 'Resending...',
            resendOtp: 'Resend OTP',
            verifyOtp: 'Verify OTP',
            logout: 'Logout',
            createAccount: 'Create an Account',
            newToHouse: 'New to the House?',
            haveAccount: 'Already have an account?',
            noAccount: "Don't have an account?",
            sendResetLink: 'Send reset link',
            sending: 'Sending...',
            backToLogin: 'Back to login',
            submit: 'Submit'
        }
    },

    cart: {
        added: 'Added to cart',
        updated: 'Cart updated',
        removed: 'Removed from cart',
        empty: 'Your cart is empty',
        movedToWishlist: 'Moved to wishlist',
        alreadyInWishlist: 'Already in wishlist',
        title: 'Shopping Cart',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        taxes: 'Taxes',
        grandTotal: 'Grand Total',
        proceedToCheckout: 'Proceed to checkout',
        free: 'Free',
        loginToContinue: 'Please log in to continue.'
    },

    wishlist: {
        added: 'Added to wishlist',
        removed: 'Removed from wishlist',
        empty: 'Your wishlist is empty',
        movedToCart: 'Moved to cart',
        alreadyInCart: 'Already in cart',
        title: 'My Wishlist'
    },

    product: {
        notFound: 'Product not found',
        priceCalculated: 'Price updated',
        priceCalcFailed: 'Could not update price',
        selectSize: 'Please select a size',
        addToCart: 'Add to cart',
        addToWishlist: 'Add to wishlist',
        engraving: 'Engraving',
        engravingText: 'Engraving text',
        viewDetails: 'View details',
        outOfStock: 'Out of stock',
        inStock: 'In stock'
    },

    order: {
        placed: 'Order placed successfully',
        placeFailed: 'Failed to place order',
        notFound: 'Order not found',
        listEmpty: 'You have no orders yet',
        title: 'My Orders',
        orderNumber: 'Order #',
        placedOn: 'Placed on',
        total: 'Total',
        status: 'Status',
        viewDetails: 'View details',
        shippingAddress: 'Shipping address',
        billingAddress: 'Billing address',
        sameAsShipping: 'Billing same as shipping',
        placeOrder: 'Place order',
        placing: 'Placing...'
    },

    account: {
        profile: 'Profile',
        addresses: 'My Addresses',
        myOrders: 'My Orders',
        wishlist: 'Wishlist',
        coupons: 'Coupons',
        settings: 'Settings',
        updateProfile: 'Update profile',
        profileUpdated: 'Profile updated',
        addressAdded: 'Address added',
        addressUpdated: 'Address updated',
        addressRemoved: 'Address removed',
        defaultAddress: 'Default address',
        setDefault: 'Set as default'
    },

    search: {
        placeholder: 'Search for jewelry...',
        noResults: 'No results found',
        searching: 'Searching...'
    },

    validation: {
        required: 'This field is required',
        emailInvalid: 'Please enter a valid email',
        phoneInvalid: 'Please enter a valid phone number',
        passwordWeak:
            'Password must be at least 8 characters and include uppercase, lowercase, number and a symbol.',
        otpInvalidFormat: 'OTP must be 6 digits',
        passwordsMustMatch: 'Passwords must match'
    }
} as const;

export default M;
