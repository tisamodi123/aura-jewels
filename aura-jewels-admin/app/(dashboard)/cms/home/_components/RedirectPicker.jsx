"use client";
// Unified: the home CMS section/card editors now use the one shared advanced
// RedirectPicker (same as the mega-menu builder) — so they can target website
// pages, choose category landing-vs-list, multi-category, subcategory, offer,
// tag, and metal/shape/tag/collection/price/weight filters. The backend resolves
// all of these via the shared decorateRedirects/resolveRedirectHref.
export { default } from "@/components/redirect/RedirectPicker";
