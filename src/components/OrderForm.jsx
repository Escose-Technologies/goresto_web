import { useState, useEffect } from 'react';
import { TouchButton } from './ui/TouchButton';
import { useToast } from './ui/Toast';
import './OrderForm.css';

export const OrderForm = ({ order, tables, menuItems, onSave, onCancel, onDelete }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    tableNumber: '',
    items: [],
    notes: '',
    status: 'pending',
    customerName: '',
    customerMobile: '',
  });

  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    if (order) {
      setFormData({
        tableNumber: order.tableNumber || '',
        items: order.items || [],
        notes: order.notes || '',
        status: order.status || 'pending',
        customerName: order.customerName || '',
        customerMobile: order.customerMobile || '',
      });
    }
  }, [order]);

  const handleAddItem = () => {
    if (!selectedMenuItem) return;
    
    const menuItem = menuItems.find(item => item.id === selectedMenuItem);
    if (!menuItem) return;

    const existingItemIndex = formData.items.findIndex(
      item => item.menuItemId === selectedMenuItem
    );

    let newItems;
    if (existingItemIndex >= 0) {
      newItems = [...formData.items];
      newItems[existingItemIndex].quantity += selectedQuantity;
    } else {
      newItems = [
        ...formData.items,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: selectedQuantity,
          price: menuItem.price,
        },
      ];
    }

    setFormData({ ...formData, items: newItems });
    setSelectedMenuItem('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    const newItems = [...formData.items];
    newItems[index].quantity = newQuantity;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.warning('Please add at least one item to the order');
      return;
    }
    onSave({
      ...formData,
      total: calculateTotal(),
    });
  };

  return (
    <div className="order-form-card">
      <h3>{order ? 'Edit Order' : 'Create New Order'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Table Number *</label>
            <select
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              required
            >
              <option value="">Select Table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.number}>
                  Table {table.number} ({table.capacity} seats)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="on-hold">On Hold</option>
            <option value="preparing">Preparing</option>
            <option value="prepared">Prepared</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Add Menu Item</label>
          <div className="add-item-row">
            <select
              value={selectedMenuItem}
              onChange={(e) => setSelectedMenuItem(e.target.value)}
              className="menu-item-select"
            >
              <option value="">Select Menu Item</option>
              {menuItems
                .filter(item => item.available)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ₹{item.price.toFixed(2)}
                  </option>
                ))}
            </select>
            <input
              type="number"
              min="1"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
              className="quantity-input"
            />
            <TouchButton
              variant="primary"
              size="small"
              onClick={handleAddItem}
              className="btn-add-item"
            >
              Add
            </TouchButton>
          </div>
        </div>

        {formData.items.length > 0 && (
          <div className="order-items-list">
            <label>Order Items:</label>
            {formData.items.map((item, index) => (
              <div key={index} className="order-item-form-row">
                <span className="item-name">{item.name}</span>
                <div className="item-controls">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="item-quantity">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                  <span className="item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="remove-item-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="order-total-row">
              <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Enter customer name"
            />
          </div>
          <div className="form-group">
            <label>Customer Mobile</label>
            <input
              type="tel"
              value={formData.customerMobile}
              onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="3"
            placeholder="Special instructions or notes..."
          />
        </div>

        <div className="form-actions">
          <TouchButton type="submit" variant="primary">
            {order ? 'Update Order' : 'Create Order'}
          </TouchButton>
          <TouchButton variant="secondary" onClick={onCancel}>
            Cancel
          </TouchButton>
          {order && onDelete && (
            <TouchButton variant="danger" onClick={onDelete} type="button">Delete</TouchButton>
          )}
        </div>
      </form>
    </div>
  );
};

