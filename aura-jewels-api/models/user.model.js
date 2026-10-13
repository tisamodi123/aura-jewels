import mongoose from 'mongoose'
import Constant from "../constants/user.constant.js";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      phone: { type: String },
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      address: { type: String, required: true },
      isDefault: { type: Boolean, default: false }
});


const userSchema = new mongoose.Schema({
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: Number, trim: true },
      userCountryOrigin: { type: String, trim: true },
      // Country dial code stored separately so we can disambiguate the
      // same local number across markets. Defaults to "+91" since the
      // storefront's primary market is India today.
      phoneCountryCode: { type: String, trim: true },
      whatsappNumber: { type: Number, trim: true },
      whatsappCountryCode: { type: String, trim: true },

      // Optional customer profile extras (editable from My Account → Profile).
      gender: { type: String, trim: true },
      dob: { type: Date },
      anniversary: { type: Date },
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      occasions: {
            type: [{
                  recipient: { type: String, trim: true },
                  type: { type: String, trim: true },
                  date: { type: Date },
            }],
            default: []
      },
      // Mirror of `emailVerified`. The storefront treats phone as the
      // primary identity (OTP-based login) so this flips to `true` after
      // the first successful OTP verification.
      phoneVerified: { type: Boolean, default: false },
      password: { type: String },

      role: {
            type: String,
            enum: [Constant.ROLES.SUPER_ADMIN, Constant.ROLES.ADMIN, Constant.ROLES.SALES, Constant.ROLES.INVENTORY, Constant.ROLES.CUSTOMER],
            default: Constant.ROLES.CUSTOMER
      },

      addresses: {
            type: [addressSchema],
            default: []
      },

      status: {
            type: String,
            enum: [
                  Constant.STATUS.PENDING,
                  Constant.STATUS.ACTIVE,
                  Constant.STATUS.SUSPENDED
            ],
            default: Constant.STATUS.PENDING
      },

      emailVerifyToken: String,
      emailVerifyTokenExpiry: Date,
      emailVerified: { type: Boolean, default: false },

      isApproved: { type: Boolean, default: false },

      isForgotPassword: { type: Boolean, default: false },
      resetPasswordToken: String,
      resetPasswordExpires: Date,

      otp: String,
      otpExpiry: Date,

      refreshToken: String,
      loginToken: String,
      lastLogin: Date,
      lastLogout: Date,
      // customerGroupId: {
      //       type: mongoose.Schema.Types.ObjectId,
      //       ref: "CustomerGroup",
      //       default: null
      // },
      // isBlocked: { type: Boolean, default: false },
      assigneeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
      },

      isDeleted: { type: Number, default: 0 },
      isGuest: { type: Boolean, default: false },

      createdBy: mongoose.Schema.Types.ObjectId,
      updatedBy: mongoose.Schema.Types.ObjectId,

}, { timestamps: true, versionKey: false });

userSchema.pre('save', async function () {
      if (this.isModified('password')) {
            // console.log(this.password);

            if (this.password != undefined) {
                  this.password = await bcrypt.hashSync(this.password, 10);
            }
      }
});

export default mongoose.model("User", userSchema)