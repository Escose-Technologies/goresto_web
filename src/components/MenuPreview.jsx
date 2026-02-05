import { useState, useEffect } from 'react';
import { menuService, settingsService } from '../services/dataService';
import '../pages/PublicMenu.css';

export const MenuPreview = ({ restaurantId, restaurant }) => {
  const [settings, setSettings] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return '₹'; // Default to INR
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

  useEffect(() => {
    loadMenuData();
  }, [restaurantId]);

  const loadMenuData = async () => {
    try {
      // Load settings for restaurant details
      const restaurantSettings = await settingsService.getSettings(restaurantId);
      setSettings(restaurantSettings);
      
      const items = await menuService.getMenuItems(restaurantId);
      const availableItems = items.filter(item => item.available);
      setMenuItems(availableItems);
      const cats = await menuService.getCategories(restaurantId);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="public-menu-loading">
        <div className="loading-spinner"></div>
        <p>Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="public-menu-container preview-mode">
      <div className="preview-banner">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 2L3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H15C15.5304 19 16.0391 18.7893 16.4142 18.4142C16.7893 18.0391 17 17.5304 17 17V7L10 2Z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 2V10M10 10L17 7M10 10L3 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Preview Mode - This is how customers will see your menu</span>
      </div>

      {/* Restaurant Banner Image */}
      {restaurant?.coverImage && (
        <div className="restaurant-banner">
          <img src={restaurant.coverImage} alt={restaurant?.name} className="restaurant-banner-image" />
          <div className="restaurant-banner-overlay">
            {restaurant?.logo && (
              <img src={restaurant.logo} alt={`${restaurant?.name} logo`} className="restaurant-logo" />
            )}
          </div>
        </div>
      )}

      <header className="public-menu-header">
        <div className="restaurant-info">
          <h1>{settings?.restaurantName || restaurant?.name || 'Restaurant Name'}</h1>
          
          {/* Discount/Announcement Banner */}
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
                  <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.65 11.5a.678.678 0 0 1-.64-.468l-.267-1.12a.678.678 0 0 0-.58-.49l-2.307-.402a.678.678 0 0 0-.58.122L3.654 1.328Z" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                <span>{settings.phone}</span>
              </div>
            )}
            
            {settings?.email && (
              <div className="restaurant-detail-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 3L8 8L14 3M2 3H14M2 3V13H14V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{settings.email}</span>
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
            <p>No items available in this category.</p>
          </div>
        ) : (
          <div className="menu-items-list">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="public-menu-item"
                onClick={() => setSelectedItem(item)}
              >
                {item.image && (
                  <div className="public-menu-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                )}
                <div className="public-menu-item-details">
                  <div className="public-menu-item-header">
                    <h3>{item.name}</h3>
                    <span className="public-menu-item-price">
                      {getCurrencySymbol()}{item.price.toFixed(2)}
                    </span>
                  </div>
                  {item.category && (
                    <p className="public-menu-item-category">{item.category}</p>
                  )}
                  {item.description && (
                    <p className="public-menu-item-description">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="item-modal" onClick={() => setSelectedItem(null)}>
          <div className="item-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>
              ×
            </button>
            {selectedItem.image && (
              <div className="modal-image">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>
            )}
            <div className="modal-details">
              <h2>{selectedItem.name}</h2>
              {selectedItem.category && (
                <p className="modal-category">{selectedItem.category}</p>
              )}
              <p className="modal-price">
                {getCurrencySymbol()}{selectedItem.price.toFixed(2)}
              </p>
              {selectedItem.description && (
                <p className="modal-description">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

