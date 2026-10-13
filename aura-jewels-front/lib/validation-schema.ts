import * as Yup from 'yup';

export const sanitizeNameInput = (val: string): string => {
    if (!val) return '';
    let clean = val.replace(/[^a-zA-Z\s]/g, '');
    clean = clean.replace(/^\s+/, '');
    clean = clean.replace(/\s{2,}/g, ' ');
    return clean;
};

export const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
export const nameValidationMsg = 'Name can only contain alphabets and single spaces';

export const firstNameSchema = Yup.string()
    .transform((val) => (typeof val === 'string' ? val.trim() : val))
    .matches(nameRegex, nameValidationMsg)
    .required('First name is required');

export const lastNameSchema = Yup.string()
    .transform((val) => (typeof val === 'string' ? val.trim() : val))
    .matches(nameRegex, nameValidationMsg)
    .required('Last name is required');

export const mobileNumberSchema = Yup.string()
    .matches(/^(91)?[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .required('Mobile number is required');

// Login / Signup / Mobile number validation schema
export const authSchema = Yup.object({
    mobileNumber: mobileNumberSchema,
});

export const agreeTermsSchema = Yup.boolean()
    .oneOf([true], 'You must agree to the Terms & Conditions and Privacy Policy')
    .required('You must agree to the Terms & Conditions and Privacy Policy');

export const indianSignUpSchema = Yup.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    mobileNumber: mobileNumberSchema,
    agreeTerms: agreeTermsSchema,
});

export const internationalSignUpSchema = Yup.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
        .min(10, 'Phone number is too short')
        .required('Phone number is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    agreeTerms: agreeTermsSchema,
});

export const internationalSignInSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

// My Profile validation schema
export const profileSchema = Yup.object().shape({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    // Email is optional — phone-login customers may not have one yet. Must
    // be verified separately (Verify button) before it's trusted for receipts.
    email: Yup.string().email('Invalid email').nullable(),
    // Phone is the login identity and is shown read-only here.
    phone: Yup.string().nullable(),
    whatsappNumber: Yup.string()
        .nullable()
        .notRequired()
        .test('len', 'WhatsApp number must be 10 digits', (val) => !val || /^\d{10}$/.test(val)),
    birthday: Yup.date().nullable(),
    anniversary: Yup.date().nullable(),
    instagram: Yup.string(),
    facebook: Yup.string(),
});

// My Address validation schema
export const addressSchema = Yup.object().shape({
    firstName: Yup.string()
        .transform((val) => (typeof val === 'string' ? val.trim() : val))
        .matches(nameRegex, nameValidationMsg)
        .required('First Name is required'),
    lastName: Yup.string()
        .transform((val) => (typeof val === 'string' ? val.trim() : val))
        .matches(nameRegex, nameValidationMsg)
        .required('Last Name is required'),
    address: Yup.string().required('Address is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits').required('Mobile number is required'),
    isDefault: Yup.boolean()
});

// Bespoke inquiry form validation schema
export const bespokeFormSchema = Yup.object().shape({
    categoryId: Yup.string().required('Product type is required'),
    otherProduct: Yup.string().when('categoryId', {
        is: 'Other',
        then: (schema) => schema.required('Product Name is required for Other category').trim(),
        otherwise: (schema) => schema.notRequired(),
    }),
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    countryCode: Yup.string().notRequired(),
    email: Yup.string()
        .email('Please enter a valid email address')
        .trim()
        .when('countryCode', {
            is: '+91',
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.required('Email is required'),
        }),
    mobileNumber: Yup.string()
        .required('Mobile Number is required')
        .trim()
        .test('is-not-only-dialcode', 'Mobile Number is required', function (value) {
            if (!value) return false;
            const { countryCode } = this.parent;
            if (countryCode) {
                const cleanPhone = value.replace(/\D/g, '');
                const cleanDial = countryCode.replace(/\D/g, '');
                return cleanPhone !== cleanDial;
            }
            return true;
        }),
});

export const orderInquirySchema = Yup.object().shape({
    sku: Yup.string().required('SKU is required'),
    name: Yup.string()
        .transform((val) => (typeof val === 'string' ? val.trim() : val))
        .matches(nameRegex, nameValidationMsg)
        .required('Name is required'),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required')
        .trim(),
    mobileNumber: Yup.string()
        .required('Phone Number is required')
        .trim(),
    notes: Yup.string().notRequired().trim(),
});

export const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Please enter a valid email address').required('Email is required').trim(),
});

export const resetPasswordSchema = Yup.object().shape({
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
});


