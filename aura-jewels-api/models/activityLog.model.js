import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        action: {
            type: String,
            enum: ["CREATE", "UPDATE", "DELETE", "VIEW", "UPDATE_STATUS", "LOGIN"],
        },
        module: {
            type: String, // customer, product, order, etc.
        },
        method: { type: String },
        route: { type: String, index: true },
        apiUrl: { type: String, },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        message: { type: String },
        userAgent: { type: String },
        ipAddress: {
            type: String,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model("ActivityLog", activityLogSchema);