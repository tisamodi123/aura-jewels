import Currency from "../models/currency.model.js";
import { clearCurrencyCache } from "../utils/currencyConvertor.js";

// Helper function to format currency object for table
export const formatCurrency = (doc) => ({
  id: doc._id,
  currency: doc.code,
  caption: doc.caption || "",
  sign: doc.symbol,
  amount: doc.exchangeRate,
  status: doc.isActive ? "ACTIVE" : "SUSPENDED",
  default: doc.isDefault || false,
});

export const getCurrenciesService = async () => {
  const list = await Currency.find({}).sort({ createdAt: -1 });
  return list.map(formatCurrency);
};

export const addCurrencyService = async ({ currency, caption, sign, amount }) => {
  if (!currency || !sign || !amount) {
    throw new Error("Currency (code), Sign (symbol), and Amount (exchangeRate) are required.");
  }

  const existing = await Currency.findOne({ code: currency.toUpperCase() });
  if (existing) {
    throw new Error("Currency code already exists.");
  }

  const doc = await Currency.create({
    code: currency,
    caption: caption || "",
    symbol: sign,
    exchangeRate: Number(amount),
    isActive: true,
    isDefault: false,
  });

  clearCurrencyCache();
  return formatCurrency(doc);
};

export const updateCurrencyService = async (id, { currency, caption, sign, amount }) => {
  const doc = await Currency.findById(id);
  if (!doc) {
    throw new Error("Currency not found.");
  }

  if (currency) doc.code = currency;
  if (caption !== undefined) doc.caption = caption;
  if (sign) doc.symbol = sign;
  if (amount !== undefined) doc.exchangeRate = Number(amount);

  await doc.save();
  clearCurrencyCache();
  return formatCurrency(doc);
};

export const updateCurrencyStatusService = async (id) => {
  const doc = await Currency.findById(id);
  if (!doc) {
    throw new Error("Currency not found.");
  }

  doc.isActive = !doc.isActive;
  await doc.save();
  clearCurrencyCache();
  return formatCurrency(doc);
};

export const deleteCurrencyService = async (id) => {
  const doc = await Currency.findByIdAndDelete(id);
  if (!doc) {
    throw new Error("Currency not found.");
  }
  clearCurrencyCache();
  return true;
};

export const setDefaultCurrencyService = async (id) => {
  const target = await Currency.findById(id);
  if (!target) {
    throw new Error("Currency not found.");
  }

  // Toggle default status
  const newDefaultStatus = !target.isDefault;

  if (newDefaultStatus) {
    // Clear default status of other currencies
    await Currency.updateMany({ _id: { $ne: id } }, { $set: { isDefault: false } });
  }

  target.isDefault = newDefaultStatus;
  await target.save();
  clearCurrencyCache();
  return formatCurrency(target);
};
