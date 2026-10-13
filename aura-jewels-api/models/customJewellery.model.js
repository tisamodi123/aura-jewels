import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const { Schema } = mongoose;

const customJewellerySchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: function () {
        return !this.otherProduct;
      },
      index: true,
    },

    otherProduct: {
      type: String,
      trim: true,
      maxlength: 200,
      required: function () {
        return !this.categoryId;
      },
    },

    attachments: {
      type: [String],
      default: undefined,
      validate: {
        validator: function (value) {
          return !value || value.length <= 5;
        },
        message: "Attachments can contain maximum 5 items",
      },
    },

    urls: {
      type: [String],
      default: undefined,
      validate: {
        validator: function (value) {
          return !value || value.length <= 5;
        },
        message: "Urls can contain maximum 5 items",
      },
    },

    metalId: {
      type: Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
      index: true,
    },

    approxMetalWeight: {
      type: Number,
      required: true,
      min: 0,
    },

    ringSizeId: {
      type: Schema.Types.ObjectId,
      ref: "Sizes",
      index: true,
    },

    stoneType: {
      type: String,
      enum: Constant.STONE_TYPES.ALL_TYPES,
    },

    approxStoneWeight: {
      type: Number,
      required: true,
      min: 0,
    },

    gemstonePreference: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    engraving: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    isEngraving: {
      type: Boolean,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    firstName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },

    mobileNumber: {
      type: String,
      trim: true,
      required: function () {
        return !this.email;
      },
    },

    countryCode: {
      type: String,
      trim: true,
      required: function () {
        return !!this.mobileNumber;
      },
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: function () {
        return !this.mobileNumber;
      },
    },

    orderStatus: {
      type: String,
      enum: Constant.ORDER_STATUS.ALL_TYPES,
      default: Constant.ORDER_STATUS.PENDING,
    },

    // Bespoke quote + advance payment (per the Custom Jewellery policy's advance
    // payment terms). The admin sets `quotedPrice`, sends a payment link, and
    // `paymentStatus` flips to "paid" when the gateway webhook confirms.
    quotedPrice: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentLink: {
      id: { type: String, default: "" },
      url: { type: String, default: "" },
      gatewayPaymentId: { type: String, default: "" },
      paidAt: { type: Date, default: null },
    },

    userInfo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

customJewellerySchema.index({ categoryId: 1, metalId: 1, createdAt: -1 });
customJewellerySchema.index({ firstName: 1, lastName: 1, mobileNumber: 1 });

customJewellerySchema.path("email").validate(function (value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}, "Invalid email address");

customJewellerySchema.path("mobileNumber").validate(function (value) {
  if (!value) return true;
  return /^[0-9+\-\s()]{7,20}$/.test(value);
}, "Invalid mobile number");

export default mongoose.model("CustomJewellery", customJewellerySchema);
