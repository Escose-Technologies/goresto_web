import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { restaurantService, menuService, settingsService, orderService, reviewService } from '../services/dataService';
import { theme } from '../styles/theme';
import { SearchBar, FilterPills } from '../components/ui';
import { BottomSheet } from '../components/ui/BottomSheet';
import { DietaryBadge, DietaryLabels, AllergenLabels } from '../components/menu/DietaryBadges';
import { SpiceIndicator } from '../components/menu/SpiceLevel';
import { RatingDisplay } from '../components/menu/Rating';
import { ReviewSection } from '../components/menu/ReviewSection';
import './PublicMenu.css';

export const PublicMenu = () => {
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

  const filterOptions = [
    { id: 'veg', label: 'Veg', icon: <span className="filter-dot filter-dot-veg" /> },
    { id: 'non-veg', label: 'Non-Veg', icon: <span className="filter-dot filter-dot-nonveg" /> },
    { id: 'spicy', label: 'Spicy', icon: '🌶️' },
    { id: 'popular', label: 'Popular', icon: '⭐' },
    { id: 'new', label: 'New', icon: '✨' },
  ];

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
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!tableNumber) {
      alert('Table number is required. Please access this menu through a table QR code.');
      return;
    }

    if (!customerName.trim() || !customerMobile.trim()) {
      alert('Please enter your name and mobile number to place an order.');
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
      alert('Failed to place order. Please try again.');
    }
  };

  const handleCheckOrderStatus = async () => {
    if (!statusCheckName.trim() || !statusCheckMobile.trim()) {
      alert('Please enter your name and mobile number to check order status.');
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
        alert('No orders found with the provided name and mobile number.');
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      alert('Failed to check order status. Please try again.');
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

  const handleItemClick = (item) => {
    setSelectedItem(item);
    loadItemReviews(item.id);
  };

  if (loading) {
    return (
      <div className="public-menu-loading">
        <div className="loading-spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="public-menu-error">
        <h2>Restaurant not found</h2>
        <p>The menu you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="public-menu-container">
      {orderPlaced && (
        <div className="order-success-banner">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12.75V9M9 5.25H9.0075M15.75 9C15.75 12.7279 12.7279 15.75 9 15.75C5.27208 15.75 2.25 12.7279 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C12.7279 2.25 15.75 5.27208 15.75 9Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Check Order Status
          </button>

          {settings?.discountText && (
            <div className="discount-banner">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 2L3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H15C15.5304 19 16.0391 18.7893 16.4142 18.4142C16.7893 18.0391 17 17.5304 17 17V7L10 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L9 12L13 8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{settings.discountText}</span>
            </div>
          )}

          <div className="restaurant-details">
            {settings?.address && (
              <div className="restaurant-detail-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 1C5.79086 1 4 2.79086 4 5C4 7.5 8 13 8 13C8 13 12 7.5 12 5C12 2.79086 10.2091 1 8 1Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>{settings.address}</span>
              </div>
            )}

            {settings?.phone && (
              <div className="restaurant-detail-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14.5 11.5c0 .3-.1.6-.2.9-.1.3-.3.5-.5.7-.4.4-.9.7-1.4.8-.6.2-1.2.3-1.9.3-1.1 0-2.2-.3-3.3-.8-1.1-.5-2.1-1.2-3-2.1-.9-.9-1.6-1.9-2.1-3C1.5 7.2 1.2 6.1 1.2 5c0-.7.1-1.3.3-1.9.2-.5.5-1 .8-1.4.4-.4.9-.6 1.4-.6.2 0 .4 0 .6.1.2.1.3.2.4.4l1.4 2c.1.2.2.3.2.5s-.1.4-.2.5l-.6.7c-.1.1-.1.2-.1.3 0 .1 0 .1.1.2.1.2.3.5.6.8.3.3.5.5.8.7.1.1.2.1.2.1.1 0 .2 0 .3-.1l.7-.7c.2-.2.3-.2.5-.2s.4.1.5.2l2 1.4c.2.1.3.3.4.4.1.2.1.4.1.6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </div>
            )}

            {settings?.openingTime && settings?.closingTime && (
              <div className="restaurant-detail-item restaurant-hours">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>
                  {formatTime(settings.openingTime)} - {formatTime(settings.closingTime)}
                </span>
              </div>
            )}
          </div>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Cart ({getCartItemCount()})</span>
            <span className="cart-total">{getCurrencySymbol()}{getCartTotal().toFixed(2)}</span>
          </button>
        </div>
      )}

      <div className="public-menu-content">
        {categories.length > 0 && (
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="empty-menu">
            {searchQuery || activeFilters.length > 0 ? (
              <>
                <p>No items match your search or filters.</p>
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </>
            ) : (
              <p>No items available in this category.</p>
            )}
          </div>
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
                  {item.image && (
                    <div className="public-menu-item-image">
                      <img src={item.image} alt={item.name} loading="lazy" />
                    </div>
                  )}
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
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 4V14M4 9H14" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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
            {selectedItem.image && (
              <div className="item-detail-image">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>
            )}

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

              <button
                className="btn-add-to-cart-full"
                onClick={() => addToCart(selectedItem)}
              >
                Add to Cart - {getCurrencySymbol()}{selectedItem.price.toFixed(2)}
              </button>
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
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <button className="btn-secondary" onClick={() => setShowCart(false)}>
              Continue Shopping
            </button>
          </div>
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
              <div className="customer-info-section">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
              </div>
              <div className="cart-total-section">
                <strong>Total: {getCurrencySymbol()}{getCartTotal().toFixed(2)}</strong>
              </div>
              {!tableNumber && (
                <div className="cart-warning">
                  <p>Table number is required to place an order. Please access this menu through a table QR code.</p>
                </div>
              )}
              <div className="cart-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </button>
                <button
                  className="btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={!tableNumber}
                >
                  Place Order
                </button>
              </div>
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
        <div className="status-check-form">
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={statusCheckName}
              onChange={(e) => setStatusCheckName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="tel"
              value={statusCheckMobile}
              onChange={(e) => setStatusCheckMobile(e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>
          <button
            className="btn-primary status-check-submit"
            onClick={handleCheckOrderStatus}
            disabled={statusCheckLoading}
          >
            {statusCheckLoading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
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
