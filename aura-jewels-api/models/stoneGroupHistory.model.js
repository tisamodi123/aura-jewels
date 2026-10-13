import mongoose from 'mongoose';

const stoneGroupHistorytSchema = new mongoose.Schema({
    userFileName: String,
    fileName: String,
    uploadedBy: mongoose.Schema.Types.ObjectId,
    uploadedFileUrl: String,
    rejectedUrl: String,
}, { timestamps: true, versionKey: false })

export default mongoose.model('StoneGroupHistory', stoneGroupHistorytSchema);