import Wishlist from "../models/wishlist.model.js";
import ProductMaster from "../models/product.model.js";
import User from "../models/user.model.js";
import Constant from "../constants/user.constant.js";
import { sendWhatsAppTemplate } from "../utils/whatsapp.js";

/**
 * Periodically processes pending wishlist items to send a WhatsApp reminder.
 */
export const processWishlistReminders = async () => {
    try {
        const thresholdMinutes = Constant.WISHLIST_REMINDER_MINUTES || 60;
        const maxAgeMinutes = Constant.WISHLIST_REMINDER_MAX_AGE_MINUTES || 1440;
        const now = new Date();
        const minTime = new Date(now.getTime() - maxAgeMinutes * 60 * 1000);
        const maxTime = new Date(now.getTime() - thresholdMinutes * 60 * 1000);

        // Find active, unsent wishlist items added between 24h and Xh ago
        const pendingItems = await Wishlist.find({
            isDeleted: 0,
            isReminderSent: { $ne: true },
            createdAt: { $gte: minTime, $lte: maxTime }
        }).populate("jeweleryId").lean();

        if (!pendingItems.length) {
            return { processed: 0, messagesSent: 0 };
        }

        // Group items by userId
        const userGroups = {};
        for (const item of pendingItems) {
            if (!item.userId) continue;
            const uid = String(item.userId);
            if (!userGroups[uid]) {
                userGroups[uid] = [];
            }
            userGroups[uid].push(item);
        }

        let messagesSentCount = 0;

        for (const [userId, items] of Object.entries(userGroups)) {
            // Find the user details
            const user = await User.findById(userId).lean();
            if (!user) continue;

            const targetPhone = user.whatsappNumber || user.phone;
            if (!targetPhone) continue;

            const countryCode = user.whatsappNumber ? (user.whatsappCountryCode || "") : (user.phoneCountryCode || "");
            const fullPhoneNumber = `${countryCode}${targetPhone}`;

            // Sort user items by createdAt descending to pick the latest wishlisted one in this batch
            items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestItem = items[0];
            const product = latestItem.jeweleryId;

            if (!product) continue;

            // Resolve product image
            let imageUrl = Constant.CAMPAIGN_IMAGE_URL.WISHLIST_REMINDER;
            if (product.images && product.images.length > 0) {
                const mainImg = product.images.find(img => img.IsMainMedia) || product.images[0];
                if (mainImg && mainImg.MediaLocation) {
                    const loc = mainImg.MediaLocation;
                    imageUrl = loc.startsWith("http") ? loc : `${Constant.PRODUCT_AWS_ZOOM_IMAGE_URL || ""}${loc}`;
                }
            }

            try {
                // Send the WhatsApp template message
                await sendWhatsAppTemplate({
                    templateName: Constant.CAMPAIGN_TEMPLATE_NAME.WISHLIST_REMINDER,
                    phoneNumber: fullPhoneNumber.toString(),
                    bodyParams: [user.name || "Customer"],
                    userName: user.name || "Customer",
                    headerImageUrl: imageUrl
                });
                messagesSentCount++;
            } catch (err) {
                console.error(`Failed to send wishlist reminder to user ${userId}:`, err);
            }
        }

        // Mark all these wishlist items as sent, so we do not attempt again
        const itemIds = pendingItems.map(item => item._id);
        await Wishlist.updateMany(
            { _id: { $in: itemIds } },
            { $set: { isReminderSent: true } }
        );

        return { processed: pendingItems.length, messagesSent: messagesSentCount };
    } catch (error) {
        console.error("Error in processWishlistReminders:", error);
        throw error;
    }
};

// BACKUP - ALL PRODUCT REMINDER 
// export const processWishlistReminders = async () => {
//     try {
//         const thresholdHours = parseInt(process.env.WISHLIST_REMINDER_HOURS || "2", 10);
//         const now = new Date();
//         const minTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago max limit
//         const maxTime = new Date(now.getTime() - thresholdHours * 60 * 60 * 1000); // at least thresholdHours ago

//         // Find active, unsent wishlist items added between 24h and Xh ago
//         const pendingItems = await Wishlist.find({
//             isDeleted: 0,
//             isReminderSent: { $ne: true },
//             createdAt: { $gte: minTime, $lte: maxTime }
//         }).populate("jeweleryId").lean();

//         if (!pendingItems.length) {
//             return { processed: 0, messagesSent: 0 };
//         }

//         // Group items by userId
//         const userGroups = {};
//         for (const item of pendingItems) {
//             if (!item.userId) continue;
//             const uid = String(item.userId);
//             if (!userGroups[uid]) {
//                 userGroups[uid] = [];
//             }
//             userGroups[uid].push(item);
//         }

//         let messagesSentCount = 0;

//         for (const [userId, items] of Object.entries(userGroups)) {
//             // Find the user details
//             const user = await User.findById(userId).lean();
//             if (!user) continue;

//             const targetPhone = user.whatsappNumber || user.phone;
//             if (!targetPhone) continue;

//             const countryCode = user.whatsappNumber ? (user.whatsappCountryCode || "") : (user.phoneCountryCode || "");
//             const fullPhoneNumber = `${countryCode}${targetPhone}`;

//             // Sort user items by createdAt descending to pick the latest wishlisted one in this batch
//             items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//             const latestItem = items[0];
//             const product = latestItem.jeweleryId;

//             if (!product) continue;

//             // Resolve product image
//             let imageUrl = Constant.CAMPAIGN_IMAGE_URL.WISHLIST_REMINDER;
//             if (product.images && product.images.length > 0) {
//                 const mainImg = product.images.find(img => img.IsMainMedia) || product.images[0];
//                 if (mainImg && mainImg.MediaLocation) {
//                     const loc = mainImg.MediaLocation;
//                     imageUrl = loc.startsWith("http") ? loc : `${Constant.PRODUCT_AWS_ZOOM_IMAGE_URL || ""}${loc}`;
//                 }
//             }

//             try {
//                 // Send the WhatsApp template message
//                 await sendWhatsAppTemplate({
//                     templateName: Constant.CAMPAIGN_TEMPLATE_NAME.WISHLIST_REMINDER,
//                     phoneNumber: fullPhoneNumber.toString(),
//                     bodyParams: [user.name || "Customer"],
//                     userName: user.name || "Customer",
//                     headerImageUrl: imageUrl
//                 });

//                 messagesSentCount++;
//             } catch (err) {
//                 console.error(`Failed to send wishlist reminder to user ${userId}:`, err);
//             }
//         }

//         // Mark all these wishlist items as sent, so we do not attempt again
//         const itemIds = pendingItems.map(item => item._id);
//         await Wishlist.updateMany(
//             { _id: { $in: itemIds } },
//             { $set: { isReminderSent: true } }
//         );

//         return { processed: pendingItems.length, messagesSent: messagesSentCount };
//     } catch (error) {
//         console.error("Error in processWishlistReminders:", error);
//         throw error;
//     }
// };