import { asyncHandler } from '../utils/asyncHandler.js';
import * as billsService from '../services/bills.service.js';
import { generateBillPdf } from '../services/pdfGenerator.js';
import { emitBillCreated, emitBillUpdated } from '../utils/socketEmitter.js';

export const getAll = asyncHandler(async (req, res) => {
  const result = await billsService.getAll(req.params.restaurantId, req.query);
  res.json({ success: true, data: result });
});

export const getById = asyncHandler(async (req, res) => {
  const bill = await billsService.getById(req.params.restaurantId, req.params.id);
  res.json({ success: true, data: bill });
});

export const getUnbilledOrders = asyncHandler(async (req, res) => {
  const orders = await billsService.getUnbilledOrders(req.params.restaurantId, req.query);
  res.json({ success: true, data: orders });
});

export const getNextNumber = asyncHandler(async (req, res) => {
  const result = await billsService.getNextNumber(req.params.restaurantId);
  res.json({ success: true, data: result });
});

export const previewCalculation = asyncHandler(async (req, res) => {
  const calculation = await billsService.previewCalculation(req.params.restaurantId, req.body);
  res.json({ success: true, data: calculation });
});

export const create = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const bill = await billsService.create(req.params.restaurantId, req.body, userId);
  emitBillCreated(req.params.restaurantId, bill);
  res.status(201).json({ success: true, data: bill });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const bill = await billsService.updatePayment(req.params.restaurantId, req.params.id, req.body);
  emitBillUpdated(req.params.restaurantId, bill);
  res.json({ success: true, data: bill });
});

export const cancel = asyncHandler(async (req, res) => {
  const bill = await billsService.cancel(req.params.restaurantId, req.params.id, req.body);
  emitBillUpdated(req.params.restaurantId, bill);
  res.json({ success: true, data: bill });
});

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await billsService.getSummary(req.params.restaurantId, req.query);
  res.json({ success: true, data: summary });
});

export const downloadPdf = asyncHandler(async (req, res) => {
  const bill = await billsService.getById(req.params.restaurantId, req.params.id);
  const pdfDoc = generateBillPdf(bill);

  // Sanitize bill number for filename: INV/2526/0001 → INV_2526_0001
  const safeFilename = (bill.billNumber || 'invoice').replace(/\//g, '_');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);

  pdfDoc.pipe(res);
});
