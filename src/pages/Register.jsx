import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { Logo } from '../components/Logo';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const CUISINE_OPTIONS = [
  'North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental',
  'Mughlai', 'Tandoori', 'Street Food', 'Biryani', 'Seafood',
  'Punjabi', 'Bengali', 'Gujarati', 'Rajasthani', 'Kerala',
  'Hyderabadi', 'Chettinad', 'Indo-Chinese', 'Fast Food', 'Desserts',
];

const FOOD_TYPES = [
  { value: 'pure_veg', label: 'Pure Veg' },
  { value: 'egg', label: 'Egg' },
  { value: 'non_veg', label: 'Non-Veg' },
  { value: 'both', label: 'Both (Veg & Non-Veg)' },
];

export const Register = () => {
  const [formData, setFormData] = useState({
    ownerName: '', email: '', password: '', phone: '',
    restaurantName: '', address: '', foodType: 'both', cuisineTypes: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateField = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleCuisine = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : prev.cuisineTypes.length < 20
          ? [...prev.cuisineTypes, cuisine]
          : prev.cuisineTypes,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/registrations/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Registration failed');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'grey.50' }}>
        <Card sx={{ maxWidth: 460, width: '100%', p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Icon icon="mdi:check-circle" width={64} color="#4caf50" />
          <Typography variant="h5" fontWeight={700} mt={2} mb={1}>
            Registration Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Your restaurant registration is pending approval. You will be able to log in once the admin approves your account.
          </Typography>
          <Button component={Link} to="/goresto-admin" variant="contained" size="large">
            Go to Login
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'grey.50' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size="xlarge" />
        </Link>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Register your restaurant
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 560, width: '100%', p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" mb={0.5}>
          Restaurant Registration
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Fill in your details to get started
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Owner Details */}
          <Typography variant="subtitle2" color="text.secondary" mb={1}>Owner Details</Typography>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Owner Name"
                value={formData.ownerName}
                onChange={updateField('ownerName')}
                required
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="mdi:account-outline" width={20} /></InputAdornment> } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={updateField('phone')}
                required
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="mdi:phone-outline" width={20} /></InputAdornment> } }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={updateField('email')}
            required
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="mdi:email-outline" width={20} /></InputAdornment> } }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={updateField('password')}
            required
            fullWidth
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Icon icon="mdi:lock-outline" width={20} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Restaurant Details */}
          <Typography variant="subtitle2" color="text.secondary" mb={1}>Restaurant Details</Typography>
          <TextField
            label="Restaurant Name"
            value={formData.restaurantName}
            onChange={updateField('restaurantName')}
            required
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Icon icon="mdi:store-outline" width={20} /></InputAdornment> } }}
          />

          <TextField
            label="Address"
            value={formData.address}
            onChange={updateField('address')}
            required
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Food Type"
                select
                value={formData.foodType}
                onChange={updateField('foodType')}
                fullWidth
              >
                {FOOD_TYPES.map((ft) => (
                  <MenuItem key={ft.value} value={ft.value}>{ft.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Cuisine Types <Typography component="span" variant="caption" color="text.disabled">(optional)</Typography>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
            {CUISINE_OPTIONS.map((cuisine) => (
              <Chip
                key={cuisine}
                label={cuisine}
                size="small"
                onClick={() => toggleCuisine(cuisine)}
                color={formData.cuisineTypes.includes(cuisine) ? 'primary' : 'default'}
                variant={formData.cuisineTypes.includes(cuisine) ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {loading ? 'Registering...' : 'Register Restaurant'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/goresto-admin" style={{ color: '#3385F0', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<Icon icon="mdi:arrow-left" width={16} />}
            size="small"
            color="inherit"
          >
            Back to Home
          </Button>
        </Box>
      </Card>
    </Box>
  );
};
