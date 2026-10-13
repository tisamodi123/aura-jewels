/**
 * Helper to construct initial values from rowData for the Create/Edit Offer Form
 */
export const getOfferInitialValues = (rowData) => {
    // Extract Desktop Image Location
    let desktopImg = rowData?.image || "";
    if (!desktopImg && rowData?.images) {
        const found = rowData.images.find(img => img.MediaSeqNo === 1 || img.IsMainMedia) || rowData.images[0];
        desktopImg = found ? (found.MediaLocation || "") : "";
    }

    // Extract Mobile Image Location
    let mobileImg = rowData?.imageMobile || "";
    if (!mobileImg && rowData?.images) {
        const found = rowData.images.find(img => img.MediaSeqNo === 2) || (rowData.images.length > 1 ? rowData.images[1] : null);
        mobileImg = found ? (found.MediaLocation || "") : "";
    }

    return {
        code: rowData?.code || "",
        name: rowData?.name || "",
        description: rowData?.description || "",
        startDate: rowData?.startDate ? new Date(rowData.startDate).toISOString().split("T")[0] : "",
        endDate: rowData?.endDate ? new Date(rowData.endDate).toISOString().split("T")[0] : "",
        priceRange: {
            from: rowData?.priceRange?.from ?? "",
            to: rowData?.priceRange?.to ?? ""
        },
        discountType: rowData?.discountType || "percentage",
        discountValue: rowData?.discountValue ?? "",
        maxDiscountAmount: rowData?.maxDiscountAmount ?? "",
        appliedOn: rowData?.appliedOn || "product",
        // Combined-offer component %s (used when appliedOn === "combined").
        makingChargePercent: rowData?.makingChargePercent ?? "",
        diamondPercent: rowData?.diamondPercent ?? "",
        status: (rowData?.status && rowData.status.toLowerCase() === "active") ? "active" : "inactive",
        isActive: rowData?.isActive ?? true,
        images: [
            { MediaLocation: desktopImg, IsMainMedia: true, MediaSeqNo: 1 },
            { MediaLocation: mobileImg, IsMainMedia: false, MediaSeqNo: 2 }
        ]
    };
};
