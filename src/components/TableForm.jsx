import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export const TableForm = ({ table, onSave, onCancel, onDelete }) => {
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    status: 'available',
    location: 'Indoor',
  });

  const errors = {
    number: !formData.number ? 'Table number is required' : '',
    capacity: !formData.capacity ? 'Capacity is required' : Number(formData.capacity) < 1 ? 'Must be at least 1' : '',
  };

  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number || '',
        capacity: table.capacity || '',
        status: table.status || 'available',
        location: table.location || 'Indoor',
      });
    }
  }, [table]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...formData,
        capacity: parseInt(formData.capacity),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2.5}>
        {table ? 'Edit Table' : 'Add New Table'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Table Number"
              value={formData.number}
              onChange={handleChange('number')}
              onBlur={handleBlur('number')}
              error={touched.number && !!errors.number}
              helperText={touched.number && errors.number}
              required
              fullWidth
              placeholder="e.g., 1, 2, A1"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange('capacity')}
              onBlur={handleBlur('capacity')}
              error={touched.capacity && !!errors.capacity}
              helperText={touched.capacity && errors.capacity}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 20 } }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={handleChange('status')}
              required
              fullWidth
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Location"
              select
              value={formData.location}
              onChange={handleChange('location')}
              required
              fullWidth
            >
              <MenuItem value="Indoor">Indoor</MenuItem>
              <MenuItem value="Outdoor">Outdoor</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
              <MenuItem value="Bar">Bar</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.5} mt={3}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {table ? 'Update' : 'Create'}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          {table && onDelete && (
            <Button variant="outlined" color="error" onClick={onDelete} type="button" sx={{ ml: 'auto' }}>
              Delete
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
