import { FormikProps } from 'formik';

export interface BespokeFormValues {
    categoryId: string;
    otherProduct: string;
    metalId: string;
    approxMetalWeight: string;
    ringSizeId: string;
    braceletSize: string;
    stoneType: string;
    approxStoneWeight: string;
    gemstonePreference: string;
    budget: string;
    engraving: string;
    remarks: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    countryCode: string;
    referenceUrls: string[];
    attachments: File[];
    country: string;
}

export type BespokeFormikProps = FormikProps<BespokeFormValues>;
