import { useState } from 'react';
import { restaurantService, settingsService } from '../services/apiService';
import { TouchButton } from '../components/ui/TouchButton';
import { useToast } from '../components/ui/Toast';
import { INDIAN_STATES } from '../utils/indianStates';
import { DiscountPresetManager } from '../components/billing/DiscountPresetManager';
import './Settings.css';

export const Settings = ({ onClose, restaurant: restaurantProp, settings: settingsProp }) => {
  const toast = useToast();
  const [restaurant] = useState(restaurantProp);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    restaurantInfo: true,
    businessHours: false,
    currencyPricing: false,
    billingTax: false,
    discountPresets: false,
    themeColors: false,
    features: false,
    kitchenDisplay: false,
    promotions: false,
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

  const defaults = {
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
    allowCallStaff: true,
    notificationEmail: '',
    discountText: '',
    kitchenPin: '',
    gstin: '',
    gstScheme: 'regular',
    gstRate: 5,
    fssaiNumber: '',
    placeOfSupply: '',
    placeOfSupplyCode: '',
    billPrefix: 'INV',
    showServiceCharge: false,
    serviceChargeLabel: 'Service Charge',
    enableRoundOff: true,
    enablePackagingCharge: false,
    defaultPackagingCharge: 0,
    billFooterText: 'Thank you for dining with us!',
    showFeedbackQR: false,
    autoPrintOnBill: false,
    thermalPrinterWidth: 'eighty_mm',
  };

  const [formData, setFormData] = useState(() => {
    if (settingsProp) {
      const { currencySymbol, kitchenPin, ...rest } = settingsProp;
      return {
        ...defaults,
        ...rest,
        currency: settingsProp.currency || 'INR',
        // Don't pre-fill the bcrypt hash — show empty so user can set a new PIN
        kitchenPin: '',
      };
    }
    // Fallback: populate from restaurant prop
    return {
      ...defaults,
      restaurantName: restaurantProp?.name || '',
      address: restaurantProp?.address || '',
      phone: restaurantProp?.phone || '',
    };
  });
  // Track whether a kitchen PIN already exists (for UI hint)
  const [hasExistingPin] = useState(() => !!(settingsProp?.kitchenPin));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Add currency symbol to formData before saving
      const { kitchenPin, ...restFormData } = formData;
      const dataToSave = {
        ...restFormData,
        currencySymbol: getCurrencySymbol(),
        // Only send kitchenPin if user entered a new 4-digit PIN
        ...(kitchenPin && kitchenPin.length === 4 ? { kitchenPin } : {}),
      };
      await settingsService.updateSettings(restaurant.id, dataToSave);
      // Also update restaurant basic info
      await restaurantService.update(restaurant.id, {
        name: formData.restaurantName,
        address: formData.address,
        phone: formData.phone,
      });
      toast.success('Settings saved successfully!');
      if (onClose) onClose();
    } catch (error) {
      toast.error('Error saving settings: ' + error.message);
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
            onClick={() => toggleSection('billingTax')}
          >
            <h2>Billing & Tax</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.billingTax ? 'expanded' : ''}`}
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
          <div className={`settings-section-content ${expandedSections.billingTax ? 'expanded' : ''}`}>

          {/* GST Registration */}
          <div className="billing-subsection">
            <h3 className="billing-subsection-title">GST Registration</h3>
            <div className="form-row">
              <div className="form-group">
                <label>GST Scheme</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gstScheme"
                      value="regular"
                      checked={formData.gstScheme === 'regular'}
                      onChange={handleChange}
                    />
                    <span>Regular</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gstScheme"
                      value="composition"
                      checked={formData.gstScheme === 'composition'}
                      onChange={handleChange}
                    />
                    <span>Composition</span>
                  </label>
                </div>
                {formData.gstScheme === 'composition' && (
                  <p className="form-hint" style={{ color: '#B45309' }}>
                    Composition scheme: Bills will be issued as "Bill of Supply" without tax breakdown.
                  </p>
                )}
              </div>
              <div className="form-group">
                <label>GST Rate (%)</label>
                <select
                  name="gstRate"
                  value={formData.gstRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                  disabled={formData.gstScheme === 'composition'}
                >
                  <option value={5}>5% (Standard - Restaurants)</option>
                  <option value={12}>12%</option>
                  <option value={18}>18% (Hotel Restaurant)</option>
                  <option value={28}>28%</option>
                  <option value={0}>0% (Exempt)</option>
                </select>
              </div>
            </div>

            {formData.gstScheme === 'regular' && (
              <div className="form-group">
                <label>GSTIN (15-digit)</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin || ''}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                    setFormData(prev => ({
                      ...prev,
                      gstin: val,
                      // Auto-fill state code from GSTIN first 2 digits
                      placeOfSupplyCode: val.length >= 2 ? val.substring(0, 2) : prev.placeOfSupplyCode,
                      placeOfSupply: val.length >= 2
                        ? (INDIAN_STATES.find(s => s.code === val.substring(0, 2))?.name || prev.placeOfSupply)
                        : prev.placeOfSupply,
                    }));
                  }}
                  placeholder="e.g. 29AADCB2230M1ZP"
                  maxLength={15}
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
                <p className="form-hint">Required for Tax Invoice. First 2 digits must match your state code.</p>
              </div>
            )}

            <div className="form-group">
              <label>FSSAI License Number (14-digit)</label>
              <input
                type="text"
                name="fssaiNumber"
                value={formData.fssaiNumber || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                  setFormData(prev => ({ ...prev, fssaiNumber: val }));
                }}
                placeholder="e.g. 12345678901234"
                maxLength={14}
                inputMode="numeric"
                style={{ fontFamily: 'monospace' }}
              />
              <p className="form-hint">Mandatory on all food business bills in India.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Place of Supply (State)</label>
                <select
                  name="placeOfSupply"
                  value={formData.placeOfSupply || ''}
                  onChange={(e) => {
                    const state = INDIAN_STATES.find(s => s.name === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      placeOfSupply: e.target.value,
                      placeOfSupplyCode: state?.code || '',
                    }));
                  }}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>State Code</label>
                <input
                  type="text"
                  name="placeOfSupplyCode"
                  value={formData.placeOfSupplyCode || ''}
                  readOnly
                  style={{ background: '#F1F5F9', cursor: 'default' }}
                />
                <p className="form-hint">Auto-filled from state selection.</p>
              </div>
            </div>
          </div>

          {/* Bill Preferences */}
          <div className="billing-subsection">
            <h3 className="billing-subsection-title">Bill Preferences</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Bill Number Prefix</label>
                <input
                  type="text"
                  name="billPrefix"
                  value={formData.billPrefix || 'INV'}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
                    setFormData(prev => ({ ...prev, billPrefix: val }));
                  }}
                  placeholder="INV"
                  maxLength={5}
                  style={{ textTransform: 'uppercase' }}
                />
                <p className="form-hint">Preview: {formData.billPrefix || 'INV'}/2526/0001</p>
              </div>
              <div className="form-group">
                <label>Printer Width</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="thermalPrinterWidth"
                      value="eighty_mm"
                      checked={formData.thermalPrinterWidth === 'eighty_mm'}
                      onChange={handleChange}
                    />
                    <span>80mm</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="thermalPrinterWidth"
                      value="fifty_eight_mm"
                      checked={formData.thermalPrinterWidth === 'fifty_eight_mm'}
                      onChange={handleChange}
                    />
                    <span>58mm</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showServiceCharge"
                    checked={formData.showServiceCharge}
                    onChange={handleChange}
                  />
                  <span>Enable Service Charge</span>
                </label>
                {formData.showServiceCharge && (
                  <>
                    <div style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
                      <div className="form-row" style={{ marginBottom: 0 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Rate</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                              type="number"
                              value={Math.round((formData.serviceCharge || 0) * 100)}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                serviceCharge: Number(e.target.value) / 100,
                              }))}
                              min="0"
                              max="30"
                              step="1"
                              style={{ width: '80px' }}
                            />
                            <span>%</span>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Label</label>
                          <input
                            type="text"
                            name="serviceChargeLabel"
                            value={formData.serviceChargeLabel || ''}
                            onChange={handleChange}
                            placeholder="Service Charge"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="form-hint" style={{ paddingLeft: '2rem', color: '#B45309' }}>
                      Service charge is included in taxable value for GST (Section 15). Bill will show voluntary disclaimer.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enablePackagingCharge"
                    checked={formData.enablePackagingCharge}
                    onChange={handleChange}
                  />
                  <span>Enable Packaging Charge</span>
                </label>
                {formData.enablePackagingCharge && (
                  <div style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Default Amount ({getCurrencySymbol()})</label>
                      <input
                        type="number"
                        name="defaultPackagingCharge"
                        value={formData.defaultPackagingCharge || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          defaultPackagingCharge: Number(e.target.value),
                        }))}
                        min="0"
                        max="500"
                        step="5"
                        style={{ width: '120px' }}
                      />
                      <p className="form-hint">Applied to takeaway/delivery orders. Can be overridden per bill.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enableRoundOff"
                    checked={formData.enableRoundOff}
                    onChange={handleChange}
                  />
                  <span>Round Off to Nearest {getCurrencySymbol()}1</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="autoPrintOnBill"
                    checked={formData.autoPrintOnBill}
                    onChange={handleChange}
                  />
                  <span>Auto-print on Bill Generation</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showFeedbackQR"
                    checked={formData.showFeedbackQR}
                    onChange={handleChange}
                  />
                  <span>Show Feedback QR on Bill</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Bill Footer Text</label>
              <input
                type="text"
                name="billFooterText"
                value={formData.billFooterText || ''}
                onChange={handleChange}
                placeholder="Thank you for dining with us!"
                maxLength={500}
              />
            </div>
          </div>

          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-section-header"
            onClick={() => toggleSection('discountPresets')}
          >
            <h2>Discount Presets</h2>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`section-chevron ${expandedSections.discountPresets ? 'expanded' : ''}`}
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
          {expandedSections.discountPresets && restaurant && (
            <div className="settings-section-content">
              <DiscountPresetManager restaurantId={restaurant.id} toast={toast} />
            </div>
          )}
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
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="allowCallStaff"
                checked={formData.allowCallStaff}
                onChange={handleChange}
              />
              <span>Allow Call Staff</span>
            </label>
            <p className="form-hint">Customers can request staff assistance from the public menu</p>
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
              {hasExistingPin
                ? 'A PIN is already set. Enter a new 4-digit PIN to change it, or leave empty to keep current.'
                : 'Set a 4-digit PIN for kitchen staff to access the Kitchen Display System.'}
            </p>
          </div>
          {(hasExistingPin || (formData.kitchenPin && formData.kitchenPin.length === 4)) && restaurant && (
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
          <TouchButton
            type="submit"
            variant="primary"
            disabled={saving}
            loading={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </TouchButton>
          {onClose && (
            <TouchButton
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </TouchButton>
          )}
        </div>
      </form>
    </div>
  );
};

