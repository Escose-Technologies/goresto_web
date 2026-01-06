import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { restaurantService, menuService, tableService, orderService } from '../services/dataService';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { MenuItemForm } from '../components/MenuItemForm';
import { TableForm } from '../components/TableForm';
import { OrderForm } from '../components/OrderForm';
import { Settings } from './Settings';
import { MenuPreview } from '../components/MenuPreview';
import { theme } from '../styles/theme';
import './Dashboard.css';

export const RestaurantAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'tables', 'orders', or 'preview'
  const [showForm, setShowForm] = useState(false); // For new items only
  const [editingItem, setEditingItem] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [expandedQRCodes, setExpandedQRCodes] = useState({}); // Track which QR codes are expanded
  const [expandedItemDetails, setExpandedItemDetails] = useState({}); // Track which item details are expanded
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadRestaurantData();
  }, [user]);

  const loadRestaurantData = async () => {
    try {
      // Try to get restaurant by adminId first, then by user's restaurantId
      const restaurantData = await restaurantService.getByUserId(user?.id, user?.restaurantId);
      if (restaurantData) {
        setRestaurant(restaurantData);
        const items = await menuService.getMenuItems(restaurantData.id);
        setMenuItems(items);
        const cats = await menuService.getCategories(restaurantData.id);
        setCategories(cats);
        const tablesData = await tableService.getTables(restaurantData.id);
        setTables(tablesData);
        const ordersData = await orderService.getOrders(restaurantData.id);
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (editingItem) {
        await menuService.updateMenuItem(restaurant.id, editingItem.id, itemData);
      } else {
        await menuService.addMenuItem(restaurant.id, itemData);
      }
      await loadRestaurantData();
      handleCancelEdit();
    } catch (error) {
      alert('Error saving menu item: ' + error.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(false); // Don't show top form when editing inline
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuService.deleteMenuItem(restaurant.id, itemId);
        await loadRestaurantData();
      } catch (error) {
        alert('Error deleting menu item: ' + error.message);
      }
    }
  };

  const handleSaveTable = async (tableData) => {
    try {
      if (editingTable) {
        await tableService.updateTable(restaurant.id, editingTable.id, tableData);
      } else {
        await tableService.addTable(restaurant.id, tableData);
      }
      await loadRestaurantData();
      handleCancelEdit();
    } catch (error) {
      alert('Error saving table: ' + error.message);
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowForm(false); // Don't show top form when editing inline
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await tableService.deleteTable(restaurant.id, tableId);
        await loadRestaurantData();
      } catch (error) {
        alert('Error deleting table: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setEditingTable(null);
    setShowForm(false);
  };

  const resetTableForm = () => {
    setEditingTable(null);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingTable(null);
    setEditingOrder(null);
    setShowForm(false);
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        await orderService.updateOrder(restaurant.id, editingOrder.id, orderData);
      } else {
        await orderService.addOrder(restaurant.id, orderData);
      }
      await loadRestaurantData();
      handleCancelEdit();
    } catch (error) {
      alert('Error saving order: ' + error.message);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowForm(false); // Don't show top form when editing inline
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderService.deleteOrder(restaurant.id, orderId);
        await loadRestaurantData();
      } catch (error) {
        alert('Error deleting order: ' + error.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrder(restaurant.id, orderId, { status: newStatus });
      await loadRestaurantData();
    } catch (error) {
      alert('Error updating order status: ' + error.message);
    }
  };

  const resetOrderForm = () => {
    setEditingOrder(null);
    setShowForm(false);
  };

  const filteredOrders = orderStatusFilter === 'All'
    ? orders
    : orders.filter(order => order.status === orderStatusFilter);

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!restaurant) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>No restaurant assigned to your account. Please contact Super Admin.</p>
          <button onClick={logout} className="btn-primary" style={{ background: theme.colors.background.gradient }}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>{restaurant.name}</h1>
          <p>Menu Management</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowSettings(true)}
            className="settings-btn"
            title="Settings"
          >
            ⚙️
          </button>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-modal-content">
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('menu');
              setShowForm(false);
              setEditingItem(null);
              setEditingTable(null);
              setEditingOrder(null);
            }}
            style={activeTab === 'menu' ? { background: theme.colors.background.gradient, color: 'white' } : {}}
          >
            Menu Items
          </button>
          <button
            className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tables');
              setShowForm(false);
              setEditingItem(null);
              setEditingTable(null);
              setEditingOrder(null);
            }}
            style={activeTab === 'tables' ? { background: theme.colors.background.gradient, color: 'white' } : {}}
          >
            Tables
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              setShowForm(false);
              setEditingItem(null);
              setEditingTable(null);
              setEditingOrder(null);
            }}
            style={activeTab === 'orders' ? { background: theme.colors.background.gradient, color: 'white' } : {}}
          >
            Orders
          </button>
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('preview');
              setShowForm(false);
              setEditingItem(null);
              setEditingTable(null);
              setEditingOrder(null);
            }}
            style={activeTab === 'preview' ? { background: theme.colors.background.gradient, color: 'white' } : {}}
          >
            👁️ User Preview
          </button>
        </div>

        {activeTab === 'menu' && (
          <>
            <div className="section-header">
              <h2>Menu Items</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                }}
                className="btn-primary"
                style={{ background: theme.colors.background.gradient }}
              >
                + Add Menu Item
              </button>
            </div>

            {showForm && !editingItem && !editingTable && !editingOrder && (
              <MenuItemForm
                item={null}
                categories={categories}
                onSave={handleSaveItem}
                onCancel={resetForm}
              />
            )}

            <div className="category-filter">
              <label>Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="menu-items-grid">
              {filteredItems.length === 0 ? (
                <div className="empty-state">No menu items found. Add your first item!</div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="menu-item-card">
                    {editingItem?.id === item.id ? (
                      <div className="inline-edit-form">
                        <MenuItemForm
                          item={editingItem}
                          categories={categories}
                          onSave={handleSaveItem}
                          onCancel={handleCancelEdit}
                        />
                      </div>
                    ) : (
                      <>
                        {item.image && (
                          <div className="menu-item-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                        )}
                        <div className="menu-item-content">
                          <div className="menu-item-header">
                            <h3>{item.name}</h3>
                            <span className="menu-item-price">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="menu-item-category">{item.category}</p>
                          <p className="menu-item-description">{item.description}</p>
                          <div className="menu-item-status">
                            {item.available ? (
                              <span className="status-available">Available</span>
                            ) : (
                              <span className="status-unavailable">Unavailable</span>
                            )}
                          </div>
                          <div className="item-details-section">
                            <button
                              className="details-toggle-btn"
                              onClick={() => {
                                setExpandedItemDetails(prev => ({
                                  ...prev,
                                  [item.id]: !prev[item.id]
                                }));
                              }}
                            >
                              <span>Details</span>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                style={{
                                  transform: expandedItemDetails[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.3s ease'
                                }}
                              >
                                <path
                                  d="M4 6L8 10L12 6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            {expandedItemDetails[item.id] && (
                              <div className="item-details-content">
                                <div className="menu-item-dates">
                                  {item.createdAt && (
                                    <div className="date-info">
                                      <span className="date-label">Created:</span>
                                      <span className="date-value">
                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  )}
                                  {item.updatedAt && (
                                    <div className="date-info">
                                      <span className="date-label">Updated:</span>
                                      <span className="date-value">
                                        {new Date(item.updatedAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* Space for future additional details */}
                                {/* Example: 
                                <div className="additional-details">
                                  <div className="detail-row">
                                    <span className="detail-label">Item ID:</span>
                                    <span className="detail-value">{item.id}</span>
                                  </div>
                                </div>
                                */}
                              </div>
                            )}
                          </div>
                          <div className="card-actions">
                            <button
                              onClick={() => handleEdit(item)}
                              className="btn-icon btn-edit-icon"
                              title="Edit"
                            >
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path
                                  d="M12.75 2.25C12.9489 2.05109 13.1895 1.95168 13.5 1.95168C13.8105 1.95168 14.0511 2.05109 14.25 2.25L15.75 3.75C15.9489 3.94891 16.0483 4.18951 16.0483 4.5C16.0483 4.81049 15.9489 5.05109 15.75 5.25L6.9375 14.0625L2.25 15.75L3.9375 11.0625L12.75 2.25Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="btn-icon btn-delete-icon"
                              title="Delete"
                            >
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path
                                  d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'tables' && (
          <>
            <div className="section-header">
              <h2>Tables</h2>
              <button
                onClick={() => {
                  setEditingTable(null);
                  setShowForm(true);
                }}
                className="btn-primary"
                style={{ background: theme.colors.background.gradient }}
              >
                + Add Table
              </button>
            </div>

            {showForm && !editingItem && !editingTable && !editingOrder && (
              <TableForm
                table={null}
                onSave={handleSaveTable}
                onCancel={resetTableForm}
              />
            )}

            <div className="tables-grid">
              {tables.length === 0 ? (
                <div className="empty-state">No tables found. Add your first table!</div>
              ) : (
                tables.map((table) => (
                  <div key={table.id} className="table-card">
                    {editingTable?.id === table.id ? (
                      <div className="inline-edit-form">
                        <TableForm
                          table={editingTable}
                          onSave={handleSaveTable}
                          onCancel={handleCancelEdit}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="table-header">
                          <h3>Table {table.number}</h3>
                          <span className={`table-status table-status-${table.status}`}>
                            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                          </span>
                        </div>
                        <div className="table-details">
                          <p><strong>Capacity:</strong> {table.capacity} guests</p>
                          <p><strong>Location:</strong> {table.location}</p>
                        </div>
                        <div className="table-qr-section">
                          <button
                            className="qr-toggle-btn"
                            onClick={() => {
                              setExpandedQRCodes(prev => ({
                                ...prev,
                                [table.id]: !prev[table.id]
                              }));
                            }}
                          >
                            <span>QR Code</span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              style={{
                                transform: expandedQRCodes[table.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                              }}
                            >
                              <path
                                d="M4 6L8 10L12 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          {expandedQRCodes[table.id] && (
                            <div className="qr-content">
                              <QRCodeGenerator 
                                restaurantId={restaurant.id}
                                restaurantName={restaurant.name}
                                tableNumber={table.number}
                                showDownload={true}
                              />
                            </div>
                          )}
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => handleEditTable(table)}
                            className="btn-icon btn-edit-icon"
                            title="Edit"
                          >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path
                                d="M12.75 2.25C12.9489 2.05109 13.1895 1.95168 13.5 1.95168C13.8105 1.95168 14.0511 2.05109 14.25 2.25L15.75 3.75C15.9489 3.94891 16.0483 4.18951 16.0483 4.5C16.0483 4.81049 15.9489 5.05109 15.75 5.25L6.9375 14.0625L2.25 15.75L3.9375 11.0625L12.75 2.25Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="btn-icon btn-delete-icon"
                            title="Delete"
                          >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path
                                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="section-header">
              <h2>Orders</h2>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setShowForm(true);
                }}
                className="btn-primary"
                style={{ background: theme.colors.background.gradient }}
              >
                + Create Order
              </button>
            </div>

            {showForm && !editingItem && !editingTable && !editingOrder && (
              <OrderForm
                order={null}
                tables={tables}
                menuItems={menuItems}
                onSave={handleSaveOrder}
                onCancel={resetOrderForm}
              />
            )}

            <div className="order-status-filter">
              <label>Filter by Status:</label>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="All">All Orders</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="orders-list">
              {filteredOrders.length === 0 ? (
                <div className="empty-state">No orders found. Create your first order!</div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    {editingOrder?.id === order.id ? (
                      <div className="inline-edit-form">
                        <OrderForm
                          order={editingOrder}
                          tables={tables}
                          menuItems={menuItems}
                          onSave={handleSaveOrder}
                          onCancel={handleCancelEdit}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="order-header">
                          <div>
                            <h3>Order #{order.id.split('-')[1]}</h3>
                            <p className="order-table">Table: {order.tableNumber}</p>
                            <p className="order-date">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="order-status-section">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`order-status-select order-status-${order.status}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                        <div className="order-items">
                          <h4>Items:</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="order-item-row">
                              <span className="order-item-name">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="order-item-price">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="order-notes">
                            <strong>Notes:</strong> {order.notes}
                          </div>
                        )}
                        <div className="order-footer">
                          <div className="order-total">
                            <strong>Total: ${order.total.toFixed(2)}</strong>
                          </div>
                          <div className="card-actions">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="btn-icon btn-edit-icon"
                              title="Edit"
                            >
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path
                                  d="M12.75 2.25C12.9489 2.05109 13.1895 1.95168 13.5 1.95168C13.8105 1.95168 14.0511 2.05109 14.25 2.25L15.75 3.75C15.9489 3.94891 16.0483 4.18951 16.0483 4.5C16.0483 4.81049 15.9489 5.05109 15.75 5.25L6.9375 14.0625L2.25 15.75L3.9375 11.0625L12.75 2.25Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="btn-icon btn-delete-icon"
                              title="Delete"
                            >
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path
                                  d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'preview' && (
          <>
            <div className="section-header preview-section-header">
              <div>
                <h2>User Preview</h2>
                <p className="preview-description">
                  See how your menu appears to customers. Changes made to menu items, settings, or discounts will be reflected here.
                </p>
              </div>
              <button
                onClick={loadRestaurantData}
                className="btn-secondary"
                title="Refresh Preview"
              >
                🔄 Refresh
              </button>
            </div>
            <div className="preview-container">
              <MenuPreview restaurantId={restaurant.id} restaurant={restaurant} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

