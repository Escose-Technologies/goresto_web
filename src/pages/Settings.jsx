import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { restaurantService, settingsService } from '../services/apiService';
import { useToast } from '../components/ui/Toast';
import { INDIAN_STATES } from '../utils/indianStates';
import { DiscountPresetManager } from '../components/billing/DiscountPresetManager';

const SECTIONS = [
  { id: 'restaurantInfo', label: 'Restaurant', icon: 'mdi:storefront-outline', hint: 'Name, contact & address' },
  { id: 'businessHours', label: 'Hours', icon: 'mdi:clock-outline', hint: 'Opening times & timezone' },
  { id: 'currencyPricing', label: 'Pricing', icon: 'mdi:currency-inr', hint: 'Currency, tax & service' },
  { id: 'billingTax', label: 'Billing & Tax', icon: 'mdi:receipt-text-outline', hint: 'GST, FSSAI & bill format' },
  { id: 'discountPresets', label: 'Discounts', icon: 'mdi:tag-outline', hint: 'Reusable discount presets' },
  { id: 'themeColors', label: 'Theme', icon: 'mdi:palette-outline', hint: 'Brand colours' },
  { id: 'features', label: 'Features', icon: 'mdi:tune-variant', hint: 'Online ordering & more' },
  { id: 'kitchenDisplay', label: 'Kitchen', icon: 'mdi:monitor-dashboard', hint: 'KDS access PIN' },
  { id: 'promotions', label: 'Promotions', icon: 'mdi:bullhorn-outline', hint: 'Menu announcement' },
];

export const Settings = ({ onClose, onSettingsSaved, restaurant: restaurantProp, settings: settingsProp }) => {
  const toast = useToast();
  const [restaurant] = useState(restaurantProp);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState('restaurantInfo');
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
      const { currencySymbol, ...rest } = settingsProp;
      return { ...defaults, ...rest, currency: settingsProp.currency || 'INR', kitchenPin: settingsProp.kitchenPin || '' };
    }
    return { ...defaults, restaurantName: restaurantProp?.name || '', address: restaurantProp?.address || '', phone: restaurantProp?.phone || '' };
  });

  const [hasExistingPin] = useState(() => !!(settingsProp?.kitchenPin));
  const [showPin, setShowPin] = useState(false);

  const getCurrencySymbol = () => currencySymbols[formData.currency] || '₹';

  const handleChange = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If a PIN was entered, it must be exactly 4 digits — otherwise warn the
    // user instead of silently discarding it on save.
    if (formData.kitchenPin && !/^\d{4}$/.test(formData.kitchenPin)) {
      toast.warning('Kitchen PIN must be exactly 4 digits');
      setActive('kitchenDisplay');
      return;
    }
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        currencySymbol: getCurrencySymbol(),
      };
      // Only send kitchenPin if it's a valid 4-digit PIN or empty to keep current
      if (!dataToSave.kitchenPin || dataToSave.kitchenPin.length !== 4) {
        delete dataToSave.kitchenPin;
      }
      const updatedSettings = await settingsService.updateSettings(restaurant.id, dataToSave);
      await restaurantService.update(restaurant.id, {
        name: formData.restaurantName, address: formData.address, phone: formData.phone,
      });
      if (onSettingsSaved) onSettingsSaved(updatedSettings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!restaurant) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Restaurant not found</Typography>
      </Box>
    );
  }

  const activeSection = SECTIONS.find((s) => s.id === active) || SECTIONS[0];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1040, mx: 'auto' }}>
      {/* Sticky header with primary actions */}
      <Box
        sx={{
          position: 'sticky', top: 0, zIndex: 5,
          bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider',
          px: { xs: 2, sm: 3 }, py: 1.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} lineHeight={1.1}>Settings</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{restaurant.name}</Typography>
        </Box>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:content-save-outline" width={18} />}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {onClose && (
          <IconButton onClick={onClose} aria-label="Close settings"><Icon icon="mdi:close" width={22} /></IconButton>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 3 }, p: { xs: 1.5, sm: 2.5 } }}>
        {/* Section navigation rail */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            gap: 0.5,
            overflowX: { xs: 'auto', md: 'visible' },
            flexShrink: 0,
            width: { xs: '100%', md: 232 },
            pb: { xs: 0.5, md: 0 },
            // keep the rail visible while the content scrolls on desktop
            position: { md: 'sticky' }, top: { md: 76 }, alignSelf: { md: 'flex-start' },
          }}
        >
          {SECTIONS.map((s) => {
            const selected = s.id === active;
            return (
              <Box
                key={s.id}
                component="button"
                type="button"
                onClick={() => setActive(s.id)}
                aria-current={selected}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.25,
                  textAlign: 'left', cursor: 'pointer', border: 0,
                  borderRadius: 2, px: 1.5, py: 1.1, width: { xs: 'auto', md: '100%' },
                  flexShrink: 0,
                  bgcolor: selected ? 'primary.main' : 'transparent',
                  color: selected ? 'primary.contrastText' : 'text.primary',
                  transition: 'background-color .15s ease',
                  '&:hover': { bgcolor: selected ? 'primary.main' : 'action.hover' },
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                }}
              >
                <Icon icon={s.icon} width={20} style={{ flexShrink: 0 }} />
                <Box sx={{ minWidth: 0, display: { xs: 'block', md: 'block' } }}>
                  <Typography variant="body2" fontWeight={600} noWrap lineHeight={1.2}>{s.label}</Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ display: { xs: 'none', md: 'block' }, opacity: selected ? 0.85 : 0.6 }}
                  >
                    {s.hint}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Active section content */}
        <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" mb={2.5}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.lighter', color: 'primary.main' }}>
              <Icon icon={activeSection.icon} width={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.15}>{activeSection.label}</Typography>
              <Typography variant="caption" color="text.secondary">{activeSection.hint}</Typography>
            </Box>
          </Stack>

          {/* Restaurant Information */}
          {active === 'restaurantInfo' && (
            <Box>
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
            </Box>
          )}

          {/* Business Hours */}
          {active === 'businessHours' && (
            <Box>
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
            </Box>
          )}

          {/* Currency & Pricing */}
          {active === 'currencyPricing' && (
            <Box>
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
                  <TextField label="Tax Rate" type="number" value={formData.taxRate} onChange={handleChange('taxRate')} fullWidth slotProps={{ htmlInput: { min: 0, max: 1, step: 0.01 } }} helperText="As a fraction, e.g. 0.05 = 5%" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Service Charge" type="number" value={formData.serviceCharge} onChange={handleChange('serviceCharge')} fullWidth slotProps={{ htmlInput: { min: 0, max: 1, step: 0.01 } }} helperText="As a fraction, e.g. 0.1 = 10%" />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Billing & Tax */}
          {active === 'billingTax' && (
            <Box>
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
                    <Typography variant="caption" color="warning.dark" mt={0.5} display="block">
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
            </Box>
          )}

          {/* Discount Presets */}
          {active === 'discountPresets' && (
            <DiscountPresetManager restaurantId={restaurant.id} toast={toast} />
          )}

          {/* Theme & Colors */}
          {active === 'themeColors' && (
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
          )}

          {/* Features */}
          {active === 'features' && (
            <Box>
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
            </Box>
          )}

          {/* Kitchen Display System */}
          {active === 'kitchenDisplay' && (
            <Box>
              <TextField
                label="Kitchen PIN (4 digits)"
                type={showPin ? 'text' : 'password'}
                value={formData.kitchenPin || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData((prev) => ({ ...prev, kitchenPin: val }));
                }}
                placeholder="e.g. 1234"
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { maxLength: 4, inputMode: 'numeric', pattern: '\\d{4}' },
                  input: {
                    endAdornment: (
                      <IconButton onClick={() => setShowPin(!showPin)} edge="end" size="small">
                        <Icon icon={showPin ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={20} />
                      </IconButton>
                    ),
                  },
                }}
                helperText="4-digit PIN for kitchen staff to access the Kitchen Display System."
                sx={{ mb: 2 }}
              />
              {(hasExistingPin || (formData.kitchenPin && formData.kitchenPin.length === 4)) && (
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
                  <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                    Open this URL on a tablet in the kitchen and enter the PIN above.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Promotions */}
          {active === 'promotions' && (
            <TextField
              label="Discount/Announcement Text"
              value={formData.discountText}
              onChange={handleChange('discountText')}
              placeholder="e.g., 20% OFF on all items this week!"
              fullWidth
              slotProps={{ htmlInput: { maxLength: 200 } }}
              helperText="This will be displayed prominently on your public menu. Leave empty to hide."
            />
          )}
        </Paper>
      </Box>
    </Box>
  );
};
