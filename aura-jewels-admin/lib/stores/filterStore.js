import { create } from "zustand";

export const useFilterStore = create((set) => ({
    catagoryIds: [],
    subCatagoryIds: [],
    collectionIds: [],
    tagsIds: [],

    setCatagoryIds: (id) => set({ catagoryIds: id }),
    setSubCatagoryIds: (id) => set({ subCatagoryIds: id }),
    setCollectionIds: (id) => set({ collectionIds: id }),
    setTagsIds: (id) => set({ tagsIds: id }),
}));
