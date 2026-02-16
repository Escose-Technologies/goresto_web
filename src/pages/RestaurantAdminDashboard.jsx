import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { restaurantService, menuService, tableService, orderService, staffService, analyticsService, billService, getAccessToken } from '../services/apiService';
import { useSocket } from '../hooks/useSocket';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { MenuItemForm } from '../components/MenuItemForm';
import { TableForm } from '../components/TableForm';
import { OrderForm } from '../components/OrderForm';
import { StaffForm } from '../components/StaffForm';
import { Settings } from './Settings';
import { MenuPreview } from '../components/MenuPreview';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsCard';
import { RestaurantProfileForm } from '../components/forms/RestaurantProfileForm';
import { TouchButton, IconButton } from '../components/ui/TouchButton';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { GenerateBillModal } from '../components/billing/GenerateBillModal';
import { BillingTab } from '../components/billing/BillingTab';
import { startStaffCallRing } from '../utils/sounds';
import { getOrderStatusLabel } from '../utils/statusLabels';
import './Dashboard.css';

export const RestaurantAdminDashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'tables', 'orders', 'staff', 'analytics', 'profile', or 'preview'
  const [showForm, setShowForm] = useState(false); // For new items only
  const [editingItem, setEditingItem] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState('All');
  const [expandedQRCodes, setExpandedQRCodes] = useState({}); // Track which QR codes are expanded
  const [showSettings, setShowSettings] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const { joinRestaurant, onOrderNew, onOrderUpdated, onStaffCalled, onBillNew, onBillUpdated } = useSocket();
  const [staffCallAlerts, setStaffCallAlerts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTriggerOrder, setBillTriggerOrder] = useState(null);
  const [billingRefreshKey, setBillingRefreshKey] = useState(0);
  const staffCallRingsRef = useRef({});
  const staffCallTablesRef = useRef(new Set());

  useEffect(() => {
    const savedTheme = localStorage.getItem('goresto-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    loadRestaurantData();
  }, [user]);

  // Socket: join restaurant room and listen for real-time updates
  useEffect(() => {
    if (!restaurant) return;
    const token = getAccessToken();
    if (!token) return;

    joinRestaurant(restaurant.id, token);

    const cleanupNew = onOrderNew((order) => {
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
    });

    const cleanupUpdated = onOrderUpdated((order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    const cleanupStaffCalled = onStaffCalled((data) => {
      // Guard duplicates via ref (avoids StrictMode double-invocation issues)
      if (staffCallTablesRef.current.has(data.tableNumber)) return;
      staffCallTablesRef.current.add(data.tableNumber);

      const id = Date.now() + Math.random();
      const ring = startStaffCallRing();
      staffCallRingsRef.current[id] = ring;

      setStaffCallAlerts(prev => [...prev, { ...data, id }]);
    });

    const cleanupBillNew = onBillNew(() => {
      setBillingRefreshKey(k => k + 1);
    });

    const cleanupBillUpdated = onBillUpdated(() => {
      setBillingRefreshKey(k => k + 1);
    });

    return () => {
      cleanupNew();
      cleanupUpdated();
      cleanupStaffCalled();
      cleanupBillNew();
      cleanupBillUpdated();
    };
  }, [restaurant, joinRestaurant, onOrderNew, onOrderUpdated, onStaffCalled, onBillNew, onBillUpdated]);

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
        const staffData = await staffService.getStaff(restaurantData.id);
        setStaff(staffData);
        const analyticsData = await analyticsService.getAnalytics(restaurantData.id);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
  };

  const handleSaveProfile = async (profileData) => {
    try {
      await restaurantService.update(restaurant.id, profileData);
      await loadRestaurantData();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error updating profile: ' + error.message);
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
      toast.error('Error saving menu item: ' + error.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(false);
  };

  const handleDelete = (itemId) => {
    showConfirm('Delete Menu Item', 'Are you sure you want to delete this menu item?', async () => {
      closeConfirm();
      try {
        await menuService.deleteMenuItem(restaurant.id, itemId);
        await loadRestaurantData();
      } catch (error) {
        toast.error('Error deleting menu item: ' + error.message);
      }
    });
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
      toast.error('Error saving table: ' + error.message);
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setShowForm(false);
  };

  const handleDeleteTable = (tableId) => {
    showConfirm('Delete Table', 'Are you sure you want to delete this table?', async () => {
      closeConfirm();
      try {
        await tableService.deleteTable(restaurant.id, tableId);
        await loadRestaurantData();
      } catch (error) {
        toast.error('Error deleting table: ' + error.message);
      }
    });
  };

  const resetForm = () => {
    setEditingItem(null);
    setEditingTable(null);
    setEditingStaff(null);
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
    setEditingStaff(null);
    setShowForm(false);
  };

  const handleSaveStaff = async (staffData) => {
    try {
      if (editingStaff) {
        await staffService.updateStaff(restaurant.id, editingStaff.id, staffData);
      } else {
        await staffService.addStaff(restaurant.id, staffData);
      }
      await loadRestaurantData();
      handleCancelEdit();
    } catch (error) {
      toast.error('Error saving staff member: ' + error.message);
    }
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setShowForm(false);
  };

  const handleDeleteStaff = (staffId) => {
    showConfirm('Remove Staff', 'Are you sure you want to remove this staff member?', async () => {
      closeConfirm();
      try {
        await staffService.deleteStaff(restaurant.id, staffId);
        await loadRestaurantData();
      } catch (error) {
        toast.error('Error deleting staff member: ' + error.message);
      }
    });
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
      toast.error('Error saving order: ' + error.message);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowForm(false);
  };

  const handleDeleteOrder = (orderId) => {
    showConfirm('Delete Order', 'Are you sure you want to delete this order?', async () => {
      closeConfirm();
      try {
        await orderService.deleteOrder(restaurant.id, orderId);
        await loadRestaurantData();
      } catch (error) {
        toast.error('Error deleting order: ' + error.message);
      }
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrder(restaurant.id, orderId, { status: newStatus });
      await loadRestaurantData();
    } catch (error) {
      toast.error('Error updating order status: ' + error.message);
    }
  };

  const handleGenerateBill = (order) => {
    setBillTriggerOrder(order);
    setShowBillModal(true);
  };

  const handleBillCreated = () => {
    loadRestaurantData();
    setBillingRefreshKey(k => k + 1);
  };

  const resetOrderForm = () => {
    setEditingOrder(null);
    setEditingStaff(null);
    setShowForm(false);
  };

  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter !== 'All' && order.status !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.trim().toLowerCase();
      const matchesName = order.customerName?.toLowerCase().includes(q);
      const matchesMobile = order.customerMobile?.toLowerCase().includes(q);
      const matchesId = order.id.toLowerCase().includes(q);
      if (!matchesName && !matchesMobile && !matchesId) return false;
    }
    return true;
  });

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
          <TouchButton variant="primary" onClick={logout}>
            Logout
          </TouchButton>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {staffCallAlerts.length > 0 && (
        <div className="staff-call-overlay">
          <div className="staff-call-overlay-inner">
            {staffCallAlerts.map((alert) => (
              <div key={alert.id} className="staff-call-popup">
                <div className="staff-call-popup-bell">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="staff-call-popup-title">Staff Assistance Requested</h3>
                <div className="staff-call-popup-table">Table {alert.tableNumber}</div>
                {alert.customerName && (
                  <div className="staff-call-popup-customer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {alert.customerName}
                  </div>
                )}
                <div className="staff-call-popup-actions">
                  <button
                    className="staff-call-btn-silence"
                    onClick={() => {
                      if (staffCallRingsRef.current[alert.id]) {
                        staffCallRingsRef.current[alert.id].stop();
                        delete staffCallRingsRef.current[alert.id];
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <line x1="23" y1="9" x2="17" y2="15"/>
                      <line x1="17" y1="9" x2="23" y2="15"/>
                    </svg>
                    Silence
                  </button>
                  <button
                    className="staff-call-btn-dismiss"
                    onClick={() => {
                      if (staffCallRingsRef.current[alert.id]) {
                        staffCallRingsRef.current[alert.id].stop();
                        delete staffCallRingsRef.current[alert.id];
                      }
                      staffCallTablesRef.current.delete(alert.tableNumber);
                      setStaffCallAlerts(prev => prev.filter(a => a.id !== alert.id));
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div>
          <h1>{restaurant.name}</h1>
          <p>Menu Management</p>
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
          {[
            { key: 'menu', label: 'Menu Items', icon: 'restaurant_menu' },
            { key: 'tables', label: 'Tables', icon: 'table_restaurant' },
            { key: 'orders', label: 'Orders', icon: 'receipt_long' },
            { key: 'billing', label: 'Billing', icon: 'receipt' },
            { key: 'staff', label: 'Staff', icon: 'groups' },
            { key: 'analytics', label: 'Analytics', icon: 'bar_chart' },
            { key: 'preview', label: 'User Preview', icon: 'visibility' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.key);
                setShowForm(false);
                setEditingItem(null);
                setEditingTable(null);
                setEditingOrder(null);
                setEditingStaff(null);
              }}
            >
              <span className="material-symbols-outlined tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          <div className="tabs-bottom-actions">
            <button
              className={`tab-btn tab-btn-action ${settingsExpanded ? 'active' : ''}`}
              onClick={() => setSettingsExpanded(prev => !prev)}
              title="Settings"
            >
              <span className="material-symbols-outlined tab-icon">settings</span>
              Settings
              <span className={`material-symbols-outlined settings-chevron ${settingsExpanded ? 'expanded' : ''}`}>
                expand_more
              </span>
            </button>

            {settingsExpanded && (
              <div className="settings-sub-options">
                <button
                  className="tab-btn tab-btn-sub"
                  onClick={() => {
                    const next = !darkMode;
                    setDarkMode(next);
                    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
                    localStorage.setItem('goresto-theme', next ? 'dark' : 'light');
                  }}
                >
                  <span className="material-symbols-outlined tab-icon">
                    {darkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  Theme
                  <span className="sub-option-value">{darkMode ? 'Dark' : 'Light'}</span>
                </button>
                <button
                  className="tab-btn tab-btn-sub"
                  onClick={() => {
                    setActiveTab('profile');
                    setSettingsExpanded(false);
                    setShowForm(false);
                    setEditingItem(null);
                    setEditingTable(null);
                    setEditingOrder(null);
                    setEditingStaff(null);
                  }}
                >
                  <span className="material-symbols-outlined tab-icon">person</span>
                  Profile
                </button>
                <button
                  className="tab-btn tab-btn-sub tab-btn-logout"
                  onClick={logout}
                >
                  <span className="material-symbols-outlined tab-icon">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="tab-content">
        {activeTab === 'menu' && (
          <>
            <div className="section-header">
              <h2>Menu Items</h2>
            </div>

            <button
              className="fab-add-btn"
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              title="Add Menu Item"
            >
              <span className="material-symbols-outlined">add</span>
            </button>

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
                  <div key={item.id} className="menu-item-card menu-compact-clickable" onClick={() => handleEdit(item)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleEdit(item)}>
                    <div className="menu-compact">
                      <div className="menu-compact-top">
                        {item.image ? (
                          <img className="menu-item-thumb" src={item.image} alt={item.name} />
                        ) : (
                          <div className="menu-item-thumb menu-item-thumb-placeholder">
                            <span className="material-symbols-outlined">restaurant</span>
                          </div>
                        )}
                        <div className="menu-compact-info">
                          <div className="menu-compact-title-row">
                            <h3>{item.name}</h3>
                            <span className="menu-item-price">₹{item.price.toFixed(2)}</span>
                          </div>
                          <div className="menu-compact-meta">
                            <span className="menu-item-category">{item.category}</span>
                            {item.available ? (
                              <span className="status-available">Available</span>
                            ) : (
                              <span className="status-unavailable">Unavailable</span>
                            )}
                          </div>
                          <p className="menu-compact-desc">{item.description}</p>
                        </div>
                      </div>
                      <div className="menu-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="menu-item-image-placeholder">
                            <span className="material-symbols-outlined">restaurant</span>
                          </div>
                        )}
                      </div>
                      <div className="menu-item-content">
                        <p className="menu-item-description">{item.description}</p>
                        {(item.createdAt || item.updatedAt) && (
                          <div className="menu-item-footer-meta">
                            {item.updatedAt && (
                              <span className="meta-date">Updated {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            )}
                            {item.createdAt && !item.updatedAt && (
                              <span className="meta-date">Added {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Menu Item Form Modal */}
            {(showForm || editingItem) && (
              <div className="form-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { resetForm(); setEditingItem(null); } }}>
                <div className="form-modal-content">
                  <button className="form-modal-close" onClick={() => { resetForm(); setEditingItem(null); }}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <MenuItemForm
                    item={editingItem}
                    categories={categories}
                    foodType={restaurant?.foodType || 'both'}
                    onSave={handleSaveItem}
                    onCancel={() => { resetForm(); setEditingItem(null); }}
                    onDelete={editingItem ? () => handleDelete(editingItem.id) : undefined}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'tables' && (
          <>
            <div className="section-header">
              <h2>Tables</h2>
            </div>

            <button
              className="fab-add-btn"
              onClick={() => {
                setEditingTable(null);
                setShowForm(true);
              }}
              title="Add Table"
            >
              <span className="material-symbols-outlined">add</span>
            </button>

            <div className="tables-grid">
              {tables.length === 0 ? (
                <div className="empty-state">No tables found. Add your first table!</div>
              ) : (
                tables.map((table) => (
                  <div key={table.id} className="table-card table-card-clickable" onClick={() => handleEditTable(table)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleEditTable(table)}>
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
                        onClick={(e) => {
                          e.stopPropagation();
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
                        <div className="qr-content" onClick={(e) => e.stopPropagation()}>
                          <QRCodeGenerator
                            restaurantId={restaurant.id}
                            restaurantName={restaurant.name}
                            tableNumber={table.number}
                            showDownload={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {(showForm || editingTable) && (
              <div className="form-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { resetTableForm(); setEditingTable(null); } }}>
                <div className="form-modal-content">
                  <button className="form-modal-close" onClick={() => { resetTableForm(); setEditingTable(null); }}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <TableForm
                    table={editingTable}
                    onSave={handleSaveTable}
                    onCancel={() => { resetTableForm(); setEditingTable(null); }}
                    onDelete={editingTable ? () => handleDeleteTable(editingTable.id) : undefined}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="section-header">
              <h2>Orders</h2>
            </div>

            <button
              className="fab-add-btn"
              onClick={() => {
                setEditingOrder(null);
                setShowForm(true);
              }}
              title="Create Order"
            >
              <span className="material-symbols-outlined">add</span>
            </button>

            <div className="kitchen-display-link-wrapper">
              <a
                href={`/kitchen/${restaurant.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="kitchen-display-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                Open Kitchen Display
              </a>
            </div>

            <div className="order-filters-row">
              <div className="order-search-box">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <circle cx="7" cy="7" r="5"/>
                  <path d="M13 13L10.5 10.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, mobile, or order ID..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                />
                {orderSearchQuery && (
                  <button className="order-search-clear" onClick={() => setOrderSearchQuery('')}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M10 4L4 10M4 4L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="order-status-filter">
                <label>Status:</label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="All">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="on-hold">On Hold</option>
                  <option value="preparing">Preparing</option>
                  <option value="prepared">Prepared</option>
                  <option value="served">Served</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="orders-list">
              {filteredOrders.length === 0 ? (
                <div className="empty-state">No orders found. Create your first order!</div>
              ) : (
                filteredOrders.map((order) => {
                  const isOldFinished = ['completed', 'cancelled'].includes(order.status) &&
                    (Date.now() - new Date(order.updatedAt).getTime()) > 3600000;
                  return (
                    <div
                      key={order.id}
                      className={`order-card${!isOldFinished ? ' order-card-clickable' : ''}`}
                      onClick={() => { if (!isOldFinished) handleEditOrder(order); }}
                      role={!isOldFinished ? 'button' : undefined}
                      tabIndex={!isOldFinished ? 0 : undefined}
                      onKeyDown={(e) => { if (!isOldFinished && e.key === 'Enter') handleEditOrder(order); }}
                    >
                      <div className="order-compact">
                        <div className="order-compact-top">
                          <div className="order-compact-info">
                            <div className="order-compact-title-row">
                              <h3>#{order.id.slice(-8)}</h3>
                              <span className={`order-status-badge order-status-${order.status}`}>
                                {getOrderStatusLabel(order.status)}
                              </span>
                              <span className="order-compact-total">₹{order.total.toFixed(2)}</span>
                            </div>
                            <div className="order-compact-meta">
                              <span>Table {order.tableNumber}</span>
                              {order.customerName && <span className="order-compact-customer">{order.customerName}</span>}
                              {order.customerMobile && <span>{order.customerMobile}</span>}
                              <span className="order-compact-date">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="order-id-full">{order.id}</p>
                          </div>
                        </div>
                        <div className="order-compact-items">
                          {order.items.map((item, index) => (
                            <span key={index} className="order-compact-item">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="order-compact-notes">
                            {order.notes}
                          </div>
                        )}
                        {order.status === 'pending' && (
                          <div className="order-compact-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'accepted')} className="btn-order-sm btn-accept">Accept</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'rejected')} className="btn-order-sm btn-reject">Reject</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'on-hold')} className="btn-order-sm btn-hold">Hold</button>
                          </div>
                        )}
                        {(order.status === 'accepted' || order.status === 'on-hold') && (
                          <div className="order-compact-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'preparing')} className="btn-order-sm btn-preparing">Start Preparing</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'rejected')} className="btn-order-sm btn-reject">Reject</button>
                          </div>
                        )}
                        {order.status === 'preparing' && (
                          <div className="order-compact-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'prepared')} className="btn-order-sm btn-prepared">Prepared</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'ready')} className="btn-order-sm btn-ready">Ready</button>
                          </div>
                        )}
                        {order.status === 'prepared' && (
                          <div className="order-compact-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'served')} className="btn-order-sm btn-served">Served</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'ready')} className="btn-order-sm btn-ready">Ready</button>
                          </div>
                        )}
                        {order.status === 'served' && (
                          <div className="order-compact-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="btn-order-sm btn-complete">Complete</button>
                            {!order.billId && (
                              <button onClick={() => handleGenerateBill(order)} className="btn-order-sm btn-bill">Generate Bill</button>
                            )}
                          </div>
                        )}
                        {order.status === 'ready' && (
                          <div className="order-compact-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'served')} className="btn-order-sm btn-served">Served</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="btn-order-sm btn-complete">Complete</button>
                          </div>
                        )}
                        {order.status === 'completed' && !order.billId && (
                          <div className="order-compact-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleGenerateBill(order)} className="btn-order-sm btn-bill">Generate Bill</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {(showForm || editingOrder) && (
              <div className="form-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { resetOrderForm(); setEditingOrder(null); } }}>
                <div className="form-modal-content">
                  <button className="form-modal-close" onClick={() => { resetOrderForm(); setEditingOrder(null); }}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <OrderForm
                    order={editingOrder}
                    tables={tables}
                    menuItems={menuItems}
                    onSave={handleSaveOrder}
                    onCancel={() => { resetOrderForm(); setEditingOrder(null); }}
                    onDelete={editingOrder ? () => handleDeleteOrder(editingOrder.id) : undefined}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'billing' && (
          <BillingTab
            restaurantId={restaurant.id}
            restaurant={restaurant}
            toast={toast}
            refreshTrigger={billingRefreshKey}
          />
        )}

        {activeTab === 'staff' && (
          <>
            <div className="section-header">
              <h2>Staff Management</h2>
            </div>

            <button
              className="fab-add-btn"
              onClick={() => {
                setEditingStaff(null);
                setShowForm(true);
              }}
              title="Onboard New Staff"
            >
              <span className="material-symbols-outlined">add</span>
            </button>

            <div className="staff-status-filter">
              <label>Filter by Status:</label>
              <select
                value={staffStatusFilter}
                onChange={(e) => setStaffStatusFilter(e.target.value)}
              >
                <option value="All">All Staff</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>

            <div className="staff-grid">
              {staff.filter(s => staffStatusFilter === 'All' || s.status === staffStatusFilter).length === 0 ? (
                <div className="empty-state">No staff members found. Onboard your first staff member!</div>
              ) : (
                staff.filter(s => staffStatusFilter === 'All' || s.status === staffStatusFilter).map((staffMember) => (
                  <div key={staffMember.id} className="staff-card staff-card-clickable" onClick={() => handleEditStaff(staffMember)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleEditStaff(staffMember)}>
                    <div className="staff-photo-section">
                      {staffMember.photo ? (
                        <img src={staffMember.photo} alt={staffMember.name} className="staff-photo" />
                      ) : (
                        <div className="staff-photo-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                      )}
                      <span className={`staff-status-badge staff-status-${staffMember.status}`}>
                        {staffMember.status === 'active' ? 'Active' : staffMember.status === 'inactive' ? 'Inactive' : 'On Leave'}
                      </span>
                    </div>
                    <div className="staff-content">
                      <div className="staff-header">
                        <h3>{staffMember.name}</h3>
                        <span className="staff-role">{staffMember.role}</span>
                      </div>
                      <div className="staff-info">
                        <div className="staff-info-item">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 3L8 8L14 3M2 3H14M2 3V13H14V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{staffMember.email}</span>
                        </div>
                        {staffMember.phone && (
                          <div className="staff-info-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.65 11.5a.678.678 0 0 1-.64-.468l-.267-1.12a.678.678 0 0 0-.58-.49l-2.307-.402a.678.678 0 0 0-.58.122L3.654 1.328Z" stroke="currentColor" strokeWidth="1.2"/>
                            </svg>
                            <span>{staffMember.phone}</span>
                          </div>
                        )}
                        {staffMember.hireDate && (
                          <div className="staff-info-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Hired: {new Date(staffMember.hireDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {(showForm || editingStaff) && (
              <div className="form-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { handleCancelEdit(); setEditingStaff(null); } }}>
                <div className="form-modal-content">
                  <button className="form-modal-close" onClick={() => { handleCancelEdit(); setEditingStaff(null); }}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                  <StaffForm
                    staff={editingStaff}
                    onSave={handleSaveStaff}
                    onCancel={() => { handleCancelEdit(); setEditingStaff(null); }}
                    onDelete={editingStaff ? () => handleDeleteStaff(editingStaff.id) : undefined}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <div className="section-header">
              <h2>Analytics</h2>
              <button
                onClick={loadRestaurantData}
                className="btn-secondary"
                title="Refresh Analytics"
              >
                🔄 Refresh
              </button>
            </div>
            <AnalyticsDashboard analytics={analytics} />
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <div className="section-header">
              <h2>Restaurant Profile</h2>
            </div>
            <RestaurantProfileForm
              restaurant={restaurant}
              onSave={handleSaveProfile}
            />
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

      {showBillModal && restaurant && billTriggerOrder && (
        <GenerateBillModal
          restaurantId={restaurant.id}
          triggerOrder={billTriggerOrder}
          onClose={() => { setShowBillModal(false); setBillTriggerOrder(null); }}
          onBillCreated={handleBillCreated}
          toast={toast}
        />
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

