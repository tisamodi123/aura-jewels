import mongoose from "mongoose";
import User from "../models/user.model.js";
import Constant from "../constants/user.constant.js";

// export const fetchCustomers = async ({ page, limit, search, groupId, status }) => {
//     let filter = {
//         role: Constant.ROLES.CUSTOMER,
//         isDeleted: { $ne: 1 }
//     };

//     if (search) {
//         const searchRegex = { $regex: search, $options: "i" };
//         filter.$or = [
//             { name: searchRegex },
//             { email: searchRegex },
//         ];

//         // If search is numeric, search in phone field
//         if (!isNaN(search) && search !== "") {
//             filter.$or.push({ phone: Number(search) });
//         }
//     }

//     if (groupId) {
//         filter.customerGroupId = groupId;
//     }

//     if (status) {
//         filter.status = status;
//     }

//     const customers = await User.find(filter)
//         .populate("customerGroupId")
//         .populate("assigneeId", "name email role phone")
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .sort({ createdAt: -1 });

//     const total = await User.countDocuments(filter);

//     // Decorate with the `countryCode` alias the admin table expects.
//     // Schema field is `phoneCountryCode`; older rows may not have it
//     // populated so we default to "+91".
//     const decorated = customers.map((c) => {
//         const obj = c.toObject();
//         obj.countryCode = obj.phoneCountryCode || "+91";
//         return obj;
//     });

//     return {
//         customers: decorated,
//         pagination: {
//             total,
//             page,
//             limit,
//             totalPages: Math.ceil(total / limit)
//         },

//     };
// };

export const fetchCustomers = async ({
    page,
    limit,
    search,
    status,
}) => {
    page = Number(page);
    limit = Number(limit);

    let filter = {
        role: Constant.ROLES.CUSTOMER,
        isDeleted: { $ne: 1 }
    };

    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
        ];

        if (!isNaN(search) && search !== "") {
            filter.$or.push({ phone: Number(search) });
        }
    }

    if (status) {
        filter.status = status;
    }

    const customers = await User.find(filter)
        .populate("assigneeId", "name email role phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await User.countDocuments(filter);

    const decorated = customers.map((c) => {
        const obj = c.toObject();
        obj.countryCode = obj.phoneCountryCode || "+91";
        return obj;
    });

    return {
        customers: decorated,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const fetchCustomerById = async (id) => {
    const customer = await User.findById(id)
        .populate("assigneeId", "name email role phone")

    if (!customer || customer.isDeleted === 1) {
        throw new Error("Customer not found");
    }

    const nameParts = customer.name ? customer.name.split(" ") : ["", ""];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    return {
        customer: {
            ...customer.toObject(),
            firstName,
            lastName,
            address: customer.addresses, // Alias for frontend
            number: customer.phone, // Alias for frontend
            // Country code default mirrors the schema. Older rows
            // created before the field existed will still get "+91".
            countryCode: customer.phoneCountryCode || "+91"
        }
    };
};

// Normalise whatever dial code shape the frontend sent. PhoneInput tends
// to emit "91" (no plus), our storefront emits "+91" — we always
// persist the plus-prefixed form so the rest of the app can rely on it.
const normaliseDialCode = (raw) => {
    if (!raw) return "+91";
    const digits = String(raw).replace(/[^\d]/g, "");
    return digits ? `+${digits}` : "+91";
};

export const createCustomerService = async (payload, userId) => {
    const {
        firstName,
        lastName,
        email,
        number,
        countryCode,
        address,
        assigneeId,
        autoVerify
    } = payload;

    // Admin "create customer" defaults to a fully verified, ACTIVE row —
    // the staff member is doing this in person and shouldn't have to
    // walk the customer through email + OTP. Setting autoVerify=false
    // creates a PENDING row that the customer will activate themselves
    // via the storefront OTP flow.
    const verified = autoVerify === undefined ? true : !!autoVerify;

    if (email) {
        const existingEmail = await User.findOne({ email, isDeleted: { $ne: 1 } });
        if (existingEmail) {
            throw new Error("A user with this email already exists.");
        }
    }

    if (number) {
        const existingPhone = await User.findOne({ phone: number, isDeleted: { $ne: 1 } });
        if (existingPhone) {
            throw new Error("A user with this phone number already exists.");
        }
    }

    const fullName = `${firstName} ${lastName}`.trim();

    let processedAddresses = [];
    if (address) {
        try {
            const parsed = typeof address === "string" ? JSON.parse(address) : address;
            if (Array.isArray(parsed)) {
                processedAddresses = parsed.map(addr => ({
                    ...addr,
                    isDefault: String(addr.isdefault) === "1" || addr.isdefault === true || String(addr.isDefault) === "1" || addr.isDefault === true
                }));
            } else if (typeof parsed === "object" && parsed !== null) {
                processedAddresses = [{
                    ...parsed,
                    isDefault: String(parsed.isdefault) === "1" || parsed.isdefault === true || String(parsed.isDefault) === "1" || parsed.isDefault === true
                }];
            }
        } catch (e) {
            console.error("Failed to parse address in createCustomerService", e);
        }
    }

    const customer = new User({
        name: fullName,
        email,
        phone: number,
        phoneCountryCode: normaliseDialCode(countryCode),
        addresses: processedAddresses,
        role: Constant.ROLES.CUSTOMER,
        assigneeId: assigneeId || null,
        status: verified ? Constant.STATUS.ACTIVE : Constant.STATUS.PENDING,
        emailVerified: verified,
        phoneVerified: verified,
        createdBy: userId
    });

    await customer.save();
    return customer;
};

export const editCustomer = async (id, payload, userId) => {
    const customer = await User.findById(id);

    if (!customer || customer.isDeleted === 1) {
        throw new Error("Customer not found");
    }

    const { firstName, lastName, name, email, phone, number, countryCode, status, address, assigneeId } = payload;

    const targetId = typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

    if (email && email.toLowerCase() !== customer.email?.toLowerCase()) {
        const existingEmail = await User.findOne({ email, _id: { $ne: targetId }, isDeleted: { $ne: 1 } });
        if (existingEmail) {
            throw new Error("A user with this email already exists.");
        }
    }

    if (phone || number) {
        const targetPhone = phone || number;
        const phoneChanged = String(targetPhone) !== String(customer.phone);
        if (phoneChanged) {
            const phoneNum = Number(targetPhone);
            const query = {
                _id: { $ne: targetId },
                isDeleted: { $ne: 1 }
            };
            if (!isNaN(phoneNum)) {
                query.$or = [{ phone: targetPhone }, { phone: phoneNum }];
            } else {
                query.phone = targetPhone;
            }
            const existingPhone = await User.findOne(query);
            if (existingPhone) {
                throw new Error("A user with this phone number already exists.");
            }
        }
    }

    if (firstName || lastName) {
        const fName = firstName || customer.name.split(" ")[0] || "";
        const lName = lastName || customer.name.split(" ").slice(1).join(" ") || "";
        customer.name = `${fName} ${lName}`.trim();
    } else if (name) {
        customer.name = name;
    }

    if (email) customer.email = email;
    if (phone || number) customer.phone = phone || number;
    if (countryCode) customer.phoneCountryCode = normaliseDialCode(countryCode);

    if (typeof assigneeId !== "undefined") {
        customer.assigneeId = assigneeId || null;
    }

    if (status) customer.status = status;

    if (typeof address !== "undefined") {
        try {
            let processedAddresses = [];
            if (address) {
                const parsed = typeof address === "string" ? JSON.parse(address) : address;
                if (Array.isArray(parsed)) {
                    processedAddresses = parsed.map(addr => ({
                        ...addr,
                        isDefault: String(addr.isdefault) === "1" || addr.isdefault === true || String(addr.isDefault) === "1" || addr.isDefault === true
                    }));
                } else if (typeof parsed === "object" && parsed !== null) {
                    processedAddresses = [{
                        ...parsed,
                        isDefault: String(parsed.isdefault) === "1" || parsed.isdefault === true || String(parsed.isDefault) === "1" || parsed.isDefault === true
                    }];
                }
            }
            customer.addresses = processedAddresses;
            customer.markModified("addresses");
        } catch (e) {
            console.error("Failed to parse address in editCustomer", e);
        }
    }

    customer.updatedBy = userId;

    await customer.save();

    return customer;
};

export const removeCustomer = async (id) => {
    const customer = await User.findById(id);

    if (!customer || customer.isDeleted === 1) {
        throw new Error("Customer not found");
    }

    customer.isDeleted = 1;

    await customer.save();

    return true;
};

export const changeCustomerStatus = async (id, status) => {
    const customer = await User.findById(id);

    if (!customer || customer.isDeleted === 1) {
        throw new Error("Customer not found");
    }

    customer.status = status;
    await customer.save();

    return customer;
};

export const fetchAssignees = async () => {
    const assignees = await User.find({
        role: Constant.ROLES.SALES,
        status: Constant.STATUS.ACTIVE,
        isDeleted: { $ne: 1 }
    }).select("name email role phone status").sort({ name: 1 });

    return assignees;
};
/**
 * Mark a customer account as verified.
 *
 * Mirrors what createCustomerService() does when an admin creates a customer
 * with `verified: true` — email + phone flags set, and a PENDING account
 * promoted to ACTIVE. Idempotent: verifying twice is a no-op.
 */
export const verifyCustomerAccount = async (id) => {
    const customer = await User.findById(id);

    if (!customer || customer.isDeleted === 1) {
        throw new Error("Customer not found");
    }
    if (customer.role !== Constant.ROLES.CUSTOMER) {
        throw new Error("Account is not a customer");
    }

    if (customer.emailVerified && customer.phoneVerified) {
        return { customer, alreadyVerified: true };
    }

    customer.emailVerified = true;
    customer.phoneVerified = true;
    if (customer.status === Constant.STATUS.PENDING) {
        customer.status = Constant.STATUS.ACTIVE;
    }

    await customer.save();
    return { customer, alreadyVerified: false };
};
