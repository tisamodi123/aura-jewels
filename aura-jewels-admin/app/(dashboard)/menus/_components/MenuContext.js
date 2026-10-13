"use client";

import { createContext, useContext } from "react";

// Shares the RedirectPicker option lists (pages, categories, collections,
// offers, tags, shapes, metals) with every nested picker in the menu builder
// so they don't each re-fetch. Provided once by MenuBuilder.
export const MenuOptionsContext = createContext({
    pages: [],
    categories: [],
    collections: [],
    offers: [],
    tags: [],
    shapes: [],
    metals: [],
});

export const useMenuOptions = () => useContext(MenuOptionsContext);
