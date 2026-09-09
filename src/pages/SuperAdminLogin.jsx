import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';

export const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fieldSx = {
    '& .MuiInputBase-root': { color: '#F8FAFC' },
    '& .MuiInputLabel-root': { color: '#94A3B8' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#60A5FA' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.35)' },
    '& :hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.6)' },
    '& .MuiSvgIcon-root, & .iconify': { color: '#94A3B8' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'superadmin');
      navigate('/super-admin');
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
        bgcolor: '#0F172A',
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          p: { xs: 3, sm: 4 },
          bgcolor: '#1E293B',
          color: '#F8FAFC',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Icon icon="mdi:shield-key-outline" width={40} color="#60A5FA" />
          <Typography variant="h6" fontWeight={700} mt={1}>
            Platform Control
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Authorized personnel only
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="off"
            sx={{ mb: 2, ...fieldSx }}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="off"
            sx={{ mb: 3, ...fieldSx }}
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
      </Card>
    </Box>
  );
};

export default SuperAdminLogin;
