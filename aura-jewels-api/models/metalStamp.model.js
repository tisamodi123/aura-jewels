// import mongoose from "mongoose";
// import Constant from "../constants/user.constant.js";

// const karatPurity = new mongoose.Schema({
//     karat: String,
//     gravity: Number,
//     status: {
//         type: String,
//         enum: [Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED],
//         default: Constant.STATUS.ACTIVE
//     },
//     updatedBy: mongoose.Schema.Types.ObjectId,
//     createdBy: mongoose.Schema.Types.ObjectId,
// }, { timestamps: true, versionKey: false });

// export default mongoose.model('MetalStamp', karatPurity)