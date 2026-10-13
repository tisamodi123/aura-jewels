import mongoose from "mongoose";

const countySchema = new mongoose.Schema(
    {
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
            unique: true,
        },
        flag: {
            type: String,
            default: "",
        },
        faxNo: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const County = mongoose.model("County", countySchema);

export default County;