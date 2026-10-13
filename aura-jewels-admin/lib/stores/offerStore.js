import { create } from "zustand";
import { OFFER_CUSTOM_MODE, OFFER_FILTER_TYPE } from "../Constant";

export const useOfferStore = create((set) => ({
    filterType: OFFER_FILTER_TYPE.at(0)?.value || "",
    customeMode: OFFER_CUSTOM_MODE.at(0)?.value || "",
    setFilterType: (type) => set({ filterType: type }),
    setCustomeMode: (mode) => set({ customeMode: mode }),
}));
