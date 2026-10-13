export const OrderInquiryCustomerMailTemplate = (data) => `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #bf9f5a;">Order Inquiry Received</h2>
      <p>Dear ${data.name || "Customer"},</p>
      <p>Thank you for reaching out to Aura Jewels. We have successfully received your product inquiry request.</p>
      <div style="background-color: #fcfcfc; padding: 15px; border-left: 4px solid #bf9f5a; margin: 15px 0;">
        <table cellpadding="8" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="width: 35%;"><strong>Inquiry ID:</strong></td>
            <td>${data._id?.toString()?.slice(-8)?.toUpperCase() || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Product SKU:</strong></td>
            <td>${data.sku || "-"}</td>
          </tr>
          ${data.productTitle ? `<tr><td><strong>Product Name:</strong></td><td>${data.productTitle}</td></tr>` : ""}
          <tr>
            <td><strong>Name:</strong></td>
            <td>${data.name || "-"}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${data.email || "-"}</td>
          </tr>
          <tr>
            <td><strong>Phone:</strong></td>
            <td>${data.phone || "-"}</td>
          </tr>
          ${data.notes ? `<tr><td><strong>Your Message:</strong></td><td>${data.notes}</td></tr>` : ""}
        </table>
      </div>
      <p>Our sales team will review the details and get back to you shortly.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Regards,<br /><strong>Team Aura Jewels</strong></p>
    </div> 
  `;
