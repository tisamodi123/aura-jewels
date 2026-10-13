import { delete_subscription_by_id, get_subscription_list, subscribe, unsubscribe } from "../services/subscription.services.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export const subscribeEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const subscription = await subscribe(email);

        return res.status(STATUS_CODE.CREATED).json({
            errorCode: STATUS_CODE.CREATED,
            message: MESSAGES.SUBSCRIPTION.SUBSCRIBED,
            data: subscription,
        });

    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const unsubscribeEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const updated = await unsubscribe(email);

        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.SUBSCRIPTION.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.SUBSCRIPTION.UNSUBSCRIBED,
            data: updated,
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const getSubscriptionList = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.body;

        const { total, subscriptions } = await get_subscription_list(
            Number(page),
            Number(limit),
            search
        );

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            total,
            data: subscriptions,
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const deleted = await delete_subscription_by_id(req.params.id);

        if (!deleted) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.DELETED,
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
