// import mongoose from "mongoose";
// import Constant from "../constants/user.constant.js";

// const metalTypeSchema = new mongoose.Schema({
//     metalName: String,
//     colorCode: String,
//     price: Number,
//     isMetalStamp: Boolean,
//     status: {
//         type: String,
//         enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
//         default: Constant.STATUS.ACTIVE
//     },
//     updatedBy: mongoose.Schema.Types.ObjectId,
//     createdBy: mongoose.Schema.Types.ObjectId,
// }, { timestamps: true, versionKey: false });

// export default mongoose.model('MetalType', metalTypeSchema)