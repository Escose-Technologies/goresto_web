import PDFDocument from 'pdfkit';

// ─── Helpers ──────────────────────────────────────────

const fmt = (n) => {
  const val = Number(n) || 0;
  return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
};

const ORDER_TYPE_LABELS = { dine_in: 'Dine-In', takeaway: 'Takeaway', delivery: 'Delivery' };

// Amount in words — Indian numbering
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numToWords(n) {
  if (n === 0) return 'Zero';
  const abs = Math.abs(Math.round(n));
  if (abs < 20) return ONES[abs];
  if (abs < 100) return TENS[Math.floor(abs / 10)] + (abs % 10 ? ' ' + ONES[abs % 10] : '');
  if (abs < 1000) return ONES[Math.floor(abs / 100)] + ' Hundred' + (abs % 100 ? ' and ' + numToWords(abs % 100) : '');
  if (abs < 100000) return numToWords(Math.floor(abs / 1000)) + ' Thousand' + (abs % 1000 ? ' ' + numToWords(abs % 1000) : '');
  if (abs < 10000000) return numToWords(Math.floor(abs / 100000)) + ' Lakh' + (abs % 100000 ? ' ' + numToWords(abs % 100000) : '');
  return numToWords(Math.floor(abs / 10000000)) + ' Crore' + (abs % 10000000 ? ' ' + numToWords(abs % 10000000) : '');
}

function amountInWords(amount) {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  let w = 'Rupees ' + numToWords(rupees);
  if (paise > 0) w += ' and ' + numToWords(paise) + ' Paise';
  return w + ' Only';
}

// ─── Colors ──────────────────────────────────────────

const COLOR = {
  black: '#1F2937',
  dark: '#374151',
  gray: '#6B7280',
  light: '#9CA3AF',
  border: '#D1D5DB',
  headerBg: '#F3F4F6',
  red: '#B91C1C',
  accent: '#7C3AED',
};

// ─── Main Generator ──────────────────────────────────

/**
 * Generate a PDF invoice for a bill.
 * @param {Object} bill - The bill data (with restaurant, restaurantSettings attached)
 * @returns {PDFDocument} - A pdfkit document (stream)
 */
export function generateBillPdf(bill) {
  const restaurant = bill.restaurant || {};
  const settings = bill.restaurantSettings || {};
  const items = bill.billItems || [];
  const isComposition = settings.gstScheme === 'composition';
  const billTitle = isComposition ? 'BILL OF SUPPLY' : 'TAX INVOICE';
  const hasItemDiscounts = items.some(it => (it.discountAmount || 0) > 0);
  const hasBillDiscount = (bill.billDiscountAmount || 0) > 0;
  const hasServiceCharge = (bill.serviceChargeAmount || 0) > 0;
  const hasPackaging = (bill.packagingCharge || 0) > 0;
  const isSplit = bill.paymentMode === 'split';
  const splits = bill.splitPayments || [];

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    info: {
      Title: bill.billNumber || 'Invoice',
      Author: restaurant.name || 'Goresto',
    },
  });

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = doc.y;

  // ─── Header ──────────────────────────────────────

  // Restaurant logo (if base64)
  if (restaurant.logo && restaurant.logo.startsWith('data:image')) {
    try {
      doc.image(restaurant.logo, doc.page.margins.left, y, { width: 48, height: 48 });
      doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR.black)
        .text(restaurant.name || '', doc.page.margins.left + 56, y + 4, { width: pageWidth - 56 });
      y += 18;
    } catch {
      // If image fails, just show name
      doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR.black)
        .text(restaurant.name || '', doc.page.margins.left, y);
      y = doc.y;
    }
  } else {
    doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR.black)
      .text(restaurant.name || settings.restaurantName || '', doc.page.margins.left, y);
    y = doc.y;
  }

  // Address + contact
  if (restaurant.address || settings.address) {
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.gray)
      .text(settings.address || restaurant.address, doc.page.margins.left, y + 2);
    y = doc.y;
  }

  const contact = [restaurant.phone || settings.phone, restaurant.email || settings.email].filter(Boolean).join('  |  ');
  if (contact) {
    doc.font('Helvetica').fontSize(8).fillColor(COLOR.light)
      .text(contact, doc.page.margins.left, y + 1);
    y = doc.y;
  }

  y += 6;

  // Registration line
  const regParts = [];
  if (settings.gstin) regParts.push('GSTIN: ' + settings.gstin);
  if (settings.fssaiNumber) regParts.push('FSSAI: ' + settings.fssaiNumber);
  if (regParts.length) {
    drawLine(doc, y, pageWidth);
    y += 4;
    doc.font('Helvetica').fontSize(8).fillColor(COLOR.dark)
      .text(regParts.join('     '), doc.page.margins.left, y);
    y = doc.y + 4;
    drawLine(doc, y, pageWidth);
    y += 8;
  } else {
    drawLine(doc, y, pageWidth);
    y += 8;
  }

  // ─── Title ──────────────────────────────────────

  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR.dark)
    .text(billTitle, doc.page.margins.left, y, { width: pageWidth, align: 'center' });
  y = doc.y + 6;

  // ─── Meta Grid ──────────────────────────────────

  const metaLeft = [
    `Bill No: ${bill.billNumber}`,
    `Date: ${fmtDate(bill.createdAt)}  ${fmtTime(bill.createdAt)}`,
    `Table: ${bill.tableNumber}`,
    `Type: ${ORDER_TYPE_LABELS[bill.orderType] || bill.orderType}`,
  ];

  const metaRight = [];
  if (bill.customerName) metaRight.push(`Customer: ${bill.customerName}`);
  if (bill.customerMobile) metaRight.push(`Mobile: ${bill.customerMobile}`);
  if (bill.customerGstin) metaRight.push(`GSTIN: ${bill.customerGstin}`);
  if (settings.placeOfSupply) metaRight.push(`Place of Supply: ${settings.placeOfSupply} (${settings.placeOfSupplyCode || ''})`);

  doc.font('Helvetica').fontSize(9).fillColor(COLOR.dark);
  const metaStartY = y;
  metaLeft.forEach((line) => {
    doc.text(line, doc.page.margins.left, y, { width: pageWidth / 2 });
    y = doc.y;
  });

  let rightY = metaStartY;
  metaRight.forEach((line) => {
    doc.text(line, doc.page.margins.left + pageWidth / 2, rightY, { width: pageWidth / 2, align: 'right' });
    rightY = doc.y;
  });

  y = Math.max(y, rightY) + 8;

  // ─── Items Table ────────────────────────────────

  const colSn = 28;
  const colQty = 36;
  const colRate = 65;
  const colDisc = hasItemDiscounts ? 72 : 0;
  const colAmt = 72;
  const colName = pageWidth - colSn - colQty - colRate - colDisc - colAmt;

  // Header row
  doc.rect(doc.page.margins.left, y, pageWidth, 16).fill(COLOR.headerBg);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR.dark);

  let x = doc.page.margins.left;
  doc.text('#', x + 2, y + 4, { width: colSn, align: 'center' }); x += colSn;
  doc.text('ITEM', x + 2, y + 4, { width: colName }); x += colName;
  doc.text('QTY', x, y + 4, { width: colQty, align: 'center' }); x += colQty;
  doc.text('RATE', x, y + 4, { width: colRate, align: 'right' }); x += colRate;
  if (hasItemDiscounts) { doc.text('DISCOUNT', x, y + 4, { width: colDisc, align: 'right' }); x += colDisc; }
  doc.text('AMOUNT', x, y + 4, { width: colAmt, align: 'right' });

  y += 18;

  // Item rows
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR.black);
  items.forEach((item, i) => {
    // Check if we need a new page
    if (y > doc.page.height - 180) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    const lineTotal = item.price * item.quantity;
    const afterDisc = lineTotal - (item.discountAmount || 0);

    x = doc.page.margins.left;
    doc.text(String(i + 1), x + 2, y, { width: colSn, align: 'center' }); x += colSn;
    doc.text(item.name, x + 2, y, { width: colName - 4 }); x += colName;
    doc.text(String(item.quantity), x, y, { width: colQty, align: 'center' }); x += colQty;
    doc.text(fmt(item.price), x, y, { width: colRate, align: 'right' }); x += colRate;
    if (hasItemDiscounts) {
      if (item.discountAmount > 0) {
        doc.fillColor(COLOR.red)
          .text(`-${fmt(item.discountAmount)}`, x, y, { width: colDisc, align: 'right' });
        doc.fillColor(COLOR.black);
      } else {
        doc.text('—', x, y, { width: colDisc, align: 'right' });
      }
      x += colDisc;
    }
    doc.text(fmt(hasItemDiscounts ? afterDisc : lineTotal), x, y, { width: colAmt, align: 'right' });

    y += 14;

    // Thin line between items
    doc.strokeColor('#EEEEEE').lineWidth(0.3)
      .moveTo(doc.page.margins.left, y - 2).lineTo(doc.page.margins.left + pageWidth, y - 2).stroke();
  });

  y += 4;
  drawLine(doc, y, pageWidth);
  y += 8;

  // ─── Summary ────────────────────────────────────

  const sumX = doc.page.margins.left + pageWidth - 240;
  const sumW = 240;

  const addSumRow = (label, value, opts = {}) => {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(opts.fontSize || 9)
      .fillColor(opts.color || COLOR.black);
    doc.text(label, sumX, y, { width: sumW - 80 });
    doc.text(value, sumX + sumW - 80, y, { width: 80, align: 'right' });
    y += (opts.spacing || 14);
  };

  addSumRow('Subtotal', fmt(bill.subtotal));

  if (bill.totalItemDiscount > 0) {
    addSumRow('Item Discounts', `-${fmt(bill.totalItemDiscount)}`, { color: COLOR.red });
  }

  if (hasBillDiscount) {
    const discLabel = `Bill Discount${bill.billDiscountType === 'percentage' ? ` (${bill.billDiscountValue}%)` : ''}`;
    addSumRow(discLabel, `-${fmt(bill.billDiscountAmount)}`, { color: COLOR.red });
  }

  if (bill.totalItemDiscount > 0 || hasBillDiscount) {
    // Dotted separator
    doc.strokeColor(COLOR.border).lineWidth(0.5)
      .moveTo(sumX, y - 4).lineTo(sumX + sumW, y - 4).dash(2, { space: 2 }).stroke().undash();
    addSumRow('After Discounts', fmt(bill.afterAllDiscounts), { bold: true });
  }

  if (hasServiceCharge) {
    addSumRow(`${settings.serviceChargeLabel || 'Service Charge'}*`, fmt(bill.serviceChargeAmount));
  }

  if (hasPackaging) {
    addSumRow('Packaging Charge', fmt(bill.packagingCharge));
  }

  if (!isComposition) {
    addSumRow('Taxable Value', fmt(bill.taxableAmount));
    if (bill.cgstAmount > 0) addSumRow(`CGST @ ${bill.cgstRate}%`, fmt(bill.cgstAmount));
    if (bill.sgstAmount > 0) addSumRow(`SGST @ ${bill.sgstRate}%`, fmt(bill.sgstAmount));
  }

  if (bill.roundOff !== 0) {
    addSumRow('Round Off', `${bill.roundOff > 0 ? '+' : ''}${fmt(bill.roundOff)}`);
  }

  // Grand total box
  doc.strokeColor(COLOR.black).lineWidth(1.5)
    .moveTo(sumX, y).lineTo(sumX + sumW, y).stroke();
  y += 4;
  addSumRow('GRAND TOTAL', `₹ ${fmt(bill.grandTotal)}`, { bold: true, fontSize: 12, spacing: 16 });
  doc.strokeColor(COLOR.black).lineWidth(1.5)
    .moveTo(sumX, y - 2).lineTo(sumX + sumW, y - 2).stroke();
  y += 4;

  // Amount in words
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLOR.gray)
    .text(amountInWords(bill.grandTotal), sumX, y, { width: sumW });
  y = doc.y + 10;

  // ─── Payment ────────────────────────────────────

  drawLine(doc, y, pageWidth);
  y += 6;

  doc.font('Helvetica').fontSize(9).fillColor(COLOR.dark);
  if (isSplit) {
    const splitStr = splits.map(s => `${(s.mode || '').toUpperCase()}: ₹${fmt(s.amount)}`).join(', ');
    doc.text(`Payment: Split — ${splitStr}`, doc.page.margins.left, y, { width: pageWidth });
  } else {
    doc.text(`Payment: ${(bill.paymentMode || '').toUpperCase()}`, doc.page.margins.left, y, { width: pageWidth });
  }
  y = doc.y;

  if (!isComposition) {
    doc.font('Helvetica').fontSize(8).fillColor(COLOR.light)
      .text('SAC Code: 996331', doc.page.margins.left, y + 2, { width: pageWidth });
    y = doc.y;
  }

  y += 8;

  // ─── Disclaimers ────────────────────────────────

  if (isComposition) {
    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(COLOR.gray)
      .text('Composition taxable person, not eligible to collect tax on supplies.', doc.page.margins.left, y, { width: pageWidth });
    y = doc.y + 4;
  }

  if (hasServiceCharge) {
    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(COLOR.gray)
      .text('*Service charge is voluntary and can be removed on request.', doc.page.margins.left, y, { width: pageWidth });
    y = doc.y + 4;
  }

  y += 8;

  // ─── Footer ─────────────────────────────────────

  drawLine(doc, y, pageWidth);
  y += 8;

  doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLOR.dark)
    .text(settings.billFooterText || 'Thank you for dining with us!', doc.page.margins.left, y, { width: pageWidth, align: 'center' });
  y = doc.y + 4;

  if (settings.fssaiNumber) {
    doc.font('Helvetica').fontSize(7).fillColor(COLOR.light)
      .text(`FSSAI Lic. No: ${settings.fssaiNumber}`, doc.page.margins.left, y, { width: pageWidth, align: 'center' });
  }

  // ─── Cancelled Stamp ───────────────────────────

  if (bill.cancelledAt) {
    const cx = doc.page.width / 2;
    const cy = doc.page.height / 2;
    doc.save();
    doc.translate(cx, cy).rotate(-30);
    doc.font('Helvetica-Bold').fontSize(48).fillColor('#DC262640')
      .text('CANCELLED', -120, -30, { width: 240, align: 'center' });
    doc.restore();
  }

  doc.end();
  return doc;
}

// ─── Utility ─────────────────────────────────────

function drawLine(doc, y, width) {
  doc.strokeColor(COLOR.border).lineWidth(0.5)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.margins.left + width, y)
    .stroke();
}
