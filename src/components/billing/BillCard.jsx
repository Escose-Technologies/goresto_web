const PAYMENT_MODE_LABELS = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  split: 'Split',
};

const PAYMENT_STATUS_CONFIG = {
  paid: { label: 'Paid', className: 'bill-status-paid' },
  partially_paid: { label: 'Partial', className: 'bill-status-partial' },
  unpaid: { label: 'Due', className: 'bill-status-unpaid' },
  cancelled: { label: 'Cancelled', className: 'bill-status-cancelled' },
};

export const BillCard = ({ bill, onView, onPay, onCancel }) => {
  const status = PAYMENT_STATUS_CONFIG[bill.paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;
  const orderCount = bill.orders?.length || 0;
  const createdAt = new Date(bill.createdAt);

  return (
    <div className="bill-card" onClick={() => onView?.(bill)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onView?.(bill)}>
      <div className="bill-card-top">
        <div className="bill-card-number">{bill.billNumber}</div>
        <span className={`bill-card-status ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="bill-card-meta">
        <span>Table {bill.tableNumber}</span>
        <span>{PAYMENT_MODE_LABELS[bill.paymentMode] || bill.paymentMode}</span>
        <span>{orderCount} order{orderCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="bill-card-details">
        <div className="bill-card-customer">
          {bill.customerName || 'Walk-in'}
          {bill.customerMobile && <span> ({bill.customerMobile})</span>}
        </div>
        <div className="bill-card-date">
          {createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })},{' '}
          {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {bill.discountReason && (
        <div className="bill-card-discount">
          {bill.discountReason}
          {bill.billDiscountType === 'percentage' && ` (${bill.billDiscountValue}%)`}
        </div>
      )}

      <div className="bill-card-bottom">
        <div className="bill-card-total">₹{(bill.grandTotal || 0).toFixed(2)}</div>
        <div className="bill-card-actions" onClick={(e) => e.stopPropagation()}>
          {bill.paymentStatus === 'unpaid' && onPay && (
            <button className="bill-action-btn bill-action-pay" onClick={() => onPay(bill)}>
              Pay
            </button>
          )}
          {bill.paymentStatus !== 'cancelled' && onCancel && (
            <button className="bill-action-btn bill-action-cancel" onClick={() => onCancel(bill)}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
