import CategoryLanding from "../models/categoryLanding.model.js";

export const createSection = async function (data) {
    try {
        return await CategoryLanding.create(data);
    } catch (error) {
        console.error("createSection error:", error);
        throw error;
    }
};

export const getSectionList = async function (obj) {
    try {
        return await CategoryLanding.find(obj);
    } catch (error) {
        console.error("getSectionList error:", error);
        throw error;
    }
};

export const getSectionDetail = async function (id) {
    try {
        return await CategoryLanding.findOne({ _id: id });
    } catch (error) {
        console.error("getSectionDetail error:", error);
        throw error;
    }
};

export const updateSection = async function (id, data) {
    try {
        return await CategoryLanding.findByIdAndUpdate(
            id,
            {
                $set: data,
            },
            { new: true }
        );
    } catch (error) {
        console.error("updateSection error:", error);
        throw error;
    }
};

export const deleteSection = async function (id) {
    try {
        return await CategoryLanding.findByIdAndDelete(id);
    } catch (error) {
        console.error("deleteSection error:", error);
        throw error;
    }
};
