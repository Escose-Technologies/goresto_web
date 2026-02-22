import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { restaurantService, menuService, settingsService, orderService, reviewService } from '../services/apiService';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../components/ui/Toast';
import { SearchBar, FilterPills } from '../components/ui';
import { BottomSheet } from '../components/ui/BottomSheet';
import { DietaryBadge, DietaryLabels, AllergenLabels } from '../components/menu/DietaryBadges';
import { SpiceIndicator } from '../components/menu/SpiceLevel';
import { RatingDisplay } from '../components/menu/Rating';
import { ReviewSection } from '../components/menu/ReviewSection';
import './PublicMenu.css';

export const PublicMenu = () => {
  const toast = useToast();
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  const [restaurant, setRestaurant] = useState(null);
  const [settings, setSettings] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [statusCheckName, setStatusCheckName] = useState('');
  const [statusCheckMobile, setStatusCheckMobile] = useState('');
  const [customerOrders, setCustomerOrders] = useState([]);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);

  // New states for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [itemReviews, setItemReviews] = useState({});

  const { joinPublic, onOrderUpdated, callStaff } = useSocket();

  // Call Staff state
  const [callStaffSent, setCallStaffSent] = useState(false);

  // Socket: join public room for real-time order status updates
  useEffect(() => {
    if (!restaurantId || customerOrders.length === 0) return;

    joinPublic(restaurantId);

    const cleanupUpdated = onOrderUpdated((order) => {
      setCustomerOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    return () => cleanupUpdated();
  }, [restaurantId, customerOrders.length, joinPublic, onOrderUpdated]);

  // Currency symbol mapping
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
  };

  const getCurrencySymbol = () => {
    if (settings?.currency && currencySymbols[settings.currency]) {
      return currencySymbols[settings.currency];
    }
    return '₹';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  const filterOptions = useMemo(() => {
    const options = [];
    const ft = restaurant?.foodType;

    // Dietary filters based on restaurant food type
    if (ft !== 'pure_veg') {
      // pure_veg only has veg items, so no dietary filter needed
      options.push({ id: 'veg', label: 'Veg', icon: <span className="filter-dot filter-dot-veg" /> });
    }
    if (ft === 'egg' || ft === 'non_veg' || ft === 'both') {
      options.push({ id: 'egg', label: 'Egg', icon: <span className="filter-dot filter-dot-egg" /> });
    }
    if (ft === 'non_veg' || ft === 'both') {
      options.push({ id: 'non-veg', label: 'Non-Veg', icon: <span className="filter-dot filter-dot-nonveg" /> });
    }

    // Common filters always shown
    options.push(
      { id: 'spicy', label: 'Spicy', icon: '🌶️' },
      { id: 'popular', label: 'Popular', icon: '⭐' },
      { id: 'new', label: 'New', icon: '✨' },
    );

    return options;
  }, [restaurant?.foodType]);

  useEffect(() => {
    loadMenuData();
  }, [restaurantId]);

  const loadMenuData = async () => {
    try {
      const restaurantData = await restaurantService.getById(restaurantId);
      if (restaurantData) {
        setRestaurant(restaurantData);

        const restaurantSettings = await settingsService.getSettings(restaurantId);
        setSettings(restaurantSettings);

        const items = await menuService.getMenuItems(restaurantId);
        const availableItems = items.filter(item => item.available);
        setMenuItems(availableItems);
        const cats = await menuService.getCategories(restaurantId);
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItemReviews = async (menuItemId) => {
    if (itemReviews[menuItemId]) return;
    try {
      const reviews = await reviewService.getReviewsByMenuItem(restaurantId, menuItemId);
      setItemReviews(prev => ({ ...prev, [menuItemId]: reviews }));
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = selectedCategory === 'All'
      ? menuItems
      : menuItems.filter(item => item.category === selectedCategory);

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (activeFilters.length > 0) {
      items = items.filter(item => {
        return activeFilters.every(filter => {
          if (filter === 'veg') {
            return item.dietary?.type === 'veg';
          }
          if (filter === 'egg') {
            return item.dietary?.type === 'egg';
          }
          if (filter === 'non-veg') {
            return item.dietary?.type === 'non-veg';
          }
          if (filter === 'spicy') {
            return item.dietary?.spiceLevel >= 2;
          }
          if (filter === 'popular') {
            return item.dietary?.labels?.includes('popular');
          }
          if (filter === 'new') {
            return item.dietary?.labels?.includes('new');
          }
          return true;
        });
      });
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery, activeFilters]);

  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  const addToCart = (item) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setSelectedItem(null);
  };

  const updateCartQuantity = (itemId, change) => {
    const newCart = cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean);
    setCart(newCart);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.warning('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!tableNumber) {
      toast.warning('Table number is required. Please access this menu through a table QR code.');
      return;
    }

    if (!customerName.trim() || !customerMobile.trim()) {
      toast.warning('Please enter your name and mobile number to place an order.');
      return;
    }

    try {
      const orderData = {
        tableNumber: tableNumber,
        items: cart.map(item => ({
          menuItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getCartTotal(),
        status: 'pending',
        notes: '',
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
      };

      await orderService.addOrder(restaurantId, orderData);
      setCart([]);
      setShowCart(false);
      setCustomerName('');
      setCustomerMobile('');
      setOrderPlaced(true);

      setTimeout(() => {
        setOrderPlaced(false);
      }, 5000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleCheckOrderStatus = async () => {
    if (!statusCheckName.trim() || !statusCheckMobile.trim()) {
      toast.warning('Please enter your name and mobile number to check order status.');
      return;
    }

    setStatusCheckLoading(true);
    try {
      const orders = await orderService.getOrdersByCustomer(
        restaurantId,
        statusCheckName.trim(),
        statusCheckMobile.trim()
      );
      setCustomerOrders(orders);
      if (orders.length === 0) {
        toast.info('No orders found with the provided name and mobile number.');
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      toast.error('Failed to check order status. Please try again.');
    } finally {
      setStatusCheckLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await reviewService.addReview(restaurantId, reviewData);
      // Reload reviews for this item
      const reviews = await reviewService.getReviewsByMenuItem(restaurantId, reviewData.menuItemId);
      setItemReviews(prev => ({ ...prev, [reviewData.menuItemId]: reviews }));
      // Reload menu to get updated rating
      await loadMenuData();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'accepted': 'status-accepted',
      'preparing': 'status-preparing',
      'prepared': 'status-prepared',
      'served': 'status-served',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'rejected': 'status-rejected',
      'on-hold': 'status-onhold',
      'ready': 'status-ready',
    };
    return statusMap[status] || 'status-pending';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'preparing': 'Preparing',
      'prepared': 'Prepared',
      'served': 'Served',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected',
      'on-hold': 'On Hold',
      'ready': 'Ready',
    };
    return statusMap[status] || status;
  };

  const handleCallStaff = async () => {
    if (callStaffSent) return;
    setCallStaffSent(true);
    try {
      await callStaff(restaurantId, tableNumber, customerName || undefined);
    } catch (err) {
      console.error('Failed to call staff:', err);
    }
    setTimeout(() => setCallStaffSent(false), 5000);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    loadItemReviews(item.id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, bgcolor: 'grey.50' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading menu...</Typography>
      </Box>
    );
  }

  if (!restaurant) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 1, p: 3, bgcolor: 'grey.50' }}>
        <Icon icon="mdi:alert-circle-outline" width={48} style={{ opacity: 0.4 }} />
        <Typography variant="h6" fontWeight={700}>Restaurant not found</Typography>
        <Typography variant="body2" color="text.secondary">The menu you're looking for doesn't exist.</Typography>
      </Box>
    );
  }

  return (
    <div className="public-menu-container">
      {orderPlaced && (
        <div className="order-success-banner">
          <Icon icon="mdi:check-circle" width={20} />
          <span>Order placed successfully! The restaurant will process your order shortly.</span>
        </div>
      )}

      {/* Restaurant Banner Image */}
      {restaurant.coverImage && (
        <div className="restaurant-banner">
          <img src={restaurant.coverImage} alt={restaurant.name} className="restaurant-banner-image" />
          <div className="restaurant-banner-overlay">
            {restaurant.logo && (
              <img src={restaurant.logo} alt={`${restaurant.name} logo`} className="restaurant-logo" />
            )}
          </div>
        </div>
      )}

      <header className="public-menu-header">
        <div className="restaurant-info">
          <h1>{settings?.restaurantName || restaurant.name}</h1>
          {tableNumber && (
            <div className="table-badge">
              Table {tableNumber}
            </div>
          )}
          <button
            className="check-status-btn"
            onClick={() => setShowStatusCheck(true)}
          >
            <Icon icon="mdi:information-outline" width={18} />
            Check Order Status
          </button>

          {settings?.allowCallStaff && tableNumber && (
            <button
              className={`call-staff-btn ${callStaffSent ? 'call-staff-sent' : ''}`}
              onClick={handleCallStaff}
              disabled={callStaffSent}
            >
              <Icon icon="mdi:bell-outline" width={18} />
              {callStaffSent ? 'Staff Notified!' : 'Call Staff'}
            </button>
          )}

          {settings?.discountText && (
            <div className="discount-banner">
              <Icon icon="mdi:tag-outline" width={20} />
              <span>{settings.discountText}</span>
            </div>
          )}

          <div className="restaurant-details">
            {settings?.address && (
              <div className="restaurant-detail-item">
                <Icon icon="mdi:map-marker-outline" width={16} />
                <span>{settings.address}</span>
              </div>
            )}

            {settings?.phone && (
              <div className="restaurant-detail-item">
                <Icon icon="mdi:phone-outline" width={16} />
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </div>
            )}

            {settings?.openingTime && settings?.closingTime && (
              <div className="restaurant-detail-item restaurant-hours">
                <Icon icon="mdi:clock-outline" width={16} />
                <span>
                  {formatTime(settings.openingTime)} - {formatTime(settings.closingTime)}
                </span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(restaurant.website || restaurant.socialLinks?.instagram || restaurant.socialLinks?.facebook || restaurant.socialLinks?.twitter) && (
            <div className="restaurant-social-links">
              {restaurant.website && (
                <a href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Website">
                  <Icon icon="mdi:web" width={18} />
                </a>
              )}
              {restaurant.socialLinks?.instagram && (
                <a href={restaurant.socialLinks.instagram.startsWith('http') ? restaurant.socialLinks.instagram : `https://instagram.com/${restaurant.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Instagram">
                  <Icon icon="mdi:instagram" width={18} />
                </a>
              )}
              {restaurant.socialLinks?.facebook && (
                <a href={restaurant.socialLinks.facebook.startsWith('http') ? restaurant.socialLinks.facebook : `https://facebook.com/${restaurant.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Facebook">
                  <Icon icon="mdi:facebook" width={18} />
                </a>
              )}
              {restaurant.socialLinks?.twitter && (
                <a href={restaurant.socialLinks.twitter.startsWith('http') ? restaurant.socialLinks.twitter : `https://twitter.com/${restaurant.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Twitter / X">
                  <Icon icon="ri:twitter-x-fill" width={18} />
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search menu..."
          showFilters={true}
          onFilterClick={() => setShowFilters(true)}
          filterCount={activeFilters.length}
        />
        <FilterPills
          filters={filterOptions}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
          onClearAll={handleClearFilters}
        />
      </div>

      {/* Cart Button */}
      {cart.length > 0 && (
        <div className="cart-button-container">
          <button className="cart-button" onClick={() => setShowCart(true)}>
            <Icon icon="mdi:cart-outline" width={24} />
            <span>Cart ({getCartItemCount()})</span>
            <span className="cart-total">{getCurrencySymbol()}{getCartTotal().toFixed(2)}</span>
          </button>
        </div>
      )}

      <div className="public-menu-content">
        {/* Category Chips */}
        {categories.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: 'auto',
              px: 2,
              py: 1.5,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <Chip
              label="All"
              variant={selectedCategory === 'All' ? 'filled' : 'outlined'}
              color={selectedCategory === 'All' ? 'primary' : 'default'}
              onClick={() => setSelectedCategory('All')}
              sx={{ fontWeight: selectedCategory === 'All' ? 600 : 400, flexShrink: 0 }}
            />
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                color={selectedCategory === category ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(category)}
                sx={{ fontWeight: selectedCategory === category ? 600 : 400, flexShrink: 0 }}
              />
            ))}
          </Stack>
        )}

        {filteredItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 3, color: 'text.secondary' }}>
            {searchQuery || activeFilters.length > 0 ? (
              <>
                <Typography mb={1}>No items match your search or filters.</Typography>
                <Button variant="outlined" size="small" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </>
            ) : (
              <Typography>No items available in this category.</Typography>
            )}
          </Box>
        ) : (
          <div className="menu-items-list">
            {filteredItems.map((item) => {
              const cartItem = cart.find(cartItem => cartItem.id === item.id);
              const itemQuantity = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={item.id}
                  className="public-menu-item"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="public-menu-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="public-menu-item-image-placeholder">
                        <Icon icon="mdi:silverware-fork-knife" width={24} />
                      </div>
                    )}
                  </div>
                  <div className="public-menu-item-details">
                    <div className="public-menu-item-header">
                      <div className="item-title-row">
                        <DietaryBadge type={item.dietary?.type} size="small" />
                        <h3>{item.name}</h3>
                      </div>
                      <span className="public-menu-item-price">
                        {getCurrencySymbol()}{item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="item-meta">
                      {item.rating > 0 && (
                        <RatingDisplay value={item.rating} reviewCount={item.reviewCount} />
                      )}
                      {item.dietary?.spiceLevel > 0 && (
                        <SpiceIndicator level={item.dietary.spiceLevel} />
                      )}
                    </div>

                    {item.dietary?.labels?.length > 0 && (
                      <DietaryLabels labels={item.dietary.labels} size="small" />
                    )}

                    {item.description && (
                      <p className="public-menu-item-description">{item.description}</p>
                    )}

                    <div
                      className="public-menu-item-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {itemQuantity > 0 ? (
                        <div className="item-quantity-controls">
                          <button
                            className="item-qty-btn"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="item-qty-display">{itemQuantity}</span>
                          <button
                            className="item-qty-btn"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-add-to-cart-inline"
                          onClick={() => addToCart(item)}
                        >
                          <Icon icon="mdi:plus" width={18} />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Detail Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name}
      >
        {selectedItem && (
          <div className="item-detail-content">
            <div className="item-detail-image">
              {selectedItem.image ? (
                <img src={selectedItem.image} alt={selectedItem.name} />
              ) : (
                <div className="item-detail-image-placeholder">
                  <Icon icon="mdi:silverware-fork-knife" width={32} />
                </div>
              )}
            </div>

            <div className="item-detail-info">
              <div className="item-detail-header">
                <DietaryBadge type={selectedItem.dietary?.type} showLabel />
                <span className="item-detail-price">
                  {getCurrencySymbol()}{selectedItem.price.toFixed(2)}
                </span>
              </div>

              <div className="item-detail-meta">
                {selectedItem.rating > 0 && (
                  <RatingDisplay value={selectedItem.rating} reviewCount={selectedItem.reviewCount} />
                )}
                {selectedItem.dietary?.spiceLevel > 0 && (
                  <SpiceIndicator level={selectedItem.dietary.spiceLevel} />
                )}
              </div>

              {selectedItem.dietary?.labels?.length > 0 && (
                <DietaryLabels labels={selectedItem.dietary.labels} />
              )}

              {selectedItem.description && (
                <p className="item-detail-description">{selectedItem.description}</p>
              )}

              {selectedItem.dietary?.allergens?.length > 0 && (
                <AllergenLabels allergens={selectedItem.dietary.allergens} />
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => addToCart(selectedItem)}
                sx={{ mt: 2 }}
              >
                Add to Cart - {getCurrencySymbol()}{selectedItem.price.toFixed(2)}
              </Button>
            </div>

            {/* Reviews Section */}
            <div className="item-reviews-section">
              <h3>Reviews</h3>
              <ReviewSection
                reviews={itemReviews[selectedItem.id] || []}
                menuItemId={selectedItem.id}
                onSubmitReview={handleSubmitReview}
              />
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Cart Bottom Sheet */}
      <BottomSheet
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title="Your Cart"
      >
        {tableNumber && (
          <div className="cart-table-info">
            <span>Table {tableNumber}</span>
          </div>
        )}
        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Typography color="text.secondary" mb={2}>Your cart is empty</Typography>
            <Button variant="outlined" onClick={() => setShowCart(false)}>Continue Shopping</Button>
          </Box>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">
                      {getCurrencySymbol()}{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => updateCartQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="cart-item-quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateCartQuantity(item.id, 1)}
                    >
                      +
                    </button>
                    <span className="cart-item-total">
                      {getCurrencySymbol()}{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <Stack spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Mobile Number"
                  type="tel"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Stack>
              <div className="cart-total-section">
                <strong>Total: {getCurrencySymbol()}{getCartTotal().toFixed(2)}</strong>
              </div>
              {!tableNumber && (
                <div className="cart-warning">
                  <p>Table number is required to place an order. Please access this menu through a table QR code.</p>
                </div>
              )}
              <Stack direction="row" spacing={1.5} mt={2}>
                <Button variant="outlined" fullWidth onClick={() => setShowCart(false)}>
                  Continue Shopping
                </Button>
                <Button variant="contained" fullWidth onClick={handlePlaceOrder} disabled={!tableNumber}>
                  Place Order
                </Button>
              </Stack>
            </div>
          </>
        )}
      </BottomSheet>

      {/* Order Status Check Bottom Sheet */}
      <BottomSheet
        isOpen={showStatusCheck}
        onClose={() => {
          setShowStatusCheck(false);
          setStatusCheckName('');
          setStatusCheckMobile('');
          setCustomerOrders([]);
        }}
        title="Check Order Status"
      >
        <Stack spacing={2} sx={{ px: 1, py: 1 }}>
          <TextField
            label="Your Name"
            value={statusCheckName}
            onChange={(e) => setStatusCheckName(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Mobile Number"
            type="tel"
            value={statusCheckMobile}
            onChange={(e) => setStatusCheckMobile(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleCheckOrderStatus}
            disabled={statusCheckLoading}
            startIcon={statusCheckLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {statusCheckLoading ? 'Checking...' : 'Check Status'}
          </Button>
        </Stack>
        {customerOrders.length > 0 && (
          <div className="customer-orders-list">
            <h3>Your Orders</h3>
            {customerOrders.map((order) => (
              <div key={order.id} className="customer-order-card">
                <div className="customer-order-header">
                  <div>
                    <h4>Order #{order.id.split('-')[1]}</h4>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.tableNumber && (
                      <p className="order-table">Table: {order.tableNumber}</p>
                    )}
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="customer-order-items">
                  <h5>Items:</h5>
                  {order.items.map((item, index) => (
                    <div key={index} className="customer-order-item">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{getCurrencySymbol()}{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="customer-order-total">
                  <strong>Total: {getCurrencySymbol()}{order.total.toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
