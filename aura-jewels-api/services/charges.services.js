import Charges from "../models/charges.model.js";

export const add_charges_db = async (data) => {
    try {
        return await Charges.create(data);
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Charge already exists for this code & type..!");
        }
        throw error;
    }
};

export const get_single_charge_db = async (filter) => {
    return await Charges.findOne({ ...filter, isDeleted: { $ne: true } });
};

export const update_charges_db = async (id, data) => {
    try {
        return await Charges.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            {
                $set: {
                    ...(data.type && { type: data.type }),
                    ...(data.name && { name: data.name }),
                    ...(data.code && { code: data.code }),
                    ...(data.amount_per_gm !== undefined && { amount_per_gm: data.amount_per_gm }),
                    ...(data.min_amount !== undefined && { min_amount: data.min_amount }),
                    ...(data.charge_mode !== undefined && { charge_mode: data.charge_mode }),
                    ...(data.status && { status: data.status }),
                    ...(data.updateBy && { updateBy: data.updateBy })
                }
            },
            { new: true }
        );
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Duplicate charge for code & type..!");
        }
        throw error;
    }
};

export const get_charges_list_db = async (filter, skip, limit) => {
    const data = await Charges.find({ ...filter, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Charges.countDocuments({
        ...filter,
        isDeleted: { $ne: true }
    });

    return { data, total };
};

export const delete_charges_db = async (id, userId) => {
    return await Charges.findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } },
        {
            $set: {
                isDeleted: true,
                updateBy: userId
            }
        },
        { new: true }
    );
};