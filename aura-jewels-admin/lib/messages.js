export const M = {
    common: {
        loading: 'Loading...',
        somethingWentWrong: 'Something went wrong',
        sessionExpired: 'Session expired. Please login again.',
        networkError: 'Network error. Please try again.',
        noData: 'No data found',
        success: 'Success',
        fetchFailed: 'Failed to fetch',
        updateFailed: 'Failed to update',
        deleteFailed: 'Failed to delete',
        createFailed: 'Failed to create',
        confirmDelete: 'Are you sure you want to delete this?',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        search: 'Search',
        actions: 'Actions',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        all: 'All'
    },

    auth: {
        loggedIn: 'Logged in successfully',
        loggedOut: 'Logged out',
        resetLinkSent: 'Reset link sent to your email',
        passwordResetSuccess: 'Password reset successful',
        passwordsDoNotMatch: 'Passwords do not match',
        invalidCredentials: 'Invalid credentials',
        labels: {
            email: 'Email',
            password: 'Password',
            newPassword: 'New password',
            confirmNewPassword: 'Confirm new password',
            login: 'Login',
            forgotPassword: 'Forgot password?',
            resetPassword: 'Reset password',
            sendResetLink: 'Send reset link',
            backToLogin: 'Back to login'
        }
    },

    order: {
        listFetched: 'Orders fetched',
        listFetchFailed: 'Failed to fetch order list.',
        detailFetched: 'Order details fetched',
        detailFetchFailed: 'Failed to fetch order details.',
        statusUpdated: 'Order status updated',
        statusUpdateFailed: 'Failed to update order status',
        title: 'Orders',
        orderNumber: 'Order #',
        customer: 'Customer',
        total: 'Total',
        items: 'Items',
        placedOn: 'Placed on'
    },

    product: {
        listFetched: 'Products fetched',
        listFetchFailed: 'Failed to fetch products',
        created: 'Product created',
        updated: 'Product updated',
        deleted: 'Product deleted',
        statusUpdated: 'Product status updated',
        importStarted: 'Product import started',
        title: 'Products'
    },

    customer: {
        listFetched: 'Customers fetched',
        listFetchFailed: 'Failed to fetch customers',
        created: 'Customer created',
        updated: 'Customer updated',
        deleted: 'Customer deleted',
        statusUpdated: 'Customer status updated',
        title: 'Customers'
    },

    staff: {
        created: 'Staff created',
        updated: 'Staff updated',
        deleted: 'Staff deleted',
        statusUpdated: 'Staff status updated',
        title: 'Staff'
    },

    category: {
        created: 'Category created',
        updated: 'Category updated',
        deleted: 'Category deleted',
        statusUpdated: 'Category status updated',
        title: 'Categories'
    },

    collection: {
        created: 'Collection created',
        updated: 'Collection updated',
        deleted: 'Collection deleted',
        statusUpdated: 'Collection status updated',
        title: 'Collections'
    },

    metal: {
        created: 'Metal created',
        updated: 'Metal updated',
        deleted: 'Metal deleted',
        statusUpdated: 'Metal status updated',
        priceSynced: 'Metal prices synced',
        title: 'Metals'
    },

    charges: {
        created: 'Charge created',
        updated: 'Charge updated',
        deleted: 'Charge deleted',
        statusUpdated: 'Charge status updated',
        title: 'Charges'
    },

    stoneGroup: {
        imported: 'Stone group imported',
        updated: 'Stone group updated',
        statusUpdated: 'Stone group status updated',
        exported: 'Stone group exported',
        title: 'Stone Groups'
    },

    parameter: {
        created: 'Parameter created',
        updated: 'Parameter updated',
        deleted: 'Parameter deleted',
        statusUpdated: 'Parameter status updated',
        title: 'Parameters'
    },

    size: {
        created: 'Size created',
        updated: 'Size updated',
        deleted: 'Size deleted',
        statusUpdated: 'Size status updated',
        title: 'Sizes'
    },

    tag: {
        created: 'Tag created',
        updated: 'Tag updated',
        deleted: 'Tag deleted',
        statusUpdated: 'Tag status updated',
        title: 'Tags'
    },

    validation: {
        required: 'This field is required',
        emailInvalid: 'Please enter a valid email',
        phoneInvalid: 'Please enter a valid phone number',
        passwordWeak:
            'Password must be at least 8 characters and include uppercase, lowercase, number and a symbol.'
    },

    home: {
        title: 'Home Page',
        sectionListFetched: 'Sections fetched',
        sectionListFetchFailed: 'Failed to fetch home sections',
        sectionFetched: 'Section fetched',
        sectionFetchFailed: 'Failed to fetch section',
        sectionUpdated: 'Section updated',
        sectionUpdateFailed: 'Failed to update section',
        imageUploadFailed: 'Image upload failed',
        labels: {
            sectionTitle: 'Section title',
            enabled: 'Enabled',
            heading: 'Heading',
            subText: 'Sub text',
            label: 'Label',
            description: 'Description',
            ctaText: 'Button text',
            redirect: 'Redirect',
            redirectType: 'Redirect type',
            redirectDirect: 'Direct link',
            redirectList: 'Go to list page',
            redirectProduct: 'Go to product',
            redirectNone: 'No redirect',
            listOf: 'List of',
            listAll: 'All products',
            listByCategory: 'By category',
            listByCollection: 'By collection',
            listByBudget: 'By budget',
            minPrice: 'Min Price',
            maxPrice: 'Max Price',
            category: 'Category',
            collection: 'Collection',
            product: 'Product',
            url: 'URL',
            image: 'Image (Desktop)',
            imageMobile: 'Image (Mobile)',
            imageMobileHint: 'Optional. Use a square-ish or portrait image for mobile screens. Desktop image is used if left empty.',
            video: 'Video',
            thumbnail: 'Thumbnail',
            items: 'Items',
            addItem: 'Add item',
            removeItem: 'Remove',
            sortOrder: 'Sort order',
            saveSection: 'Save section',
            tabs: 'Tabs',
            tabLabel: 'Tab label',
            products: 'Products',
            slides: 'Slides',
            headingLine1: 'Heading line 1',
            headingLine2: 'Heading line 2',
            brandName: 'Brand name',
            viewAllText: 'View all button text',
            rating: 'Rating',
            text: 'Text',
            name: 'Name',
            question: 'Question',
            answer: 'Answer',
            icon: 'Icon',
            align: 'Alignment',
            price: 'Price'
        }
    }
};

export default M;
