import WhatsappLog from '../models/whatsappLogs.model.js';
import Constant from '../constants/user.constant.js';
import MESSAGES from '../constants/messages.constant.js';
import { sendWhatsAppSchema } from '../validators/whatsapp.validator.js';

/**
 * Common logging function for writing WhatsApp sending attempts to the database.
 */
export const logWhatsAppSend = async ({
    templateName,
    phoneNumber,
    status,
    bodyParams = [],
    headerImageUrl = null,
    response = null,
    error = null,
    logId = null,
    attempts = 1
}) => {
    try {
        let logDoc = null;
        if (logId) {
            logDoc = await WhatsappLog.findById(logId);
        }

        if (!logDoc) {
            logDoc = new WhatsappLog({
                templateName,
                phoneNumber,
                status,
                bodyParams,
                headerImageUrl,
                response,
                error,
                attempts
            });
        } else {
            logDoc.status = status;
            logDoc.bodyParams = bodyParams;
            logDoc.headerImageUrl = headerImageUrl;
            logDoc.response = response;
            logDoc.error = error;
            logDoc.attempts = attempts;
            logDoc.lastAttemptAt = new Date();
        }

        if (response?.messageId) {
            logDoc.messageId = response.messageId;
        }

        await logDoc.save();
        return logDoc;
    } catch (err) {
        console.error('Failed to log WhatsApp send to DB:', err);
        return null;
    }
};

/**
 * Sends a WhatsApp message template via Aisensy.
 * Logs the attempt (both success and failure) in the database.
 * Supports updating an existing log record for retry tracking.
 */
export const sendWhatsAppTemplate = async ({ templateName, phoneNumber, bodyParams = [], headerImageUrl = null, logId = null, userName = "Customer" }) => {
    // Validate arguments
    const { error: valError, value } = sendWhatsAppSchema.validate({
        templateName,
        phoneNumber,
        bodyParams,
        headerImageUrl,
        userName,
    });

    if (valError) {
        throw new Error(valError.details[0].message);
    }

    const { templateName: cleanTemplate, phoneNumber: rawPhone, bodyParams: cleanParams, headerImageUrl: cleanUrl, userName: cleanUser } = value;
    const aisensyApiKey = process.env.AISENSY_API_KEY;
    const aisensyBaseUrl = process.env.AISENSY_BASE_URL;

    if (!aisensyApiKey || !aisensyBaseUrl) {
        throw new Error(MESSAGES.WHATSAPP.CONFIG_MISSING || 'WhatsApp API configuration is missing');
    }

    // Get current attempts count if retry
    let attempts = 1;
    if (logId) {
        try {
            const existingLog = await WhatsappLog.findById(logId).lean();
            if (existingLog) {
                attempts = (existingLog.attempts || 1) + 1;
            }
        } catch (err) {
            console.error('Failed to fetch existing log for retry:', err);
        }
    }

    try {
        const payload = {
            apiKey: aisensyApiKey,
            campaignName: cleanTemplate,
            userName: cleanUser,
            destination: rawPhone,
            templateParams: cleanParams,
        };

        if (cleanUrl) {
            payload.media = {
                url: cleanUrl,
                filename: "image.jpg",
            };
        }
        console.log("AI SENSY PAYLOAD => ", payload)
        const response = await fetch(aisensyBaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log("AI SENSY RESPONSE => ", response);
        const resText = await response.text();
        console.log("AI SENSY RESPONSE => ", resText);
        let resData = {};
        try {
            resData = JSON.parse(resText);
        } catch (e) {
            resData = { rawResponse: resText };
        }

        if (!response.ok) {
            throw new Error(resData?.message || `Aisensy API HTTP ${response.status}: ${resText.slice(0, 200)}`);
        }

        // Log successful send
        await logWhatsAppSend({
            templateName: cleanTemplate,
            phoneNumber: rawPhone.toString(),
            status: Constant.WHATSAPP_STATUS.SENT,
            bodyParams: cleanParams,
            headerImageUrl: cleanUrl,
            response: resData,
            logId,
            attempts
        });

        return resData;
    } catch (error) {
        // Log failed send
        await logWhatsAppSend({
            templateName: cleanTemplate,
            phoneNumber: rawPhone.toString(),
            status: Constant.WHATSAPP_STATUS.FAILED,
            bodyParams: cleanParams,
            headerImageUrl: cleanUrl,
            error: error.message,
            logId,
            attempts
        });
        throw error;
    }
};

/**
 * Retries sending failed WhatsApp messages up to their maximum retry limit (default: 3).
 * This can be run by a cron job or background worker.
 */
export const retryFailedWhatsAppSends = async () => {
    try {
        // Find failed logs where attempts < 3
        const failedLogs = await WhatsappLog.find({
            status: Constant.WHATSAPP_STATUS.FAILED,
            attempts: { $lt: 3 },
        });

        const results = [];
        for (const log of failedLogs) {3
            try {
                const result = await sendWhatsAppTemplate({
                    templateName: log.templateName,
                    phoneNumber: log.phoneNumber,
                    bodyParams: log.bodyParams,
                    headerImageUrl: log.headerImageUrl,
                    logId: log._id,
                });
                results.push({ logId: log._id, status: 'success', result });
            } catch (err) {
                results.push({ logId: log._id, status: 'failed', error: err.message });
            }
        }
        return results;
    } catch (error) {
        console.error('Failed to retry failed WhatsApp sends:', error);
        throw error;
    }
};
