import callApi from '@/lib/commonApi';
import { getToken } from '@/services/clientCookies';
import { ENDPOINTS } from '@/lib/Api_Url';

// Current customer's wallet balance (INR base; display is converted by the
// storefront's currency utils).
export const getWallet = async (): Promise<any> => {
    const token = getToken();
    return callApi(ENDPOINTS.WALLET.GET_WALLET, 'GET', null, token);
};

// Paginated wallet transaction ledger.
export const getWalletTransactions = async (page = 1, limit = 20): Promise<any> => {
    const token = getToken();
    return callApi(`${ENDPOINTS.WALLET.GET_TRANSACTIONS}?page=${page}&limit=${limit}`, 'GET', null, token);
};
