import Menu from "../../models/menu.model.js";
import Constant from "../../constants/user.constant.js";
import BaseURL from "../../constants/baseUrl.js";
import { MENU_LOCATION } from "../../constants/menu.constant.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";
import { decorateRedirects } from "../../utils/homeRedirect.js";
import { buildRedirectMaps } from "../../utils/redirectMaps.js";
import { resolveAssetUrl } from "../../utils/uploadPaths.js";

// Walks the decorated tree and, for any link/group/card pointing at a
// category or collection that has NO explicit image of its own, attaches the
// target entity's thumbnail (resolved from its own upload dir, not cmsImages).
// This lets "Collections" / "Shop By Style" render as image cards with zero
// admin effort, while admin-uploaded card images (cmsImages) still win.
const enrichEntityImages = (node, maps, baseUrl, seen = new WeakSet()) => {
    if (!node || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
        node.forEach((n) => enrichEntityImages(n, maps, baseUrl, seen));
        return;
    }

    const r = node.redirect;
    const noImage = !node.image || node.image === "";
    if (noImage && r && r.type === "list" && r.refId) {
        if (r.listOf === "collection") {
            const col = maps.collectionById?.get(r.refId.toString());
            const img = col?.image || col?.pageBanner?.image || "";
            if (img) node.image = resolveAssetUrl(img, baseUrl, "uploads/collectionImages") || "";
        } else if (r.listOf === "category") {
            // Prefer the (more specific) subcategory thumbnail when set.
            const sub = r.subCategoryId ? maps.categoryById?.get(r.subCategoryId.toString()) : null;
            const cat = maps.categoryById?.get(r.refId.toString());
            const img = sub?.image || cat?.image || "";
            if (img) node.image = resolveAssetUrl(img, baseUrl, "uploads/categoryImages") || "";
        }
    }

    for (const v of Object.values(node)) {
        if (v && typeof v === "object") enrichEntityImages(v, maps, baseUrl, seen);
    }
};

// Returns the storefront mega-menu payload from the admin-authored Menu
// document (Shopify-style). The whole tree is rendered server-side:
//
//   * every `redirect` leaf (top-level items, column links, grouped options,
//     featured cards) gets a resolved absolute `href` via decorateRedirects;
//   * every image string is absolutized to a full URL.
//
// The storefront therefore renders labels + `redirect.href` directly with no
// client-side URL building or entity lookups.
//
// Only ACTIVE / non-hidden nodes are shipped: a suspended menu yields an empty
// tree, and isActive=false items/columns/links/groups/options are pruned.
export const get_storefront_menu = async (req, res) => {
    try {
        const Baseurl = BaseURL(req);

        const menu = await Menu.findOne({
            location: MENU_LOCATION.HEADER,
            status: Constant.STATUS.ACTIVE,
            isDeleted: 0,
        }).lean();

        // No published/active menu yet — ship an empty tree. The storefront
        // renders nothing (or its own fallback) rather than erroring.
        if (!menu || !Array.isArray(menu.items)) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.COMMON.SUCCESS,
                data: { location: MENU_LOCATION.HEADER, items: [] },
            });
        }

        const active = (n) => n && n.isActive !== false;

        // Prune inactive nodes, keeping only the fields the storefront needs.
        // Order is the STORED ARRAY ORDER — exactly what the admin arranged in
        // the builder. We deliberately do NOT re-sort by a `sort` field: the
        // builder maintains order via the array (drag/append), and a
        // newly-added node has no `sort`, so sorting by it would wrongly jump
        // new columns/links to the front.
        const items = (menu.items || [])
            .filter(active)
            .map((item) => ({
                _id: item._id,
                label: item.label || "",
                redirect: item.redirect || { type: "none" },
                hasMegaMenu: item.hasMegaMenu !== false,
                columns: (item.columns || [])
                    .filter(active)
                    .map((col) => ({
                        _id: col._id,
                        title: col.title || "",
                        layout: col.layout || "links",
                        links: (col.links || [])
                            .filter(active)
                            .map((l) => ({
                                _id: l._id,
                                label: l.label || "",
                                image: l.image || "",
                                redirect: l.redirect || { type: "none" },
                            })),
                        groups: (col.groups || [])
                            .filter(active)
                            .map((g) => ({
                                _id: g._id,
                                label: g.label || "",
                                hex: g.hex || "",
                                image: g.image || "",
                                redirect: g.redirect || { type: "none" },
                                options: (g.options || [])
                                    .map((o) => ({
                                        label: o.label || "",
                                        redirect: o.redirect || { type: "none" },
                                    })),
                            })),
                    })),
                featuredCards: (item.featuredCards || [])
                    .map((c) => ({
                        image: c.image || "",
                        imageMobile: c.imageMobile || "",
                        title: c.title || "",
                        subtitle: c.subtitle || "",
                        ctaText: c.ctaText || "",
                        redirect: c.redirect || { type: "none" },
                    })),
            }));

        // Resolve every redirect target across the whole tree in one batch,
        // then decorate (adds `href` to each redirect, absolutizes images).
        const maps = await buildRedirectMaps(items);
        const decorated = decorateRedirects(items, maps, Baseurl);
        // Auto-attach category/collection thumbnails to image-less links.
        enrichEntityImages(decorated, maps, Baseurl);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.SUCCESS,
            data: { location: menu.location, items: decorated },
        });
    } catch (error) {
        console.error("get_storefront_menu error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
