import { list_gateway_configs_admin, save_gateway_config } from "../services/paymentConfig.services.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

// GET /setting/payment-gateways (admin) — secrets are masked, never plaintext.
export const getPaymentGateways = async (req, res) => {
    try {
        const data = await list_gateway_configs_admin();
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Payment gateways fetched",
            data,
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

// PUT /setting/payment-gateway (admin) — upsert one provider. Blank secret fields
// leave the stored (encrypted) values unchanged. Enabling one disables others.
export const savePaymentGateway = async (req, res) => {
    try {
        const provider = String(req.body?.provider || "").toLowerCase();
        if (!["razorpay", "ccavenue"].includes(provider)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Unsupported payment provider.",
            });
        }
        const data = await save_gateway_config(provider, req.body, req.user?.userId);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Payment gateway saved",
            data,
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
