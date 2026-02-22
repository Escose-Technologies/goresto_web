import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { restaurantService, userService } from '../services/apiService';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    adminId: '',
  });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [restaurantsData, usersData] = await Promise.all([
        restaurantService.getAll(),
        userService.getAll(),
      ]);
      setRestaurants(restaurantsData);
      setUsers(usersData.filter(u => u.role === 'restaurant_admin'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeConfirm = () => setConfirmModal({ open: false, title: '', message: '', onConfirm: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRestaurant) {
        await restaurantService.update(editingRestaurant.id, formData);
      } else {
        await restaurantService.create(formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      toast.error('Error saving restaurant: ' + error.message);
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      adminId: restaurant.adminId || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Restaurant',
      message: 'Are you sure you want to delete this restaurant? This cannot be undone.',
      onConfirm: async () => {
        closeConfirm();
        try {
          await restaurantService.delete(id);
          await loadData();
        } catch (error) {
          toast.error('Error deleting restaurant: ' + error.message);
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', adminId: '' });
    setEditingRestaurant(null);
    setShowForm(false);
  };

  const getAdminName = (adminId) => {
    const admin = users.find(u => u.id === adminId);
    return admin ? admin.email : 'Not assigned';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', px: 3, py: 2, boxShadow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 90 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Super Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Manage restaurants and admins</Typography>
        </Box>
        <Button variant="contained" color="error" onClick={logout}>Logout</Button>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700}>Restaurants</Typography>
          <Button variant="contained" onClick={() => setShowForm(true)} startIcon={<Icon icon="mdi:plus" width={18} />}>
            Add Restaurant
          </Button>
        </Stack>

        {showForm && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Restaurant Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required fullWidth />
                </Grid>
              </Grid>
              <TextField label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required fullWidth sx={{ mb: 2 }} />
              <TextField label="Assign Admin" select value={formData.adminId} onChange={(e) => setFormData({ ...formData, adminId: e.target.value })} fullWidth sx={{ mb: 2 }}>
                <MenuItem value="">Select Admin</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>{user.email}</MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={1.5}>
                <Button type="submit" variant="contained">
                  {editingRestaurant ? 'Update' : 'Create'}
                </Button>
                <Button variant="outlined" onClick={resetForm}>Cancel</Button>
              </Stack>
            </Box>
          </Card>
        )}

        {restaurants.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No restaurants found. Add your first restaurant!</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {restaurants.map((restaurant) => (
              <Grid key={restaurant.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{restaurant.name}</Typography>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => handleEdit(restaurant)} title="Edit">
                        <Icon icon="mdi:pencil" width={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(restaurant.id)} title="Delete">
                        <Icon icon="mdi:close" width={18} />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Address:</strong> {restaurant.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong> {restaurant.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Admin:</strong> {getAdminName(restaurant.adminId)}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </Box>
  );
};
