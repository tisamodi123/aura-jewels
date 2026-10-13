import StoneGroupDefault from "../models/stoneGroupDefault.model.js";

/**
 * Ensures that only one entry is set as default for the given stoneType (and type for color stone).
 */
const handleDefaultRotation = async (stoneType, type, excludeId, userId) => {
    // const handleDefaultRotation = async (stoneType, type, origin,excludeId, userId) => { // for multiple stone defaults 
    const query = { stoneType, isDeleted: false };
    // if (stoneType === "color stone") {   // for multiple stone defaults
    //     query.type = type || null;
    // } else if (stoneType === "diamond") {
    //     query.origin = origin || "Both";
    // }
    if (stoneType === "color stone") {
        query.type = type || null;
    }
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    await StoneGroupDefault.updateMany(query, { $set: { isDefault: false, updatedBy: userId } });
};

/**
 * Creates a new stone group default parameter setting or quality.
 */
export const add_stone_group_default_db = async (data) => {
    if (data.isDefault) {
        await handleDefaultRotation(data.stoneType, data.type, null, data.createdBy);
        // await handleDefaultRotation(data.stoneType, data.type, data.origin, null, data.createdBy); // for multiple stone defaults
    }
    
    return await StoneGroupDefault.create({
        ...data,
        isDeleted: false
    });
};

/**
 * Updates an existing stone group default or quality.
 */
export const update_stone_group_default_db = async (id, data, userId) => {
    if (data.isDefault) {
        await handleDefaultRotation(data.stoneType, data.type, id, userId);
        // await handleDefaultRotation(data.stoneType, data.type, data.origin, id, userId); // for multiple stone defaults
    }

    return await StoneGroupDefault.findByIdAndUpdate(
        id,
        {
            $set: {
                ...data,
                updatedBy: userId
            }
        },
        { new: true }
    );
};

/**
 * Toggles the default status of a setting.
 */
export const toggle_default_db = async (id, userId) => {
    const setting = await StoneGroupDefault.findById(id);
    if (!setting || setting.isDeleted) {
        throw new Error("Default setting not found");
    }

    const newDefaultStatus = !setting.isDefault;
    if (newDefaultStatus) {
        await handleDefaultRotation(setting.stoneType, setting.type, id, userId);
        // await handleDefaultRotation(setting.stoneType, setting.type, setting.origin, id, userId); // for multiple stone defaults
    }

    return await StoneGroupDefault.findByIdAndUpdate(
        id,
        { $set: { isDefault: newDefaultStatus, updatedBy: userId } },
        { new: true }
    );
};

/**
 * Toggles or updates the status of an entry (ACTIVE / SUSPENDED).
 */
export const update_status_db = async (id, status, userId) => {
    return await StoneGroupDefault.findByIdAndUpdate(
        id,
        { $set: { status, updatedBy: userId } },
        { new: true }
    );
};

/**
 * Checks if a default setting exists matching a filter.
 */
export const find_stone_group_default_db = async (filter) => {
    return await StoneGroupDefault.findOne(filter);
};

/**
 * Lists default settings with pagination and optional filters.
 */
export const get_stone_group_defaults_db = async (filter, skip, limit) => {
    const data = await StoneGroupDefault.find(filter)
        .sort({ sort: 1, isDefault: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await StoneGroupDefault.countDocuments(filter);
    return { data, total };
};

/**
 * Deletes (soft-deletes) a stone group default setting by setting isDeleted: true.
 * Throws an error if this is the only active setting or is the active default.
 */
export const delete_stone_group_default_db = async (id, userId) => {
    const setting = await StoneGroupDefault.findById(id);
    if (!setting) {
        throw new Error("Default setting not found");
    }

    if (setting.isDeleted) {
        return setting; // Already deleted
    }

    if (setting.isDefault) {
        throw new Error("Cannot delete the active default setting. Please mark another entry as default first.");
    }

    // Count remaining active defaults for this stoneType
    const activeCount = await StoneGroupDefault.countDocuments({
        stoneType: setting.stoneType,
        isDeleted: false
    });

    if (activeCount <= 1) {
        const typeLabel = setting.type ? ` (${setting.type})` : "";
        throw new Error(`Cannot delete. There must be at least one active entry for ${setting.stoneType}${typeLabel}.`);
    }

    return await StoneGroupDefault.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true, updatedBy: userId } },
        { new: true }
    );
};

/**
 * Fetch all active master entries for use in resolveCenterStoneOptions.
 */
export const get_active_dqm_for_selector = async () => {
    return await StoneGroupDefault.find({
        stoneType: "diamond",
        isDeleted: false,
        status: "ACTIVE"
    })
        .sort({ sort: 1 })
        .lean();
};
