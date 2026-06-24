import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { useCurrency } from '../contexts/CurrencyContext';
import { getOrderStatusLabel } from '../utils/statusLabels';
import { STATUS_COLOR, money } from '../utils/orderStatus';

/* Action buttons available for the order's current status (read-only modal footer). */
function statusActions(order, onUpdateStatus, onGenerateBill) {
  const btn = (key, label, color, variant, onClick, icon) => (
    <Button
      key={key}
      size="small"
      color={color}
      variant={variant}
      onClick={onClick}
      startIcon={icon ? <Icon icon={icon} width={16} /> : undefined}
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

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const MetaRow = ({ icon, children }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Icon icon={icon} width={16} style={{ color: 'rgba(0,0,0,0.45)', flexShrink: 0 }} />
    <Typography variant="body2" color="text.secondary">{children}</Typography>
  </Stack>
);

export const OrderDetailsModal = ({ order, open, onClose, onEdit, onUpdateStatus, onGenerateBill }) => {
  const cur = useCurrency();
  if (!order) return null;

  // Any status change (Accept, Prepare, …) closes the modal afterwards.
  const updateAndClose = (id, status) => { onUpdateStatus(id, status); onClose(); };
  const billAndClose = (o) => { onGenerateBill(o); onClose(); };
  const actions = statusActions(order, updateAndClose, billAndClose);
  const tableLabel = order.tableNumber != null && order.tableNumber !== '' ? `Table ${order.tableNumber}` : 'Takeaway';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={0.5}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              Order #{order.id.slice(-6)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tableLabel} · {order.customerName || 'Walk-in'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip size="small" color={STATUS_COLOR[order.status] || 'default'} label={getOrderStatusLabel(order.status)} />
            <IconButton size="small" onClick={onClose} aria-label="Close">
              <Icon icon="mdi:close" width={20} />
            </IconButton>
          </Stack>
        </Stack>

        <Stack spacing={0.5} sx={{ mt: 1.5 }}>
          {order.customerMobile && <MetaRow icon="mdi:phone-outline">{order.customerMobile}</MetaRow>}
          <MetaRow icon="mdi:clock-outline">Placed {fmtDateTime(order.createdAt)}</MetaRow>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Items */}
        <Typography variant="overline" color="text.secondary">Items</Typography>
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          {(order.items || []).map((it, i) => (
            <Stack key={it.menuItemId || i} direction="row" justifyContent="space-between" spacing={1}>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 700, mr: 0.75 }}>{it.quantity}×</Box>
                {it.name}
              </Typography>
              {it.price != null && (
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {money(it.price * it.quantity, cur)}
                </Typography>
              )}
            </Stack>
          ))}
          {(!order.items || order.items.length === 0) && (
            <Typography variant="body2" color="text.secondary">No items on this order.</Typography>
          )}
        </Stack>

        {order.notes && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>Notes</Typography>
            <Typography variant="body2">{order.notes}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
          <Typography variant="h6" fontWeight={800}>{money(order.total, cur)}</Typography>
        </Stack>

        {/* Footer actions */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
          {actions}
          <Box sx={{ flex: 1 }} />
          <Button
            size="small"
            variant="text"
            startIcon={<Icon icon="mdi:pencil" width={16} />}
            onClick={() => { onEdit(order); onClose(); }}
          >
            Edit order
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
