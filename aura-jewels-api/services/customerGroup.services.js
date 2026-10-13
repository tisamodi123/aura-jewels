import CustomerGroup from "../models/customerGroup.model.js";

export const createGroupService = async (payload, userId) => {
    return await CustomerGroup.create({
        ...payload,
        createdBy: userId
    });
};

export const getGroupsService = async ({ page = 1, limit = 10, search = "", status }) => {
    const filter = {
        isDeleted: { $ne: 1 },
    };

    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    if (status) {
        filter.status = status;
    }

    const skip = (page - 1) * limit;
    const groups = await CustomerGroup.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await CustomerGroup.countDocuments(filter);

    return {
        data: groups,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
    };
};

export const getGroupByIdService = async (id) => {
    const group = await CustomerGroup.findById(id);

    if (!group || group.isDeleted === 1) {
        throw new Error("Group not found");
    }

    return group;
};

export const updateGroupService = async (id, payload, userId) => {
    const group = await CustomerGroup.findById(id);

    if (!group || group.isDeleted === 1) {
        throw new Error("Group not found");
    }

    Object.assign(group, payload);
    group.updatedBy = userId;

    await group.save();

    return group;
};

export const deleteGroupService = async (id) => {
    const group = await CustomerGroup.findById(id);

    if (!group || group.isDeleted === 1) {
        throw new Error("Group not found");
    }

    group.isDeleted = 1;
    await group.save();

    return true;
};

export const getGroupsServiceDropdown = async () => {
    const groups = await CustomerGroup.find({ isDeleted: { $ne: 1 } })
        .select("name")
        .sort({ createdAt: -1 });

    return groups;
};