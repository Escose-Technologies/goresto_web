import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { restaurantService, settingsService } from '../services/apiService';
import { useToast } from '../components/ui/Toast';
import { INDIAN_STATES } from '../utils/indianStates';
import { DiscountPresetManager } from '../components/billing/DiscountPresetManager';

export const Settings = ({ onClose, onSettingsSaved, restaurant: restaurantProp, settings: settingsProp }) => {
  const toast = useToast();
  const [restaurant] = useState(restaurantProp);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState('restaurantInfo');
  const [kdsUrlCopied, setKdsUrlCopied] = useState(false);

  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };

  const defaults = {
    restaurantName: '', address: '', phone: '', email: '', currency: 'INR',
    openingTime: '09:00', closingTime: '22:00', primaryColor: '#3385F0',
    secondaryColor: '#589BF3', timezone: 'Asia/Kolkata', taxRate: 0.08,
    serviceCharge: 0.1, allowOnlineOrders: true, allowTableReservations: true,
    allowCallStaff: true, notificationEmail: '', discountText: '', kitchenPin: '',
    gstin: '', gstScheme: 'regular', gstRate: 5, fssaiNumber: '',
    placeOfSupply: '', placeOfSupplyCode: '', billPrefix: 'INV',
    showServiceCharge: false, serviceChargeLabel: 'Service Charge',
    enableRoundOff: true, enablePackagingCharge: false, defaultPackagingCharge: 0,
    billFooterText: 'Thank you for dining with us!', showFeedbackQR: false,
    autoPrintOnBill: false, thermalPrinterWidth: 'eighty_mm',
  };

  const [formData, setFormData] = useState(() => {
    if (settingsProp) {
      const { currencySymbol, kitchenPin, ...rest } = settingsProp;
      return { ...defaults, ...rest, currency: settingsProp.currency || 'INR', kitchenPin: '' };
    }
    return { ...defaults, restaurantName: restaurantProp?.name || '', address: restaurantProp?.address || '', phone: restaurantProp?.phone || '' };
  });

  const [hasExistingPin, setHasExistingPin] = useState(() => !!(settingsProp?.kitchenPin));

  const getCurrencySymbol = () => currencySymbols[formData.currency] || '₹';

  const handleChange = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { kitchenPin, ...restFormData } = formData;
      const dataToSave = {
        ...restFormData,
        currencySymbol: getCurrencySymbol(),
        ...(kitchenPin && kitchenPin.length === 4 ? { kitchenPin } : {}),
      };
      const updatedSettings = await settingsService.updateSettings(restaurant.id, dataToSave);
      await restaurantService.update(restaurant.id, {
        name: formData.restaurantName, address: formData.address, phone: formData.phone,
      });
      if (onSettingsSaved) onSettingsSaved(updatedSettings);
      if (kitchenPin && kitchenPin.length === 4) {
        setHasExistingPin(true);
        setFormData((prev) => ({ ...prev, kitchenPin: '' }));
      }
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAccordion = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!restaurant) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Restaurant not found</Typography>
      </Box>
    );
  }

  const SectionAccordion = ({ id, title, children, unmountOnExit = false }) => (
    <Accordion
      expanded={expanded === id}
      onChange={handleAccordion(id)}
      disableGutters
      {...(unmountOnExit ? { slotProps: { transition: { unmountOnExit: true } } } : {})}
    >
      <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" width={24} />}>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
        {onClose && (
          <IconButton onClick={onClose}><Icon icon="mdi:close" width={24} /></IconButton>
        )}
      </Stack>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Restaurant Information */}
        <SectionAccordion id="restaurantInfo" title="Restaurant Information">
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Restaurant Name" value={formData.restaurantName} onChange={handleChange('restaurantName')} required fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone" type="tel" value={formData.phone} onChange={handleChange('phone')} fullWidth />
            </Grid>
          </Grid>
          <TextField label="Address" value={formData.address} onChange={handleChange('address')} fullWidth multiline rows={2} sx={{ mb: 2 }} />
          <TextField label="Email" type="email" value={formData.email} onChange={handleChange('email')} fullWidth />
        </SectionAccordion>

        {/* Business Hours */}
        <SectionAccordion id="businessHours" title="Business Hours">
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Opening Time" type="time" value={formData.openingTime} onChange={handleChange('openingTime')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Closing Time" type="time" value={formData.closingTime} onChange={handleChange('closingTime')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
          </Grid>
          <TextField label="Timezone" select value={formData.timezone} onChange={handleChange('timezone')} fullWidth>
            <MenuItem value="Asia/Kolkata">India Standard Time (IST)</MenuItem>
            <MenuItem value="Asia/Dubai">Gulf Standard Time (GST)</MenuItem>
            <MenuItem value="Asia/Singapore">Singapore Time (SGT)</MenuItem>
            <MenuItem value="Asia/Tokyo">Japan Standard Time (JST)</MenuItem>
            <MenuItem value="Europe/London">Greenwich Mean Time (GMT)</MenuItem>
            <MenuItem value="Europe/Paris">Central European Time (CET)</MenuItem>
            <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
            <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
            <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
            <MenuItem value="UTC">UTC</MenuItem>
          </TextField>
        </SectionAccordion>

        {/* Currency & Pricing */}
        <SectionAccordion id="currencyPricing" title="Currency & Pricing">
          <TextField label="Currency" select value={formData.currency} onChange={handleChange('currency')} fullWidth sx={{ mb: 2 }}>
            <MenuItem value="INR">INR - Indian Rupee (₹)</MenuItem>
            <MenuItem value="USD">USD - US Dollar ($)</MenuItem>
            <MenuItem value="EUR">EUR - Euro (€)</MenuItem>
            <MenuItem value="GBP">GBP - British Pound (£)</MenuItem>
            <MenuItem value="CAD">CAD - Canadian Dollar (C$)</MenuItem>
            <MenuItem value="AUD">AUD - Australian Dollar (A$)</MenuItem>
          </TextField>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Tax Rate" type="number" value={formData.taxRate} onChange={handleChange('taxRate')} fullWidth slotProps={{ htmlInput: { min: 0, max: 1, step: 0.01 } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Service Charge" type="number" value={formData.serviceCharge} onChange={handleChange('serviceCharge')} fullWidth slotProps={{ htmlInput: { min: 0, max: 1, step: 0.01 } }} />
            </Grid>
          </Grid>
        </SectionAccordion>

        {/* Billing & Tax */}
        <SectionAccordion id="billingTax" title="Billing & Tax">
          {/* GST Registration */}
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>GST Registration</Typography>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>GST Scheme</Typography>
              <Stack direction="row" spacing={2}>
                <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}>
                  <input type="radio" name="gstScheme" value="regular" checked={formData.gstScheme === 'regular'} onChange={(e) => setFormData((prev) => ({ ...prev, gstScheme: e.target.value }))} style={{ accentColor: '#3385F0' }} />
                  <span>Regular</span>
                </Box>
                <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}>
                  <input type="radio" name="gstScheme" value="composition" checked={formData.gstScheme === 'composition'} onChange={(e) => setFormData((prev) => ({ ...prev, gstScheme: e.target.value }))} style={{ accentColor: '#3385F0' }} />
                  <span>Composition</span>
                </Box>
              </Stack>
              {formData.gstScheme === 'composition' && (
                <Typography variant="caption" color="warning.dark" mt={0.5}>
                  Composition scheme: Bills issued as "Bill of Supply" without tax breakdown.
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="GST Rate (%)" select value={formData.gstRate} onChange={(e) => setFormData((prev) => ({ ...prev, gstRate: Number(e.target.value) }))} disabled={formData.gstScheme === 'composition'} fullWidth>
                <MenuItem value={5}>5% (Standard - Restaurants)</MenuItem>
                <MenuItem value={12}>12%</MenuItem>
                <MenuItem value={18}>18% (Hotel Restaurant)</MenuItem>
                <MenuItem value={28}>28%</MenuItem>
                <MenuItem value={0}>0% (Exempt)</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {formData.gstScheme === 'regular' && (
            <TextField
              label="GSTIN (15-digit)"
              value={formData.gstin || ''}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                setFormData((prev) => ({
                  ...prev, gstin: val,
                  placeOfSupplyCode: val.length >= 2 ? val.substring(0, 2) : prev.placeOfSupplyCode,
                  placeOfSupply: val.length >= 2 ? (INDIAN_STATES.find((s) => s.code === val.substring(0, 2))?.name || prev.placeOfSupply) : prev.placeOfSupply,
                }));
              }}
              placeholder="e.g. 29AADCB2230M1ZP"
              fullWidth
              slotProps={{ htmlInput: { maxLength: 15, style: { textTransform: 'uppercase', fontFamily: 'monospace' } } }}
              helperText="Required for Tax Invoice. First 2 digits must match your state code."
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            label="FSSAI License Number (14-digit)"
            value={formData.fssaiNumber || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 14);
              setFormData((prev) => ({ ...prev, fssaiNumber: val }));
            }}
            placeholder="e.g. 12345678901234"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 14, inputMode: 'numeric', style: { fontFamily: 'monospace' } } }}
            helperText="Mandatory on all food business bills in India."
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Place of Supply (State)" select value={formData.placeOfSupply || ''} onChange={(e) => {
                const state = INDIAN_STATES.find((s) => s.name === e.target.value);
                setFormData((prev) => ({ ...prev, placeOfSupply: e.target.value, placeOfSupplyCode: state?.code || '' }));
              }} fullWidth>
                <MenuItem value="" disabled>Select State</MenuItem>
                {INDIAN_STATES.map((s) => (<MenuItem key={s.code} value={s.name}>{s.name}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="State Code" value={formData.placeOfSupplyCode || ''} fullWidth slotProps={{ input: { readOnly: true } }} helperText="Auto-filled from state selection." sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'grey.50' } }} />
            </Grid>
          </Grid>

          {/* Bill Preferences */}
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Bill Preferences</Typography>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Bill Number Prefix"
                value={formData.billPrefix || 'INV'}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
                  setFormData((prev) => ({ ...prev, billPrefix: val }));
                }}
                placeholder="INV"
                fullWidth
                slotProps={{ htmlInput: { maxLength: 5, style: { textTransform: 'uppercase' } } }}
                helperText={`Preview: ${formData.billPrefix || 'INV'}/2526/0001`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>Printer Width</Typography>
              <Stack direction="row" spacing={2}>
                <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}>
                  <input type="radio" name="thermalPrinterWidth" value="eighty_mm" checked={formData.thermalPrinterWidth === 'eighty_mm'} onChange={(e) => setFormData((prev) => ({ ...prev, thermalPrinterWidth: e.target.value }))} style={{ accentColor: '#3385F0' }} />
                  <span>80mm</span>
                </Box>
                <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}>
                  <input type="radio" name="thermalPrinterWidth" value="fifty_eight_mm" checked={formData.thermalPrinterWidth === 'fifty_eight_mm'} onChange={(e) => setFormData((prev) => ({ ...prev, thermalPrinterWidth: e.target.value }))} style={{ accentColor: '#3385F0' }} />
                  <span>58mm</span>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.showServiceCharge} onChange={(e) => setFormData((prev) => ({ ...prev, showServiceCharge: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
                <Typography variant="body2" fontWeight={500}>Enable Service Charge</Typography>
              </Box>
              {formData.showServiceCharge && (
                <Box sx={{ pl: 3.5, mt: 1 }}>
                  <Grid container spacing={1} mb={1}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        label="Rate (%)"
                        type="number"
                        size="small"
                        value={Math.round((formData.serviceCharge || 0) * 100)}
                        onChange={(e) => setFormData((prev) => ({ ...prev, serviceCharge: Number(e.target.value) / 100 }))}
                        slotProps={{ htmlInput: { min: 0, max: 30, step: 1 } }}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField label="Label" size="small" value={formData.serviceChargeLabel || ''} onChange={handleChange('serviceChargeLabel')} placeholder="Service Charge" fullWidth />
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="warning.dark">
                    Service charge is included in taxable value for GST (Section 15). Bill will show voluntary disclaimer.
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.enablePackagingCharge} onChange={(e) => setFormData((prev) => ({ ...prev, enablePackagingCharge: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
                <Typography variant="body2" fontWeight={500}>Enable Packaging Charge</Typography>
              </Box>
              {formData.enablePackagingCharge && (
                <Box sx={{ pl: 3.5, mt: 1 }}>
                  <TextField
                    label={`Default Amount (${getCurrencySymbol()})`}
                    type="number"
                    size="small"
                    value={formData.defaultPackagingCharge || 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, defaultPackagingCharge: Number(e.target.value) }))}
                    slotProps={{ htmlInput: { min: 0, max: 500, step: 5 } }}
                    helperText="Applied to takeaway/delivery orders. Can be overridden per bill."
                    sx={{ width: 200 }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.enableRoundOff} onChange={(e) => setFormData((prev) => ({ ...prev, enableRoundOff: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
                <Typography variant="body2" fontWeight={500}>Round Off to Nearest {getCurrencySymbol()}1</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.autoPrintOnBill} onChange={(e) => setFormData((prev) => ({ ...prev, autoPrintOnBill: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
                <Typography variant="body2" fontWeight={500}>Auto-print on Bill Generation</Typography>
              </Box>
            </Grid>
          </Grid>

          <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mb: 2 }}>
            <input type="checkbox" checked={formData.showFeedbackQR} onChange={(e) => setFormData((prev) => ({ ...prev, showFeedbackQR: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
            <Typography variant="body2" fontWeight={500}>Show Feedback QR on Bill</Typography>
          </Box>

          <TextField label="Bill Footer Text" value={formData.billFooterText || ''} onChange={handleChange('billFooterText')} placeholder="Thank you for dining with us!" fullWidth slotProps={{ htmlInput: { maxLength: 500 } }} />
        </SectionAccordion>

        {/* Discount Presets */}
        <SectionAccordion id="discountPresets" title="Discount Presets" unmountOnExit>
          {restaurant && <DiscountPresetManager restaurantId={restaurant.id} toast={toast} />}
        </SectionAccordion>

        {/* Theme & Colors */}
        <SectionAccordion id="themeColors" title="Theme & Colors">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>Primary Color</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="color" value={formData.primaryColor} onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))} style={{ width: 44, height: 44, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8 }} />
                <TextField size="small" value={formData.primaryColor} onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))} sx={{ width: 120 }} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" fontWeight={500} mb={1}>Secondary Color</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="color" value={formData.secondaryColor} onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))} style={{ width: 44, height: 44, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8 }} />
                <TextField size="small" value={formData.secondaryColor} onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))} sx={{ width: 120 }} />
              </Stack>
            </Grid>
          </Grid>
        </SectionAccordion>

        {/* Features */}
        <SectionAccordion id="features" title="Features & Preferences">
          <Stack spacing={1.5} mb={2}>
            <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.allowOnlineOrders} onChange={(e) => setFormData((prev) => ({ ...prev, allowOnlineOrders: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
              <Typography variant="body2" fontWeight={500}>Allow Online Orders</Typography>
            </Box>
            <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.allowTableReservations} onChange={(e) => setFormData((prev) => ({ ...prev, allowTableReservations: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
              <Typography variant="body2" fontWeight={500}>Allow Table Reservations</Typography>
            </Box>
            <Box>
              <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.allowCallStaff} onChange={(e) => setFormData((prev) => ({ ...prev, allowCallStaff: e.target.checked }))} style={{ accentColor: '#3385F0' }} />
                <Typography variant="body2" fontWeight={500}>Allow Call Staff</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ pl: 3.5 }}>
                Customers can request staff assistance from the public menu
              </Typography>
            </Box>
          </Stack>
          <TextField label="Notification Email" type="email" value={formData.notificationEmail} onChange={handleChange('notificationEmail')} placeholder="Email for order notifications" fullWidth />
        </SectionAccordion>

        {/* Kitchen Display System */}
        <SectionAccordion id="kitchenDisplay" title="Kitchen Display System">
          <TextField
            label="Kitchen PIN (4 digits)"
            value={formData.kitchenPin || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setFormData((prev) => ({ ...prev, kitchenPin: val }));
            }}
            placeholder={hasExistingPin ? '••••  (PIN is set)' : 'e.g. 1234'}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 4, inputMode: 'numeric', pattern: '\\d{4}' } }}
            helperText={hasExistingPin ? 'A PIN is already set. Enter a new 4-digit PIN to change it, or leave empty to keep current.' : 'Set a 4-digit PIN for kitchen staff to access the Kitchen Display System.'}
            sx={{ mb: 2 }}
          />
          {(hasExistingPin || (formData.kitchenPin && formData.kitchenPin.length === 4)) && restaurant && (
            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>KDS URL</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  value={`${window.location.origin}/kitchen/${restaurant.id}`}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'grey.50' } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  color={kdsUrlCopied ? 'success' : 'primary'}
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/kitchen/${restaurant.id}`);
                    setKdsUrlCopied(true);
                    setTimeout(() => setKdsUrlCopied(false), 2000);
                  }}
                  sx={{ flexShrink: 0 }}
                >
                  {kdsUrlCopied ? 'Copied!' : 'Copy'}
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                Open this URL on a tablet in the kitchen and enter the PIN above.
              </Typography>
            </Box>
          )}
        </SectionAccordion>

        {/* Promotions */}
        <SectionAccordion id="promotions" title="Promotions & Announcements">
          <TextField
            label="Discount/Announcement Text"
            value={formData.discountText}
            onChange={handleChange('discountText')}
            placeholder="e.g., 20% OFF on all items this week!"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 200 } }}
            helperText="This will be displayed prominently on your public menu. Leave empty to hide."
          />
        </SectionAccordion>

        {/* Save Actions */}
        <Stack direction="row" spacing={1.5} mt={3} mb={4}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            size="large"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          {onClose && (
            <Button variant="outlined" onClick={onClose} size="large">Cancel</Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
