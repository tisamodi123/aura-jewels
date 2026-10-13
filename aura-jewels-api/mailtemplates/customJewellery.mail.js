const getRequestId = (data) =>
  data?._id?.toString()?.slice(-8)?.toUpperCase() || "N/A";

export const CustomJewelleryCustomerMailTemplate = (data) => `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2>Custom Jewellery Request Received</h2>
      <p>Dear ${data.firstName || "Customer"} ${data.lastName || ""},</p>
      <p>We have received your custom jewellery request successfully.</p>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%;">
        <tr><td><strong>Request ID</strong></td><td>${getRequestId(
          data
        )}</td></tr>
        <tr><td><strong>Category</strong></td><td>${
          data.categoryId?.categoryName || "-"
        }</td></tr>
        <tr><td><strong>Metal</strong></td><td>${
          data.metalId?.name || "-"
        }</td></tr>
        <tr><td><strong>Approx Metal Weight</strong></td><td>${
          data.approxMetalWeight ?? "-"
        }</td></tr>
        <tr><td><strong>Stone Type</strong></td><td>${
          data.stoneType || "-"
        }</td></tr>
        <tr><td><strong>Approx Stone Weight</strong></td><td>${
          data.approxStoneWeight ?? "-"
        }</td></tr>
        <tr><td><strong>Budget</strong></td><td>${data.budget ?? "-"}</td></tr>
        <tr><td><strong>Ring Size</strong></td><td>${
          data.ringSizeId?.name || "-"
        }</td></tr>
        <tr><td><strong>Engraving</strong></td><td>${
          data.engraving || "-"
        }</td></tr>
        <tr><td><strong>Remarks</strong></td><td>${
          data.remarks || "-"
        }</td></tr>
      </table>
      <p style="margin-top: 16px;">Our team will contact you soon.</p>
      <p>Regards,<br />Aura Jewels</p>
    </div>
  `;

export const CustomJewelleryAdminMailTemplate = (data) => `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2>New Custom Jewellery Request</h2>
      <p>A new custom jewellery request has been submitted.</p>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%;">
        <tr><td><strong>Request ID</strong></td><td>${getRequestId(
          data
        )}</td></tr>
        <tr><td><strong>First Name</strong></td><td>${
          data.firstName || "-"
        }</td></tr>
        <tr><td><strong>Last Name</strong></td><td>${
          data.lastName || "-"
        }</td></tr>
        <tr><td><strong>Email</strong></td><td>${data.email || "-"}</td></tr>
        <tr><td><strong>Mobile Number</strong></td><td>${
          data.mobileNumber || "-"
        }</td></tr>
        <tr><td><strong>Country Code</strong></td><td>${
          data.countryCode || "-"
        }</td></tr>
        <tr><td><strong>Category</strong></td><td>${
          data.categoryId?.categoryName || "-"
        }</td></tr>
        <tr><td><strong>Other Product</strong></td><td>${
          data.otherProduct || "-"
        }</td></tr>
        <tr><td><strong>Metal</strong></td><td>${
          data.metalId?.name || "-"
        }</td></tr>
        <tr><td><strong>Approx Metal Weight</strong></td><td>${
          data.approxMetalWeight ?? "-"
        }</td></tr>
        <tr><td><strong>Ring Size</strong></td><td>${
          data.ringSizeId?.name || "-"
        }</td></tr>
        <tr><td><strong>Stone Type</strong></td><td>${
          data.stoneType || "-"
        }</td></tr>
        <tr><td><strong>Approx Stone Weight</strong></td><td>${
          data.approxStoneWeight ?? "-"
        }</td></tr>
        <tr><td><strong>Gemstone Preference</strong></td><td>${
          data.gemstonePreference || "-"
        }</td></tr>
        <tr><td><strong>Budget</strong></td><td>${data.budget ?? "-"}</td></tr>
        <tr><td><strong>Engraving</strong></td><td>${
          data.engraving || "-"
        }</td></tr>
        <tr><td><strong>Is Engraving</strong></td><td>${
          data.isEngraving ?? "-"
        }</td></tr>
        <tr><td><strong>Remarks</strong></td><td>${
          data.remarks || "-"
        }</td></tr>
        <tr><td><strong>Attachments Count</strong></td><td>${
          data.attachments?.length || 0
        }</td></tr>
        <tr><td><strong>Urls Count</strong></td><td>${
          data.urls?.length || 0
        }</td></tr>
      </table>
    </div>
  `;
