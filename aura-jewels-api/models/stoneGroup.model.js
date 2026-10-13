import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const stoneGroupSchema = new mongoose.Schema({
    stoneType: {
        type: String, // "diamond" or "color stone"
        enum: Constant.DIAMOND_TYPES.ALL_TYPES,  // ["diamond", "color stone"]
    },

    type: {
        type: String,
        trim: true,
        enum: Constant.GEM_TYPES.ALL_TYPES
    },

    shape: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    color: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    clarity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    cut: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    polish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    fluorescence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    symmetry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    lab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter"
    },

    carat: {
        type: String, // from sheet
        trim: true
    },

    // minCarat: Number,
    // maxCarat: Number,
    // amount: Number, // base price

    lgd_price: Number,
    natural_price: Number,

    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE
    },

    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId

}, { timestamps: true, versionKey: false });

export default mongoose.model("StoneGroup", stoneGroupSchema);