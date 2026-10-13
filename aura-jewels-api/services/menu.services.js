import Menu from "../models/menu.model.js";
import { stripAssetImages } from "../utils/homeRedirect.js";
import { MENU_LOCATION } from "../constants/menu.constant.js";

// Accepts either an already-parsed array or a JSON string (the admin builder
// posts the whole tree as a JSON string inside FormData / JSON body).
const parseItems = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

// Fetch a menu document by location (lean for safe downstream decoration).
export const get_menu_by_location_db = async function (location) {
    return await Menu.findOne({
        location: location || MENU_LOCATION.HEADER,
        isDeleted: 0,
    }).lean();
};

// Upsert (create or replace) the menu tree for a location. Image fields across
// the whole tree are reduced to bare filenames (stripAssetImages) so the DB
// only ever stores asset names — the same convention as CMS sections / cards.
export const upsert_menu_db = async function (req) {
    const location = req.params.location || MENU_LOCATION.HEADER;
    const items = stripAssetImages(parseItems(req.body.items));

    const update = {
        location,
        items,
        updatedBy: req.user?.userId,
    };
    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.status !== undefined) update.status = req.body.status;

    return await Menu.findOneAndUpdate(
        { location, isDeleted: 0 },
        {
            $set: update,
            $setOnInsert: { createdBy: req.user?.userId, isDeleted: 0 },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
};
