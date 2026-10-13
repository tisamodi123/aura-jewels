import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import MESSAGES from "../constants/messages.constant.js";
import { sendEmail } from "../utils/sendEmail.js";
import { subscriptionSuccessEmail } from "../mailtemplates/subscription.mail.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const subscribe = async (email) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();

        let existSubscription = await Subscription.findOne({ email: normalizedEmail });

        if (existSubscription) {
            throw new Error(MESSAGES.SUBSCRIPTION.ALREADY_SUBSCRIBED);
        }

        const subscription = await Subscription.create({ email: normalizedEmail });

        sendEmail(
            subscription.email,
            "Welcome to the Aura Jewels",
            subscriptionSuccessEmail(subscription.email)
        ).catch((err) => console.error("Failed to send subscription welcome email:", err));

        return { _id: subscription._id, email: subscription.email };
    } catch (error) {
        throw new Error(error.message || MESSAGES.SUBSCRIPTION.FAILED);
    }
};

export const get_subscription_list = async (page = 1, limit = 20, search = "") => {
    try {
        const skip = (page - 1) * limit;
        const query = {};

        if (search) {
            const searchRegex = new RegExp(escapeRegex(search), "i");
            query.email = searchRegex;
        }

        const [total, subscriptions] = await Promise.all([
            Subscription.countDocuments(query),
            Subscription.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        return { total, subscriptions };
    } catch (error) {
        throw new Error(error.message || MESSAGES.SUBSCRIPTION.FAILED_TO_GET_LIST);
    }
};

export const unsubscribe = async (email) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        let subscription = await Subscription.findOneAndDelete({ email: normalizedEmail }).lean();

        if (!subscription) {
            throw new Error(MESSAGES.SUBSCRIPTION.NOT_FOUND);
        }

        return { message: MESSAGES.SUBSCRIPTION.UNSUBSCRIBED };
    } catch (error) {
        throw new Error(error.message || MESSAGES.SUBSCRIPTION.FAILED_TO_UNSUBSCRIBE);
    }
};

export const delete_subscription_by_id = async (id) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(id).lean();

        if (!subscription) {
            throw new Error(MESSAGES.SUBSCRIPTION.NOT_FOUND);
        }

        return { message: MESSAGES.SUBSCRIPTION.DELETED };
    } catch (error) {
        throw new Error(error.message || MESSAGES.SUBSCRIPTION.FAILED_TO_DELETE);
    }
};
