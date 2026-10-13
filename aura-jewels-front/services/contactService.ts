import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";

export interface ContactInquiryPayload {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
}

// Public endpoint — deliberately no token. Passing one would make callApi treat
// a 403 as an expired session and bounce the visitor to /sign-in.
export const submitContactInquiry = async (data: ContactInquiryPayload): Promise<any> =>
    await callApi(ENDPOINTS.CONTACT.SUBMIT, "POST", data);
