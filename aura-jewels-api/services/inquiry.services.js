import mongoose from "mongoose";
import Inquiry from "../models/orderInquiry.model.js";
import ProductMaster from "../models/product.model.js";
import { appendMediaUrls } from "../utils/imageUrl.js";

import { sendEmail } from "../utils/sendEmail.js";
import { OrderInquiryCustomerMailTemplate } from "../mailtemplates/inquiry.mail.js";
import { newInquiryAdminEmail } from "../mailtemplates/admin.mail.js";
import { MAIL } from "../config/mail.config.js";

// create
export const createInquiry = async (payload) => {
    const { sku, productId, ...rest } = payload;

    const inquiry = await Inquiry.create({
        ...rest,
        sku,
        productId
    });

    // Send email to customer asynchronously
    if (inquiry.email) {
        // Resolve product title if productId is provided
        let productTitle = "";
        if (productId) {
            const product = await ProductMaster.findById(productId, { productTitle: 1 }).lean();
            productTitle = product?.productTitle || "";
        }

        const html = OrderInquiryCustomerMailTemplate({
            _id: inquiry._id,
            sku: inquiry.sku,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            notes: inquiry.notes,
            productTitle
        });

        sendEmail(inquiry.email, `Inquiry Received - #${inquiry._id.toString().slice(-8).toUpperCase()}`, html, { from: MAIL.senders.support })
            .catch(err => console.error("Failed to send inquiry confirmation email:", err));

        // Notify the internal team (was previously customer-only).
        sendEmail(MAIL.adminEmail, `New Inquiry from ${inquiry.name || inquiry.email}`,
            newInquiryAdminEmail({ name: inquiry.name, email: inquiry.email, phone: inquiry.phone, productTitle, message: inquiry.notes }))
            .catch(err => console.error("Failed to send admin inquiry email:", err));
    }

    return inquiry;
};

// listing 
export const getInquiryList = async (filter = {}, page = 1, limit = 20, search = "") => {
    const skip = (page - 1) * limit;

    const query = { ...filter, isDeleted: 0 };
    if (query.createdBy) {
        if (typeof query.createdBy === "string" && mongoose.Types.ObjectId.isValid(query.createdBy)) {
            query.createdBy = new mongoose.Types.ObjectId(query.createdBy);
        } else if (query.createdBy.$in) {
            query.createdBy = {
                $in: query.createdBy.$in.map(id =>
                    typeof id === "string" && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
                )
            };
        }
    }

    if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { sku: searchRegex }
        ];
    }

    const pipeline = [
        { $match: query },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    // Lookup ProductMaster (productId ref)
                    {
                        $lookup: {
                            from: "productmasters",
                            localField: "productId",
                            foreignField: "_id",
                            as: "product"
                        },

                    },
                    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
                    // Apply appendMediaUrls to populated product
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy"
                        }
                    },
                    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1,
                            sku: 1,
                            name: 1,
                            email: 1,
                            phone: 1,
                            notes: 1,
                            status: 1,
                            adminNotes: 1,
                            contactedAt: 1,
                            resolvedAt: 1,
                            isDeleted: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            images: "$product.images",
                            product_id: "$product._id",
                            productTitle: "$product.productTitle",
                            slug: "$product.slug",
                            itemCode: "$product.itemCode",
                            countryCode: 1,
                            createdBy: {
                                _id: "$createdBy._id",
                                name: "$createdBy.name",
                                email: "$createdBy.email",
                                role: "$createdBy.role"
                            }
                        }
                    },
                    appendMediaUrls(),
                    {
                        $project: {
                            _id: 1,
                            sku: 1,
                            name: 1,
                            email: 1,
                            phone: 1,
                            countryCode: 1,
                            notes: 1,
                            status: 1,
                            adminNotes: 1,
                            contactedAt: 1,
                            resolvedAt: 1,
                            isDeleted: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            productId: {
                                _id: "$product_id",
                                productTitle: "$productTitle",
                                slug: "$slug",
                                itemCode: "$itemCode",
                                images: "$images"
                            },
                            createdBy: 1
                        }
                    }
                ]
            }
        }
    ];

    const results = await Inquiry.aggregate(pipeline);
    const total = results[0]?.metadata[0]?.total || 0;
    let inquiries = results[0]?.data || [];

    return { total, inquiries };
};

// detail 
export const getInquiryById = async (id) => {
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const { inquiries } = await getInquiryList({ _id: new mongoose.Types.ObjectId(id) }, 1, 1);
        return inquiries[0] || null;
    } catch (error) {
        console.error("getInquiryById error:", error);
        return null;
    }
};

// update status
export const updateInquiryStatus = async (id, status, adminNotes) => {
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid Inquiry ID format");
        }
        const exist = await Inquiry.findOne({ _id: id, isDeleted: 0 }).select("_id").lean();
        if (!exist) {
            throw new Error("Inquiry not found or already deleted");
        }

        const update = { status };
        if (adminNotes !== undefined) update.adminNotes = adminNotes;

        return await Inquiry.findOneAndUpdate(
            { _id: id, isDeleted: 0 },
            update,
            { returnDocument: "after" }
        ).lean();
    } catch (error) {
        console.error("updateInquiryStatus error:", error);
        throw error;
    }
};

// soft delete 
export const deleteInquiry = async (id) => {
    try {
        const exist = await Inquiry.findOne({ _id: id, isDeleted: 0 }).select("_id").lean();
        if (!exist) {
            throw new Error("Inquiry not found or already deleted");
        }

        return await Inquiry.findOneAndUpdate(
            { _id: id, isDeleted: 0 },
            { isDeleted: 1 },
            { returnDocument: "after" }
        ).lean();
    } catch (error) {
        console.error("deleteInquiry error:", error);
        throw error;
    }
};