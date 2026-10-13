import mongoose from "mongoose";

// Immutable ledger of every wallet movement. Each row records the resulting
// balance so history is auditable even if the wallet doc is later touched.
const walletTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
        type: { type: String, enum: ["credit", "debit"], required: true },
        // Positive INR amount of this movement.
        amount: { type: Number, required: true, min: 0 },
        // Wallet balance immediately after this transaction (INR).
        balanceAfter: { type: Number, required: true },
        // What caused it: a refund credit, an order payment debit, or a manual
        // admin adjustment.
        source: {
            type: String,
            enum: ["refund", "order", "adjustment", "reversal"],
            default: "adjustment",
        },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
        note: { type: String, default: "" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    { timestamps: true, versionKey: false }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("WalletTransaction", walletTransactionSchema);
