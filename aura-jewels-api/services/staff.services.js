import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Constant from "../constants/user.constant.js"
import { sendEmail } from "../utils/sendEmail.js";
import { staffTempMailTemplate } from "../mailtemplates/staff.mail.js";

export const getStaffList = async function (body) {
    try {
        const { page = 1, limit = 10, search, role } = body || {};

        // `$ne: 1` matches both isDeleted=0 and legacy rows missing the field.
        let match = {
            isDeleted: { $ne: 1 },
            role: { $ne: Constant.ROLES.CUSTOMER }
        };

        if (role) {
            match.role = role;
        }

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const data = await User.find(match)
            .select("name email phone phoneCountryCode status role createdAt")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(match);

        return {
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            },
            data
        };

    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getStaffDetail = async function (id) {
    try {
        const data = await User.findOne({
            _id: id,
            isDeleted: { $ne: 1 },
            // role: { $ne: Constant.ROLES.CUSTOMER } // only staff
        }).select("name email phone phoneCountryCode status role addresses createdAt");

        return data;

    } catch (error) {
        console.log(error);
        throw error;
    }
};

// Normalise whatever dial-code shape the frontend sent. PhoneInput emits
// digits only ("91"); the rest of the codebase stores "+91".
const normaliseDialCode = (raw) => {
    if (!raw) return "+91";
    const digits = String(raw).replace(/[^\d]/g, "");
    return digits ? `+${digits}` : "+91";
};

export const createStaff = async (body) => {
    const { name, email, phone, countryCode, role, addresses } = body;

    if (role === Constant.ROLES.CUSTOMER) {
        throw new Error("Customer role cannot be created as staff");
    }

    const existing = await User.findOne({ email, isDeleted: 0 });
    if (existing) throw new Error("User already exists");

    const tempPassword = Math.random().toString(36).slice(-8);
    // const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
        name,
        email,
        phone,
        phoneCountryCode: normaliseDialCode(countryCode),
        // password: hashedPassword,
        password: tempPassword,
        role: role,
        addresses: addresses || [],
        status: Constant.STATUS.ACTIVE,
        isDeleted: 0
    });

    // SMTP failures shouldn't roll back a successful create — the staff
    // row already exists, the temp password is on disk (hashed), and the
    // admin can resend credentials manually. Log and continue.
    try {
        await sendEmail(
            email,
            "Your Staff Account",
            staffTempMailTemplate({ name, email, tempPassword })
        );
    } catch (err) {
        console.error("Staff welcome email failed (user still created):", err?.message);
    }

    return user;
};

export const updateStaff = async (id, body) => {
    const { name, email, phone, countryCode, role, addresses } = body;

    const user = await User.findById(id);
    if (!user || user.isDeleted === 1) {
        throw new Error("Staff not found");
    }

    if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) throw new Error("Email already in use");
    }

    if (role) {
        if (role === Constant.ROLES.CUSTOMER) {
            throw new Error("Customer role cannot be assigned to staff");
        }
        user.role = role;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (countryCode) user.phoneCountryCode = normaliseDialCode(countryCode);
    if (addresses) user.addresses = addresses;

    await user.save();

    return user;
};

export const deleteStaff = async (id) => {
    const user = await User.findById(id);

    if (!user || user.isDeleted === 1) {
        throw new Error("Staff not found");
    }

    user.isDeleted = 1;
    user.status = Constant.STATUS.SUSPENDED;

    await user.save();

    return "Staff deleted successfully";
};

export const updateStaffStatus = async (id, status) => {
    const user = await User.findById(id);

    if (!user || user.isDeleted === 1) {
        throw new Error("Staff not found");
    }

    if (![Constant.STATUS.ACTIVE, Constant.STATUS.SUSPENDED].includes(status)) {
        throw new Error("Invalid status value");
    }

    user.status = status;

    await user.save();

    return user;
};