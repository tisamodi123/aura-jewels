import mongoose from "mongoose";

// One wallet per customer. Balance is always stored in the platform base
// currency (INR); the storefront converts it for display using the same
// exchange-rate service the rest of the catalogue uses. Balance is mutated
// only through wallet.services (atomic $inc) so it can never go negative or
// drift out of sync with the transaction ledger.
const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        // INR, 2-decimal money. Never written directly — see wallet.services.
        balance: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: "INR" },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("Wallet", walletSchema);
