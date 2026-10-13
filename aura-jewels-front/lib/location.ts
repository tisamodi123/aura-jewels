import { useGlobleStore } from "@/store/globleStore";
import { DEFAULT_COUNTRY, ENDPOINTS } from "./Api_Url";
import { callApi } from "./commonApi";
import { getCookie, setCookie } from "@/services/clientCookies";

let locationPromise: Promise<any> | null = null;

export const detectLocation = async () => {
    if (locationPromise) return locationPromise;

    locationPromise = (async () => {
        const { setRegion } = useGlobleStore.getState();

        try {
            let detectedCountry: string | null = getCookie('x-country-code') || null;

            // 1. If cookie not present, call /api/geo FIRST
            if (!detectedCountry) {
                try {
                    const geoRes = await fetch('/api/geo');
                    const geoData = await geoRes.json();
                    detectedCountry = geoData?.country || null;
                    if (detectedCountry) {
                        setCookie('x-country-code', detectedCountry, 30);
                    }
                } catch (err) {
                    console.log("Geo IP check failed:", err);
                }
            }

            if (detectedCountry) {
                setRegion(
                    detectedCountry,
                    detectedCountry === 'IN' ? 'INR' : 'USD',
                    detectedCountry === 'IN' ? '₹' : '$',
                    1
                );
            }

            // 2. Fetch setting currency info using detected country
            const json = await callApi(ENDPOINTS.SETTING.GET_CURRENCY_INFO);

            console.log("GET_CURRENCY_INFO json:", json);

            if (json?.success && json?.data) {
                const {
                    country,
                    currencyCode,
                    currencySymbol,
                    exchangeRate,
                } = json.data;

                setRegion(
                    country,
                    currencyCode,
                    currencySymbol,
                    exchangeRate
                );
            } else if (!detectedCountry) {
                setRegion(
                    DEFAULT_COUNTRY || "IN",
                    "INR",
                    "₹",
                    1
                );
            }
        } catch (error) {
            console.error("Error detecting location:", error);
            if (!getCookie('x-country-code')) {
                setRegion(
                    DEFAULT_COUNTRY || "IN",
                    "INR",
                    "₹",
                    1
                );
            }
        }
    })();

    return locationPromise;
};