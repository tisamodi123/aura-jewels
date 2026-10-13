import Tag from "../models/tag.model.js";

// Lets DB errors bubble so the controller's catch returns the real
// message — the prior `console.log` + implicit `return undefined` masked
// failures as silent success at the controller layer.
export const add_tag_db = async (data) => {
    return await Tag.create(data);
};

export const check_unique_tag = async (obj) => {
    return await Tag.findOne(obj);
};

export const get_tag_db = async (filter, skip, limit) => {
    const data = await Tag.find(filter)
        .sort({ sort: 1 })
        .skip(skip)
        .limit(limit);

    const total = await Tag.countDocuments(filter);

    return { data, total };
};

export const update_tag_db = async (id, data) => {
    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.acceptableValues) updateData.acceptableValues = data.acceptableValues;
    if (data.sort !== undefined) updateData.sort = data.sort;
    if (data.status) updateData.status = data.status;
    if (data.isMenu !== undefined) {
        updateData.isMenu = data.isMenu === true || data.isMenu === 1 || data.isMenu === "true" || data.isMenu === "1";
    }

    updateData.updatedBy = data.updatedBy;

    return await Tag.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true },
    );
};

export const delete_tag_db = async (id) => {
    return await Tag.findByIdAndDelete(id);
};

export const update_tag_status_db = async (id, status) => {
    return await Tag.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true },
    );
};
