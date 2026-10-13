// --------------------
// CHNAGES BY SMIT_K86
// --------------------

import mongoose from "mongoose";
import Constant from '../constants/user.constant.js'

const ParameterSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: Constant.PARA_TYPES.ALL_TYPES
        },

        diamondType: {
            type: String,
            enum: Constant.DIAMOND_TYPES.ALL_TYPES,
            default: null,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        description: {
            type: String,
            trim: true
        },

        image: {
            type: String,
            trim: true,
            default: null
        },

        sort: {
            type: Number,
            default: 0
        },

        synonyms: [
            {
                type: String,
                trim: true,
            },
        ],

        status: {
            type: String,
            enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
            default: Constant.STATUS.ACTIVE,
        },
        isDeleted: {
            type: Number,
            trim: true,
            default: 0
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId },
        updatedBy: { type: mongoose.Schema.Types.ObjectId }
    },
    { timestamps: true, versionKey: false }
);

// unique code per type
ParameterSchema.index(
    { type: 1, code: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: 0 }
    }
);

// unique sort per type
ParameterSchema.index(
    { type: 1, sort: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: 0 }
    }
);
export default mongoose.model("Parameter", ParameterSchema);

// --------------------
// END OF LINE
// --------------------