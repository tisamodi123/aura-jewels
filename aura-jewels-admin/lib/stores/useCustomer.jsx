import { create } from "zustand";

export const useCustomerStore = create((set) => ({
  customer: {},
  setCustomer: (data) => set({ customer: data }),
}));
