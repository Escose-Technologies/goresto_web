import { useState, useRef, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useToast } from '../ui/Toast';

const FOOD_TYPES = [
  { value: 'pure_veg', label: 'Pure Veg', desc: 'Strictly vegetarian, no egg' },
  { value: 'egg', label: 'Egg', desc: 'Vegetarian & egg items' },
  { value: 'non_veg', label: 'Non-Veg', desc: 'Includes non-veg, egg & veg' },
  { value: 'both', label: 'Veg & Non-Veg', desc: 'Serves all types' },
];

export const RestaurantProfileForm = ({ restaurant, settings, onSave, onCancel }) => {
  const toast = useToast();
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
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

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Restaurant Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Changes saved here will reflect on your public menu page.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Cover Image */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>Cover Image</Typography>
        <Box sx={{ mb: 2 }}>
          {coverPreview ? (
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider', height: { xs: 150, sm: 220 } }}>
              <Box component="img" src={coverPreview} alt="Cover" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton
                onClick={() => handleRemoveImage('cover')}
                sx={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, p: 0, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
              >
                <Icon icon="mdi:close" width={18} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ height: { xs: 150, sm: 220 }, border: '2px dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', bgcolor: 'grey.50' }}>
              <Icon icon="mdi:image-outline" width={48} />
              <Typography variant="body2">Add a cover image</Typography>
            </Box>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} style={{ display: 'none' }} id="cover-upload" disabled={isUploading} />
          <label htmlFor="cover-upload">
            <Button variant="outlined" size="small" component="span" disabled={isUploading} sx={{ mt: 1 }}>
              {isUploading ? 'Uploading...' : coverPreview ? 'Change Cover' : 'Upload Cover'}
            </Button>
          </label>
        </Box>

        {/* Logo */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>Restaurant Logo</Typography>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Box sx={{ position: 'relative' }}>
            <Avatar src={logoPreview || undefined} sx={{ width: { xs: 80, sm: 120 }, height: { xs: 80, sm: 120 }, bgcolor: 'grey.200' }}>
              <Icon icon="mdi:store" width={40} />
            </Avatar>
            {logoPreview && (
              <IconButton
                onClick={() => handleRemoveImage('logo')}
                sx={{ position: 'absolute', top: -4, right: -4, width: 24, height: 24, p: 0, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
              >
                <Icon icon="mdi:close" width={14} />
              </IconButton>
            )}
          </Box>
          <Box>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} style={{ display: 'none' }} id="logo-upload" disabled={isUploading} />
            <label htmlFor="logo-upload">
              <Button variant="outlined" size="small" component="span" disabled={isUploading}>
                {logoPreview ? 'Change' : 'Upload'}
              </Button>
            </label>
            <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
              JPG, PNG, GIF. Max 5MB
            </Typography>
          </Box>
        </Stack>

        {/* Basic Info */}
        <TextField label="Restaurant Name" value={formData.name} onChange={handleChange('name')} required fullWidth sx={{ mb: 2 }} />
        <TextField label="Description" value={formData.description} onChange={handleChange('description')} fullWidth multiline rows={3} placeholder="Tell customers about your restaurant..." sx={{ mb: 2 }} />

        {/* Food Type */}
        <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Food Type</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          What type of food does your restaurant serve?
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={3}>
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

        {/* Contact */}
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Contact Information</Typography>
        <TextField label="Address" value={formData.address} onChange={handleChange('address')} fullWidth placeholder="123 Main Street, City, State" sx={{ mb: 2 }} />
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone" type="tel" value={formData.phone} onChange={handleChange('phone')} fullWidth placeholder="+91 98765 43210" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" type="email" value={formData.email} onChange={handleChange('email')} fullWidth placeholder="contact@restaurant.com" />
          </Grid>
        </Grid>
        <TextField label="Website" type="url" value={formData.website} onChange={handleChange('website')} fullWidth placeholder="https://www.restaurant.com" sx={{ mb: 2 }} />

        {/* Social Links */}
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Social Media</Typography>
        <Stack spacing={2} mb={2}>
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
            label="Twitter"
            value={formData.socialLinks.twitter}
            onChange={(e) => setFormData((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: e.target.value } }))}
            fullWidth
            placeholder="@yourrestaurant"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="mdi:twitter" width={20} /></InputAdornment> } }}
          />
        </Stack>

        {/* Operating Hours */}
        <Typography variant="subtitle1" fontWeight={700} mb={2}>Operating Hours</Typography>
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Opening Time" type="time" value={formData.openingTime} onChange={handleChange('openingTime')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Closing Time" type="time" value={formData.closingTime} onChange={handleChange('closingTime')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
        </Grid>

        {/* Actions */}
        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">Save Profile</Button>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>Cancel</Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default RestaurantProfileForm;
