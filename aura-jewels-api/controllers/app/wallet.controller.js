import { get_wallet_balance_db, get_wallet_transactions_db } from "../../services/wallet.services.js";
import { getExchangeRateFromRequest } from "../../utils/currencyConvertor.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";

// Wallet balances/amounts are stored in INR. Convert to the request's display
// currency (same rate the rest of the storefront uses) so the frontend's
// formatPrice — which only applies the symbol, not conversion — shows the
// correct value. INR requests resolve to rate 1 (no-op).
const convert = (amount, rate) => (rate && rate > 0 ? parseFloat((Number(amount || 0) / rate).toFixed(2)) : Number(amount || 0));

// GET /app/wallet — current customer's balance (display currency).
export const getWallet = async (req, res) => {
    try {
        const { rate, currency } = await getExchangeRateFromRequest(req);
        const data = await get_wallet_balance_db(req.user.userId);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Wallet fetched successfully",
            data: {
                balance: convert(data.balance, rate),
                currency: currency || "INR",
                walletId: data.walletId,
                baseBalance: data.balance, // raw INR, for reference
                baseCurrency: "INR",
            },
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

// GET /app/wallet/transactions — paginated ledger (amounts in display currency).
export const getWalletTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { rate } = await getExchangeRateFromRequest(req);
        const result = await get_wallet_transactions_db(req.user.userId, page, limit);
        const data = result.data.map((t) => {
            const obj = t.toObject ? t.toObject() : t;
            return { ...obj, amount: convert(obj.amount, rate), balanceAfter: convert(obj.balanceAfter, rate) };
        });
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Wallet transactions fetched successfully",
            data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
