const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Token Management ──────────────────────────────────

let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => { accessToken = token; };

const getRefreshToken = () => localStorage.getItem('goresto_refreshToken');
const setRefreshToken = (token) => {
  if (token) localStorage.setItem('goresto_refreshToken', token);
  else localStorage.removeItem('goresto_refreshToken');
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem('goresto_refreshToken');
  localStorage.removeItem('goresto_user');
};

// ─── API Client ─────────────────────────────────────────

let isRefreshing = false;
let refreshPromise = null;

const request = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // Try refresh on 401
  if (res.status === 401 && getRefreshToken() && !options._isRetry) {
    await refreshTokens();
    headers['Authorization'] = `Bearer ${accessToken}`;
    res = await fetch(url, { ...options, headers, _isRetry: true });
  }

  const data = await res.json();

  if (!data.success) {
    const err = new Error(data.error?.message || 'Request failed');
    err.code = data.error?.code;
    err.details = data.error?.details;
    err.status = res.status;
    throw err;
  }

  return data.data;
};

const refreshTokens = async () => {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const token = getRefreshToken();
      if (!token) throw new Error('No refresh token');

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      });

      const data = await res.json();
      if (!data.success) throw new Error('Refresh failed');

      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
    } catch {
      clearTokens();
      window.location.href = '/';
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const get = (path) => request(path);
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const patch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

// Download a binary response (PDF, etc.) — returns a Blob
const downloadBlob = async (path) => {
  const url = `${API_BASE}${path}`;
  const headers = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(url, { headers });

  if (res.status === 401 && getRefreshToken()) {
    await refreshTokens();
    headers['Authorization'] = `Bearer ${accessToken}`;
    res = await fetch(url, { headers });
  }

  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }

  return res.blob();
};

// ─── Auth Service ────────────────────────────────────────

export const authService = {
  async login(email, password, role) {
    const data = await post('/auth/login', { email, password, role });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('goresto_user', JSON.stringify(data.user));
    return data.user;
  },

  async logout() {
    try {
      const token = getRefreshToken();
      if (token) await post('/auth/logout', { refreshToken: token });
    } catch {
      // Ignore logout errors
    }
    clearTokens();
  },

  async getMe() {
    return get('/auth/me');
  },

  async restoreSession() {
    const token = getRefreshToken();
    if (!token) return null;

    try {
      await refreshTokens();
      const user = await get('/auth/me');
      localStorage.setItem('goresto_user', JSON.stringify(user));
      return user;
    } catch {
      clearTokens();
      return null;
    }
  },
};

// ─── User Service ────────────────────────────────────────

export const userService = {
  async getAll() {
    return get('/users');
  },

  async getByEmail(email) {
    const users = await get(`/users?email=${encodeURIComponent(email)}`);
    return Array.isArray(users) ? users[0] : users;
  },

  async create(user) {
    return post('/users', user);
  },

  async update(id, updates) {
    return patch(`/users/${id}`, updates);
  },
};

// ─── Restaurant Service ─────────────────────────────────

export const restaurantService = {
  async getAll() {
    return get('/restaurants');
  },

  async getById(id) {
    try {
      return await get(`/restaurants/${id}`);
    } catch {
      // Fallback to public endpoint for unauthenticated users
      return get(`/public/restaurants/${id}`);
    }
  },

  async getByAdminId(adminId) {
    return get('/restaurants/mine');
  },

  async getByUserId(userId, userRestaurantId) {
    return get('/restaurants/mine');
  },

  async create(restaurant) {
    return post('/restaurants', restaurant);
  },

  async update(id, updates) {
    return patch(`/restaurants/${id}`, updates);
  },

  async delete(id) {
    return del(`/restaurants/${id}`);
  },
};

// ─── Menu Service ────────────────────────────────────────

export const menuService = {
  async getAll() {
    // Not used in current frontend, but kept for compatibility
    return [];
  },

  async getByRestaurantId(restaurantId) {
    const items = await get(`/restaurants/${restaurantId}/menu-items`);
    return { restaurantId, items };
  },

  async getMenuItems(restaurantId) {
    try {
      return await get(`/restaurants/${restaurantId}/menu-items`);
    } catch {
      // Fallback to public for unauthenticated
      return get(`/public/restaurants/${restaurantId}/menu`);
    }
  },

  async addMenuItem(restaurantId, item) {
    return post(`/restaurants/${restaurantId}/menu-items`, item);
  },

  async updateMenuItem(restaurantId, itemId, updates) {
    return patch(`/restaurants/${restaurantId}/menu-items/${itemId}`, updates);
  },

  async deleteMenuItem(restaurantId, itemId) {
    return del(`/restaurants/${restaurantId}/menu-items/${itemId}`);
  },

  async getCategories(restaurantId) {
    try {
      return await get(`/restaurants/${restaurantId}/menu-items/categories`);
    } catch {
      return get(`/public/restaurants/${restaurantId}/menu/categories`);
    }
  },

  async createMenu(restaurantId) {
    // No longer needed — menus are implicit per restaurant
    return { restaurantId, items: [] };
  },
};

// ─── Table Service ───────────────────────────────────────

export const tableService = {
  async getAll() {
    return [];
  },

  async getByRestaurantId(restaurantId) {
    const tables = await get(`/restaurants/${restaurantId}/tables`);
    return { restaurantId, tables };
  },

  async getTables(restaurantId) {
    return get(`/restaurants/${restaurantId}/tables`);
  },

  async addTable(restaurantId, table) {
    return post(`/restaurants/${restaurantId}/tables`, table);
  },

  async updateTable(restaurantId, tableId, updates) {
    return patch(`/restaurants/${restaurantId}/tables/${tableId}`, updates);
  },

  async deleteTable(restaurantId, tableId) {
    return del(`/restaurants/${restaurantId}/tables/${tableId}`);
  },

  async createTableData(restaurantId) {
    return { restaurantId, tables: [] };
  },
};

// ─── Order Service ───────────────────────────────────────

export const orderService = {
  async getAll() {
    return [];
  },

  async getByRestaurantId(restaurantId) {
    const orders = await get(`/restaurants/${restaurantId}/orders`);
    return { restaurantId, orders };
  },

  async getOrders(restaurantId) {
    return get(`/restaurants/${restaurantId}/orders`);
  },

  async getOrdersByCustomer(restaurantId, customerName, customerMobile) {
    return get(`/public/restaurants/${restaurantId}/orders/status?customerName=${encodeURIComponent(customerName)}&customerMobile=${encodeURIComponent(customerMobile)}`);
  },

  async addOrder(restaurantId, order) {
    // Use public endpoint if no access token (customer placing order)
    if (!accessToken) {
      return post(`/public/restaurants/${restaurantId}/orders`, order);
    }
    return post(`/restaurants/${restaurantId}/orders`, order);
  },

  async updateOrder(restaurantId, orderId, updates) {
    return patch(`/restaurants/${restaurantId}/orders/${orderId}`, updates);
  },

  async deleteOrder(restaurantId, orderId) {
    return del(`/restaurants/${restaurantId}/orders/${orderId}`);
  },

  async createOrderData(restaurantId) {
    return { restaurantId, orders: [] };
  },
};

// ─── Staff Service ───────────────────────────────────────

export const staffService = {
  async getAll() {
    return [];
  },

  async getByRestaurantId(restaurantId) {
    const staff = await get(`/restaurants/${restaurantId}/staff`);
    return { restaurantId, staff };
  },

  async getStaff(restaurantId) {
    return get(`/restaurants/${restaurantId}/staff`);
  },

  async addStaff(restaurantId, staffMember) {
    return post(`/restaurants/${restaurantId}/staff`, staffMember);
  },

  async updateStaff(restaurantId, staffId, updates) {
    return patch(`/restaurants/${restaurantId}/staff/${staffId}`, updates);
  },

  async deleteStaff(restaurantId, staffId) {
    return del(`/restaurants/${restaurantId}/staff/${staffId}`);
  },

  async createStaffData(restaurantId) {
    return { restaurantId, staff: [] };
  },
};

// ─── Settings Service ────────────────────────────────────

export const settingsService = {
  async getAll() {
    return [];
  },

  async getByRestaurantId(restaurantId) {
    return get(`/restaurants/${restaurantId}/settings`);
  },

  async getSettings(restaurantId) {
    try {
      return await get(`/restaurants/${restaurantId}/settings`);
    } catch {
      return get(`/public/restaurants/${restaurantId}/settings`);
    }
  },

  async createSettings(restaurantId, settings) {
    return put(`/restaurants/${restaurantId}/settings`, settings);
  },

  async updateSettings(restaurantId, updates) {
    return put(`/restaurants/${restaurantId}/settings`, updates);
  },
};

// ─── Review Service ──────────────────────────────────────

export const reviewService = {
  async getAll() {
    return [];
  },

  async getByRestaurantId(restaurantId) {
    const reviews = await get(`/restaurants/${restaurantId}/reviews`);
    return { restaurantId, reviews };
  },

  async getReviews(restaurantId) {
    return get(`/restaurants/${restaurantId}/reviews`);
  },

  async getReviewsByMenuItem(restaurantId, menuItemId) {
    return get(`/public/restaurants/${restaurantId}/menu-items/${menuItemId}/reviews`);
  },

  async addReview(restaurantId, review) {
    return post(`/public/restaurants/${restaurantId}/reviews`, review);
  },

  async deleteReview(restaurantId, reviewId) {
    return del(`/restaurants/${restaurantId}/reviews/${reviewId}`);
  },

  async createReviewData(restaurantId) {
    return { restaurantId, reviews: [] };
  },

  async updateMenuItemRating(restaurantId, menuItemId) {
    // Rating is now updated server-side automatically
  },
};

// ─── Kitchen Display Service ────────────────────────────

export const kitchenService = {
  async verifyPin(restaurantId, pin) {
    return post(`/public/restaurants/${restaurantId}/kitchen/verify-pin`, { pin });
  },
};

// ─── Analytics Service ───────────────────────────────────

export const analyticsService = {
  async getAll() {
    return [];
  },

  async getByRestaurantId(restaurantId) {
    return get(`/restaurants/${restaurantId}/analytics`);
  },

  async getAnalytics(restaurantId) {
    return get(`/restaurants/${restaurantId}/analytics`);
  },
};

// ─── Bill Service ───────────────────────────────────────

export const billService = {
  async getBills(restaurantId, query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, v); });
    const qs = params.toString();
    return get(`/restaurants/${restaurantId}/bills${qs ? '?' + qs : ''}`);
  },

  async getBillById(restaurantId, billId) {
    return get(`/restaurants/${restaurantId}/bills/${billId}`);
  },

  async getUnbilledOrders(restaurantId, tableNumber) {
    const qs = tableNumber ? `?tableNumber=${encodeURIComponent(tableNumber)}` : '';
    return get(`/restaurants/${restaurantId}/bills/unbilled-orders${qs}`);
  },

  async getNextNumber(restaurantId) {
    return get(`/restaurants/${restaurantId}/bills/next-number`);
  },

  async previewCalculation(restaurantId, data) {
    return post(`/restaurants/${restaurantId}/bills/preview-calculation`, data);
  },

  async createBill(restaurantId, data) {
    return post(`/restaurants/${restaurantId}/bills`, data);
  },

  async updatePayment(restaurantId, billId, data) {
    return patch(`/restaurants/${restaurantId}/bills/${billId}/payment`, data);
  },

  async cancelBill(restaurantId, billId, data) {
    return patch(`/restaurants/${restaurantId}/bills/${billId}/cancel`, data);
  },

  async getSummary(restaurantId, from, to) {
    return get(`/restaurants/${restaurantId}/bills/summary?from=${from}&to=${to}`);
  },

  async downloadPdf(restaurantId, billId) {
    return downloadBlob(`/restaurants/${restaurantId}/bills/${billId}/pdf`);
  },
};

// ─── Discount Preset Service ────────────────────────────

export const discountPresetService = {
  async getAll(restaurantId) {
    return get(`/restaurants/${restaurantId}/discount-presets`);
  },

  async getActive(restaurantId) {
    return get(`/restaurants/${restaurantId}/discount-presets/active`);
  },

  async getById(restaurantId, presetId) {
    return get(`/restaurants/${restaurantId}/discount-presets/${presetId}`);
  },

  async create(restaurantId, data) {
    return post(`/restaurants/${restaurantId}/discount-presets`, data);
  },

  async update(restaurantId, presetId, data) {
    return patch(`/restaurants/${restaurantId}/discount-presets/${presetId}`, data);
  },

  async remove(restaurantId, presetId) {
    return del(`/restaurants/${restaurantId}/discount-presets/${presetId}`);
  },
};
