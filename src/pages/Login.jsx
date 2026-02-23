import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const Login = () => {
  const [role, setRole] = useState('restaurant_admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
      navigate(role === 'superadmin' ? '/super-admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'grey.50',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size="xlarge" />
        </Link>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Smart Restaurant Management, Simplified
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 420, width: '100%', p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" mb={0.5}>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Sign in to access your dashboard
        </Typography>

        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={(_, val) => val && setRole(val)}
          fullWidth
          size="small"
          sx={{ mb: 3 }}
        >
          <ToggleButton value="restaurant_admin">Admin</ToggleButton>
          <ToggleButton value="superadmin">Super Admin</ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:email-outline" width={20} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:lock-outline" width={20} />
                  </InputAdornment>
                ),
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        {import.meta.env.DEV && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={1}>
              Quick Login
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => { setEmail('superadmin@goresto.com'); setPassword('admin123'); setRole('superadmin'); }}
                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
              >
                <span>Super Admin</span>
                <Typography variant="caption" color="text.secondary">superadmin@goresto.com</Typography>
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => { setEmail('owner@restaurant.com'); setPassword('owner123'); setRole('restaurant_admin'); }}
                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
              >
                <span>Restaurant Admin</span>
                <Typography variant="caption" color="text.secondary">owner@restaurant.com</Typography>
              </Button>
            </Stack>
          </Box>
        )}

        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#3385F0', fontWeight: 600, textDecoration: 'none' }}>Register your restaurant</Link>
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
