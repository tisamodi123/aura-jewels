import Sizes from "../models/sizes.model.js";

export const create_size_db = async function (body, userId) {
    try {
        if (body.isDefault === true || body.isDefault === "true") {
            await Sizes.updateMany({ category: body.category }, { $set: { isDefault: false } });
        }
        return await Sizes.create({
            ...body,
            createdBy: userId
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const update_size_db = async function (id, body, userId) {
    try {
        if (body.isDefault === true || body.isDefault === "true") {
            const existing = await Sizes.findById(id);
            const category = body.category || existing?.category;
            if (category) {
                await Sizes.updateMany({ category: category }, { $set: { isDefault: false } });
            }
        }
        return await Sizes.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    ...body,
                    updatedBy: userId
                }
            },
            { new: true }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const delete_size_db = async function (id) {
    try {
        return await Sizes.findOneAndUpdate(
            { _id: id },
            { $set: { isDeleted: 1 } },
            { new: true }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const get_sizes_list_db = async function (filter, skip, limit) {
    // `$ne: 1` matches both isDeleted=0 and legacy rows missing the field.
    const notDeleted = { isDeleted: { $ne: 1 } };
    const data = await Sizes.find({ ...filter, ...notDeleted })
        .sort({ sort: 1, createdAt: -1 })
        .populate("category", "categoryName")
        .skip(skip)
        .limit(limit);

    const total = await Sizes.countDocuments({ ...filter, ...notDeleted });

    return { data, total };
};

export const fetch_size_by_id_db = async function (id) {
    return await Sizes.findOne({ _id: id, isDeleted: { $ne: 1 } });
};

export const update_size_status_db = async function (id, status) {
    try {
        return await Sizes.findOneAndUpdate(
            { _id: id },
            { $set: { status: status } },
            { new: true }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};
