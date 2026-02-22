import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useToast } from './ui/Toast';

export const OrderForm = ({ order, tables, menuItems, onSave, onCancel, onDelete }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    tableNumber: '',
    items: [],
    notes: '',
    status: 'pending',
    customerName: '',
    customerMobile: '',
  });

  const [saving, setSaving] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    if (order) {
      setFormData({
        tableNumber: order.tableNumber || '',
        items: order.items || [],
        notes: order.notes || '',
        status: order.status || 'pending',
        customerName: order.customerName || '',
        customerMobile: order.customerMobile || '',
      });
    }
  }, [order]);

  const handleAddItem = () => {
    if (!selectedMenuItem) return;

    const menuItem = menuItems.find((item) => item.id === selectedMenuItem);
    if (!menuItem) return;

    const existingItemIndex = formData.items.findIndex(
      (item) => item.menuItemId === selectedMenuItem
    );

    let newItems;
    if (existingItemIndex >= 0) {
      newItems = [...formData.items];
      newItems[existingItemIndex].quantity += selectedQuantity;
    } else {
      newItems = [
        ...formData.items,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: selectedQuantity,
          price: menuItem.price,
        },
      ];
    }

    setFormData({ ...formData, items: newItems });
    setSelectedMenuItem('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    const newItems = [...formData.items];
    newItems[index].quantity = newQuantity;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.warning('Please add at least one item to the order');
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...formData, total: calculateTotal() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2.5}>
        {order ? 'Edit Order' : 'Create New Order'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Table Number"
              select
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              required
              fullWidth
            >
              <MenuItem value="" disabled>Select Table</MenuItem>
              {tables.map((table) => (
                <MenuItem key={table.id} value={table.number}>
                  Table {table.number} ({table.capacity} seats)
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              fullWidth
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="on-hold">On Hold</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="prepared">Prepared</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="served">Served</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Add Menu Item */}
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          Add Menu Item
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={2}>
          <TextField
            select
            value={selectedMenuItem}
            onChange={(e) => setSelectedMenuItem(e.target.value)}
            fullWidth
            size="small"
            placeholder="Select Menu Item"
            label="Menu Item"
          >
            <MenuItem value="" disabled>Select Menu Item</MenuItem>
            {menuItems
              .filter((item) => item.available)
              .map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name} - ₹{item.price.toFixed(2)}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            type="number"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
            size="small"
            label="Qty"
            sx={{ width: { xs: '100%', sm: 80 }, flexShrink: 0 }}
            slotProps={{ htmlInput: { min: 1 } }}
          />
          <Button
            variant="contained"
            onClick={handleAddItem}
            sx={{ flexShrink: 0, minWidth: 80 }}
          >
            Add
          </Button>
        </Stack>

        {/* Order Items List */}
        {formData.items.length > 0 && (
          <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Order Items
            </Typography>
            {formData.items.map((item, index) => (
              <Stack
                key={index}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  py: 1,
                  px: 1.5,
                  mb: 0.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight={500} sx={{ flex: 1, minWidth: 0 }}>
                  {item.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                    sx={{ width: 36, height: 36 }}
                  >
                    <Icon icon="mdi:minus" width={18} />
                  </IconButton>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 28, textAlign: 'center' }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                    sx={{ width: 36, height: 36 }}
                  >
                    <Icon icon="mdi:plus" width={18} />
                  </IconButton>
                  <Typography variant="body2" fontWeight={600} color="primary" sx={{ minWidth: 70, textAlign: 'right' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    sx={{ width: 36, height: 36 }}
                  >
                    <Icon icon="mdi:close" width={18} />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700} textAlign="right">
              Total: ₹{calculateTotal().toFixed(2)}
            </Typography>
          </Card>
        )}

        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              fullWidth
              placeholder="Enter customer name"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Customer Mobile"
              type="tel"
              value={formData.customerMobile}
              onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
              fullWidth
              placeholder="Enter mobile number"
            />
          </Grid>
        </Grid>

        <TextField
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          fullWidth
          multiline
          rows={3}
          placeholder="Special instructions or notes..."
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1.5} mt={1}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {order ? 'Update Order' : 'Create Order'}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          {order && onDelete && (
            <Button variant="outlined" color="error" onClick={onDelete} type="button" sx={{ ml: 'auto' }}>
              Delete
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
