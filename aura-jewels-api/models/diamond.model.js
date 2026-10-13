import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const DiamondSchema = new mongoose.Schema(
  {
    stockId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      default: "AVAILABLE",
    },
    shape: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    clarity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    sizeMM: {
      type: String,
      trim: true,
      default: "",
    },
    cut: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    polish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    symmetry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    fluorescence: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    creation: {
      type: String,
      trim: true,
      default: "", // CVD, HPHT, Natural etc.
    },
    gemstoneType: {
      type: String,
      trim: true,
      default: "",
    },
    gemstoneOrigin: {
      type: String,
      trim: true,
      default: "",
    },
    carat: {
      type: Number,
      default: 0,
    },
    caratNo: {
      type: String,
      trim: true,
      default: "",
    },
    certNo: {
      type: String,
      trim: true,
      default: "",
    },
    certLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parameter",
      default: null,
    },
    certLink: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    rap: {
      type: Number,
      default: 0,
    },
    disc: {
      type: Number,
      default: 0, // e.g. -40 for 40% discount
    },
    discount: {
      type: String,
      trim: true,
      default: "",
    },
    ppc: {
      type: Number,
      default: 0, // Price Per Carat
    },
    price: {
      type: Number,
      default: 0, // Final calculated price
    },
    isDeleted: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// Indexes for fast storefront search and filtering
DiamondSchema.index({ certNo: 1 });
DiamondSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
DiamondSchema.index({
  shape: 1, color: 1, clarity: 1, cut: 1, carat: 1,
  price: 1,
  status: 1, isDeleted: 1
});


export default mongoose.model("Diamond", DiamondSchema);
