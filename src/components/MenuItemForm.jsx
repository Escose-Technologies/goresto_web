import { useState, useEffect, useRef } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useToast } from './ui/Toast';
import { searchIndianFoods, INDIAN_FOOD_CATEGORIES } from '../data/indianFoodDatabase';

const allergenOptions = [
  { id: 'nuts', label: 'Nuts' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'soy', label: 'Soy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'fish', label: 'Fish' },
  { id: 'sesame', label: 'Sesame' },
];

const labelOptions = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'organic', label: 'Organic' },
  { id: 'sugar-free', label: 'Sugar Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'low-calorie', label: 'Low Calorie' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'chef-special', label: 'Chef Special' },
  { id: 'popular', label: 'Popular' },
  { id: 'new', label: 'New' },
];

const DIETARY_COLORS = { veg: '#22C55E', egg: '#F59E0B', 'non-veg': '#EF4444' };
const DIETARY_LABELS = { veg: 'Vegetarian', egg: 'Contains Egg', 'non-veg': 'Non-Veg' };

const DietaryIcon = ({ type, size = 14 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      border: `2px solid ${DIETARY_COLORS[type] || '#ccc'}`,
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        width: size * 0.5,
        height: size * 0.5,
        bgcolor: DIETARY_COLORS[type] || '#ccc',
        borderRadius: type === 'non-veg' ? 0 : '50%',
        ...(type === 'non-veg' && {
          width: 0,
          height: 0,
          bgcolor: 'transparent',
          borderLeft: `${size * 0.25}px solid transparent`,
          borderRight: `${size * 0.25}px solid transparent`,
          borderBottom: `${size * 0.5}px solid ${DIETARY_COLORS[type]}`,
        }),
      }}
    />
  </Box>
);

export const MenuItemForm = ({ item, categories, foodType, onSave, onCancel, onDelete }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    available: true,
    dietary: { type: 'veg', spiceLevel: 0, allergens: [], labels: [] },
  });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const errors = {
    name: !formData.name ? 'Item name is required' : '',
    price: !formData.price ? 'Price is required' : Number(formData.price) <= 0 ? 'Price must be greater than 0' : '',
    category: !formData.category ? 'Category is required' : '',
  };

  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const allowedDietaryTypes = (() => {
    switch (foodType) {
      case 'pure_veg': return ['veg'];
      case 'egg': return ['veg', 'egg'];
      case 'non_veg':
      case 'both':
      default: return ['veg', 'egg', 'non-veg'];
    }
  })();

  useEffect(() => {
    if (item) {
      const dietaryType = item.dietary?.type || 'veg';
      setFormData({
        name: item.name || '',
        price: item.price || '',
        description: item.description || '',
        category: item.category || '',
        image: item.image || '',
        available: item.available !== undefined ? item.available : true,
        dietary: {
          ...(item.dietary || { type: 'veg', spiceLevel: 0, allergens: [], labels: [] }),
          type: allowedDietaryTypes.includes(dietaryType) ? dietaryType : 'veg',
        },
      });
      setImagePreview(item.image || null);
    } else {
      setImagePreview(null);
    }
  }, [item]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.warning('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.warning('Image size should be less than 5MB'); return; }
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        setImagePreview(reader.result);
        setIsUploading(false);
      };
      reader.onerror = () => { toast.error('Error reading image file'); setIsUploading(false); };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing image: ' + error.message);
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSuggestionSelect = (suggestion) => {
    if (!suggestion) return;
    const dietaryType = suggestion.dietary === 'non_veg' ? 'non-veg' : suggestion.dietary;
    const existingLabels = formData.dietary.labels || [];
    const mergedLabels = [...new Set([...existingLabels, ...(suggestion.labels || [])])];
    setFormData((prev) => ({
      ...prev,
      name: suggestion.name,
      category: suggestion.category,
      description: suggestion.description || '',
      dietary: {
        ...prev.dietary,
        type: dietaryType,
        spiceLevel: suggestion.spiceLevel ?? 0,
        allergens: suggestion.allergens || [],
        labels: mergedLabels,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...formData, price: parseFloat(formData.price) });
    } finally {
      setSaving(false);
    }
  };

  const allCategories = [...new Set([...categories, ...INDIAN_FOOD_CATEGORIES])];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2.5}>
        {item ? 'Edit Menu Item' : 'Add New Menu Item'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Name + Price */}
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <Autocomplete
              freeSolo
              options={nameSuggestions}
              getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.name)}
              inputValue={formData.name}
              onInputChange={(_, value) => {
                setFormData((prev) => ({ ...prev, name: value }));
                setNameSuggestions(searchIndianFoods(value, foodType));
              }}
              onChange={(_, value) => {
                if (value && typeof value !== 'string') handleSuggestionSelect(value);
              }}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DietaryIcon type={option.dietary === 'non_veg' ? 'non-veg' : option.dietary} size={12} />
                    <span style={{ flex: 1 }}>{option.name}</span>
                    <Typography variant="caption" color="text.secondary">{option.category}</Typography>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Item Name" required placeholder="Start typing a dish name..." onBlur={handleBlur('name')} error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              label="Price (₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              onBlur={handleBlur('price')}
              error={touched.price && !!errors.price}
              helperText={touched.price && errors.price}
              required
              fullWidth
              slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
            />
          </Grid>
        </Grid>

        {/* Category */}
        <Box mb={2}>
          <Autocomplete
            freeSolo
            options={allCategories}
            value={formData.category}
            onInputChange={(_, value) => setFormData((prev) => ({ ...prev, category: value }))}
            renderInput={(params) => (
              <TextField {...params} label="Category" required placeholder="Type or select category" onBlur={handleBlur('category')} error={touched.category && !!errors.category} helperText={touched.category && errors.category} />
            )}
          />
          {categories.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={1}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, alignSelf: 'center' }}>
                Quick:
              </Typography>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  variant={formData.category === cat ? 'filled' : 'outlined'}
                  color={formData.category === cat ? 'primary' : 'default'}
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          )}
          {formData.category && !categories.includes(formData.category) && (
            <Typography variant="caption" color="primary" mt={0.5}>
              New category will be created: {formData.category}
            </Typography>
          )}
        </Box>

        {/* Description */}
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {/* Dietary Type */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Dietary Type *
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={2}>
          {allowedDietaryTypes.map((type) => (
            <Button
              key={type}
              variant={formData.dietary.type === type ? 'contained' : 'outlined'}
              onClick={() => setFormData((prev) => ({ ...prev, dietary: { ...prev.dietary, type } }))}
              startIcon={<DietaryIcon type={type} size={14} />}
              sx={{
                justifyContent: 'flex-start',
                ...(formData.dietary.type !== type && { color: 'text.secondary', borderColor: 'divider' }),
              }}
            >
              {DIETARY_LABELS[type]}
            </Button>
          ))}
        </Stack>

        {/* Spice Level */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Spice Level
        </Typography>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
          {[0, 1, 2, 3].map((level) => (
            <Button
              key={level}
              variant={formData.dietary.spiceLevel === level ? 'contained' : 'outlined'}
              color={formData.dietary.spiceLevel === level ? 'error' : 'inherit'}
              onClick={() => setFormData((prev) => ({ ...prev, dietary: { ...prev.dietary, spiceLevel: level } }))}
              sx={{
                flexDirection: 'column',
                minWidth: 70,
                py: 1,
                ...(formData.dietary.spiceLevel !== level && { borderColor: 'divider', color: 'text.secondary' }),
              }}
            >
              <span>{level === 0 ? '🚫' : '🌶️'.repeat(level)}</span>
              <Typography variant="caption">
                {level === 0 ? 'None' : level === 1 ? 'Light' : level === 2 ? 'Medium' : 'Hot'}
              </Typography>
            </Button>
          ))}
        </Stack>

        {/* Allergens — native checkboxes */}
        <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
          Allergens
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Select any allergens present in this dish
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} mb={2}>
          {allergenOptions.map((allergen) => (
            <Box
              key={allergen.id}
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                bgcolor: 'grey.50',
                border: 1,
                borderColor: formData.dietary.allergens?.includes(allergen.id) ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                fontSize: 14,
                minHeight: 36,
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <input
                type="checkbox"
                checked={formData.dietary.allergens?.includes(allergen.id) || false}
                onChange={() => {
                  const curr = formData.dietary.allergens || [];
                  const next = curr.includes(allergen.id) ? curr.filter((a) => a !== allergen.id) : [...curr, allergen.id];
                  setFormData((prev) => ({ ...prev, dietary: { ...prev.dietary, allergens: next } }));
                }}
                style={{ accentColor: '#3385F0' }}
              />
              <span>{allergen.label}</span>
            </Box>
          ))}
        </Stack>

        {/* Labels — native checkboxes */}
        <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
          Labels (Optional)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Add labels to highlight special attributes
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} mb={2}>
          {labelOptions.map((labelOpt) => (
            <Box
              key={labelOpt.id}
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: formData.dietary.labels?.includes(labelOpt.id) ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                fontSize: 14,
                minHeight: 36,
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <input
                type="checkbox"
                checked={formData.dietary.labels?.includes(labelOpt.id) || false}
                onChange={() => {
                  const curr = formData.dietary.labels || [];
                  const next = curr.includes(labelOpt.id) ? curr.filter((l) => l !== labelOpt.id) : [...curr, labelOpt.id];
                  setFormData((prev) => ({ ...prev, dietary: { ...prev.dietary, labels: next } }));
                }}
                style={{ accentColor: '#3385F0' }}
              />
              <span>{labelOpt.label}</span>
            </Box>
          ))}
        </Stack>

        {/* Image Upload */}
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Item Image
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <Box sx={{ position: 'relative' }}>
            {imagePreview ? (
              <Box sx={{ position: 'relative', width: 120, height: 120, borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                <Box component="img" src={imagePreview} alt="Preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', width: 28, height: 28, p: 0, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                >
                  <Icon icon="mdi:close" width={16} />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ width: 120, height: 120, border: '2px dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                <Icon icon="mdi:image-outline" width={32} />
                <Typography variant="caption">No image</Typography>
              </Box>
            )}
          </Box>
          <Box>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="menu-image-upload" disabled={isUploading} />
            <label htmlFor="menu-image-upload">
              <Button variant="outlined" size="small" component="span" disabled={isUploading}>
                {isUploading ? 'Uploading...' : imagePreview ? 'Change Image' : 'Choose Image'}
              </Button>
            </label>
            <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
              JPG, PNG, GIF. Max 5MB
            </Typography>
          </Box>
        </Stack>

        {/* Available checkbox */}
        <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mb: 2 }}>
          <input
            type="checkbox"
            checked={formData.available}
            onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
            style={{ accentColor: '#3385F0' }}
          />
          <Typography variant="body2" fontWeight={500}>Available</Typography>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1.5} mt={1}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {item ? 'Update' : 'Create'}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          {item && onDelete && (
            <Button variant="outlined" color="error" onClick={onDelete} type="button" sx={{ ml: 'auto' }}>
              Delete
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
