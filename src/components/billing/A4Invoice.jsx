const ORDER_TYPE_LABELS = { dine_in: 'Dine-In', takeaway: 'Takeaway', delivery: 'Delivery' };

const formatCurrency = (n) => {
  const val = Number(n) || 0;
  return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Amount in words — Indian numbering system
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numberToWords(num) {
  if (num === 0) return 'Zero';
  const n = Math.abs(Math.round(num));
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numberToWords(n % 100) : '');
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '');
  if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '');
  return numberToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numberToWords(n % 10000000) : '');
}

function amountInWords(amount) {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  let words = 'Rupees ' + numberToWords(rupees);
  if (paise > 0) words += ' and ' + numberToWords(paise) + ' Paise';
  return words + ' Only';
}

export const A4Invoice = ({ bill, restaurant, settings }) => {
  if (!bill) return null;

  const isComposition = settings?.gstScheme === 'composition';
  const billTitle = isComposition ? 'Bill of Supply' : 'Tax Invoice';
  const items = bill.billItems || [];
  const hasItemDiscounts = items.some(it => it.discountAmount > 0);
  const hasBillDiscount = bill.billDiscountAmount > 0;
  const hasServiceCharge = bill.serviceChargeAmount > 0;
  const hasPackaging = bill.packagingCharge > 0;
  const isSplit = bill.paymentMode === 'split';
  const splits = bill.splitPayments || [];

  return (
    <div className="a4-invoice">
      {/* Header */}
      <div className="a4-header">
        {restaurant?.logo && (
          <img src={restaurant.logo} alt="" className="a4-logo" />
        )}
        <div className="a4-header-info">
          <h1 className="a4-restaurant-name">{restaurant?.name || settings?.restaurantName || 'Restaurant'}</h1>
          {(restaurant?.address || settings?.address) && (
            <div className="a4-address">{settings?.address || restaurant?.address}</div>
          )}
          <div className="a4-contact">
            {(restaurant?.phone || settings?.phone) && <span>Ph: {settings?.phone || restaurant?.phone}</span>}
            {(restaurant?.email || settings?.email) && <span>{settings?.email || restaurant?.email}</span>}
          </div>
        </div>
      </div>

      {/* Registration */}
      {(settings?.gstin || settings?.fssaiNumber) && (
        <div className="a4-registration">
          {settings?.gstin && <span>GSTIN: {settings.gstin}</span>}
          {settings?.fssaiNumber && <span>FSSAI: {settings.fssaiNumber}</span>}
        </div>
      )}

      {/* Invoice Title + Meta */}
      <div className="a4-title-bar">
        <h2 className="a4-title">{billTitle}</h2>
      </div>

      <div className="a4-meta-grid">
        <div className="a4-meta-left">
          <div><strong>Bill No:</strong> {bill.billNumber}</div>
          <div><strong>Date:</strong> {formatDate(bill.createdAt)} {formatTime(bill.createdAt)}</div>
          <div><strong>Table:</strong> {bill.tableNumber}</div>
          <div><strong>Type:</strong> {ORDER_TYPE_LABELS[bill.orderType] || bill.orderType}</div>
        </div>
        <div className="a4-meta-right">
          {bill.customerName && <div><strong>Customer:</strong> {bill.customerName}</div>}
          {bill.customerMobile && <div><strong>Mobile:</strong> {bill.customerMobile}</div>}
          {bill.customerGstin && <div><strong>Customer GSTIN:</strong> {bill.customerGstin}</div>}
          {settings?.placeOfSupply && (
            <div><strong>Place of Supply:</strong> {settings.placeOfSupply} ({settings.placeOfSupplyCode})</div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="a4-items-table">
        <thead>
          <tr>
            <th className="a4-col-sn">#</th>
            <th className="a4-col-name">Item</th>
            <th className="a4-col-qty">Qty</th>
            <th className="a4-col-rate">Rate</th>
            {hasItemDiscounts && <th className="a4-col-disc">Discount</th>}
            <th className="a4-col-amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const lineTotal = item.price * item.quantity;
            const afterDisc = lineTotal - (item.discountAmount || 0);
            return (
              <tr key={i}>
                <td className="a4-col-sn">{i + 1}</td>
                <td className="a4-col-name">{item.name}</td>
                <td className="a4-col-qty">{item.quantity}</td>
                <td className="a4-col-rate">{formatCurrency(item.price)}</td>
                {hasItemDiscounts && (
                  <td className="a4-col-disc">
                    {item.discountAmount > 0 ? (
                      <span className="a4-disc-value">
                        -{formatCurrency(item.discountAmount)}
                        <small>
                          {item.discountType === 'comp' ? ' (Comp)' : ` (${item.discountValue}%)`}
                        </small>
                      </span>
                    ) : '—'}
                  </td>
                )}
                <td className="a4-col-amount">{formatCurrency(hasItemDiscounts ? afterDisc : lineTotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="a4-summary">
        <div className="a4-summary-row">
          <span>Subtotal</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>

        {bill.totalItemDiscount > 0 && (
          <div className="a4-summary-row a4-discount-row">
            <span>Item Discounts</span>
            <span>-{formatCurrency(bill.totalItemDiscount)}</span>
          </div>
        )}

        {hasBillDiscount && (
          <div className="a4-summary-row a4-discount-row">
            <span>
              Bill Discount
              {bill.billDiscountType === 'percentage' ? ` (${bill.billDiscountValue}%)` : ''}
              {bill.discountReason ? ` — ${bill.discountReason}` : ''}
            </span>
            <span>-{formatCurrency(bill.billDiscountAmount)}</span>
          </div>
        )}

        {(bill.totalItemDiscount > 0 || hasBillDiscount) && (
          <div className="a4-summary-row a4-after-disc">
            <span>After Discounts</span>
            <span>{formatCurrency(bill.afterAllDiscounts)}</span>
          </div>
        )}

        {hasServiceCharge && (
          <div className="a4-summary-row">
            <span>{settings?.serviceChargeLabel || 'Service Charge'}*</span>
            <span>{formatCurrency(bill.serviceChargeAmount)}</span>
          </div>
        )}

        {hasPackaging && (
          <div className="a4-summary-row">
            <span>Packaging Charge</span>
            <span>{formatCurrency(bill.packagingCharge)}</span>
          </div>
        )}

        {!isComposition && (
          <>
            <div className="a4-summary-row">
              <span>Taxable Value</span>
              <span>{formatCurrency(bill.taxableAmount)}</span>
            </div>
            {bill.cgstAmount > 0 && (
              <div className="a4-summary-row">
                <span>CGST @ {bill.cgstRate}%</span>
                <span>{formatCurrency(bill.cgstAmount)}</span>
              </div>
            )}
            {bill.sgstAmount > 0 && (
              <div className="a4-summary-row">
                <span>SGST @ {bill.sgstRate}%</span>
                <span>{formatCurrency(bill.sgstAmount)}</span>
              </div>
            )}
          </>
        )}

        {bill.roundOff !== 0 && (
          <div className="a4-summary-row">
            <span>Round Off</span>
            <span>{bill.roundOff > 0 ? '+' : ''}{formatCurrency(bill.roundOff)}</span>
          </div>
        )}

        <div className="a4-grand-total-row">
          <span>Grand Total</span>
          <span>₹ {formatCurrency(bill.grandTotal)}</span>
        </div>

        <div className="a4-amount-words">
          {amountInWords(bill.grandTotal)}
        </div>
      </div>

      {/* Payment Info */}
      <div className="a4-payment-info">
        <strong>Payment:</strong>{' '}
        {isSplit ? (
          <span>
            Split —{' '}
            {splits.map((s, i) => (
              <span key={i}>{s.mode?.toUpperCase()}: ₹{formatCurrency(s.amount)}{i < splits.length - 1 ? ', ' : ''}</span>
            ))}
          </span>
        ) : (
          <span>{bill.paymentMode?.toUpperCase()}</span>
        )}
        {!isComposition && <span className="a4-sac"> | SAC: 996331</span>}
      </div>

      {/* Disclaimers */}
      <div className="a4-disclaimers">
        {isComposition && (
          <div className="a4-comp-disclaimer">
            Composition taxable person, not eligible to collect tax on supplies.
          </div>
        )}
        {hasServiceCharge && (
          <div className="a4-sc-disclaimer">
            *Service charge is voluntary and can be removed on request.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="a4-footer">
        <div className="a4-footer-text">{settings?.billFooterText || 'Thank you for dining with us!'}</div>
        {settings?.fssaiNumber && (
          <div className="a4-footer-fssai">FSSAI Lic. No: {settings.fssaiNumber}</div>
        )}
      </div>

      {bill.cancelledAt && (
        <div className="a4-cancelled-stamp">
          <div className="a4-cancelled-text">CANCELLED</div>
          {bill.cancelReason && <div className="a4-cancelled-reason">Reason: {bill.cancelReason}</div>}
        </div>
      )}
    </div>
  );
};
