import mongoose from "mongoose";
import ContactInquiry from "../models/contactInquiry.model.js";

import { sendEmail } from "../utils/sendEmail.js";
import { contactInquiryCustomerEmail, contactInquiryAdminEmail } from "../mailtemplates/contact.mail.js";
import { MAIL } from "../config/mail.config.js";

// The search term goes straight into a RegExp. Without escaping, a visitor
// searching for "a(" throws, and "(a+)+$" is a ReDoS.
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Persist a contact-us submission and notify both sides.
 *
 * Mail is fire-and-forget: an SMTP outage must never lose the customer's
 * message or surface as a failed form submit — the row is already saved and
 * the admin can still see it in the panel.
 */
export const createContactInquiry = async (payload) => {
    const inquiry = await ContactInquiry.create(payload);

    sendEmail(
        inquiry.email,
        `We've received your message - #${inquiry._id.toString().slice(-8).toUpperCase()}`,
        contactInquiryCustomerEmail(inquiry),
        { from: MAIL.senders.support }
    ).catch((err) => console.error("Failed to send contact confirmation email:", err));

    sendEmail(
        MAIL.adminEmail,
        `New Contact Inquiry: ${inquiry.subject}`,
        contactInquiryAdminEmail(inquiry)
    ).catch((err) => console.error("Failed to send contact admin email:", err));

    return inquiry;
};

/** Admin list: paginated, newest first, optional status/subject filter + search. */
export const getContactInquiryList = async (filter = {}, page = 1, limit = 20, search = "") => {
    const skip = (page - 1) * limit;
    const query = { ...filter, isDeleted: 0 };

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        query.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { subject: searchRegex },
            { message: searchRegex },
        ];
    }

    const [total, inquiries] = await Promise.all([
        ContactInquiry.countDocuments(query),
        ContactInquiry.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
    ]);

    return { total, inquiries };
};

export const getContactInquiryById = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;

    return await ContactInquiry.findOne({ _id: id, isDeleted: 0 }).lean();
};

export const updateContactInquiryStatus = async (id, status, adminNotes) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid inquiry ID format");
    }

    const update = { status };
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    // findOneAndUpdate fires the pre-hook that stamps contactedAt / resolvedAt.
    // Returns null when the row is missing or already soft-deleted; the caller
    // turns that into a 404 rather than reporting a phantom success.
    return await ContactInquiry.findOneAndUpdate(
        { _id: id, isDeleted: 0 },
        update,
        { returnDocument: "after" }
    ).lean();
};

export const deleteContactInquiry = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid inquiry ID format");
    }

    return await ContactInquiry.findOneAndUpdate(
        { _id: id, isDeleted: 0 },
        { isDeleted: 1 },
        { returnDocument: "after" }
    ).lean();
};
