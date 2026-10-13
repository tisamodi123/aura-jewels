import Metal from "../models/metal.model.js";
import MetalPrice from "../models/metalPrice.model.js";

export const add_metal_db = async (req) => {
    return await Metal.create({
        ...req.body,
        createdBy: req.user.userId
    });
};

export const get_metal_list_db = async (filter, skip, limit) => {
    // `$ne: 1` matches both isDeleted=0 and legacy docs missing the
    // field — see category list audit notes.
    const notDeleted = { isDeleted: { $ne: 1 } };
    const total = await Metal.countDocuments({ ...filter, ...notDeleted });
    const data = await Metal.find({ ...filter, ...notDeleted })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    return { data, total };
};

export const update_metal_db = async (req) => {
    return await Metal.findByIdAndUpdate(req.params.id, {
        ...req.body,
        updatedBy: req.user.userId
    }, { new: true });
};

export const delete_metal_db = async (id) => {
    return await Metal.findByIdAndUpdate(id, { isDeleted: 1 }, { new: true });
};

export const check_unique_metal = async (filter) => {
    return await Metal.findOne({ ...filter, isDeleted: { $ne: 1 } });
};

export const update_metal_status_db = async (id, status) => {
    return await Metal.findByIdAndUpdate(id, { status }, { new: true });
};

export const sync_metal_price_db = async () => {
    const metalPriceDoc = await MetalPrice.findOne({ status: "ACTIVE", isDeleted: 0 });
    if (!metalPriceDoc) return { error: "Active metal price not found" };

    const metals = await Metal.find({ status: "ACTIVE", isDeleted: 0 });
    const updates = metals.map(m => {
        const basePrice = metalPriceDoc[m.price_type?.toLowerCase()] || 0;
        const price_per_gram = parseFloat(((basePrice / 10) * (m.purity || 1)).toFixed(2));
        return {
            updateOne: {
                filter: { _id: m._id },
                update: { $set: { price_per_gram } }
            }
        };
    });

    if (updates.length) {
        await Metal.bulkWrite(updates);
    }
    return { success: true, count: updates.length };
};
