const ORDER_TYPE_LABELS = { dine_in: 'Dine-In', takeaway: 'Takeaway', delivery: 'Delivery' };

const formatCurrency = (n) => {
  const val = Number(n) || 0;
  return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (iso) => {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getMonth()];
  const year = d.getFullYear();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${day}-${mon}-${year}  ${h12}:${m} ${ampm}`;
};

export const ThermalBill = ({ bill, restaurant, settings }) => {
  if (!bill) return null;

  const isComposition = settings?.gstScheme === 'composition';
  const billTitle = isComposition ? 'BILL OF SUPPLY' : 'TAX INVOICE';
  const items = bill.billItems || [];
  const hasItemDiscounts = bill.totalItemDiscount > 0;
  const hasBillDiscount = bill.billDiscountAmount > 0;
  const hasServiceCharge = bill.serviceChargeAmount > 0;
  const hasPackaging = bill.packagingCharge > 0;
  const isSplit = bill.paymentMode === 'split';
  const splits = bill.splitPayments || [];

  return (
    <div className="thermal-bill">
      {/* Header */}
      <div className="thermal-header">
        <div className="thermal-restaurant-name">{restaurant?.name || settings?.restaurantName || 'Restaurant'}</div>
        {(restaurant?.address || settings?.address) && (
          <div className="thermal-address">{settings?.address || restaurant?.address}</div>
        )}
        {(restaurant?.phone || settings?.phone) && (
          <div className="thermal-phone">Ph: {settings?.phone || restaurant?.phone}</div>
        )}
      </div>

      <div className="thermal-divider" />

      {/* GSTIN / FSSAI */}
      {(settings?.gstin || settings?.fssaiNumber) && (
        <>
          {settings?.gstin && <div className="thermal-reg-line">GSTIN: {settings.gstin}</div>}
          {settings?.fssaiNumber && <div className="thermal-reg-line">FSSAI: {settings.fssaiNumber}</div>}
          <div className="thermal-divider" />
        </>
      )}

      {/* Bill Info */}
      <div className="thermal-bill-info">
        <div className="thermal-bill-title">{billTitle}</div>
        <div>Bill No: {bill.billNumber}</div>
        <div>Date: {formatDate(bill.createdAt)}</div>
        <div>Table: {bill.tableNumber} | Type: {ORDER_TYPE_LABELS[bill.orderType] || bill.orderType}</div>
      </div>

      <div className="thermal-divider" />

      {/* Items Header */}
      <div className="thermal-items-header">
        <span className="thermal-item-name-col">Item</span>
        <span className="thermal-item-qty-col">Qty</span>
        <span className="thermal-item-amt-col">Amount</span>
      </div>
      <div className="thermal-divider" />

      {/* Items */}
      <div className="thermal-items">
        {items.map((item, i) => (
          <div key={i}>
            <div className="thermal-item-row">
              <span className="thermal-item-name-col">{item.name}</span>
              <span className="thermal-item-qty-col">{item.quantity}</span>
              <span className="thermal-item-amt-col">{formatCurrency(item.price * item.quantity)}</span>
            </div>
            {item.discountAmount > 0 && (
              <div className="thermal-item-discount">
                {item.discountType === 'comp' ? '  Comp' : `  Disc (${item.discountValue}%)`}
                <span>-{formatCurrency(item.discountAmount)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="thermal-divider" />

      {/* Totals */}
      <div className="thermal-totals">
        <div className="thermal-total-row">
          <span>Subtotal</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>

        {hasItemDiscounts && (
          <div className="thermal-total-row thermal-discount">
            <span>Item Discounts</span>
            <span>-{formatCurrency(bill.totalItemDiscount)}</span>
          </div>
        )}

        {hasBillDiscount && (
          <div className="thermal-total-row thermal-discount">
            <span>
              Bill Disc
              {bill.billDiscountType === 'percentage' ? ` (${bill.billDiscountValue}%)` : ''}
              {bill.discountReason ? ` — ${bill.discountReason}` : ''}
            </span>
            <span>-{formatCurrency(bill.billDiscountAmount)}</span>
          </div>
        )}

        {(hasItemDiscounts || hasBillDiscount) && (
          <>
            <div className="thermal-total-row thermal-subtotal-line">
              <span>After Discounts</span>
              <span>{formatCurrency(bill.afterAllDiscounts)}</span>
            </div>
          </>
        )}

        {hasServiceCharge && (
          <div className="thermal-total-row">
            <span>{settings?.serviceChargeLabel || 'Service Charge'}*</span>
            <span>{formatCurrency(bill.serviceChargeAmount)}</span>
          </div>
        )}

        {hasPackaging && (
          <div className="thermal-total-row">
            <span>Packaging Charge</span>
            <span>{formatCurrency(bill.packagingCharge)}</span>
          </div>
        )}

        {!isComposition && (
          <>
            <div className="thermal-total-row">
              <span>Taxable Value</span>
              <span>{formatCurrency(bill.taxableAmount)}</span>
            </div>
            {bill.cgstAmount > 0 && (
              <div className="thermal-total-row">
                <span>CGST ({bill.cgstRate}%)</span>
                <span>{formatCurrency(bill.cgstAmount)}</span>
              </div>
            )}
            {bill.sgstAmount > 0 && (
              <div className="thermal-total-row">
                <span>SGST ({bill.sgstRate}%)</span>
                <span>{formatCurrency(bill.sgstAmount)}</span>
              </div>
            )}
          </>
        )}

        {bill.roundOff !== 0 && (
          <div className="thermal-total-row">
            <span>Round Off</span>
            <span>{bill.roundOff > 0 ? '+' : ''}{formatCurrency(bill.roundOff)}</span>
          </div>
        )}

        <div className="thermal-divider" />

        <div className="thermal-grand-total">
          <span>GRAND TOTAL</span>
          <span>₹ {formatCurrency(bill.grandTotal)}</span>
        </div>
      </div>

      <div className="thermal-divider" />

      {/* Payment */}
      <div className="thermal-payment">
        {isSplit ? (
          <>
            <div>Payment: Split</div>
            <div className="thermal-split-detail">
              {splits.map((s, i) => (
                <span key={i}>{s.mode?.toUpperCase()}: ₹{formatCurrency(s.amount)}{i < splits.length - 1 ? ' | ' : ''}</span>
              ))}
            </div>
          </>
        ) : (
          <div>Payment: {bill.paymentMode?.toUpperCase()}</div>
        )}
        {!isComposition && <div>SAC Code: 996331</div>}
      </div>

      <div className="thermal-divider" />

      {/* Customer */}
      {(bill.customerName || bill.customerMobile) && (
        <>
          <div className="thermal-customer">
            Customer: {bill.customerName || 'Walk-in'}
            {bill.customerMobile && ` (${bill.customerMobile})`}
          </div>
          {bill.customerGstin && <div className="thermal-customer">GSTIN: {bill.customerGstin}</div>}
          <div className="thermal-divider" />
        </>
      )}

      {/* Composition disclaimer */}
      {isComposition && (
        <div className="thermal-disclaimer">
          Composition taxable person, not eligible to collect tax on supplies.
        </div>
      )}

      {/* Service charge disclaimer */}
      {hasServiceCharge && (
        <div className="thermal-disclaimer">
          *Service charge is voluntary and can be removed on request.
        </div>
      )}

      {/* Footer */}
      <div className="thermal-footer">
        {settings?.billFooterText || 'Thank you for dining with us!'}
      </div>

      {bill.cancelledAt && (
        <div className="thermal-cancelled">
          CANCELLED
          {bill.cancelReason && <div className="thermal-cancel-reason">Reason: {bill.cancelReason}</div>}
        </div>
      )}
    </div>
  );
};
