import { useState, useRef, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useToast } from '../ui/Toast';

const FOOD_TYPES = [
  { value: 'pure_veg', label: 'Pure Veg', desc: 'Strictly vegetarian, no egg' },
  { value: 'egg', label: 'Egg', desc: 'Vegetarian & egg items' },
  { value: 'veg_egg', label: 'Veg + Egg', desc: 'Vegetarian & egg items' },
  { value: 'non_veg', label: 'Non-Veg', desc: 'Includes non-veg, egg & veg' },
  { value: 'both', label: 'Veg & Non-Veg', desc: 'Serves all types' },
];

// Defined outside the component so it isn't remounted on every keystroke.
const SectionCard = ({ icon, title, subtitle, children, sx }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, height: '100%', ...sx }}>
    <Stack direction="row" spacing={1.25} alignItems="center" mb={2}>
      <Box sx={{ width: 34, height: 34, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.lighter', color: 'primary.main', flexShrink: 0 }}>
        <Icon icon={icon} width={20} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={800} lineHeight={1.15}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Stack>
    {children}
  </Paper>
);

export const RestaurantProfileForm = ({ restaurant, settings, onSave, onCancel }) => {
  const toast = useToast();
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    logo: '',
    coverImage: '',
    foodType: 'both',
    address: '',
    phone: '',
    email: '',
    website: '',
    openingTime: '09:00',
    closingTime: '22:00',
    socialLinks: { instagram: '', facebook: '', twitter: '' },
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        tagline: restaurant.tagline || '',
        description: restaurant.description || '',
        logo: restaurant.logo || '',
        coverImage: restaurant.coverImage || '',
        foodType: restaurant.foodType || 'both',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        openingTime: settings?.openingTime || '09:00',
        closingTime: settings?.closingTime || '22:00',
        socialLinks: restaurant.socialLinks || { instagram: '', facebook: '', twitter: '' },
      });
      if (restaurant.logo) setLogoPreview(restaurant.logo);
      if (restaurant.coverImage) setCoverPreview(restaurant.coverImage);
    }
  }, [restaurant]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.warning('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.warning('Image size should be less than 5MB'); return; }
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setFormData((prev) => ({ ...prev, logo: reader.result }));
          setLogoPreview(reader.result);
        } else {
          setFormData((prev) => ({ ...prev, coverImage: reader.result }));
          setCoverPreview(reader.result);
        }
        setIsUploading(false);
      };
      reader.onerror = () => { toast.error('Error reading image file'); setIsUploading(false); };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing image: ' + error.message);
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'logo') {
      setFormData((prev) => ({ ...prev, logo: '' }));
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      setFormData((prev) => ({ ...prev, coverImage: '' }));
      setCoverPreview(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const activeFoodType = FOOD_TYPES.find((f) => f.value === formData.foodType);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 980, mx: 'auto' }}>
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
          <Typography variant="h6" fontWeight={800} lineHeight={1.1}>Restaurant Profile</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>Shown to customers on your public menu</Typography>
        </Box>
        <Button
          type="submit"
          variant="contained"
          disabled={saving || isUploading}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:content-save-outline" width={18} />}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {onCancel && (
          <IconButton onClick={onCancel} aria-label="Close profile"><Icon icon="material-symbols:close-rounded" width={22} /></IconButton>
        )}
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {/* Hero: cover + logo + live name preview */}
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
          <Box sx={{ position: 'relative', height: { xs: 140, sm: 200 }, bgcolor: 'grey.100' }}>
            {coverPreview ? (
              <Box component="img" src={coverPreview} alt="Cover" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.disabled', background: 'linear-gradient(135deg, #EAF3FD 0%, #F7FAFC 100%)' }}>
                <Icon icon="mdi:image-outline" width={40} />
                <Typography variant="caption">Add a cover image — 1600×400 looks best</Typography>
              </Box>
            )}
            {/* Cover actions */}
            <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 10, right: 10 }}>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} style={{ display: 'none' }} id="cover-upload" disabled={isUploading} />
              <label htmlFor="cover-upload">
                <Button component="span" size="small" variant="contained" disabled={isUploading} startIcon={<Icon icon="mdi:camera-outline" width={16} />} sx={{ bgcolor: 'rgba(17,20,23,0.72)', '&:hover': { bgcolor: 'rgba(17,20,23,0.88)' } }}>
                  {coverPreview ? 'Change' : 'Add cover'}
                </Button>
              </label>
              {coverPreview && (
                <IconButton size="small" onClick={() => handleRemoveImage('cover')} sx={{ bgcolor: 'rgba(17,20,23,0.72)', color: 'white', '&:hover': { bgcolor: 'rgba(17,20,23,0.88)' } }}>
                  <Icon icon="mdi:delete-outline" width={18} />
                </IconButton>
              )}
            </Stack>
          </Box>

          {/* Logo overlapping the cover + name preview */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ mt: { xs: -5, sm: -6 } }}>
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={logoPreview || undefined}
                  sx={{ width: { xs: 84, sm: 104 }, height: { xs: 84, sm: 104 }, bgcolor: 'grey.200', border: '4px solid', borderColor: 'background.paper', boxShadow: 2 }}
                >
                  <Icon icon="mdi:storefront" width={40} />
                </Avatar>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} style={{ display: 'none' }} id="logo-upload" disabled={isUploading} />
                <label htmlFor="logo-upload">
                  <IconButton component="span" size="small" disabled={isUploading} sx={{ position: 'absolute', bottom: -2, right: -2, bgcolor: 'primary.main', color: 'primary.contrastText', width: 30, height: 30, '&:hover': { bgcolor: 'primary.dark' } }}>
                    <Icon icon="mdi:camera-outline" width={16} />
                  </IconButton>
                </label>
                {logoPreview && (
                  <IconButton size="small" onClick={() => handleRemoveImage('logo')} sx={{ position: 'absolute', top: -2, right: -2, bgcolor: 'error.main', color: 'white', width: 22, height: 22, '&:hover': { bgcolor: 'error.dark' } }}>
                    <Icon icon="material-symbols:close-rounded" width={13} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ minWidth: 0, pb: 0.5 }}>
                <Typography variant="h6" fontWeight={800} noWrap>{formData.name || 'Your restaurant'}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                  <Chip size="small" color="primary" variant="outlined" label={activeFoodType?.label || 'Veg & Non-Veg'} />
                  {(formData.openingTime && formData.closingTime) && (
                    <Typography variant="caption" color="text.secondary">{formData.openingTime}–{formData.closingTime}</Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>Logo: JPG, PNG or GIF, up to 5MB.</Typography>
          </Box>
        </Paper>

        <Grid container spacing={2.5}>
          {/* Basics */}
          <Grid size={12}>
            <SectionCard icon="mdi:card-text-outline" title="Basics" subtitle="Name, story and what you serve">
              <TextField label="Restaurant Name" value={formData.name} onChange={handleChange('name')} required fullWidth sx={{ mb: 2 }} />
              <TextField label="Tagline" value={formData.tagline} onChange={handleChange('tagline')} fullWidth placeholder="A short catchy line — e.g. “Authentic flavours, served fresh”" inputProps={{ maxLength: 120 }} helperText={`${(formData.tagline || '').length}/120 · shown under your name`} sx={{ mb: 2 }} />
              <TextField label="Description" value={formData.description} onChange={handleChange('description')} fullWidth multiline rows={3} placeholder="Tell customers about your restaurant — your story, specialities, what makes you unique…" sx={{ mb: 2 }} />
              <Typography variant="body2" fontWeight={600} mb={0.5}>Food Type</Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>{activeFoodType?.desc || 'What type of food do you serve?'}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {FOOD_TYPES.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    variant={formData.foodType === opt.value ? 'filled' : 'outlined'}
                    color={formData.foodType === opt.value ? 'primary' : 'default'}
                    onClick={() => setFormData((prev) => ({ ...prev, foodType: opt.value }))}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </SectionCard>
          </Grid>

          {/* Contact */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard icon="mdi:map-marker-outline" title="Contact" subtitle="How customers reach you">
              <TextField label="Address" value={formData.address} onChange={handleChange('address')} fullWidth placeholder="123 Main Street, City, State" sx={{ mb: 2 }} />
              <TextField label="Phone" type="tel" value={formData.phone} onChange={handleChange('phone')} fullWidth placeholder="+91 98765 43210" sx={{ mb: 2 }} />
              <TextField label="Email" type="email" value={formData.email} onChange={handleChange('email')} fullWidth placeholder="contact@restaurant.com" sx={{ mb: 2 }} />
              <TextField label="Website" type="url" value={formData.website} onChange={handleChange('website')} fullWidth placeholder="https://www.restaurant.com" />
            </SectionCard>
          </Grid>

          {/* Social */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard icon="mdi:share-variant-outline" title="Social media" subtitle="Handles or full links">
              <Stack spacing={2}>
                <TextField
                  label="Instagram"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                  fullWidth
                  placeholder="@yourrestaurant"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="mdi:instagram" width={20} /></InputAdornment> } }}
                />
                <TextField
                  label="Facebook"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: e.target.value } }))}
                  fullWidth
                  placeholder="facebook.com/yourrestaurant"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="mdi:facebook" width={20} /></InputAdornment> } }}
                />
                <TextField
                  label="Twitter / X"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: e.target.value } }))}
                  fullWidth
                  placeholder="@yourrestaurant"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="ri:twitter-x-fill" width={18} /></InputAdornment> } }}
                />
              </Stack>
            </SectionCard>
          </Grid>

          {/* Hours */}
          <Grid size={12}>
            <SectionCard icon="mdi:clock-outline" title="Operating hours" subtitle="Shown on your public menu">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Opening Time" type="time" value={formData.openingTime} onChange={handleChange('openingTime')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Closing Time" type="time" value={formData.closingTime} onChange={handleChange('closingTime')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RestaurantProfileForm;
