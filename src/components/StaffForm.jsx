import { useState, useEffect, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useToast } from './ui/Toast';

const STAFF_ROLES = ['Waiter', 'Chef', 'Manager', 'Bartender', 'Host/Hostess', 'Cashier', 'Kitchen Staff', 'Other'];

export const StaffForm = ({ staff, onSave, onCancel, onDelete }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    photo: '',
    hireDate: '',
    status: 'active',
    address: '',
    emergencyContact: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = {
    name: !formData.name ? 'Name is required' : '',
    email: !formData.email ? 'Email is required' : !emailRegex.test(formData.email) ? 'Invalid email format' : '',
    phone: !formData.phone ? 'Phone is required' : '',
    role: !formData.role ? 'Role is required' : '',
    hireDate: !formData.hireDate ? 'Hire date is required' : '',
  };

  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || '',
        photo: staff.photo || '',
        hireDate: staff.hireDate || '',
        status: staff.status || 'active',
        address: staff.address || '',
        emergencyContact: staff.emergencyContact || '',
        notes: staff.notes || '',
      });
      setImagePreview(staff.photo || null);
    } else {
      setImagePreview(null);
    }
  }, [staff]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({ ...prev, photo: base64String }));
        setImagePreview(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Error reading image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing image: ' + error.message);
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, photo: '' }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2.5}>
        {staff ? 'Edit Staff Member' : 'Onboard New Staff'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Full Name" value={formData.name} onChange={handleChange('name')} onBlur={handleBlur('name')} error={touched.name && !!errors.name} helperText={touched.name && errors.name} required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" type="email" value={formData.email} onChange={handleChange('email')} onBlur={handleBlur('email')} error={touched.email && !!errors.email} helperText={touched.email && errors.email} required fullWidth />
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone" type="tel" value={formData.phone} onChange={handleChange('phone')} onBlur={handleBlur('phone')} error={touched.phone && !!errors.phone} helperText={touched.phone && errors.phone} required fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Role" select value={formData.role} onChange={handleChange('role')} onBlur={handleBlur('role')} error={touched.role && !!errors.role} helperText={touched.role && errors.role} required fullWidth>
              <MenuItem value="" disabled>Select Role</MenuItem>
              {STAFF_ROLES.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={handleChange('hireDate')}
              onBlur={handleBlur('hireDate')}
              error={touched.hireDate && !!errors.hireDate}
              helperText={touched.hireDate && errors.hireDate}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Status" select value={formData.status} onChange={handleChange('status')} required fullWidth>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="on-leave">On Leave</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <TextField
          label="Address"
          value={formData.address}
          onChange={handleChange('address')}
          fullWidth
          multiline
          rows={2}
          placeholder="Street address, City, State, ZIP"
          sx={{ mb: 2 }}
        />

        <TextField
          label="Emergency Contact"
          value={formData.emergencyContact}
          onChange={handleChange('emergencyContact')}
          fullWidth
          placeholder="Name - Phone Number"
          sx={{ mb: 2 }}
        />

        {/* Photo Upload */}
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          Staff Photo
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={imagePreview || undefined}
              sx={{ width: 80, height: 80, bgcolor: 'grey.200' }}
            >
              <Icon icon="mdi:account" width={40} />
            </Avatar>
            {imagePreview && (
              <IconButton
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 24,
                  height: 24,
                  p: 0,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <Icon icon="mdi:close" width={14} />
              </IconButton>
            )}
          </Box>
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="staff-photo-upload"
              disabled={isUploading}
            />
            <label htmlFor="staff-photo-upload">
              <Button variant="outlined" size="small" component="span" disabled={isUploading}>
                {isUploading ? 'Uploading...' : imagePreview ? 'Change Photo' : 'Choose Photo'}
              </Button>
            </label>
            <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
              JPG, PNG, GIF. Max 5MB
            </Typography>
          </Box>
        </Stack>

        <TextField
          label="Notes"
          value={formData.notes}
          onChange={handleChange('notes')}
          fullWidth
          multiline
          rows={3}
          placeholder="Additional notes about the staff member..."
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1.5} mt={1}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {staff ? 'Update' : 'Add Staff'}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          {staff && onDelete && (
            <Button variant="outlined" color="error" onClick={onDelete} type="button" sx={{ ml: 'auto' }}>
              Delete
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
