import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";
const whatsappLogSchema = new mongoose.Schema(
    {
        templateName: String,
        phoneNumber: String,
        status: {
            type: String,
            enum: Constant.WHATSAPP_STATUS.ALL_TYPES,
            default: Constant.WHATSAPP_STATUS.SENT
        },
        response: mongoose.Schema.Types.Mixed,
        error: String,
        messageId: String,
        attempts: {
            type: Number,
            default: 1
        },
        maxAttempts: {
            type: Number,
            default: 3
        },
        lastAttemptAt: {
            type: Date
        },
        bodyParams: {
            type: [String],
            default: []
        },
        headerImageUrl: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("WhatsappLog", whatsappLogSchema);