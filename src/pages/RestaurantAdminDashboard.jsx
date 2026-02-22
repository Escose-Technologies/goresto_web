import { useState, useEffect, useRef } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { restaurantService, menuService, tableService, orderService, staffService, analyticsService, settingsService, getAccessToken } from '../services/apiService';
import { useSocket } from '../hooks/useSocket';
import { Settings } from './Settings';
import { MenuPreview } from '../components/MenuPreview';
import { AnalyticsDashboard } from '../components/dashboard/AnalyticsCard';
import { RestaurantProfileForm } from '../components/forms/RestaurantProfileForm';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { GenerateBillModal } from '../components/billing/GenerateBillModal';
import { BillingTab } from '../components/billing/BillingTab';
import { TablesSection, StaffSection, MenuSection, OrdersSection } from '../components/sections';
import { startStaffCallRing } from '../utils/sounds';
import DashboardLayout from '../layouts/DashboardLayout';

export const RestaurantAdminDashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantSettings, setRestaurantSettings] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
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
  const [prevTab, setPrevTab] = useState('orders');
  const { joinRestaurant, onOrderNew, onOrderUpdated, onStaffCalled, onBillNew, onBillUpdated, onConnect } = useSocket();
  const [staffCallAlerts, setStaffCallAlerts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTriggerOrder, setBillTriggerOrder] = useState(null);
  const [billingRefreshKey, setBillingRefreshKey] = useState(0);
  const staffCallRingsRef = useRef({});
  const staffCallTablesRef = useRef(new Set());

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

    // Re-join restaurant room on reconnect (e.g. after network drop)
    const cleanupConnect = onConnect(() => {
      const reconnectToken = getAccessToken();
      if (reconnectToken && restaurant) {
        joinRestaurant(restaurant.id, reconnectToken);
      }
    });

    return () => {
      cleanupNew();
      cleanupUpdated();
      cleanupStaffCalled();
      cleanupBillNew();
      cleanupBillUpdated();
      cleanupConnect();
    };
  }, [restaurant, joinRestaurant, onOrderNew, onOrderUpdated, onStaffCalled, onBillNew, onBillUpdated, onConnect]);

  const loadRestaurantData = async () => {
    try {
      const restaurantData = await restaurantService.getByUserId(user?.id, user?.restaurantId);
      if (restaurantData) {
        setRestaurant(restaurantData);
        const [items, tablesData, ordersData, staffData, analyticsData, settingsData] = await Promise.all([
          menuService.getMenuItems(restaurantData.id),
          tableService.getTables(restaurantData.id),
          orderService.getOrders(restaurantData.id),
          staffService.getStaff(restaurantData.id),
          analyticsService.getAnalytics(restaurantData.id),
          settingsService.getSettings(restaurantData.id),
        ]);
        setMenuItems(items);
        // Derive categories client-side — saves 1 API call + DB query
        setCategories([...new Set(items.map(i => i.category).filter(Boolean))].sort());
        setTables(tablesData);
        setOrders(ordersData);
        setStaff(staffData);
        setAnalytics(analyticsData);
        setRestaurantSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Scoped refresh helpers — avoid reloading all 7 endpoints when only one tab needs it
  const refreshAnalytics = async () => {
    if (!restaurant) return;
    try {
      const data = await analyticsService.getAnalytics(restaurant.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  };

  const refreshPreview = async () => {
    if (!restaurant) return;
    try {
      const [items, settingsData] = await Promise.all([
        menuService.getMenuItems(restaurant.id),
        settingsService.getSettings(restaurant.id),
      ]);
      setMenuItems(items);
      setCategories([...new Set(items.map(i => i.category).filter(Boolean))].sort());
      setRestaurantSettings(settingsData);
    } catch (error) {
      console.error('Error refreshing preview:', error);
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
      const updated = await restaurantService.update(restaurant.id, profileData);
      await settingsService.updateSettings(restaurant.id, {
        restaurantName: profileData.name,
        address: profileData.address,
        phone: profileData.phone,
        email: profileData.email,
        openingTime: profileData.openingTime,
        closingTime: profileData.closingTime,
      });
      setRestaurant(updated);
      toast.success('Profile updated! Changes will reflect on the public menu.');
    } catch (error) {
      toast.error('Error updating profile: ' + error.message);
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (editingItem) {
        const updated = await menuService.updateMenuItem(restaurant.id, editingItem.id, itemData);
        setMenuItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
      } else {
        const created = await menuService.addMenuItem(restaurant.id, itemData);
        setMenuItems(prev => [...prev, created]);
        // New item may introduce a new category
        if (itemData.category && !categories.includes(itemData.category)) {
          setCategories(prev => [...prev, itemData.category]);
        }
      }
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
        setMenuItems(prev => prev.filter(i => i.id !== itemId));
        handleCancelEdit();
      } catch (error) {
        toast.error('Error deleting menu item: ' + error.message);
      }
    });
  };

  const handleSaveTable = async (tableData) => {
    try {
      if (editingTable) {
        const updated = await tableService.updateTable(restaurant.id, editingTable.id, tableData);
        setTables(prev => prev.map(t => t.id === editingTable.id ? updated : t));
      } else {
        const created = await tableService.addTable(restaurant.id, tableData);
        setTables(prev => [...prev, created]);
      }
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
        setTables(prev => prev.filter(t => t.id !== tableId));
        handleCancelEdit();
      } catch (error) {
        toast.error('Error deleting table: ' + error.message);
      }
    });
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
        const updated = await staffService.updateStaff(restaurant.id, editingStaff.id, staffData);
        setStaff(prev => prev.map(s => s.id === editingStaff.id ? updated : s));
      } else {
        const created = await staffService.addStaff(restaurant.id, staffData);
        setStaff(prev => [...prev, created]);
      }
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
        setStaff(prev => prev.filter(s => s.id !== staffId));
        handleCancelEdit();
      } catch (error) {
        toast.error('Error deleting staff member: ' + error.message);
      }
    });
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        const updated = await orderService.updateOrder(restaurant.id, editingOrder.id, orderData);
        setOrders(prev => prev.map(o => o.id === editingOrder.id ? updated : o));
      } else {
        const created = await orderService.addOrder(restaurant.id, orderData);
        setOrders(prev => [created, ...prev]);
      }
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
        setOrders(prev => prev.filter(o => o.id !== orderId));
        handleCancelEdit();
      } catch (error) {
        toast.error('Error deleting order: ' + error.message);
      }
    });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    // Capture previous status for rollback
    const prevStatus = orders.find(o => o.id === orderId)?.status;
    // Optimistic update — UI changes instantly, API fires in background
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    orderService.updateOrder(restaurant.id, orderId, { status: newStatus }).catch((error) => {
      // Revert on failure
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: prevStatus } : o));
      toast.error('Failed to update order status: ' + error.message);
    });
  };

  const handleGenerateBill = (order) => {
    setBillTriggerOrder(order);
    setShowBillModal(true);
  };

  const handleBillCreated = () => {
    // Bill creation doesn't change order data in our state — just refresh billing tab
    setBillingRefreshKey(k => k + 1);
  };

  const pendingOrderCount = orders.filter(o => o.status === 'pending').length;
  const orderCounts = pendingOrderCount > 0 ? { orders: pendingOrderCount } : {};

  const handleTabChange = (tabId) => {
    if (tabId === 'settings') {
      setPrevTab(activeTab); // Remember where the user was
      setShowSettings(true);
      return;
    }
    setActiveTab(tabId);
    setShowSettings(false);
    setShowForm(false);
    setEditingItem(null);
    setEditingTable(null);
    setEditingOrder(null);
    setEditingStaff(null);
  };

  const closeSettings = () => {
    setShowSettings(false);
    setActiveTab(prevTab); // Go back to whatever tab they were on
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!restaurant) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, p: 3 }}>
        <Typography color="text.secondary">No restaurant assigned to your account. Please contact Super Admin.</Typography>
        <Button variant="contained" color="error" onClick={logout}>Logout</Button>
      </Box>
    );
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      restaurantName={restaurant.name}
      userName={user?.name}
      onLogout={logout}
      orderCounts={orderCounts}
      notificationCount={staffCallAlerts.length}
      connected={true}
    >
      {/* Staff call alerts overlay */}
      <Backdrop
        open={staffCallAlerts.length > 0}
        sx={{ zIndex: 1500, backdropFilter: 'blur(4px)', p: 3, alignItems: 'center', overflow: 'auto' }}
      >
        <Stack direction="row" flexWrap="wrap" justifyContent="center" alignItems="flex-start" gap={2} sx={{ maxWidth: 820 }}>
          {staffCallAlerts.map((alert) => (
            <Card
              key={alert.id}
              sx={{
                p: { xs: 3, sm: '2rem 2.5rem' },
                textAlign: 'center',
                borderRadius: 3,
                maxWidth: 380,
                flex: '1 1 320px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                '@keyframes bellRing': { '0%': { transform: 'rotate(-12deg)' }, '100%': { transform: 'rotate(12deg)' } },
              }}
            >
              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', bgcolor: '#FEF3C7', color: '#D97706', mb: 1.5, animation: 'bellRing 0.6s ease-in-out infinite alternate' }}>
                <Icon icon="mdi:bell-ring" width={48} />
              </Box>
              <Typography variant="overline" color="text.secondary" fontWeight={600} display="block" mb={1}>
                Staff Assistance Requested
              </Typography>
              <Typography variant="h4" fontWeight={800} mb={0.5}>
                Table {alert.tableNumber}
              </Typography>
              {alert.customerName && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: 'grey.100', px: 2, py: 0.75, borderRadius: 4, mb: 1.5 }}>
                  <Icon icon="mdi:account" width={18} color="#6B7280" />
                  <Typography variant="body1" color="text.secondary">{alert.customerName}</Typography>
                </Box>
              )}
              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  startIcon={<Icon icon="mdi:volume-off" width={18} />}
                  onClick={() => {
                    if (staffCallRingsRef.current[alert.id]) {
                      staffCallRingsRef.current[alert.id].stop();
                      delete staffCallRingsRef.current[alert.id];
                    }
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  Silence
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Icon icon="mdi:check" width={18} />}
                  onClick={() => {
                    if (staffCallRingsRef.current[alert.id]) {
                      staffCallRingsRef.current[alert.id].stop();
                      delete staffCallRingsRef.current[alert.id];
                    }
                    staffCallTablesRef.current.delete(alert.tableNumber);
                    setStaffCallAlerts(prev => prev.filter(a => a.id !== alert.id));
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  Dismiss
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Backdrop>

      {/* Settings modal */}
      <Dialog
        open={showSettings}
        onClose={closeSettings}
        fullScreen
        sx={{ zIndex: 1200 }}
      >
        <Settings
          onClose={closeSettings}
          onSettingsSaved={(updatedSettings) => {
            setRestaurantSettings(updatedSettings);
            // Sync restaurant name/phone/address so dashboard header updates immediately
            if (updatedSettings.restaurantName) {
              setRestaurant(prev => ({
                ...prev,
                name: updatedSettings.restaurantName,
                address: updatedSettings.address || prev.address,
                phone: updatedSettings.phone || prev.phone,
              }));
            }
          }}
          restaurant={restaurant}
          settings={restaurantSettings}
        />
      </Dialog>

      {activeTab === 'menu' && (
          <MenuSection
            menuItems={menuItems}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            restaurantFoodType={restaurant?.foodType}
            showForm={showForm}
            editingItem={editingItem}
            onAdd={() => { setEditingItem(null); setShowForm(true); }}
            onEdit={handleEdit}
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'tables' && (
          <TablesSection
            tables={tables}
            expandedQRCodes={expandedQRCodes}
            setExpandedQRCodes={setExpandedQRCodes}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            showForm={showForm}
            editingTable={editingTable}
            onAdd={() => { setEditingTable(null); setShowForm(true); }}
            onEdit={handleEditTable}
            onSave={handleSaveTable}
            onCancel={handleCancelEdit}
            onDelete={handleDeleteTable}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersSection
            orders={orders}
            orderStatusFilter={orderStatusFilter}
            setOrderStatusFilter={setOrderStatusFilter}
            orderSearchQuery={orderSearchQuery}
            setOrderSearchQuery={setOrderSearchQuery}
            restaurantId={restaurant.id}
            tables={tables}
            menuItems={menuItems}
            showForm={showForm}
            editingOrder={editingOrder}
            onAdd={() => { setEditingOrder(null); setShowForm(true); }}
            onEdit={handleEditOrder}
            onSave={handleSaveOrder}
            onCancel={handleCancelEdit}
            onDelete={handleDeleteOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onGenerateBill={handleGenerateBill}
          />
        )}

        {activeTab === 'billing' && (
          <BillingTab
            restaurantId={restaurant.id}
            restaurant={restaurant}
            toast={toast}
            refreshTrigger={billingRefreshKey}
            settings={restaurantSettings}
          />
        )}

        {activeTab === 'staff' && (
          <StaffSection
            staff={staff}
            staffStatusFilter={staffStatusFilter}
            setStaffStatusFilter={setStaffStatusFilter}
            showForm={showForm}
            editingStaff={editingStaff}
            onAdd={() => { setEditingStaff(null); setShowForm(true); }}
            onEdit={handleEditStaff}
            onSave={handleSaveStaff}
            onCancel={handleCancelEdit}
            onDelete={handleDeleteStaff}
          />
        )}

        {activeTab === 'analytics' && (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight={700}>Analytics</Typography>
              <Button variant="outlined" onClick={refreshAnalytics} startIcon={<Icon icon="mdi:refresh" width={18} />}>
                Refresh
              </Button>
            </Stack>
            <AnalyticsDashboard analytics={analytics} />
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <Typography variant="h5" fontWeight={700} mb={2}>Restaurant Profile</Typography>
            <RestaurantProfileForm
              restaurant={restaurant}
              settings={restaurantSettings}
              onSave={handleSaveProfile}
            />
          </>
        )}

        {activeTab === 'preview' && (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1} mb={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>User Preview</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  See how your menu appears to customers. Changes made to menu items, settings, or discounts will be reflected here.
                </Typography>
              </Box>
              <Button variant="outlined" onClick={refreshPreview} startIcon={<Icon icon="mdi:refresh" width={18} />} sx={{ flexShrink: 0 }}>
                Refresh
              </Button>
            </Stack>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              <MenuPreview restaurant={restaurant} settings={restaurantSettings} menuItems={menuItems} categories={categories} />
            </Paper>
          </>
        )}

      {showBillModal && restaurant && billTriggerOrder && (
        <GenerateBillModal
          restaurantId={restaurant.id}
          triggerOrder={billTriggerOrder}
          onClose={() => { setShowBillModal(false); setBillTriggerOrder(null); }}
          onBillCreated={handleBillCreated}
          toast={toast}
          settings={restaurantSettings}
        />
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </DashboardLayout>
  );
};
