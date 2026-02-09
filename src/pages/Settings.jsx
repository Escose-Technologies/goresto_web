import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { restaurantService, settingsService } from '../services/apiService';
import { theme } from '../styles/theme';
import './Settings.css';

export const Settings = ({ onClose }) => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    restaurantInfo: true,
    businessHours: false,
    currencyPricing: false,
    themeColors: false,
    features: false,
    promotions: false,
    kitchenDisplay: false,
  });
  const [kdsUrlCopied, setKdsUrlCopied] = useState(false);
  // Currency to symbol mapping
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
  };

  const [formData, setFormData] = useState({
    restaurantName: '',
    address: '',
    phone: '',
    email: '',
    currency: 'INR',
    openingTime: '09:00',
    closingTime: '22:00',
    primaryColor: '#7C3AED',
    secondaryColor: '#9333EA',
    timezone: 'America/New_York',
    taxRate: 0.08,
    serviceCharge: 0.1,
    allowOnlineOrders: true,
    allowTableReservations: true,
    notificationEmail: '',
    discountText: '',
    kitchenPin: '',
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const restaurantData = await restaurantService.getByUserId(user?.id, user?.restaurantId);
      if (restaurantData) {
        setRestaurant(restaurantData);
        const settings = await settingsService.getSettings(restaurantData.id);
        if (settings) {
          // Remove currencySymbol from loaded settings if present (it's now derived)
          const { currencySymbol, ...settingsWithoutSymbol } = settings;
          setFormData({
            ...settingsWithoutSymbol,
            currency: settings.currency || 'INR',
          });
        } else {
          // Initialize with restaurant data
          setFormData(prev => ({
            ...prev,
            restaurantName: restaurantData.name || '',
            address: restaurantData.address || '',
            phone: restaurantData.phone || '',
            currency: 'INR',
          }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Add currency symbol to formData before saving
      const dataToSave = {
        ...formData,
        currencySymbol: getCurrencySymbol(),
      };
      await settingsService.updateSettings(restaurant.id, dataToSave);
      // Also update restaurant basic info
      await restaurantService.update(restaurant.id, {
        name: formData.restaurantName,
        address: formData.address,
        phone: formData.phone,
      });
      alert('Settings saved successfully!');
      if (onClose) onClose();
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updates = {
      [name]: type === 'checkbox' ? checked : value,
    };
    
    // Auto-set currency symbol when currency changes
    if (name === 'currency' && currencySymbols[value]) {
      // Note: We don't store currencySymbol separately anymore, it's derived from currency
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Get current currency symbol
  const getCurrencySymbol = () => {
    return currencySymbols[formData.currency] || '₹';
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="settings-container">
        <div className="error-state">Restaurant not found</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('restaurantInfo')}
          >
            <h2>Restaurant Information</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.restaurantInfo ? 'expanded' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={`settings-section-content ${expandedSections.restaurantInfo ? 'expanded' : ''}`}>
          <div className="form-row">
            <div className="form-group">
              <label>Restaurant Name *</label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('businessHours')}
          >
            <h2>Business Hours</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.businessHours ? 'expanded' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={`settings-section-content ${expandedSections.businessHours ? 'expanded' : ''}`}>
          <div className="form-row">
            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('currencyPricing')}
          >
            <h2>Currency & Pricing</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.currencyPricing ? 'expanded' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={`settings-section-content ${expandedSections.currencyPricing ? 'expanded' : ''}`}>
          <div className="form-group">
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="CAD">CAD - Canadian Dollar (C$)</option>
              <option value="AUD">AUD - Australian Dollar (A$)</option>
            </select>
            <p className="form-hint">Currency symbol: {getCurrencySymbol()}</p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Service Charge (%)</label>
              <input
                type="number"
                name="serviceCharge"
                value={formData.serviceCharge}
                onChange={handleChange}
                min="0"
                max="1"
                step="0.01"
              />
            </div>
          </div>
          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('themeColors')}
          >
            <h2>Theme & Colors</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.themeColors ? 'expanded' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={`settings-section-content ${expandedSections.themeColors ? 'expanded' : ''}`}>
          <div className="form-row">
            <div className="form-group">
              <label>Primary Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="color-text-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Secondary Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="color-text-input"
                />
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('features')}
          >
            <h2>Features & Preferences</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.features ? 'expanded' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={`settings-section-content ${expandedSections.features ? 'expanded' : ''}`}>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="allowOnlineOrders"
                checked={formData.allowOnlineOrders}
                onChange={handleChange}
              />
              <span>Allow Online Orders</span>
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="allowTableReservations"
                checked={formData.allowTableReservations}
                onChange={handleChange}
              />
              <span>Allow Table Reservations</span>
            </label>
          </div>
          <div className="form-group">
            <label>Notification Email</label>
            <input
              type="email"
              name="notificationEmail"
              value={formData.notificationEmail}
              onChange={handleChange}
              placeholder="Email for order notifications"
            />
          </div>
          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('kitchenDisplay')}
          >
            <h2>Kitchen Display System</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.kitchenDisplay ? 'expanded' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={`settings-section-content ${expandedSections.kitchenDisplay ? 'expanded' : ''}`}>
          <div className="form-group">
            <label>Kitchen PIN (4 digits)</label>
            <input
              type="text"
              name="kitchenPin"
              value={formData.kitchenPin || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData(prev => ({ ...prev, kitchenPin: val }));
              }}
              placeholder="e.g. 1234"
              maxLength={4}
              inputMode="numeric"
              pattern="\d{4}"
            />
            <p className="form-hint">
              Set a 4-digit PIN for kitchen staff to access the Kitchen Display System.
            </p>
          </div>
          {formData.kitchenPin && formData.kitchenPin.length === 4 && restaurant && (
            <div className="form-group">
              <label>KDS URL</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={`${window.location.origin}/kitchen/${restaurant.id}`}
                  readOnly
                  style={{ flex: 1, background: '#f1f5f9', cursor: 'text' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/kitchen/${restaurant.id}`);
                    setKdsUrlCopied(true);
                    setTimeout(() => setKdsUrlCopied(false), 2000);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: kdsUrlCopied ? '#22c55e' : '#7C3AED',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {kdsUrlCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="form-hint">
                Open this URL on a tablet in the kitchen and enter the PIN above.
              </p>
            </div>
          )}
          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('promotions')}
          >
            <h2>Promotions & Announcements</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.promotions ? 'expanded' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className={`settings-section-content ${expandedSections.promotions ? 'expanded' : ''}`}>
          <div className="form-group">
            <label>Discount/Announcement Text</label>
            <input
              type="text"
              name="discountText"
              value={formData.discountText}
              onChange={handleChange}
              placeholder="e.g., 20% OFF on all items this week!"
              maxLength={200}
            />
            <p className="form-hint">
              This will be displayed prominently on your public menu. Leave empty to hide.
            </p>
          </div>
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="submit"
            className="btn-save"
            disabled={saving}
            style={{ background: theme.colors.background.gradient }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

