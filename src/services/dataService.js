// Data service for reading JSON files and managing CRUD operations
// For writes, we use localStorage as a fallback since static sites can't write to files

const STORAGE_PREFIX = 'goresto_';

// Helper to get data from localStorage or fetch from JSON
async function getData(key) {
  // Check localStorage first (for modified data)
  const stored = localStorage.getItem(STORAGE_PREFIX + key);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Otherwise fetch from JSON file
  try {
    const response = await fetch(`/data/${key}.json`);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return [];
  }
}

// Helper to save data to localStorage
function saveData(key, data) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

// Users Service
export const userService = {
  async getAll() {
    return await getData('users');
  },
  
  async getByEmail(email) {
    const users = await this.getAll();
    return users.find(u => u.email === email);
  },
  
  async create(user) {
    const users = await this.getAll();
    const newUser = {
      ...user,
      id: `user-${Date.now()}`,
    };
    users.push(newUser);
    saveData('users', users);
    return newUser;
  },
  
  async update(id, updates) {
    const users = await this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...updates };
    saveData('users', users);
    return users[index];
  },
};

// Restaurants Service
export const restaurantService = {
  async getAll() {
    return await getData('restaurants');
  },
  
  async getById(id) {
    const restaurants = await this.getAll();
    return restaurants.find(r => r.id === id);
  },
  
  async getByAdminId(adminId) {
    const restaurants = await this.getAll();
    return restaurants.find(r => r.adminId === adminId);
  },
  
  async getByUserId(userId, userRestaurantId) {
    const restaurants = await this.getAll();
    // First check if user has restaurantId and match by restaurant id
    if (userRestaurantId) {
      const restaurant = restaurants.find(r => r.id === userRestaurantId);
      if (restaurant) return restaurant;
    }
    // Fallback: check if restaurant.adminId matches userId
    return restaurants.find(r => r.adminId === userId);
  },
  
  async create(restaurant) {
    const restaurants = await this.getAll();
    const restaurantId = `rest-${Date.now()}`;
    const newRestaurant = {
      ...restaurant,
      id: restaurantId,
      qrCode: `/menu/${restaurantId}`,
    };
    restaurants.push(newRestaurant);
    saveData('restaurants', restaurants);
    return newRestaurant;
  },
  
  async update(id, updates) {
    const restaurants = await this.getAll();
    const index = restaurants.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Restaurant not found');
    restaurants[index] = { ...restaurants[index], ...updates };
    saveData('restaurants', restaurants);
    return restaurants[index];
  },
  
  async delete(id) {
    const restaurants = await this.getAll();
    const filtered = restaurants.filter(r => r.id !== id);
    saveData('restaurants', filtered);
  },
};

// Menus Service
export const menuService = {
  async getAll() {
    return await getData('menus');
  },
  
  async getByRestaurantId(restaurantId) {
    const menus = await this.getAll();
    return menus.find(m => m.restaurantId === restaurantId);
  },
  
  async getMenuItems(restaurantId) {
    const menu = await this.getByRestaurantId(restaurantId);
    return menu ? menu.items : [];
  },
  
  async createMenu(restaurantId) {
    const menus = await this.getAll();
    const newMenu = {
      restaurantId,
      items: [],
    };
    menus.push(newMenu);
    saveData('menus', menus);
    return newMenu;
  },
  
  async addMenuItem(restaurantId, item) {
    let menu = await this.getByRestaurantId(restaurantId);
    if (!menu) {
      menu = await this.createMenu(restaurantId);
    }
    
    const menus = await this.getAll();
    const menuIndex = menus.findIndex(m => m.restaurantId === restaurantId);
    
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    
    menus[menuIndex].items.push(newItem);
    saveData('menus', menus);
    return newItem;
  },
  
  async updateMenuItem(restaurantId, itemId, updates) {
    const menus = await this.getAll();
    const menuIndex = menus.findIndex(m => m.restaurantId === restaurantId);
    if (menuIndex === -1) throw new Error('Menu not found');
    
    const itemIndex = menus[menuIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) throw new Error('Menu item not found');
    
    const existingItem = menus[menuIndex].items[itemIndex];
    menus[menuIndex].items[itemIndex] = {
      ...existingItem,
      ...updates,
      updatedAt: new Date().toISOString(),
      // Preserve createdAt if it exists
      createdAt: existingItem.createdAt || new Date().toISOString(),
    };
    saveData('menus', menus);
    return menus[menuIndex].items[itemIndex];
  },
  
  async deleteMenuItem(restaurantId, itemId) {
    const menus = await this.getAll();
    const menuIndex = menus.findIndex(m => m.restaurantId === restaurantId);
    if (menuIndex === -1) throw new Error('Menu not found');
    
    menus[menuIndex].items = menus[menuIndex].items.filter(i => i.id !== itemId);
    saveData('menus', menus);
  },
  
  async getCategories(restaurantId) {
    const items = await this.getMenuItems(restaurantId);
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    return categories.sort();
  },
};

// Tables Service
export const tableService = {
  async getAll() {
    return await getData('tables');
  },
  
  async getByRestaurantId(restaurantId) {
    const tables = await this.getAll();
    return tables.find(t => t.restaurantId === restaurantId);
  },
  
  async getTables(restaurantId) {
    const tableData = await this.getByRestaurantId(restaurantId);
    return tableData ? tableData.tables : [];
  },
  
  async createTableData(restaurantId) {
    const tables = await this.getAll();
    const newTableData = {
      restaurantId,
      tables: [],
    };
    tables.push(newTableData);
    saveData('tables', tables);
    return newTableData;
  },
  
  async addTable(restaurantId, table) {
    let tableData = await this.getByRestaurantId(restaurantId);
    if (!tableData) {
      tableData = await this.createTableData(restaurantId);
    }
    
    const allTables = await this.getAll();
    const tableIndex = allTables.findIndex(t => t.restaurantId === restaurantId);
    
    const newTable = {
      ...table,
      id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    allTables[tableIndex].tables.push(newTable);
    saveData('tables', allTables);
    return newTable;
  },
  
  async updateTable(restaurantId, tableId, updates) {
    const allTables = await this.getAll();
    const tableIndex = allTables.findIndex(t => t.restaurantId === restaurantId);
    if (tableIndex === -1) throw new Error('Table data not found');
    
    const table = allTables[tableIndex].tables.find(t => t.id === tableId);
    if (!table) throw new Error('Table not found');
    
    const tableItemIndex = allTables[tableIndex].tables.findIndex(t => t.id === tableId);
    allTables[tableIndex].tables[tableItemIndex] = {
      ...allTables[tableIndex].tables[tableItemIndex],
      ...updates,
    };
    saveData('tables', allTables);
    return allTables[tableIndex].tables[tableItemIndex];
  },
  
  async deleteTable(restaurantId, tableId) {
    const allTables = await this.getAll();
    const tableIndex = allTables.findIndex(t => t.restaurantId === restaurantId);
    if (tableIndex === -1) throw new Error('Table data not found');
    
    allTables[tableIndex].tables = allTables[tableIndex].tables.filter(t => t.id !== tableId);
    saveData('tables', allTables);
  },
};

// Orders Service
export const orderService = {
  async getAll() {
    return await getData('orders');
  },
  
  async getByRestaurantId(restaurantId) {
    const orders = await this.getAll();
    return orders.find(o => o.restaurantId === restaurantId);
  },
  
  async getOrders(restaurantId) {
    const orderData = await this.getByRestaurantId(restaurantId);
    const orders = orderData ? orderData.orders : [];
    // Sort by createdAt descending (latest first)
    return orders.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  },
  
  async getOrdersByCustomer(restaurantId, customerName, customerMobile) {
    const orders = await this.getOrders(restaurantId);
    // Case-insensitive name match and exact mobile match
    return orders.filter(order => {
      const nameMatch = order.customerName && 
        order.customerName.toLowerCase().trim() === customerName.toLowerCase().trim();
      const mobileMatch = order.customerMobile && 
        order.customerMobile.trim() === customerMobile.trim();
      return nameMatch && mobileMatch;
    });
  },
  
  async createOrderData(restaurantId) {
    const orders = await this.getAll();
    const newOrderData = {
      restaurantId,
      orders: [],
    };
    orders.push(newOrderData);
    saveData('orders', orders);
    return newOrderData;
  },
  
  async addOrder(restaurantId, order) {
    let orderData = await this.getByRestaurantId(restaurantId);
    if (!orderData) {
      orderData = await this.createOrderData(restaurantId);
    }
    
    const allOrders = await this.getAll();
    const orderIndex = allOrders.findIndex(o => o.restaurantId === restaurantId);
    
    const newOrder = {
      ...order,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: order.status || 'pending',
    };
    
    allOrders[orderIndex].orders.push(newOrder);
    saveData('orders', allOrders);
    return newOrder;
  },
  
  async updateOrder(restaurantId, orderId, updates) {
    const allOrders = await this.getAll();
    const orderIndex = allOrders.findIndex(o => o.restaurantId === restaurantId);
    if (orderIndex === -1) throw new Error('Order data not found');
    
    const order = allOrders[orderIndex].orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    
    const orderItemIndex = allOrders[orderIndex].orders.findIndex(o => o.id === orderId);
    allOrders[orderIndex].orders[orderItemIndex] = {
      ...allOrders[orderIndex].orders[orderItemIndex],
      ...updates,
    };
    saveData('orders', allOrders);
    return allOrders[orderIndex].orders[orderItemIndex];
  },
  
  async deleteOrder(restaurantId, orderId) {
    const allOrders = await this.getAll();
    const orderIndex = allOrders.findIndex(o => o.restaurantId === restaurantId);
    if (orderIndex === -1) throw new Error('Order data not found');
    
    allOrders[orderIndex].orders = allOrders[orderIndex].orders.filter(o => o.id !== orderId);
    saveData('orders', allOrders);
  },
};

// Settings Service
export const settingsService = {
  async getAll() {
    return await getData('settings');
  },
  
  async getByRestaurantId(restaurantId) {
    const settings = await this.getAll();
    return settings.find(s => s.restaurantId === restaurantId);
  },
  
  async getSettings(restaurantId) {
    const settingsData = await this.getByRestaurantId(restaurantId);
    return settingsData || null;
  },
  
  async createSettings(restaurantId, settings) {
    const allSettings = await this.getAll();
    const newSettings = {
      restaurantId,
      ...settings,
    };
    allSettings.push(newSettings);
    saveData('settings', allSettings);
    return newSettings;
  },
  
  async updateSettings(restaurantId, updates) {
    const allSettings = await this.getAll();
    const settingsIndex = allSettings.findIndex(s => s.restaurantId === restaurantId);
    
    if (settingsIndex === -1) {
      // Create if doesn't exist
      return await this.createSettings(restaurantId, updates);
    }
    
    allSettings[settingsIndex] = {
      ...allSettings[settingsIndex],
      ...updates,
    };
    saveData('settings', allSettings);
    return allSettings[settingsIndex];
  },
};

// Reviews Service
export const reviewService = {
  async getAll() {
    return await getData('reviews');
  },

  async getByRestaurantId(restaurantId) {
    const reviews = await this.getAll();
    return reviews.find(r => r.restaurantId === restaurantId);
  },

  async getReviews(restaurantId) {
    const reviewData = await this.getByRestaurantId(restaurantId);
    const reviews = reviewData ? reviewData.reviews : [];
    // Sort by createdAt descending (latest first)
    return reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  },

  async getReviewsByMenuItem(restaurantId, menuItemId) {
    const reviews = await this.getReviews(restaurantId);
    return reviews.filter(r => r.menuItemId === menuItemId);
  },

  async createReviewData(restaurantId) {
    const allReviews = await this.getAll();
    const newReviewData = {
      restaurantId,
      reviews: [],
    };
    allReviews.push(newReviewData);
    saveData('reviews', allReviews);
    return newReviewData;
  },

  async addReview(restaurantId, review) {
    let reviewData = await this.getByRestaurantId(restaurantId);
    if (!reviewData) {
      reviewData = await this.createReviewData(restaurantId);
    }

    const allReviews = await this.getAll();
    const reviewIndex = allReviews.findIndex(r => r.restaurantId === restaurantId);

    const newReview = {
      ...review,
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    allReviews[reviewIndex].reviews.push(newReview);
    saveData('reviews', allReviews);

    // Update menu item rating
    await this.updateMenuItemRating(restaurantId, review.menuItemId);

    return newReview;
  },

  async updateMenuItemRating(restaurantId, menuItemId) {
    const reviews = await this.getReviewsByMenuItem(restaurantId, menuItemId);
    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update the menu item with new rating
    const menus = await getData('menus');
    const menuIndex = menus.findIndex(m => m.restaurantId === restaurantId);
    if (menuIndex === -1) return;

    const itemIndex = menus[menuIndex].items.findIndex(i => i.id === menuItemId);
    if (itemIndex === -1) return;

    menus[menuIndex].items[itemIndex].rating = Math.round(avgRating * 10) / 10;
    menus[menuIndex].items[itemIndex].reviewCount = reviews.length;
    saveData('menus', menus);
  },

  async deleteReview(restaurantId, reviewId) {
    const allReviews = await this.getAll();
    const reviewIndex = allReviews.findIndex(r => r.restaurantId === restaurantId);
    if (reviewIndex === -1) throw new Error('Review data not found');

    const review = allReviews[reviewIndex].reviews.find(r => r.id === reviewId);
    const menuItemId = review?.menuItemId;

    allReviews[reviewIndex].reviews = allReviews[reviewIndex].reviews.filter(r => r.id !== reviewId);
    saveData('reviews', allReviews);

    // Update menu item rating if we have the menuItemId
    if (menuItemId) {
      await this.updateMenuItemRating(restaurantId, menuItemId);
    }
  },
};

// Analytics Service
export const analyticsService = {
  async getAll() {
    return await getData('analytics');
  },

  async getByRestaurantId(restaurantId) {
    const analytics = await this.getAll();
    return analytics.find(a => a.restaurantId === restaurantId);
  },

  async getAnalytics(restaurantId) {
    // Try to get stored analytics first
    let analyticsData = await this.getByRestaurantId(restaurantId);

    // Calculate real-time stats from orders
    const orders = await orderService.getOrders(restaurantId);
    const today = new Date().toDateString();

    const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'served');

    // Calculate order status distribution
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate revenue
    const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);
    const revenueTotal = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Get popular items from orders
    const itemCounts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemCounts[item.menuItemId || item.name]) {
          itemCounts[item.menuItemId || item.name] = {
            name: item.name,
            orders: 0,
            revenue: 0,
          };
        }
        itemCounts[item.menuItemId || item.name].orders += item.quantity;
        itemCounts[item.menuItemId || item.name].revenue += item.price * item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    return {
      stats: {
        ordersToday: ordersToday.length,
        ordersTotal: orders.length,
        revenueToday: Math.round(revenueToday * 100) / 100,
        revenueTotal: Math.round(revenueTotal * 100) / 100,
        averageOrderValue: orders.length > 0
          ? Math.round((revenueTotal / orders.length) * 100) / 100
          : 0,
        ...(analyticsData?.stats || {}),
      },
      popularItems,
      ordersByStatus,
      recentActivity: analyticsData?.recentActivity || [],
    };
  },
};

// Staff Service
export const staffService = {
  async getAll() {
    return await getData('staff');
  },
  
  async getByRestaurantId(restaurantId) {
    const allStaff = await this.getAll();
    return allStaff.find(s => s.restaurantId === restaurantId);
  },
  
  async getStaff(restaurantId) {
    const staffData = await this.getByRestaurantId(restaurantId);
    return staffData ? staffData.staff : [];
  },
  
  async createStaffData(restaurantId) {
    const allStaff = await this.getAll();
    const newStaffData = {
      restaurantId,
      staff: [],
    };
    allStaff.push(newStaffData);
    saveData('staff', allStaff);
    return newStaffData;
  },
  
  async addStaff(restaurantId, staffMember) {
    let staffData = await this.getByRestaurantId(restaurantId);
    if (!staffData) {
      staffData = await this.createStaffData(restaurantId);
    }
    
    const allStaff = await this.getAll();
    const staffIndex = allStaff.findIndex(s => s.restaurantId === restaurantId);
    
    const now = new Date().toISOString();
    const newStaffMember = {
      ...staffMember,
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      status: staffMember.status || 'active',
    };
    
    allStaff[staffIndex].staff.push(newStaffMember);
    saveData('staff', allStaff);
    return newStaffMember;
  },
  
  async updateStaff(restaurantId, staffId, updates) {
    const allStaff = await this.getAll();
    const staffIndex = allStaff.findIndex(s => s.restaurantId === restaurantId);
    if (staffIndex === -1) throw new Error('Staff data not found');
    
    const staffMemberIndex = allStaff[staffIndex].staff.findIndex(s => s.id === staffId);
    if (staffMemberIndex === -1) throw new Error('Staff member not found');
    
    const existingStaff = allStaff[staffIndex].staff[staffMemberIndex];
    allStaff[staffIndex].staff[staffMemberIndex] = {
      ...existingStaff,
      ...updates,
      updatedAt: new Date().toISOString(),
      createdAt: existingStaff.createdAt || new Date().toISOString(),
    };
    saveData('staff', allStaff);
    return allStaff[staffIndex].staff[staffMemberIndex];
  },
  
  async deleteStaff(restaurantId, staffId) {
    const allStaff = await this.getAll();
    const staffIndex = allStaff.findIndex(s => s.restaurantId === restaurantId);
    if (staffIndex === -1) throw new Error('Staff data not found');
    
    allStaff[staffIndex].staff = allStaff[staffIndex].staff.filter(s => s.id !== staffId);
    saveData('staff', allStaff);
  },
};

