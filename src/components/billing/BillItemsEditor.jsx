import { useMemo } from 'react';

const DISCOUNT_OPTIONS = [
  { value: '', label: 'None' },
  { value: '5', label: '5% off' },
  { value: '10', label: '10% off' },
  { value: '15', label: '15% off' },
  { value: '20', label: '20% off' },
  { value: '50', label: '50% off' },
  { value: '100', label: 'Comp (100%)' },
];

export const BillItemsEditor = ({
  orders,
  itemDiscounts,
  onItemDiscountsChange,
}) => {
  // Consolidate items from all selected orders
  const consolidatedItems = useMemo(() => {
    const items = [];
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        items.push({
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price || item.unitPrice,
          orderId: order.id,
          orderShort: order.id.slice(-8),
        });
      });
    });
    return items;
  }, [orders]);

  // Calculate values with discounts
  const processedItems = useMemo(() => {
    return consolidatedItems.map(item => {
      const lineTotal = (item.unitPrice || 0) * (item.quantity || 0);
      const discount = itemDiscounts.find(d => d.menuItemId === item.menuItemId && d.orderId === item.orderId);
      let discountAmount = 0;
      let discountValue = 0;

      if (discount && discount.discountValue > 0) {
        discountValue = discount.discountValue;
        discountAmount = Math.round((lineTotal * discountValue / 100) * 100) / 100;
      }

      return {
        ...item,
        lineTotal,
        discountValue,
        discountAmount,
        taxableValue: Math.round((lineTotal - discountAmount) * 100) / 100,
      };
    });
  }, [consolidatedItems, itemDiscounts]);

  const subtotal = processedItems.reduce((s, i) => s + i.lineTotal, 0);
  const totalItemDiscount = processedItems.reduce((s, i) => s + i.discountAmount, 0);
  const afterItemDiscount = Math.round((subtotal - totalItemDiscount) * 100) / 100;

  const handleDiscountChange = (item, value) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    const existing = itemDiscounts.filter(
      d => !(d.menuItemId === item.menuItemId && d.orderId === item.orderId)
    );

    if (numValue > 0) {
      existing.push({
        menuItemId: item.menuItemId,
        orderId: item.orderId,
        discountType: 'percentage',
        discountValue: numValue,
        reason: numValue === 100 ? 'Complimentary' : '',
      });
    }

    onItemDiscountsChange(existing);
  };

  const getDiscountSelectValue = (item) => {
    const discount = itemDiscounts.find(d => d.menuItemId === item.menuItemId && d.orderId === item.orderId);
    if (!discount || !discount.discountValue) return '';
    return String(discount.discountValue);
  };

  return (
    <div>
      {/* Desktop table */}
      <div className="bill-items-table-wrap">
        <table className="bill-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="item-qty">Qty</th>
              <th className="item-rate">Rate</th>
              <th className="item-discount-cell">Discount</th>
              <th className="item-value">Value</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((item, idx) => (
              <tr key={`${item.orderId}-${item.menuItemId}-${idx}`}>
                <td>
                  <div className="item-name">{item.name}</div>
                  {orders.length > 1 && (
                    <div style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>
                      #{item.orderShort}
                    </div>
                  )}
                </td>
                <td className="item-qty">{item.quantity}</td>
                <td className="item-rate">₹{(item.unitPrice || 0).toFixed(2)}</td>
                <td className="item-discount-cell">
                  <select
                    value={getDiscountSelectValue(item)}
                    onChange={(e) => handleDiscountChange(item, e.target.value)}
                  >
                    {DISCOUNT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className={`item-value${item.discountValue === 100 ? ' item-comp' : item.discountValue > 0 ? ' item-discounted' : ''}`}>
                  ₹{item.taxableValue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="bill-items-cards">
        {processedItems.map((item, idx) => (
          <div key={`${item.orderId}-${item.menuItemId}-${idx}`} className="bill-item-card">
            <div className="bill-item-card-top">
              <span className="bill-item-card-name">{item.name}</span>
              <div className="bill-item-card-meta">
                <span>{item.quantity}x ₹{(item.unitPrice || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="bill-item-card-bottom">
              <select
                value={getDiscountSelectValue(item)}
                onChange={(e) => handleDiscountChange(item, e.target.value)}
              >
                {DISCOUNT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className={`bill-item-card-value${item.discountValue > 0 ? ' discounted' : ''}`}>
                ₹{item.taxableValue.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bill-items-subtotals">
        <div className="bill-items-subtotals-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {totalItemDiscount > 0 && (
          <div className="bill-items-subtotals-row discount">
            <span>Item Discounts</span>
            <span>-₹{totalItemDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="bill-items-subtotals-row" style={{ fontWeight: 600 }}>
          <span>After Item Discounts</span>
          <span>₹{afterItemDiscount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
