import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { restaurantService, userService, registrationService } from '../services/apiService';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const DetailRow = ({ icon, children }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Icon icon={icon} width={16} style={{ color: 'rgba(0,0,0,0.4)', flexShrink: 0 }} />
    <Typography variant="body2" color="text.secondary" noWrap>{children}</Typography>
  </Stack>
);

const Stat = ({ value, label }) => (
  <Box sx={{ textAlign: 'center', flex: 1 }}>
    <Typography variant="subtitle2" fontWeight={700} lineHeight={1.1}>{value ?? 0}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Box>
);

export const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
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
      const [restaurantsData, usersData, pendingData] = await Promise.all([
        restaurantService.getAll(),
        userService.getAll(),
        registrationService.getPending().catch(() => []),
      ]);
      setRestaurants(restaurantsData);
      setUsers(usersData.filter(u => u.role === 'restaurant_admin'));
      setPendingRegistrations(pendingData);
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

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', adminId: '' });
    setEditingRestaurant(null);
    setShowForm(false);
  };

  const getAdminName = (adminId) => {
    const admin = users.find(u => u.id === adminId);
    return admin ? admin.email : 'Not assigned';
  };

  const handleApprove = async (id) => {
    try {
      await registrationService.approve(id);
      toast.success('Restaurant approved successfully');
      await loadData();
    } catch (error) {
      toast.error('Error approving: ' + error.message);
    }
  };

  const handleReject = (id) => {
    setConfirmModal({
      open: true,
      title: 'Reject Registration',
      message: 'Are you sure you want to reject this restaurant registration?',
      onConfirm: async () => {
        closeConfirm();
        try {
          await registrationService.reject(id);
          toast.success('Registration rejected');
          await loadData();
        } catch (error) {
          toast.error('Error rejecting: ' + error.message);
        }
      },
    });
  };

  const handleDeactivate = (id) => {
    setConfirmModal({
      open: true,
      title: 'Suspend Restaurant',
      message: 'This will suspend the restaurant. The admin will be signed out shortly and the public menu will go offline until reactivated. Continue?',
      confirmText: 'Suspend',
      variant: 'warning',
      onConfirm: async () => {
        closeConfirm();
        try {
          await restaurantService.deactivate(id);
          toast.success('Restaurant deactivated');
          await loadData();
        } catch (error) {
          toast.error('Error deactivating: ' + error.message);
        }
      },
    });
  };

  const handleActivate = async (id) => {
    try {
      await restaurantService.activate(id);
      toast.success('Restaurant reactivated');
      await loadData();
    } catch (error) {
      toast.error('Error reactivating: ' + error.message);
    }
  };

  const statusChip = (status) => {
    const config = {
      active: { color: 'success', label: 'Active' },
      pending: { color: 'warning', label: 'Pending' },
      rejected: { color: 'error', label: 'Rejected' },
      suspended: { color: 'default', label: 'Suspended' },
    };
    const c = config[status] || { color: 'default', label: status };
    return <Chip size="small" color={c.color} label={c.label} />;
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
        {/* Pending Registrations */}
        {pendingRegistrations.length > 0 && (
          <Card sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Icon icon="mdi:clock-alert-outline" width={22} color="#ed6c02" />
              <Typography variant="h6" fontWeight={700}>
                Pending Registrations ({pendingRegistrations.length})
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              {pendingRegistrations.map((reg) => (
                <Grid key={reg.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} mb={0.5}>{reg.name}</Typography>
                    <Stack spacing={0.25} mb={1.5}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Email:</strong> {reg.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Phone:</strong> {reg.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Address:</strong> {reg.address}
                      </Typography>
                      {reg.description && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Owner:</strong> {reg.description.replace('Owner: ', '')}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        Applied: {new Date(reg.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(reg.id)} startIcon={<Icon icon="mdi:check" width={16} />}>
                        Approve
                      </Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleReject(reg.id)} startIcon={<Icon icon="mdi:close" width={16} />}>
                        Reject
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        )}

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
                <Card
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: restaurant.status === 'suspended' ? 'error.main' : 'divider',
                    bgcolor: restaurant.status === 'suspended' ? 'rgba(211, 47, 47, 0.04)' : 'background.paper',
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{restaurant.name}</Typography>
                      {restaurant.status && statusChip(restaurant.status)}
                    </Box>
                    <Tooltip title="Edit details">
                      <IconButton size="small" onClick={() => handleEdit(restaurant)}>
                        <Icon icon="mdi:pencil" width={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Stack spacing={0.75} sx={{ flex: 1, opacity: restaurant.status === 'suspended' ? 0.6 : 1 }}>
                    <DetailRow icon="mdi:account-tie-outline">{getAdminName(restaurant.adminId)}</DetailRow>
                    <DetailRow icon="mdi:map-marker-outline">{restaurant.address || '—'}</DetailRow>
                    <DetailRow icon="mdi:phone-outline">{restaurant.phone || '—'}</DetailRow>
                    <DetailRow icon="mdi:email-outline">{restaurant.email || '—'}</DetailRow>
                    {restaurant.cuisineTypes?.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ pt: 0.25 }}>
                        {restaurant.cuisineTypes.map((c) => (
                          <Chip key={c} label={c} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    )}
                  </Stack>

                  {restaurant.counts && (
                    <Stack
                      direction="row"
                      sx={{ mt: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}
                    >
                      <Stat value={restaurant.counts.menuItems} label="Items" />
                      <Stat value={restaurant.counts.orders} label="Orders" />
                      <Stat value={restaurant.counts.staff} label="Staff" />
                      <Stat value={restaurant.counts.tables} label="Tables" />
                    </Stack>
                  )}

                  <Stack spacing={0.25} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Registered {fmtDate(restaurant.createdAt)}
                    </Typography>
                    {restaurant.status === 'suspended' && restaurant.suspendedAt && (
                      <Typography variant="caption" color="error.main" fontWeight={600}>
                        Suspended {fmtDate(restaurant.suspendedAt)}
                      </Typography>
                    )}
                  </Stack>
                  {restaurant.status === 'active' && (
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="warning"
                      sx={{ mt: 2 }}
                      startIcon={<Icon icon="mdi:pause-circle-outline" width={18} />}
                      onClick={() => handleDeactivate(restaurant.id)}
                    >
                      Suspend
                    </Button>
                  )}
                  {restaurant.status === 'suspended' && (
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      color="success"
                      sx={{ mt: 2 }}
                      startIcon={<Icon icon="mdi:play-circle-outline" width={18} />}
                      onClick={() => handleActivate(restaurant.id)}
                    >
                      Reactivate
                    </Button>
                  )}
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
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </Box>
  );
};
