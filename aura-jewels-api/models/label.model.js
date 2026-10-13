import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const labelSchema = new mongoose.Schema({
    stoneType: {
        type: String, // CENTER / SIDE
        enum: ["CENTER", "SIDE"],
        required: true
    },
    // Free text, matched against the grade stored on a ProductStone — the same
    // way StoneGroup stores colour and clarity. These were Parameter refs, which
    // meant a grade could only be labelled once someone had created a Parameter
    // row for it. Stored uppercase; matched case-insensitively.
    color: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 20
    },
    clarity: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 20
    },
    labelName: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
        default: Constant.STATUS.ACTIVE
    },
    isDeleted: {
        type: Number,
        default: 0
    },
    createdBy: mongoose.Schema.Types.ObjectId,
    updatedBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true, versionKey: false });

export default mongoose.model("Label", labelSchema);
