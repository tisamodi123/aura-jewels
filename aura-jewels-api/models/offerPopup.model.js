import mongoose from "mongoose";

// Single-document config for the storefront "Today's Offer" first-visit popup.
// Editable from the admin panel (Settings → Offer Popup). Images are uploaded
// via the existing CMS image endpoint and their URLs stored here as strings.
//
// `enabled`  — master switch; the storefront only shows the popup when true AND
//              at least one image is set.
// `linkUrl`  — optional target the popup image navigates to on click (e.g.
//              "/offer/diwali" or "/all"); blank means clicking just closes it.
const offerPopupSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: false },
        desktopImage: { type: String, default: "" },
        mobileImage: { type: String, default: "" },
        linkUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("OfferPopup", offerPopupSchema);
