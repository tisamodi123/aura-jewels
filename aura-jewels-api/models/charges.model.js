import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const ChargesSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: Constant.CHARGE_TYPE.ALL_TYPE,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        amount_per_gm: {
            type: Number,
            required: true,
            min: 0
        },
        min_amount: {
            type: Number,
            required: true,
            min: 0
        },
        charge_mode: {
            type: String,
            enum: Constant.CHARGE_MODE.ALL_TYPE,
            default: Constant.CHARGE_MODE.DYNAMIC
        },
        status: {
            type: String,
            enum: [
                Constant.STATUS.ACTIVE,
                Constant.STATUS.SUSPENDED
            ],
            default: Constant.STATUS.ACTIVE
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        createBy: mongoose.Schema.Types.ObjectId,
        updateBy: mongoose.Schema.Types.ObjectId
    },
    { timestamps: true, versionKey: false }
);
ChargesSchema.index(
    { code: 1, type: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false }
    }
);
ChargesSchema.index({ status: 1, isDeleted: 1 });
ChargesSchema.index({ code: 1, status: 1 });
ChargesSchema.index({ code: 1 });
ChargesSchema.index({ name: 1 });

export default mongoose.model("Charges", ChargesSchema);