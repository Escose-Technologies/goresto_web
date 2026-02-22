import { useState, useEffect, useCallback, useMemo } from 'react';
import { billService, discountPresetService } from '../../services/apiService';
import { OrderSelector } from './OrderSelector';
import { BillItemsEditor } from './BillItemsEditor';
import { BillDiscountSection } from './BillDiscountSection';
import { PaymentModeSelector } from './PaymentModeSelector';
import { SplitPaymentEditor } from './SplitPaymentEditor';
import { BillSummaryLive } from './BillSummaryLive';
import { TouchButton } from '../ui/TouchButton';
import './GenerateBillModal.css';

export const GenerateBillModal = ({
  restaurantId,
  triggerOrder,
  onClose,
  onBillCreated,
  toast,
  settings: settingsProp,
}) => {
  // The table number comes from the order that triggered the modal
  const tableNumber = triggerOrder?.tableNumber;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [tableOrders, setTableOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activePresets, setActivePresets] = useState([]);

  // Step 1: order selection (trigger order is pre-checked)
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Step 2 state
  const [itemDiscounts, setItemDiscounts] = useState([]);
  const [billDiscountType, setBillDiscountType] = useState(null);
  const [billDiscountValue, setBillDiscountValue] = useState(0);
  const [discountPresetId, setDiscountPresetId] = useState(null);
  const [discountReason, setDiscountReason] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [splitPayments, setSplitPayments] = useState([
    { mode: 'cash', amount: 0 },
    { mode: 'upi', amount: 0 },
  ]);
  const [orderType, setOrderType] = useState('dine_in');
  const [showCustomerGstin, setShowCustomerGstin] = useState(false);
  const [customerGstin, setCustomerGstin] = useState('');
  const [packagingCharge, setPackagingCharge] = useState(0);
  const [notes, setNotes] = useState('');

  // Preview calculation
  const [calculation, setCalculation] = useState(null);

  // Load unbilled orders for THIS table + settings + presets
  useEffect(() => {
    if (!tableNumber) return;
    loadData();
  }, [restaurantId, tableNumber]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, presetsData] = await Promise.all([
        billService.getUnbilledOrders(restaurantId, tableNumber),
        discountPresetService.getActive(restaurantId).catch(() => []),
      ]);
      setTableOrders(ordersData || []);
      setSettings(settingsProp);
      setActivePresets(presetsData || []);

      // Pre-select the trigger order
      if (triggerOrder) {
        setSelectedOrderIds([triggerOrder.id]);
      }

      // Set packaging charge default from settings
      if (settingsData?.enablePackagingCharge && settingsData?.defaultPackagingCharge) {
        setPackagingCharge(settingsData.defaultPackagingCharge);
      }
    } catch (err) {
      toast?.error('Failed to load billing data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrders = useMemo(() => {
    return tableOrders.filter(o => selectedOrderIds.includes(o.id));
  }, [tableOrders, selectedOrderIds]);

  // Fetch preview calculation when step 2 inputs change
  useEffect(() => {
    if (step !== 2 || selectedOrderIds.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const preview = await billService.previewCalculation(restaurantId, {
          orderIds: selectedOrderIds,
          orderType,
          itemDiscounts: itemDiscounts.filter(d => d.discountValue > 0),
          billDiscountType: billDiscountType || undefined,
          billDiscountValue: billDiscountValue || undefined,
          packagingCharge: orderType !== 'dine_in' ? packagingCharge : 0,
        });
        setCalculation(preview);
      } catch (err) {
        console.error('Preview calculation failed:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [step, selectedOrderIds, orderType, itemDiscounts, billDiscountType, billDiscountValue, packagingCharge, restaurantId]);

  const handleBillDiscountChange = useCallback(({ billDiscountType: type, billDiscountValue: value, discountPresetId: presetId, discountReason: reason }) => {
    setBillDiscountType(type);
    setBillDiscountValue(value);
    setDiscountPresetId(presetId);
    setDiscountReason(reason);
  }, []);

  const handleNext = () => {
    if (selectedOrderIds.length === 0) {
      toast?.error('Please select at least one order');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (paymentMode === 'split') {
      const splitTotal = splitPayments.reduce((s, p) => s + (p.amount || 0), 0);
      const gt = calculation?.grandTotal || 0;
      if (Math.abs(splitTotal - gt) > 0.01) {
        toast?.error(`Split total (₹${splitTotal.toFixed(2)}) doesn't match grand total (₹${gt.toFixed(2)})`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const data = {
        orderIds: selectedOrderIds,
        tableNumber: String(tableNumber),
        orderType,
        itemDiscounts: itemDiscounts.filter(d => d.discountValue > 0).map(d => ({
          menuItemId: d.menuItemId,
          discountType: d.discountType,
          discountValue: d.discountValue,
          reason: d.reason || '',
        })),
        paymentMode,
        markAsPaid: true,
        notes: notes || undefined,
      };

      if (billDiscountType && billDiscountValue > 0) {
        data.billDiscountType = billDiscountType;
        data.billDiscountValue = billDiscountValue;
        if (discountPresetId) data.discountPresetId = discountPresetId;
        if (discountReason) data.discountReason = discountReason;
      }

      if (paymentMode === 'split') {
        data.splitPayments = splitPayments.filter(p => p.amount > 0);
      }

      if (showCustomerGstin && customerGstin) {
        data.customerGstin = customerGstin;
      }

      if (orderType !== 'dine_in' && packagingCharge > 0) {
        data.packagingCharge = packagingCharge;
      }

      const bill = await billService.createBill(restaurantId, data);
      toast?.success(`Bill ${bill.billNumber} generated!`);
      onBillCreated?.(bill);
      onClose();
    } catch (err) {
      toast?.error('Failed to generate bill: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (loading) {
    return (
      <div className="bill-modal-overlay" onClick={onClose}>
        <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
          <div className="bill-modal-loading">Loading billing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bill-modal-header">
          <div className="bill-modal-header-left">
            {step === 2 && (
              <button className="bill-modal-back" onClick={handleBack} title="Back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2>Generate Bill &mdash; Table {tableNumber}</h2>
              {step === 2 && (
                <div className="bill-modal-header-sub">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <button className="bill-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="bill-modal-body">
          {step === 1 && (
            <OrderSelector
              orders={tableOrders}
              selectedOrderIds={selectedOrderIds}
              onSelectionChange={setSelectedOrderIds}
              tableNumber={tableNumber}
            />
          )}

          {step === 2 && (
            <>
              <BillItemsEditor
                orders={selectedOrders}
                itemDiscounts={itemDiscounts}
                onItemDiscountsChange={setItemDiscounts}
              />

              <hr className="bill-section-divider" />

              <BillDiscountSection
                activePresets={activePresets}
                billDiscountType={billDiscountType}
                billDiscountValue={billDiscountValue}
                billDiscountAmount={calculation?.billDiscountAmount || 0}
                discountPresetId={discountPresetId}
                discountReason={discountReason}
                afterItemDiscount={calculation?.afterItemDiscount || 0}
                onBillDiscountChange={handleBillDiscountChange}
              />

              <hr className="bill-section-divider" />

              <PaymentModeSelector
                paymentMode={paymentMode}
                onPaymentModeChange={setPaymentMode}
              />

              {paymentMode === 'split' && (
                <SplitPaymentEditor
                  splitPayments={splitPayments}
                  onSplitPaymentsChange={setSplitPayments}
                  grandTotal={calculation?.grandTotal || 0}
                />
              )}

              {/* Order type + packaging (collapsed, only if needed) */}
              <div className="bill-extras">
                <div className="bill-extras-row">
                  <label className="bill-extras-label">
                    Order Type:
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="bill-extras-select"
                    >
                      <option value="dine_in">Dine-in</option>
                      <option value="takeaway">Takeaway</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </label>
                </div>

                {orderType !== 'dine_in' && settings?.enablePackagingCharge && (
                  <div className="bill-extras-row">
                    <label className="bill-extras-label">
                      Packaging:
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={packagingCharge || ''}
                        onChange={(e) => setPackagingCharge(parseFloat(e.target.value) || 0)}
                        className="bill-extras-input"
                      />
                      <span className="bill-extras-unit">₹</span>
                    </label>
                  </div>
                )}

                <div className="bill-extras-row">
                  <label className="bill-extras-label">
                    <input
                      type="checkbox"
                      checked={showCustomerGstin}
                      onChange={(e) => setShowCustomerGstin(e.target.checked)}
                    />
                    B2B Invoice
                  </label>
                  {showCustomerGstin && (
                    <input
                      type="text"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                      placeholder="Customer GSTIN"
                      maxLength={15}
                      className="bill-extras-gstin"
                    />
                  )}
                </div>
              </div>

              <div className="bill-notes">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes (optional)"
                  maxLength={500}
                />
              </div>

              <BillSummaryLive
                calculation={calculation}
                settings={settings}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bill-modal-footer">
          <TouchButton variant="secondary" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </TouchButton>
          {step === 1 ? (
            <TouchButton
              variant="primary"
              onClick={handleNext}
              disabled={selectedOrderIds.length === 0}
            >
              Next
            </TouchButton>
          ) : (
            <TouchButton
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting || !calculation}
            >
              Generate Bill
            </TouchButton>
          )}
        </div>
      </div>
    </div>
  );
};
