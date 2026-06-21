import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { OrderForm } from '../OrderForm';
import { getOrderStatusLabel } from '../../utils/statusLabels';
import { useCurrency } from '../../contexts/CurrencyContext';

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

// Dot colour per status (for the compact rows)
const STATUS_DOT = {
  pending: 'warning.main',
  accepted: 'info.main',
  rejected: 'error.main',
  'on-hold': 'grey.500',
  preparing: 'info.main',
  prepared: 'success.light',
  served: 'success.main',
  ready: 'success.dark',
  completed: 'success.main',
  cancelled: 'error.main',
};

const isFinished = (s) => s === 'completed' || s === 'cancelled';

// Urgency for sorting tables/orders — lower = needs attention sooner.
const URGENCY = { pending: 0, accepted: 1, 'on-hold': 1, preparing: 2, prepared: 3, ready: 3, served: 4 };

const money = (n, cur = '₹') => `${cur}${Number(n || 0).toFixed(2)}`;

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
  const [view, setView] = useState('floor'); // 'floor' | 'list'
  const [historyOpen, setHistoryOpen] = useState(false);

  const visible = useMemo(() => {
    const q = orderSearchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) return false;
      if (!q) return true;
      return (
        o.customerName?.toLowerCase().includes(q) ||
        o.customerMobile?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        String(o.tableNumber || '').toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  const activeOrders = useMemo(() => visible.filter((o) => !isFinished(o.status)), [visible]);
  const finishedOrders = useMemo(
    () => visible.filter((o) => isFinished(o.status)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [visible],
  );

  // Group active orders by table number.
  const ordersByTable = useMemo(() => {
    const map = new Map();
    for (const o of activeOrders) {
      const key = o.tableNumber != null && o.tableNumber !== '' ? String(o.tableNumber) : '__none__';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (URGENCY[a.status] ?? 9) - (URGENCY[b.status] ?? 9) || new Date(a.createdAt) - new Date(b.createdAt));
    }
    return map;
  }, [activeOrders]);

  // One card per known table + a "Takeaway" bucket for orders with no table.
  const tableCards = useMemo(() => {
    const known = (tables || []).map((t) => ({
      key: String(t.number),
      label: `Table ${t.number}`,
      capacity: t.capacity,
      orders: ordersByTable.get(String(t.number)) || [],
    }));
    const orphan = ordersByTable.get('__none__');
    if (orphan?.length) known.push({ key: '__none__', label: 'Takeaway', capacity: null, orders: orphan });
    return known.sort((a, b) => {
      const au = a.orders.length ? Math.min(...a.orders.map((o) => URGENCY[o.status] ?? 9)) : 99;
      const bu = b.orders.length ? Math.min(...b.orders.map((o) => URGENCY[o.status] ?? 9)) : 99;
      if (au !== bu) return au - bu;
      return a.label.localeCompare(b.label, undefined, { numeric: true });
    });
  }, [tables, ordersByTable]);

  const activeCount = activeOrders.length;
  const hasAnyTableOrders = tableCards.some((t) => t.orders.length > 0);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h5" fontWeight={700}>Orders</Typography>
          <Typography variant="body2" color="text.secondary">{activeCount} active</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component="a"
            href={`/kitchen/${restaurantId}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            startIcon={<Icon icon="mdi:monitor-dashboard" width={18} />}
          >
            Kitchen Display
          </Button>
          <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)} aria-label="Orders view">
            <ToggleButton value="floor" aria-label="Floor view"><Icon icon="mdi:view-grid-outline" width={18} /></ToggleButton>
            <ToggleButton value="list" aria-label="List view"><Icon icon="mdi:format-list-bulleted" width={18} /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Fab color="primary" size="medium" onClick={onAdd} aria-label="Create Order" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
        <Icon icon="mdi:plus" width={24} />
      </Fab>

      {/* Filters */}
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

      {/* FLOOR VIEW — grid of table cards */}
      {view === 'floor' && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', alignItems: 'start' }}>
          {tableCards.map((tc) => (
            <TableCard key={tc.key} card={tc} onEdit={onEdit} onUpdateStatus={onUpdateStatus} onGenerateBill={onGenerateBill} onAdd={onAdd} />
          ))}
        </Box>
      )}

      {/* LIST VIEW — table-grouped dense rows */}
      {view === 'list' && (
        activeCount === 0 ? (
          <EmptyState text="No active orders." />
        ) : (
          <Stack spacing={2}>
            {tableCards.filter((tc) => tc.orders.length > 0).map((tc) => (
              <Box key={tc.key}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
                  <Icon icon="mdi:table-furniture" width={18} />
                  <Typography variant="subtitle2" fontWeight={700}>{tc.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tc.orders.length} {tc.orders.length === 1 ? 'order' : 'orders'} · {money(tc.orders.reduce((s, o) => s + o.total, 0), cur)}
                  </Typography>
                </Stack>
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  {tc.orders.map((o, i) => (
                    <OrderRow key={o.id} order={o} divider={i > 0} onEdit={onEdit} onUpdateStatus={onUpdateStatus} onGenerateBill={onGenerateBill} />
                  ))}
                </Paper>
              </Box>
            ))}
          </Stack>
        )
      )}

      {/* COMPLETED / HISTORY */}
      {finishedOrders.length > 0 && (
        <Box mt={3}>
          <Button
            onClick={() => setHistoryOpen((v) => !v)}
            startIcon={<Icon icon={historyOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'} width={20} />}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Completed &amp; cancelled ({finishedOrders.length})
          </Button>
          <Collapse in={historyOpen}>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mt: 1 }}>
              {finishedOrders.map((o, i) => (
                <OrderRow key={o.id} order={o} divider={i > 0} muted onEdit={onEdit} onUpdateStatus={onUpdateStatus} onGenerateBill={onGenerateBill} />
              ))}
            </Paper>
          </Collapse>
        </Box>
      )}

      {/* Empty state */}
      {!hasAnyTableOrders && activeCount === 0 && finishedOrders.length === 0 && (
        <Box mt={2}><EmptyState text="No orders yet. Tap + to create one." /></Box>
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

const EmptyState = ({ text }) => (
  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
    <Icon icon="mdi:receipt-text-outline" width={44} style={{ opacity: 0.4, marginBottom: 8 }} />
    <Typography>{text}</Typography>
  </Box>
);

/* A single table on the floor: header + its active orders, or a free slot. */
const TableCard = ({ card, onEdit, onUpdateStatus, onGenerateBill, onAdd }) => {
  const cur = useCurrency();
  const { label, capacity, orders } = card;
  const isActive = orders.length > 0;
  const total = orders.reduce((s, o) => s + o.total, 0);
  const topUrgency = isActive ? Math.min(...orders.map((o) => URGENCY[o.status] ?? 9)) : 99;
  const accent = topUrgency === 0 ? 'warning.main' : topUrgency <= 2 ? 'info.main' : 'success.main';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3, overflow: 'hidden',
        borderColor: isActive ? accent : 'divider',
        borderTop: 3, borderTopColor: isActive ? accent : 'divider',
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.75, py: 1.25, bgcolor: isActive ? 'action.hover' : 'transparent' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Icon icon="mdi:table-furniture" width={20} />
          <Typography variant="subtitle1" fontWeight={800} noWrap>{label}</Typography>
          {capacity ? <Typography variant="caption" color="text.secondary" noWrap>· {capacity} seats</Typography> : null}
        </Stack>
        {isActive ? (
          <Typography variant="subtitle2" fontWeight={800}>{money(total, cur)}</Typography>
        ) : (
          <Chip label="Free" size="small" variant="outlined" />
        )}
      </Stack>

      {isActive ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1.75, pb: 0.25, display: 'block' }}>
            {orders.length} active {orders.length === 1 ? 'order' : 'orders'}
          </Typography>
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} divider compact onEdit={onEdit} onUpdateStatus={onUpdateStatus} onGenerateBill={onGenerateBill} />
          ))}
        </Box>
      ) : (
        <Box sx={{ px: 1.75, py: 2, textAlign: 'center' }}>
          <Button size="small" variant="text" startIcon={<Icon icon="mdi:plus" width={16} />} onClick={onAdd}>New order</Button>
        </Box>
      )}
    </Paper>
  );
};

/* Compact order row used in cards, list view and history. */
const OrderRow = ({ order, divider, compact, muted, onEdit, onUpdateStatus, onGenerateBill }) => {
  const cur = useCurrency();
  const items = order.items?.map((it) => `${it.quantity}× ${it.name}`).join(', ');
  const actions = statusActions(order, onUpdateStatus, onGenerateBill);

  return (
    <Box
      sx={{
        px: 1.75, py: 1,
        borderTop: divider ? 1 : 0, borderColor: 'divider',
        opacity: muted ? 0.75 : 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_DOT[order.status] || 'grey.400', flexShrink: 0 }} />
        <Box
          role="button"
          tabIndex={0}
          onClick={() => onEdit(order)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onEdit(order)}
          sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>#{order.id.slice(-6)}</Typography>
            <Typography variant="caption" color={`${STATUS_COLOR[order.status] || 'text.secondary'}.main`} fontWeight={600} noWrap>
              {getOrderStatusLabel(order.status)}
            </Typography>
            {order.customerName && !compact && (
              <Typography variant="caption" color="text.secondary" noWrap>· {order.customerName}</Typography>
            )}
          </Stack>
          {items && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{items}</Typography>}
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>{money(order.total, cur)}</Typography>
      </Stack>

      {actions.length > 0 && (
        <Stack direction="row" spacing={0.75} mt={0.75} sx={{ pl: 2, flexWrap: 'wrap', gap: 0.75 }}>
          {actions}
        </Stack>
      )}
    </Box>
  );
};

/* Compact action buttons per status (same transitions as before, optimistic). */
function statusActions(order, onUpdateStatus, onGenerateBill) {
  const btn = (key, label, color, variant, onClick, icon) => (
    <Button
      key={key}
      size="small"
      color={color}
      variant={variant}
      onClick={onClick}
      startIcon={icon ? <Icon icon={icon} width={15} /> : undefined}
      sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: 12 }}
    >
      {label}
    </Button>
  );
  const set = (s) => () => onUpdateStatus(order.id, s);
  const out = [];

  switch (order.status) {
    case 'pending':
      out.push(btn('accept', 'Accept', 'success', 'contained', set('accepted')));
      out.push(btn('reject', 'Reject', 'error', 'outlined', set('rejected')));
      out.push(btn('hold', 'Hold', 'warning', 'outlined', set('on-hold')));
      break;
    case 'accepted':
    case 'on-hold':
      out.push(btn('prep', 'Start Preparing', 'info', 'contained', set('preparing')));
      out.push(btn('reject', 'Reject', 'error', 'outlined', set('rejected')));
      break;
    case 'preparing':
      out.push(btn('prepared', 'Prepared', 'success', 'contained', set('prepared')));
      out.push(btn('ready', 'Ready', 'success', 'outlined', set('ready')));
      break;
    case 'prepared':
      out.push(btn('served', 'Served', 'success', 'contained', set('served')));
      out.push(btn('ready', 'Ready', 'success', 'outlined', set('ready')));
      break;
    case 'served':
      out.push(btn('complete', 'Complete', 'success', 'contained', set('completed')));
      if (!order.billId) out.push(btn('bill', 'Bill', 'primary', 'outlined', () => onGenerateBill(order), 'mdi:receipt-text-outline'));
      break;
    case 'ready':
      out.push(btn('served', 'Served', 'success', 'contained', set('served')));
      out.push(btn('complete', 'Complete', 'success', 'outlined', set('completed')));
      break;
    case 'completed':
      if (!order.billId) out.push(btn('bill', 'Bill', 'primary', 'outlined', () => onGenerateBill(order), 'mdi:receipt-text-outline'));
      break;
    default:
      break;
  }
  return out;
}

export default OrdersSection;
