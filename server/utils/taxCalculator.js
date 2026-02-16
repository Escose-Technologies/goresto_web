/**
 * GST-compliant tax calculation engine for Indian restaurant billing.
 *
 * IMPORTANT: Service charge and packaging charge are INCLUDED in the
 * taxable value per GST Section 15(1). They form part of the
 * "consideration for supply."
 *
 * Calculation Order:
 *   Subtotal (items)
 *   - Item Discounts
 *   - Bill Discount
 *   = After All Discounts
 *   + Service Charge (on after-discount amount)
 *   + Packaging Charge (takeaway/delivery)
 *   = Taxable Value  <-- GST calculated on THIS
 *   + CGST + SGST
 *   +/- Round Off
 *   = Grand Total
 */

/**
 * Round to 2 decimal places (financial rounding).
 */
function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Process bill items and apply item-level discounts.
 *
 * @param {Array} billItems - [{unitPrice, quantity, itemDiscountType, itemDiscountValue, ...}]
 * @returns {Array} Processed items with lineTotal, itemDiscountAmount, taxableValue
 */
function processItemDiscounts(billItems) {
  return billItems.map(item => {
    const lineTotal = round2(item.unitPrice * item.quantity);
    let itemDiscountAmount = 0;

    if (item.itemDiscountType === 'percentage' && item.itemDiscountValue > 0) {
      const cappedValue = Math.min(item.itemDiscountValue, 100);
      itemDiscountAmount = round2(lineTotal * (cappedValue / 100));
    } else if (item.itemDiscountType === 'flat' && item.itemDiscountValue > 0) {
      itemDiscountAmount = round2(Math.min(item.itemDiscountValue, lineTotal));
    }

    return {
      ...item,
      lineTotal,
      itemDiscountAmount,
      taxableValue: round2(lineTotal - itemDiscountAmount),
    };
  });
}

/**
 * Calculate a complete bill with Indian GST compliance.
 *
 * @param {Object} params
 * @param {Array}  params.billItems - [{unitPrice, quantity, itemDiscountType?, itemDiscountValue?, ...}]
 * @param {Object} params.settings - DB settings: {gstScheme, gstRate, serviceCharge, showServiceCharge, enableRoundOff, enablePackagingCharge, defaultPackagingCharge}
 * @param {string} [params.billDiscountType] - "percentage" | "flat" | null
 * @param {number} [params.billDiscountValue] - discount input value
 * @param {string} [params.orderType] - "dine_in" | "takeaway" | "delivery"
 * @param {number} [params.packagingCharge] - manual override for packaging
 * @returns {Object} Full calculation result
 */
export function calculateBill({
  billItems,
  settings,
  billDiscountType = null,
  billDiscountValue = 0,
  orderType = 'dine_in',
  packagingCharge = 0,
}) {
  // Step 1 & 2: Process items with item-level discounts
  const processedItems = processItemDiscounts(billItems);

  // Step 3: Subtotals
  const subtotal = round2(processedItems.reduce((s, i) => s + i.lineTotal, 0));
  const totalItemDiscount = round2(processedItems.reduce((s, i) => s + i.itemDiscountAmount, 0));
  const afterItemDiscount = round2(subtotal - totalItemDiscount);

  // Step 4: Bill-level discount
  let billDiscountAmount = 0;
  if (billDiscountType === 'percentage' && billDiscountValue > 0) {
    const cappedValue = Math.min(billDiscountValue, 100);
    billDiscountAmount = round2(afterItemDiscount * (cappedValue / 100));
  } else if (billDiscountType === 'flat' && billDiscountValue > 0) {
    billDiscountAmount = round2(Math.min(billDiscountValue, afterItemDiscount));
  }
  const afterAllDiscounts = round2(afterItemDiscount - billDiscountAmount);

  // Step 5: Service charge
  // settings.serviceCharge is stored as decimal (0.1 = 10%)
  const serviceChargeRate = settings.showServiceCharge
    ? round2((settings.serviceCharge || 0) * 100)
    : 0;
  const serviceChargeAmount = serviceChargeRate > 0
    ? round2(afterAllDiscounts * (serviceChargeRate / 100))
    : 0;

  // Step 6: Packaging charge (takeaway/delivery only)
  const finalPackagingCharge = (orderType !== 'dine_in' && settings.enablePackagingCharge)
    ? round2(packagingCharge || settings.defaultPackagingCharge || 0)
    : 0;

  // Step 7: Taxable value (service charge + packaging INCLUDED per Section 15)
  const taxableAmount = round2(afterAllDiscounts + serviceChargeAmount + finalPackagingCharge);

  // Step 8: GST calculation
  let cgstRate = 0, cgstAmount = 0, sgstRate = 0, sgstAmount = 0, totalTax = 0;

  if (settings.gstScheme === 'regular' || !settings.gstScheme) {
    const gstRate = settings.gstRate || 5; // default 5%
    const halfRate = gstRate / 2;
    cgstRate = halfRate;
    sgstRate = halfRate;
    cgstAmount = round2(taxableAmount * (halfRate / 100));
    sgstAmount = round2(taxableAmount * (halfRate / 100));
    totalTax = round2(cgstAmount + sgstAmount);
  }
  // Composition scheme: totalTax stays 0

  // Step 9 & 10: Rounding
  const rawTotal = round2(taxableAmount + totalTax);
  let roundOff = 0;
  if (settings.enableRoundOff !== false) {
    roundOff = round2(Math.round(rawTotal) - rawTotal);
  }

  // Step 11: Grand Total
  const grandTotal = round2(rawTotal + roundOff);

  return {
    billItems: processedItems,
    subtotal,
    totalItemDiscount,
    afterItemDiscount,
    billDiscountType: billDiscountAmount > 0 ? billDiscountType : null,
    billDiscountValue: billDiscountAmount > 0 ? billDiscountValue : 0,
    billDiscountAmount,
    afterAllDiscounts,
    serviceChargeRate,
    serviceChargeAmount,
    packagingCharge: finalPackagingCharge,
    taxableAmount,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    totalTax,
    roundOff,
    grandTotal,
  };
}

/**
 * Build bill items from orders and apply item discounts.
 * Consolidates items from multiple orders into a single bill item list.
 *
 * @param {Array} orders - Orders from DB with items JSON
 * @param {Array} [itemDiscounts] - [{menuItemId, discountType, discountValue, reason}]
 * @returns {Array} Bill items ready for calculateBill()
 */
export function buildBillItems(orders, itemDiscounts = []) {
  const discountMap = new Map();
  for (const disc of itemDiscounts) {
    discountMap.set(disc.menuItemId, disc);
  }

  const billItems = [];

  for (const order of orders) {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    for (const item of items) {
      const discount = discountMap.get(item.menuItemId);

      billItems.push({
        orderId: order.id,
        menuItemId: item.menuItemId,
        name: item.name,
        category: item.category || null,
        quantity: item.quantity,
        unitPrice: item.price,
        itemDiscountType: discount?.discountType || null,
        itemDiscountValue: discount?.discountValue || 0,
        reason: discount?.reason || null,
      });
    }
  }

  return billItems;
}

/**
 * Build the discount details JSON for audit trail storage.
 *
 * @param {Array} processedItems - Items after processItemDiscounts()
 * @param {Object} data - Bill creation request data
 * @returns {Object|null} Discount details or null if no discounts
 */
export function buildDiscountDetails(processedItems, data) {
  const itemDiscounts = processedItems
    .filter(i => i.itemDiscountAmount > 0)
    .map(i => ({
      menuItemId: i.menuItemId,
      itemName: i.name,
      originalPrice: i.lineTotal,
      discountType: i.itemDiscountType,
      discountValue: i.itemDiscountValue,
      discountAmount: i.itemDiscountAmount,
      finalPrice: i.taxableValue,
      reason: i.reason || null,
    }));

  const totalItemDiscounts = round2(itemDiscounts.reduce((s, d) => s + d.discountAmount, 0));

  const billDiscount = (data.billDiscountType && data.billDiscountValue > 0)
    ? {
        type: data.billDiscountType,
        value: data.billDiscountValue,
        amount: data._calculatedBillDiscountAmount || 0,
        presetId: data.discountPresetId || null,
        presetName: data._presetName || null,
        reason: data.discountReason || null,
      }
    : null;

  const totalBillDiscount = billDiscount?.amount || 0;
  const totalDiscountAmount = round2(totalItemDiscounts + totalBillDiscount);

  if (totalDiscountAmount === 0) return null;

  return {
    itemDiscounts,
    billDiscount,
    totalItemDiscounts,
    totalBillDiscount,
    totalDiscountAmount,
  };
}
