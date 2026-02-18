import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../errors/index.js';
import { formatBill, formatOrder } from '../utils/formatters.js';
import { calculateBill, buildBillItems, buildDiscountDetails } from '../utils/taxCalculator.js';
import { getNextBillNumber } from '../utils/billNumberGenerator.js';

// ─── List Bills ──────────────────────────────────────────

export const getAll = async (restaurantId, query = {}) => {
  const where = { restaurantId };

  if (query.status) where.paymentStatus = query.status;
  if (query.paymentMode) where.paymentMode = query.paymentMode;
  if (query.tableNumber) where.tableNumber = query.tableNumber;

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) {
      const fromDate = new Date(query.from);
      where.createdAt.gte = isNaN(fromDate) ? new Date(query.from + 'T00:00:00.000Z') : fromDate;
    }
    if (query.to) {
      const toDate = new Date(query.to);
      where.createdAt.lte = isNaN(toDate) ? new Date(query.to + 'T23:59:59.999Z') : toDate;
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;

  const [bills, total] = await Promise.all([
    prisma.bill.findMany({
      where,
      include: { orders: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bill.count({ where }),
  ]);

  return {
    bills: bills.map(formatBill),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Get Single Bill ─────────────────────────────────────

export const getById = async (restaurantId, id) => {
  const bill = await prisma.bill.findFirst({
    where: { id, restaurantId },
    include: {
      orders: true,
      restaurant: {
        select: {
          name: true,
          address: true,
          phone: true,
          email: true,
          logo: true,
        },
      },
    },
  });
  if (!bill) throw new NotFoundError('Bill');

  // Attach settings for display
  const settings = await prisma.settings.findUnique({
    where: { restaurantId },
    select: {
      gstin: true,
      fssaiNumber: true,
      placeOfSupply: true,
      placeOfSupplyCode: true,
      gstScheme: true,
      serviceChargeLabel: true,
      billFooterText: true,
      showFeedbackQR: true,
    },
  });

  const formatted = formatBill(bill);
  formatted.restaurantSettings = settings;
  return formatted;
};

// ─── Get Unbilled Orders ─────────────────────────────────

export const getUnbilledOrders = async (restaurantId, query = {}) => {
  const where = {
    restaurantId,
    billId: null,
    status: { in: ['served', 'completed'] },
  };

  if (query.tableNumber) where.tableNumber = query.tableNumber;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  return orders.map(formatOrder);
};

// ─── Preview Calculation (No DB Write) ───────────────────

export const previewCalculation = async (restaurantId, data) => {
  // Fetch orders
  const orders = await prisma.order.findMany({
    where: {
      id: { in: data.orderIds },
      restaurantId,
      billId: null,
      status: { in: ['served', 'completed'] },
    },
  });

  if (orders.length !== data.orderIds.length) {
    throw new ValidationError('Some orders are invalid, already billed, or not yet served');
  }

  // Fetch settings
  const settings = await prisma.settings.findUnique({ where: { restaurantId } });

  // Build items and calculate
  const billItems = buildBillItems(orders, data.itemDiscounts);
  const calculation = calculateBill({
    billItems,
    settings: settings || { gstRate: 5, gstScheme: 'regular', enableRoundOff: true },
    billDiscountType: data.billDiscountType,
    billDiscountValue: data.billDiscountValue,
    orderType: data.orderType,
    packagingCharge: data.packagingCharge,
  });

  return calculation;
};

// ─── Get Next Bill Number Preview ────────────────────────

export const getNextNumber = async (restaurantId) => {
  // Use a read-only transaction to preview the next number without incrementing
  const settings = await prisma.settings.findUnique({
    where: { restaurantId },
    select: { billPrefix: true },
  });

  const { getCurrentFinancialYear } = await import('../utils/billNumberGenerator.js');
  const fy = getCurrentFinancialYear();
  const prefix = settings?.billPrefix || 'INV';

  const sequence = await prisma.billSequence.findUnique({
    where: {
      restaurantId_financialYear: { restaurantId, financialYear: fy.label },
    },
  });

  const nextSeq = (sequence?.lastSequence || 0) + 1;
  const paddedSeq = String(nextSeq).padStart(4, '0');
  const billNumber = `${prefix}/${fy.shortCode}/${paddedSeq}`;

  return { billNumber, financialYear: fy.label, sequenceNumber: nextSeq };
};

// ─── Create Bill ─────────────────────────────────────────

export const create = async (restaurantId, data, userId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch and validate orders
    const orders = await tx.order.findMany({
      where: {
        id: { in: data.orderIds },
        restaurantId,
        billId: null,
        status: { in: ['served', 'completed'] },
      },
    });

    if (orders.length !== data.orderIds.length) {
      throw new ValidationError('Some orders are invalid, already billed, or not yet served');
    }

    // Validate all orders are from the same table
    const tables = new Set(orders.map(o => o.tableNumber));
    if (tables.size > 1) {
      throw new ValidationError('All orders must be from the same table');
    }

    // 2. Fetch restaurant settings
    const settings = await tx.settings.findUnique({ where: { restaurantId } });

    // 3. Consolidate items from all orders + apply item discounts
    const billItems = buildBillItems(orders, data.itemDiscounts);

    // 4. Run tax calculation engine
    const calculation = calculateBill({
      billItems,
      settings: settings || { gstRate: 5, gstScheme: 'regular', enableRoundOff: true },
      billDiscountType: data.billDiscountType,
      billDiscountValue: data.billDiscountValue,
      orderType: data.orderType,
      packagingCharge: data.packagingCharge,
    });

    // 5. Validate split payment
    if (data.paymentMode === 'split') {
      if (!data.splitPayments || data.splitPayments.length < 2) {
        throw new ValidationError('Split payment requires at least 2 payment entries');
      }
      const splitTotal = data.splitPayments.reduce((s, p) => s + p.amount, 0);
      if (Math.abs(splitTotal - calculation.grandTotal) > 0.01) {
        throw new ValidationError(
          `Split payment total (${splitTotal.toFixed(2)}) does not match grand total (${calculation.grandTotal.toFixed(2)})`
        );
      }
    }

    // 6. Generate bill number (atomic within transaction)
    const { billNumber, financialYear, sequenceNumber } = await getNextBillNumber(restaurantId, tx);

    // 7. Determine bill type
    const gstScheme = settings?.gstScheme || 'regular';
    const billType = gstScheme === 'composition' ? 'bill_of_supply' : 'tax_invoice';

    // 8. Build discount details JSON
    const discountDetails = buildDiscountDetails(
      calculation.billItems,
      { ...data, _calculatedBillDiscountAmount: calculation.billDiscountAmount }
    );

    // 9. Calculate payment amounts
    const paidAmount = data.markAsPaid ? calculation.grandTotal : 0;
    const paymentStatus = data.markAsPaid ? 'paid' : 'unpaid';

    // 10. Create bill record
    const bill = await tx.bill.create({
      data: {
        restaurantId,
        billNumber,
        billType,
        financialYear,
        sequenceNumber,
        billItems: calculation.billItems,
        subtotal: calculation.subtotal,
        totalItemDiscount: calculation.totalItemDiscount,
        afterItemDiscount: calculation.afterItemDiscount,
        billDiscountType: calculation.billDiscountType,
        billDiscountValue: calculation.billDiscountValue,
        billDiscountAmount: calculation.billDiscountAmount,
        afterAllDiscounts: calculation.afterAllDiscounts,
        serviceChargeRate: calculation.serviceChargeRate,
        serviceChargeAmount: calculation.serviceChargeAmount,
        packagingCharge: calculation.packagingCharge,
        taxableAmount: calculation.taxableAmount,
        cgstRate: calculation.cgstRate,
        cgstAmount: calculation.cgstAmount,
        sgstRate: calculation.sgstRate,
        sgstAmount: calculation.sgstAmount,
        totalTax: calculation.totalTax,
        roundOff: calculation.roundOff,
        grandTotal: calculation.grandTotal,
        discountDetails,
        discountPresetId: data.discountPresetId || null,
        discountReason: data.discountReason || null,
        paymentMode: data.paymentMode,
        paymentStatus,
        paidAmount,
        dueAmount: calculation.grandTotal - paidAmount,
        splitPayments: data.paymentMode === 'split' ? data.splitPayments : null,
        customerName: orders[0].customerName || null,
        customerMobile: orders[0].customerMobile || null,
        customerGstin: data.customerGstin || null,
        tableNumber: data.tableNumber,
        orderType: data.orderType,
        notes: data.notes || null,
        createdBy: userId || null,
      },
      include: { orders: true },
    });

    // 11. Link orders to bill
    await tx.order.updateMany({
      where: { id: { in: data.orderIds } },
      data: { billId: bill.id },
    });

    // Re-fetch with orders linked
    const fullBill = await tx.bill.findUnique({
      where: { id: bill.id },
      include: { orders: true },
    });

    return formatBill(fullBill);
  });
};

// ─── Update Payment ──────────────────────────────────────

export const updatePayment = async (restaurantId, id, data) => {
  const existing = await prisma.bill.findFirst({
    where: { id, restaurantId },
  });
  if (!existing) throw new NotFoundError('Bill');

  if (existing.paymentStatus === 'cancelled') {
    throw new ValidationError('Cannot update payment on a cancelled bill');
  }

  const paidAmount = data.paidAmount;
  const dueAmount = Math.max(0, existing.grandTotal - paidAmount);
  let paymentStatus = 'unpaid';
  if (paidAmount >= existing.grandTotal) {
    paymentStatus = 'paid';
  } else if (paidAmount > 0) {
    paymentStatus = 'partially_paid';
  }

  // Validate split payment
  if (data.paymentMode === 'split') {
    if (!data.splitPayments || data.splitPayments.length < 2) {
      throw new ValidationError('Split payment requires at least 2 payment entries');
    }
    const splitTotal = data.splitPayments.reduce((s, p) => s + p.amount, 0);
    if (Math.abs(splitTotal - paidAmount) > 0.01) {
      throw new ValidationError('Split payment total does not match paid amount');
    }
  }

  const bill = await prisma.bill.update({
    where: { id },
    data: {
      paymentMode: data.paymentMode,
      paymentStatus,
      paidAmount,
      dueAmount,
      splitPayments: data.paymentMode === 'split' ? data.splitPayments : null,
    },
    include: { orders: true },
  });

  return formatBill(bill);
};

// ─── Cancel Bill ─────────────────────────────────────────

export const cancel = async (restaurantId, id, data) => {
  const existing = await prisma.bill.findFirst({
    where: { id, restaurantId },
    include: { orders: true },
  });
  if (!existing) throw new NotFoundError('Bill');

  if (existing.paymentStatus === 'cancelled') {
    throw new ValidationError('Bill is already cancelled');
  }

  return prisma.$transaction(async (tx) => {
    // Cancel the bill
    const bill = await tx.bill.update({
      where: { id },
      data: {
        paymentStatus: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: data.cancelReason,
      },
      include: { orders: true },
    });

    // Unlink orders from this bill so they can be re-billed
    await tx.order.updateMany({
      where: { billId: id },
      data: { billId: null },
    });

    return formatBill(bill);
  });
};

// ─── Sales Summary ───────────────────────────────────────

export const getSummary = async (restaurantId, query) => {
  const fromDate = new Date(query.from + 'T00:00:00.000Z');
  const toDate = new Date(query.to + 'T23:59:59.999Z');

  const where = {
    restaurantId,
    createdAt: { gte: fromDate, lte: toDate },
  };

  // Get all bills in the period
  const bills = await prisma.bill.findMany({
    where,
    select: {
      id: true,
      grandTotal: true,
      subtotal: true,
      totalItemDiscount: true,
      billDiscountAmount: true,
      cgstAmount: true,
      sgstAmount: true,
      totalTax: true,
      serviceChargeAmount: true,
      paymentMode: true,
      paymentStatus: true,
      paidAmount: true,
      dueAmount: true,
      discountPresetId: true,
      discountDetails: true,
    },
  });

  const activeBills = bills.filter(b => b.paymentStatus !== 'cancelled');
  const cancelledBills = bills.filter(b => b.paymentStatus === 'cancelled');
  const unpaidBills = bills.filter(b => b.paymentStatus === 'unpaid' || b.paymentStatus === 'partially_paid');

  // Overview
  const totalRevenue = activeBills.reduce((s, b) => s + b.grandTotal, 0);
  const totalItemDiscounts = activeBills.reduce((s, b) => s + b.totalItemDiscount, 0);
  const totalBillDiscounts = activeBills.reduce((s, b) => s + b.billDiscountAmount, 0);
  const totalDiscount = totalItemDiscounts + totalBillDiscounts;
  const totalTaxCollected = activeBills.reduce((s, b) => s + b.totalTax, 0);
  const totalCgst = activeBills.reduce((s, b) => s + b.cgstAmount, 0);
  const totalSgst = activeBills.reduce((s, b) => s + b.sgstAmount, 0);
  const totalServiceCharge = activeBills.reduce((s, b) => s + b.serviceChargeAmount, 0);

  // Payment breakdown
  const paymentBreakdown = {};
  for (const mode of ['cash', 'card', 'upi', 'split']) {
    const modeBills = activeBills.filter(b => b.paymentMode === mode && b.paymentStatus === 'paid');
    paymentBreakdown[mode] = {
      count: modeBills.length,
      amount: modeBills.reduce((s, b) => s + b.grandTotal, 0),
    };
  }

  // Discount breakdown by preset
  const presetMap = new Map();
  let customDiscountCount = 0;
  let customDiscountTotal = 0;

  for (const bill of activeBills) {
    if (!bill.discountDetails) continue;
    const details = typeof bill.discountDetails === 'string'
      ? JSON.parse(bill.discountDetails)
      : bill.discountDetails;

    if (details.billDiscount) {
      if (details.billDiscount.presetId) {
        const key = details.billDiscount.presetId;
        const existing = presetMap.get(key) || { name: details.billDiscount.presetName || 'Unknown', count: 0, totalDiscount: 0 };
        existing.count++;
        existing.totalDiscount += details.billDiscount.amount || 0;
        presetMap.set(key, existing);
      } else {
        customDiscountCount++;
        customDiscountTotal += details.billDiscount.amount || 0;
      }
    }
  }

  return {
    period: { from: query.from, to: query.to },
    overview: {
      totalBills: bills.length,
      cancelledBills: cancelledBills.length,
      activeBills: activeBills.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      totalItemDiscounts: Math.round(totalItemDiscounts * 100) / 100,
      totalBillDiscounts: Math.round(totalBillDiscounts * 100) / 100,
      totalTaxCollected: Math.round(totalTaxCollected * 100) / 100,
      totalCgst: Math.round(totalCgst * 100) / 100,
      totalSgst: Math.round(totalSgst * 100) / 100,
      totalServiceCharge: Math.round(totalServiceCharge * 100) / 100,
      averageBillValue: activeBills.length > 0
        ? Math.round((totalRevenue / activeBills.length) * 100) / 100
        : 0,
    },
    paymentBreakdown,
    discountBreakdown: {
      presets: Array.from(presetMap.entries()).map(([, v]) => ({
        name: v.name,
        count: v.count,
        totalDiscount: Math.round(v.totalDiscount * 100) / 100,
      })),
      customDiscounts: {
        count: customDiscountCount,
        totalDiscount: Math.round(customDiscountTotal * 100) / 100,
      },
    },
    unpaidBills: {
      count: unpaidBills.length,
      totalDue: Math.round(unpaidBills.reduce((s, b) => s + b.dueAmount, 0) * 100) / 100,
    },
  };
};
