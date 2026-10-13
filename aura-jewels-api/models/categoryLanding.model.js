import mongoose from 'mongoose';
import Constant from '../constants/user.constant.js';

const categoryLandingSchema = new mongoose.Schema({
    position: { 
        type: String, 
        required: true,
        enum: Constant.CATEGORY_LANDING_SECTIONS
    },
    CategoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: false 
    },
    title: { type: String, default: "" },
    subTitle: { type: String, default: "" },
    description: { type: String, default: "" },
    buttontext1: { type: String, default: "" },
    buttontext2: { type: String, default: "" },
    buttonlink1: { type: String, default: "" },
    buttonlink2: { type: String, default: "" },
    // Structured redirect targets for the two CTAs (same shape as CMS home /
    // menu). Resolved to an absolute `href` server-side via decorateRedirects.
    // The legacy buttonlink1/2 raw strings are kept as a fallback.
    redirect1: { type: Object, default: () => ({ type: "none" }) },
    redirect2: { type: Object, default: () => ({ type: "none" }) },
    textposition: { type: String, default: "" },
    image: { type: String, default: "" },
    mobile_img: { type: String, default: "" },
    video: { type: String, default: "" },
    itemcode: { type: [String], default: [] },
    status: {
        type: String,
        enum: [
            Constant.STATUS.ACTIVE,
            Constant.STATUS.SUSPENDED
        ],
        default: Constant.STATUS.ACTIVE
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    versionKey: false
});

categoryLandingSchema.index({ CategoryId: 1, position: 1, status: 1 });

export default mongoose.model('CategoryLanding', categoryLandingSchema);
