import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";

const MetalPriceSchema = new mongoose.Schema(
    {
        gold: {
            type: Number,
            required: true,
        },
        silver: {
            type: Number,
            required: true,
        },
        platinum: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                Constant.STATUS.ACTIVE,
                Constant.STATUS.SUSPENDED
            ],
            default: Constant.STATUS.ACTIVE,
            index: true
        },

        isDeleted: {
            type: Number,
            default: 0,
            index: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

MetalPriceSchema.index(
    { unique: true, partialFilterExpression: { status: Constant.STATUS.ACTIVE, isDeleted: 0 } }
);

export default mongoose.model("MetalPrice", MetalPriceSchema);

// id name 	        price_type   type        stamp	density	color           price_per_gm
// 1	"18K Rose Gold"	gold		Rose Gold	18K		0.75	#pinkcolor		15000
// 1	14K Rose Gold	gold		Rose Gold	14K		0.58	#pinkcolor		15000
// 1	18K Yellow Gold	gold		Yellow Gold	18K		0.75	#pinkcolor		15000
// 1	925 Silver		silver		Silver				1		#pinkcolor		15000