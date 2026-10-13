import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    acceptableValues: [{
        type: String,
        trim: true
    }],

    sort: {
        type: Number,
        default: 0
    },

    // Tags flagged for the storefront mega menu appear under a "Shop By"
    // column. Unflagged tags still work for product filtering but stay out
    // of the menu.
    isMenu: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE
    },

    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId

}, { timestamps: true, versionKey: false });

export default mongoose.model("Tag", tagSchema);