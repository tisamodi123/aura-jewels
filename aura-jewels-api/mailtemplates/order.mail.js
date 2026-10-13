// Money breakdown for an order summary block.
//
// `order.total` is the GROSS (tax-inclusive) payable. `order.subTotal` is
// pre-discount and `order.taxAmount` is the GST ADDED on the post-coupon net.
// These templates used to print `order.total` under BOTH "Subtotal" and
// "Total" — harmless when the two were equal, but now that tax is added on top
// it would label a tax-inclusive figure as the subtotal and hide the GST. Every
// summary block must go through this helper.
// Money is rendered WITHOUT decimals, matching the customer site. Display only —
// the persisted order amounts and the amount actually charged stay exact to 2dp.
// Each figure is rounded independently, so the Total is the rounded EXACT total,
// not the sum of the rounded rows.
export const inrMoney = (n) => Math.round(Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const orderMoney = (order = {}) => {
    const inr = inrMoney;

    const total = Number(order.total) || 0;
    const subTotal = Number(order.subTotal) || total;   // fall back for legacy orders
    const discount = Number(order.coupon?.discountAmount) || 0;
    const tax = Number(order.taxAmount) || 0;           // 0 on pre-tax + export orders
    const rate = Number(order.taxRate) || 0;
    const wallet = Number(order.walletUsed) || 0;

    return {
        subTotal: inr(subTotal),
        discount: inr(discount),
        hasDiscount: discount > 0,
        couponCode: order.coupon?.code || "",
        tax: inr(tax),
        hasTax: tax > 0,
        taxLabel: rate > 0 ? `GST (${(rate * 100).toFixed(0)}%)` : "GST",
        wallet: inr(wallet),
        hasWallet: wallet > 0,
        amountDue: inr(Number(order.amountDue) || total - wallet),
        total: inr(total),
    };
};

// Renders the shared Subtotal / Discount / Shipping / GST / Total rows.
// `s` supplies the per-template cell styling so each design keeps its own look.
const summaryRows = (order, s) => {
    const m = orderMoney(order);
    const row = (label, value, opts = {}) => `
        <tr>
            <td style="${opts.strong ? s.totalLabel : s.label}">${label}</td>
            <td align="right" style="${opts.strong ? s.totalValue : s.value}">${opts.raw ? value : `₹${value}`}</td>
        </tr>`;

    return [
        row("Subtotal:", m.subTotal),
        m.hasDiscount ? row(`Discount${m.couponCode ? ` (${m.couponCode})` : ""}:`, `-₹${m.discount}`, { raw: true }) : "",
        row("Shipping:", "Complimentary", { raw: true }),
        m.hasTax ? row(`${m.taxLabel}:`, m.tax) : "",
        row("Total:", m.total, { strong: true }),
        m.hasWallet ? row("Paid from Wallet:", `-₹${m.wallet}`, { raw: true }) : "",
        m.hasWallet ? row("Amount Paid:", m.amountDue, { strong: true }) : "",
    ].join("");
};

export const EmailHeaderTemplate = ({
    title = "Aura Jewels",
    subtitle = "Fine Jewelry",
}) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'https://aurajewels.com').replace(/\/$/, '');
    const logoUrl = `${frontendUrl}/images/aura-logo.png`;

    return `
    <tr>
        <td height="5" style="background: linear-gradient(90deg, #DFD9CE, #8E6C3F, #DFD9CE);"></td>
    </tr>

    <tr>
        <td align="center" style="padding: 35px 0 20px 0; background-color: #FFFFFF;">
            <a href="${frontendUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="${logoUrl}" alt="${title} ${subtitle}" width="180" style="display: block; border: 0; max-width: 180px; height: auto;" />
            </a>
        </td>
    </tr>
    `;
};

export const EmailFooterTemplate = () => {
    const frontendUrl = (process.env.FRONTEND_URL || 'https://aurajewels.com').replace(/\/$/, '');
    return `
    <tr>
        <td align="center" style="padding:40px;background-color:#FFFFFF;text-align:center;">
            <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:16px;font-style:italic;color:#8E6C3F;">
                Exquisite Craftsmanship, Forever Captured.
            </p>

            <p style="margin:20px 0 0 0;font-family:'Montserrat',Arial,sans-serif;font-size:11px;line-height:18px;color:#8A8A8A;">
                If you have any inquiries regarding your purchase,
                please email us at
                <a href="mailto:info@aurajewels.com"
                    style="color:#8E6C3F;text-decoration:none;">
                    info@aurajewels.com
                </a>
            </p>

            <p style="margin:30px 0 0 0;font-family:'Montserrat',Arial,sans-serif;font-size:10px;color:#B0B0B0;">
                © ${new Date().getFullYear()} Aura Jewels - Aura Jewels Luxury LLP
                All rights reserved.
            </p>
        </td>
    </tr>
    `;
};
export const OrderMailContentTemplate = (order) => {
    const orderId = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : new Date().toLocaleDateString();

    const shipping = order.shippingAddress || {};
    const totalAmount = (order.total || 0).toLocaleString("en-IN");

    // Real payment method (COD is not offered).
    const _wu = Number(order.walletUsed) || 0;
    const _p = order.payment || {};
    const paymentMethodLabel = _p.provider
        ? `${_p.provider === "razorpay" ? "Razorpay" : _p.provider}${_p.method ? ` (${String(_p.method).toUpperCase()})` : ""}${_wu > 0 ? " + Store Wallet" : ""}`
        : (_wu > 0 && _wu >= (Number(order.total) || 0) ? "Store Wallet" : "Online Payment");

    // Loop and generate rows for each OrderItem
    const itemsHtml = (order.items || []).map(item => {
        const p = item.productDetails || {};
        const isDiamond = item.diamondDetails && Object.keys(item.diamondDetails).length > 0;
        const sku = p.itemCode || item.productId?.itemCode || '';
        const size = p.size || item.sizeId?.name || '';

        return `
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #EBE6DD; vertical-align: top;">
                <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #1E1E1E; font-weight: 500;">
                    ${p.productTitle || (isDiamond ? 'Classic Fine Diamond' : 'Aura Jewels Custom Piece')}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 11px; line-height: 16px; color: #8A8A8A; font-family: 'Montserrat', Arial, sans-serif;">
                    ${sku ? `SKU: ${sku} &nbsp;|&nbsp; ` : ""}
                    Metal: ${p.metalType || 'Gold'} (${p.metalStamp || '18K'})
                    ${size ? ` &nbsp;|&nbsp; Size: ${size}` : ""}
                    ${isDiamond ? ` &nbsp;|&nbsp; Stone: ${item.diamondDetails.carat || ''} ct ${item.diamondDetails.shape || ''} Shape` : ""}
                    ${p.engravingText ? ` &nbsp;|&nbsp; <span style="font-style: italic; color: #8E6C3F;">Engraved: "${p.engravingText}"</span>` : ""}
                </p>
            </td>
            <td style="padding: 15px 0; text-align: center; border-bottom: 1px solid #EBE6DD; vertical-align: top; font-size: 14px; color: #1E1E1E; font-family: 'Montserrat', Arial, sans-serif;">
                ${p.qty || 1}
            </td>
            <td style="padding: 15px 0; text-align: right; border-bottom: 1px solid #EBE6DD; vertical-align: top; font-size: 14px; color: #8E6C3F; font-weight: 600; font-family: 'Montserrat', Arial, sans-serif;">
                ₹${inrMoney(item.price)}
            </td>
        </tr>
        `;
    }).join("");

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <!-- Main Container -->
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #FFFFFF; border: 1px solid #EBE6DD; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        <!-- Luxury Logo Header -->
                        ${EmailHeaderTemplate({ title: "Aura Jewels", subtitle: "Fine Jewelry" })}
                        
                        <!-- Hero Status Section -->
                        <tr>
                            <td align="center" style="padding: 10px 40px 35px 40px; border-bottom: 1px solid #FAF7F2; text-align: center;">
                                <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 400; color: #1E1E1E; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">Your Order is Confirmed</p>
                                <p style="margin: 12px auto 0 auto; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; line-height: 22px; color: #707070; font-weight: 300; max-w-md: 400px; text-align: center;">
                                    Thank you for your purchase. Our master designers and craftsmen are beginning work on your selected pieces. Below is a summary of your luxury acquisition details.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Order Reference Row -->
                        <tr>
                            <td style="padding: 25px 40px; background-color: #FAF8F5;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td>
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A;">Order Number</p>
                                            <p style="margin: 4px 0 0 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: bold; color: #1E1E1E; font-mono;">#${orderId}</p>
                                        </td>
                                        <td align="right">
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A;">Date of Order</p>
                                            <p style="margin: 4px 0 0 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1E1E1E;">${orderDate}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Order Items Details Table -->
                        <tr>
                            <td style="padding: 35px 40px 10px 40px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <thead>
                                        <tr>
                                            <th align="left" style="padding-bottom: 12px; border-bottom: 2px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A;">Item Details</th>
                                            <th align="center" style="padding-bottom: 12px; border-bottom: 2px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A; width: 60px;">Qty</th>
                                            <th align="right" style="padding-bottom: 12px; border-bottom: 2px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A; width: 100px;">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Totals Section -->
                        <tr>
                            <td style="padding: 10px 40px 35px 40px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td width="55%"></td>
                                        <td width="45%">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                ${summaryRows(order, {
        label: "padding: 8px 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #707070;",
        value: "padding: 8px 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #1E1E1E;",
        totalLabel: "padding: 15px 0 0 0; border-top: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; font-weight: bold; color: #1E1E1E;",
        totalValue: "padding: 15px 0 0 0; border-top: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 16px; font-weight: bold; color: #8E6C3F;",
    })}
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Shipping Address Section -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #FAF8F5; border-top: 1px solid #EBE6DD; border-bottom: 1px solid #EBE6DD;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td valign="top" width="50%" style="padding-right: 20px;">
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A; padding-bottom: 8px;">Delivery Address</p>
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; font-weight: 500; color: #1E1E1E; line-height: 20px;">
                                                ${shipping.firstName} ${shipping.lastName}<br>
                                                <span style="font-weight: 300; color: #555555; font-size: 12px; line-height: 18px;">
                                                    ${shipping.address}<br>
                                                    ${shipping.city}, ${shipping.state} - ${shipping.zipCode}<br>
                                                    ${shipping.country}
                                                </span>
                                            </p>
                                        </td>
                                        <td valign="top" width="50%">
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A; padding-bottom: 8px;">Payment Details</p>
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; font-weight: 500; color: #1E1E1E; line-height: 20px;">
                                                Payment Method:<br>
                                                <span style="font-weight: 300; color: #555555; font-size: 12px;">${paymentMethodLabel}</span>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer Info -->
                        ${EmailFooterTemplate()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export const OrderPlacedMailTemplate = (order) => {
    const orderId = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : new Date().toLocaleDateString();

    const shipping = order.shippingAddress || {};
    const totalAmount = (order.total || 0).toLocaleString("en-IN");

    // Dynamic rendering for structural rows matching the dynamic structure of the original template
    const itemsHtml = (order.items || []).map(item => {
        const p = item.productDetails || {};
        const isDiamond = item.diamondDetails && Object.keys(item.diamondDetails).length > 0;
        // Fallback or dynamic selection of image if available in your schema, otherwise fallback placeholders
        const itemImage = p.productImage || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&q=80";
        const sku = p.itemCode || item.productId?.itemCode || '';
        const size = p.size || item.sizeId?.name || '';

        return `
        <tr>
            <td style="padding: 16px; border: 1px solid rgba(209, 197, 180, 0.3); border-radius: 12px; background-color: #ffffff; box-shadow: 0px 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; display: block;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td width="96" valign="top" style="width: 96px;">
                            <div style="width: 96px; height: 96px; background-color: #eeeeee; border-radius: 4px; overflow: hidden;">
                                <img src="${itemImage}" alt="Product Shot" width="96" height="96" style="width: 96px; height: 96px; object-fit: cover; display: block; border: 0;">
                            </div>
                        </td>
                        <td valign="middle" style="padding-left: 24px;">
                            <h4 style="margin: 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; font-weight: 600; line-height: 1.4; color: #1a1c1c;">
                                ${p.productTitle || (isDiamond ? 'The Celestial Pear Ring' : 'Classic Fine Piece')}
                            </h4>
                            <p style="margin: 4px 0 0 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #4e4639;">
                                ${sku ? `SKU: ${sku} <br> ` : ""}
                                Metal: ${p.metalType || 'Gold'} (${p.metalStamp || '18K'}) ${size ? ` | Size: ${size}` : ""}
                                ${isDiamond ? `<br>${item.diamondDetails.carat || '1.5'}ct Natural Diamond` : ""}
                            </p>
                            <p style="margin: 4px 0 0 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: #775a19; text-transform: uppercase;">
                                ${isDiamond ? 'GIA / IGI Certified' : 'Authenticity Guaranteed'}
                            </p>
                        </td>
                        <td width="100" align="right" valign="middle" style="width: 100px; text-align: right;">
                            <p style="margin: 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #1a1c1c;">
                                ₹${inrMoney(item.price)}
                            </p>
                            <p style="margin: 4px 0 0 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; color: #5f5e5e;">
                                Qty: ${p.qty || 1}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr><td height="16" style="font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
        `;
    }).join("");

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aura Jewels - Order Confirmation</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Libre+Caslon+Text:ital,wght@0,400;1,400&display=swap');
            
            /* Responsive Client Adjustments */
            body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; background-color: #f9f9f9; }
            img { max-width: 100%; height: auto; }
            
            @media screen and (max-w: 640px) {
                .container-table { width: 100% !important; max-width: 100% !important; }
                .adaptive-padding { padding: 32px 20px !important; }
                .address-stack { display: block !important; width: 100% !important; padding-right: 0 !important; margin-bottom: 32px !important; }
                .trust-stack { display: block !important; width: 100% !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; table-layout: fixed;">
            <tr>
                <td align="center" style="padding: 64px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="700" class="container-table" style="width: 700px; background-color: #ffffff; border: 1px solid rgba(209, 197, 180, 0.3); border-radius: 8px; overflow: hidden; box-shadow: 0px 10px 30px rgba(0,0,0,0.05);">
                        <tr>
                            <td height="4" style="background: linear-gradient(90deg, #775a19, #c5a059, #775a19); font-size: 1px; line-height: 1px;">&nbsp;</td>
                        </tr>
                        
                        <!-- Luxury Logo Header -->
                        ${EmailHeaderTemplate({ title: "Aura Jewels", subtitle: "The Dawn of Diamond Luxury" })}
                        
                        <tr>
                            <td class="adaptive-padding" style="padding: 64px 40px 0 40px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    
                                    <tr>
                                        <td align="center" style="padding-bottom: 64px; border-bottom: 1px solid rgba(209, 197, 180, 0.2);">
                                            <span style="display: inline-block; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 600; color: #775a19; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px;">Order Confirmation</span>
                                            <h2 style="margin: 0 0 16px 0; font-family: 'Libre Caslon Text', Georgia, serif; font-size: 24px; font-weight: 400; color: #1a1c1c; line-height: 1.3;">Thank you for your purchase.</h2>
                                            <p style="margin: 0 auto; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #4e4639; max-width: 450px;">
                                                Your journey with Aura Jewels has begun. We are preparing your handcrafted selections for their final inspection, setting validation, and luxury certification.
                                            </p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 24px 0; border-bottom: 1px solid rgba(209, 197, 180, 0.2);">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td>
                                                        <p style="margin: 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #5f5e5e; letter-spacing: 0.05em;">Order Number</p>
                                                        <p style="margin: 4px 0 0 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #1a1c1c;">#${orderId}</p>
                                                    </td>
                                                    <td align="right">
                                                        <p style="margin: 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #5f5e5e; letter-spacing: 0.05em;">Order Date</p>
                                                        <p style="margin: 4px 0 0 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; color: #1a1c1c;">${orderDate}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding-top: 64px;">
                                            <h3 style="margin: 0 0 24px 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #1a1c1c;">Exquisite Selections</h3>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                ${itemsHtml}
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding-top: 16px; padding-bottom: 64px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f3f3; border-radius: 12px; padding: 24px;">
                                                <tr>
                                                    <td>
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                            ${summaryRows(order, {
        label: "font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; color: #4e4639; padding-bottom: 8px;",
        value: "font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; color: #1a1c1c; padding-bottom: 8px;",
        totalLabel: "font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #1a1c1c; padding-top: 16px; border-top: 1px solid rgba(209, 197, 180, 0.3);",
        totalValue: "font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 18px; font-weight: 600; color: #775a19; padding-top: 16px; border-top: 1px solid rgba(209, 197, 180, 0.3);",
    })}
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding-bottom: 64px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td class="address-stack" width="50%" valign="top" style="padding-right: 20px;">
                                                        <h5 style="margin: 0 0 16px 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #5f5e5e;">
                                                             📍 Shipping Address
                                                        </h5>
                                                        <address style="font-style: normal; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1c1c;">
                                                            ${shipping.firstName || ''} ${shipping.lastName || ''}<br>
                                                            ${shipping.address || 'Address Details Pending'}<br>
                                                            ${shipping.city || ''}, ${shipping.state || ''} ${shipping.zipCode || ''}<br>
                                                            ${shipping.country || ''}
                                                        </address>
                                                    </td>
                                                    <td class="trust-stack" width="50%" valign="top">
                                                        <h5 style="margin: 0 0 16px 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #5f5e5e;">
                                                             🛡️ Guaranteed Trust
                                                        </h5>
                                                        <p style="margin: 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #4e4639;">
                                                            Each configuration arrives packaged in protective luxury tier displays along with its dedicated certificate of authenticity. Fully covered by lifetime transit insurance until handed over.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td align="center" style="padding-bottom: 64px;">
                                            <table border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td align="center" style="border-radius: 9999px; background: linear-gradient(135deg, #1a1c1c 0%, #2f3131 100%);">
                                                        <a href="https://yourwebsite.com/account/orders" target="_blank" style="display: inline-block; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 12px; font-weight: 600; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; padding: 16px 48px; border-radius: 9999px;">
                                                            View Your Order Details
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <p style="margin: 16px 0 0 0; font-family: 'Hanken Grotesk', Arial, sans-serif; font-size: 14px; color: #5f5e5e; font-style: italic;">
                                                Expected arrival within 3-5 business days.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer Info -->
                        ${EmailFooterTemplate()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

const renderReturnItemsHtml = (orderItems, returnedItemIds = null) => {
    const items = returnedItemIds
        ? orderItems.filter(item => {
            const itemIdStr = String(item._id || item);
            if (Array.isArray(returnedItemIds)) {
                return returnedItemIds.map(String).includes(itemIdStr);
            }
            return itemIdStr === String(returnedItemIds);
        })
        : orderItems;

    return items.map(item => {
        const p = item.productDetails || {};
        const sku = p.itemCode || item.productId?.itemCode || '';
        const size = p.size || item.sizeId?.name || '';
        return `
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #EBE6DD; vertical-align: top;">
                <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #1E1E1E; font-weight: 500;">
                    ${p.productTitle || 'Aura Jewels Fine Jewelry Piece'}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #8A8A8A; font-family: 'Montserrat', Arial, sans-serif;">
                    ${sku ? `SKU: ${sku} &nbsp;|&nbsp; ` : ""}
                    Metal: ${p.metalType || 'Gold'} (${p.metalStamp || '18K'}) ${size ? ` | Size: ${size}` : ""}
                </p>
            </td>
            <td align="right" style="padding: 15px 0; border-bottom: 1px solid #EBE6DD; vertical-align: top; font-size: 14px; color: #1E1E1E; font-family: 'Montserrat', Arial, sans-serif;">
                ${p.qty || 1}
            </td>
        </tr>
        `;
    }).join("");
};

export const ReturnRequestMailTemplate = (order, reason = "N/A", returnedItemIds = null) => {
    const orderId = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
    const returnId = `RN-${orderId}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = (order.total || 0).toLocaleString("en-IN");
    const itemsHtml = renderReturnItemsHtml(order.items || [], returnedItemIds);

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #FFFFFF; border: 1px solid #EBE6DD; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        
                        <!-- Luxury Logo Header -->
                        ${EmailHeaderTemplate({ title: "Aura Jewels", subtitle: "Fine Jewelry" })}
                        
                        <!-- Hero Status Section -->
                        <tr>
                            <td align="center" style="padding: 30px 40px; background-color: #f9f9f9; border-bottom: 1px solid #EBE6DD; text-align: center;">
                                <h2 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 400; color: #1E1E1E; text-transform: uppercase; letter-spacing: 0.05em;">Return Request Received</h2>
                                <p style="margin: 8px 0 0 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #8E6C3F;">We are processing your request</p>
                            </td>
                        </tr>
                        
                        <!-- Return Reference Card -->
                        <tr>
                            <td style="padding: 25px 40px; background-color: #FAF8F5;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td>
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A;">Return ID Number</p>
                                            <p style="margin: 4px 0 0 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 16px; font-weight: bold; color: #8E6C3F;">#${returnId}</p>
                                        </td>
                                        <td align="right">
                                            <p style="margin: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A8A8A;">Original Order ID</p>
                                            <p style="margin: 4px 0 0 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1E1E1E;">#${orderId}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Return Details -->
                        <tr>
                            <td style="padding: 30px 40px 10px 40px;">
                                <p style="margin: 0 0 10px 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #1E1E1E; font-weight: bold;">Reason for Return:</p>
                                <p style="margin: 0 0 25px 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #555555; font-style: italic; background-color: #FAF8F5; padding: 12px; border-left: 3px solid #8E6C3F;">"${reason}"</p>
                                
                                <h3 style="margin: 0 0 15px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #1E1E1E; border-bottom: 1px solid #EBE6DD; padding-bottom: 8px;">Items to Return</h3>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <thead>
                                        <tr>
                                            <th align="left" style="padding-bottom: 8px; border-bottom: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #8A8A8A; text-transform: uppercase;">Item Description</th>
                                            <th align="right" style="padding-bottom: 8px; border-bottom: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #8A8A8A; text-transform: uppercase; width: 80px;">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Next Steps -->
                        <tr>
                            <td style="padding: 20px 40px 30px 40px;">
                                <h3 style="margin: 0 0 15px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #1E1E1E; border-bottom: 1px solid #EBE6DD; padding-bottom: 8px;">Next Steps</h3>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #555555;">
                                    <tr>
                                        <td valign="top" style="padding: 8px 12px 8px 0; font-weight: bold; color: #8E6C3F;">1.</td>
                                        <td style="padding: 8px 0;"><strong>Prepare Shipment:</strong> Place the item in its original presentation box with all certificates, tags, and packaging.</td>
                                    </tr>
                                    <tr>
                                        <td valign="top" style="padding: 8px 12px 8px 0; font-weight: bold; color: #8E6C3F;">2.</td>
                                        <td style="padding: 8px 0;"><strong>Prepaid Return Label:</strong> Once approved, we will send a prepaid label to attach to your shipping container.</td>
                                    </tr>
                                    <tr>
                                        <td valign="top" style="padding: 8px 12px 8px 0; font-weight: bold; color: #8E6C3F;">3.</td>
                                        <td style="padding: 8px 0;"><strong>Secure Pickup:</strong> Our premium concierge courier will arrange a secure pickup date at your convenience.</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer Info -->
                        ${EmailFooterTemplate()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export const ReturnAcceptedMailTemplate = (order, returnedItemIds = null) => {
    const orderId = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
    const itemsHtml = renderReturnItemsHtml(order.items || [], returnedItemIds);

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #FFFFFF; border: 1px solid #EBE6DD; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        
                        <!-- Luxury Logo Header -->
                        ${EmailHeaderTemplate({ title: "Aura Jewels", subtitle: "Fine Jewelry" })}
                        
                        <!-- Hero Status Section -->
                        <tr>
                            <td align="center" style="padding: 30px 40px; background-color: #f9f9f9; border-bottom: 1px solid #EBE6DD; text-align: center;">
                                <h2 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 400; color: #1E1E1E; text-transform: uppercase; letter-spacing: 0.05em;">Return Request Approved</h2>
                                <p style="margin: 8px 0 0 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #8E6C3F;">We have accepted your return request</p>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 35px 40px; font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1E1E1E;">
                                <p>Dear Valued Customer,</p>
                                <p style="color: #555555;">We are pleased to inform you that your return request for Order <strong>#${orderId}</strong> has been approved.</p>
                                
                                <h3 style="margin: 25px 0 15px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #1E1E1E; border-bottom: 1px solid #EBE6DD; padding-bottom: 8px;">Approved Items</h3>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <thead>
                                        <tr>
                                            <th align="left" style="padding-bottom: 8px; border-bottom: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #8A8A8A; text-transform: uppercase;">Item Description</th>
                                            <th align="right" style="padding-bottom: 8px; border-bottom: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #8A8A8A; text-transform: uppercase; width: 80px;">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>

                                <p style="color: #555555; margin-top: 25px;">Our logistics team is generating your prepaid insured return label. One of our couriers will contact you shortly to coordinate the physical inspection and secure transit pickup.</p>
                                <p style="color: #555555;">Once the returned item passes our quality assurance checks at our main vault, your refund will be credited back to your original payment method or issued as store credit.</p>
                            </td>
                        </tr>
                        
                        <!-- Footer Info -->
                        ${EmailFooterTemplate()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export const ReturnRejectedMailTemplate = (order, reason = "Product did not meet return guidelines.", returnedItemIds = null) => {
    const orderId = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
    const itemsHtml = renderReturnItemsHtml(order.items || [], returnedItemIds);

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #FAF9F6; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF9F6; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #FFFFFF; border: 1px solid #EBE6DD; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        
                        <!-- Luxury Logo Header -->
                        ${EmailHeaderTemplate({ title: "Aura Jewels", subtitle: "Fine Jewelry" })}
                        
                        <!-- Hero Status Section -->
                        <tr>
                            <td align="center" style="padding: 30px 40px; background-color: #f9f9f9; border-bottom: 1px solid #EBE6DD; text-align: center;">
                                <h2 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 400; color: #1E1E1E; text-transform: uppercase; letter-spacing: 0.05em;">Return Request Update</h2>
                                <p style="margin: 8px 0 0 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #ba1a1a;">Return Request Declined</p>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 35px 40px 10px 40px; font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1E1E1E;">
                                <p>Dear Valued Customer,</p>
                                <p style="color: #555555;">We are writing regarding your return request for Order <strong>#${orderId}</strong>.</p>
                                
                                <h3 style="margin: 25px 0 15px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #1E1E1E; border-bottom: 1px solid #EBE6DD; padding-bottom: 8px;">Declined Items</h3>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <thead>
                                        <tr>
                                            <th align="left" style="padding-bottom: 8px; border-bottom: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #8A8A8A; text-transform: uppercase;">Item Description</th>
                                            <th align="right" style="padding-bottom: 8px; border-bottom: 1px solid #EBE6DD; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; color: #8A8A8A; text-transform: uppercase; width: 80px;">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>

                                <p style="color: #555555; margin-top: 25px;">After reviewing your request details, we regret to inform you that we are unable to accept your return request due to the following reason:</p>
                                <p style="margin: 15px 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #ba1a1a; font-weight: bold; background-color: #ffdad6; padding: 12px; border-left: 3px solid #ba1a1a;">
                                    "${reason}"
                                </p>
                                <p style="color: #555555;">If you have any questions or feel this decision was made in error, please reply to this email or contact our customer support team directly at <a href="mailto:info@aurajewels.com" style="color:#8E6C3F;text-decoration:none;">info@aurajewels.com</a>.</p>
                            </td>
                        </tr>
                        
                        <!-- Footer Info -->
                        ${EmailFooterTemplate()}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};;