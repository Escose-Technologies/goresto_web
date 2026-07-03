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
import { publicService } from '../services/apiService';
import { applyRestaurantTheme } from '../utils/applyTheme';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../components/ui/Toast';
import { SearchBar, FilterPills } from '../components/ui';
import { BottomSheet } from '../components/ui/BottomSheet';
import { DietaryBadge, DietaryLabels, AllergenLabels } from '../components/menu/DietaryBadges';
import { SpiceIndicator } from '../components/menu/SpiceLevel';
import { RatingDisplay } from '../components/menu/Rating';
import './PublicMenu.css';

// Customer-facing label + style for the restaurant's food type (set by the admin).
const FOOD_TYPE_BADGE = {
  pure_veg: { label: 'Pure Veg', variant: 'veg' },
  egg: { label: 'Veg & Egg', variant: 'egg' },
  veg_egg: { label: 'Veg & Egg', variant: 'egg' },
  non_veg: { label: 'Non-Veg', variant: 'nonveg' },
  both: { label: 'Veg & Non-Veg', variant: 'both' },
};

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
  const [unavailable, setUnavailable] = useState(false);
  const [tableStatus, setTableStatus] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [cookingRequest, setCookingRequest] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [statusCheckName, setStatusCheckName] = useState('');
  const [statusCheckMobile, setStatusCheckMobile] = useState('');
  const [customerOrders, setCustomerOrders] = useState([]);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);

  // New states for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [lastOrderCustomer, setLastOrderCustomer] = useState({ name: '', mobile: '' });

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
    if (ft === 'egg' || ft === 'veg_egg' || ft === 'non_veg' || ft === 'both') {
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
      const restaurantData = await publicService.getRestaurant(restaurantId);
      if (restaurantData) {
        setRestaurant(restaurantData);

        const restaurantSettings = await publicService.getSettings(restaurantId);
        setSettings(restaurantSettings);
        applyRestaurantTheme({
          primaryColor: restaurantSettings?.primaryColor,
          secondaryColor: restaurantSettings?.secondaryColor,
          fontColor: restaurantSettings?.fontColor,
          fontSize: restaurantSettings?.fontSize,
        });

        const items = await publicService.getMenuItems(restaurantId);
        const availableItems = items.filter(item => item.available);
        setMenuItems(availableItems);
        const cats = await publicService.getCategories(restaurantId);
        setCategories(cats);

        if (tableNumber) {
          try {
            const tableData = await publicService.getTableStatus(restaurantId, tableNumber);
            if (tableData?.status && tableData.status !== 'available') {
              setTableStatus(tableData.status);
            }
          } catch (_) {}
        }
      }
    } catch (error) {
      if (error?.code === 'RESTAURANT_UNAVAILABLE' || error?.status === 403) {
        setUnavailable(true);
      }
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
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
    // Only attach a variant for items that actually have variants — guards against
    // stale selectedVariant state bleeding in from a previously opened item.
    const variant = item.variants?.options?.length ? selectedVariant : null;
    const cartKey = variant ? `${item.id}__${variant.label}` : item.id;
    const price = variant?.price || item.price;
    const existingIdx = cart.findIndex(ci => ci.cartKey === cartKey);
    if (existingIdx >= 0) {
      const newCart = [...cart];
      newCart[existingIdx].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, cartKey, price, selectedVariant: variant || null, quantity: 1 }]);
    }
    setSelectedItem(null);
  };

  const updateCartQuantity = (itemId, change) => {
    const newCart = cart.map(item => {
      if ((item.cartKey || item.id) === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean);
    setCart(newCart);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => (item.cartKey || item.id) !== itemId));
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
          name: item.selectedVariant ? `${item.name} (${item.selectedVariant.label})` : item.name,
          variantLabel: item.selectedVariant?.label || null,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getCartTotal(),
        status: 'pending',
        notes: '',
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
      };

      await publicService.placeOrder(restaurantId, orderData);
      setLastOrderCustomer({ name: customerName.trim(), mobile: customerMobile.trim() });
      setCart([]);
      setShowCart(false);
      setCustomerName('');
      setCustomerMobile('');
      setOrderPlaced(true);
      setReviewRating(0);
      setReviewComment('');
      setReviewSubmitted(false);
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
      const orders = await publicService.getOrdersByCustomer(
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

  const handleSubmitReview = async () => {
    if (!reviewRating) return;
    try {
      await publicService.submitReview(restaurantId, {
        customerName: lastOrderCustomer.name || 'Guest',
        customerMobile: lastOrderCustomer.mobile || null,
        rating: reviewRating,
        comment: reviewComment || '',
      });
      setReviewSubmitted(true);
    } catch (error) {
      console.error('Error submitting review:', error);
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
    setSelectedVariant(item.variants?.options?.[0] || null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, bgcolor: 'grey.50' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading menu...</Typography>
      </Box>
    );
  }

  if (unavailable) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 1, p: 3, bgcolor: 'grey.50' }}>
        <Icon icon="mdi:store-off-outline" width={48} style={{ opacity: 0.5 }} />
        <Typography variant="h6" fontWeight={700}>Restaurant currently unavailable</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          This restaurant is not accepting orders right now. Please check back later.
        </Typography>
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
    <div className="public-menu-container bare-controls">
      {orderPlaced && (
        <div className="post-order-overlay">
          <div className="post-order-card">
            <div className="post-order-success">
              <Icon icon="mdi:check-circle" width={32} />
              <h3>Order placed successfully!</h3>
              <p>The restaurant will process your order shortly.</p>
            </div>

            {!reviewSubmitted ? (
              <div className="post-order-review">
                <h4>How was your experience?</h4>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`review-star ${star <= reviewRating ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      <Icon icon={star <= reviewRating ? 'mdi:star' : 'mdi:star-outline'} width={36} />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <>
                    <input
                      type="text"
                      className="review-comment-input"
                      placeholder="Tell us more... (optional)"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <button className="review-submit-btn" onClick={handleSubmitReview}>
                      Submit Review
                    </button>
                  </>
                )}
                <button className="review-skip-btn" onClick={() => setOrderPlaced(false)}>
                  Skip
                </button>
              </div>
            ) : (
              <div className="post-order-thanks">
                <Icon icon="mdi:heart" width={24} />
                <p>Thank you for your feedback!</p>
                <button className="review-skip-btn" onClick={() => setOrderPlaced(false)}>
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restaurant logo — shown wide and prominent, above the cover poster */}
      <div className="restaurant-logo-bar">
        {restaurant.logo ? (
          <img src={restaurant.logo} alt={`${restaurant.name} logo`} className="restaurant-logo" />
        ) : (
          <div className="restaurant-logo restaurant-logo--placeholder" aria-hidden="true">
            <Icon icon="mdi:silverware-fork-knife" width={56} />
          </div>
        )}
      </div>

      {/* Restaurant Banner (cover poster) */}
      <div className={`restaurant-banner ${restaurant.coverImage ? '' : 'restaurant-banner--plain'}`}>
        {restaurant.coverImage && (
          <img src={restaurant.coverImage} alt={restaurant.name} className="restaurant-banner-image" />
        )}
        <div className="restaurant-banner-overlay" />
      </div>

      <header className="public-menu-header">
        <div className="restaurant-info">
          <h1>{settings?.restaurantName || restaurant.name}</h1>
          {restaurant.tagline && (
            <p className="restaurant-tagline">{restaurant.tagline}</p>
          )}
          {FOOD_TYPE_BADGE[restaurant.foodType] && (
            <span className={`food-type-badge food-type-badge--${FOOD_TYPE_BADGE[restaurant.foodType].variant}`}>
              <span className="food-type-badge-dot" />
              {FOOD_TYPE_BADGE[restaurant.foodType].label}
            </span>
          )}
          {restaurant.description && (
            <p className="restaurant-description">{restaurant.description}</p>
          )}
          {tableNumber && (
            <div className={`table-badge ${tableStatus ? `table-badge--${tableStatus}` : ''}`}>
              Table {tableNumber}
              {tableStatus && (
                <span className="table-status-label">
                  {tableStatus === 'occupied' && '· Occupied'}
                  {tableStatus === 'reserved' && '· Reserved'}
                  {tableStatus === 'maintenance' && '· Under Maintenance'}
                </span>
              )}
            </div>
          )}
          <div className="header-action-row">
            <button
              className="check-status-btn"
              onClick={() => setShowStatusCheck(true)}
            >
              <Icon icon="mdi:information-outline" width={16} />
              Check Order Status
            </button>

            {settings?.allowCallStaff && tableNumber && tableStatus !== 'maintenance' && (
              <button
                className={`call-staff-btn ${callStaffSent ? 'call-staff-sent' : ''}`}
                onClick={handleCallStaff}
                disabled={callStaffSent}
              >
                <Icon icon="mdi:bell-outline" width={16} />
                {callStaffSent ? 'Notified!' : 'Call Staff'}
              </button>
            )}
          </div>

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

      {/* Swiggy-style Cart Bar */}
      {cart.length > 0 && (
        <div className="swiggy-cart-bar" onClick={() => setShowCart(true)}>
          <div className="swiggy-cart-bar-left">
            <Icon icon="mdi:silverware-fork-knife" width={20} />
            <span>{getCartItemCount()} item{getCartItemCount() > 1 ? 's' : ''} added</span>
          </div>
          <div className="swiggy-cart-bar-right">
            <span>Continue</span>
            <Icon icon="mdi:chevron-right" width={20} />
          </div>
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
              const hasVariants = item.variants?.options?.length > 0;
              // A variant item can have several cart lines (one per variant) — sum them.
              const itemQuantity = cart
                .filter(ci => ci.id === item.id)
                .reduce((sum, ci) => sum + ci.quantity, 0);
              const hasPopular = item.dietary?.labels?.includes('popular');
              const hasNew = item.dietary?.labels?.includes('new');

              return (
                <div key={item.id} className="swiggy-card" onClick={() => handleItemClick(item)}>
                  <div className="swiggy-card-info">
                    <DietaryBadge type={item.dietary?.type} size="small" />
                    <h3 className="swiggy-card-name">{item.name}</h3>
                    {(hasPopular || hasNew) && (
                      <div className="swiggy-card-badges">
                        {hasPopular && <span className="swiggy-badge swiggy-badge--popular"><Icon icon="mdi:thumb-up" width={12} /> Popular</span>}
                        {hasNew && <span className="swiggy-badge swiggy-badge--new"><Icon icon="mdi:sparkles" width={12} /> New</span>}
                      </div>
                    )}
                    <span className="swiggy-card-price">
                      {item.variants?.options?.length > 1 && <span className="swiggy-from">from </span>}
                      {getCurrencySymbol()}{item.price.toFixed(2)}
                    </span>
                    {item.description && (
                      <p className="swiggy-card-desc">
                        {item.description.length > 80 ? `${item.description.slice(0, 80)}...` : item.description}
                        {item.description.length > 80 && (
                          <span className="swiggy-more" onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}> more</span>
                        )}
                      </p>
                    )}
                    {item.rating > 0 && (
                      <div className="swiggy-card-rating">
                        <RatingDisplay value={item.rating} reviewCount={item.reviewCount} />
                      </div>
                    )}
                  </div>
                  <div className="swiggy-card-image-wrap">
                    <div className="swiggy-card-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} loading="lazy" />
                      ) : (
                        <div className="swiggy-card-image-placeholder">
                          <Icon icon="mdi:silverware-fork-knife" width={28} />
                        </div>
                      )}
                    </div>
                    <div className="swiggy-card-action" onClick={(e) => e.stopPropagation()}>
                      {hasVariants ? (
                        // Variant items open the full detail sheet to choose an
                        // option (and see all variants) before adding.
                        <button className="swiggy-add-btn" onClick={() => handleItemClick(item)}>
                          ADD <Icon icon="mdi:plus" width={14} />
                          {itemQuantity > 0 && <span className="swiggy-add-count">{itemQuantity}</span>}
                        </button>
                      ) : itemQuantity > 0 ? (
                        <div className="swiggy-qty">
                          <button onClick={() => updateCartQuantity(item.id, -1)}>−</button>
                          <span>{itemQuantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                        </div>
                      ) : (
                        <button className="swiggy-add-btn" onClick={() => addToCart(item)}>
                          ADD <Icon icon="mdi:plus" width={14} />
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
        onClose={() => { setSelectedItem(null); setSelectedVariant(null); setCookingRequest(''); }}
        title=""
      >
        {selectedItem && (() => {
          const detailCartKey = selectedVariant ? `${selectedItem.id}__${selectedVariant.label}` : selectedItem.id;
          const detailCartItem = cart.find(ci => (ci.cartKey || ci.id) === detailCartKey);
          const detailQty = detailCartItem ? detailCartItem.quantity : 0;
          return (
            <div className="swiggy-detail">
              <div className="swiggy-detail-image">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} />
                ) : (
                  <div className="swiggy-detail-image-placeholder">
                    <Icon icon="mdi:silverware-fork-knife" width={40} />
                  </div>
                )}
              </div>

              <div className="swiggy-detail-body">
                <DietaryBadge type={selectedItem.dietary?.type} size="small" />
                <div className="swiggy-detail-title-row">
                  <h2 className="swiggy-detail-name">{selectedItem.name}</h2>
                </div>

                {selectedItem.dietary?.labels?.length > 0 && (
                  <DietaryLabels labels={selectedItem.dietary.labels} />
                )}

                {selectedItem.rating > 0 && (
                  <div className="swiggy-detail-meta">
                    <RatingDisplay value={selectedItem.rating} reviewCount={selectedItem.reviewCount} />
                    {selectedItem.dietary?.spiceLevel > 0 && (
                      <SpiceIndicator level={selectedItem.dietary.spiceLevel} />
                    )}
                  </div>
                )}

                {selectedItem.description && (
                  <p className="swiggy-detail-desc">{selectedItem.description}</p>
                )}

                {selectedItem.dietary?.allergens?.length > 0 && (
                  <AllergenLabels allergens={selectedItem.dietary.allergens} />
                )}

                {selectedItem.variants?.options?.length > 0 && (
                  <div className="variant-selector">
                    <h4 className="variant-selector-title">{selectedItem.variants.type === 'portion' ? 'Select Portion' : selectedItem.variants.type === 'size' ? 'Select Size' : selectedItem.variants.type === 'weight' ? 'Select Weight' : selectedItem.variants.type === 'volume' ? 'Select Volume' : 'Select Option'}</h4>
                    <div className="variant-pills">
                      {selectedItem.variants.options.map((opt) => (
                        <button
                          key={opt.label}
                          className={`variant-pill ${selectedVariant?.label === opt.label ? 'active' : ''}`}
                          onClick={() => setSelectedVariant(opt)}
                        >
                          <span className="variant-pill-label">{opt.label}</span>
                          <span className="variant-pill-price">{getCurrencySymbol()}{opt.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="swiggy-cooking-request">
                  <div className="swiggy-cooking-request-header">
                    <span>Add a cooking request (optional)</span>
                    <Icon icon="mdi:information-outline" width={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Don't make it too spicy"
                    value={cookingRequest}
                    onChange={(e) => setCookingRequest(e.target.value)}
                    className="swiggy-cooking-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div className="swiggy-detail-footer">
                {detailQty > 0 ? (
                  <div className="swiggy-detail-qty">
                    <button onClick={() => updateCartQuantity(detailCartKey, -1)}>−</button>
                    <span>{detailQty}</span>
                    <button onClick={() => updateCartQuantity(detailCartKey, 1)}>+</button>
                  </div>
                ) : null}
                <button
                  className="swiggy-detail-add-btn"
                  onClick={() => { addToCart(selectedItem); }}
                >
                  {detailQty > 0 ? `Update item` : `Add item`} - {getCurrencySymbol()}{((selectedVariant?.price || selectedItem.price) * Math.max(detailQty, 1)).toFixed(2)}
                </button>
              </div>
            </div>
          );
        })()}
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
            <button className="cart-btn cart-btn--outline" onClick={() => setShowCart(false)}>Continue Shopping</button>
          </Box>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.cartKey || item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}{item.selectedVariant ? ` (${item.selectedVariant.label})` : ''}</h4>
                    <p className="cart-item-price">
                      {getCurrencySymbol()}{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-stepper">
                      <button
                        className="quantity-btn"
                        aria-label="Decrease quantity"
                        onClick={() => updateCartQuantity(item.cartKey || item.id, -1)}
                      >
                        −
                      </button>
                      <span className="cart-item-quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        aria-label="Increase quantity"
                        onClick={() => updateCartQuantity(item.cartKey || item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-total">
                      {getCurrencySymbol()}{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="remove-item-btn"
                      aria-label="Remove item"
                      onClick={() => removeFromCart(item.cartKey || item.id)}
                    >
                      <Icon icon="mdi:trash-can-outline" width={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <Stack spacing={1.5} sx={{ mb: 1.5 }}>
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
                <span className="cart-total-label">
                  {cart.reduce((n, i) => n + i.quantity, 0)} {cart.reduce((n, i) => n + i.quantity, 0) === 1 ? 'item' : 'items'} · Total
                </span>
                <strong className="cart-total-amount">{getCurrencySymbol()}{getCartTotal().toFixed(2)}</strong>
              </div>
              {!tableNumber && (
                <div className="cart-warning">
                  <p>Table number is required to place an order. Please access this menu through a table QR code.</p>
                </div>
              )}
              <button className="place-order-btn" onClick={handlePlaceOrder} disabled={!tableNumber}>
                <span className="place-order-btn-label">
                  <Icon icon="mdi:cart-check" width={20} />
                  Place Order
                </span>
                <span className="place-order-btn-amount">
                  {getCurrencySymbol()}{getCartTotal().toFixed(2)}
                  <Icon icon="mdi:arrow-right" width={18} />
                </span>
              </button>
              <button className="cart-continue-link" onClick={() => setShowCart(false)}>
                Continue Shopping
              </button>
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
                    <h4>Order #{order.orderNumber || order.id.slice(-6)}</h4>
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
