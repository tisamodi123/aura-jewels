import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const stoneGroupDefaultSchema = new mongoose.Schema({
    stoneType: {
        type: String,
        required: true,
        enum: Constant.DIAMOND_TYPES.ALL_TYPES,
    },

    type: {
        type: String,
        enum: [...Constant.DIA_TYPES.ALL_TYPES, ...Constant.GEM_TYPES.ALL_TYPES]
    },

    color: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "Parameter",
        // required: function () {
        //     return this.stoneType === "diamond";
        // },
        type: String,
        trim: true,
        required: function() {
            return this.stoneType === "diamond";
        },
    },

    clarity: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "Parameter",
        type: String,
        trim: true,
        default: "",
    },

    displayName: {
        type: String,
        trim: true,
        default: "",
    },

    origin: {
        type: String,
        enum: ["Lab Grown", "Natural", "Both"],
        default: "Both",
    },

    sort: {
        type: Number,
        default: 0,
    },

    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE,
    },

    isDefault: {
        type: Boolean,
        default: false,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true, versionKey: false });

export default mongoose.model("StoneGroupDefault", stoneGroupDefaultSchema);
