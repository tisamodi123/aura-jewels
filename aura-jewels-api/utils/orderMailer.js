import Order from "../models/order.model.js";
import { OrderMailContentTemplate } from "../mailtemplates/order.mail.js";
import { sendEmail } from "./sendEmail.js";
import { MAIL } from "../config/mail.config.js";
import path from "path";
import fs from "fs";
import Constant from "../constants/user.constant.js";

// Sends the customer order-CONFIRMATION email for a PAID order. Lives here (not
// in a controller) so every path that confirms payment — checkout verify, the
// Razorpay webhook, wallet-at-placement, and admin reconcile — can call it
// through the single idempotent finalize step, and a confirmation is sent
// exactly once, only after money is actually taken. Fire-and-forget by contract:
// SMTP problems must never fail the payment.
export const sendOrderConfirmationEmail = async (orderId) => {
    const populatedOrder = await Order.findById(orderId)
        .populate("user", "firstName lastName email phone")
        .populate({ path: "items", populate: { path: "sizeId" } });
    if (!populatedOrder) return;
    const emailTo = populatedOrder.shippingAddress?.email || populatedOrder.user?.email;
    if (!emailTo) return;

    const mailHtml = OrderMailContentTemplate(populatedOrder);

    const receiptItem = (populatedOrder.receipts || []).find(r => r.type === Constant.RECEIPT_TYPES.RECEIPT);
    const detailItem = (populatedOrder.receipts || []).find(r => r.type === Constant.RECEIPT_TYPES.DETAIL_RECEIPT);

    const receiptFilename = receiptItem?.fileName || `receipt-${populatedOrder.orderId || populatedOrder._id.toString()}.pdf`;
    const detailFilename = detailItem?.fileName || `detail-${populatedOrder.orderId || populatedOrder._id.toString()}.pdf`;
    const receiptDir = path.join(process.cwd(), 'uploads', 'receipts');
    const receiptPath = path.join(receiptDir, receiptFilename);
    const detailPath = path.join(receiptDir, detailFilename);

    const attachments = [];
    const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== "true";

    if (fs.existsSync(receiptPath)) {
        attachments.push({
            filename: `Receipt-${populatedOrder.orderId || 'Order'}.pdf`,
            path: receiptPath
        });
    } else if (receiptItem?.fileName) {
        let attachmentPath = "";
        if (useAWS) {
            const uploadPath = process.env.AWS_UPLOAD_PATH || "";
            attachmentPath = `${uploadPath}website-assets/receipts/${receiptItem.fileName}`;
        } else {
            attachmentPath = path.join(process.cwd(), 'uploads', 'receipts', receiptItem.fileName);
        }
        attachments.push({
            filename: `Receipt-${populatedOrder.orderId || 'Order'}.pdf`,
            path: attachmentPath
        });
    }
    if (fs.existsSync(detailPath)) {
        attachments.push({
            filename: `Order-Details-${populatedOrder.orderId || 'Order'}.pdf`,
            path: detailPath
        });
    } else if (detailItem?.fileName) {
        let attachmentPath = "";
        if (useAWS) {
            const uploadPath = process.env.AWS_UPLOAD_PATH || "";
            attachmentPath = `${uploadPath}website-assets/receipts/${detailItem.fileName}`;
        } else {
            attachmentPath = path.join(process.cwd(), 'uploads', 'receipts', detailItem.fileName);
        }
        attachments.push({
            filename: `Order-Details-${populatedOrder.orderId || 'Order'}.pdf`,
            path: attachmentPath
        });
    }

    const emailOpts = {
        from: MAIL.senders.order,
        attachments
    };

    await sendEmail(
        emailTo,
        `Aura Jewels Order Confirmation - #${populatedOrder.orderId || populatedOrder._id.toString().substring(0, 8).toUpperCase()}`,
        mailHtml,
        emailOpts
    );

    // Also send to admin if configured
    // if (MAIL.adminEmail && MAIL.adminEmail !== emailTo) {
    //     await sendEmail(
    //         MAIL.adminEmail,
    //         `[Admin Alert] Aura Jewels Order Successful - #${populatedOrder.orderId || populatedOrder._id.toString().substring(0, 8).toUpperCase()}`,
    //         mailHtml,
    //         emailOpts
    //     ).catch((err) => console.error("Admin order confirmation email error:", err));
    // }

    // clean after send mail
    // if (useAWS) {
    //     try {
    //         if (fs.existsSync(receiptPath)) fs.unlinkSync(receiptPath);
    //         if (fs.existsSync(detailPath)) fs.unlinkSync(detailPath);
    //     } catch (cleanupErr) {
    //         console.error("Failed to delete temp local PDFs:", cleanupErr);
    //     }
    // }
};
