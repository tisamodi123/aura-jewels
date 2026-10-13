// import mongoose from "mongoose";
// import Constant from "../constants/user.constant.js";

// const OtherChargeSchema = new mongoose.Schema({
//     chargeCode: String,
//     amount: Number,
//     remark: String,
//     status: {
//         type: String,
//         enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
//         default: Constant.STATUS.ACTIVE
//     },
//     createBy: mongoose.Schema.Types.ObjectId,
//     updateBy: mongoose.Schema.Types.ObjectId
// }, { timestamps: true, versionKey: false });

// export default mongoose.model('OtherCharge', OtherChargeSchema)