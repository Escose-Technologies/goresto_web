import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import ProductFeedbackPanel from '../components/superadmin/ProductFeedbackPanel';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const FOOD_TYPES = [
  { value: 'pure_veg', label: 'Pure Veg' },
  { value: 'egg', label: 'Egg' },
  { value: 'veg_egg', label: 'Veg + Egg' },
  { value: 'non_veg', label: 'Non-Veg' },
  { value: 'both', label: 'Both' },
];

// Registration stores the owner's name inside `description` as "Owner: <name>"
// — there is no ownerName column. Read it back out for display, and never
// expose description as an editable field or the name is lost.
const ownerNameOf = (restaurant) => {
  const d = restaurant?.description || '';
  const m = d.match(/^Owner:\s*(.+)$/);
  return m ? m[1].trim() : '—';
};

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
    foodType: 'both',
    cuisineTypes: '',
    website: '',
    tagline: '',
  });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [tab, setTab] = useState('restaurants');
  const [resetData, setResetData] = useState({ password: '', confirm: '', superPassword: '' });
  const [resetting, setResetting] = useState(false);

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
      const payload = {
        ...formData,
        cuisineTypes: formData.cuisineTypes
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      };
      if (editingRestaurant) {
        await restaurantService.update(editingRestaurant.id, payload);
      } else {
        await restaurantService.create(payload);
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
      foodType: restaurant.foodType || 'both',
      cuisineTypes: (restaurant.cuisineTypes || []).join(', '),
      website: restaurant.website || '',
      tagline: restaurant.tagline || '',
    });
    setResetData({ password: '', confirm: '', superPassword: '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', address: '', phone: '',
      foodType: 'both', cuisineTypes: '', website: '', tagline: '',
    });
    setResetData({ password: '', confirm: '', superPassword: '' });
    setEditingRestaurant(null);
    setShowForm(false);
  };

  const handleResetPassword = async () => {
    if (resetData.password !== resetData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setResetting(true);
    try {
      const result = await userService.resetPassword(editingRestaurant.adminId, {
        password: resetData.password,
        superPassword: resetData.superPassword,
      });
      toast.success(result?.message || 'Password reset');
      setResetData({ password: '', confirm: '', superPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Password reset failed');
    } finally {
      setResetting(false);
    }
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

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', px: { xs: 1, md: 3 } }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab
            value="restaurants"
            label="Restaurants"
            iconPosition="start"
            icon={<Icon icon="material-symbols:store-outline-rounded" width={18} />}
            sx={{ minHeight: 52, textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            value="feedback"
            label="Product Feedback"
            iconPosition="start"
            icon={<Icon icon="material-symbols:rate-review-outline-rounded" width={18} />}
            sx={{ minHeight: 52, textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {tab === 'feedback' && (
          <ProductFeedbackPanel restaurants={restaurants} toast={toast} />
        )}

        {tab === 'restaurants' && (
        <>
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
                          <strong>Owner:</strong> {ownerNameOf(reg)}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        <strong>Food Type:</strong>{' '}
                        {FOOD_TYPES.find((f) => f.value === reg.foodType)?.label || '—'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Cuisine:</strong>{' '}
                        {(reg.cuisineTypes || []).length ? reg.cuisineTypes.join(', ') : '—'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Applied: {new Date(reg.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    {reg.duplicates && (
                      <Box
                        sx={{
                          display: 'flex', gap: 1, alignItems: 'flex-start',
                          p: 1.25, mb: 1.5, borderRadius: 1.5,
                          bgcolor: 'warning.light', color: 'warning.contrastText',
                          border: '1px solid', borderColor: 'warning.main',
                        }}
                      >
                        <Icon icon="mdi:alert-outline" width={18} style={{ flexShrink: 0, marginTop: 2 }} />
                        <Box>
                          <Typography variant="caption" fontWeight={700} display="block">
                            Possible duplicate
                          </Typography>
                          {reg.duplicates.phone?.length > 0 && (
                            <Typography variant="caption" display="block">
                              This phone is already used by {reg.duplicates.phone.join(', ')}
                            </Typography>
                          )}
                          {reg.duplicates.email?.length > 0 && (
                            <Typography variant="caption" display="block">
                              This email is already used by {reg.duplicates.email.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}

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

              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Food Type" select value={formData.foodType} onChange={(e) => setFormData({ ...formData, foodType: e.target.value })} fullWidth>
                    {FOOD_TYPES.map((f) => (
                      <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Cuisine Types"
                    value={formData.cuisineTypes}
                    onChange={(e) => setFormData({ ...formData, cuisineTypes: e.target.value })}
                    fullWidth
                    helperText="Comma separated, e.g. North Indian, Chinese"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Tagline" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} fullWidth placeholder="https://" />
                </Grid>
              </Grid>

              {editingRestaurant && (
                <Box sx={{ mb: 2.5, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Registration details
                  </Typography>
                  <Grid container spacing={2} mt={0}>
                    {[
                      ['Email', editingRestaurant.email || '—'],
                      ['Owner', ownerNameOf(editingRestaurant)],
                      ['Status', editingRestaurant.status || '—'],
                      ['Registered', fmtDate(editingRestaurant.createdAt)],
                    ].map(([label, value]) => (
                      <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>{value}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                    Email identifies the admin account and cannot be changed here.
                  </Typography>
                </Box>
              )}

              <Stack direction="row" spacing={1.5}>
                <Button type="submit" variant="contained">
                  {editingRestaurant ? 'Update' : 'Create'}
                </Button>
                <Button variant="outlined" onClick={resetForm}>Cancel</Button>
              </Stack>
            </Box>

            {editingRestaurant && editingRestaurant.adminId && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700}>Reset Admin Password</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Overrides the password for {getAdminName(editingRestaurant.adminId)}. Existing sessions stay signed in.
                </Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="New Password"
                      type="password"
                      value={resetData.password}
                      onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
                      fullWidth
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Confirm Password"
                      type="password"
                      value={resetData.confirm}
                      onChange={(e) => setResetData({ ...resetData, confirm: e.target.value })}
                      fullWidth
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Super Password"
                      type="password"
                      value={resetData.superPassword}
                      onChange={(e) => setResetData({ ...resetData, superPassword: e.target.value })}
                      fullWidth
                      autoComplete="off"
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleResetPassword}
                  disabled={
                    resetting ||
                    !resetData.password ||
                    !resetData.confirm ||
                    !resetData.superPassword
                  }
                  startIcon={resetting ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:lock-reset" width={18} />}
                >
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Box>
            )}
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
        </>
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
