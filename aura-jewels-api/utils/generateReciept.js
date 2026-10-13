import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { uploadsRoot } from "./uploadPaths.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, "aura-logo.png");

const formatPhone = (phone) => {
    if (!phone) return "";
    let cleaned = String(phone).replace(/\s+/g, "").trim();
    if (!cleaned.startsWith("+")) {
        if (cleaned.startsWith("91") && cleaned.length === 12) {
            cleaned = "+" + cleaned;
        } else if (cleaned.length === 10) {
            cleaned = "+91" + cleaned;
        }
    }
    if (cleaned.startsWith("+91") && cleaned.length === 13) {
        return `+91 ${cleaned.slice(3)}`;
    }
    return cleaned;
};

const formatPrice = (amount, currency = "INR") => {
    const rounded = Math.round(Number(amount) || 0);
    const symbol = currency === "INR" ? "Rs." : (currency === "USD" ? "$" : currency);
    return `${symbol} ${rounded.toLocaleString("en-IN")}`;
};

// --- 1. SAMPLE DATA DATA OBJECT ---
export const orderData = {
    brand: {
        name: 'Aura Jewels',
        tagline: 'Luxury Diamonds, Reinvented'
    },
    receipt: {
        orderNo: '#000566',
        date: '20.07.2026',
        transactionId: '315014623698',
        paymentMethod: 'Net Banking',
        goldRate: '₹145,003',
        isGiftOrder: 'No'
    },
    customer: {
        name: 'Demo Customer',
        email: 'customer@example.com',
        phone: '+91 9876543210'
    },
    billingAddress: {
        name: 'Demo Customer',
        address: '42, Marine Drive',
        cityStateZip: 'Mumbai-400020, Maharashtra, India',
        email: 'customer@example.com',
        phone: '+91 9876543210'
    },
    shippingAddress: {
        name: 'Demo Customer',
        address: '42, Marine Drive',
        cityStateZip: 'Mumbai-400020, Maharashtra, India',
        email: 'customer@example.com',
        phone: '+91 9876543210'
    },
    items: [
        {
            name: 'Ribboned Sparkle Bands Ring in 9KT Yellow Gold (Diamond Quality: EF-VVS VS)',
            meta: [
                'Metal: 9k Yellow Gold',
                'SKU: KOSTPR09019-9KT-3Y',
                'Category: RINGS',
                'Ring Size: 16',
                'Gold Rate: 145003'
            ],
            weight: '0.55',
            price: '5633.00',
            quantity: 1,
            total: '5633.00'
        },
        {
            name: 'Eternal Glimmer Charms Pendants | Pendant Only in 9KT Yellow Gold (Diamond Quality: EF-VVS VS)',
            meta: [
                'Metal: 9k Yellow Gold',
                'SKU: KOSTP09037-9KT-3Y',
                'Category: PENDANTS',
                'Gold Rate: 145003'
            ],
            weight: '0.57',
            price: '8883.00',
            quantity: 1,
            total: '8883.00'
        },
        {
            name: 'Serene Trio Diamond Ring',
            meta: [
                'Metal: 9k Yellow Gold',
                'SKU: KOLRG15697-9KT-2Y',
                'Category: ENGAGEMENT RINGS',
                'Ring Size: 13',
                'Gold Rate: 145003'
            ],
            weight: '1.68',
            price: '47790.00',
            quantity: 1,
            total: '47790.00'
        }
    ],
    totals: {
        subtotal: '62455.00',
        tax: '+ 1874.00',
        netAmount: '64329.00',
        grandTotal: '64329.00'
    },
    terms: 'Your use of the Website shall be deemed to constitute your understanding and approval of, and agreement to be bound by, the Privacy Policy and you consent to the collection.'
};

// --- COLOR PALETTE ---
const COLORS = {
    primary: '#111111',
    secondary: '#555555',
    accent: '#A38144', // Gold accent
    lightBg: '#F9F9F9',
    border: '#E0E0E0'
};

// --- PDF GENERATOR FUNCTION ---
export const createReceiptPDF = (data, outputPath = 'order_receipt_kohira.pdf') => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Render components step-by-step
            renderHeader(doc, data);
            renderCustomerAndAddressDetails(doc, data);
            renderItemsTable(doc, data);
            renderTotals(doc, data);
            renderFooter(doc, data);

            doc.end();

            stream.on('finish', () => resolve(outputPath));
            stream.on('error', (err) => reject(err));
        } catch (error) {
            reject(error);
        }
    });
};

export const generateOrderReceipt = async (order, outputPath) => {
    const currency = order.displayCurrency || "INR";

    const items = (order.items || []).map(item => {
        const p = item.productDetails || {};

        const offer = p.offerDetails || item.offerDetails;
        let offerText = "";
        if (offer) {
            const offerTitle = offer.title || offer.name || "";
            const discSymbol = currency === "INR" ? "Rs." : (currency === "USD" ? "$" : currency);
            const offerDisc = offer.percentage ? `${offer.percentage}% Off` : (offer.discount ? `${discSymbol}${Math.round(offer.discount)} Off` : "");
            const labelParts = [offerTitle, offerDisc].filter(Boolean).join(" - ");
            if (labelParts) {
                offerText = `Offer: ${labelParts}`;
            }
        }

        const meta = [
            `Metal: ${p.metalType || 'Gold'} (${p.metalStamp || '18K'})`,
            p.itemCode ? `SKU: ${p.itemCode}` : "",
            p.categoryName ? `Category: ${p.categoryName}` : "",
            p.size ? `Size: ${p.size}` : "",
            offerText,
        ].filter(Boolean);

        const itemWeight = p.metalWeight || item.metalWeight;

        return {
            name: p.productTitle || 'Aura Jewels Custom Piece',
            meta: meta,
            weight: itemWeight ? `${itemWeight} g` : 'N/A',
            price: formatPrice(item.price || 0, currency),
            quantity: p.qty || 1,
            total: formatPrice((item.price || 0) * (p.qty || 1), currency)
        };
    });

    const shippingAddress = order.shippingAddress || {};
    const hasValidBilling = order.hasBilling && order.billingAddress && order.billingAddress.firstName && order.billingAddress.address;
    const billing = hasValidBilling ? order.billingAddress : shippingAddress;
    const user = order.user || {};

    const discountAmount = Number(order.coupon?.discountAmount) || 0;
    const walletUsed = Number(order.walletUsed) || 0;
    const taxAmount = Number(order.taxAmount) || 0;
    const taxRate = Number(order.taxRate) || 0;

    const data = {
        brand: {
            name: 'Aura Jewels',
            tagline: 'Luxury Diamonds, Reinvented'
        },
        receipt: {
            orderNo: `#${order.orderId || order._id.toString().substring(0, 8).toUpperCase()}`,
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.') : new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
            transactionId: order.payment?.gatewayPaymentId || 'N/A',
            paymentMethod: order.payment?.method ? String(order.payment.method).toUpperCase() : 'ONLINE',
        },
        customer: {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || shippingAddress.firstName + ' ' + shippingAddress.lastName,
            email: user.email || shippingAddress.email || '',
            phone: formatPhone(user.phone || shippingAddress.phone || '')
        },
        billingAddress: {
            name: `${billing.firstName || ''} ${billing.lastName || ''}`.trim(),
            address: billing.address || '',
            cityStateZip: `${billing.city || ''}-${billing.zipCode || ''}, ${billing.state || ''}, ${billing.country || ''}`,
            email: billing.email || '',
            phone: formatPhone(billing.phone)
        },
        shippingAddress: {
            name: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
            address: shippingAddress.address || '',
            cityStateZip: `${shippingAddress.city || ''}-${shippingAddress.zipCode || ''}, ${shippingAddress.state || ''}, ${shippingAddress.country || ''}`,
            email: shippingAddress.email || '',
            phone: formatPhone(shippingAddress.phone)
        },
        items: items,
        totals: {
            subtotal: formatPrice(order.subTotal || 0, currency),
            discount: discountAmount > 0 ? formatPrice(discountAmount, currency) : null,
            couponCode: discountAmount > 0 ? (order.coupon?.code || "") : null,
            tax: taxAmount > 0 ? formatPrice(taxAmount, currency) : null,
            taxLabel: taxRate > 0 ? `GST (${(taxRate * 100).toFixed(0)}%)` : "GST",
            wallet: walletUsed > 0 ? formatPrice(walletUsed, currency) : null,
            amountDue: walletUsed > 0 ? formatPrice(Number(order.amountDue) || (order.total - walletUsed), currency) : null,
            grandTotal: formatPrice(order.total || 0, currency)
        },
        terms: 'Your use of the Website shall be deemed to constitute your understanding and approval of, and agreement to be bound by, the Privacy Policy and you consent to the collection.'
    };

    return createReceiptPDF(data, outputPath);
};

// ==========================================
// COMPONENT 1: Header (Brand & Receipt Info)
// ==========================================
export const renderHeader = (doc, data) => {
    const topY = doc.y;

    // Left: Brand Info (Image Logo if exists, else styled text)
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, topY, { width: 130 });
    } else {
        doc
            .fillColor(COLORS.primary)
            .font('Helvetica-Bold')
            .fontSize(22)
            .text(data.brand.name, 40, topY, { characterSpacing: 2 });

        doc
            .fillColor(COLORS.accent)
            .font('Helvetica')
            .fontSize(9)
            .text(data.brand.tagline.toUpperCase(), 40, topY + 28, { characterSpacing: 1 });
    }

    // Right: Order Receipt Label & Details
    doc
        .fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('RECEIPT', 350, topY, { align: 'right' });

    doc
        .fillColor(COLORS.secondary)
        .font('Helvetica')
        .fontSize(9)
        .text(`Order No: ${data.receipt.orderNo}`, 350, topY + 22, { align: 'right' })
        .text(`Date: ${data.receipt.date}`, 350, topY + 34, { align: 'right' });

    // Divider Line
    doc
        .moveTo(40, topY + 55)
        .lineTo(555, topY + 55)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

    doc.y = topY + 65;
}

// ========================================================
// COMPONENT 2: Customer, Billing, Shipping & Payment Info
// ========================================================
export const renderCustomerAndAddressDetails = (doc, data) => {
    const startY = doc.y;
    const boxWidth = 515;
    const box1Height = 72;
    const box2Height = 100;
    const leftColX = 55;
    const rightColX = 310;

    // Draw Box 1 (Customer & Payment Details)
    doc
        .roundedRect(40, startY, boxWidth, box1Height, 4)
        .fillColor(COLORS.lightBg)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .fillAndStroke();

    // Box 1 - Left Column: Customer Details
    doc
        .fillColor(COLORS.accent)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Customer Details:', leftColX, startY + 10);

    doc
        .fillColor(COLORS.primary)
        .font('Helvetica')
        .fontSize(9)
        .text(data.customer.name, leftColX, startY + 23, { lineGap: 3 })
        .fillColor('#2563EB')
        .text(data.customer.email)
        .fillColor(COLORS.primary)
        .text(data.customer.phone);

    // Box 1 - Right Column: Payment Details
    doc
        .fillColor(COLORS.accent)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Payment Details:', rightColX, startY + 10);

    doc
        .fillColor(COLORS.primary)
        .font('Helvetica')
        .fontSize(9)
        .text(`Transaction Id: ${data.receipt.transactionId}`, rightColX, startY + 23, { lineGap: 3 })
        .text(`Payment Method: ${data.receipt.paymentMethod}`);

    const box2Y = startY + box1Height + 12;

    // Draw Box 2 (Billing & Shipping Addresses)
    doc
        .roundedRect(40, box2Y, boxWidth, box2Height, 4)
        .fillColor(COLORS.lightBg)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .fillAndStroke();

    // Box 2 - Left Column: Billing Address
    doc
        .fillColor(COLORS.accent)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Billing Address:', leftColX, box2Y + 10);

    doc
        .fillColor(COLORS.primary)
        .font('Helvetica')
        .fontSize(9)
        .text(data.billingAddress.name, leftColX, box2Y + 23, { lineGap: 3 })
        .text(data.billingAddress.address)
        .text(data.billingAddress.cityStateZip)
        .fillColor('#2563EB')
        .text(data.billingAddress.email)
        .fillColor(COLORS.primary)
        .text(data.billingAddress.phone);

    // Box 2 - Right Column: Shipping Address
    doc
        .fillColor(COLORS.accent)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Shipping Address:', rightColX, box2Y + 10);

    doc
        .fillColor(COLORS.primary)
        .font('Helvetica')
        .fontSize(9)
        .text(data.shippingAddress.name, rightColX, box2Y + 23, { lineGap: 3 })
        .text(data.shippingAddress.address)
        .text(data.shippingAddress.cityStateZip)
        .fillColor('#2563EB')
        .text(data.shippingAddress.email)
        .fillColor(COLORS.primary)
        .text(data.shippingAddress.phone);

    doc.y = box2Y + box2Height + 15;
};

// ==========================================
// COMPONENT 3: Items Table
// ==========================================
export const renderItemsTable = (doc, data) => {
    let tableTop = doc.y;

    // Column Positions & Widths
    const cols = {
        item: { x: 40, width: 250 },
        weight: { x: 290, width: 60 },
        price: { x: 350, width: 70 },
        qty: { x: 420, width: 40 },
        total: { x: 460, width: 95 }
    };

    // Header Background
    doc
        .rect(40, tableTop, 515, 20)
        .fill(COLORS.lightBg);

    // Header Titles
    doc
        .fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Item Description', cols.item.x + 5, tableTop + 5)
        .text('Weight', cols.weight.x, tableTop + 5, { align: 'right', width: cols.weight.width })
        .text('Price', cols.price.x, tableTop + 5, { align: 'right', width: cols.price.width })
        .text('Qty', cols.qty.x, tableTop + 5, { align: 'center', width: cols.qty.width })
        .text('Total Amount', cols.total.x, tableTop + 5, { align: 'right', width: cols.total.width - 5 });

    let y = tableTop + 25;

    // Iterate over items
    data.items.forEach((item) => {
        const itemStartY = y;

        // Left Col: Title & Attributes
        doc
            .fillColor(COLORS.primary)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(item.name, cols.item.x + 5, y, { width: cols.item.width });

        let metaY = doc.y + 3;
        doc
            .fillColor(COLORS.secondary)
            .font('Helvetica')
            .fontSize(8);

        item.meta.forEach((metaLine) => {
            doc.text(metaLine, cols.item.x + 5, metaY, { width: cols.item.width });
            metaY += 11;
        });

        // Right Cols: Quantities, Prices, Total
        doc
            .fillColor(COLORS.primary)
            .font('Helvetica')
            .fontSize(9)
            .text(item.weight, cols.weight.x, itemStartY, { align: 'right', width: cols.weight.width })
            .text(item.price, cols.price.x, itemStartY, { align: 'right', width: cols.price.width })
            .text(item.quantity.toString(), cols.qty.x, itemStartY, { align: 'center', width: cols.qty.width })
            .text(item.total, cols.total.x, itemStartY, { align: 'right', width: cols.total.width - 5 });

        // Determine height of this row
        const rowHeight = Math.max(metaY - itemStartY, 40);
        y = itemStartY + rowHeight + 10;

        // Horizontal Row Border Line
        doc
            .moveTo(40, y - 5)
            .lineTo(555, y - 5)
            .strokeColor(COLORS.border)
            .lineWidth(0.5)
            .stroke();
    });

    doc.y = y;
}

// ==========================================
// COMPONENT 4: Totals Summary Block
// ==========================================
export const renderTotals = (doc, data) => {
    let y = doc.y + 10;
    const labelX = 350;
    const valueX = 450;
    const valueWidth = 105;

    const rows = [];
    rows.push({ label: 'Subtotal', value: data.totals.subtotal, bold: false });

    if (data.totals.discount) {
        const label = data.totals.couponCode ? `Discount (${data.totals.couponCode})` : 'Discount';
        // Prefix with a minus sign before the formatted price
        rows.push({ label: label, value: `-${data.totals.discount}`, bold: false });
    }

    rows.push({ label: 'Shipping', value: 'Complimentary', bold: false });

    if (data.totals.tax) {
        rows.push({ label: data.totals.taxLabel, value: data.totals.tax, bold: false });
    }

    rows.push({ label: 'Grand Total', value: data.totals.grandTotal, bold: true });

    if (data.totals.wallet) {
        rows.push({ label: 'Paid from Wallet', value: `-${data.totals.wallet}`, bold: false });
        rows.push({ label: 'Amount Paid', value: data.totals.amountDue, bold: true });
    }

    rows.forEach((row) => {
        if (row.bold) {
            // Highlight Grand Total row or Amount Paid row
            doc
                .rect(labelX - 10, y - 2, 215, 20)
                .fill(COLORS.lightBg);

            doc
                .fillColor(COLORS.primary)
                .font('Helvetica-Bold')
                .fontSize(10)
                .text(row.label, labelX, y + 3)
                .text(row.value, valueX, y + 3, { align: 'right', width: valueWidth - 5 });
            y += 24;
        } else {
            doc
                .fillColor(COLORS.secondary)
                .font('Helvetica')
                .fontSize(9)
                .text(row.label, labelX, y)
                .fillColor(COLORS.primary)
                .text(row.value, valueX, y, { align: 'right', width: valueWidth - 5 });
            y += 16;
        }
    });

    doc.y = y + 10;
};

// ==========================================
// COMPONENT 5: Footer & Terms
// ==========================================
export const renderFooter = (doc, data) => {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 85;

    // Divider Line
    doc
        .moveTo(40, footerY)
        .lineTo(555, footerY)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

    // Terms Content
    doc
        .fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('Terms & Conditions:', 40, footerY + 10);

    doc
        .fillColor(COLORS.secondary)
        .font('Helvetica')
        .fontSize(7)
        .text(data.terms, 40, footerY + 22, {
            width: 515,
            align: 'left'
        });
}

export const renderOrderDetailItemsTable = (doc, data) => {
    let tableTop = doc.y + 20;

    // Column Positions & Widths
    const cols = {
        item: { x: 40, width: 350 },
        weight: { x: 400, width: 80 },
        qty: { x: 490, width: 65 }
    };

    // Header Background
    doc
        .rect(40, tableTop, 515, 20)
        .fill(COLORS.lightBg);

    // Header Titles
    doc
        .fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Item Description', cols.item.x + 5, tableTop + 5)
        .text('Weight', cols.weight.x, tableTop + 5, { align: 'right', width: cols.weight.width })
        .text('Qty', cols.qty.x, tableTop + 5, { align: 'center', width: cols.qty.width });

    let y = tableTop + 25;

    // Iterate over items
    data.items.forEach((item) => {
        const itemStartY = y;

        // Left Col: Title & Attributes
        doc
            .fillColor(COLORS.primary)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(item.name, cols.item.x + 5, y, { width: cols.item.width });

        let metaY = doc.y + 3;
        doc
            .fillColor(COLORS.secondary)
            .font('Helvetica')
            .fontSize(8);

        item.meta.forEach((metaLine) => {
            doc.text(metaLine, cols.item.x + 5, metaY, { width: cols.item.width });
            metaY += 11;
        });

        // Right Cols: Quantities, Weight
        doc
            .fillColor(COLORS.primary)
            .font('Helvetica')
            .fontSize(9)
            .text(item.weight, cols.weight.x, itemStartY, { align: 'right', width: cols.weight.width })
            .text(item.quantity.toString(), cols.qty.x, itemStartY, { align: 'center', width: cols.qty.width });

        // Determine height of this row
        const rowHeight = Math.max(metaY - itemStartY, 40);
        y = itemStartY + rowHeight + 10;

        // Horizontal Row Border Line
        doc
            .moveTo(40, y - 5)
            .lineTo(555, y - 5)
            .strokeColor(COLORS.border)
            .lineWidth(0.5)
            .stroke();
    });

    doc.y = y;
};

export const createOrderDetailPDF = (data, outputPath = 'order_detail_receipt.pdf') => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Render components step-by-step
            renderHeader(doc, data);
            renderOrderDetailItemsTable(doc, data);
            renderFooter(doc, data);

            doc.end();

            stream.on('finish', () => resolve(outputPath));
            stream.on('error', (err) => reject(err));
        } catch (error) {
            reject(error);
        }
    });
};

export const generateOrderDetailReceipt = async (order, outputPath) => {
    const currency = order.displayCurrency || "INR";

    const items = (order.items || []).map(item => {
        const p = item.productDetails || {};

        const offer = p.offerDetails || item.offerDetails;
        let offerText = "";
        if (offer) {
            const offerTitle = offer.title || offer.name || "";
            const discSymbol = currency === "INR" ? "Rs." : (currency === "USD" ? "$" : currency);
            const offerDisc = offer.percentage ? `${offer.percentage}% Off` : (offer.discount ? `${discSymbol}${Math.round(offer.discount)} Off` : "");
            const labelParts = [offerTitle, offerDisc].filter(Boolean).join(" - ");
            if (labelParts) {
                offerText = `Offer: ${labelParts}`;
            }
        }

        const meta = [
            `Metal: ${p.metalType || 'Gold'} (${p.metalStamp || '18K'})`,
            p.itemCode ? `SKU: ${p.itemCode}` : "",
            p.categoryName ? `Category: ${p.categoryName}` : "",
            p.size ? `Size: ${p.size}` : "",
            offerText,
        ].filter(Boolean);

        const itemWeight = p.metalWeight || item.metalWeight;

        return {
            name: p.productTitle || 'Aura Jewels Custom Piece',
            meta: meta,
            weight: itemWeight ? `${itemWeight} g` : 'N/A',
            quantity: p.qty || 1
        };
    });

    const data = {
        brand: {
            name: 'Aura Jewels',
            tagline: 'Luxury Diamonds, Reinvented'
        },
        receipt: {
            orderNo: `#${order.orderId || order._id.toString().substring(0, 8).toUpperCase()}`,
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.') : new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
            transactionId: order.payment?.gatewayPaymentId || 'N/A',
            paymentMethod: order.payment?.method ? String(order.payment.method).toUpperCase() : 'ONLINE',
        },
        items: items,
        terms: 'Your use of the Website shall be deemed to constitute your understanding and approval of, and agreement to be bound by, the Privacy Policy and you consent to the collection.'
    };

    return createOrderDetailPDF(data, outputPath);
};

export const renderStandaloneProductTable = (doc, data, showPrice = true) => {
    let tableTop = doc.y + 15;

    // Table Column Layout
    const cols = showPrice ? {
        title: { x: 40, width: 230 },
        sku: { x: 270, width: 90 },
        weight: { x: 360, width: 60 },
        qty: { x: 420, width: 35 },
        price: { x: 455, width: 100 }
    } : {
        image: { x: 40, width: 55 },
        title: { x: 100, width: 280 },
        sku: { x: 390, width: 90 },
        weight: { x: 490, width: 65 }
    };

    // Header Background
    doc.rect(40, tableTop, 515, 20).fill(COLORS.lightBg);

    // Header Titles
    doc.fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(9);

    if (cols.image) {
        doc.text('Image', cols.image.x + 5, tableTop + 5);
    }

    doc.text('Product Details', cols.title.x + 5, tableTop + 5)
        .text('SKU / Code', cols.sku.x, tableTop + 5)
        .text('Weight', cols.weight.x, tableTop + 5, { align: 'right', width: cols.weight.width });

    if (cols.qty) {
        doc.text('Qty', cols.qty.x, tableTop + 5, { align: 'center', width: cols.qty.width });
    }

    if (showPrice) {
        doc.text('Price / Item', cols.price.x, tableTop + 5, { align: 'right', width: cols.price.width - 5 });
    }

    let y = tableTop + 25;

    data.items.forEach((item) => {
        const itemStartY = y;

        // Image
        if (cols.image && item.imageSource) {
            try {
                doc.image(item.imageSource, cols.image.x + 5, itemStartY, { width: 45, height: 45 });
            } catch (err) {
                console.error("PDF image render error:", err);
            }
        }

        // Title
        doc.fillColor(COLORS.primary)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(item.name, cols.title.x + 5, y, { width: cols.title.width });

        // Metadata Breakdown (Metal, Dimensions, Stone details, lead time)
        let metaY = doc.y + 4;
        doc.fillColor(COLORS.secondary)
            .font('Helvetica')
            .fontSize(8);

        item.meta.forEach((metaLine) => {
            doc.text(metaLine, cols.title.x + 5, metaY, { width: cols.title.width });
            metaY += 11;
        });

        // SKU, Weight, Qty, Price Column values
        doc.fillColor(COLORS.primary)
            .font('Helvetica')
            .fontSize(9)
            .text(item.itemCode, cols.sku.x, itemStartY, { width: cols.sku.width })
            .text(item.weight, cols.weight.x, itemStartY, { align: 'right', width: cols.weight.width });

        if (cols.qty) {
            doc.text(String(item.quantity), cols.qty.x, itemStartY, { align: 'center', width: cols.qty.width });
        }

        if (showPrice) {
            doc.text(item.price, cols.price.x, itemStartY, { align: 'right', width: cols.price.width - 5 });
        }

        // Calculate dynamic row height
        const rowHeight = Math.max(metaY - itemStartY, cols.image ? 55 : 35);
        y = itemStartY + rowHeight + 10;

        // Divider
        doc.moveTo(40, y - 5)
            .lineTo(555, y - 5)
            .strokeColor(COLORS.border)
            .lineWidth(0.5)
            .stroke();
    });

    doc.y = y;
};

const fetchImageBuffer = async (url) => {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (e) {
        console.error(`fetchImageBuffer failed for ${url}:`, e.message);
        return null;
    }
};

const resolveImageSource = async (mainImageObj) => {
    if (!mainImageObj || !mainImageObj.MediaLocation) return null;
    const loc = mainImageObj.MediaLocation;
    if (/^https?:\/\//i.test(loc)) {
        return await fetchImageBuffer(loc);
    }

    // Always check local disk first as a fast fallback/shortcut
    const localPath = path.join(uploadsRoot, "others", loc);
    if (fs.existsSync(localPath)) {
        return localPath;
    }

    const url = `${process.env.PRODUCT_AWS_ZOOM_IMAGE_URL || ""}${loc}`;
    return await fetchImageBuffer(url);
};

export const renderProductReportHeader = (doc, data) => {
    const topY = doc.y;

    // Left: Brand Logo or Name
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, topY, { width: 130 });
    } else {
        doc.fillColor(COLORS.primary)
            .font('Helvetica-Bold')
            .fontSize(22)
            .text(data.brand.name, 40, topY, { characterSpacing: 2 });

        doc.fillColor(COLORS.accent)
            .font('Helvetica')
            .fontSize(9)
            .text(data.brand.tagline.toUpperCase(), 40, topY + 28, { characterSpacing: 1 });
    }

    // Right: Product Report Title & Date
    doc.fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('PRODUCT REPORT', 350, topY, { align: 'right' });

    doc.fillColor(COLORS.secondary)
        .font('Helvetica')
        .fontSize(9)
        .text(`Generated: ${data.receipt.date}`, 350, topY + 22, { align: 'right' });

    // Divider Line
    doc.moveTo(40, topY + 55)
        .lineTo(555, topY + 55)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke();

    doc.y = topY + 65;
};

export const renderProductReportTableHeader = (doc, cols) => {
    let tableTop = doc.y;

    // Header Background
    doc.rect(40, tableTop, 515, 20).fill(COLORS.lightBg);

    // Header Titles
    doc.fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .fontSize(9);

    if (cols.image) {
        doc.text('Image', cols.image.x + 5, tableTop + 5);
    }

    doc.text('Product Details', cols.title.x + 5, tableTop + 5)
        .text('SKU / Code', cols.sku.x, tableTop + 5)
        .text('Weight', cols.weight.x, tableTop + 5, { align: 'right', width: cols.weight.width });

    doc.y = tableTop + 25;
};

export const generateProductReportPDF = async (products, outputPath = 'product_report.pdf', options = {}) => {
    const currency = options.currency || "INR";
    const productList = Array.isArray(products) ? products : [products];

    // Map Mongoose / Plain JS Product schemas into PDF payload format asynchronously
    const items = await Promise.all(productList.map(async (prod) => {
        const metalInfo = prod.metalId?.metalType
            ? `${prod.metalId.metalType} (${prod.metalId.metalStamp || ''})`
            : (prod.metalType || 'Gold');

        const dimensions = [prod.height && `H: ${prod.height}`, prod.width && `W: ${prod.width}`, prod.length && `L: ${prod.length}`]
            .filter(Boolean)
            .join(' x ');

        const meta = [
            `Metal: ${metalInfo}`,
            prod.designNumber ? `Design No: ${prod.designNumber}` : '',
            prod.categoryId?.categoryName ? `Category: ${prod.categoryId.categoryName}` : '',
            dimensions ? `Dimensions: ${dimensions}` : '',
            prod.shipmentDays ? `Dispatch: ${prod.shipmentDays} days` : '',
            prod.isEngraving ? `Engraving Available: Yes` : '',
        ].filter(Boolean);

        const unitPrice = prod.discountedPrice || prod.finalPrice || 0;
        const weightVal = prod.appxMetalWgt ? `${prod.appxMetalWgt} g` : 'N/A';

        const mainImageObj = prod.images?.find(img => img.IsMainMedia) || prod.images?.[0];
        const imageSource = await resolveImageSource(mainImageObj);

        return {
            name: prod.productTitle || 'Aura Jewels Custom Jewellery Piece',
            itemCode: prod.itemCode || prod.parentItemCode || 'N/A',
            meta: meta,
            weight: weightVal,
            quantity: prod.qty || 1,
            price: formatPrice(unitPrice, currency),
            totalPriceNum: unitPrice * (prod.qty || 1),
            imageSource: imageSource
        };
    }));

    const subtotalNum = items.reduce((sum, item) => sum + item.totalPriceNum, 0);

    const data = {
        brand: {
            name: 'Aura Jewels',
            tagline: 'Luxury Diamonds, Reinvented'
        },
        receipt: {
            orderNo: options.receiptNo || `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
            date: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
            transactionId: 'PRODUCT SPECIFICATION SHEET',
            paymentMethod: 'CATALOG ESTIMATE'
        },
        items: items,
        totals: {
            subtotal: formatPrice(subtotalNum, currency),
            grandTotal: formatPrice(subtotalNum, currency)
        },
        terms: options.terms || 'Product specifications, weights, and component details are estimates subject to production variances. Note: The product may have different variants. Certified diamonds are issued upon final dispatch.'
    };

    const cols = {
        image: { x: 40, width: 75 },
        title: { x: 125, width: 250 },
        sku: { x: 385, width: 90 },
        weight: { x: 485, width: 70 }
    };

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ 
                size: 'A4', 
                margins: { top: 40, bottom: 95, left: 40, right: 40 },
                autoPageBreak: false 
            });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // First Page Header & Table Header
            renderProductReportHeader(doc, data);
            renderProductReportTableHeader(doc, cols);

            const footerHeight = 85;

            items.forEach((item, index) => {
                // Calculate item row height
                doc.font('Helvetica-Bold').fontSize(9);
                const titleHeight = doc.heightOfString(item.name, { width: cols.title.width });
                const metaHeight = item.meta.length * 11;
                const textHeight = titleHeight + 4 + metaHeight;
                const imageHeight = 70;
                const rowHeight = Math.max(textHeight, imageHeight) + 15;

                const estimatedRowHeight = rowHeight + 10; // row plus divider spacing

                // Check if the next item exists and if it will cause a page break
                let nextWillPageBreak = false;
                if (index < items.length - 1) {
                    const nextItem = items[index + 1];
                    doc.font('Helvetica-Bold').fontSize(9);
                    const nextTitleHeight = doc.heightOfString(nextItem.name, { width: cols.title.width });
                    const nextMetaHeight = nextItem.meta.length * 11;
                    const nextRowHeight = Math.max(nextTitleHeight + 4 + nextMetaHeight, imageHeight) + 15;
                    if (doc.y + estimatedRowHeight + nextRowHeight + 10 > doc.page.height - footerHeight) {
                        nextWillPageBreak = true;
                    }
                }

                // Check page limit for the current item
                if (doc.y + estimatedRowHeight > doc.page.height - footerHeight) {
                    renderFooter(doc, data);
                    doc.addPage();
                    renderProductReportHeader(doc, data);
                    renderProductReportTableHeader(doc, cols);
                }

                const itemStartY = doc.y;

                // Image
                if (item.imageSource) {
                    try {
                        doc.image(item.imageSource, cols.image.x + 5, itemStartY, { width: 70, height: 70 });
                    } catch (err) {
                        console.error("PDF image render error:", err);
                    }
                }

                // Title
                doc.fillColor(COLORS.primary)
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .text(item.name, cols.title.x + 5, itemStartY, { width: cols.title.width });

                // Metadata Breakdown (Metal, Dimensions, Stone details, lead time)
                let metaY = doc.y + 4;
                doc.fillColor(COLORS.secondary)
                    .font('Helvetica')
                    .fontSize(8);

                item.meta.forEach((metaLine) => {
                    doc.text(metaLine, cols.title.x + 5, metaY, { width: cols.title.width });
                    metaY += 11;
                });

                // SKU, Weight Column values
                doc.fillColor(COLORS.primary)
                    .font('Helvetica')
                    .fontSize(9)
                    .text(item.itemCode, cols.sku.x, itemStartY, { width: cols.sku.width })
                    .text(item.weight, cols.weight.x, itemStartY, { align: 'right', width: cols.weight.width });

                const finalRowHeight = Math.max(metaY - itemStartY, imageHeight);
                const dividerY = itemStartY + finalRowHeight + 10;

                // Only draw divider if it is not the last item in the list and the next item won't trigger a page break
                if (index < items.length - 1 && !nextWillPageBreak) {
                    doc.moveTo(40, dividerY - 5)
                        .lineTo(555, dividerY - 5)
                        .strokeColor(COLORS.border)
                        .lineWidth(0.5)
                        .stroke();
                }

                doc.y = dividerY;
            });

            // Render final page footer
            renderFooter(doc, data);

            doc.end();

            stream.on('finish', () => resolve(outputPath));
            stream.on('error', (err) => reject(err));
        } catch (error) {
            reject(error);
        }
    });
};