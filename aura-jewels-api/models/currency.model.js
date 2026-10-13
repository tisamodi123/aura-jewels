import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true }, // e.g. "USD", "EUR"
    symbol: { type: String, required: true }, // e.g. "$", "₹"
    exchangeRate: { type: Number, required: true }, // base rate (e.g. 1 USD = 84.5 INR, so exchangeRate = 84.5)
    buffer: { type: Number, default: 0 }, // Buffer in % (e.g. 2.0)
    decimalPlaces: { type: Number, default: 2 },
    caption: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Currency", currencySchema);
