import Joi from 'joi';
import Constant from '../constants/user.constant.js';

const objectId = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Must be a valid ObjectId'
});

const addressSchema = Joi.object({
    firstName: Joi.string().trim().min(1).required(),
    lastName: Joi.string().trim().min(1).required(),
    address: Joi.string().trim().allow('', null).optional(),
    city: Joi.string().trim().allow('', null).optional(),
    state: Joi.string().trim().allow('', null).optional(),
    country: Joi.string().trim().allow('', null).optional(),
    zipCode: Joi.string().trim().allow('', null).optional(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().min(6).required()
});

export const placeOrderSchema = Joi.object({
    shippingAddress: addressSchema.required(),
    hasBilling: Joi.boolean().default(false),
    billingAddress: Joi.when('hasBilling', {
        is: true,
        then: addressSchema.required(),
        otherwise: Joi.any().strip()
    }),
    // Applied coupon — must be declared or stripUnknown drops it and the
    // discount is never applied server-side at placement (H2).
    couponCode: Joi.string().trim().allow('', null).optional(),
    coupon: Joi.string().trim().allow('', null).optional(),
    // Store-wallet amount (INR) the customer chose to apply. Clamped
    // server-side to balance + order total; declared so stripUnknown keeps it.
    walletAmount: Joi.number().min(0).optional(),
    notes: Joi.string().trim().allow('', null).optional(),
    isGst: Joi.boolean().default(false),
    gstNo: Joi.when('isGst', {
        is: true,
        then: Joi.string().trim().min(1).required(),
        otherwise: Joi.string().allow('', null).optional()
    }),
    companyName: Joi.when('isGst', {
        is: true,
        then: Joi.string().trim().min(1).required(),
        otherwise: Joi.string().allow('', null).optional()
    }),
    items: Joi.array().items(Joi.object().unknown(true)).optional(),
});

export const orderIdParamSchema = Joi.object({
    id: objectId.required()
});

export const myOrdersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().allow('', null).optional()
});

export const myOrdersBodySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().allow('', null).optional()
});

export const verifyPaymentSchema = Joi.object({
    orderId: objectId.required(),
    paymentDetails: Joi.object({
        // Staging (no gateway configured) path uses status; the real gateway
        // uses the signed callback fields below — declared so stripUnknown
        // keeps them. `isDummy`/`gateway` are deliberately NOT accepted: the
        // dummy branch is chosen from server state only, never from the client.
        // Accepting them let anyone mark any order PAID for free.
        status: Joi.string().valid("success", "failed").optional(),
        transactionId: Joi.string().allow("").optional(),
        razorpay_order_id: Joi.string().allow("").optional(),
        razorpay_payment_id: Joi.string().allow("").optional(),
        razorpay_signature: Joi.string().allow("").optional(),
        method: Joi.string().allow("").optional(),
    }).required()
});

export const listOrdersSchema = Joi.object({
    orderStatusId: Joi.alternatives().try(Joi.string().allow(''), Joi.array().items(Joi.string())).optional(),
    search: Joi.string().allow('').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(10)
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.alternatives().try(
        Joi.string().valid(...Constant.ORDER_STATUS.ALL_TYPES),
        Joi.string().valid(...Object.keys(Constant.ORDER_STATUS).filter(k => k !== 'ALL_TYPES'))
    ).required(),
    // Optional context sent alongside a status change — otherwise stripUnknown
    // drops the admin's refund form + tracking/reason (used by emails + refund).
    trackingId: Joi.string().allow('', null).optional(),
    courier: Joi.string().allow('', null).optional(),
    reason: Joi.string().allow('', null).optional(),
    // The admin Reject/Cancel modal sends the reason as `rejectReason` — accept
    // it so stripUnknown doesn't drop the cancellation/rejection reason.
    rejectReason: Joi.string().allow('', null).optional(),
    remark: Joi.string().allow('', null).optional(),
    // `gateway` = refund to the original payment source via the gateway (the model
    // already allows it; the validator was dropping it, so gateway refunds 400'd).
    refundType: Joi.string().valid('wallet', 'bank', 'gateway', 'none').optional(),
    refundAmount: Joi.number().min(0).optional(),
    accountHolderName: Joi.string().allow('', null).optional(),
    bankName: Joi.string().allow('', null).optional(),
    accountNumber: Joi.string().allow('', null).optional(),
    ifscCode: Joi.string().allow('', null).optional(),
    refundRemarks: Joi.string().allow('', null).optional(),
});

export const updateOrderTrackingSchema = Joi.object({
    trackingNumber: Joi.string().allow("").optional(),
    shippingCarrier: Joi.string().allow("").optional(),
    trackingUrl: Joi.string().allow("").optional(), // Allow empty string or raw string for flex URLs
    estimatedDeliveryDate: Joi.date().iso().allow(null).optional()
});

export const changeOrderItemStatusSchema = Joi.object({
    orderId: objectId.optional(),
    orderdetailId: objectId.required(),
    statusId: Joi.alternatives().try(
        Joi.string().valid(...Constant.ORDER_STATUS.ALL_TYPES),
        Joi.string().valid(...Object.keys(Constant.ORDER_STATUS).filter(k => k !== 'ALL_TYPES'))
    ).required(),
    rejectReason: Joi.string().allow("").optional(),
    remark: Joi.string().allow("").optional(),
    courier: Joi.string().allow("").optional(),
    trackingcode: Joi.string().allow("").optional(),
    trackingurl: Joi.string().allow("").optional(),
    // Item-level refund form (was missing entirely, so a per-item refund's
    // details were stripped and never processed).
    refundType: Joi.string().valid('wallet', 'bank', 'gateway', 'none').optional(),
    refundAmount: Joi.number().min(0).optional(),
    accountHolderName: Joi.string().allow('', null).optional(),
    bankName: Joi.string().allow('', null).optional(),
    accountNumber: Joi.string().allow('', null).optional(),
    ifscCode: Joi.string().allow('', null).optional(),
    refundRemarks: Joi.string().allow('', null).optional()
});

export const ChangeOrderPaymentStatusSchema = Joi.object({
    orderId: objectId.required(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed", "refund pending", "refund processing", "refund success").optional(),
    status_flag: Joi.string().valid("success", "failed").optional(),
    statusId: Joi.string().optional(),
    transactionId: Joi.string().allow("").optional(),
    payment_method: Joi.string().allow("").optional()
}).or('paymentStatus', 'status_flag');

export const requestReturnItemSchema = Joi.object({
    reason: Joi.string().trim().min(1).required(),
    refundType: Joi.string().valid('wallet', 'bank', 'gateway', 'none').optional(),
    refundMethod: Joi.string().optional(),
    accountHolderName: Joi.string().allow('', null).optional(),
    bankName: Joi.string().allow('', null).optional(),
    accountNumber: Joi.string().allow('', null).optional(),
    ifscCode: Joi.string().allow('', null).optional(),
    bankDetails: Joi.object({
        accountHolderName: Joi.string().allow('', null).optional(),
        accountholdername: Joi.string().allow('', null).optional(),
        accountNumber: Joi.string().allow('', null).optional(),
        accountnumber: Joi.string().allow('', null).optional(),
        bankName: Joi.string().allow('', null).optional(),
        bankname: Joi.string().allow('', null).optional(),
        ifscCode: Joi.string().allow('', null).optional(),
        ifsccode: Joi.string().allow('', null).optional()
    }).optional()
});

export const customerCancelSchema = Joi.object({
    refundType: Joi.string().valid('wallet', 'bank', 'gateway', 'none').required(),
    accountHolderName: Joi.string().allow('', null).optional(),
    bankName: Joi.string().allow('', null).optional(),
    accountNumber: Joi.string().allow('', null).optional(),
    ifscCode: Joi.string().allow('', null).optional(),
    reason: Joi.string().allow('', null).optional(),
    bankDetails: Joi.object({
        accountHolderName: Joi.string().allow('', null).optional(),
        accountholdername: Joi.string().allow('', null).optional(),
        accountNumber: Joi.string().allow('', null).optional(),
        accountnumber: Joi.string().allow('', null).optional(),
        bankName: Joi.string().allow('', null).optional(),
        bankname: Joi.string().allow('', null).optional(),
        ifscCode: Joi.string().allow('', null).optional(),
        ifsccode: Joi.string().allow('', null).optional()
    }).optional()
});


