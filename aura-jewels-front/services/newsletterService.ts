import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";

export interface NewsletterSubscriptionPayload {
    email: string;
}

// Public endpoint — deliberately no token. Passing one would make callApi treat
// a 403 as an expired session and bounce the visitor to /sign-in.
export const subscribeNewsletter = async (data: NewsletterSubscriptionPayload): Promise<any> =>
    await callApi(ENDPOINTS.NEWSLETTER.SUBSCRIBE, "POST", data);
