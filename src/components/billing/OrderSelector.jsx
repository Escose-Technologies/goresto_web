export const OrderSelector = ({
  orders,
  selectedOrderIds,
  onSelectionChange,
  tableNumber,
}) => {
  const toggleOrder = (orderId) => {
    const next = selectedOrderIds.includes(orderId)
      ? selectedOrderIds.filter(id => id !== orderId)
      : [...selectedOrderIds, orderId];
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (selectedOrderIds.length === orders.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(orders.map(o => o.id));
    }
  };

  const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
  const totalItems = selectedOrders.reduce((s, o) => s + (o.items?.length || 0), 0);
  const baseTotal = selectedOrders.reduce((s, o) => s + (o.total || 0), 0);

  if (orders.length === 0) {
    return (
      <div className="order-selector-empty">
        No unbilled orders for Table {tableNumber}
      </div>
    );
  }

  return (
    <div>
      <div className="order-selector-table-label">
        Table <strong>{tableNumber}</strong> &mdash; {orders.length} unbilled order{orders.length !== 1 ? 's' : ''}
      </div>

      {orders.length > 1 && (
        <div className="order-selector-select-all">
          <label>
            <input
              type="checkbox"
              checked={selectedOrderIds.length === orders.length}
              onChange={toggleAll}
            />
            Select all
          </label>
        </div>
      )}

      <div className="order-selector-list">
        {orders.map(order => {
          const isSelected = selectedOrderIds.includes(order.id);
          return (
            <div
              key={order.id}
              className={`order-selector-item${isSelected ? ' selected' : ''}`}
              onClick={() => toggleOrder(order.id)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOrder(order.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="order-selector-item-info">
                <div className="order-selector-item-top">
                  <span className="order-selector-item-id">#{order.id.slice(-8)}</span>
                  <span className="order-selector-item-time">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {order.customerName && (
                    <span className="order-selector-item-customer">{order.customerName}</span>
                  )}
                  <span className="order-selector-item-total">
                    ₹{(order.total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="order-selector-item-items">
                  {order.items?.map((item, i) => (
                    <span key={i}>
                      {i > 0 ? ', ' : ''}{item.quantity}x {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrderIds.length > 0 && (
        <div className="order-selector-summary">
          <span><strong>{selectedOrders.length}</strong> order{selectedOrders.length !== 1 ? 's' : ''} selected</span>
          <span><strong>{totalItems}</strong> item{totalItems !== 1 ? 's' : ''}</span>
          <span>Base total: <strong>₹{baseTotal.toFixed(2)}</strong></span>
        </div>
      )}
    </div>
  );
};
