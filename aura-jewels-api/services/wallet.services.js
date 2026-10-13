import mongoose from "mongoose";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";

const round2 = (n) => parseFloat((Number(n) || 0).toFixed(2));

// Fetch (or lazily create) a customer's wallet.
export const get_or_create_wallet_db = async (userId) => {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0, currency: "INR" });
    }
    return wallet;
};

export const get_wallet_balance_db = async (userId) => {
    const wallet = await get_or_create_wallet_db(userId);
    return { balance: round2(wallet.balance), currency: wallet.currency, walletId: wallet._id };
};

export const get_wallet_transactions_db = async (userId, page = 1, limit = 20) => {
    const skip = (Math.max(1, page) - 1) * limit;
    const [data, total] = await Promise.all([
        WalletTransaction.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        WalletTransaction.countDocuments({ userId }),
    ]);
    return { data, total, page, limit };
};

// Atomically add funds. Optionally participates in an existing session so the
// credit is committed together with the order/refund that triggered it.
export const credit_wallet_db = async ({ userId, amount, source = "adjustment", orderId = null, note = "", createdBy = null }, session = null) => {
    const amt = round2(amount);
    if (!(amt > 0)) throw new Error("Credit amount must be greater than zero.");

    const opt = session ? { session } : {};
    // Ensure the wallet exists (upsert), then atomically increment.
    await Wallet.updateOne({ userId }, { $setOnInsert: { userId, currency: "INR" } }, { upsert: true, ...opt });
    const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: amt } },
        { new: true, ...opt }
    );

    const [txn] = await WalletTransaction.create(
        [{
            userId,
            walletId: wallet._id,
            type: "credit",
            amount: amt,
            balanceAfter: round2(wallet.balance),
            source,
            orderId,
            note,
            createdBy,
        }],
        opt
    );
    return { wallet, transaction: txn, balance: round2(wallet.balance) };
};

// Atomically spend funds. The conditional filter (`balance >= amt`) guarantees
// the wallet can never be driven negative even under concurrent orders.
export const debit_wallet_db = async ({ userId, amount, source = "order", orderId = null, note = "", createdBy = null }, session = null) => {
    const amt = round2(amount);
    if (!(amt > 0)) throw new Error("Debit amount must be greater than zero.");

    const opt = session ? { session } : {};
    const wallet = await Wallet.findOneAndUpdate(
        { userId, balance: { $gte: amt } },
        { $inc: { balance: -amt } },
        { new: true, ...opt }
    );
    if (!wallet) {
        throw new Error("Insufficient wallet balance.");
    }

    const [txn] = await WalletTransaction.create(
        [{
            userId,
            walletId: wallet._id,
            type: "debit",
            amount: amt,
            balanceAfter: round2(wallet.balance),
            source,
            orderId,
            note,
            createdBy,
        }],
        opt
    );
    return { wallet, transaction: txn, balance: round2(wallet.balance) };
};

export { round2 as _round2 };
