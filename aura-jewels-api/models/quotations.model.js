import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const { Schema } = mongoose;

const metalInfoSchema = new Schema(
  {
    metalType: {
      type: Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },

    metalWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    metalPrice: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false }
);

const diamondSchema = new Schema(
  {
    diamondLabel: {
      type: String,
      trim: true,
      default: "",
    },
    carate: {
      type: Number,
      default: null,
      min: 0,
    },
    price: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false }
);

const quotationInfoSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    quotationId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Constant.QUOTATION_STATUS.ALL_TYPES,
      default: Constant.QUOTATION_STATUS.PENDING,
      required: true,
    },
    metalInfo: {
      type: metalInfoSchema,
      required: true,
    },
    diamond: {
      type: diamondSchema,
      default: () => ({}),
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    approvedByUser: {
      type: Boolean,
      default: false,
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const quotationsSchema = new Schema(
  {
    customOrderId: {
      type: Schema.Types.ObjectId,
      ref: "CustomJewellery",
      required: true,
    },
    customOrderInqName: {
      type: String,
      required: true,
      trim: true,
    },
    quotationInfo: {
      type: [quotationInfoSchema],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one quotation is required",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

quotationsSchema.index({ customOrderId: 1 });
quotationsSchema.index({ customOrderInqName: 1 });

export default mongoose.model("Quotations", quotationsSchema);
