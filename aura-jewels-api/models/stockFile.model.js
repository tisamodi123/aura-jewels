import mongoose from 'mongoose';

const stockFileSchema = new mongoose.Schema({
    userFileName: String,
    fileName: String,
    // vendorId: mongoose.Schema.Types.ObjectId,
    uploadedBy: mongoose.Schema.Types.ObjectId,
    uploadedFileUrl: String,
    rejectedUrl: String,
    importType: {
        type: String,
        default: 'product'
    },
    batchLogs: {
        type: Object,   // dynamic keys: time_1, time_2
        default: {}
    }
    // diamondType: String,
    // type: String
}, { timestamps: true, versionKey: false })

export default mongoose.model('StockFile', stockFileSchema);