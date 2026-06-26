import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { OrderForm } from '../OrderForm';
import { OrderDetailsModal } from '../OrderDetailsModal';
import { getOrderStatusLabel } from '../../utils/statusLabels';
import { useCurrency } from '../../contexts/CurrencyContext';
import { STATUS_COLOR, STATUS_DOT, isFinished, money, timeAgo } from '../../utils/orderStatus';

// Status buckets surfaced in the summary strip (doubles as a quick filter).
const SUMMARY = [
  { value: 'All', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'served', label: 'Served' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

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
  const cur = useCurrency();
  const [detailsOrder, setDetailsOrder] = useState(null);

  const counts = useMemo(() => {
    const c = { All: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  // Search + status filter, then sort strictly by creation time (newest first).
  // Status changes update updatedAt but must NOT reorder the list.
  const visible = useMemo(() => {
    const q = orderSearchQuery.trim().toLowerCase();
    const filtered = orders.filter((o) => {
      if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) return false;
      if (!q) return true;
      return (
        o.customerName?.toLowerCase().includes(q) ||
        o.customerMobile?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        String(o.tableNumber || '').toLowerCase().includes(q)
      );
    });
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, orderSearchQuery, orderStatusFilter]);

  const activeCount = useMemo(() => orders.filter((o) => !isFinished(o.status)).length, [orders]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h5" fontWeight={700}>Orders</Typography>
          <Typography variant="body2" color="text.secondary">{activeCount} active</Typography>
        </Stack>
        <Box
          component="a"
          href={`/kitchen/${restaurantId}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'primary.main', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
        >
          <Icon icon="mdi:monitor-dashboard" width={18} /> Kitchen Display
        </Box>
      </Stack>

      {/* Summary strip — tap a status to filter */}
      <Stack direction="row" spacing={1} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
        {SUMMARY.map((s) => {
          const selected = orderStatusFilter === s.value;
          return (
            <Box
              key={s.value}
              role="button"
              tabIndex={0}
              onClick={() => setOrderStatusFilter(s.value)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOrderStatusFilter(s.value)}
              sx={{
                cursor: 'pointer',
                flex: '0 0 auto',
                minWidth: 96,
                px: 1.75, py: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? 'primary.main' : 'background.paper',
                color: selected ? 'primary.contrastText' : 'text.primary',
                transition: 'all .15s',
              }}
            >
              <Typography variant="h6" fontWeight={800} lineHeight={1.1}>{counts[s.value] || 0}</Typography>
              <Typography variant="caption" sx={{ opacity: selected ? 0.9 : 0.7 }}>{s.label}</Typography>
            </Box>
          );
        })}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2.5} alignItems={{ sm: 'center' }}>
        <TextField
          placeholder="Search name, mobile, table or order ID…"
          size="small"
          value={orderSearchQuery}
          onChange={(e) => setOrderSearchQuery(e.target.value)}
          sx={{ flex: 1, maxWidth: { sm: 380 } }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" width={20} /></InputAdornment>,
              endAdornment: orderSearchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setOrderSearchQuery('')}><Icon icon="material-symbols:close-rounded" width={18} /></IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={orderStatusFilter} label="Status" onChange={(e) => setOrderStatusFilter(e.target.value)}>
            <MenuItem value="All">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
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

      {visible.length === 0 ? (
        <EmptyState text={orders.length === 0 ? 'No orders yet. Tap + to create one.' : 'No orders match your filters.'} />
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', alignItems: 'start' }}>
          {visible.map((o) => (
            <OrderCard key={o.id} order={o} cur={cur} onOpen={() => setDetailsOrder(o)} />
          ))}
        </Box>
      )}

      <Fab color="primary" size="medium" onClick={onAdd} aria-label="Create Order" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
        <Icon icon="mdi:plus" width={24} />
      </Fab>

      <OrderDetailsModal
        order={detailsOrder}
        open={!!detailsOrder}
        onClose={() => setDetailsOrder(null)}
        onEdit={onEdit}
        onUpdateStatus={onUpdateStatus}
        onGenerateBill={onGenerateBill}
      />

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

/* One order at a glance: id, table · customer, time, total — opens the details modal. */
const OrderCard = ({ order, cur, onOpen }) => {
  const finished = isFinished(order.status);
  const tableLabel = order.tableNumber != null && order.tableNumber !== '' ? `Table ${order.tableNumber}` : 'Takeaway';
  const itemCount = (order.items || []).reduce((s, it) => s + (it.quantity || 0), 0);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        opacity: finished ? 0.72 : 1,
        pl: 2.25, pr: 2, py: 1.75,
        transition: 'box-shadow .15s, border-color .15s',
        '&:hover, &:focus-visible': { boxShadow: 3, borderColor: 'text.disabled', outline: 'none' },
        // status spine
        '&::before': {
          content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 5,
          bgcolor: STATUS_DOT[order.status] || 'grey.400',
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          #{order.orderNumber || order.id.slice(-6)}
        </Typography>
        <Chip size="small" color={STATUS_COLOR[order.status] || 'default'} label={getOrderStatusLabel(order.status)} />
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75, color: 'text.secondary' }}>
        <Icon icon="mdi:table-furniture" width={16} />
        <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>{tableLabel}</Typography>
        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
        <Icon icon="mdi:account-outline" width={16} />
        <Typography variant="body2" noWrap>{order.customerName || 'Walk-in'}</Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        {timeAgo(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }}>
        <Typography variant="h6" fontWeight={800}>{money(order.total, cur)}</Typography>
        <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: 'primary.main' }}>
          <Typography variant="body2" fontWeight={600}>View details</Typography>
          <Icon icon="mdi:chevron-right" width={18} />
        </Stack>
      </Stack>
    </Box>
  );
};

const EmptyState = ({ text }) => (
  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
    <Icon icon="mdi:receipt-text-outline" width={44} style={{ opacity: 0.4, marginBottom: 8 }} />
    <Typography>{text}</Typography>
  </Box>
);

export default OrdersSection;
