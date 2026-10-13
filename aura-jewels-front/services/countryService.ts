import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";

export const getCountries = async () => {
    return callApi(ENDPOINTS.COUNTRY.GET_COUNTRIES, "GET");
};
