import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Icon } from '@iconify/react';
import { OrderForm } from '../OrderForm';
import { getOrderStatusLabel } from '../../utils/statusLabels';

const STATUS_COLOR = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  'on-hold': 'default',
  preparing: 'info',
  prepared: 'success',
  served: 'success',
  ready: 'success',
  completed: 'success',
  cancelled: 'error',
};

const STATUS_BORDER = {
  pending: 'warning.main',
  accepted: 'info.main',
  rejected: 'error.main',
  'on-hold': 'grey.400',
  preparing: 'info.light',
  prepared: 'success.light',
  served: 'success.main',
  ready: 'success.dark',
  completed: 'success.darker',
  cancelled: 'error.light',
};

const OrdersSection = ({
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  orderSearchQuery,
  setOrderSearchQuery,
  restaurantId,
  tables,
  menuItems,
  showForm,
  editingOrder,
  onAdd,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onUpdateStatus,
  onGenerateBill,
}) => {
  const filtered = orders.filter((order) => {
    if (orderStatusFilter !== 'All' && order.status !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.trim().toLowerCase();
      const matchesName = order.customerName?.toLowerCase().includes(q);
      const matchesMobile = order.customerMobile?.toLowerCase().includes(q);
      const matchesId = order.id.toLowerCase().includes(q);
      if (!matchesName && !matchesMobile && !matchesId) return false;
    }
    return true;
  });

  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Orders
      </Typography>

      <Fab
        color="primary"
        size="medium"
        onClick={onAdd}
        aria-label="Create Order"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}
      >
        <Icon icon="mdi:plus" width={24} />
      </Fab>

      {/* Kitchen Display link */}
      <Box sx={{ mb: 2 }}>
        <Button
          component="a"
          href={`/kitchen/${restaurantId}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size="small"
          startIcon={<Icon icon="mdi:monitor-dashboard" width={18} />}
        >
          Open Kitchen Display
        </Button>
      </Box>

      {/* Filters row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems={{ sm: 'center' }}>
        <TextField
          placeholder="Search by name, mobile, or order ID..."
          size="small"
          value={orderSearchQuery}
          onChange={(e) => setOrderSearchQuery(e.target.value)}
          sx={{ flex: 1, maxWidth: { sm: 360 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="mdi:magnify" width={20} />
                </InputAdornment>
              ),
              endAdornment: orderSearchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setOrderSearchQuery('')}>
                    <Icon icon="mdi:close" width={18} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={orderStatusFilter}
            label="Status"
            onChange={(e) => setOrderStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="on-hold">On Hold</MenuItem>
            <MenuItem value="preparing">Preparing</MenuItem>
            <MenuItem value="prepared">Prepared</MenuItem>
            <MenuItem value="served">Served</MenuItem>
            <MenuItem value="ready">Ready</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Icon icon="mdi:receipt-text-outline" width={48} style={{ opacity: 0.4, marginBottom: 8 }} />
          <Typography>No orders found. Create your first order!</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filtered.map((order) => {
            const isOldFinished =
              ['completed', 'cancelled'].includes(order.status) &&
              Date.now() - new Date(order.updatedAt).getTime() > 3600000;

            return (
              <Card
                key={order.id}
                sx={{
                  borderLeft: 4,
                  borderColor: STATUS_BORDER[order.status] || 'grey.300',
                  opacity: isOldFinished ? 0.6 : 1,
                }}
              >
                <CardActionArea
                  disabled={isOldFinished}
                  onClick={() => !isOldFinished && onEdit(order)}
                >
                  <CardContent>
                    {/* Header row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                          #{order.id.slice(-8)}
                        </Typography>
                        <Chip
                          label={getOrderStatusLabel(order.status)}
                          color={STATUS_COLOR[order.status] || 'default'}
                          size="small"
                        />
                      </Stack>
                      <Typography variant="subtitle1" fontWeight={700}>
                        &#8377;{order.total.toFixed(2)}
                      </Typography>
                    </Stack>

                    {/* Meta row */}
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ color: 'text.secondary', mb: 1 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Icon icon="mdi:table-furniture" width={16} />
                        <Typography variant="body2">Table {order.tableNumber}</Typography>
                      </Stack>
                      {order.customerName && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Icon icon="mdi:account-outline" width={16} />
                          <Typography variant="body2">{order.customerName}</Typography>
                        </Stack>
                      )}
                      {order.customerMobile && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Icon icon="mdi:phone-outline" width={16} />
                          <Typography variant="body2">{order.customerMobile}</Typography>
                        </Stack>
                      )}
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>

                    {/* Order ID full */}
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
                      {order.id}
                    </Typography>

                    {/* Items */}
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={1}>
                      {order.items.map((item, idx) => (
                        <Chip
                          key={idx}
                          label={`${item.quantity}x ${item.name}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>

                    {/* Notes */}
                    {order.notes && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic" mb={1}>
                        {order.notes}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>

                {/* Status action buttons */}
                <OrderActions
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onGenerateBill={onGenerateBill}
                />
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Order Form Dialog */}
      <Dialog
        open={showForm || !!editingOrder}
        onClose={onCancel}
        maxWidth="sm"
        fullWidth
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.5)' } } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <OrderForm
            order={editingOrder}
            tables={tables}
            menuItems={menuItems}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={editingOrder ? () => onDelete(editingOrder.id) : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

/* Extracted action button rows per status — buttons are instant (optimistic update) */
const OrderActions = ({ order, onUpdateStatus, onGenerateBill }) => {
  const buttons = [];

  if (order.status === 'pending') {
    buttons.push(
      <Button key="accept" size="small" color="success" variant="contained" onClick={() => onUpdateStatus(order.id, 'accepted')}>Accept</Button>,
      <Button key="reject" size="small" color="error" variant="outlined" onClick={() => onUpdateStatus(order.id, 'rejected')}>Reject</Button>,
      <Button key="hold" size="small" color="warning" variant="outlined" onClick={() => onUpdateStatus(order.id, 'on-hold')}>Hold</Button>,
    );
  } else if (order.status === 'accepted' || order.status === 'on-hold') {
    buttons.push(
      <Button key="preparing" size="small" color="info" variant="contained" onClick={() => onUpdateStatus(order.id, 'preparing')}>Start Preparing</Button>,
      <Button key="reject" size="small" color="error" variant="outlined" onClick={() => onUpdateStatus(order.id, 'rejected')}>Reject</Button>,
    );
  } else if (order.status === 'preparing') {
    buttons.push(
      <Button key="prepared" size="small" color="success" variant="contained" onClick={() => onUpdateStatus(order.id, 'prepared')}>Prepared</Button>,
      <Button key="ready" size="small" color="success" variant="outlined" onClick={() => onUpdateStatus(order.id, 'ready')}>Ready</Button>,
    );
  } else if (order.status === 'prepared') {
    buttons.push(
      <Button key="served" size="small" color="success" variant="contained" onClick={() => onUpdateStatus(order.id, 'served')}>Served</Button>,
      <Button key="ready" size="small" color="success" variant="outlined" onClick={() => onUpdateStatus(order.id, 'ready')}>Ready</Button>,
    );
  } else if (order.status === 'served') {
    buttons.push(
      <Button key="complete" size="small" color="success" variant="contained" onClick={() => onUpdateStatus(order.id, 'completed')}>Complete</Button>,
    );
    if (!order.billId) {
      buttons.push(
        <Button key="bill" size="small" variant="outlined" startIcon={<Icon icon="mdi:receipt-text-outline" width={16} />} onClick={() => onGenerateBill(order)}>Generate Bill</Button>,
      );
    }
  } else if (order.status === 'ready') {
    buttons.push(
      <Button key="served" size="small" color="success" variant="contained" onClick={() => onUpdateStatus(order.id, 'served')}>Served</Button>,
      <Button key="complete" size="small" color="success" variant="outlined" onClick={() => onUpdateStatus(order.id, 'completed')}>Complete</Button>,
    );
  } else if (order.status === 'completed' && !order.billId) {
    buttons.push(
      <Button key="bill" size="small" variant="outlined" startIcon={<Icon icon="mdi:receipt-text-outline" width={16} />} onClick={() => onGenerateBill(order)}>Generate Bill</Button>,
    );
  }

  if (buttons.length === 0) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ px: 2, pb: 1.5, flexWrap: 'wrap', gap: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      {buttons}
    </Stack>
  );
};

export default OrdersSection;
